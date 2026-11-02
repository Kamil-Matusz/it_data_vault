## Co to jest?

**Probe** to okresowy test kondycji kontenera wykonywany przez kubelet. Są trzy rodzaje, o zupełnie różnych skutkach:

| Probe | Pytanie | Skutek porażki |
|---|---|---|
| **livenessProbe** | Czy kontener żyje? | **restart kontenera** |
| **readinessProbe** | Czy może przyjmować ruch? | **usunięcie z Endpoints Service'u** (bez restartu) |
| **startupProbe** | Czy już wystartował? | restart; **wstrzymuje** liveness i readiness do czasu sukcesu |

```text
start kontenera
   ↓
startupProbe  (dopoki nie przejdzie, reszta spi)
   ↓ sukces
livenessProbe + readinessProbe  (biegna rownolegle do konca zycia)
```

Zobacz też: [[CKAD - Pod]], [[CKAD - Deployment]], [[CKAD - Service]]

**Ćwiczenie:** `livenessProbe.yaml`, `readinessProbe.yaml` → [[CKAD - Manifesty do ćwiczeń#livenessProbe.yaml i readinessProbe.yaml]]

---
## Kiedy używać?

| Sytuacja | Probe |
|---|---|
| Aplikacja się zawiesza i trzeba ją restartować | **liveness** |
| Aplikacja potrzebuje chwili na rozgrzanie cache | **readiness** |
| Aplikacja czeka na bazę / zależność | **readiness** |
| Start trwa 2 minuty (stara aplikacja Java) | **startup** |
| Rolling update bez błędów 502 | **readiness** (obowiązkowo) |

### Trzy mechanizmy sprawdzania

```yaml
httpGet:                 # sukces: kod HTTP 200-399
  path: /healthz
  port: 8080
  httpHeaders:
  - name: Custom-Header
    value: Awesome

exec:                    # sukces: exit code 0
  command: ["cat", "/tmp/healthy"]

tcpSocket:               # sukces: udalo sie otworzyc polaczenie TCP
  port: 3306

grpc:                    # od k8s 1.27 stabilne
  port: 9000
```

---
## Najważniejsze pola YAML

```yaml
apiVersion: v1
kind: Pod
metadata:
  name: webapp
spec:
  containers:
  - name: app
    image: nginx:1.27
    ports:
    - containerPort: 80

    startupProbe:
      httpGet:
        path: /healthz
        port: 80
      failureThreshold: 30        # 30 x 10s = do 5 minut na start
      periodSeconds: 10

    livenessProbe:
      httpGet:
        path: /healthz
        port: 80
      initialDelaySeconds: 15     # odczekaj przed pierwszym testem
      periodSeconds: 10           # co ile sekund testowac
      timeoutSeconds: 1           # ile czekac na odpowiedz
      failureThreshold: 3         # ile porazek przed akcja
      successThreshold: 1         # dla liveness MUSI byc 1

    readinessProbe:
      exec:
        command: ["sh", "-c", "test -f /tmp/ready"]
      initialDelaySeconds: 5
      periodSeconds: 5
      failureThreshold: 3
      successThreshold: 1         # ile sukcesow, by znow byc Ready
```

### Parametry czasowe - wartości domyślne

| Pole | Domyślnie | Minimum |
|---|---|---|
| `initialDelaySeconds` | 0 | 0 |
| `periodSeconds` | 10 | 1 |
| `timeoutSeconds` | 1 | 1 |
| `failureThreshold` | 3 | 1 |
| `successThreshold` | 1 | 1 (dla liveness/startup tylko 1) |

Czas do restartu w przybliżeniu:
`initialDelaySeconds + periodSeconds * failureThreshold`

---
## Najważniejsze komendy kubectl

```bash
# Brak komendy imperatywnej - probe dopisujesz do YAML

# Podglad konfiguracji
kubectl describe pod webapp | grep -A5 -i liveness
kubectl get pod webapp -o yaml | grep -A10 readinessProbe
kubectl explain pod.spec.containers.livenessProbe
kubectl explain pod.spec.containers.readinessProbe.httpGet

# Diagnostyka
kubectl get pods                       # READY 0/1 = readiness nie przechodzi
kubectl describe pod webapp            # Events: "Liveness probe failed"
kubectl get events --sort-by=.lastTimestamp
kubectl logs webapp --previous         # logi sprzed restartu

# Czy Pod trafil do Service
kubectl get endpoints my-svc

# Reczny test endpointu zdrowia
kubectl exec webapp -- curl -s -o /dev/null -w "%{http_code}" localhost:80/healthz
kubectl exec webapp -- wget -qO- localhost:80/healthz
```

---
## Typowe pułapki egzaminacyjne

1. **Liveness restartuje, readiness odłącza od Service** - to podstawowe rozróżnienie i najczęstsze pytanie.
2. **Za krótki `initialDelaySeconds` przy liveness** = nieskończony CrashLoopBackOff. Aplikacja nie zdąży wstać przed pierwszym testem. **Na żywo:** `manifests/livenessProbe.yaml` ma `APP_START_DELAY: "80"` i `initialDelaySeconds: 80` - zbij tę drugą wartość do 5 i zobacz CrashLoopBackOff.
3. **`successThreshold` dla liveness i startup musi wynosić 1** - inna wartość to błąd walidacji.
4. **READY 0/1 przy statusie Running** - to readiness, nie liveness. Pod działa, ale nie dostaje ruchu.
5. **Pusty `Endpoints` Service'u** może wynikać z readinessProbe, nie z selektora. Sprawdź oba.
6. **`exec` z shellowymi konstrukcjami** - `command: ["sh", "-c", "test -f /tmp/ok"]`. Samo `["test -f /tmp/ok"]` nie zadziała, bo nie ma shella.
7. **`httpGet.port` może być nazwą portu** (`port: http`), o ile `ports[].name` jest zdefiniowane.
8. **Probe uderza w `localhost` kontenera** - nie da się sprawdzić zewnętrznego adresu ani innego Poda.
9. **startupProbe wstrzymuje pozostałe** - przy wolno startującej aplikacji to lepsze niż rozciąganie `initialDelaySeconds` liveness.
10. **Rolling update bez readinessProbe wysyła ruch do niegotowych Podów** - gdy zadanie mówi "no downtime", readiness jest obowiązkowa.
