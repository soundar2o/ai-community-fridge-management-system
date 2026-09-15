# Multi-stage Dockerfile for Spring Boot Backend on Render

# Stage 1: Build stage with Maven and JDK 17
FROM maven:3.9-eclipse-temurin-17 AS build
WORKDIR /app

# Copy pom.xml and cache dependencies
COPY pom.xml .
RUN mvn dependency:go-offline -B

# Copy source code and package application
COPY src ./src
RUN mvn clean package -DskipTests

# Stage 2: Runtime stage with lightweight Java 17 JRE
FROM eclipse-temurin:17-jre-alpine
WORKDIR /app

# Copy the generated JAR from the build stage
COPY --from=build /app/target/community-fridge-backend-1.0.0.jar app.jar

# Render provides the PORT environment variable at runtime (defaults to 8080)
ENV PORT=8080

# Document exposed port
EXPOSE 8080

# Configure JVM for container memory limits on Render (512MB RAM limit)
# Bind server to 0.0.0.0 and PORT environment variable
ENTRYPOINT ["sh", "-c", "java -XX:MaxRAMPercentage=75.0 -Dserver.port=${PORT} -Dserver.address=0.0.0.0 -jar app.jar"]
