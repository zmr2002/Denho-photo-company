FROM eclipse-temurin:25-jdk AS build
WORKDIR /workspace
COPY apps/api ./
RUN sed -i 's/\r$//' gradlew && chmod +x gradlew && ./gradlew bootJar --no-daemon

FROM eclipse-temurin:25-jre AS runtime
WORKDIR /app
RUN groupadd --system --gid 10001 api && useradd --system --uid 10001 --gid api --home-dir /app api
COPY --from=build --chown=api:api /workspace/build/libs/*.jar /app/application.jar
USER api
EXPOSE 8080
ENTRYPOINT ["java", "-XX:MaxRAMPercentage=75", "-XX:+ExitOnOutOfMemoryError", "-jar", "/app/application.jar"]
