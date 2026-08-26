# MongoDB Shell – Lista Komend (Cheat Sheet)

### Połączenie i podstawy

```sh
### Uruchomienie serwera bazy danych
mongod

### Połączenie z lokalną instancją (domyślnie localhost:27017)
mongosh

### Połączenie z konkretnym hostem i portem
mongosh --host 127.0.0.1 --port 27017

### Połączenie przez connection string (od razu do wybranej bazy)
mongosh "mongodb://localhost:27017/shop"

### Połączenie z uwierzytelnieniem
mongosh "mongodb://user@localhost:27017/shop" --authenticationDatabase admin

### Połączenie z Atlasem
mongosh "mongodb+srv://cluster0.abcde.mongodb.net/shop" --username user

### Jednorazowe polecenie bez wchodzenia do shell-a
mongosh "mongodb://localhost:27017/shop" --eval "db.users.countDocuments()"

### Wyjście z sesji
exit
```

```js
// Pomoc ogólna
help

// Pomoc dla metod bazy danych
db.help()

// Pomoc dla metod kolekcji (kolekcja nie musi istnieć)
db.users.help()

// Nazwa aktualnej bazy danych
db

// Wersja serwera
db.version()
```

### Bazy i kolekcje

```js
// Lista wszystkich baz na serwerze
show dbs
show databases

// Przełączenie na bazę (tworzy ją logicznie, fizycznie dopiero po pierwszym zapisie)
use shop

// Lista kolekcji w bieżącej bazie
show collections

// Lista użytkowników bieżącej bazy
show users

// Lista ról (własnych i wbudowanych) w bieżącej bazie
show roles

// Pięć ostatnich operacji trwających min. 1 ms (przy włączonym profilowaniu)
show profile

// Jawne utworzenie kolekcji
db.createCollection("orders")

// Utworzenie kolekcji ograniczonej rozmiarem (capped)
db.createCollection("logs", { capped: true, size: 1048576, max: 5000 })

// Usunięcie kolekcji
db.orders.drop()

// Usunięcie bieżącej bazy danych
db.dropDatabase()

// Statystyki bazy i kolekcji
db.stats()
db.users.stats()
```

### Tworzenie dokumentów

```js
// Wstawienie jednego dokumentu
db.users.insertOne({ name: "Chris", age: 24, place: "NYC" })

// Wstawienie wielu dokumentów (wymagane nawiasy kwadratowe)
db.users.insertMany([{ age: 24 }, { age: 38 }])

// Wstawienie wielu bez przerywania na pierwszym błędzie
db.users.insertMany([{ _id: 1 }, { _id: 1 }, { _id: 2 }], { ordered: false })

// Własny identyfikator zamiast wygenerowanego ObjectId
db.users.insertOne({ _id: "u-100", name: "Ola" })
```

### Odczyt dokumentów

```js
// Wszystkie dokumenty z kolekcji
db.users.find()

// Czytelne formatowanie wyniku
db.users.find().pretty()

// Pierwszy pasujący dokument
db.users.findOne({ name: "Chris" })

// Dokumenty pasujące do filtra
db.users.find({ place: "NYC" })

// Filtr po kilku polach (domyślnie AND)
db.users.find({ place: "NYC", age: 24 })

// Filtr po polu zagnieżdżonym
db.users.find({ "address.city": "Kraków" })

// Projekcja — tylko wybrane pola (_id zwracane domyślnie)
db.users.find({}, { status: 1, item: 1 })

// Projekcja z pominięciem _id
db.users.find({}, { status: 1, item: 1, _id: 0 })

// Projekcja odwrotna — wszystko poza wskazanymi polami
db.users.find({}, { password: 0, token: 0 })

// Wyszukanie po _id
db.users.find({ _id: ObjectId("5b2be413c06d924ab26ff9ca") })
```

### Operatory porównania

```js
// $eq — równe wskazanej wartości
db.users.find({ system: { $eq: "macOS" } })

// $ne — różne od wskazanej wartości
db.users.find({ place: { $ne: "NYC" } })

// $gt / $gte — większe / większe lub równe
db.users.deleteMany({ age: { $gt: 99 } })
db.users.updateMany({ age: { $gte: 21 } }, { $set: { access: "valid" } })

// $lt / $lte — mniejsze / mniejsze lub równe
db.users.deleteMany({ age: { $lt: 18 } })
db.users.updateMany({ age: { $lte: 17 } }, { $set: { access: "invalid" } })

// Przedział — dwa operatory na jednym polu
db.users.find({ age: { $gte: 18, $lte: 65 } })

// $in — dowolna z wartości w tablicy
db.users.find({ place: { $in: ["NYC", "SF"] } })

// $nin — żadna z wartości w tablicy
db.users.find({ place: { $nin: ["NYC", "SF"] } })

// $exists — dokumenty zawierające (lub nie) dane pole
db.users.find({ phone: { $exists: true } })

// $type — dokumenty, w których pole ma konkretny typ
db.users.find({ age: { $type: "string" } })

// $regex — dopasowanie wyrażeniem regularnym (i = ignorowanie wielkości liter)
db.users.find({ name: { $regex: "^chr", $options: "i" } })
```

### Operatory logiczne

```js
// $and — potrzebny, gdy to samo pole lub operator występuje wielokrotnie
db.users.find({ $and: [{ age: { $gt: 18 } }, { age: { $lt: 30 } }] })

// $or — spełniony dowolny z warunków
db.users.find({ $or: [{ place: "NYC" }, { age: { $lt: 18 } }] })

// $nor — żaden z warunków niespełniony
db.users.find({ $nor: [{ place: "NYC" }, { place: "SF" }] })

// $not — negacja operatora na polu
db.users.find({ age: { $not: { $gte: 18 } } })
```

### Aktualizacja dokumentów

```js
// Aktualizacja pierwszego pasującego dokumentu
db.users.updateOne({ age: 25 }, { $set: { age: 32 } })

// Aktualizacja wszystkich pasujących dokumentów
db.users.updateMany({ age: 27 }, { $inc: { age: 3 } })

// Aktualizacja wszystkich dokumentów w kolekcji
db.users.updateMany({}, { $set: { active: true } })

// Upsert — aktualizacja albo wstawienie, gdy nic nie pasuje
db.users.updateOne({ name: "Ola" }, { $set: { age: 30 } }, { upsert: true })

// Całkowite podmienienie dokumentu (bez _id)
db.users.replaceOne({ name: "Kris" }, { name: "Chris" })

// Aktualizacja ze zwróceniem dokumentu (domyślnie sprzed zmiany)
db.users.findOneAndUpdate({ name: "Ola" }, { $inc: { age: 1 } }, { returnDocument: "after" })
```

### Operatory aktualizacji pól

```js
// $set — ustawienie wartości pola
db.users.updateOne({ _id: 1 }, { $set: { name: "valid user" } })

// $unset — usunięcie pola z dokumentu
db.users.updateOne({ _id: 1 }, { $unset: { name: "" } })

// $inc — zwiększenie wartości o podaną liczbę (ujemna zmniejsza)
db.users.updateOne({ age: 22 }, { $inc: { age: 3 } })

// $min — podmienia wartość tylko wtedy, gdy nowa jest mniejsza
db.scores.insertOne({ _id: 1, highScore: 800, lowScore: 200 })
db.scores.updateOne({ _id: 1 }, { $min: { lowScore: 150 } })

// $max — podmienia wartość tylko wtedy, gdy nowa jest większa
db.scores.updateOne({ _id: 1 }, { $max: { highScore: 1000 } })

// $rename — zmiana nazwy pola
db.scores.updateOne({ _id: 1 }, { $rename: { highScore: "high" } })

// $currentDate — wstawienie bieżącej daty
db.users.updateOne({ _id: 1 }, { $currentDate: { updatedAt: true } })

// $mul — przemnożenie wartości pola
db.products.updateMany({}, { $mul: { price: 1.23 } })
```

### Operatory na tablicach

```js
// $push — dopisanie wartości do tablicy
db.users.updateMany({}, { $push: { friends: "Chris" } })

// $push z $each — dopisanie kilku wartości naraz
db.users.updateOne({ _id: 1 }, { $push: { friends: { $each: ["Ola", "Kris"] } } })

// $addToSet — dopisanie tylko wtedy, gdy wartości jeszcze nie ma
db.users.updateOne({ _id: 1 }, { $addToSet: { tags: "vip" } })

// $pull — usunięcie z tablicy wartości pasujących do warunku
db.users.updateOne({ _id: 1 }, { $pull: { friends: "Chris" } })

// $pop — usunięcie ostatniego (1) lub pierwszego (-1) elementu
db.users.updateOne({ _id: 1 }, { $pop: { friends: 1 } })

// Dokumenty, których tablica zawiera wskazaną wartość
db.users.find({ tags: "vip" })

// $all — tablica zawiera wszystkie wskazane wartości
db.users.find({ tags: { $all: ["vip", "pl"] } })

// $size — tablica o konkretnej długości
db.users.find({ tags: { $size: 3 } })

// $elemMatch — jeden element tablicy spełnia wszystkie warunki naraz
db.orders.find({ items: { $elemMatch: { qty: { $gt: 5 }, price: { $lt: 10 } } } })
```

### Usuwanie dokumentów

```js
// Usunięcie pierwszego pasującego dokumentu
db.users.deleteOne({ age: 37 })

// Usunięcie wszystkich pasujących dokumentów
db.users.deleteMany({ age: { $lt: 18 } })

// Wyczyszczenie kolekcji z dokumentów (indeksy zostają)
db.users.deleteMany({})

// Usunięcie kolekcji razem z indeksami — szybsze niż deleteMany({})
db.users.drop()
```

### Modyfikatory kursora

```js
// sort — sortowanie: 1 rosnąco, -1 malejąco
db.users.find().sort({ name: 1, age: -1 })

// limit — maksymalna liczba zwróconych dokumentów
db.users.find().limit(10)

// skip — pominięcie pierwszych N dokumentów
db.users.find().skip(20)

// Stronicowanie — sort + skip + limit
db.users.find().sort({ createdAt: -1 }).skip(20).limit(10)

// count — liczba dokumentów zwróconych przez kursor
db.users.find({ place: "NYC" }).count()

// Iteracja po kursorze
db.users.find().forEach(doc => print(doc.name))

// Zamiana kursora na tablicę
db.users.find().toArray()
```

### Zliczanie i wartości unikalne

```js
// Dokładna liczba dokumentów pasujących do filtra
db.users.countDocuments({ place: "NYC" })

// Liczba wszystkich dokumentów w kolekcji
db.users.countDocuments({})

// Szybka, przybliżona liczba dokumentów (z metadanych kolekcji)
db.users.estimatedDocumentCount()

// Unikalne wartości pola
db.users.distinct("age")

// Unikalne wartości pola z filtrem
db.users.distinct("age", { place: "NYC" })
```

### Agregacje

```js
// Pełny pipeline — filtr, grupowanie, sortowanie
db.users.aggregate([
  { $match: { access: "valid" } },
  { $group: { _id: "$cust_id", total: { $sum: "$amount" } } },
  { $sort: { total: -1 } }
])

// $match — filtrowanie dokumentów (jak najwcześniej w pipeline)
db.orders.aggregate([{ $match: { status: "PAID" } }])

// $group — grupowanie i agregaty ($sum, $avg, $min, $max)
db.orders.aggregate([
  { $group: { _id: "$customerId", orders: { $sum: 1 }, avg: { $avg: "$amount" } } }
])

// $group po całej kolekcji (_id: null)
db.orders.aggregate([{ $group: { _id: null, total: { $sum: "$amount" } } }])

// $project — wybór i przeliczenie pól
db.orders.aggregate([
  { $project: { _id: 0, customerId: 1, netto: { $divide: ["$amount", 1.23] } } }
])

// $unwind — rozbicie tablicy na osobne dokumenty
db.orders.aggregate([{ $unwind: "$items" }])

// $lookup — złączenie z inną kolekcją
db.orders.aggregate([
  { $lookup: { from: "users", localField: "customerId", foreignField: "_id", as: "customer" } }
])

// $sort, $skip, $limit w pipeline
db.orders.aggregate([{ $sort: { amount: -1 } }, { $skip: 10 }, { $limit: 5 }])

// $count — liczba dokumentów na danym etapie
db.orders.aggregate([{ $match: { status: "PAID" } }, { $count: "paid" }])

// Map-reduce (starsze podejście, dziś zastępowane pipeline-em)
db.orders.mapReduce(mapFn, reduceFn, { out: "results" })
```

### Indeksy

```js
// Indeks na jednym polu (1 rosnąco, -1 malejąco)
db.users.createIndex({ createdAt: 1 })

// Indeks złożony — kolejność pól ma znaczenie
db.users.createIndex({ place: 1, age: -1 })

// Indeks unikalny
db.users.createIndex({ email: 1 }, { unique: true })

// Indeks tekstowy do wyszukiwania pełnotekstowego
db.articles.createIndex({ title: "text", body: "text" })
db.articles.find({ $text: { $search: "mongodb index" } })

// Indeks TTL — dokumenty kasowane po podanym czasie
db.sessions.createIndex({ createdAt: 1 }, { expireAfterSeconds: 3600 })

// Indeks częściowy — tylko dla dokumentów spełniających warunek
db.users.createIndex({ email: 1 }, { partialFilterExpression: { active: true } })

// Lista indeksów kolekcji
db.users.getIndexes()

// Usunięcie wskazanego indeksu
db.users.dropIndex("createdAt_1")

// Usunięcie wszystkich indeksów poza _id
db.users.dropIndexes()

// Przebudowa wszystkich indeksów kolekcji
db.users.reIndex()

// Łączny rozmiar indeksów kolekcji
db.users.totalIndexSize()

// Plan wykonania zapytania — sprawdzenie, czy indeks jest używany
db.users.find({ email: "a@b.pl" }).explain("executionStats")
```

### Replikacja

```js
// Inicjalizacja replica set-u
rs.initiate()

// Dodanie kolejnego członka do replica set-u
rs.add("mongodbd4.example.net:27017")

// Dodanie arbitra (głosuje, nie przechowuje danych)
rs.addArb("mongodbd5.example.net:27017")

// Usunięcie członka po nazwie hosta
rs.remove("mongodbd4.example.net:27017")

// Bieżąca konfiguracja replica set-u
rs.conf()

// Status z perspektywy węzła, na którym uruchomiono polecenie
rs.status()

// Nadpisanie konfiguracji replica set-u
rs.reconfig(cfg)

// Degradacja primary do secondary i wymuszenie wyborów
rs.stepDown()

// Zgoda na odczyt z secondary w bieżącej sesji
rs.secondaryOk()
```

### Sharding

```js
// Włączenie shardingu dla bazy danych
sh.enableSharding("records")

// Dodanie shard-a do klastra
sh.addShard("cluster/mongodb3.example.net:27327")

// Włączenie shardingu dla kolekcji ze wskazanym kluczem
sh.shardCollection("records.users", { zipcode: 1 })

// Zmiana klucza shard-a (resharding)
sh.reshardCollection("records.users", { order_id: 1 })

// Wymuszenie zakończenia reshardingu (blokuje zapisy)
sh.commitReshardCollection("records.users")

// Przerwanie trwającego reshardingu
sh.abortReshardCollection("records.users")

// Rozszerzenie klucza shard-a o kolejne pole (wymaga indeksu)
db.getSiblingDB("test").orders.createIndex({ customer_id: 1, order_id: 1 })
db.adminCommand({ refineCollectionShardKey: "test.orders", key: { customer_id: 1, order_id: 1 } })

// Przeniesienie chunk-a na wskazany shard
sh.moveChunk("records.users", { zipcode: "10003" }, "shardexample")

// Podział chunk-a w konkretnym punkcie klucza
sh.splitAt("records.users", { x: 70 })

// Podział chunk-a w medianie
sh.splitFind("records.users", { x: 70 })

// Wyłączenie balancer-a dla pojedynczej kolekcji
sh.disableBalancing("records.users")

// Auto-split dla całego klastra
sh.enableAutoSplit()
sh.disableAutoSplit()

// Status klastra shardowanego
sh.status()

// Wartość zhaszowana klucza shard-a
convertShardKeyToHashed(ObjectId("5b2be413c06d924ab26ff9ca"))

// Pomoc dla metod sh
sh.help()
```

### Użytkownicy i role

```js
// Utworzenie użytkownika z rolami (hasło pytane interaktywnie)
db.createUser({ user: "app", pwd: passwordPrompt(), roles: [{ role: "readWrite", db: "shop" }] })

// Uwierzytelnienie w bieżącej bazie
db.auth("app", passwordPrompt())

// Zmiana hasła
db.changeUserPassword("app", passwordPrompt())

// Informacje o użytkowniku / wszystkich użytkownikach
db.getUser("app")
db.getUsers()

// Nadanie i odebranie ról
db.grantRolesToUser("app", [{ role: "read", db: "reports" }])
db.revokeRolesFromUser("app", [{ role: "read", db: "reports" }])

// Aktualizacja profilu użytkownika
db.updateUser("app", { roles: [{ role: "read", db: "shop" }] })

// Usunięcie użytkownika / wszystkich użytkowników bazy
db.dropUser("app")
db.dropAllUsers()

// Utworzenie i usunięcie roli własnej
db.createRole({ role: "reader", privileges: [], roles: [{ role: "read", db: "shop" }] })
db.dropRole("reader")
db.dropAllRoles()

// Informacje o rolach
db.getRole("reader")
db.getRoles()

// Uprawnienia i dziedziczenie ról
db.grantPrivilegesToRole("reader", [])
db.revokePrivilegesFromRole("reader", [])
db.grantRolesToRole("reader", [{ role: "read", db: "reports" }])
db.revokeRolesFromRole("reader", [{ role: "read", db: "reports" }])
db.updateRole("reader", { roles: [{ role: "read", db: "shop" }] })
```

### Diagnostyka i administracja

```js
// Dowolne polecenie na bieżącej bazie
db.runCommand({ ping: 1 })

// Polecenie na bazie admin
db.adminCommand({ listDatabases: 1 })

// Odwołanie do innej bazy bez zmiany kontekstu
db.getSiblingDB("admin").runCommand({ ping: 1 })

// Trwające operacje i ich zabijanie
db.currentOp()
db.killOp(12345)

// Statystyki serwera i połączeń
db.serverStatus()

// Włączenie profilowania (1 = wolniejsze niż slowms, 2 = wszystkie operacje)
db.setProfilingLevel(1, { slowms: 100 })
db.getProfilingStatus()

// Ostatnie wolne operacje z kolekcji profiler-a
db.system.profile.find().sort({ ts: -1 }).limit(5)
```

### Import, eksport i kopie zapasowe

```sh
### Zrzut binarny całej bazy
mongodump --uri "mongodb://localhost:27017/shop" --out ./dump

### Przywrócenie zrzutu binarnego
mongorestore --uri "mongodb://localhost:27017" ./dump

### Eksport kolekcji do JSON
mongoexport --uri "mongodb://localhost:27017/shop" --collection users --out users.json

### Eksport kolekcji do CSV z wybranymi polami
mongoexport --uri "mongodb://localhost:27017/shop" --collection users --type csv --fields name,age --out users.csv

### Import kolekcji z pliku JSON
mongoimport --uri "mongodb://localhost:27017/shop" --collection users --file users.json

### Import tablicy JSON z nadpisaniem istniejących dokumentów
mongoimport --uri "mongodb://localhost:27017/shop" --collection users --file users.json --jsonArray --mode upsert
```

### Notatki

**mongo vs mongosh** — `mongo` to stary shell, wycofany w MongoDB 6.0. Aktualnie używa się `mongosh`, instalowanego jako osobny pakiet, z pełnym nowoczesnym JavaScript-em.

**Baza i kolekcja powstają dopiero przy pierwszym zapisie** — `use shop` samo w sobie niczego nie tworzy, dopóki nie wstawi się pierwszego dokumentu.

**insertMany wymaga tablicy** — `db.users.insertMany([{...}, {...}])`. Bez nawiasów kwadratowych drugi obiekt jest traktowany jako `options`, a nie jako kolejny dokument.

**updateOne wymaga filtra** — pierwszy argument to zawsze filtr, drugi to operacja aktualizacji: `db.users.updateOne({ _id: 1 }, { $set: { ... } })`. Podanie samego `{ $set: ... }` kończy się błędem.

**updateOne vs replaceOne** — `updateOne` z `$set` zmienia tylko wskazane pola, `replaceOne` podmienia cały dokument, więc pola nieuwzględnione znikają. `_id` pozostaje bez zmian.

**$and jest potrzebny tylko przy kolizji kluczy** — `{ place: "NYC", age: 24 }` to już AND. Jawny `$and` przydaje się, gdy to samo pole lub ten sam operator ma wystąpić w kilku wyrażeniach.

**Projekcji nie miesza się** — w jednym zapytaniu albo same włączenia (`{ a: 1, b: 1 }`), albo same wyłączenia (`{ a: 0 }`). Wyjątkiem jest `_id`, które można wyłączyć razem z włączeniami.

**countDocuments vs estimatedDocumentCount** — pierwsze faktycznie liczy dokumenty pasujące do filtra, drugie czyta metadane kolekcji: jest natychmiastowe, ale przybliżone i nie przyjmuje filtra.

**$push to operator aktualizacji, nie kursora** — używa się go w `updateOne` / `updateMany`, a nie doklejając do `find()`.

**Kolejność w indeksie złożonym ma znaczenie** — indeks `{ place: 1, age: -1 }` obsłuży zapytania po `place` oraz po `place` + `age`, ale nie po samym `age`. Zasada ESR: najpierw pola porównywane równością (Equality), potem sortowanie (Sort), na końcu zakresy (Range).

**explain przed optymalizacją** — `.explain("executionStats")` pokazuje `COLLSCAN` (skan całej kolekcji) albo `IXSCAN` (użycie indeksu) oraz liczbę faktycznie zbadanych dokumentów.