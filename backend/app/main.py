from fastapi import FastAPI, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from app.config import settings
from app.routers import assessments, analytics, auth

app = FastAPI(
    title="CogniTrace Dementia Detection Engine API",
    description="Multimodal Dementia & Cognitive Impairment Risk Scoring, Digital Biomarker Extraction, & Longitudinal Analysis",
    version="1.0.0",
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


# Global Exception Handler
@app.exception_handler(Exception)
async def global_exception_handler(request: Request, exc: Exception):
    return JSONResponse(
        status_code=500,
        content={
            "error": "Internal Server Error",
            "detail": str(exc),
            "path": request.url.path
        }
    )


# Health Check Endpoint
@app.get("/health", tags=["System"])
async def health_check():
    """
    Health check endpoint for container orchestrators (AWS App Runner / ECS).
    """
    return {
        "status": "healthy",
        "service": "cognitrace-detection-engine",
        "version": "1.0.0",
        "environment": settings.ENVIRONMENT
    }


# Root Endpoint
@app.get("/", tags=["System"])
async def root():
    return {
        "name": "CogniTrace Detection Engine",
        "docs": "/docs",
        "health": "/health"
    }


# Include Routers
app.include_router(auth.router)
app.include_router(assessments.router)
app.include_router(analytics.router)

