resource "aws_db_instance" "this" {
  identifier = var.identifier

  engine         = "postgres"
  engine_version = var.engine_version
  instance_class = var.instance_class

  allocated_storage     = var.allocated_storage
  max_allocated_storage = var.max_allocated_storage
  storage_type          = "gp3"
  storage_encrypted     = true

  db_name  = var.db_name
  username = var.username
  password = var.password
  port     = 5432

  db_subnet_group_name   = var.db_subnet_group_name
  vpc_security_group_ids = [var.security_group_id]

  publicly_accessible   = var.publicly_accessible
  multi_az              = false
  backup_retention_period = 0
  skip_final_snapshot   = true
  deletion_protection   = false

  auto_minor_version_upgrade = true

  tags = {
    Name = var.identifier
  }
}