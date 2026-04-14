variable "comment" {
  type        = string
  description = "Comment for the CloudFront distribution"
  default     = "pickfix-cloudfront"
}

variable "default_root_object" {
  type        = string
  description = "Default root object"
  default     = "index.html"
}

variable "price_class" {
  type        = string
  description = "CloudFront price class"
  default     = "PriceClass_All"
}

variable "is_ipv6_enabled" {
  type        = bool
  description = "Enable IPv6 for the distribution"
  default     = true
}

variable "origin_domain_name" {
  type        = string
  description = "Origin domain name"
}

variable "origin_id" {
  type        = string
  description = "Origin ID"
  default     = "pickfix-uncc-spring-2026.s3.amazonaws.com-mnxdyf4aunv"
}

variable "origin_access_control_id" {
  type        = string
  description = "Origin Access Control ID"
}

variable "viewer_protocol_policy" {
  type        = string
  description = "Viewer protocol policy"
  default     = "redirect-to-https"
}

variable "allowed_methods" {
  type        = list(string)
  description = "Allowed HTTP methods"
  default     = ["GET", "HEAD"]
}

variable "cached_methods" {
  type        = list(string)
  description = "Cached HTTP methods"
  default     = ["GET", "HEAD"]
}

variable "cache_policy_id" {
  type        = string
  description = "Cache policy ID"
  default     = "658327ea-f89d-4fab-a63d-7e88639e58f6"
}

variable "compress" {
  type        = bool
  description = "Whether to enable compression"
  default     = true
}

variable "geo_restriction_type" {
  type        = string
  description = "Geo restriction type"
  default     = "none"
}

variable "use_default_certificate" {
  type        = bool
  description = "Use default CloudFront certificate"
  default     = true
}

variable "tags" {
  type        = map(string)
  description = "Tags for the distribution"
  default     = {}
}

variable "alb_domain_name" {
  type        = string
  description = "ALB DNS name for API origin"
}

variable "alb_origin_id" {
  type        = string
  description = "Origin ID for the ALB origin"
  default     = "alb-api-origin"
}

variable "alb_origin_protocol_policy" {
  type        = string
  description = "Protocol policy for CloudFront to ALB"
  default     = "http-only"
}

variable "api_cache_policy_id" {
  type        = string
  description = "Cache policy for API behavior"
  default     = "4135ea2d-6df8-44a3-9df3-4b5a84be39ad"
}

variable "api_origin_request_policy_id" {
  type        = string
  description = "Origin request policy for API behavior"
  default     = "216adef6-5c7f-47e4-b989-5492eafa07d3"
}