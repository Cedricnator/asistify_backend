#!/bin/bash

# Exit immediately if a command exits with a non-zero status
set -e

echo "🚀 Starting deployment script..."

# 1. Login to GHCR
echo "🔑 Logging into GitHub Container Registry..."
echo "$GITHUB_TOKEN" | docker login ghcr.io -u "$GITHUB_USERNAME" --password-stdin

# 2. Pull latest image
echo "⬇️ Pulling latest image: $IMAGE_TAG"
docker pull "$IMAGE_TAG"

# 3. Create .env file with secrets
echo "📝 Creating .env file..."
cat <<EOF > .env
PORT=$PORT
NODE_ENV=production
DATABASE_URL=$DATABASE_URL
SUPABASE_URL=$SUPABASE_URL
SUPABASE_ANON_KEY=$SUPABASE_ANON_KEY
SUPABASE_SERVICE_ROLE_KEY=$SUPABASE_SERVICE_ROLE_KEY
SUPABASE_AUTH_JWT_SECRET=$SUPABASE_AUTH_JWT_SECRET
GEMINI_API_KEY=$GEMINI_API_KEY
GEMINI_MODEL=$GEMINI_MODEL
TWILIO_ACCOUNT_SID=$TWILIO_ACCOUNT_SID
TWILIO_AUTH_TOKEN=$TWILIO_AUTH_TOKEN
TWILIO_API_KEY_SID=$TWILIO_API_KEY_SID
TWILIO_API_KEY_SECRET=$TWILIO_API_KEY_SECRET
TWILIO_TWIML_APP_SID=$TWILIO_TWIML_APP_SID
GCLIENT_ID=$GCLIENT_ID
GCLIENT_SECRET=$GCLIENT_SECRET
MINIO_ACCESS_KEY=$MINIO_ACCESS_KEY
MINIO_SECRET_KEY=$MINIO_SECRET_KEY
MINIO_BUCKET_NAME=$MINIO_BUCKET_NAME
FLOW_RETURN_URL=$FLOW_RETURN_URL
# Fixed variables or defaults
MINIO_ENDPOINT=minio
MINIO_PORT=9000
MINIO_USE_SSL=false
EOF

# 4. Stop and remove old container
echo "🛑 Stopping old container..."
docker stop backend || true
docker rm backend || true

# 5. Ensure network exists
echo "🌐 Ensuring network exists..."
docker network create asistify_network || true

# 6. Run new container
echo "▶️ Starting new container..."
docker run -d \
  --name backend \
  --restart unless-stopped \
  --network asistify_network \
  --env-file .env \
  -p 3000:3000 \
  "$IMAGE_TAG"

# 7. Clean up unused images
echo "🧹 Cleaning up..."
docker image prune -f

echo "✅ Deployment finished successfully!"

