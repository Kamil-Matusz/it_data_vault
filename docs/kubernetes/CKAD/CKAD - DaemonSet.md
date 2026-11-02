## Co to jest?

**DaemonSet** gwarantuje, że **dokładnie jedna kopia Poda działa na każdym node'cie** (lub na wybranym podzbiorze nodów).

```text
Node 1 ── Pod (log-agent)
Node 2 ── Pod (log-agent)
Node 3 ── Pod (log-agent)
   ↑
nowy node dolacza do klastra → DaemonSet automatycznie tworzy tam Poda
```

Nie ma pola `replicas` - liczbę Podów wyznacza liczba pasujących nodów.

Zobacz też: [[CKAD - Deployment]], [[CKAD - Pod]]

**Ćwiczenie:** brak manifestu w [[CKAD - Manifesty do ćwiczeń]] - do dopisania

---
## Kiedy używać?

| Zastosowanie | Przykład |
|---|---|
| Zbieranie logów | Fluentd, Filebeat, Promtail |
| Monitoring node'ów | node-exporter, Datadog agent |
| Sieć klastra (CNI) | Calico, Cilium, kube-proxy |
| Storage | Ceph, GlusterFS |
| Bezpieczeństwo | Falco, agenty antywirusowe |

| Potrzeba | Obiekt |
|---|---|
| N replik, gdziekolwiek | [[CKAD - Deployment]] |
| Jedna kopia na node | **DaemonSet** |
| Zadanie jednorazowe | [[CKAD - Job]] |

---
## Najważniejsze pola YAML

```yaml
apiVersion: apps/v1
kind: DaemonSet
metadata:
  name: log-agent
  namespace: kube-system
spec:
  # UWAGA: nie ma pola replicas

  selector:
    matchLabels:
      app: log-agent

  updateStrategy:
    type: RollingUpdate        # RollingUpdate (domyslne) | OnDelete
    rollingUpdate:
      maxUnavailable: 1
      maxSurge: 0

  template:
    metadata:
      labels:
        app: log-agent
    spec:
      nodeSelector:            # ogranicz do wybranych nodow
        disktype: ssd

      tolerations:             # pozwol dzialac takze na control-plane
      - key: node-role.kubernetes.io/control-plane
        operator: Exists
        effect: NoSchedule

      affinity:
        nodeAffinity:
          requiredDuringSchedulingIgnoredDuringExecution:
            nodeSelectorTerms:
            - matchExpressions:
              - key: kubernetes.io/os
                operator: In
                values: ["linux"]

      containers:
      - name: fluentd
        image: fluentd:v1.17
        resources:
          limits:
            memory: 200Mi
        volumeMounts:
        - name: varlog
          mountPath: /var/log
          readOnly: true

      volumes:
      - name: varlog
        hostPath:
          path: /var/log
```

### Jak ograniczyć zasięg

| Mechanizm | Efekt |
|---|---|
| `nodeSelector` | tylko nody z daną etykietą |
| `affinity.nodeAffinity` | bardziej złożone warunki |
| `tolerations` | pozwala wejść na nody z taintami (np. control-plane) |

---
## Najważniejsze komendy kubectl

```bash
# Brak komendy imperatywnej. Trik: wygeneruj Deployment i podmien kind
kubectl create deployment log-agent --image=fluentd \
  --dry-run=client -o yaml > ds.yaml
# nastepnie: kind: DaemonSet, usun spec.replicas i spec.strategy

kubectl get daemonsets
kubectl get ds -A
kubectl describe ds log-agent -n kube-system
kubectl get pods -l app=log-agent -o wide     # po jednym na node

# Rollout
kubectl rollout status ds/log-agent
kubectl rollout history ds/log-agent
kubectl rollout undo ds/log-agent
kubectl rollout restart ds/log-agent

# Etykiety nodow (sterowanie nodeSelector)
kubectl get nodes --show-labels
kubectl label node node01 disktype=ssd
kubectl label node node01 disktype-        # usuniecie etykiety

# Tainty
kubectl describe node node01 | grep -i taint
```

---
## Typowe pułapki egzaminacyjne

1. **Nie ma pola `replicas`** - wstawienie go kończy się błędem walidacji. To częsty błąd po skopiowaniu Deploymentu.
2. **Nie ma pola `strategy`** - DaemonSet używa `updateStrategy`.
3. **Pody nie pojawiają się na control-plane** - domyślny taint `node-role.kubernetes.io/control-plane:NoSchedule` wymaga tolerancji.
4. **`nodeSelector` nie pasuje do żadnego node'a** - DaemonSet powstanie z `DESIRED: 0`. Sprawdź `kubectl get nodes --show-labels`.
5. **Konwersja z Deploymentu** - po zmianie `kind` trzeba usunąć `spec.replicas` i `spec.strategy`, inaczej API odrzuci manifest.
6. **`DESIRED` kontra `CURRENT` kontra `READY`** w `kubectl get ds` - różnica wskazuje nody, na których Pod nie wstał.
7. **`hostPath` wymaga uprawnień** - przy restrykcyjnym Pod Security Standard Pod może nie wstać.
8. **DaemonSet w złym namespace** - agenty systemowe zwykle idą do `kube-system`; zadanie często to precyzuje.
9. **`maxSurge` domyślnie 0** - rolling update DaemonSetu najpierw usuwa stary Pod, dopiero potem tworzy nowy (krótka przerwa na node).
10. **`OnDelete` nie aktualizuje Podów automatycznie** - trzeba je skasować ręcznie, żeby wstały z nowym obrazem.
