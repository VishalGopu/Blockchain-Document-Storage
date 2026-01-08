# Multi-stage Dockerfile for DigitalOcean App Platform
# Stage 1: Build stage
FROM eclipse-temurin:17-jdk-jammy AS builder

WORKDIR /app

# Copy Maven wrapper and make executable
COPY mvnw pom.xml ./
COPY .mvn .mvn
RUN chmod +x mvnw

# Download dependencies (cached layer)
RUN ./mvnw dependency:go-offline -B

# Copy source and build
COPY src src
RUN ./mvnw clean package -DskipTests

# Stage 2: Runtime stage
FROM eclipse-temurin:17-jre-jammy

WORKDIR /app

# Create uploads directory
RUN mkdir -p /tmp/uploads

# Copy only the built artifact from builder stage
COPY --from=builder /app/target/document-system-0.0.1-SNAPSHOT.jar app.jar

# Expose port
EXPOSE 8080

# Run with optimized JVM settings for containers
ENTRYPOINT ["java", "-XX:+UseContainerSupport", "-XX:MaxRAMPercentage=75.0", "-jar", "app.jar"]
