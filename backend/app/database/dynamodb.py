import os
import logging
from typing import Dict, Any, List, Optional
from datetime import datetime
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


