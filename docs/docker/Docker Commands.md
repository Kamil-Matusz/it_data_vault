### Budowanie obrazów

```sh
### Budowanie obrazu
docker build -t webapp-color .

### Budowanie z tagiem wersji
docker build -t webapp-color:1.0.0 .

### Budowanie z konkretnego pliku Dockerfile
docker build -t webapp-color -f Dockerfile.prod .

### Budowanie z argumentem przekazanym do Dockerfile (ARG)
docker build --build-arg VERSION=1.0.0 -t webapp-color .

### Budowanie bez cache-a (wymuszenie pełnego przebiegu)
docker build --no-cache -t webapp-color .

### Zatrzymanie build-a na wybranym etapie (multi-stage)
docker build --target builder -t webapp-color-builder .

### Budowanie multi-platform i push do rejestru
docker buildx build --platform linux/amd64,linux/arm64 -t webapp-color:1.0.0 --push .
```

### Uruchamianie kontenerów

```sh
### Uruchomienie kontener-a Docker-a
docker run -p 8282:8080 webapp-color

### Uruchomienie w tle (detached) z nazwą
docker run -d --name web -p 8282:8080 webapp-color

### Uruchomienie z automatycznym usunięciem po zakończeniu
docker run --rm -p 8282:8080 webapp-color

### Uruchomienie interaktywne z terminalem
docker run -it ubuntu:22.04 bash

### Uruchomienie jednorazowego polecenia w kontenerze
docker run python:3.6 cat /etc/*release*

### Nadpisanie ENTRYPOINT-a obrazu
docker run -it --entrypoint sh webapp-color

### Restart policy (przydatne przy usługach lokalnych)
docker run -d --restart unless-stopped --name redis redis:7
```

### Cykl życia kontenera

```sh
### Lista działających kontenerów
docker ps

### Lista wszystkich kontenerów, także zatrzymanych
docker ps -a

### Zatrzymanie / uruchomienie / restart kontener-a
docker stop web
docker start web
docker restart web

### Usunięcie kontener-a (-f wymusza na działającym)
docker rm web
docker rm -f web

### Wstrzymanie i wznowienie procesów w kontenerze
docker pause web
docker unpause web

### Zatrzymanie wszystkich działających kontenerów
docker stop $(docker ps -q)
```

### Podgląd i debugowanie

```sh
### Logi kontener-a, na żywo, ostatnie 100 linii
docker logs -f --tail 100 web

### Logi od konkretnego momentu
docker logs --since 10m web

### Wejście do działającego kontener-a
docker exec -it web sh
docker exec -it web bash

### Jednorazowe polecenie w działającym kontenerze
docker exec web env

### Pełna konfiguracja kontener-a w JSON
docker inspect web

### Wyciągnięcie jednego pola z inspect (np. status health-check-a)
docker inspect -f '{{.State.Health.Status}}' web

### Adres IP kontener-a w danej sieci
docker inspect -f '{{range .NetworkSettings.Networks}}{{.IPAddress}}{{end}}' web

### Zużycie CPU / RAM / IO na żywo
docker stats

### Procesy działające wewnątrz kontener-a
docker top web

### Zmiany w systemie plików względem obrazu
docker diff web

### Kopiowanie plików między hostem i kontenerem
docker cp web:/app/config.yml ./config.yml
docker cp ./config.yml web:/app/config.yml

### Zmapowane porty kontener-a
docker port web
```

### Obrazy i rejestr

```sh
### Lista lokalnych obrazów
docker images

### Usunięcie obrazu
docker rmi webapp-color:latest

### Pobranie i wypchnięcie obrazu
docker pull redis:7
docker push myacr.azurecr.io/webapp-color:1.0.0

### Nadanie nowego tag-a (np. pod rejestr Azure)
docker tag webapp-color myacr.azurecr.io/webapp-color:1.0.0

### Logowanie do rejestru
docker login myacr.azurecr.io

### Warstwy obrazu i ich rozmiar (dobre do szukania czym obraz spuchł)
docker history webapp-color

### Eksport i import obrazu bez rejestru
docker save -o webapp-color.tar webapp-color:1.0.0
docker load -i webapp-color.tar
```

### Wolumeny i dane

```sh
### Lista wolumenów
docker volume ls

### Utworzenie i usunięcie wolumen-u
docker volume create mydata
docker volume rm mydata

### Named volume podmontowany do kontener-a
docker run -d -v mydata:/var/lib/data --name db postgres:16

### Bind mount z katalogu bieżącego (tryb dev)
docker run -it -v $(pwd):/app -w /app node:20 sh

### Bind mount tylko do odczytu
docker run --mount type=bind,src=$(pwd),dst=/app,readonly node:20

### Szczegóły wolumen-u (m.in. ścieżka na hoście)
docker volume inspect mydata
```

### Sieci

```sh
### Lista sieci
docker network ls

### Utworzenie własnej sieci (user-defined bridge)
docker network create backend

### Uruchomienie kontener-a w wybranej sieci
docker run -d --network backend --name redis redis:7

### Dołączenie i odłączenie działającego kontener-a od sieci
docker network connect backend web
docker network disconnect backend web

### Szczegóły sieci wraz z podłączonymi kontenerami
docker network inspect backend
```

W jednej sieci user-defined kontenery widzą się po nazwie, więc z `web` można uderzyć na `redis:6379` bez publikowania portu na hosta. W domyślnej sieci `bridge` to nie działa.

### Zmienne środowiskowe i limity

```sh
### Pojedyncza zmienna środowiskowa
docker run -e SPRING_PROFILES_ACTIVE=local webapp-color

### Zmienne z pliku
docker run --env-file .env webapp-color

### Limity pamięci i CPU
docker run --memory 512m --cpus 1.5 webapp-color

### Nadpisanie katalogu roboczego i użytkownika
docker run -w /app -u 1000:1000 webapp-color

### Dodanie wpisu do /etc/hosts w kontenerze
docker run --add-host host.docker.internal:host-gateway webapp-color
```

### Docker Compose

```sh
### Uruchomienie stack-a w tle z przebudowaniem obrazów
docker compose up -d --build

### Uruchomienie wybranej usługi
docker compose up -d api

### Logi jednej usługi na żywo
docker compose logs -f api

### Status usług
docker compose ps

### Wejście do kontener-a usługi
docker compose exec api sh

### Jednorazowe polecenie w nowym kontenerze usługi
docker compose run --rm api ./mvnw test

### Przebudowanie i restart jednej usługi
docker compose up -d --no-deps --build api

### Zatrzymanie stack-a (-v usuwa też wolumeny)
docker compose down
docker compose down -v

### Rozwiązany plik konfiguracyjny (dobre do debugowania zmiennych)
docker compose config
```

### Porządki i miejsce na dysku

```sh
### Co zajmuje miejsce
docker system df

### Ogólne czyszczenie (-a agresywniej, --volumes usuwa też dane)
docker system prune
docker system prune -a --volumes

### Czyszczenie pojedynczych kategorii
docker container prune
docker image prune -a
docker volume prune
docker network prune

### Cache build-a (zwykle największy pojedynczy winowajca)
docker builder prune
```

### Notatki

**CMD vs ENTRYPOINT** — `ENTRYPOINT` to polecenie, którym kontener jest, `CMD` to domyślne argumenty, które łatwo nadpisać. Argumenty z `docker run` zastępują `CMD`, ale są dopisywane do `ENTRYPOINT`. Typowy układ: `ENTRYPOINT ["java", "-jar", "/app/app.jar"]` plus `CMD ["--spring.profiles.active=default"]`.

**COPY vs ADD** — domyślnie `COPY`. `ADD` dodatkowo rozpakowuje archiwa i pobiera z URL-i, co zwykle jest niejawnym zachowaniem, którego się nie chce.

**Kolejność warstw** — najpierw kopiuj manifesty zależności (`pom.xml`, `*.csproj`, `package.json`) i instaluj zależności, a kod źródłowy dopiero potem. Wtedy zmiana w kodzie nie unieważnia cache-a zależności.

**Szkielet multi-stage dla Spring Boot**

```dockerfile
FROM maven:3.9-eclipse-temurin-21 AS builder
WORKDIR /build
COPY pom.xml .
RUN mvn -B dependency:go-offline
COPY src ./src
RUN mvn -B clean package -DskipTests

FROM eclipse-temurin:21-jre-alpine
WORKDIR /app
COPY --from=builder /build/target/*.jar app.jar
EXPOSE 8080
ENTRYPOINT ["java", "-jar", "/app/app.jar"]
```

**Szkielet multi-stage dla .NET**

```dockerfile
FROM mcr.microsoft.com/dotnet/sdk:8.0 AS builder
WORKDIR /src
COPY *.sln .
COPY src/Api/*.csproj src/Api/
RUN dotnet restore
COPY . .
RUN dotnet publish src/Api -c Release -o /app/publish --no-restore

FROM mcr.microsoft.com/dotnet/aspnet:8.0
WORKDIR /app
COPY --from=builder /app/publish .
EXPOSE 8080
ENTRYPOINT ["dotnet", "Api.dll"]
```