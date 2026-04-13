# Stage 1: build the application
FROM maven:3.9.9-eclipse-temurin-21 AS build

WORKDIR /app

# Copy pom + wrapper files first for better layer caching
COPY pom.xml .
COPY mvnw .
COPY .mvn .mvn

RUN chmod +x mvnw

# Download dependencies
RUN ./mvnw dependency:go-offline

# Copy source code and build
COPY src src
RUN ./mvnw clean package -DskipTests

# Stage 2: run the application
FROM eclipse-temurin:21-jre

WORKDIR /app

COPY --from=build /app/target/*.jar app.jar

EXPOSE 8080

ENTRYPOINT ["java", "-jar", "app.jar"]