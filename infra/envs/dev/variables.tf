variable "db_subnet_ids" {
  description = "Subnet IDs to use for the RDS DB subnet group"
  type        = list(string)
}

variable "db_password" {
  description = "RDS master password"
  type        = string
  sensitive   = true
}

variable "app_subnet_ids" {
  description = "Subnets for ECS service"
  type        = list(string)
}

variable "jwt_secret" {
  type      = string
  sensitive = true
}