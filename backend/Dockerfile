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

# Install runtime C libraries and audio codecs (ffmpeg)
RUN apt-get update && apt-get install -y --no-install-recommends \
    ffmpeg \
    libsndfile1 \
    curl \
    && rm -rf /var/lib/apt/lists/*

# Security: Create non-root system user (appuser)
RUN useradd -m -u 1000 -s /bin/bash appuser

WORKDIR /app

# Copy installed python dependencies and baked model weights from builder
COPY --from=builder /install /usr/local
COPY --from=builder /opt/models/whisper /opt/models/whisper

# Copy backend application code
COPY app ./app

# Set non-root user permissions
RUN chown -R appuser:appuser /app /opt/models/whisper

USER appuser

EXPOSE 8000

# Production Healthcheck Probe
HEALTHCHECK --interval=30s --timeout=5s --start-period=10s --retries=3 \
  CMD curl -f http://localhost:8000/health || exit 1

# Production Uvicorn Execution Command with workers and proxy headers
CMD ["uvicorn", "app.main:app", "--host", "0.0.0.0", "--port", "8000", "--workers", "2", "--proxy-headers", "--forwarded-allow-ips=*"]
