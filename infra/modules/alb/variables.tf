variable "name" {
  description = "Name of the ALB"
  type        = string
}

variable "target_group_name" {
  description = "Name of the target group"
  type        = string
}

variable "vpc_id" {
  description = "VPC ID for the ALB target group"
  type        = string
}

variable "subnet_ids" {
  description = "Subnets for the ALB"
  type        = list(string)
}

variable "alb_security_group_id" {
  description = "Security group ID for the ALB"
  type        = string
}

variable "target_port" {
  description = "Port the target group forwards to"
  type        = number
  default     = 8080
}

variable "health_check_path" {
  description = "Health check path for the target group"
  type        = string
  default     = "/students"
}