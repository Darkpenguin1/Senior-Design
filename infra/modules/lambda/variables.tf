variable "function_name" {}


variable "role_arn" {

}
variable "handler" {

}

variable "runtime" {

}

variable "filename" {

}

variable "environment_variables" {
  description = "Map of environment variables to pass to the Lambda function."
  type        = map(string)
  default     = {}
}

variable "timeout" {
  description = "Lambda function timeout in seconds."
  type        = number
  default     = 3
}

variable "memory_size" {
  description = "Lambda function memory size in MB."
  type        = number
  default     = 128
}

