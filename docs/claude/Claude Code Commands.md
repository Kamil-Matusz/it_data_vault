# 🛠️ Claude Code – Lista Komend (Cheat Sheet)

---
## 🧠 Kontekst i Sesja

Zarządzanie pamięcią modelu i przebiegiem sesji.

|Komenda|Opis działania|Wskazówka|
|:--|:--|:--|
|**`/init`**|Inicjalizacja projektu|**Odpal to na starcie!** Tworzy plik `CLAUDE.md`. `CLAUDE_CODE_NEW_INIT=1` = tryb interaktywny|
|**`/memory`**|Edycja pamięci|Edytuje pliki `CLAUDE.md`, włącza/wyłącza auto-memory i pokazuje jej wpisy|
|**`/clear [nazwa]`**|Czyszczenie historii|Nowa rozmowa z pustym kontekstem. Nazwa = etykieta w pickerze `/resume`. Aliasy: `/reset`, `/new`|
|**`/compact [instr.]`**|Kompresja kontekstu|Skraca historię, ale **kontynuuje tę samą rozmowę** (inaczej niż `/clear`)|
|**`/context [all]`**|Wizualizacja zużycia|Kolorowa siatka + sugestie optymalizacji. `all` rozwija breakdown|
|**`/btw [pytanie]`**|Pytanie „na boku"|Nie zaśmieca kontekstu głównego zadania. Bez argumentu wraca do poprzednich odpowiedzi|
|**`/recap`**|Podsumowanie sesji|Jedno zdanie o tym, co się dzieje w tej sesji|
|**`/rewind`**|Cofnięcie do checkpointu|Cofa kod **i** rozmowę. Ratunek, gdy Claude pojechał w złą stronę|
|**`/insights`**|Analiza Twoich sesji|Obszary projektu, wzorce interakcji, punkty tarcia. **Uwaga: to nie koszty** — te są w `/usage`|
|**`/export [plik]`**|Eksport rozmowy|Zapis do pliku lub schowka|
|**`/copy [N]`**|Kopiuj odpowiedź|`/copy 2` = druga od końca. Przy blokach kodu pokazuje picker|
|**`/exit`**|Wyjście|Alias: `/quit`. W dołączonej sesji tła tylko odłącza — sesja leci dalej|

## 🔀 Wiele sesji i praca równoległa

Rozgałęzianie rozmów, sesje w tle, delegowanie zadań.

|Komenda|Opis działania|Szczegóły|
|:--|:--|:--|
|**`/resume`**|Powrót do rozmowy|Picker wcześniejszych konwersacji|
|**`/branch [nazwa]`**|Gałąź rozmowy|**Przełącza Cię** do kopii, oryginał zostaje (wracasz przez `/resume`)|
|**`/fork [prompt]`**|Kopia w tle|Kopiuje rozmowę do nowej sesji w tle, **Ty zostajesz tutaj**|
|**`/subtask`**|Zadanie dla subagenta|Wynik wraca do tej rozmowy|
|**`/background`**|Odłącz sesję do tła|Zwalnia terminal, sesja leci dalej. Monitoring: `claude agents`. Alias: `/bg`|
|**`/tasks`**|Lista zadań w tle|Łącznie z zakończonymi subagentami. Nie przerywa trwającej odpowiedzi|
|**`/teleport`**|Wciągnij sesję z weba|Sesja z przeglądarki → ten terminal|
|**`/remote-control`**|Sterowanie z claude.ai|Kontynuuj lokalną sesję z innego urządzenia / apki mobilnej|
|**`/goal [warunek]`**|Ustaw cel|Claude pracuje przez kolejne tury, aż warunek spełniony. `clear` / `stop` przerywa|

## 👀 Kod, review i workflow

Wszystko, co robisz przed shipowaniem.

|Komenda|Opis działania|Szczegóły|
|:--|:--|:--|
|**`/plan [opis]`**|Tryb planowania|Wejście w plan mode wprost z prompta, np. `/plan fix the auth bug`|
|**`/diff`**|Przeglądarka diffów|Uncommitted changes + diffy per tura. Strzałki lewo/prawo przełączają widoki|
|**`/code-review`**|🧩 Review diffa|Błędy poprawnościowe + uproszczenia. `--fix` nanosi poprawki, `--comment` wystawia komentarze w PR|
|**`/review`**|Szybki review PR-a|Jednoprzebiegowy, read-only, dla PR-a z GitHuba|
|**`/security-review`**|🧩 Audyt bezpieczeństwa|Skan diffa pod kątem luk. **Sprawdź, czy nie duplikuje Twojego skilla OWASP**|
|**`/simplify`**|Upraszczanie kodu|Powiązane z `/code-review`|
|**`/verify`**|🧩 Weryfikacja na żywo|Buduje i uruchamia apkę, żeby potwierdzić zmianę — bez zjeżdżania na testy/typecheck|
|**`/run`**|🧩 Uruchom apkę|Odpala i „przeklika" apkę, żeby zobaczyć działającą zmianę|
|**`/run-skill-generator`**|🧩 Przepis na uruchomienie|Zapisuje recepturę buildu/startu jako skill projektowy w `.claude/skills/run-<nazwa>/`|
|**`/batch <instrukcja>`**|🧩 Zmiany masowe|Rozbija pracę na 5–30 jednostek, subagent + worktree + testy + PR na każdą. Wymaga repo git|
|**`/autofix-pr`**|Auto-naprawa CI|Sesja w chmurze pilnuje PR-a i pushuje fixy przy failach CI / komentarzach. Wymaga `gh`|
|**`/loop [interwał]`**|🧩 Prompt w pętli|`/loop 5m check if the deploy finished`. Bez promptu → maintenance check lub `.claude/loop.md`. Alias: `/proactive`|
|**`/deep-research`**|🔄 Głęboki research|Fan-out wyszukiwań, cross-check źródeł, raport z cytowaniami|
|**`/dataviz [request]`**|🧩 Wykresy i dashboardy|Dobór formy wykresu, kolor wg roli, walidacja palety pod daltonizm i kontrast|
|**`/claude-api`**|🧩 Referencja API|Materiały do Claude API dla Twojego języka (Java, Python, C#, TS…). `migrate` = upgrade modelu w kodzie|

> 🧩 = **bundled skill** (prompt dla Claude'a, nie sztywna logika CLI) · 🔄 = **workflow** (fan-out na wielu subagentów, leci w tle)

## ⚙️ Konfiguracja i Narzędzia

Ustawienia techniczne, dostęp, limity.

|Komenda|Opis działania|Szczegóły|
|:--|:--|:--|
|**`/config [k=v]`**|Panel ustawień|Od v2.1.181 też bez UI: `/config thinking=false`, `/config theme=dark`. Alias: `/settings`|
|**`/model [model]`**|Wybór modelu|Zapisuje jako domyślny; `s` na wierszu = tylko ta sesja|
|**`/effort [poziom]`**|Poziom rozumowania|`low`, `medium`, `high`, `xhigh`, `max`, `ultracode`. Działa od razu, bez czekania na koniec tury|
|**`/fast [on\|off]`**|Fast mode|Szybki tryb odpowiedzi|
|**`/advisor [model]`**|Doradca|Drugi model konsultowany w kluczowych momentach. `opus`, `sonnet` lub pełne ID|
|**`/permissions`**|Zarządzanie uprawnieniami|Reguły allow / ask / deny wg scope'u. Alias: `/allowed-tools`|
|**`/add-dir <ścieżka>`**|Dodatkowy katalog|Daje dostęp do plików, ale **nie ładuje** większości configu z `.claude/` (wyjątek: skille)|
|**`/cd <ścieżka>`**|Zmiana katalogu roboczego|Zachowuje cache prompta — nowy `CLAUDE.md` dochodzi jako wiadomość|
|**`/skills`**|Menu skilli|`Space` przełącza widoczność, `Enter` zapisuje do `.claude/settings.local.json`|
|**`/reload-skills`**|Przeładuj skille|Re-skan katalogów bez restartu — **must-have przy pisaniu własnych skilli**|
|**`/plugin [subcmd]`**|Pluginy|`list`, `install`, `enable`, `disable`|
|**`/reload-plugins`**|Przeładuj pluginy|`--force` gdy zmiana unieważni cache prompta|
|**`/agents`**|Subagenci|⚠️ Od v2.1.198 tylko przypomnienie — twórz przez rozmowę lub edytuj `.claude/agents/`|
|**`/hooks`**|Podgląd hooków|Akcje odpalane przy zdarzeniach narzędziowych (tylko wgląd w konfigurację)|
|**`/mcp`**|Panel MCP|`reconnect <serwer>`, `enable`/`disable [serwer\|all]` działają bez otwierania dialogu|
|**`/ide`**|Integracje z IDE|Status i zarządzanie|
|**`/chrome`**|Claude in Chrome|Konfiguracja rozszerzenia|
|**`/keybindings`**|Skróty klawiszowe|Otwiera plik konfiguracyjny|
|**`/focus`**|Widok focus|Tylko ostatni prompt, jednolinijkowe podsumowanie narzędzi i finalna odpowiedź|
|**`/color [kolor]`**|Kolor prompt bara|Do rozróżniania kilku terminali. Bez argumentu = losowy|

## 🩺 Diagnostyka i Konto

|Komenda|Opis działania|Szczegóły|
|:--|:--|:--|
|**`/help`**|Pomoc|Pełna lista komend dostępnych w Twojej wersji|
|**`/doctor`**|🧩 Przegląd setupu|Zdrowie instalacji, nieużywane skille/MCP vs. ich koszt kontekstu, wolne hooki, trim `CLAUDE.md`. Alias: `/checkup`|
|**`/debug [opis]`**|🧩 Debug sesji|Włącza logowanie **od tego momentu** i analizuje log|
|**`/status`**|Status konta i systemu|Nie przerywa trwającej odpowiedzi|
|**`/usage`**|Zużycie i limity|Alias: `/cost`|
|**`/login`** / **`/logout`**|Konto Anthropic|Logowanie / wylogowanie|
|**`/release-notes`**|Changelog|Picker wersji; od v2.1.208 nie wchodzi do kontekstu rozmowy|
|**`/bug [opis]`**|Zgłoś buga|Wybierasz, ile historii dołączyć + ekran zgody. Alias: `/share`|
|**`/feedback`**|Feedback produktowy|Ten sam dialog co `/bug`|
|**`/privacy-settings`**|Prywatność|Tylko Pro / Max|
|**`/heapdump`**|Zrzut pamięci|⚠️ Zawiera całą rozmowę **i credentiale** — nie wysyłaj nikomu|
|**`/install-github-app`**|GitHub App|Opcjonalnie też workflow GitHub Actions i sekrety|
|**`/install-slack-app`**|Slack App|OAuth w przeglądarce|
|**`/desktop`**|Przejdź do desktopu|macOS/Windows + subskrypcja. Alias: `/app`|
|**`/mobile`**|QR do apki mobilnej|Aliasy: `/ios`, `/android`|
|**`/powerup`**|Mini-lekcje|Interaktywne demo funkcji CC|
|**`/upgrade`** / **`/passes`**|Plan / zaproszenia|`/upgrade` nie pokazuje się na Enterprise|
|**`/radio`**|Claude FM|Lo-fi w tle 🎧|

---

## 📌 Ważne: custom commands = skille

Custom commands zostały **scalone ze skillami**. `.claude/commands/deploy.md` i `.claude/skills/deploy/SKILL.md` dają to samo `/deploy` i działają identycznie — stare pliki nadal chodzą. Skille dodają jednak:

- katalog na pliki pomocnicze (skrypty, referencje, przykłady),
- frontmatter kontrolujący **kto** wywołuje (`disable-model-invocation`, `user-invocable`),
- automatyczne ładowanie przez Claude'a, gdy skill jest istotny dla zadania.

Gdzie mieszkają (nadpisywanie: **enterprise → personal → project**):

|Poziom|Ścieżka|Zasięg|
|:--|:--|:--|
|Personal|`~/.claude/skills/<nazwa>/SKILL.md`|Wszystkie projekty|
|Project|`.claude/skills/<nazwa>/SKILL.md`|Tylko ten projekt|
|Plugin|`<plugin>/skills/<nazwa>/SKILL.md`|Gdzie plugin włączony|

Przydatny frontmatter: `description` (po tym Claude decyduje, czy użyć), `allowed-tools` (pre-approve narzędzi na tę turę), `disable-model-invocation: true` (tylko ręcznie — dla `/deploy`, `/commit`), `context: fork` (odpal w subagencie), `paths` (aktywuj tylko dla pasujących plików), `effort`, `model`.

Dynamiczny kontekst: `` !`git diff HEAD` `` w treści skilla wykona komendę **przed** wysłaniem do Claude'a i wklei wynik. Dla wielolinijkowych — blok otwarty przez ` ```! `.

## 💡 Praktyczne wzorce

- **Nowe repo:** `/init` → `/memory` (dopieszcz `CLAUDE.md`) → `/mcp` → `/permissions`
- **Długa rozmowa:** `/context` żeby zobaczyć, co zajmuje miejsce → `/compact` (kontynuacja) albo `/clear` (nowe zadanie)
- **Przed pushem:** `/diff` → `/code-review --fix` → `/security-review`
- **Ryzykowna zmiana:** `/branch` przed, `/rewind` gdy się nie udało
- **Duża migracja:** `/plan` na rozpoznanie → `/batch` na wykonanie
- **Komenda w kolejce:** wysłana w trakcie odpowiedzi odpali się po turze — poza `/status`, `/tasks`, `/usage`, które działają natychmiast
- **Stackowanie skilli:** `/write-tests /fix-issue 123` ładuje oba i przekazuje `123` jako argument każdemu (do 6 skilli)