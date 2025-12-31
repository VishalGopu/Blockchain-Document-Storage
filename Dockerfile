# Dockerfile for Railway deployment (optional - Railway can auto-detect Java)
FROM eclipse-temurin:17-jdk-jammy

# Set working directory
WORKDIR /app

# Copy Maven wrapper and pom.xml first for better layer caching
COPY mvnw pom.xml ./
COPY .mvn .mvn

# Make mvnw executable
RUN chmod +x mvnw

# Download dependencies
RUN ./mvnw dependency:resolve

# Copy source code
COPY src src

# Build the application
RUN ./mvnw clean package -DskipTests

# Expose port (Railway will override with PORT env var)
EXPOSE 8080

# Create uploads directory
RUN mkdir -p /tmp/uploads

# Run the application
CMD ["java", "-jar", "target/document-system-0.0.1-SNAPSHOT.jar"]