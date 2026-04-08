variable "notification_email" {
  description = "Email address subscribed to the work-order-events SNS topic for demo/debug. Set in terraform.tfvars (not committed)."
  type        = string
  default     = ""
}

variable "jwt_secret" {
  description = "HMAC secret used by the auth-service Lambda to sign JWTs. Supply via TF_VAR_jwt_secret or tfvars (not committed)."
  type        = string
  sensitive   = true
}
