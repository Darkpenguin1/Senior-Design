#!/usr/bin/env bash
set -euo pipefail

# ===== CONFIG =====
BUCKET_NAME="pickfix-uncc-spring-2026"
DISTRIBUTION_ID="EQNDOAPTNZYX0"
BUILD_DIR="dist"

# Optional: set AWS profile if you use one
# export AWS_PROFILE=default

echo "Building frontend..."
npm run build

echo "Uploading ${BUILD_DIR}/ to s3://${BUCKET_NAME} ..."
aws s3 sync "${BUILD_DIR}/" "s3://${BUCKET_NAME}" --delete

echo "Creating CloudFront invalidation..."
aws cloudfront create-invalidation \
  --distribution-id "${DISTRIBUTION_ID}" \
  --paths "/*"

echo "Frontend deployed successfully."