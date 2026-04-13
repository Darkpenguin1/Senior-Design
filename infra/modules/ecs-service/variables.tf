variable "name" {
  type = string
}

variable "cluster_id" {
  type = string
}

variable "image" {
  type = string
}

variable "container_port" {
  type = number
  default = 8080
}

variable "cpu" {
  type = string
  default = "256"
}

variable "memory" {
  type = string
  default = "512"
}

variable "desired_count" {
  type = number
  default = 1
}

variable "subnet_ids" {
  type = list(string)
}

variable "security_group_id" {
  type = string
}

variable "aws_region" {
  type = string
}

variable "environment" {
  type    = map(string)
  default = {}
}

variable "target_group_arn" {
  description = "ALB target group ARN for the ECS service"
  type        = string
}