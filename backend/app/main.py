import uuid
import time
from contextlib import asynccontextmanager
from fastapi import FastAPI, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from app.config import settings
from app.database.postgres import init_postgres_pool, close_postgres_pool, check_postgres_health
from app.services.redis_service import redis_service
from app.database.dynamodb import dynamodb_service
from app.routers import assessments, analytics, auth, voice


# FastAPI Lifespan Context Manager
@asynccontextmanager
async def lifespan(app: FastAPI):
    # Startup lifecycle
    await init_postgres_pool()
    await redis_service.init_redis()
    dynamodb_service.ensure_table_exists()
    yield
    # Shutdown lifecycle
    await close_postgres_pool()
    await redis_service.close_redis()


app = FastAPI(
    title="CogniTrace Dementia Detection Engine API",
    description="Multimodal Dementia Risk Scoring, Digital Biomarkers, Redis Rate Limiting & DynamoDB User Persistence",
    version="2.0.0",
    lifespan=lifespan,
    docs_url="/docs",
    redoc_url="/redoc"
)

# CORS Middleware Setup
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.cors_origins_list,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)



# Correlation ID (X-Request-ID) Middleware
@app.middleware("http")
async def add_correlation_id_header(request: Request, call_next):
    request_id = request.headers.get("X-Request-ID", f"req_{uuid.uuid4().hex[:12]}")
    request.state.request_id = request_id
    response = await call_next(request)
    response.headers["X-Request-ID"] = request_id
    return response


# RFC 7807 ProblemDetails Global Exception Handler
@app.exception_handler(Exception)
async def rfc7807_exception_handler(request: Request, exc: Exception):
    request_id = getattr(request.state, "request_id", "unknown")
    status_code = getattr(exc, "status_code", 500)
    detail = getattr(exc, "detail", str(exc))

    problem_details = {
        "type": f"https://cognitrace.health/errors/{status_code}",
        "title": "Bad Request" if status_code == 400 else "Internal Server Error",
        "status": status_code,
        "detail": detail,
        "instance": request.url.path,
        "request_id": request_id,
        "timestamp": time.time()
    }
    return JSONResponse(status_code=status_code, content=problem_details)


# Liveness Probe (Kubernetes / AWS ALB Target)
@app.get("/health/live", tags=["System Probes"])
async def health_live():
    return {"status": "alive", "timestamp": time.time()}


# Readiness Probe (Checks Postgres Pool, Redis Connection & DynamoDB Table)
@app.get("/health/ready", tags=["System Probes"])
async def health_ready():
    pg_ok = await check_postgres_health()
    redis_ok = await redis_service.check_health()
    ddb_ok = dynamodb_service.check_health()

    is_ready = pg_ok and redis_ok and ddb_ok
    return {
        "status": "ready" if is_ready else "not_ready",
        "postgres": "connected" if pg_ok else "offline_or_degraded",
        "redis": "connected" if redis_ok else "offline_or_in_memory_fallback",
        "dynamodb": "connected" if ddb_ok else "configured_with_in_memory_fallback",
        "timestamp": time.time()
    }



# Aggregated Health Check Endpoint
@app.get("/health", tags=["System Probes"])
async def health_check():
    return {
        "status": "healthy",
        "service": "cognitrace-detection-engine",
        "version": "2.0.0",
        "environment": settings.ENVIRONMENT
    }


# Root Endpoint
@app.get("/", tags=["System Probes"])
async def root():
    return {
        "name": "CogniTrace Detection Engine API",
        "version": "2.0.0",
        "docs": "/docs",
        "health": "/health"
    }


# Mount API Routers
app.include_router(auth.router)
app.include_router(assessments.router)
app.include_router(analytics.router)
app.include_router(voice.router)

