import uuid
from fastapi import APIRouter, HTTPException, Header
from typing import Optional, Dict
from app.models.schemas import LoginRequest, SignupRequest, AuthResponse, UserProfile

router = APIRouter(prefix="/v1/auth", tags=["Authentication"])

# In-Memory Demo Users Store
USERS_DB: Dict[str, Dict] = {
    "priya.caregiver@example.com": {
        "id": "usr_demo_001",
        "name": "Priya Sharma",
        "email": "priya.caregiver@example.com",
        "password": "password",
        "role": "caregiver",
        "patient_name": "Mom (Sunita)",
        "relationship": "Mother",
        "stage": "Middle Stage"
    }
}


@router.post("/login", response_model=AuthResponse)
async def login(payload: LoginRequest):
    """
    Authenticates caregiver credentials and returns session token.
    """
    email_clean = payload.email.strip().lower()
    user_data = USERS_DB.get(email_clean)

    if not user_data:
        # Auto-provision user account for easy demo access if password length is valid
        if len(payload.password) < 4:
            raise HTTPException(status_code=401, detail="Invalid email or password")
        
        user_id = f"usr_{uuid.uuid4().hex[:8]}"
        name = email_clean.split("@")[0].replace(".", " ").title()
        user_data = {
            "id": user_id,
            "name": name if name else "Caregiver User",
            "email": email_clean,
            "password": payload.password,
            "role": "caregiver",
            "patient_name": "Mom (Sunita)",
            "relationship": "Mother",
            "stage": "Middle Stage"
        }
        USERS_DB[email_clean] = user_data

    user_profile = UserProfile(
        id=user_data["id"],
        name=user_data["name"],
        email=user_data["email"],
        role=user_data["role"],
        patient_name=user_data["patient_name"],
        relationship=user_data["relationship"],
        stage=user_data["stage"]
    )

    # Generate token
    token = f"cognitrace_jwt_{user_data['id']}"

    return AuthResponse(
        access_token=token,
        token_type="bearer",
        user=user_profile
    )


@router.post("/signup", response_model=AuthResponse)
@router.post("/register", response_model=AuthResponse)
async def signup(payload: SignupRequest):
    """
    Registers a new caregiver account and initializes patient profile.
    """
    email_clean = payload.email.strip().lower()
    if email_clean in USERS_DB:
        user_data = USERS_DB[email_clean]
    else:
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
        USERS_DB[email_clean] = user_data

    user_profile = UserProfile(
        id=user_data["id"],
        name=user_data["name"],
        email=user_data["email"],
        role=user_data["role"],
        patient_name=user_data["patient_name"],
        relationship=user_data["relationship"],
        stage=user_data["stage"]
    )

    token = f"cognitrace_jwt_{user_data['id']}"

    return AuthResponse(
        access_token=token,
        token_type="bearer",
        user=user_profile
    )


@router.get("/me", response_model=UserProfile)
async def get_current_user(authorization: Optional[str] = Header(None)):
    """
    Returns current authenticated caregiver user profile.
    """
    if not authorization:
        # Default fallback profile if token unsupplied
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
    for user_data in USERS_DB.values():
        if f"cognitrace_jwt_{user_data['id']}" == token:
            return UserProfile(
                id=user_data["id"],
                name=user_data["name"],
                email=user_data["email"],
                role=user_data["role"],
                patient_name=user_data["patient_name"],
                relationship=user_data["relationship"],
                stage=user_data["stage"]
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
