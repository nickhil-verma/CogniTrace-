import uuid
from fastapi import APIRouter, HTTPException, Header
from typing import Optional, Dict
from app.models.schemas import LoginRequest, SignupRequest, AuthResponse, UserProfile

from app.database.dynamodb import dynamodb_service

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
    password_matches = bool(user_data) and user_data.get("password") == payload.password

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
    patient_user = dynamodb_service.get_user_by_email("sunita.patient@example.com") or DEMO_USERS["sunita.patient@example.com"]
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
    if not authorization:
        return UserProfile(
            id="usr_demo_001",
            name="Priya Sharma",
            email="priya.caregiver@example.com",
            role="caregiver",
            patient_name="Mom (Sunita)",
            relationship="Mother",
            stage="Middle Stage"
        )

    token = authorization.replace("Bearer ", "").strip()
    user_id = token.replace("cognitrace_jwt_", "")
    user_data = dynamodb_service.get_user_by_id(user_id)

    if user_data:
        return UserProfile(
            id=user_data["id"],
            name=user_data["name"],
            email=user_data["email"],
            role=user_data.get("role", "caregiver"),
            patient_name=user_data.get("patient_name", "Mom"),
            relationship=user_data.get("relationship", "Mother"),
            stage=user_data.get("stage", "Middle Stage")
        )

    return UserProfile(
        id="usr_demo_001",
        name="Priya Sharma",
        email="priya.caregiver@example.com",
        role="caregiver",
        patient_name="Mom (Sunita)",
        relationship="Mother",
        stage="Middle Stage"
    )


async def get_current_user_from_token(authorization: Optional[str] = Header(None)) -> UserProfile:
    if not authorization:
        raise HTTPException(status_code=401, detail="Missing authorization header")
    token = authorization.replace("Bearer ", "").strip()
    user_id = token.replace("cognitrace_jwt_", "")
    user_data = dynamodb_service.get_user_by_id(user_id)
    if user_data:
        return UserProfile(
            id=user_data["id"],
            name=user_data["name"],
            email=user_data["email"],
            role=user_data.get("role", "caregiver"),
            patient_name=user_data.get("patient_name", "Mom"),
            relationship=user_data.get("relationship", "Mother"),
            stage=user_data.get("stage", "Middle Stage")
        )
    if "patient" in user_id.lower() or "patient" in token.lower():
        return UserProfile(
            id="usr_patient_001",
            name="Sunita Sharma",
            email="sunita.patient@example.com",
            role="patient",
            patient_name="Sunita (Mom)",
            relationship="Self",
            stage="Middle Stage"
        )
    return UserProfile(
        id="usr_demo_001",
        name="Priya Sharma",
        email="priya.caregiver@example.com",
        role="caregiver",
        patient_name="Mom (Sunita)",
        relationship="Mother",
        stage="Middle Stage"
    )


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



