# Redis – Lista Komend (Cheat Sheet)

### Połączenie i podstawy

```sh
### Uruchomienie serwera
redis-server

### Uruchomienie z własnym plikiem konfiguracyjnym
redis-server /etc/redis/redis.conf

### Połączenie z lokalną instancją (domyślnie localhost:6379)
redis-cli

### Połączenie z konkretnym hostem i portem
redis-cli -h 127.0.0.1 -p 6379

### Połączenie z hasłem i wyborem bazy
redis-cli -h 127.0.0.1 -p 6379 -a haslo -n 2

### Połączenie przez connection string
redis-cli -u redis://user:haslo@127.0.0.1:6379/0

### Jednorazowe polecenie bez wchodzenia do shell-a
redis-cli GET user:1:name

### Uwierzytelnienie w trwającej sesji (hasło albo użytkownik + hasło, Redis 6+)
AUTH haslo
AUTH default haslo

### Test połączenia
PING

### Odesłanie wiadomości (test kanału komunikacji)
ECHO "hello"

### Wybór bazy po indeksie (domyślnie 0-15)
SELECT 2

### Liczba kluczy w bieżącej bazie
DBSIZE

### Zamknięcie połączenia
QUIT
```

### Klucze

```sh
### Sprawdzenie istnienia klucza (przyjmuje wiele kluczy, zwraca liczbę trafień)
EXISTS user:1
EXISTS user:1 user:2

### Typ wartości pod kluczem
TYPE user:1

### Usunięcie klucza (blokujące)
DEL user:1
DEL user:1 user:2

### Usunięcie klucza w tle — zwalnianie pamięci poza głównym wątkiem
UNLINK user:1

### Klucze pasujące do wzorca — blokuje serwer, tylko do debugowania
KEYS user:*

### Bezpieczna iteracja po kluczach (kursor, w pętli aż do zwrócenia 0)
SCAN 0 MATCH user:* COUNT 100

### Iteracja ograniczona do typu
SCAN 0 MATCH * TYPE hash

### Iteracja po kluczach z poziomu shell-a (redis-cli sam obsługuje kursor)
redis-cli --scan --pattern 'user:*'

### Losowy klucz z bieżącej bazy
RANDOMKEY

### Zmiana nazwy klucza (nadpisuje cel)
RENAME user:1 user:100

### Zmiana nazwy tylko, gdy nowy klucz nie istnieje
RENAMENX user:1 user:100

### Kopia klucza
COPY user:1 user:1:backup

### Przeniesienie klucza do innej bazy
MOVE user:1 2

### Serializacja i odtworzenie klucza (0 = bez TTL)
DUMP user:1
RESTORE user:1:copy 0 "\x00\x03abc..."

### Przeniesienie klucza do innej instancji
MIGRATE 10.0.0.2 6379 user:1 0 5000

### Inspekcja wewnętrznej reprezentacji klucza
OBJECT ENCODING user:1
OBJECT REFCOUNT user:1
OBJECT IDLETIME user:1

### Zużycie pamięci przez klucz
MEMORY USAGE user:1

### Posortowana kopia listy / zbioru
SORT mylist
SORT mylist LIMIT 0 10 DESC
SORT mylist BY weight_* GET user:*->name STORE result
```

### Wygasanie kluczy

```sh
### Ustawienie TTL w sekundach
EXPIRE session:abc 3600

### TTL tylko wtedy, gdy klucz go jeszcze nie ma (NX) lub już ma (XX)
EXPIRE session:abc 3600 NX

### Ustawienie TTL w milisekundach
PEXPIRE session:abc 500

### Wygaśnięcie w konkretnym momencie (uniksowy timestamp w sekundach)
EXPIREAT session:abc 1735689600

### Wygaśnięcie w konkretnym momencie (timestamp w milisekundach)
PEXPIREAT session:abc 1735689600000

### Pozostały czas życia w sekundach (-1 = brak TTL, -2 = klucz nie istnieje)
TTL session:abc

### Pozostały czas życia w milisekundach
PTTL session:abc

### Zdjęcie TTL — klucz staje się trwały
PERSIST session:abc

### Odczyt z jednoczesnym ustawieniem lub zdjęciem TTL
GETEX session:abc EX 60
GETEX session:abc PERSIST
```

### Stringi

```sh
### Zapis i odczyt wartości
SET user:1:name "Ola"
GET user:1:name

### Zapis z czasem życia
SET session:abc token EX 3600
SETEX session:abc 3600 token

### Zapis z czasem życia w milisekundach
PSETEX session:abc 500 token

### Zapis tylko, gdy klucz nie istnieje (NX) lub tylko, gdy istnieje (XX)
SET lock:job1 worker-7 NX EX 30
SET user:1:name "Ola" XX

### Zapis z zachowaniem dotychczasowego TTL
SET user:1:name "Ola" KEEPTTL

### Zapis tylko, gdy klucz nie istnieje (starsza forma)
SETNX lock:job1 worker-7

### Zapis ze zwróceniem poprzedniej wartości
GETSET counter 0
SET counter 0 GET

### Odczyt z jednoczesnym usunięciem klucza
GETDEL session:abc

### Zapis i odczyt wielu kluczy naraz
MSET user:1:name "Ola" user:2:name "Kris"
MGET user:1:name user:2:name

### Zapis wielu kluczy tylko, gdy żaden z nich nie istnieje
MSETNX user:3:name "Ala" user:4:name "Ela"

### Dopisanie na końcu wartości
APPEND log:1 " kolejna linia"

### Długość wartości
STRLEN user:1:name

### Fragment wartości (indeksy włącznie, ujemne liczone od końca)
GETRANGE user:1:name 0 2

### Nadpisanie fragmentu wartości od podanego przesunięcia
SETRANGE user:1:name 0 "Ala"

### Liczniki — operacje atomowe
INCR page:views
INCRBY page:views 10
DECR page:views
DECRBY page:views 10
INCRBYFLOAT cart:total 19.99
```

### Operacje bitowe

```sh
### Ustawienie i odczyt pojedynczego bitu
SETBIT active:2026-08-26 1234 1
GETBIT active:2026-08-26 1234

### Liczba ustawionych bitów (opcjonalnie w zakresie bajtów)
BITCOUNT active:2026-08-26
BITCOUNT active:2026-08-26 0 10

### Pozycja pierwszego bitu o danej wartości
BITPOS active:2026-08-26 1

### Operacje logiczne na bitmapach z zapisem wyniku
BITOP AND dest src1 src2
BITOP OR dest src1 src2
BITOP XOR dest src1 src2
BITOP NOT dest src
```

### Hasze

```sh
### Ustawienie pola (jednym poleceniem można ustawić wiele pól)
HSET user:1 name "Ola"
HSET user:1 name "Ola" age 30 city "Kraków"

### Ustawienie pola tylko, gdy jeszcze nie istnieje
HSETNX user:1 name "Ola"

### Odczyt pojedynczego pola
HGET user:1 name

### Odczyt wielu pól
HMGET user:1 name age

### Wszystkie pola razem z wartościami
HGETALL user:1

### Same nazwy pól / same wartości
HKEYS user:1
HVALS user:1

### Liczba pól w haszu
HLEN user:1

### Sprawdzenie istnienia pola
HEXISTS user:1 name

### Długość wartości pola
HSTRLEN user:1 name

### Usunięcie pól
HDEL user:1 age
HDEL user:1 age city

### Liczniki w polach hasza
HINCRBY user:1 logins 1
HINCRBYFLOAT cart:1 total 19.99

### Bezpieczna iteracja po polach hasza
HSCAN user:1 0 MATCH addr:* COUNT 100
```

### Listy

```sh
### Dodanie na początek / koniec listy (przyjmuje wiele wartości)
LPUSH queue:jobs job1
RPUSH queue:jobs job2 job3

### Dodanie tylko, gdy lista już istnieje
LPUSHX queue:jobs job4
RPUSHX queue:jobs job5

### Zdjęcie elementu z początku / końca
LPOP queue:jobs
RPOP queue:jobs

### Zdjęcie kilku elementów naraz
LPOP queue:jobs 3

### Długość listy
LLEN queue:jobs

### Element po indeksie (-1 = ostatni)
LINDEX queue:jobs 0

### Zakres elementów (0 -1 = cała lista)
LRANGE queue:jobs 0 -1
LRANGE queue:jobs 0 9

### Nadpisanie elementu po indeksie
LSET queue:jobs 0 job9

### Wstawienie przed / po wskazanej wartości
LINSERT queue:jobs BEFORE job2 job1a
LINSERT queue:jobs AFTER job2 job2a

### Usunięcie wystąpień wartości (count > 0 od początku, < 0 od końca, 0 = wszystkie)
LREM queue:jobs 1 job1
LREM queue:jobs 0 job1

### Przycięcie listy do zakresu — reszta jest usuwana
LTRIM log:recent 0 99

### Przeniesienie elementu między listami (atomowe, Redis 6.2+)
LMOVE queue:jobs queue:processing LEFT RIGHT

### Starsza forma przeniesienia z końca na początek
RPOPLPUSH queue:jobs queue:processing

### Blokujące pobranie z listy (0 = czekaj bez limitu)
BLPOP queue:jobs 5
BRPOP queue:jobs 0

### Blokujące przeniesienie między listami
BLMOVE queue:jobs queue:processing LEFT RIGHT 5
BRPOPLPUSH queue:jobs queue:processing 5
```

### Zbiory

```sh
### Dodanie elementów
SADD tags:1 redis cache nosql

### Usunięcie elementów
SREM tags:1 nosql

### Wszystkie elementy zbioru
SMEMBERS tags:1

### Sprawdzenie przynależności
SISMEMBER tags:1 redis

### Sprawdzenie wielu elementów naraz (Redis 6.2+)
SMISMEMBER tags:1 redis cache

### Liczba elementów
SCARD tags:1

### Zdjęcie losowego elementu (usuwa go ze zbioru)
SPOP tags:1
SPOP tags:1 2

### Losowy element bez usuwania (ujemny count dopuszcza powtórzenia)
SRANDMEMBER tags:1
SRANDMEMBER tags:1 3

### Przeniesienie elementu do innego zbioru
SMOVE tags:1 tags:2 redis

### Różnica, część wspólna i suma zbiorów
SDIFF tags:1 tags:2
SINTER tags:1 tags:2
SUNION tags:1 tags:2

### To samo z zapisem wyniku pod wskazany klucz
SDIFFSTORE tags:diff tags:1 tags:2
SINTERSTORE tags:common tags:1 tags:2
SUNIONSTORE tags:all tags:1 tags:2

### Bezpieczna iteracja po elementach zbioru
SSCAN tags:1 0 MATCH re* COUNT 100
```

### Zbiory posortowane

```sh
### Dodanie elementów z wynikiem (score)
ZADD ranking 100 ola 80 kris

### Dodanie tylko nowych (NX) lub aktualizacja tylko istniejących (XX)
ZADD ranking NX 120 ola
ZADD ranking XX 120 ola

### Aktualizacja tylko, gdy nowy wynik jest większy (GT) lub mniejszy (LT)
ZADD ranking GT 150 ola

### Wynik elementu
ZSCORE ranking ola

### Zwiększenie wyniku
ZINCRBY ranking 10 ola

### Liczba elementów w zbiorze
ZCARD ranking

### Liczba elementów w zakresie wyników
ZCOUNT ranking 50 100
ZCOUNT ranking -inf +inf

### Pozycja elementu — rosnąco i malejąco (liczona od 0)
ZRANK ranking ola
ZREVRANK ranking ola

### Elementy w zakresie pozycji (0 -1 = wszystkie)
ZRANGE ranking 0 -1
ZRANGE ranking 0 9 WITHSCORES

### Elementy w zakresie pozycji, od najwyższego wyniku
ZRANGE ranking 0 9 REV WITHSCORES
ZREVRANGE ranking 0 9 WITHSCORES

### Elementy w zakresie wyników (Redis 6.2+ i starsza forma)
ZRANGE ranking 50 100 BYSCORE LIMIT 0 10
ZRANGEBYSCORE ranking 50 100 WITHSCORES LIMIT 0 10

### Zakres otwarty — nawias wyklucza wartość graniczną
ZRANGEBYSCORE ranking (50 +inf

### Zakres leksykograficzny (wymaga jednakowych wyników)
ZRANGE ranking [a [c BYLEX
ZRANGEBYLEX ranking [a [c LIMIT 0 10
ZLEXCOUNT ranking [a [c

### Usunięcie elementów
ZREM ranking kris

### Usunięcie zakresu wg pozycji, wyniku lub porządku leksykograficznego
ZREMRANGEBYRANK ranking 0 9
ZREMRANGEBYSCORE ranking -inf 50
ZREMRANGEBYLEX ranking [a [c

### Zdjęcie elementu o najniższym / najwyższym wyniku
ZPOPMIN ranking
ZPOPMAX ranking 3

### Część wspólna i suma z zapisem wyniku (numkeys = liczba kluczy źródłowych)
ZINTERSTORE dest 2 ranking:a ranking:b WEIGHTS 1 2
ZUNIONSTORE dest 2 ranking:a ranking:b AGGREGATE MAX

### Bezpieczna iteracja po elementach
ZSCAN ranking 0 MATCH o* COUNT 100
```

### Publish / Subscribe

```sh
### Nasłuchiwanie na kanale (blokuje połączenie)
SUBSCRIBE news

### Nasłuchiwanie na wzorcu kanałów
PSUBSCRIBE news:*

### Wysłanie wiadomości na kanał
PUBLISH news "nowy wpis"

### Rezygnacja z subskrypcji
UNSUBSCRIBE news
PUNSUBSCRIBE news:*

### Lista aktywnych kanałów i liczba subskrybentów
PUBSUB CHANNELS
PUBSUB NUMSUB news
```

### Transakcje

```sh
### Otwarcie transakcji, kolejkowanie poleceń i wykonanie
MULTI
SET user:1:name "Ola"
INCR user:1:version
EXEC

### Porzucenie zakolejkowanych poleceń
MULTI
SET user:1:name "Ola"
DISCARD

### Optymistyczna blokada — EXEC nie wykona się, gdy klucz zmieni się przed nim
WATCH user:1:version
MULTI
INCR user:1:version
EXEC

### Zdjęcie wszystkich obserwacji
UNWATCH
```

### Skrypty Lua

```sh
### Uruchomienie skryptu (numkeys = ile pierwszych argumentów to klucze)
EVAL "return redis.call('GET', KEYS[1])" 1 user:1:name

### Skrypt z kluczami i argumentami
EVAL "return redis.call('SET', KEYS[1], ARGV[1])" 1 user:1:name "Ola"

### Załadowanie skryptu do cache-u — zwraca hash SHA1
SCRIPT LOAD "return redis.call('GET', KEYS[1])"

### Uruchomienie skryptu z cache-u po hashu
EVALSHA 6b1bf486c81ceb7edf3c093f4c48582e38c0e791 1 user:1:name

### Sprawdzenie, czy skrypt jest w cache-u
SCRIPT EXISTS 6b1bf486c81ceb7edf3c093f4c48582e38c0e791

### Wyczyszczenie cache-u skryptów
SCRIPT FLUSH

### Zabicie działającego skryptu
SCRIPT KILL
```

### Serwer i diagnostyka

```sh
### Pełne informacje o serwerze i wybrane sekcje
INFO
INFO memory
INFO keyspace
INFO replication
INFO clients

### Odczyt i zmiana konfiguracji w locie
CONFIG GET maxmemory
CONFIG GET maxmemory-policy
CONFIG SET maxmemory-policy allkeys-lru

### Zapis bieżącej konfiguracji do pliku
CONFIG REWRITE

### Podgląd wszystkich poleceń trafiających do serwera (obciąża serwer)
MONITOR

### Wolne zapytania
SLOWLOG GET 10
SLOWLOG LEN
SLOWLOG RESET

### Podłączeni klienci i zabicie połączenia
CLIENT LIST
CLIENT ID
CLIENT KILL ID 42

### Zużycie pamięci
MEMORY USAGE user:1
MEMORY DOCTOR

### Statystyki i pomiary z poziomu shell-a
redis-cli --stat
redis-cli --latency
redis-cli --bigkeys

### Zapis migawki na dysk (SAVE blokuje serwer, BGSAVE działa w tle)
BGSAVE
SAVE
LASTSAVE

### Przebudowa pliku AOF w tle
BGREWRITEAOF

### Wyczyszczenie bieżącej bazy / wszystkich baz
FLUSHDB
FLUSHALL

### Wyczyszczenie w tle, bez blokowania serwera
FLUSHDB ASYNC

### Replikacja — podpięcie i odpięcie repliki
REPLICAOF 10.0.0.1 6379
REPLICAOF NO ONE

### Klaster — status, węzły i przypisanie klucza do slotu
CLUSTER INFO
CLUSTER NODES
CLUSTER KEYSLOT user:1

### Wersje poleceń i uprawnienia
COMMAND COUNT
ACL WHOAMI
ACL LIST
```

### Notatki

**KEYS blokuje serwer** - `KEYS *` przechodzi po całej przestrzeni kluczy w jednym, nieprzerywalnym kroku i na produkcji potrafi zatrzymać instancję na sekundy. Do przeglądania kluczy używa się `SCAN` (kursor, wiele małych kroków) albo `redis-cli --scan`.

**DEL vs UNLINK** - `DEL` zwalnia pamięć w głównym wątku, więc usunięcie dużej kolekcji blokuje serwer. `UNLINK` odpina klucz od przestrzeni nazw natychmiast, a pamięć zwalnia w tle.

**TTL jest własnością klucza, nie pola** - wygaśnięcie ustawia się na całym haszu czy liście, nie na pojedynczym polu. Osobne TTL-e dla pól hasza (`HEXPIRE`) pojawiły się dopiero w Redisie 7.4.

**Nadpisanie wartości kasuje TTL** - zwykły `SET` zdejmuje dotychczasowy czas życia klucza. Żeby go zachować, używa się `SET ... KEEPTTL`, a operacje w rodzaju `INCR` czy `APPEND` TTL-a nie ruszają.

**Blokada rozproszona to SET NX EX plus token** - `SET lock:job worker-7 NX EX 30`. Wartością powinien być losowy token, a zwolnienie blokady robi się skryptem Lua, który kasuje klucz tylko wtedy, gdy token się zgadza. Samo `DEL` grozi usunięciem cudzej blokady po wygaśnięciu własnej.

**HMSET i HMGET** - `HMSET` jest wycofany, bo `HSET` przyjmuje już wiele par pole-wartość. `HMGET` pozostaje aktualny.

**ZRANGE zastąpiło rodzinę ZRANGEBY\*** - od Redisa 6.2 jedno polecenie z modyfikatorami `BYSCORE`, `BYLEX` i `REV` obsługuje to, co wcześniej `ZRANGEBYSCORE`, `ZRANGEBYLEX`, `ZREVRANGE` i `ZREVRANGEBYSCORE`. Stare polecenia nadal działają, ale są oznaczone jako przestarzałe.

**Granice zakresów w zbiorach posortowanych** - `-inf` i `+inf` to zakres nieograniczony, a nawias wyklucza wartość graniczną: `(50` znaczy „więcej niż 50". W zakresach leksykograficznych `[` włącza wartość, `(` ją wyklucza, a `-` i `+` oznaczają skrajne końce.

**Transakcja to nie rollback** - `MULTI`/`EXEC` gwarantuje, że polecenia wykonają się razem i bez przeplotu, ale błąd jednego z nich nie wycofuje pozostałych. Warunkową zmianę realizuje się przez `WATCH` albo skrypt Lua, który z natury jest atomowy.

**Skrypty Lua deklarują klucze** - pierwszy argument po skrypcie to liczba kluczy; klucze trafiają do `KEYS`, reszta do `ARGV`. Trzymanie się tego jest wymogiem w trybie klastra, bo po tym rozpoznawane są sloty.

**W trybie klastra nie ma SELECT ani operacji na wielu slotach** - dostępna jest tylko baza 0, a polecenia obejmujące kilka kluczy (`MSET`, `SINTERSTORE`, `ZUNIONSTORE`) wymagają, żeby wszystkie klucze leżały w tym samym slocie. Wymusza się to hash tagiem: `user:{1}:name` i `user:{1}:age` trafią razem.

**RDB vs AOF** - RDB to okresowa migawka (`BGSAVE`), szybka do odtworzenia, ale gubi zapisy z okresu od ostatniego zrzutu. AOF to dziennik operacji, bezpieczniejszy przy awarii i wolniej się odtwarzający. W praktyce włącza się oba naraz.

**Polityka wypierania działa tylko z maxmemory** - bez ustawionego `maxmemory` Redis nie usuwa niczego samoczynnie i rośnie aż do limitu systemu. Dla cache-u typowe jest `maxmemory` plus `allkeys-lru`; dla trwałych danych `noeviction`, żeby zapisy zaczęły zwracać błąd zamiast po cichu kasować klucze.