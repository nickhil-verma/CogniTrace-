import uuid
from fastapi import APIRouter, HTTPException, Header
from typing import Optional, Dict
from app.models.schemas import LoginRequest, SignupRequest, AuthResponse, UserProfile

from app.database.dynamodb import dynamodb_service


def _parse_token(authorization: Optional[str]) -> str:
    if not authorization:
        raise HTTPException(status_code=401, detail="Missing authorization header")

    token = authorization.replace("Bearer ", "").strip()
    if not token or not token.startswith("cognitrace_jwt_"):
        raise HTTPException(status_code=401, detail="Invalid authorization token")
    return token


def _resolve_user_profile(user_id: str) -> UserProfile:
    user_data = dynamodb_service.get_user_by_id(user_id)
    if not user_data:
        raise HTTPException(status_code=401, detail="Invalid or expired session")
    return UserProfile(
        id=user_data["id"],
        name=user_data["name"],
        email=user_data["email"],
        role=user_data.get("role", "caregiver"),
        patient_name=user_data.get("patient_name", "Mom"),
        relationship=user_data.get("relationship", "Mother"),
        stage=user_data.get("stage", "Middle Stage")
    )


async def get_authenticated_user_from_header(authorization: Optional[str] = Header(None)) -> UserProfile:
    token = _parse_token(authorization)
    user_id = token.replace("cognitrace_jwt_", "")
    return _resolve_user_profile(user_id)

router = APIRouter(prefix="/v1/auth", tags=["Authentication"])

# In-Memory Seed Users
DEMO_USERS: Dict[str, Dict] = {
    "priya.caregiver@example.com": {
        "id": "usr_demo_001",
        "name": "Priya Sharma",
        "email": "priya.caregiver@example.com",
        "password": "password",
        "role": "caregiver",
        "patient_name": "Mom (Sunita)",
        "relationship": "Mother",
        "stage": "Middle Stage"
    },
    "sunita.patient@example.com": {
        "id": "usr_patient_001",
        "name": "Sunita Sharma",
        "email": "sunita.patient@example.com",
        "password": "1234",
        "role": "patient",
        "patient_name": "Sunita (Mom)",
        "relationship": "Self",
        "stage": "Middle Stage"
    }
}

# Seed initial users to DynamoDB on module load
for seed_user in DEMO_USERS.values():
    dynamodb_service.save_user(seed_user)


@router.post("/login", response_model=AuthResponse)
async def login(payload: LoginRequest):
    """
    Authenticates caregiver or patient credentials and returns session token, fetching/saving to DynamoDB.
    """
    email_clean = payload.email.strip().lower()
    role_requested = payload.role or "caregiver"

    user_data = dynamodb_service.get_user_by_email(email_clean)
    password_matches = bool(user_data) and str(user_data.get("password", "")) == str(payload.password)

    if not user_data or not password_matches:
        raise HTTPException(status_code=401, detail="Invalid email or password")

    user_profile = UserProfile(
        id=user_data["id"],
        name=user_data["name"],
        email=user_data["email"],
        role=user_data.get("role", role_requested),
        patient_name=user_data.get("patient_name", "Mom"),
        relationship=user_data.get("relationship", "Mother"),
        stage=user_data.get("stage", "Middle Stage")
    )

    token = f"cognitrace_jwt_{user_data['id']}"

    return AuthResponse(
        access_token=token,
        token_type="bearer",
        user=user_profile
    )


@router.post("/patient-login", response_model=AuthResponse)
async def patient_login(payload: Optional[dict] = None):
    """
    Dedicated quick-access patient portal login (1-tap or PIN auth).
    """
    request_payload = payload or {}
    email = str(request_payload.get("email") or "sunita.patient@example.com").strip().lower()
    password = str(request_payload.get("password") or "1234")

    patient_user = dynamodb_service.get_user_by_email(email)
    if not patient_user or str(patient_user.get("password", "")) != password:
        raise HTTPException(status_code=401, detail="Invalid email or password")

    user_profile = UserProfile(
        id=patient_user["id"],
        name=patient_user["name"],
        email=patient_user["email"],
        role="patient",
        patient_name="Sunita (Mom)",
        relationship="Self",
        stage="Middle Stage"
    )
    token = f"cognitrace_jwt_{patient_user['id']}"

    return AuthResponse(
        access_token=token,
        token_type="bearer",
        user=user_profile
    )


@router.post("/signup", response_model=AuthResponse)
@router.post("/register", response_model=AuthResponse)
async def signup(payload: SignupRequest):
    """
    Registers a new caregiver account and persists user profile to DynamoDB.
    """
    email_clean = payload.email.strip().lower()
    user_data = dynamodb_service.get_user_by_email(email_clean)

    if not user_data:
        user_id = f"usr_{uuid.uuid4().hex[:8]}"
        user_data = {
            "id": user_id,
            "name": payload.name,
            "email": email_clean,
            "password": payload.password,
            "role": "caregiver",
            "patient_name": payload.patient_name,
            "relationship": payload.relationship,
            "stage": payload.stage
        }
        dynamodb_service.save_user(user_data)

    user_profile = UserProfile(
        id=user_data["id"],
        name=user_data["name"],
        email=user_data["email"],
        role=user_data.get("role", "caregiver"),
        patient_name=user_data.get("patient_name", "Mom"),
        relationship=user_data.get("relationship", "Mother"),
        stage=user_data.get("stage", "Middle Stage")
    )

    token = f"cognitrace_jwt_{user_data['id']}"

    return AuthResponse(
        access_token=token,
        token_type="bearer",
        user=user_profile
    )


@router.get("/me", response_model=UserProfile)
async def get_current_user(authorization: Optional[str] = Header(None)):
    token = _parse_token(authorization)
    user_id = token.replace("cognitrace_jwt_", "")
    return _resolve_user_profile(user_id)


async def get_current_user_from_token(authorization: Optional[str] = Header(None)) -> UserProfile:
    token = _parse_token(authorization)
    user_id = token.replace("cognitrace_jwt_", "")
    return _resolve_user_profile(user_id)


def require_role(allowed_roles: list[str]):
    async def role_checker(authorization: Optional[str] = Header(None)):
        if not authorization:
            raise HTTPException(status_code=401, detail="Authentication required")
        user = await get_current_user_from_token(authorization)
        if user.role.lower() not in [r.lower() for r in allowed_roles]:
            raise HTTPException(
                status_code=403,
                detail=f"Forbidden: Access denied for role '{user.role}'"
            )
        return user
    return role_checker


require_caregiver = require_role(["caregiver", "admin"])
require_patient_or_caregiver = require_role(["patient", "caregiver", "admin"])



