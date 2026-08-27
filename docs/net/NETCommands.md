# .NET CLI – Lista Komend (Cheat Sheet)

### Tworzenie projektów

```sh
### Plik rozwiązania
dotnet new sln

### Rozwiązanie o wskazanej nazwie
dotnet new sln -n Todo

### Aplikacja konsolowa
dotnet new console

### Biblioteka klas
dotnet new classlib

### ASP.NET Core Web App (Model-View-Controller)
dotnet new mvc

### ASP.NET Core Web API
dotnet new webapi

### Projekt testowy
dotnet new xunit
dotnet new nunit
dotnet new mstest

### Usługa działająca w tle (Worker Service)
dotnet new worker

### Projekt z nazwą i katalogiem docelowym
dotnet new console -n Todo.Api -o src/Todo.Api

### Projekt pod konkretną wersję frameworka
dotnet new classlib -f net8.0

### Lista dostępnych szablonów
dotnet new list

### Pliki pomocnicze z szablonów
dotnet new gitignore
dotnet new editorconfig
dotnet new globaljson

### Instalacja i usunięcie szablonu z NuGeta
dotnet new install Microsoft.AspNetCore.SpaTemplates
dotnet new uninstall Microsoft.AspNetCore.SpaTemplates
```

### Rozwiązania

```sh
### Lista projektów w rozwiązaniu
dotnet sln list

### Dodanie projektu do rozwiązania
dotnet sln todo.sln add todo-app/todo-app.csproj

### Dodanie wielu projektów wzorcem (Linux/Unix)
dotnet sln todo.sln add **/*.csproj

### Usunięcie projektu z rozwiązania
dotnet sln todo.sln remove todo-app/todo-app.csproj

### Operacja na rozwiązaniu w bieżącym katalogu (nazwę można pominąć)
dotnet sln add src/Todo.Api/Todo.Api.csproj
```

### Pakiety i referencje

```sh
### Dodanie pakietu NuGet do projektu
dotnet add package Newtonsoft.Json

### Dodanie pakietu w konkretnej wersji
dotnet add package Newtonsoft.Json --version 13.0.3

### Dodanie pakietu do wskazanego projektu
dotnet add src/Todo.Api/Todo.Api.csproj package Serilog.AspNetCore

### Dodanie wersji przedpremierowej
dotnet add package Microsoft.EntityFrameworkCore --prerelease

### Usunięcie pakietu
dotnet remove package Newtonsoft.Json

### Dodanie referencji do innego projektu
dotnet add reference lib1/lib1.csproj lib2/lib2.csproj

### Dodanie referencji wzorcem (Linux/Unix)
dotnet add app/app.csproj reference **/*.csproj

### Usunięcie referencji
dotnet remove reference lib/lib.csproj

### Lista referencji projektu
dotnet list reference

### Lista pakietów projektu lub rozwiązania
dotnet list package

### Pakiety z nowszymi wersjami
dotnet list package --outdated

### Pakiety z opublikowanymi podatnościami
dotnet list package --vulnerable

### Pakiety wciągnięte pośrednio przez zależności
dotnet list package --include-transitive
```

### Budowanie

```sh
### Zbudowanie projektu razem z zależnościami
dotnet build

### Budowanie w konfiguracji Release
dotnet build --configuration Release
dotnet build -c Release

### Budowanie pod konkretny runtime
dotnet build --runtime linux-x64
dotnet build -r win-x64

### Budowanie pod konkretną wersję frameworka
dotnet build -f net8.0

### Budowanie bez przywracania pakietów (przyspiesza w CI po osobnym restore)
dotnet build --no-restore

### Traktowanie ostrzeżeń jako błędów
dotnet build -warnaserror

### Przekazanie właściwości MSBuild
dotnet build /p:Version=1.2.3

### Bardziej szczegółowy log budowania
dotnet build -v detailed

### Jawne przywrócenie pakietów (od .NET Core 2.0 wywoływane automatycznie)
dotnet restore

### Wyczyszczenie wyników budowania (katalogi obj i bin)
dotnet clean
dotnet clean --configuration Release
```

### Uruchamianie

```sh
### Uruchomienie projektu z bieżącego katalogu
dotnet run

### Uruchomienie wskazanego projektu
dotnet run --project ./projects/proj1/proj1.csproj

### Uruchomienie w konfiguracji Release
dotnet run -c Release

### Przekazanie argumentów do aplikacji (po --)
dotnet run -- --seed --verbose

### Wybór profilu z launchSettings.json
dotnet run --launch-profile Production

### Uruchomienie zbudowanej aplikacji zależnej od frameworka
dotnet myapp.dll

### Uruchomienie z automatycznym przeładowaniem po zmianie plików
dotnet watch
dotnet watch run
dotnet watch test
```

### Testy

```sh
### Uruchomienie testów z bieżącego katalogu lub rozwiązania
dotnet test

### Testy wskazanego projektu
dotnet test tests/Todo.Tests/Todo.Tests.csproj

### Testy bez ponownego budowania
dotnet test --no-build --no-restore

### Filtrowanie po nazwie
dotnet test --filter "FullyQualifiedName~Todo.Tests.OrderServiceTests"

### Filtrowanie po kategorii / traicie
dotnet test --filter "Category=Integration"
dotnet test --filter "Category!=Slow"

### Zapis wyników do pliku TRX
dotnet test --logger "trx;LogFileName=results.trx"

### Wyniki na konsoli ze szczegółami
dotnet test --logger "console;verbosity=detailed"

### Zbieranie pokrycia kodu
dotnet test --collect:"XPlat Code Coverage"

### Zatrzymanie po pierwszym niepowodzeniu
dotnet test --blame
```

### Publikowanie

```sh
### Publikacja do katalogu domyślnego
dotnet publish

### Publikacja wskazanego projektu
dotnet publish ~/projects/app1/app1.csproj

### Publikacja w Release do wskazanego katalogu
dotnet publish -c Release -o ./publish

### Publikacja zależna od frameworka pod konkretny runtime
dotnet publish -c Release -r linux-x64 --self-contained false

### Publikacja samodzielna (runtime dołączony do wyniku)
dotnet publish -c Release -r win-x64 --self-contained true

### Publikacja do jednego pliku wykonywalnego
dotnet publish -c Release -r linux-x64 /p:PublishSingleFile=true --self-contained true

### Publikacja z przycinaniem nieużywanego kodu
dotnet publish -c Release -r linux-x64 /p:PublishTrimmed=true --self-contained true

### Publikacja z prekompilacją ReadyToRun (szybszy start)
dotnet publish -c Release -r linux-x64 /p:PublishReadyToRun=true

### Publikacja z nadaniem wersji
dotnet publish -c Release /p:Version=1.2.3
```

Wynik `dotnet publish` jest gotowy do wgrania na serwer — zawiera aplikację razem z zależnościami i plikami konfiguracyjnymi.

### Pakiety NuGet

```sh
### Zbudowanie projektu i utworzenie paczki NuGet
dotnet pack

### Paczka bez ponownego budowania, do wskazanego katalogu
dotnet pack --no-build --output nupkgs

### Paczka z nadaniem wersji
dotnet pack /p:PackageVersion=2.1.0

### Paczka razem z symbolami
dotnet pack -c Release /p:IncludeSymbols=true /p:SymbolPackageFormat=snupkg

### Wypchnięcie paczki do domyślnego źródła
dotnet nuget push foo.nupkg -k 4003d786-cc37-4004-bfdf-c4f3e8ef9b3a

### Wypchnięcie do wskazanego źródła
dotnet nuget push foo.nupkg -k KLUCZ -s https://api.nuget.org/v3/index.json

### Usunięcie wersji pakietu ze źródła, bez pytań interaktywnych
dotnet nuget delete Microsoft.AspNetCore.Mvc 1.0 --non-interactive

### Ścieżki lokalnych katalogów cache-u
dotnet nuget locals -l all

### Wyczyszczenie cache-u pakietów
dotnet nuget locals all --clear

### Zarządzanie źródłami pakietów
dotnet nuget list source
dotnet nuget add source https://nuget.local/v3/index.json -n local
dotnet nuget remove source local
```

### Entity Framework Core

```sh
### Instalacja narzędzia dotnet-ef (globalnie lub lokalnie)
dotnet tool install --global dotnet-ef
dotnet tool install dotnet-ef

### Aktualizacja narzędzia
dotnet tool update --global dotnet-ef

### Pakiet wymagany w projekcie z DbContextem
dotnet add package Microsoft.EntityFrameworkCore.Design

### Nowa migracja
dotnet ef migrations add InitialCreate

### Migracja przy rozdzielonych projektach (model osobno, host osobno)
dotnet ef migrations add InitialCreate --project src/Todo.Infrastructure --startup-project src/Todo.Api

### Wskazanie kontekstu, gdy w projekcie jest ich kilka
dotnet ef migrations add InitialCreate --context TodoDbContext

### Lista migracji
dotnet ef migrations list

### Usunięcie ostatniej migracji (tylko jeśli nie została zastosowana)
dotnet ef migrations remove

### Skrypt SQL z migracji
dotnet ef migrations script

### Skrypt między dwiema migracjami
dotnet ef migrations script InitialCreate AddOrders

### Skrypt idempotentny — bezpieczny do puszczania na produkcji
dotnet ef migrations script --idempotent --output migrate.sql

### Aktualizacja bazy do najnowszej migracji
dotnet ef database update

### Aktualizacja do wskazanej migracji (nazwa wcześniejszej = wycofanie)
dotnet ef database update AddOrders

### Wycofanie wszystkich migracji
dotnet ef database update 0

### Usunięcie bazy danych
dotnet ef database drop
dotnet ef database drop --force

### Lista dostępnych typów DbContext
dotnet ef dbcontext list

### Informacje o kontekście (m.in. provider i connection string)
dotnet ef dbcontext info

### Wygenerowanie kontekstu i encji z istniejącej bazy (database first)
dotnet ef dbcontext scaffold "Server=.;Database=Todo;Trusted_Connection=True;TrustServerCertificate=True" Microsoft.EntityFrameworkCore.SqlServer -o Models

### Scaffold wybranych tabel z osobnym katalogiem na kontekst
dotnet ef dbcontext scaffold "..." Microsoft.EntityFrameworkCore.SqlServer -t Orders -t Customers --context-dir Data
```

### Narzędzia dotnet tool

```sh
### Instalacja narzędzia globalnie
dotnet tool install --global dotnet-format

### Instalacja narzędzia lokalnie (wymaga manifestu)
dotnet new tool-manifest
dotnet tool install dotnet-ef

### Lista zainstalowanych narzędzi
dotnet tool list --global
dotnet tool list

### Aktualizacja i odinstalowanie
dotnet tool update --global dotnet-ef
dotnet tool uninstall --global dotnet-ef

### Przywrócenie narzędzi lokalnych z manifestu (typowe w CI)
dotnet tool restore

### Uruchomienie narzędzia lokalnego
dotnet tool run dotnet-ef migrations list
```

### Formatowanie i konfiguracja

```sh
### Sformatowanie kodu wg .editorconfig
dotnet format

### Sprawdzenie formatowania bez zmiany plików (do CI)
dotnet format --verify-no-changes

### Sekrety użytkownika w projekcie ASP.NET Core
dotnet user-secrets init
dotnet user-secrets set "ConnectionStrings:Default" "Server=.;Database=Todo;"
dotnet user-secrets list
dotnet user-secrets remove "ConnectionStrings:Default"

### Certyfikat deweloperski HTTPS
dotnet dev-certs https --trust
dotnet dev-certs https --clean
```

### Informacje o SDK i środowisku

```sh
### Wersja SDK i pełne informacje o środowisku
dotnet --version
dotnet --info

### Zainstalowane SDK i runtime-y
dotnet --list-sdks
dotnet --list-runtimes

### Sprawdzenie wsparcia i aktualności zainstalowanych wersji
dotnet sdk check

### Przypięcie wersji SDK dla repozytorium
dotnet new globaljson --sdk-version 8.0.400

### Obciążenia (workloady), np. MAUI czy WASM
dotnet workload list
dotnet workload install wasm-tools

### Dokumentacja polecenia w przeglądarce
dotnet help build

### Pełny MSBuild
dotnet msbuild -t:Rebuild -p:Configuration=Release
```

### Zmienne środowiskowe

```sh
### Środowisko aplikacji (Development / Staging / Production)
DOTNET_ENVIRONMENT=Development
ASPNETCORE_ENVIRONMENT=Development

### Adresy, na których nasłuchuje aplikacja ASP.NET Core
ASPNETCORE_URLS=http://+:8080

### Katalog cache-u pakietów NuGet
NUGET_PACKAGES=/opt/nuget/packages

### Katalog instalacji .NET (gdy nie jest w domyślnej lokalizacji)
DOTNET_ROOT=/usr/share/dotnet

### Wyłączenie zbierania telemetrii przez narzędzia .NET
DOTNET_CLI_TELEMETRY_OPTOUT=1

### Ukrycie baneru powitalnego przy pierwszym uruchomieniu
DOTNET_NOLOGO=1

### Zachowanie przy braku dokładnie pasującej wersji runtime-u
DOTNET_ROLL_FORWARD=LatestMinor

### Język komunikatów CLI
DOTNET_CLI_UI_LANGUAGE=en
```

W PowerShellu ustawia się je przez `$env:ASPNETCORE_ENVIRONMENT = "Development"`, w bashu przez `export ASPNETCORE_ENVIRONMENT=Development`.

### Notatki

**restore dzieje się samo** - od .NET Core 2.0 `build`, `run`, `test`, `publish` i `pack` przywracają pakiety automatycznie. `dotnet restore` wywołuje się jawnie tylko po to, żeby potem puścić resztę z `--no-restore` - w CI to oszczędza kilka przebiegów po tych samych pakietach.

**Domyślna konfiguracja nie jest jednakowa** - `build` i `run` domyślnie budują w Debug, natomiast `publish` i `pack` od .NET 8 domyślnie używają Release. Przy starszych SDK `-c Release` przy publikacji trzeba podawać jawnie i tak najbezpieczniej jest robić zawsze.

**build vs publish vs pack** - `build` daje wynik do uruchomienia lokalnie (`bin/`), `publish` komplet plików gotowy do wgrania na serwer, a `pack` paczkę `.nupkg` do rejestru NuGet. Do wdrożenia nigdy nie kopiuje się zawartości `bin/`, tylko wynik `publish`.

**Zależny od frameworka vs samodzielny** - domyślnie aplikacja wymaga zainstalowanego runtime-u .NET na maszynie docelowej. `--self-contained true` razem z `-r <RID>` dokłada runtime do wyniku: paczka jest znacznie większa, ale nie ma zależności od tego, co stoi na serwerze. RID to identyfikator platformy, np. `win-x64`, `linux-x64`, `linux-musl-x64` (Alpine), `osx-arm64`.

**dotnet run to narzędzie deweloperskie** - buduje projekt przy każdym uruchomieniu i czyta `launchSettings.json`. Na produkcji uruchamia się opublikowaną aplikację: `dotnet myapp.dll` albo bezpośrednio plik wykonywalny.

**Argumenty po podwójnym myślniku** - wszystko przed `--` jest parametrem CLI, wszystko po nim trafia do aplikacji. `dotnet run --project X -- --verbose` uruchamia projekt X i przekazuje mu `--verbose`.

**dotnet ef wymaga dwóch rzeczy** - narzędzia `dotnet-ef` (globalnie albo lokalnie z manifestu) oraz pakietu `Microsoft.EntityFrameworkCore.Design` w projekcie. Przy podziale na warstwy `--project` wskazuje projekt z modelem i migracjami, a `--startup-project` ten, który ma konfigurację połączenia.

**Na produkcji skrypt, nie database update** - `dotnet ef migrations script --idempotent` generuje SQL, który sprawdza, czy dana migracja została już zastosowana, więc daje się puścić na dowolnym stanie bazy i przejrzeć przed wykonaniem. `database update` łączy się z bazą bezpośrednio i nadaje się do pracy lokalnej.

**migrations remove tylko przed zastosowaniem** - jeśli migracja trafiła już do bazy, trzeba najpierw cofnąć się do poprzedniej (`dotnet ef database update PoprzedniaMigracja`), a dopiero potem ją usuwać. Zastosowanych migracji nie edytuje się w miejscu — dokłada się kolejną.

**global.json przypina wersję SDK** - bez niego CLI bierze najnowszy zainstalowany SDK, co potrafi zmienić zachowanie budowania na innej maszynie. `dotnet new globaljson --sdk-version` zapisuje wersję dla całego repozytorium.

**Narzędzia lokalne zamiast globalnych** - manifest `.config/dotnet-tools.json` (tworzony przez `dotnet new tool-manifest`) trzyma wersje narzędzi razem z kodem, a `dotnet tool restore` odtwarza je w CI. Wersje globalne łatwo się rozjeżdżają między maszynami.

**Wzorce plików rozwiązuje powłoka** - `dotnet sln add **/*.csproj` działa tam, gdzie powłoka rozwija globbing (bash, zsh). W PowerShellu i cmd trzeba wypisać projekty albo wygenerować listę, np. `Get-ChildItem -Recurse -Filter *.csproj | ForEach-Object { dotnet sln add $_.FullName }`.

**Polecenia, których już nie ma** - `dotnet migrate` (konwersja projektów z .NET Core Preview 2) został wycofany, a `dotnet new -l` zastąpiło `dotnet new list`. Zmienna `DOTNET_MULTILEVEL_LOOKUP` przestała być używana od .NET 7, `DOTNET_ROLL_FORWARD_ON_NO_CANDIDATE_FX` zastąpiła `DOTNET_ROLL_FORWARD`.