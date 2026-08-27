# LINQ – Lista Komend (Cheat Sheet)

Każda sekcja pokazuje ten sam zapis w dwóch składniach: **zapytań** (`from ... where ... select`) i **metod** (lambdy). Kompilator i tak zamienia składnię zapytań na wywołania metod, więc jest to wyłącznie kwestia czytelności.

### Filtrowanie

```csharp
// Składnia zapytań
var col = from o in orders
          where o.CustomerID == 84
          select o;

// Składnia metod
var col2 = orders.Where(o => o.CustomerID == 84);

// Kilka warunków
var col3 = orders.Where(o => o.CustomerID == 84 && o.Cost > 100);

// Filtr z indeksem elementu (tylko składnia metod, tylko LINQ to Objects)
var col4 = orders.Where((o, i) => i % 2 == 0);

// Filtr po typie elementu
var col5 = items.OfType<Order>();
```

### Projekcja

```csharp
// Wybór pojedynczej właściwości
var names = from c in customers select c.Name;
var names2 = customers.Select(c => c.Name);

// Typ anonimowy
var col = from o in orders
          select new
          {
              OrderID = o.OrderID,
              Cost = o.Cost
          };

var col2 = orders.Select(o => new
{
    OrderID = o.OrderID,
    Cost = o.Cost
});

// Nazwy pól można pominąć, gdy pochodzą wprost z właściwości
var col3 = orders.Select(o => new { o.OrderID, o.Cost });

// Spłaszczenie kolekcji zagnieżdżonych
var lines = from o in orders
            from l in o.Lines
            select l;

var lines2 = orders.SelectMany(o => o.Lines);

// Spłaszczenie z dostępem do elementu nadrzędnego
var lines3 = orders.SelectMany(o => o.Lines, (o, l) => new { o.OrderID, l.Product });
```

### Sortowanie

```csharp
// Rosnąco (ascending jest domyślne i można je pominąć)
var col = from o in orders
          orderby o.Cost ascending
          select o;

var col2 = orders.OrderBy(o => o.Cost);

// Malejąco
var col3 = from o in orders
           orderby o.Cost descending
           select o;

var col4 = orders.OrderByDescending(o => o.Cost);

// Sortowanie po kilku kluczach
var col5 = from o in orders
           orderby o.CustomerID, o.Cost descending
           select o;

var col6 = orders.OrderBy(o => o.CustomerID)
                 .ThenByDescending(o => o.Cost);

// Odwrócenie kolejności elementów (bez klucza sortowania)
var col7 = orders.Reverse();
```

### Złączenia

```csharp
// Inner join
var col = from c in customers
          join o in orders on c.CustomerID equals o.CustomerID
          select new
          {
              c.CustomerID,
              c.Name,
              o.OrderID,
              o.Cost
          };

var col2 = customers.Join(orders,
    c => c.CustomerID,
    o => o.CustomerID,
    (c, o) => new
    {
        c.CustomerID,
        c.Name,
        o.OrderID,
        o.Cost
    });

// Left join — group join plus DefaultIfEmpty
var col3 = from c in customers
           join o in orders on c.CustomerID equals o.CustomerID into co
           from o in co.DefaultIfEmpty()
           select new { c.Name, Cost = (double?)o.Cost };

var col4 = customers.GroupJoin(orders,
        c => c.CustomerID,
        o => o.CustomerID,
        (c, co) => new { c, co })
    .SelectMany(x => x.co.DefaultIfEmpty(),
        (x, o) => new { x.c.Name, Cost = o?.Cost });

// Group join — do każdego klienta dopięta kolekcja jego zamówień
var col5 = from c in customers
           join o in orders on c.CustomerID equals o.CustomerID into co
           select new { c.Name, Orders = co };

// Cross join — każdy z każdym
var col6 = from c in customers
           from o in orders
           select new { c.Name, o.OrderID };

var col7 = customers.SelectMany(c => orders, (c, o) => new { c.Name, o.OrderID });

// Złączenie po kilku polach (klucz jako typ anonimowy)
var col8 = from c in customers
           join o in orders on new { c.CustomerID, c.Region } equals new { o.CustomerID, o.Region }
           select new { c.Name, o.OrderID };
```

### Grupowanie

```csharp
// Grupowanie z podliczeniem
var orderCounts = from o in orders
                  group o by o.CustomerID into g
                  select new
                  {
                      CustomerID = g.Key,
                      TotalOrders = g.Count()
                  };

var orderCounts2 = orders.GroupBy(o => o.CustomerID)
                         .Select(g => new
                         {
                             CustomerID = g.Key,
                             TotalOrders = g.Count()
                         });

// Grupowanie po kilku kluczach
var byCustomerAndStatus = orders.GroupBy(o => new { o.CustomerID, o.Status });

// Grupowanie z wyborem elementu — grupa zawiera same nazwy, nie całe obiekty
var namesByCity = customers.GroupBy(c => c.City, c => c.Name);

// Grupowanie z agregatami w jednym kroku
var stats = orders.GroupBy(o => o.CustomerID,
    (key, g) => new
    {
        CustomerID = key,
        Total = g.Sum(o => o.Cost),
        Max = g.Max(o => o.Cost)
    });

// Filtrowanie grup — where po into
var busy = from o in orders
           group o by o.CustomerID into g
           where g.Count() > 5
           orderby g.Count() descending
           select new { CustomerID = g.Key, Orders = g.Count() };
```

Klucz grupy jest tego samego typu co wartość, po której grupujemy — w przykładzie `g.Key` jest `int`-em, bo `o.CustomerID` jest `int`-em.

### Zmienne pomocnicze i zapytania złożone

```csharp
// let — wyliczona wartość dostępna dalej w zapytaniu
var col = from o in orders
          let vat = o.Cost * 0.23
          where vat > 100
          select new { o.OrderID, o.Cost, vat };

// into — kontynuacja zapytania na jego własnym wyniku
var col2 = from o in orders
           select new { o.OrderID, Netto = o.Cost / 1.23 }
           into projected
           where projected.Netto > 500
           select projected;
```

### Stronicowanie

```csharp
// Pierwsze 3 elementy
var col = (from o in orders
           where o.CustomerID == 84
           select o).Take(3);

var col2 = orders.Where(o => o.CustomerID == 84).Take(3);

// Pominięcie 2 pierwszych i pobranie kolejnych 2
var col3 = (from o in orders
            where o.CustomerID == 84
            orderby o.Cost
            select o).Skip(2).Take(2);

var col4 = orders.Where(o => o.CustomerID == 84)
                 .OrderBy(o => o.Cost)
                 .Skip(2)
                 .Take(2);

// Strona numer n przy rozmiarze strony pageSize
var page = orders.OrderBy(o => o.OrderID)
                 .Skip((n - 1) * pageSize)
                 .Take(pageSize);

// Zakres elementów (.NET 6+)
var col5 = orders.Take(2..5);

// Pobieranie i pomijanie dopóki warunek jest spełniony
var col6 = orders.TakeWhile(o => o.Cost < 100);
var col7 = orders.SkipWhile(o => o.Cost < 100);

// Ostatnie / bez ostatnich n elementów
var col8 = orders.TakeLast(3);
var col9 = orders.SkipLast(3);

// Podział na paczki po n elementów (.NET 6+)
var batches = orders.Chunk(100);
```

### Operatory elementów

```csharp
// Single — rzuca wyjątek, gdy elementów jest zero albo więcej niż jeden
var cust = (from c in customers
            where c.CustomerID == 84
            select c).Single();

var cust1 = customers.Single(c => c.CustomerID == 84);

// SingleOrDefault — null (lub default) zamiast wyjątku przy braku elementów
var cust2 = customers.SingleOrDefault(c => c.CustomerID == 84);

// First / FirstOrDefault — pierwszy pasujący element
var cust3 = customers.First(c => c.Region == "PL");
var cust4 = customers.FirstOrDefault(c => c.Region == "PL");

// Last / LastOrDefault — ostatni element posortowanej sekwencji
var cust5 = (from o in orders
             where o.CustomerID == 84
             orderby o.Cost
             select o).Last();

var cust6 = orders.Where(o => o.CustomerID == 84)
                  .OrderBy(o => o.Cost)
                  .Last();

// ElementAt / ElementAtOrDefault — element o wskazanym indeksie
var third = orders.ElementAt(2);
var third2 = orders.ElementAtOrDefault(2);

// Własna wartość domyślna zamiast default (.NET 6+)
var cust7 = customers.FirstOrDefault(c => c.Region == "PL", Customer.Unknown);

// DefaultIfEmpty — pusta sekwencja zamieniana na jednoelementową
var cust8 = customers.Where(c => c.CustomerID == 85)
                     .DefaultIfEmpty(new Customer())
                     .Single();

// Dla typu wartościowego brak elementów daje 0, a nie null
var id = customers.Where(c => c.CustomerID == 85)
                  .Select(c => c.CustomerID)
                  .SingleOrDefault();
```

`Single`, `First`, `Last` i `ElementAt` rzucają wyjątek dla pustej sekwencji. Warianty `*OrDefault` zwracają `default(T)`: `null` dla typu referencyjnego i typu nullable, ale `0` dla `int`, `false` dla `bool` i tak dalej — pustego wyniku nie da się wtedy odróżnić od realnego zera.

### Agregacje

```csharp
// Liczba elementów
var count = orders.Count();
var countFiltered = orders.Count(o => o.Cost > 100);
var bigCount = orders.LongCount();

// Suma, średnia, minimum, maksimum
var total = orders.Sum(o => o.Cost);
var avg = orders.Average(o => o.Cost);
var min = orders.Min(o => o.Cost);
var max = orders.Max(o => o.Cost);

// Element o najmniejszej / największej wartości klucza (.NET 6+)
var cheapest = orders.MinBy(o => o.Cost);
var priciest = orders.MaxBy(o => o.Cost);

// Własna agregacja z wartością początkową
var sum = orders.Aggregate(0.0, (acc, o) => acc + o.Cost);

// Sklejenie tekstu
var csv = customers.Aggregate("", (acc, c) => acc + c.Name + ";");
```

### Kwantyfikatory

```csharp
// Czy jest jakikolwiek element / element spełniający warunek
var any = orders.Any();
var anyBig = orders.Any(o => o.Cost > 1000);

// Czy wszystkie elementy spełniają warunek (pusta sekwencja zwraca true)
var allPaid = orders.All(o => o.IsPaid);

// Czy sekwencja zawiera wartość
var has = ids.Contains(84);

// Czy dwie sekwencje są identyczne co do elementów i kolejności
var same = first.SequenceEqual(second);
```

### Operacje na zbiorach

```csharp
// Elementy bez powtórzeń
var distinct = orders.Select(o => o.CustomerID).Distinct();

// Bez powtórzeń wg klucza, z zachowaniem całych obiektów (.NET 6+)
var distinctCustomers = orders.DistinctBy(o => o.CustomerID);

// Suma, część wspólna i różnica zbiorów
var union = first.Union(second);
var intersect = first.Intersect(second);
var except = first.Except(second);

// Te same operacje wg klucza (.NET 6+)
var unionBy = first.UnionBy(second, o => o.OrderID);
var intersectBy = first.IntersectBy(secondIds, o => o.OrderID);
var exceptBy = first.ExceptBy(secondIds, o => o.OrderID);

// Sklejenie sekwencji z zachowaniem duplikatów
var concat = first.Concat(second);

// Połączenie dwóch sekwencji parami
var zipped = names.Zip(costs, (n, c) => new { Name = n, Cost = c });
```

### Konwersje i materializacja

```csharp
// Tablica
string[] names = (from c in customers
                  select c.Name).ToArray();

// Lista
List<Order> ordersOver10 = (from o in orders
                            where o.Cost > 10
                            orderby o.Cost
                            select o).ToList();

// Słownik — klucz musi być unikalny
Dictionary<int, Customer> byId = customers.ToDictionary(c => c.CustomerID);

// Słownik z osobnym selektorem wartości
Dictionary<int, string> namesById = customers.ToDictionary(c => c.CustomerID, c => c.Name);

// Słownik zbudowany na grupowaniu
Dictionary<string, double> maxCostByCustomer =
    (from oc in (from o in orders
                 join c in customers on o.CustomerID equals c.CustomerID
                 select new { c.Name, o.Cost })
     group oc by oc.Name into g
     select g).ToDictionary(g => g.Key, g => g.Max(oc => oc.Cost));

// Lookup — jak słownik, ale dopuszcza wiele wartości pod jednym kluczem
ILookup<int, string> lookup = customers.ToLookup(c => c.CustomerID, c => c.Name);

// Zbiór
HashSet<int> ids = orders.Select(o => o.CustomerID).ToHashSet();

// Rzutowanie wszystkich elementów (rzuca wyjątek przy niezgodnym typie)
var cast = items.Cast<Order>();

// Wyłącznie elementy danego typu (reszta pomijana)
var onlyOrders = items.OfType<Order>();

// Przejście na wykonywanie w pamięci
var inMemory = query.AsEnumerable();
```

### Generowanie sekwencji

```csharp
// Zakres kolejnych liczb
var numbers = Enumerable.Range(1, 100);

// Powtórzona wartość
var zeros = Enumerable.Repeat(0, 10);

// Pusta sekwencja danego typu
var none = Enumerable.Empty<Order>();
```

### LINQ w Entity Framework Core

```csharp
// Materializacja asynchroniczna
var list = await db.Orders.Where(o => o.Cost > 100).ToListAsync();
var one = await db.Orders.FirstOrDefaultAsync(o => o.Id == id);
var count = await db.Orders.CountAsync(o => o.Status == OrderStatus.Pending);
var exists = await db.Orders.AnyAsync(o => o.CustomerId == customerId);

// Zapytanie tylko do odczytu — bez śledzenia zmian
var readOnly = await db.Orders.AsNoTracking().ToListAsync();

// Zapytanie, po którym zapisujemy zmiany — śledzenie włączone jawnie
var tracked = await db.Orders.AsTracking().FirstOrDefaultAsync(o => o.Id == id);

// Dociągnięcie powiązanych danych zamiast zapytania w pętli
var withItems = await db.Orders
    .Include(o => o.Items)
        .ThenInclude(i => i.Product)
    .ToListAsync();

// Kilka kolekcji naraz — osobne zapytania zamiast iloczynu kartezjańskiego
var split = await db.Orders
    .Include(o => o.Items)
    .Include(o => o.Payments)
    .AsSplitQuery()
    .ToListAsync();

// Wymuszenie pojedynczego zapytania, gdy globalnie ustawiony jest split
var single = await db.Orders.Include(o => o.Items).AsSingleQuery().ToListAsync();

// Projekcja do DTO — z bazy schodzą tylko potrzebne kolumny
var dto = await db.Orders
    .Select(o => new OrderDto(o.Id, o.Cost, o.Customer.Name))
    .ToListAsync();

// Filtr po zbiorze identyfikatorów zamiast zapytania w pętli
var byIds = await db.Orders.Where(o => ids.Contains(o.Id)).ToListAsync();

// Masowa aktualizacja i usuwanie bez wczytywania encji (EF Core 7+)
await db.Orders
    .Where(o => o.ExpiresAt < DateTimeOffset.UtcNow)
    .ExecuteUpdateAsync(s => s.SetProperty(o => o.Status, OrderStatus.Expired));

await db.Orders.Where(o => o.Status == OrderStatus.Cancelled).ExecuteDeleteAsync();

// Podgląd wygenerowanego SQL-a
var sql = db.Orders.Where(o => o.Cost > 100).ToQueryString();
```

### Notatki

**Odroczone wykonanie** - `Where`, `Select`, `OrderBy` i reszta operatorów pośrednich niczego nie liczą w momencie zapisania. Zapytanie wykonuje się dopiero przy iteracji albo przy wywołaniu operatora materializującego (`ToList`, `ToArray`, `Count`, `First`, `foreach`). Dwukrotne przejście po tej samej zmiennej to dwa wykonania zapytania - w EF Core dwa strzały do bazy. Jeśli wynik jest potrzebny więcej niż raz, materializuje się go do listy.

**IEnumerable vs IQueryable** - `IQueryable` buduje drzewo wyrażeń, które dostawca tłumaczy na SQL, więc filtr wykonuje się w bazie. `IEnumerable` działa w pamięci procesu. `AsEnumerable()` i `ToList()` przełączają na tryb w pamięci: wszystko po nich (również `Where`) liczy się już lokalnie, po ściągnięciu danych. Wywołanie `AsEnumerable()` za wcześnie potrafi zamienić zapytanie o dziesięć rekordów w pobranie całej tabeli.

**Single vs First** - `Single` sprawdza, że wynik jest dokładnie jeden, więc w bazie pobiera dwa wiersze, żeby wykryć nadmiar. `First` bierze pierwszy pasujący i przestaje szukać. Gdy klucz jest unikalny i wiadomo to z definicji, `First` jest szybszy; `Single` ma sens tam, gdzie duplikat jest błędem, który chcemy wykryć.

**Warianty OrDefault i typy wartościowe** - `default(T)` dla `int` to `0`, a nie `null`. Zapytanie o nieistniejący rekord zwracające `SingleOrDefault()` na polu `int` da `0` nieodróżnialne od prawdziwego zera. Dla typów wartościowych bezpieczniej jest projektować do `int?` albo używać `Any()` do sprawdzenia istnienia.

**Dwa orderby to nie to samo co ThenBy** - w składni zapytań kolejne `orderby` sortuje wynik od nowa i staje się kluczem głównym, a poprzednie sortowanie działa już tylko jako rozstrzygnięcie remisów (sortowanie w LINQ to Objects jest stabilne). Dlatego `orderby o.Cost descending` plus `orderby o.CustomerID` daje ten sam wynik co `orderby o.CustomerID, o.Cost descending`. W EF Core na tym polegać nie można - sortowanie w SQL nie jest stabilne, więc klucze dodatkowe podaje się jawnie przez `ThenBy`.

**Any zamiast Count** - `Count() > 0` przelicza całą sekwencję, `Any()` kończy pracę na pierwszym elemencie. W SQL to różnica między `COUNT(*)` a `EXISTS`.

**ToDictionary rzuca przy duplikatach** - klucz musi być unikalny, inaczej leci `ArgumentException`. Gdy pod jednym kluczem ma być wiele wartości, używa się `ToLookup` albo `GroupBy`.

**Skip i Take wymagają sortowania** - bez `OrderBy` kolejność wierszy zwracanych przez bazę jest niezdefiniowana, więc stronicowanie potrafi gubić i powtarzać rekordy między stronami. Klucz sortowania musi być jednoznaczny; jeśli nie jest, dokłada się `ThenBy` po identyfikatorze.

**Składnia zapytań nie obejmuje wszystkiego** - `Count`, `Any`, `Sum`, `Skip`, `Take`, `Distinct` i większość operatorów elementów nie mają odpowiednika w słowach kluczowych. Dlatego typowe jest zapytanie w nawiasach zakończone wywołaniem metody: `(from o in orders select o).Count()`.

**Typy anonimowe nie wychodzą poza metodę** - nadają się do pośrednich kroków zapytania, ale zwracane na zewnątrz wymagają `object` albo `dynamic`. Do zwracania wyniku używa się rekordu lub klasy DTO.

**W EF Core projektuj do DTO** - `Select` do rekordu ogranicza `SELECT` do potrzebnych kolumn i przy okazji wyłącza śledzenie zmian. Pobieranie całych encji tylko po to, żeby oddać dwa pola, obciąża bazę i pamięć.

**Nie każde zapytanie da się przetłumaczyć** - wywołanie własnej metody C# wewnątrz `Where` czy `Select` nie ma odpowiednika w SQL. EF Core 3.0 i nowsze zgłasza wtedy wyjątek zamiast po cichu pobierać całą tabelę i filtrować w pamięci. Dotyczy to też części kształtów `GroupBy` — grupowanie z projekcją inną niż agregaty często trzeba dokończyć po stronie klienta, świadomie, po `AsEnumerable()`.

**Zapytanie w pętli to N+1** - `foreach` po zamówieniach z `db.Customers.Find(...)` w środku to jedno zapytanie na iterację. Zamiast tego pobiera się dane jednym zapytaniem: `Include`, `Where(o => ids.Contains(o.Id))` albo złączeniem.

**AsSplitQuery przy wielu kolekcjach** - dwa `Include` na kolekcjach dają iloczyn kartezjański: dziesięć zamówień po dziesięć pozycji i dziesięć płatności to nie 10 + 10 wierszy, tylko 100. `AsSplitQuery()` rozbija to na osobne zapytania kosztem dodatkowych round-tripów.

**AsNoTracking domyślnie, AsTracking świadomie** - śledzenie zmian jest potrzebne tylko wtedy, gdy encja będzie modyfikowana i zapisywana. Przy `QueryTrackingBehavior.NoTracking` ustawionym globalnie zapis wymaga jawnego `Update()` albo zapytania z `AsTracking()` - inaczej `SaveChanges` nic nie zrobi i nie zgłosi błędu.