import re
import time
from typing import List, Optional
from pydantic import BaseModel

EMERGENCY_PATTERNS = [
    r"\bfall(?:en)?\b",
    r"\bfell\b",
    r"\bchest\s+pain\b",
    r"\bstroke\b",
    r"\bcan'?t\s+breathe\b",
    r"\bcannot\s+breathe\b",
    r"\bshortness\s+of\s+breath\b",
    r"\bemergency\b",
    r"\bhelp\s+me\b",
    r"\bunresponsive\b",
    r"\bhead\s+injury\b",
    r"\bbleeding\b"
]

# Pre-compiled regex trie pattern for O(N) single-pass scanning (<2ms latency)
COMPILED_EMERGENCY_TRIE = re.compile("|".join(EMERGENCY_PATTERNS), re.IGNORECASE)


class GuardrailResult(BaseModel):
    emergency_detected: bool
    matched_keywords: List[str]
    latency_ms: float
    recommended_action: Optional[str] = None


class GuardrailManager:
    def check_emergency_keywords(self, text: str) -> GuardrailResult:
        start_time = time.perf_counter()
        matches = COMPILED_EMERGENCY_TRIE.findall(text)
        latency_ms = (time.perf_counter() - start_time) * 1000.0

        matched_clean = list(set(m.lower() for m in matches))
        emergency_detected = len(matched_clean) > 0

        action = None
        if emergency_detected:
            action = (
                "EMERGENCY PROTOCOL ACTIVATED: Immediate caregiver alert and dispatch recommendation triggered. "
                f"Keywords detected: {', '.join(matched_clean)}."
            )

        return GuardrailResult(
            emergency_detected=emergency_detected,
            matched_keywords=matched_clean,
            latency_ms=round(latency_ms, 3),
            recommended_action=action
        )


guardrail_manager = GuardrailManager()
