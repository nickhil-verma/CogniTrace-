import os
import math
import logging
from datetime import datetime
from typing import List, Dict, Any, Optional
import httpx

from app.config import settings
from app.database.dynamodb import dynamodb_service

logger = logging.getLogger("cognitrace.vector_store")

GEMINI_API_KEY = os.getenv("GEMINI_API_KEY") or getattr(settings, "GEMINI_API_KEY", "")


def compute_text_embedding(text: str) -> List[float]:
    """
    Computes 768-dimensional vector embedding for text content.
    Uses Google GenAI API (text-embedding-004) if GEMINI_API_KEY is configured,
    or a normalized deterministic feature hash embedding engine if offline.
    """
    if GEMINI_API_KEY and GEMINI_API_KEY != "AQ.Ab8RN6LqjBmwVMdowBJZ6_kVfXs29firXQKFCsCuLMzeGiHJFQ_invalid":
        url = f"https://generativelanguage.googleapis.com/v1beta/models/text-embedding-004:embedContent?key={GEMINI_API_KEY}"
        payload = {
            "model": "models/text-embedding-004",
            "content": {"parts": [{"text": text[:2000]}]}
        }
        try:
            with httpx.Client(timeout=8.0) as client:
                res = client.post(url, json=payload)
                if res.status_code == 200:
                    data = res.json()
                    embedding_values = data.get("embedding", {}).get("values", [])
                    if embedding_values:
                        return embedding_values
        except Exception as e:
            logger.warning(f"[VectorStore] Gemini text-embedding-004 API call failed: {e}. Using deterministic vector encoder.")

    # Deterministic 768-dimensional L2-normalized vector embedding generator
    dim = 768
    vector = [0.0] * dim
    words = text.lower().split()
    for idx, word in enumerate(words):
        for char_idx, char in enumerate(word):
            pos = (ord(char) * 31 + idx * 17 + char_idx * 7) % dim
            vector[pos] += 1.0

    # L2 normalize
    norm = math.sqrt(sum(v * v for v in vector)) or 1.0
    return [round(v / norm, 6) for v in vector]


def cosine_similarity(v1: List[float], v2: List[float]) -> float:
    if not v1 or not v2:
        return 0.0
    dot = sum(a * b for a, b in zip(v1, v2))
    norm1 = math.sqrt(sum(a * a for a in v1)) or 1.0
    norm2 = math.sqrt(sum(b * b for b in v2)) or 1.0
    return dot / (norm1 * norm2)


class VectorStore:
    """
    Vector-Grounded Memory Engine for Caregiver Ingestion and Clinical Voice Reminiscence.
    """

    def __init__(self):
        self.db = dynamodb_service

    def add_memory(self, patient_id: str, memory_data: Dict[str, Any]) -> Dict[str, Any]:
        """
        Computes text embeddings for a life story and stores the record with photo URL & vector metadata.
        """
        mem_id = memory_data.get("id") or f"mem_{int(datetime.utcnow().timestamp() * 1000)}"
        title = memory_data.get("title", "Family Memory")
        narrative = memory_data.get("narrative") or memory_data.get("description", "")
        location = memory_data.get("location", "Home")
        people = memory_data.get("people") or ["Family"]
        tags = memory_data.get("tags") or ["Memory"]
        relationship_cues = memory_data.get("relationship_cues") or ["Caregiver"]
        photo_url = memory_data.get("photo_url") or memory_data.get("imageUrl", "https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=800&q=80")
        date_str = memory_data.get("date", "Recent")

        reminiscence_prompt = memory_data.get("reminiscence_prompt") or memory_data.get("reminiscencePrompt") or f"Do you remember this special moment from '{title}'?"

        # Combine text fields for vector embedding
        full_text_corpus = f"Title: {title}. Story: {narrative}. Location: {location}. People: {', '.join(people)}. Tags: {', '.join(tags)}. Relationship: {', '.join(relationship_cues)}."
        embedding = compute_text_embedding(full_text_corpus)

        record = {
            "id": mem_id,
            "patient_id": patient_id,
            "title": title,
            "narrative": narrative,
            "description": narrative,
            "photo_url": photo_url,
            "imageUrl": photo_url,
            "date": date_str,
            "location": location,
            "people": people,
            "relationship_cues": relationship_cues,
            "tags": tags,
            "reminiscence_prompt": reminiscence_prompt,
            "reminiscencePrompt": reminiscence_prompt,
            "created_at": datetime.utcnow().isoformat()
        }

        # Save record in DynamoDB / store
        self.db.save_memory(patient_id, record)

        # Store RAG vector chunk with embedding
        vector_id = f"vec_{mem_id}"
        self.db.save_rag_vector(
            user_id=patient_id,
            vector_id=vector_id,
            text_chunk=full_text_corpus,
            embedding=embedding,
            metadata={
                "category": "Life Story Memory",
                "title": title,
                "photo_url": photo_url,
                "reminiscence_prompt": reminiscence_prompt,
                "memory_id": mem_id
            }
        )

        logger.info(f"[VectorStore] Successfully ingested memory '{title}' ({mem_id}) with {len(embedding)}-dim embedding.")
        return record

    def search_memories(self, patient_id: str, query: str, top_k: int = 3) -> List[Dict[str, Any]]:
        """
        Performs semantic vector search over patient photo memories & life stories.
        """
        memories = self.db.get_memories(patient_id)
        if not memories:
            return []

        query_embedding = compute_text_embedding(query)
        scored_memories = []

        for mem in memories:
            text_corpus = f"Title: {mem.get('title')} Story: {mem.get('narrative') or mem.get('description')} People: {','.join(mem.get('people', []))} Tags: {','.join(mem.get('tags', []))}"
            mem_emb = compute_text_embedding(text_corpus)
            score = cosine_similarity(query_embedding, mem_emb)
            scored_memories.append((score, mem))

        scored_memories.sort(key=lambda x: x[0], reverse=True)
        return [item[1] for item in scored_memories[:top_k]]


vector_store = VectorStore()
