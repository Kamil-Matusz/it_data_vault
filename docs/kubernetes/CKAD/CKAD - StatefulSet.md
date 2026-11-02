## Co to jest?

**StatefulSet** zarządza aplikacjami **stanowymi**. W odróżnieniu od [[CKAD - Deployment]], którego Pody są wymienne i mają losowe nazwy, StatefulSet daje każdemu Podowi:

- **stabilną nazwę**: `db-0`, `db-1`, `db-2` (ordinal index),
- **stabilną nazwę DNS**: `db-0.db.default.svc.cluster.local`,
- **własny, trwały dysk**, który przeżywa restart i re-schedule,
- **uporządkowane** tworzenie, skalowanie i aktualizację.

```text
Deployment:   webapp-7d4b9c-xk2p9   (losowe, wymienne)
StatefulSet:  db-0, db-1, db-2      (stabilne, unikalne)
```

Zobacz też: [[CKAD - Deployment]], [[CKAD - Service]], [[CKAD - PVC]]

**Ćwiczenie:** brak manifestu w [[CKAD - Manifesty do ćwiczeń]] - do dopisania

---
## Kiedy używać?

| Aplikacja | Obiekt |
|---|---|
| API, frontend, worker bezstanowy | [[CKAD - Deployment]] |
| PostgreSQL, MySQL, MongoDB | **StatefulSet** |
| Kafka, Zookeeper, Elasticsearch, etcd | **StatefulSet** |
| Agent na każdym node | [[CKAD - DaemonSet]] |

Reguła: potrzebujesz **tożsamości** albo **własnego dysku na replikę** - StatefulSet. W pozostałych przypadkach Deployment.

---
## Najważniejsze pola YAML

```yaml
apiVersion: v1
kind: Service                  # Headless Service - WYMAGANY
metadata:
  name: db
spec:
  clusterIP: None              # to czyni go headless
  selector:
    app: db
  ports:
  - port: 5432
---
apiVersion: apps/v1
kind: StatefulSet
metadata:
  name: db
spec:
  serviceName: db              # MUSI wskazywac na headless Service
  replicas: 3
  podManagementPolicy: OrderedReady   # OrderedReady | Parallel

  updateStrategy:
    type: RollingUpdate        # RollingUpdate | OnDelete
    rollingUpdate:
      partition: 0             # aktualizuj tylko Pody o indeksie >= partition

  selector:
    matchLabels:
      app: db

  template:
    metadata:
      labels:
        app: db
    spec:
      containers:
      - name: postgres
        image: postgres:16
        ports:
        - containerPort: 5432
          name: pg
        volumeMounts:
        - name: data
          mountPath: /var/lib/postgresql/data

  volumeClaimTemplates:        # osobny PVC dla KAZDEJ repliki
  - metadata:
      name: data
    spec:
      accessModes: ["ReadWriteOnce"]
      storageClassName: standard
      resources:
        requests:
          storage: 5Gi
```

### Czym różni się od Deploymentu

| Pole | Deployment | StatefulSet |
|---|---|---|
| `serviceName` | brak | **wymagane** |
| `volumeClaimTemplates` | brak | jest |
| `strategy` / `updateStrategy` | `strategy` | `updateStrategy` |
| Nazwy Podów | losowe | `<name>-<ordinal>` |
| Kolejność | równolegle | 0, 1, 2... po kolei |

Powstałe PVC: `data-db-0`, `data-db-1`, `data-db-2`.

---
## Najważniejsze komendy kubectl

```bash
# Brak komendy imperatywnej - zawsze YAML
kubectl apply -f statefulset.yaml

kubectl get statefulsets
kubectl get sts
kubectl describe sts db
kubectl get pods -l app=db          # zobaczysz db-0, db-1, db-2
kubectl get pvc                     # data-db-0, data-db-1, data-db-2

# Skalowanie
kubectl scale sts db --replicas=5

# Rollout
kubectl rollout status sts/db
kubectl rollout history sts/db
kubectl rollout undo sts/db
kubectl rollout restart sts/db

# Usuniecie bez kasowania Podow
kubectl delete sts db --cascade=orphan

# Test DNS poszczegolnych replik
kubectl run tmp --image=busybox --rm -it --restart=Never -- nslookup db-0.db
```

---
## Typowe pułapki egzaminacyjne

1. **Brak headless Service** - `serviceName` musi wskazywać istniejący Service z `clusterIP: None`. Bez tego Pody nie dostaną stabilnego DNS.
2. **`serviceName` to osobne pole** - nie wystarczy, że Service istnieje; trzeba go wskazać w `spec.serviceName`.
3. **`updateStrategy`, nie `strategy`** - Deployment ma `strategy`, StatefulSet `updateStrategy`. Inne wartości: `RollingUpdate` i `OnDelete`.
4. **`volumeClaimTemplates` to lista, nie mapa** - i jest na poziomie `spec`, nie w `template`.
5. **PVC NIE są usuwane przy skalowaniu w dół ani przy kasowaniu StatefulSetu** - zostają celowo (dane). Trzeba je usunąć ręcznie.
6. **Skalowanie w dół idzie od najwyższego indeksu** - z 5 do 3 usuwa `db-4`, potem `db-3`.
7. **Rolling update idzie od najwyższego do najniższego** - odwrotnie niż tworzenie.
8. **Zablokowany Pod blokuje cały rollout** - przy `OrderedReady` jeden Pod w `CrashLoopBackOff` zatrzymuje wszystko. Obejście: `podManagementPolicy: Parallel`.
9. **DNS pojedynczej repliki to `<pod>.<service>.<ns>.svc.cluster.local`** - np. `db-0.db.prod.svc.cluster.local`.
10. **`volumeClaimTemplates` jest immutable** - nie zmienisz rozmiaru dysku przez edycję StatefulSetu.
