#!/bin/bash
# =============================================================================
# SUMA Backend - Script de Despliegue a Google Cloud Run
# Este script asume que gcloud está autenticado y configurado con el proyecto.
# =============================================================================

PROJECT_ID=$(gcloud config get-value project)
REGION="southamerica-west1" # Santiago, Chile
SERVICE_NAME="suma-backend"
IMAGE_NAME="gcr.io/$PROJECT_ID/$SERVICE_NAME:latest"

echo "🚀 Iniciando despliegue de SUMA Backend..."

# 1. Construir la imagen con Cloud Build
echo "📦 Construyendo imagen en Cloud Build..."
gcloud builds submit --tag $IMAGE_NAME ../backend

# 2. Desplegar a Cloud Run
echo "☁️  Desplegando en Cloud Run..."
gcloud run deploy $SERVICE_NAME \
  --image $IMAGE_NAME \
  --platform managed \
  --region $REGION \
  --allow-unauthenticated \
  --port 3001 \
  --set-env-vars="NODE_ENV=production" \
  --memory 512Mi

echo "✅ Despliegue completado con éxito."
