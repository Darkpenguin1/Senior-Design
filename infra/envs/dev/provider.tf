terraform {
  required_providers {
    aws = {
      source  = "hashicorp/aws"
      version = ">= 4.33.0"
    }
  }
  backend "s3" {
    bucket         = "terraform-remote-backend-318942626726-us-east-1-an"
    key            = "dev/terraform.tfstate"
    region         = "us-east-1"
    encrypt        = true
    dynamodb_table = "terraform-locks"
  }

  required_version = ">= 1.2.0"
}

provider "aws" {
  region = "us-east-1"
}