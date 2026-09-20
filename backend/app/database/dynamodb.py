import os
import logging
from typing import Dict, Any, List, Optional
from datetime import datetime, timedelta
import boto3
from botocore.exceptions import ClientError
from app.config import settings

logger = logging.getLogger("cognitrace.dynamodb")


class DynamoDBService:
    """
    AWS DynamoDB Database Service for CogniTrace.
    Stores User Profiles, Patient Data, RAG Vector Embeddings, and Care Logs.
    Partition Key (PK): Partition Identifier (e.g., USER#<id>, EMAIL#<email>)
    Sort Key (SK): Item Identifier (e.g., PROFILE, VEC#<vector_id>, EVENT#<timestamp>)
    """

    def __init__(self):
        self.table_name = settings.DYNAMODB_TABLE_NAME
        self.region = settings.AWS_REGION
        self.aws_access_key = settings.AWS_ACCESS_KEY_ID or os.getenv("AWS_ACCESS_KEY_ID")
        self.aws_secret_key = settings.AWS_SECRET_ACCESS_KEY or os.getenv("AWS_SECRET_ACCESS_KEY")
        self.resource = None
        self.table = None
        self.in_memory_fallback: Dict[str, Dict[str, Any]] = {}
        self._seeded_reminders_users = set()
        self._init_client()

    def _init_client(self):
        try:
            kwargs = {"region_name": self.region}
            if self.aws_access_key and self.aws_secret_key:
                kwargs["aws_access_key_id"] = self.aws_access_key
                kwargs["aws_secret_access_key"] = self.aws_secret_key

            self.resource = boto3.resource("dynamodb", **kwargs)
            self.table = self.resource.Table(self.table_name)
            logger.info(f"[DynamoDB] Connected to table '{self.table_name}' in region '{self.region}'.")
        except Exception as e:
            logger.warning(f"[DynamoDB] Client initialization error: {e}. Operating with local fallback.")
            self.resource = None
            self.table = None

    def ensure_table_exists(self) -> bool:
        """
        Verifies if DynamoDB table exists, or creates it automatically.
        """
        if not self.resource:
            return False

        try:
            self.table.load()
            return True
        except ClientError as e:
            if e.response["Error"]["Code"] == "ResourceNotFoundException":
                logger.info(f"[DynamoDB] Table '{self.table_name}' not found. Creating table...")
                try:
                    self.table = self.resource.create_table(
                        TableName=self.table_name,
                        KeySchema=[
                            {"AttributeName": "PK", "KeyType": "HASH"},
                            {"AttributeName": "SK", "KeyType": "RANGE"}
                        ],
                        AttributeDefinitions=[
                            {"AttributeName": "PK", "AttributeType": "S"},
                            {"AttributeName": "SK", "AttributeType": "S"}
                        ],
                        BillingMode="PAY_PER_REQUEST"
                    )
                    self.table.wait_until_exists()
                    logger.info(f"[DynamoDB] Table '{self.table_name}' created successfully.")
                    return True
                except Exception as create_err:
                    logger.error(f"[DynamoDB] Failed to create table: {create_err}")
                    return False
            else:
                logger.warning(f"[DynamoDB] Table check error: {e}")
                return False
        except Exception as e:
            logger.warning(f"[DynamoDB] General table check error: {e}")
            return False

    def save_user(self, user_data: Dict[str, Any]) -> bool:
        """
        Stores user profile and email index mapping in DynamoDB.
        """
        user_id = user_data.get("id")
        email = user_data.get("email", "").strip().lower()
        if not user_id or not email:
            return False

        item = {
            "PK": f"USER#{user_id}",
            "SK": "PROFILE",
            "id": user_id,
            "name": user_data.get("name", ""),
            "email": email,
            "password": user_data.get("password", ""),
            "role": user_data.get("role", "caregiver"),
            "patient_name": user_data.get("patient_name", "Mom"),
            "relationship": user_data.get("relationship", "Mother"),
            "stage": user_data.get("stage", "Middle Stage"),
            "updated_at": datetime.utcnow().isoformat()
        }

        email_mapping = {
            "PK": f"EMAIL#{email}",
            "SK": "INDEX",
            "user_id": user_id,
            "email": email
        }

        # Store in local fallback dictionary
        self.in_memory_fallback[f"USER#{user_id}"] = item
        self.in_memory_fallback[f"EMAIL#{email}"] = item

        if self.table:
            try:
                self.table.put_item(Item=item)
                self.table.put_item(Item=email_mapping)
                logger.info(f"[DynamoDB] Successfully saved user '{user_id}' ({email}) to DynamoDB.")
                return True
            except Exception as e:
                logger.warning(f"[DynamoDB] Failed to put item in DynamoDB: {e}. Saved in memory.")
                return False
        return True

    def get_user_by_email(self, email: str) -> Optional[Dict[str, Any]]:
        """
        Retrieves user record by email address.
        """
        email_clean = email.strip().lower()
        if self.table:
            try:
                resp = self.table.get_item(Key={"PK": f"EMAIL#{email_clean}", "SK": "INDEX"})
                if "Item" in resp:
                    user_id = resp["Item"].get("user_id")
                    if user_id:
                        return self.get_user_by_id(user_id)
            except Exception as e:
                logger.warning(f"[DynamoDB] Failed to fetch email index from DynamoDB: {e}")

        # Fallback search
        local = self.in_memory_fallback.get(f"EMAIL#{email_clean}")
        if local:
            return local
        return None

    def get_user_by_id(self, user_id: str) -> Optional[Dict[str, Any]]:
        """
        Retrieves user record by User ID.
        """
        if self.table:
            try:
                resp = self.table.get_item(Key={"PK": f"USER#{user_id}", "SK": "PROFILE"})
                if "Item" in resp:
                    return resp["Item"]
            except Exception as e:
                logger.warning(f"[DynamoDB] Failed to fetch user profile from DynamoDB: {e}")

        return self.in_memory_fallback.get(f"USER#{user_id}")

    def save_rag_vector(self, user_id: str, vector_id: str, text_chunk: str, embedding: List[float], metadata: Optional[Dict[str, Any]] = None) -> bool:
        """
        Stores user text chunk, RAG vector embeddings, and metadata for vector search & RAG research.
        """
        item = {
            "PK": f"USER#{user_id}",
            "SK": f"VEC#{vector_id}",
            "user_id": user_id,
            "vector_id": vector_id,
            "text_chunk": text_chunk,
            "embedding": [str(val) for val in embedding],  # DynamoDB handles Decimal/String arrays
            "metadata": metadata or {},
            "created_at": datetime.utcnow().isoformat()
        }

        self.in_memory_fallback[f"VEC#{user_id}#{vector_id}"] = item

        if self.table:
            try:
                self.table.put_item(Item=item)
                logger.info(f"[DynamoDB] Stored RAG vector chunk '{vector_id}' for user '{user_id}'.")
                return True
            except Exception as e:
                logger.warning(f"[DynamoDB] Error saving RAG vector to DynamoDB: {e}")
                return False
        return True

    def get_user_rag_vectors(self, user_id: str) -> List[Dict[str, Any]]:
        """
        Fetches all vector embedding items stored for RAG research for a user.
        """
        if self.table:
            try:
                resp = self.table.query(
                    KeyConditionExpression="PK = :pk AND begins_with(SK, :sk_prefix)",
                    ExpressionAttributeValues={
                        ":pk": f"USER#{user_id}",
                        ":sk_prefix": "VEC#"
                    }
                )
                return resp.get("Items", [])
            except Exception as e:
                logger.warning(f"[DynamoDB] Error querying RAG vectors: {e}")

        return [val for key, val in self.in_memory_fallback.items() if key.startswith(f"VEC#{user_id}")]

    # ------------------------------------------------------------------
    # Reminders CRUD
    # ------------------------------------------------------------------
    def save_reminder(self, user_id: str, reminder_data: Dict[str, Any]) -> Dict[str, Any]:
        rem_id = reminder_data.get("id") or f"rem_{int(datetime.utcnow().timestamp() * 1000)}"
        item = {
            "PK": f"USER#{user_id}",
            "SK": f"REMINDER#{rem_id}",
            "id": rem_id,
            "title": reminder_data.get("title", "Care Task"),
            "time": reminder_data.get("time", "8:00 PM"),
            "date": reminder_data.get("date", "Today"),
            "category": reminder_data.get("category", "General"),
            "status": reminder_data.get("status", "Upcoming"),
            "patientName": reminder_data.get("patientName", "Mom"),
            "dosageOrDetails": reminder_data.get("dosageOrDetails", ""),
            "recurring": reminder_data.get("recurring", "Daily"),
            "created_at": reminder_data.get("createdAt") or datetime.utcnow().isoformat()
        }
        self.in_memory_fallback[f"REM#{user_id}#{rem_id}"] = item

        if self.table:
            try:
                self.table.put_item(Item=item)
                logger.info(f"[DynamoDB] Saved reminder '{rem_id}' ({item['title']}) for user '{user_id}'.")
            except Exception as e:
                logger.warning(f"[DynamoDB] Error putting reminder: {e}")

        return item

    def get_reminders(self, user_id: str) -> List[Dict[str, Any]]:
        if self.table:
            try:
                resp = self.table.query(
                    KeyConditionExpression="PK = :pk AND begins_with(SK, :sk_prefix)",
                    ExpressionAttributeValues={
                        ":pk": f"USER#{user_id}",
                        ":sk_prefix": "REMINDER#"
                    }
                )
                if resp.get("Items"):
                    return resp["Items"]
            except Exception as e:
                logger.warning(f"[DynamoDB] Error querying reminders: {e}")

        if user_id not in self._seeded_reminders_users:
            self._seeded_reminders_users.add(user_id)
            for rem in self._get_default_seed_reminders():
                rem_key = f"REM#{user_id}#{rem['id']}"
                if rem_key not in self.in_memory_fallback:
                    self.in_memory_fallback[rem_key] = rem

        items = [val for key, val in self.in_memory_fallback.items() if key.startswith(f"REM#{user_id}")]
        return items

    def toggle_reminder(self, user_id: str, rem_id: str) -> Optional[Dict[str, Any]]:
        reminders = self.get_reminders(user_id)
        target = next((r for r in reminders if r.get("id") == rem_id), None)
        if target:
            target["status"] = "Completed" if target.get("status") != "Completed" else "Upcoming"
            self.save_reminder(user_id, target)
            return target
        return None

    def delete_reminder(self, user_id: str, rem_id: str) -> bool:
        rem_key = f"REM#{user_id}#{rem_id}"
        self.in_memory_fallback.pop(rem_key, None)
        self._seeded_reminders_users.add(user_id)
        if self.table:
            try:
                self.table.delete_item(Key={"PK": f"USER#{user_id}", "SK": f"REMINDER#{rem_id}"})
                return True
            except Exception as e:
                logger.warning(f"[DynamoDB] Delete reminder error: {e}")
        return True

    def _get_default_seed_reminders(self) -> List[Dict[str, Any]]:
        return [
          {
            "id": "rem_1",
            "title": "Evening Medicine (Donepezil 5mg)",
            "time": "8:00 PM",
            "date": "Today",
            "category": "Medication",
            "status": "Upcoming",
            "patientName": "Mom",
            "dosageOrDetails": "Take 1 tablet with water after dinner",
            "recurring": "Daily"
          },
          {
            "id": "rem_2",
            "title": "Afternoon Mindful Walk in Park",
            "time": "4:30 PM",
            "date": "Today",
            "category": "Activity",
            "status": "Completed",
            "patientName": "Mom",
            "dosageOrDetails": "Light 15 min walk with caregiver",
            "recurring": "Daily"
          },
          {
            "id": "rem_3",
            "title": "Hydration Water Break",
            "time": "2:00 PM",
            "date": "Today",
            "category": "Hydration",
            "status": "Upcoming",
            "patientName": "Mom",
            "dosageOrDetails": "1 glass warm water",
            "recurring": "Every 2 Hours"
          }
        ]

    # ------------------------------------------------------------------
    # Appointments CRUD
    # ------------------------------------------------------------------
    def save_appointment(self, user_id: str, apt_data: Dict[str, Any]) -> Dict[str, Any]:
        apt_id = apt_data.get("id") or f"apt_{int(datetime.utcnow().timestamp() * 1000)}"
        item = {
            "PK": f"USER#{user_id}",
            "SK": f"APPOINTMENT#{apt_id}",
            "id": apt_id,
            "title": apt_data.get("title", "Doctor Consultation"),
            "doctorName": apt_data.get("doctorName", "Dr. Anita Sharma"),
            "specialty": apt_data.get("specialty", "Cognitive Neurology"),
            "date": apt_data.get("date", "Tomorrow"),
            "time": apt_data.get("time", "10:30 AM"),
            "location": apt_data.get("location", "City Care Hospital, Suite 402"),
            "notes": apt_data.get("notes", "Bring prescriptions and observation log"),
            "status": apt_data.get("status", "Upcoming")
        }
        self.in_memory_fallback[f"APT#{user_id}#{apt_id}"] = item

        if self.table:
            try:
                self.table.put_item(Item=item)
            except Exception as e:
                logger.warning(f"[DynamoDB] Error putting appointment: {e}")

        return item

    def get_appointments(self, user_id: str) -> List[Dict[str, Any]]:
        if self.table:
            try:
                resp = self.table.query(
                    KeyConditionExpression="PK = :pk AND begins_with(SK, :sk_prefix)",
                    ExpressionAttributeValues={
                        ":pk": f"USER#{user_id}",
                        ":sk_prefix": "APPOINTMENT#"
                    }
                )
                if resp.get("Items"):
                    return resp["Items"]
            except Exception as e:
                logger.warning(f"[DynamoDB] Error querying appointments: {e}")

        items = [val for key, val in self.in_memory_fallback.items() if key.startswith(f"APT#{user_id}")]
        return items if items else [
            {
                "id": "apt_101",
                "title": "Dr. Anita Sharma Consultation",
                "doctorName": "Dr. Anita Sharma",
                "specialty": "Cognitive Neurology",
                "date": "Tomorrow",
                "time": "10:30 AM",
                "location": "City Care Hospital, Suite 402",
                "notes": "Bring recent observation log & current prescriptions",
                "status": "Upcoming"
            }
        ]

    # ------------------------------------------------------------------
    # Memories CRUD
    # ------------------------------------------------------------------
    def save_memory(self, user_id: str, memory_data: Dict[str, Any]) -> Dict[str, Any]:
        mem_id = memory_data.get("id") or f"mem_{int(datetime.utcnow().timestamp() * 1000)}"
        item = {
            "PK": f"USER#{user_id}",
            "SK": f"MEMORY#{mem_id}",
            "id": mem_id,
            "title": memory_data.get("title", "Family Memory"),
            "date": memory_data.get("date", "Summer 1987"),
            "location": memory_data.get("location", "Goa Beach"),
            "imageUrl": memory_data.get("imageUrl", "https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=800&q=80"),
            "description": memory_data.get("description", "Family vacation watching the ocean sunset."),
            "people": memory_data.get("people", ["Mom", "Caregiver"]),
            "tags": memory_data.get("tags", ["Vacation", "Goa"]),
            "reminiscencePrompt": memory_data.get("reminiscencePrompt", "Mom, do you remember watching the ocean waves in Goa?")
        }
        self.in_memory_fallback[f"MEM#{user_id}#{mem_id}"] = item

        if self.table:
            try:
                self.table.put_item(Item=item)
            except Exception as e:
                logger.warning(f"[DynamoDB] Error putting memory: {e}")

        return item

    def get_memories(self, user_id: str) -> List[Dict[str, Any]]:
        if self.table:
            try:
                resp = self.table.query(
                    KeyConditionExpression="PK = :pk AND begins_with(SK, :sk_prefix)",
                    ExpressionAttributeValues={
                        ":pk": f"USER#{user_id}",
                        ":sk_prefix": "MEMORY#"
                    }
                )
                if resp.get("Items"):
                    return resp["Items"]
            except Exception as e:
                logger.warning(f"[DynamoDB] Error querying memories: {e}")

        if not hasattr(self, '_seeded_memories_users'):
            self._seeded_memories_users = set()

        if user_id not in self._seeded_memories_users:
            self._seeded_memories_users.add(user_id)
            for mem in self._get_default_seed_memories():
                mem_key = f"MEM#{user_id}#{mem['id']}"
                if mem_key not in self.in_memory_fallback:
                    self.in_memory_fallback[mem_key] = mem

        items = [val for key, val in self.in_memory_fallback.items() if key.startswith(f"MEM#{user_id}")]
        return items

    def delete_memory(self, user_id: str, mem_id: str) -> bool:
        mem_key = f"MEM#{user_id}#{mem_id}"
        self.in_memory_fallback.pop(mem_key, None)
        if not hasattr(self, '_seeded_memories_users'):
            self._seeded_memories_users = set()
        self._seeded_memories_users.add(user_id)
        if self.table:
            try:
                self.table.delete_item(Key={"PK": f"USER#{user_id}", "SK": f"MEMORY#{mem_id}"})
                return True
            except Exception as e:
                logger.warning(f"[DynamoDB] Delete memory error: {e}")
        return True

    def _get_default_seed_memories(self) -> List[Dict[str, Any]]:
        return [
            {
                "id": "mem_1",
                "title": "Family Vacation in Goa",
                "date": "Summer 1987",
                "location": "Calangute Beach, Goa",
                "imageUrl": "https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=800&q=80",
                "description": "Our first family beach vacation together. Mom loved watching the sunset over the sea and walking along the shoreline with ice cream.",
                "people": ["Mom (Sunita)", "Dad (Ramesh)", "Rahul", "Priya"],
                "tags": ["Vacation", "Beach", "Family", "1980s"],
                "reminiscencePrompt": "Mom, do you remember our beach trip to Goa in 1987? You loved the sound of the ocean waves at sunset."
            },
            {
                "id": "mem_2",
                "title": "Spring Garden & Rose Blossoms",
                "date": "March 2015",
                "location": "Home Garden, New Delhi",
                "imageUrl": "https://images.unsplash.com/photo-1585320806297-9794b3e4eeae?auto=format&fit=crop&w=800&q=80",
                "description": "Mom spent the entire morning planting yellow and red roses in her backyard garden. The blossoms bloomed beautifully for months.",
                "people": ["Mom (Sunita)", "Priya"],
                "tags": ["Gardening", "Flowers", "Home", "Spring"],
                "reminiscencePrompt": "Mom, remember how vibrant yellow roses bloomed in your home garden? You always cared for them every morning."
            },
            {
                "id": "mem_3",
                "title": "Granddaughter Graduation Day",
                "date": "June 2021",
                "location": "University Auditorium",
                "imageUrl": "https://images.unsplash.com/photo-1523240795612-9a054b0db644?auto=format&fit=crop&w=800&q=80",
                "description": "Mom smiled so brightly when Ananya walked across the stage to receive her engineering degree.",
                "people": ["Mom (Sunita)", "Ananya", "Rahul"],
                "tags": ["Graduation", "Pride", "Celebration"],
                "reminiscencePrompt": "Mom, look at Ananya in her graduation gown! You were so proud of her achievements."
            },
            {
                "id": "mem_4",
                "title": "Traditional Festival Sweets Preparation",
                "date": "Diwali 2019",
                "location": "Family Kitchen",
                "imageUrl": "https://images.unsplash.com/photo-1601050690597-df0568f70950?auto=format&fit=crop&w=800&q=80",
                "description": "Mom guiding everyone in making home-style kaju katli and besan ladoos. The aroma of cardamom filled the whole house.",
                "people": ["Mom (Sunita)", "Dad", "Priya", "Ananya"],
                "tags": ["Diwali", "Festival", "Cooking", "Traditions"],
                "reminiscencePrompt": "Mom, do you recall making cardamom sweets for Diwali? The kitchen smelled so delicious!"
            }
        ]

    # ------------------------------------------------------------------
    # Voice Chat Memory Logs CRUD
    # ------------------------------------------------------------------
    def save_voice_chat(self, user_id: str = "patient_001", chat_data: Dict[str, Any] = None, patient_id: Optional[str] = None) -> Dict[str, Any]:
        user_id = patient_id or user_id or "patient_001"
        chat_data = chat_data or {}
        ts_ms = int(datetime.utcnow().timestamp() * 1000)
        chat_id = chat_data.get("id") or f"chat_{ts_ms}"
        iso_now = datetime.utcnow().isoformat()

        from decimal import Decimal
        raw_score = chat_data.get("risk_score") or chat_data.get("riskScore", 0.2)

        item = {
            "PK": f"USER#{user_id}",
            "SK": f"CHAT#{ts_ms}",
            "id": chat_id,
            "patient_id": user_id,
            "transcript": chat_data.get("transcript", ""),
            "ai_response": chat_data.get("ai_response") or chat_data.get("aiResponse", ""),
            "risk_tier": chat_data.get("risk_tier") or chat_data.get("riskTier", "NORMAL"),
            "risk_score": Decimal(str(raw_score)),
            "acoustic_features": chat_data.get("acoustic_features") or chat_data.get("acousticFeatures", {}),
            "linguistic_features": chat_data.get("linguistic_features") or chat_data.get("linguisticFeatures", {}),
            "timestamp": chat_data.get("timestamp") or iso_now,
            "created_at": iso_now
        }

        self.in_memory_fallback[f"CHAT#{user_id}#{chat_id}"] = item

        if self.table:
            try:
                self.table.put_item(Item=item)
                logger.info(f"[DynamoDB] Saved voice chat log '{chat_id}' for user '{user_id}'.")
            except Exception as e:
                logger.warning(f"[DynamoDB] Error saving voice chat: {e}")

        # Also store as RAG vector chunk for memory reference retrieval
        try:
            self.save_rag_vector(
                user_id=user_id,
                vector_id=f"vec_chat_{ts_ms}",
                text_chunk=f"Voice Chat Turn: Patient said '{item['transcript']}'. Voice companion responded '{item['ai_response']}'. Risk tier: {item['risk_tier']}.",
                embedding=[0.1, 0.2, 0.3, 0.4, 0.5, 0.6, 0.7, 0.8],
                metadata={"category": "Voice Chat Memory", "risk_tier": item['risk_tier'], "timestamp": iso_now}
            )
        except Exception as ve:
            logger.warning(f"[DynamoDB] Error saving chat RAG vector: {ve}")

        return item

    def get_voice_chats(self, user_id: str, limit: int = 20) -> List[Dict[str, Any]]:
        if self.table:
            try:
                resp = self.table.query(
                    KeyConditionExpression="PK = :pk AND begins_with(SK, :sk_prefix)",
                    ExpressionAttributeValues={
                        ":pk": f"USER#{user_id}",
                        ":sk_prefix": "CHAT#"
                    },
                    ScanIndexForward=False,
                    Limit=limit
                )
                if resp.get("Items"):
                    return resp["Items"]
            except Exception as e:
                logger.warning(f"[DynamoDB] Error querying voice chats: {e}")

        if not hasattr(self, '_seeded_chats_users'):
            self._seeded_chats_users = set()

        if user_id not in self._seeded_chats_users:
            self._seeded_chats_users.add(user_id)
            for chat in self._get_default_seed_voice_chats():
                chat_key = f"CHAT#{user_id}#{chat['id']}"
                if chat_key not in self.in_memory_fallback:
                    self.in_memory_fallback[chat_key] = chat

        items = [val for key, val in self.in_memory_fallback.items() if key.startswith(f"CHAT#{user_id}")]
        items.sort(key=lambda x: x.get("created_at") or x.get("timestamp") or "", reverse=True)
        return items[:limit]

    def _get_default_seed_voice_chats(self) -> List[Dict[str, Any]]:
        now = datetime.utcnow()
        return [
            {
                "id": "chat_seed_1",
                "patient_id": "patient_001",
                "transcript": "I love going to Calangute Beach in Goa during summer. The ocean waves are so calm.",
                "ai_response": "Goa is such a wonderful memory, Sunita! Do you remember who walked along the beach with you?",
                "risk_tier": "NORMAL",
                "risk_score": 0.18,
                "acoustic_features": {"speech_ratio": 0.78, "mean_pause_duration_ms": 220.0},
                "linguistic_features": {"type_token_ratio": 0.65, "sentiment": "positive"},
                "timestamp": (now - timedelta(hours=24)).isoformat(),
                "created_at": (now - timedelta(hours=24)).isoformat()
            },
            {
                "id": "chat_seed_2",
                "patient_id": "patient_001",
                "transcript": "I took my afternoon walk in the garden today with Priya. The yellow roses were blooming.",
                "ai_response": "That sounds lovely! Priya mentioned how much you enjoy tending to the yellow roses.",
                "risk_tier": "NORMAL",
                "risk_score": 0.22,
                "acoustic_features": {"speech_ratio": 0.75, "mean_pause_duration_ms": 250.0},
                "linguistic_features": {"type_token_ratio": 0.60, "sentiment": "positive"},
                "timestamp": (now - timedelta(hours=12)).isoformat(),
                "created_at": (now - timedelta(hours=12)).isoformat()
            }
        ]


    def seed_dummy_rag_vectors(self):
        """
        Seeds initial dummy RAG vector embedding records into DynamoDB / fallback store for RAG research.
        """
        seed_items = [
            {
                "user_id": "patient_001",
                "vector_id": "vec_mem_001",
                "text_chunk": "Goa Family Vacation Memory (Summer 1987): Mom watching the sunset by the ocean waves with family. Reminiscence prompt: Mom, do you remember watching the sunset by the ocean in Goa?",
                "embedding": [0.12, 0.45, 0.88, 0.33, 0.67, 0.91, 0.24, 0.15],
                "metadata": {"category": "Memory", "topic": "Goa Beach 1987", "people": ["Mom", "Caregiver"]}
            },
            {
                "user_id": "patient_001",
                "vector_id": "vec_med_002",
                "text_chunk": "Medication Dosage Schedule: Take Donepezil 5mg tablet with water after dinner every evening at 8:00 PM.",
                "embedding": [0.85, 0.11, 0.22, 0.94, 0.05, 0.31, 0.76, 0.42],
                "metadata": {"category": "Medication", "title": "Evening Medicine", "time": "8:00 PM"}
            },
            {
                "user_id": "patient_001",
                "vector_id": "vec_apt_003",
                "text_chunk": "Doctor Appointment: Consultation with Dr. Anita Sharma (Cognitive Neurology) tomorrow at 10:30 AM at City Care Hospital, Suite 402.",
                "embedding": [0.33, 0.77, 0.54, 0.18, 0.92, 0.61, 0.29, 0.84],
                "metadata": {"category": "Appointment", "doctor": "Dr. Anita Sharma", "specialty": "Neurology"}
            },
            {
                "user_id": "patient_001",
                "vector_id": "vec_bio_004",
                "text_chunk": "Acoustic & Linguistic Biomarkers: Speech ratio 72%, mean pause duration 380ms, type-token ratio 0.58. Cognitive drift is stable.",
                "embedding": [0.44, 0.66, 0.19, 0.82, 0.37, 0.55, 0.71, 0.28],
                "metadata": {"category": "Clinical", "risk_tier": "MCI", "composite_score": 0.34}
            },
            {
                "user_id": "usr_demo_001",
                "vector_id": "vec_demo_005",
                "text_chunk": "Caregiver Priya Sharma observation log: Mom enjoyed the Goa photo reminiscence session. Evening Donepezil medication confirmed.",
                "embedding": [0.55, 0.22, 0.77, 0.44, 0.99, 0.11, 0.33, 0.88],
                "metadata": {"category": "Caregiver Log", "caregiver": "Priya"}
            }
        ]

        for item in seed_items:
            self.save_rag_vector(
                user_id=item["user_id"],
                vector_id=item["vector_id"],
                text_chunk=item["text_chunk"],
                embedding=item["embedding"],
                metadata=item["metadata"]
            )
        logger.info(f"[DynamoDB] Seeded {len(seed_items)} dummy RAG vector chunks into vector database.")

    def search_rag_vectors(self, user_id: str, query: str, top_k: int = 3) -> List[Dict[str, Any]]:
        """
        Performs vector context retrieval matching the query text against stored RAG vector chunks.
        """
        vectors = self.get_user_rag_vectors(user_id)
        if not vectors:
            vectors = [val for key, val in self.in_memory_fallback.items() if key.startswith("VEC#")]

        query_terms = query.lower().split()
        scored_results = []

        for vec in vectors:
            text = vec.get("text_chunk", "").lower()
            score = sum(1.0 for term in query_terms if term in text)
            if score > 0 or len(vectors) <= 3:
                scored_results.append((score, vec))

        scored_results.sort(key=lambda x: x[0], reverse=True)
        return [item[1] for item in scored_results[:top_k]]

    def seed_initial_users(self):
        """
        Seeds initial caregiver and patient user profiles into DynamoDB and fallback store.
        """
        seed_users = [
            {
                "id": "usr_demo_001",
                "name": "Priya Sharma",
                "email": "priya.caregiver@example.com",
                "password": "password",
                "role": "caregiver",
                "patient_name": "Sunita (Mom)",
                "relationship": "Mother",
                "stage": "Middle Stage"
            },
            {
                "id": "usr_patient_001",
                "name": "Sunita Sharma",
                "email": "sunita.patient@example.com",
                "password": "1234",
                "role": "patient",
                "patient_name": "Sunita",
                "relationship": "Self",
                "stage": "Middle Stage"
            },
            {
                "id": "patient_001",
                "name": "Sunita Sharma (Mom)",
                "email": "patient_001@cognitrace.health",
                "password": "pin_1234_patient",
                "role": "patient",
                "patient_name": "Sunita",
                "relationship": "Self",
                "stage": "Middle Stage"
            }
        ]

        for u in seed_users:
            self.save_user(u)
        logger.info(f"[DynamoDB] Seeded {len(seed_users)} user profiles into DynamoDB database.")

    def check_health(self) -> bool:
        """
        Health probe for DynamoDB connectivity.
        """
        if not self.table:
            return False
        try:
            self.table.load()
            return True
        except Exception:
            return False


dynamodb_service = DynamoDBService()
dynamodb_service.seed_initial_users()
dynamodb_service.seed_dummy_rag_vectors()


