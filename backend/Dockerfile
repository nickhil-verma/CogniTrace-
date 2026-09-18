# ==============================================================================
# Stage 1: Build & Whisper Model Weight Baking Stage
# ==============================================================================
FROM python:3.11-slim AS builder

ENV PYTHONUNBUFFERED=1 \
    PYTHONDONTWRITEBYTECODE=1

RUN apt-get update && apt-get install -y --no-install-recommends \
    gcc \
    g++ \
    build-essential \
    curl \
    && rm -rf /var/lib/apt/lists/*

WORKDIR /build

COPY requirements.txt .
RUN pip install --no-cache-dir --prefix=/install -r requirements.txt

# Pre-download and bake faster-whisper model weights into /opt/models/whisper
RUN PATH="/install/bin:$PATH" PYTHONPATH="/install/lib/python3.11/site-packages" python -c "\
from faster_whisper import WhisperModel; \
WhisperModel('tiny', device='cpu', compute_type='int8', download_root='/opt/models/whisper'); \
print('[Dockerfile Build] Faster-Whisper tiny model successfully baked into /opt/models/whisper')\
"

# ==============================================================================
# Stage 2: Final Production Stage (Minimal & Fast Cold-Start)
# ==============================================================================
FROM python:3.11-slim

ENV PYTHONUNBUFFERED=1 \
    PYTHONDONTWRITEBYTECODE=1 \
    PORT=8000 \
    WHISPER_MODEL_DIR=/opt/models/whisper \
    HF_HUB_OFFLINE=1

# Install only essential runtime C libraries
RUN apt-get update && apt-get install -y --no-install-recommends \
    ffmpeg \
    libsndfile1 \
    curl \
    && rm -rf /var/lib/apt/lists/*

WORKDIR /app

# Copy installed python dependencies and baked model weights from builder
COPY --from=builder /install /usr/local
COPY --from=builder /opt/models/whisper /opt/models/whisper

# Copy backend application code
COPY app ./app

EXPOSE 8000

# Healthcheck command checking /health/live
HEALTHCHECK --interval=30s --timeout=5s --start-period=10s --retries=3 \
  CMD curl -f http://localhost:8000/health/live || exit 1

CMD ["uvicorn", "app.main:app", "--host", "0.0.0.0", "--port", "8000"]
