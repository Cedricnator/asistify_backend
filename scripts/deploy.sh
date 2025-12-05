#!/bin/bash

# Exit immediately if a command exits with a non-zero status
set -e

echo "🚀 Starting deployment script (Docker Run mode)..."

# 1. Login to GHCR
echo "🔑 Logging into GitHub Container Registry..."
echo "$GITHUB_TOKEN" | docker login ghcr.io -u "$GITHUB_USERNAME" --password-stdin

# 2. Stop and remove old container
echo "🛑 Stopping old container..."
docker stop backend || true
docker rm backend || true

# 3. Remove old image to ensure clean pull
echo "🗑️ Removing old image..."
docker rmi "$IMAGE_TAG" || true

# 4. Pull latest image
echo "⬇️ Pulling latest image: $IMAGE_TAG"
docker pull "$IMAGE_TAG"

# 5. Create .env file with secrets
echo "📝 Creating .env file..."
cat <<EOF >.env
# NODE APP
PORT=3000
NODE_ENV=production
# SUPABASE
DATABASE_URL=$DATABASE_URL
SUPABASE_URL=$SUPABASE_URL
SUPABASE_ANON_KEY=$SUPABASE_ANON_KEY
SUPABASE_SERVICE_ROLE_KEY=$SUPABASE_SERVICE_ROLE_KEY
SUPABASE_AUTH_JWT_SECRET=$SUPABASE_AUTH_JWT_SECRET
# GEMINI
GEMINI_API_KEY=$GEMINI_API_KEY
GEMINI_MODEL=$GEMINI_MODEL
# TWILIO
TWILIO_ACCOUNT_SID=$TWILIO_ACCOUNT_SID
TWILIO_AUTH_TOKEN=$TWILIO_AUTH_TOKEN
TWILIO_API_KEY_SID=$TWILIO_API_KEY_SID
TWILIO_API_KEY_SECRET=$TWILIO_API_KEY_SECRET
TWILIO_TWIML_APP_SID=$TWILIO_TWIML_APP_SID
# GOOGLE
GCLIENT_ID=$GCLIENT_ID
GCLIENT_SECRET=$GCLIENT_SECRET
GACCESS_TOKEN=$GACCESS_TOKEN
GREFRESH_TOKEN=$GREFRESH_TOKEN
# MINIO
MINIO_ACCESS_KEY=$MINIO_ACCESS_KEY
MINIO_SECRET_KEY=$MINIO_SECRET_KEY
MINIO_BUCKET_NAME=$MINIO_BUCKET_NAME
MINIO_ENDPOINT=$MINIO_ENDPOINT
MINIO_PORT=$MINIO_PORT
MINIO_USE_SSL=false
# FLOW
FLOW_RETURN_URL=$FLOW_RETURN_URL
FLOW_API_KEY=$FLOW_API_KEY
FLOW_SECRET=$FLOW_SECRET
# SSH
SSH_HOST=$SSH_HOST
EOF

# 6. Create gs2.json file
# We construct this file using the environment variables to avoid hardcoding secrets in the script
echo "📝 Creating gs2.json file..."
cat <<EOF >gs2.json
{
  "installed": {
    "client_id": "$GCLIENT_ID",
    "project_id": "calendar-manager-477419",
    "auth_uri": "https://accounts.google.com/o/oauth2/auth",
    "token_uri": "https://oauth2.googleapis.com/token",
    "auth_provider_x509_cert_url": "https://www.googleapis.com/oauth2/v1/certs",
    "client_secret": "$GCLIENT_SECRET",
    "redirect_uris": [
      "http://$SSH_HOST/payments/flowCallback"
    ]
  }
}
EOF

# 7. Ensure network exists
echo "🌐 Ensuring network exists..."
docker network create asistify_network || true

# 8. Run new container
echo "▶️ Starting new container..."
# We mount the generated gs2.json into the container
docker run -d \
  --name backend \
  --restart unless-stopped \
  --network asistify_network \
  --env-file .env \
  -v "$(pwd)/gs2.json:/usr/src/app/gs2.json" \
  -p 36000:3000 \
  "$IMAGE_TAG"

# 9. Clean up unused images
echo "🧹 Cleaning up..."
docker image prune -f

echo "✅ Deployment finished successfully!"
