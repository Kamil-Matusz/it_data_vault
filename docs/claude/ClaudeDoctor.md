# Claude Code - komenda `/doctor`

## Czym jest `/doctor`?

Czy znasz komendę w Claude Code, która w jednym przebiegu pomaga sprawdzić konfigurację i zidentyfikować potencjalne problemy?

To właśnie `/doctor`.

Uruchamia diagnostykę środowiska Claude Code, wskazuje problemy i — w zależności od rodzaju wykrytej usterki — może zaproponować działania naprawcze. Zmiany wymagające zatwierdzenia są wykonywane po uzyskaniu zgody użytkownika.

## Po co mi to?

Wyobraź sobie początek przygody z Claude Code. Zasypują Cię tysiące skillsów, pluginów i serwerów MCP. Instalujesz kolejne narzędzia, licząc na to, że pomogą Ci pracować szybciej i efektywniej.

Po kilku tygodniach możesz zauważyć, że:

- Claude Code działa wolniej.
- Zużycie tokenów rośnie.
- Limity wykorzystujesz szybciej, niż się spodziewasz.
- Konfiguracja staje się coraz trudniejsza do utrzymania.
- Część zainstalowanych narzędzi nie jest już potrzebna.

Przyczyną nie zawsze jest sama liczba pluginów czy skillsów. Problemem mogą być również błędy konfiguracji, niepotrzebne instrukcje, wolne hooki lub nieaktualna instalacja.

Właśnie dlatego warto regularnie sprawdzać stan środowiska za pomocą `/doctor`.

## Co sprawdza diagnostyka?

### 1. Instalacja

Sprawdza, czy instalacja Claude Code działa prawidłowo, czy system może odnaleźć polecenie oraz czy pliki konfiguracyjne są poprawnie odczytywane.

Przykładowy problem: Claude Code został zainstalowany na kilka sposobów, np. przez npm i instalator natywny, co może prowadzić do niejasności dotyczących używanej wersji.

### 2. Skille, pluginy i serwery MCP

Warto regularnie przeglądać zainstalowane narzędzia i usuwać te, które nie są już potrzebne.

Nie należy jednak zakładać, że każde nieużywane narzędzie zużywa dodatkowy kontekst przy każdej rozmowie. Wpływ zależy od sposobu jego ładowania i konfiguracji.

### 3. Wolne hooki

Hooki to mechanizmy uruchamiające skrypty automatycznie w odpowiedzi na określone zdarzenia.

Źle zoptymalizowany hook może wydłużać wykonywanie poleceń lub dodawać niepotrzebne opóźnienia do pracy z Claude Code.

### 4. Wersja Claude Code

Warto sprawdzić, czy korzystasz z aktualnej wersji i czy dostępna jest aktualizacja.

Nowsza wersja może zawierać poprawki błędów, usprawnienia wydajności i nowe funkcje.

### 5. Pliki `CLAUDE.md`

Pliki `CLAUDE.md` zawierają instrukcje przekazywane Claude Code. Z czasem mogą stać się zbyt rozbudowane, zawierać duplikaty lub informacje, które nie są już aktualne.

Dobrą praktyką jest:

- Usuwanie nieaktualnych instrukcji i duplikatów.
- Zachowywanie tylko informacji rzeczywiście potrzebnych modelowi.
- Przenoszenie rozbudowanych instrukcji do mniejszych plików.
- Korzystanie ze skillsów, gdy instrukcje powinny być ładowane na żądanie.

Celem jest ograniczenie zbędnego kontekstu i ułatwienie utrzymania konfiguracji.

**Uwaga:** nie należy zakładać, że `/doctor` automatycznie przeprowadzi wszystkie te optymalizacje. Zakres diagnostyki i dostępnych działań zależy od wersji narzędzia.

### 6. Uprawnienia

Warto przejrzeć ustawienia uprawnień i sposób zatwierdzania poleceń.

Automatyzacja może przyspieszyć pracę, ale nie należy bezrefleksyjnie zatwierdzać wszystkich operacji. Szczególnie ostrożnie trzeba podchodzić do poleceń modyfikujących pliki, usuwających dane lub wykonujących działania poza projektem.

## Jaki jest oczekiwany efekt?

Dobrze utrzymana konfiguracja może zapewnić:

- Mniej niepotrzebnych instrukcji w kontekście.
- Łatwiejsze zarządzanie pluginami, skillsami i MCP.
- Mniej problemów wynikających z błędnej konfiguracji.
- Krótszy czas wykonywania niektórych operacji.
- Większą kontrolę nad uprawnieniami i automatyzacją.

## Jak uruchomić `/doctor`?

1. Otwórz terminal.
2. Uruchom Claude Code.
3. Wpisz polecenie:
    ```
    /doctor
    ```
4. Zapoznaj się z wynikami diagnostyki.
5. Przed wprowadzeniem zmian sprawdź, co dokładnie ma zostać zmodyfikowane.

Nie traktuj wyniku diagnostyki jako gwarancji, że całe środowisko zostało zoptymalizowane. To narzędzie do wykrywania określonych problemów, a nie uniwersalny audyt wszystkich elementów konfiguracji.

## Dobra praktyka

Przed większymi zmianami w konfiguracji warto:

- Utworzyć kopię zapasową ważnych plików.
- Sprawdzić, które pluginy, skille i serwery MCP rzeczywiście wykorzystujesz.
- Przejrzeć globalny i projektowy `CLAUDE.md`.
- Weryfikować każdą proponowaną zmianę zamiast akceptować ją automatycznie.

**Wniosek:** `/doctor` to przydatny punkt wyjścia do diagnostyki Claude Code. Regularny przegląd konfiguracji pomaga utrzymać środowisko w dobrym stanie, ale rzeczywiste efekty zależą od wykrytych problemów i wprowadzonych zmian.