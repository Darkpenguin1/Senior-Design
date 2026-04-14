resource "aws_cloudfront_distribution" "this" {
  enabled             = true
  is_ipv6_enabled     = var.is_ipv6_enabled
  comment             = var.comment
  default_root_object = var.default_root_object
  price_class         = var.price_class

  # Frontend origin: S3
  origin {
    domain_name              = var.origin_domain_name
    origin_id                = var.origin_id
    origin_access_control_id = var.origin_access_control_id

    s3_origin_config {
      origin_access_identity = ""
    }
  }

  # Backend origin: ALB
  origin {
    domain_name = var.alb_domain_name
    origin_id   = var.alb_origin_id

    custom_origin_config {
      http_port              = 80
      https_port             = 443
      origin_protocol_policy = var.alb_origin_protocol_policy
      origin_ssl_protocols   = ["TLSv1.2"]
    }
  }

  # Uploads origin: S3
  origin {
    domain_name              = var.uploads_origin_domain_name
    origin_id                = var.uploads_origin_id
    origin_access_control_id = var.uploads_origin_access_control_id

    s3_origin_config {
      origin_access_identity = ""
    }
  }

  # Default behavior -> frontend bucket
  default_cache_behavior {
    target_origin_id       = var.origin_id
    viewer_protocol_policy = var.viewer_protocol_policy
    allowed_methods        = var.allowed_methods
    cached_methods         = var.cached_methods
    cache_policy_id        = var.cache_policy_id
    compress               = var.compress
  }

  # /api/* -> ALB backend
  ordered_cache_behavior {
    path_pattern             = "/api/*"
    target_origin_id         = var.alb_origin_id
    viewer_protocol_policy   = "redirect-to-https"
    allowed_methods          = ["GET", "HEAD", "OPTIONS", "PUT", "POST", "PATCH", "DELETE"]
    cached_methods           = ["GET", "HEAD", "OPTIONS"]
    cache_policy_id          = var.api_cache_policy_id
    origin_request_policy_id = var.api_origin_request_policy_id
    compress                 = true
  }

  # /uploads/* -> uploads bucket
  ordered_cache_behavior {
    path_pattern           = "/uploads/*"
    target_origin_id       = var.uploads_origin_id
    viewer_protocol_policy = "redirect-to-https"
    allowed_methods        = ["GET", "HEAD", "OPTIONS"]
    cached_methods         = ["GET", "HEAD", "OPTIONS"]
    cache_policy_id        = var.cache_policy_id
    compress               = true
  }

  custom_error_response {
    error_code            = 403
    response_code         = 200
    response_page_path    = "/index.html"
    error_caching_min_ttl = 10
  }

  custom_error_response {
    error_code            = 404
    response_code         = 200
    response_page_path    = "/index.html"
    error_caching_min_ttl = 10
  }

  restrictions {
    geo_restriction {
      restriction_type = var.geo_restriction_type
    }
  }

  viewer_certificate {
    cloudfront_default_certificate = var.use_default_certificate
  }

  tags = var.tags
}