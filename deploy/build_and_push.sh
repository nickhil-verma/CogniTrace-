#!/usr/bin/env bash
# ==============================================================================
# AWS ECR Build, Tag & Push Script for CogniTrace Backend
# ==============================================================================

set -e

AWS_REGION="${AWS_REGION:-us-east-1}"
AWS_ACCOUNT_ID="${AWS_ACCOUNT_ID:-123456789012}"
ECR_REPO_NAME="${ECR_REPO_NAME:-cognitrace-backend}"
IMAGE_TAG="${IMAGE_TAG:-latest}"

ECR_URI="${AWS_ACCOUNT_ID}.dkr.ecr.${AWS_REGION}.amazonaws.com"
FULL_IMAGE_URI="${ECR_URI}/${ECR_REPO_NAME}:${IMAGE_TAG}"

echo "================================================================="
echo "Building & Deploying CogniTrace Backend to Amazon ECR"
echo "Target AWS Region: ${AWS_REGION}"
echo "Target Image URI: ${FULL_IMAGE_URI}"
echo "================================================================="

# 1. Authenticate Docker with Amazon ECR
echo "[1/4] Authenticating with Amazon ECR..."
aws ecr get-login-password --region "${AWS_REGION}" | docker login --username AWS --password-stdin "${ECR_URI}"

# 2. Build Docker Image
echo "[2/4] Building production Docker image..."
docker build -t "${ECR_REPO_NAME}:${IMAGE_TAG}" -f ../backend/Dockerfile ../backend

# 3. Tag Docker Image
echo "[3/4] Tagging Docker image for ECR..."
docker tag "${ECR_REPO_NAME}:${IMAGE_TAG}" "${FULL_IMAGE_URI}"

# 4. Push to ECR
echo "[4/4] Pushing image to ECR..."
docker push "${FULL_IMAGE_URI}"

echo "================================================================="
echo "✅ Successfully pushed container to ${FULL_IMAGE_URI}"
echo "================================================================="
