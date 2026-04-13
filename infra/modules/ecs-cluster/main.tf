resource "aws_ecs_cluster" "this" {
  name = var.name

  tags = {
    Name = var.name
  }
}