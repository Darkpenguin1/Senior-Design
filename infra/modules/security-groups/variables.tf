variable "name" {
  description = "Base name for security groups"
  type        = string
}

variable "vpc_id" {
  description = "VPC ID where the security groups will be created"
  type        = string
}

variable "app_port" {
  description = "Application port exposed by ECS service"
  type        = number
  default     = 8080
}

variable "app_ingress_cidrs" {
  description = "CIDR blocks allowed to reach the ECS app"
  type        = list(string)
  default     = ["0.0.0.0/0"]
}