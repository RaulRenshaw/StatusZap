FROM maven:3.9-eclipse-temurin-21 AS build
WORKDIR /app
COPY pom.xml .
RUN mvn -B -q dependency:go-offline
COPY src ./src
RUN mvn -B -q package -DskipTests

FROM eclipse-temurin:21-jre
WORKDIR /app
RUN apt-get update \
    && apt-get install -y --no-install-recommends wget \
    && rm -rf /var/lib/apt/lists/*
RUN addgroup --system statuszap && adduser --system --ingroup statuszap statuszap
COPY --from=build /app/target/statuszap-api-0.0.1-SNAPSHOT.jar app.jar
RUN mkdir -p /app/uploads && chown -R statuszap:statuszap /app
USER statuszap
EXPOSE 8080
HEALTHCHECK --interval=30s --timeout=3s --start-period=30s --retries=3 CMD [ "wget", "-qO-", "http://localhost:8080/actuator/health/readiness" ]
ENTRYPOINT ["java", "-XX:MaxRAMPercentage=75", "-jar", "app.jar"]
