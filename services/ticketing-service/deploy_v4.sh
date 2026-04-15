#!/usr/bin/env bash
set -e

IMAGE_TAG="v9"
ACCOUNT_ID="318942626726"
REGION="us-east-1"
REPO="ticketing-service"

cd ~/projects/school/Senior-Design/services/ticketing-service
docker build -t ${REPO}:${IMAGE_TAG} .
docker tag ${REPO}:${IMAGE_TAG} ${ACCOUNT_ID}.dkr.ecr.${REGION}.amazonaws.com/${REPO}:${IMAGE_TAG}
aws ecr get-login-password --region ${REGION} | docker login --username AWS --password-stdin ${ACCOUNT_ID}.dkr.ecr.${REGION}.amazonaws.com
docker push ${ACCOUNT_ID}.dkr.ecr.${REGION}.amazonaws.com/${REPO}:${IMAGE_TAG}

echo "Now update Terraform image tag to ${IMAGE_TAG} and run terraform apply."