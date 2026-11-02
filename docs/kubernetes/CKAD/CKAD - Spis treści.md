# CKAD - Spis treści

Notatki egzaminacyjne. Każda ma ten sam układ:
**Co to jest?** → **Kiedy używać?** → **Najważniejsze pola YAML** → **Najważniejsze komendy kubectl** → **Typowe pułapki egzaminacyjne**

Do tego **[[CKAD - Manifesty do ćwiczeń]]** - przewodnik po gotowych manifestach z labów, leżących w `CKAD/manifests/`. Każda notatka ma link do swojego pliku.

---
# Kolejność czytania

Kolejność nie jest alfabetyczna ani tematyczna - wynika z **zależności pojęciowych**. Każdy etap korzysta z tego, co było wcześniej, więc czytanie po kolei oszczędza cofanie się.

## Etap 1 - Rdzeń

> Bez tych trzech nic innego nie ma sensu. To 60% zadań na egzaminie.

| # | Notatka | Dlaczego teraz |
|---|---|---|
| 1 | [[CKAD - Pod]] | każdy inny obiekt to opakowanie na Pod; tu poznajesz `containers`, `volumes`, `resources` |
| 2 | [[CKAD - Deployment]] | pierwszy kontroler; wprowadza parę `selector` / `template`, która wraca wszędzie |
| 3 | [[CKAD - Service]] | Pod bez Service jest nieosiągalny; tu uczysz się myśleć etykietami |

## Etap 2 - Konfiguracja i zdrowie aplikacji

> Największa domena egzaminu (Application Environment, Configuration and Security - 25%).

| # | Notatka | Dlaczego teraz |
|---|---|---|
| 4 | [[CKAD - ConfigMap]] | trzy sposoby wstrzyknięcia danych do Poda: `env`, `envFrom`, volume |
| 5 | [[CKAD - Secret]] | ten sam mechanizm co ConfigMap plus base64 i typy - czytaj od razu po, różnice same wpadną w oko |
| 6 | [[CKAD - Probes]] | readiness steruje `Endpoints` z kroku 3, liveness restartami z kroku 2 - wcześniej nie byłoby czego podpiąć |

## Etap 3 - Wejście z zewnątrz

| # | Notatka | Dlaczego teraz |
|---|---|---|
| 7 | [[CKAD - Ingress]] | warstwa nad Service (krok 3), a TLS wymaga Secretu (krok 5) |
| 8 | [[CKAD - NetworkPolicy]] | dopiero gdy rozumiesz etykiety i ruch między Podami; najtrudniejszy temat składniowo |

## Etap 4 - Zadania, które się kończą

| # | Notatka | Dlaczego teraz |
|---|---|---|
| 9 | [[CKAD - Job]] | inny model niż Deployment: `restartPolicy`, `completions`, `backoffLimit` |
| 10 | [[CKAD - CronJob]] | to Job plus harmonogram - przed krokiem 9 byłby niezrozumiały |

## Etap 5 - Dane i pozostałe kontrolery

| # | Notatka | Dlaczego teraz |
|---|---|---|
| 11 | [[CKAD - PVC]] | trwały storage; wymaga pojęcia wolumenu z kroku 1 |
| 12 | [[CKAD - StatefulSet]] | składa się z PVC (11) i headless Service (3) - czytanie wcześniej nie ma sensu |
| 13 | [[CKAD - DaemonSet]] | prosty, ale wymaga pojęć node, taint, toleration |

## Etap 6 - Bezpieczeństwo

| # | Notatka | Dlaczego teraz |
|---|---|---|
| 14 | [[CKAD - ServiceAccount]] | tożsamość plus RBAC; korzysta z Secretów (5) |
| 15 | [[CKAD - SecurityContext]] | formalnie niezależne, ale najłatwiej zapamiętać na końcu, gdy manifesty są już w palcach |

---
## Graf zależności

```text
Pod (1)
 │
 ├─► Deployment (2) ──► DaemonSet (13)
 │
 ├─► Service (3) ──┬─► Ingress (7)  ◄── Secret (5), czyli TLS
 │                 ├─► NetworkPolicy (8)
 │                 └─► Probes (6)
 │
 ├─► ConfigMap (4) ──► Secret (5) ──► ServiceAccount (14)
 │
 ├─► Job (9) ──► CronJob (10)
 │
 ├─► PVC (11) ──► StatefulSet (12)  ◄── Service (3), czyli headless
 │
 └─► SecurityContext (15)
```

---
## Ścieżka skrócona

Gdy do egzaminu zostało kilka dni, a nie przerobiłeś całości:

1. **Etap 1 i 2 w całości** (notatki 1-6) - to fundament, bez niego reszta nie pomoże.
2. **[[CKAD - Job]] i [[CKAD - CronJob]]** - tanie punkty, mało materiału, wracają niemal zawsze.
3. **[[CKAD - SecurityContext]] i [[CKAD - ServiceAccount]]** - najbardziej punktowana domena.
4. **[[CKAD - NetworkPolicy]] i [[CKAD - Ingress]]** - trudniejsze, ale przewidywalne.
5. **[[CKAD - PVC]], [[CKAD - StatefulSet]], [[CKAD - DaemonSet]]** - jeśli zostanie czas.

Niezależnie od ścieżki: sekcję **Typowe pułapki egzaminacyjne** przeczytaj we wszystkich 15 notatkach. To najkrótsza droga do punktów.

---
## Drugie czytanie

Za pierwszym razem idź po kolei. Za drugim czytaj **tylko dwie ostatnie sekcje** każdej notatki (komendy plus pułapki) i rób zadania w klastrze - gotowe manifesty masz w [[CKAD - Manifesty do ćwiczeń]]. Teoria się nie zmieni, a prędkość pisania manifestów decyduje o zdaniu - na 2 godziny przypada 15-20 zadań.

---
# Układ tematyczny

## Workloads

- [[CKAD - Pod]] - atomowa jednostka, współdzielona sieć i wolumeny
- [[CKAD - Deployment]] - bezstanowe aplikacje, rolling update, rollback
- [[CKAD - StatefulSet]] - stabilna tożsamość i własny dysk na replikę
- [[CKAD - DaemonSet]] - jeden Pod na każdym node
- [[CKAD - Job]] - zadanie, które ma się skończyć
- [[CKAD - CronJob]] - Job według harmonogramu cron

## Sieć

- [[CKAD - Service]] - stabilne IP i DNS dla zbioru Podów
- [[CKAD - Ingress]] - routing HTTP/HTTPS po hoście i ścieżce
- [[CKAD - NetworkPolicy]] - firewall na poziomie Podów

## Konfiguracja i dane

- [[CKAD - ConfigMap]] - konfiguracja jawnym tekstem
- [[CKAD - Secret]] - dane wrażliwe, base64, typy
- [[CKAD - PVC]] - trwały storage, PV i binding

## Bezpieczeństwo i niezawodność

- [[CKAD - ServiceAccount]] - tożsamość aplikacji plus RBAC
- [[CKAD - SecurityContext]] - UID, capabilities, fsGroup
- [[CKAD - Probes]] - liveness, readiness, startup

---
## Niezbędnik na egzamin

```bash
# Aliasy i autouzupelnianie - zrob to w pierwszej minucie
alias k=kubectl
export do="--dry-run=client -o yaml"
export now="--force --grace-period=0"
source <(kubectl completion bash)
complete -F __start_kubectl k

# Domyslny namespace - oszczedza -n przy kazdej komendzie
kubectl config set-context --current --namespace=dev

# Uzycie
k run nginx --image=nginx $do > pod.yaml
k delete pod nginx $now
```

### Vim pod YAML

```vim
:set expandtab
:set tabstop=2
:set shiftwidth=2
:set number
```

### Gdy nie pamiętasz składni

```bash
kubectl explain <zasob>.<sciezka> --recursive
kubectl explain pod.spec.containers.livenessProbe
kubectl <komenda> --help
```

Dozwolona dokumentacja: `kubernetes.io/docs`, `kubernetes.io/blog`.

---
## Czego brakuje tu jeszcze (poza zakresem tej serii)

Resource Quota / LimitRange, Multi-container patterns (sidecar, adapter, ambassador),
Helm, Kustomize, Canary deployment, Admission control, Custom Resource Definitions.

Zobacz też: [[Kubernetes - Spis treści]], [[Kubernetes Commands]]
