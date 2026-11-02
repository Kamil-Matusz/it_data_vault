## Co to jest?

**Deployment** to kontroler do zarządzania **bezstanowymi** aplikacjami. Nie zarządza Podami bezpośrednio - tworzy ReplicaSet, a ten dopiero Pody.

```text
Deployment
   ↓  (tworzy nowy przy każdej zmianie template)
ReplicaSet
   ↓
Pody
```

Deployment daje: deklaratywne aktualizacje, rolling update, rollback, skalowanie, samoleczenie.

Zobacz też: [[CKAD - Pod]], [[CKAD - Service]], [[CKAD - StatefulSet]]

**Ćwiczenie:** `strategy.yaml` → [[CKAD - Manifesty do ćwiczeń#strategy.yaml]]

---
## Kiedy używać?

| Sytuacja | Użyj |
|---|---|
| Aplikacja bezstanowa (API, frontend, worker) | **Deployment** |
| Aplikacja ze stabilną tożsamością i dyskiem (DB, Kafka) | [[CKAD - StatefulSet]] |
| Jeden Pod na każdym node, agent, log collector | [[CKAD - DaemonSet]] |
| Zadanie, które się kończy | [[CKAD - Job]] |

Domyślny wybór na egzaminie, gdy zadanie mówi "deploy an application".

---
## Najważniejsze pola YAML

```yaml
apiVersion: apps/v1
kind: Deployment
metadata:
  name: webapp
  labels:
    app: webapp
spec:
  replicas: 3
  revisionHistoryLimit: 10       # ile starych ReplicaSetow trzymac
  minReadySeconds: 5             # ile Pod musi byc Ready, by uznac go za zdrowy

  selector:                      # WYMAGANE i niezmienialne
    matchLabels:
      app: webapp

  strategy:
    type: RollingUpdate          # RollingUpdate (domyslne) | Recreate
    rollingUpdate:
      maxSurge: 25%              # ile Podow PONAD replicas
      maxUnavailable: 25%        # ile Podow moze brakowac

  template:                      # szablon Poda
    metadata:
      labels:
        app: webapp              # MUSI pasowac do selector.matchLabels
    spec:
      containers:
      - name: nginx
        image: nginx:1.27
        ports:
        - containerPort: 80
        resources:
          requests:
            cpu: 100m
            memory: 128Mi
```

### Hierarchia, którą trzeba mieć w palcach

```text
spec.replicas
spec.selector.matchLabels
spec.template.metadata.labels
spec.template.spec.containers[]
```

Dwa poziomy `metadata` i dwa poziomy `spec` - to najczęstsze źródło błędów YAML.

---
## Najważniejsze komendy kubectl

```bash
# Tworzenie
kubectl create deployment webapp --image=nginx --replicas=3
kubectl create deployment webapp --image=nginx --dry-run=client -o yaml > dep.yaml

# Skalowanie
kubectl scale deployment webapp --replicas=5
kubectl autoscale deployment webapp --min=2 --max=10 --cpu-percent=80

# Aktualizacja obrazu (rolling update)
kubectl set image deployment/webapp nginx=nginx:1.28
kubectl set resources deployment webapp -c=nginx --limits=cpu=200m,memory=512Mi
kubectl set env deployment/webapp MODE=prod

# Rollout
kubectl rollout status deployment/webapp
kubectl rollout history deployment/webapp
kubectl rollout history deployment/webapp --revision=2
kubectl rollout undo deployment/webapp
kubectl rollout undo deployment/webapp --to-revision=2
kubectl rollout restart deployment/webapp     # restart bez zmiany obrazu
kubectl rollout pause deployment/webapp
kubectl rollout resume deployment/webapp

# Wystawienie na zewnatrz
kubectl expose deployment webapp --port=80 --target-port=8080 --type=NodePort

# Podglad
kubectl get deploy,rs,pods -l app=webapp
kubectl describe deployment webapp
```

---
## Typowe pułapki egzaminacyjne

1. **`selector.matchLabels` różne od `template.metadata.labels`** - Deployment w ogóle się nie utworzy (`selector does not match template labels`).
2. **`selector` jest immutable** - nie zmienisz go przez `kubectl edit`. Trzeba usunąć i stworzyć od nowa.
3. **`kubectl edit deployment` działa**, w przeciwieństwie do Poda - zmiana `template` od razu wyzwala rolling update.
4. **`--record` już nie istnieje** - historia `CHANGE-CAUSE` wymaga adnotacji:
   `kubectl annotate deployment/webapp kubernetes.io/change-cause="image 1.28"`
5. **`rollout undo` wraca tylko do rewizji obecnych w historii** - przy `revisionHistoryLimit: 0` nie masz do czego wrócić.
6. **`Recreate` ubija wszystkie Pody naraz** - jeśli zadanie mówi "zero downtime", to `RollingUpdate`. **Na żywo:** `manifests/strategy.yaml` ma `Recreate` przy 4 replikach - przepisz na `RollingUpdate` z `maxSurge: 1` i `maxUnavailable: 0`, potem porównaj `kubectl get pods -w` podczas `kubectl set image`.
7. **`maxUnavailable: 0` razem z `maxSurge: 0`** = rollout stoi w miejscu na zawsze.
8. **Zmiana samego `replicas` nie tworzy nowej rewizji** - rewizję tworzy wyłącznie zmiana `spec.template`.
9. **`kubectl run` NIE tworzy Deploymentu** - użyj `kubectl create deployment`.
10. **Rollout "wisi"** - zwykle zły obraz (`ImagePullBackOff`) albo readinessProbe, która nigdy nie przechodzi. Sprawdź `kubectl rollout status` plus `describe` nowego Poda.
