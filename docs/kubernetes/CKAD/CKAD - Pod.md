## Co to jest?

**Pod** to najmniejsza jednostka wdrożeniowa w Kubernetesie. Opakowuje jeden lub więcej kontenerów, które dzielą:

- **sieć** - jeden adres IP, komunikacja przez `localhost`, wspólne porty (konflikt, gdy dwa kontenery słuchają na tym samym porcie),
- **wolumeny** - wspólny dysk do wymiany danych,
- **cykl życia** - startują i umierają razem.

> Kubernetes nigdy nie uruchamia kontenera bezpośrednio. Zawsze opakowuje go w Pod.

Zobacz też: [[Pod]] (notatka ogólna), [[CKAD - Deployment]], [[CKAD - Probes]], [[CKAD - SecurityContext]]

**Ćwiczenie:** `resourceLimit.yaml`, `yar-log.yaml` → [[CKAD - Manifesty do ćwiczeń#resourceLimit.yaml]]

---
## Kiedy używać?

| Sytuacja | Użyj |
|---|---|
| Jednorazowy test / debug | goły Pod |
| Aplikacja produkcyjna | [[CKAD - Deployment]] (Pod nie wstaje po śmierci node'a) |
| Zadanie jednorazowe | [[CKAD - Job]] |
| Kontener pomocniczy obok głównego | sidecar w tym samym Podzie |
| Przygotowanie danych przed startem | `initContainers` |

**Goły Pod na egzaminie** - tylko gdy zadanie wprost mówi "create a pod". W każdym innym wypadku kontroler.

---
## Najważniejsze pola YAML

```yaml
apiVersion: v1
kind: Pod
metadata:
  name: webapp
  labels:
    app: webapp
spec:
  restartPolicy: Always        # Always | OnFailure | Never
  serviceAccountName: app-sa
  nodeSelector:
    disktype: ssd

  initContainers:              # uruchamiane PO KOLEI, przed containers
  - name: init-db
    image: busybox:1.36
    command: ['sh', '-c', 'until nslookup db; do sleep 2; done']

  containers:
  - name: nginx
    image: nginx:1.27
    command: ["nginx"]         # = ENTRYPOINT w Dockerfile
    args: ["-g", "daemon off;"] # = CMD w Dockerfile
    ports:
    - containerPort: 80
    env:
    - name: MODE
      value: "prod"
    resources:
      requests:                # ile gwarantowane (scheduler patrzy na to)
        memory: "64Mi"
        cpu: "250m"
      limits:                  # twardy sufit (OOMKill przy przekroczeniu RAM)
        memory: "128Mi"
        cpu: "500m"
    volumeMounts:
    - name: data
      mountPath: /data

  volumes:
  - name: data
    emptyDir: {}
```

### Pola, które warto znać na pamięć

| Pole | Po co |
|---|---|
| `spec.containers[].command` / `args` | nadpisanie ENTRYPOINT / CMD |
| `spec.restartPolicy` | `Always` domyślnie; `Never`/`OnFailure` dla Jobów |
| `spec.nodeSelector` / `nodeName` | przypięcie do node'a |
| `spec.tolerations` | tolerowanie taintów |
| `spec.terminationGracePeriodSeconds` | czas na graceful shutdown (domyślnie 30) |
| `spec.hostNetwork` | Pod używa sieci node'a |

---
## Najważniejsze komendy kubectl

```bash
# Szkielet YAML - absolutna podstawa na CKAD
kubectl run nginx --image=nginx --dry-run=client -o yaml > pod.yaml

# Pod z portem i od razu Service
kubectl run nginx --image=nginx --port=80 --expose

# Pod z etykietami
kubectl run nginx --image=nginx --labels="app=web,tier=front"

# Pod z komendą (po --)
kubectl run busybox --image=busybox --restart=Never -- sleep 3600

# Pod z env
kubectl run nginx --image=nginx --env="MODE=prod"

# Jednorazowy Pod interaktywny (usuwa się po wyjściu)
kubectl run tmp --image=busybox --rm -it --restart=Never -- sh

# Podgląd / debug
kubectl get pods -o wide
kubectl describe pod nginx
kubectl logs nginx
kubectl logs nginx -c sidecar          # konkretny kontener
kubectl logs nginx --previous          # logi poprzedniej instancji po crashu
kubectl exec -it nginx -- sh
kubectl exec nginx -- env

# Dokumentacja pól - ratunek, gdy nie pamiętasz składni
kubectl explain pod.spec.containers --recursive | less
kubectl explain pod.spec.volumes.emptyDir

# Edycja działającego Poda (tylko nieliczne pola!)
kubectl edit pod nginx

# Podmiana Poda w całości
kubectl replace --force -f pod.yaml
```

---
## Typowe pułapki egzaminacyjne

1. **`--dry-run` bez `=client`** - stare `--dry-run` jest usunięte. Zawsze `--dry-run=client -o yaml`.
2. **`kubectl run` tworzy Pod, nie Deployment** - od 1.18 `kubectl run` robi goły Pod. Deployment to `kubectl create deployment`.
3. **Komenda po `--`** - `kubectl run busybox --image=busybox -- sleep 3600`. Bez `--` argumenty trafią do kubectl, nie do kontenera.
4. **Pod bez `restartPolicy: Never` wpada w CrashLoopBackOff** - gdy kontener kończy pracę (np. `echo hello`), domyślne `Always` restartuje go w kółko.
5. **Nie da się edytować istniejącego Poda** - zmienisz tylko `image`, `activeDeadlineSeconds`, `tolerations`, labels/annotations. Resztę: `kubectl replace --force -f` albo delete + create.
6. **`command` vs `args`** - `command` nadpisuje ENTRYPOINT, `args` nadpisuje CMD. Pomylenie = kontener nie startuje.
7. **Brak `requests` = Pod może wylądować gdziekolwiek**, a zadanie często wymaga konkretnych wartości - czytaj dokładnie.
8. **Dwa kontenery na tym samym `containerPort`** - konflikt, Pod nie wstanie poprawnie.
9. **initContainer, który nie kończy pracy** - blokuje start Poda na zawsze (status `Init:0/1`).
10. **Zapomniany `-n <namespace>`** - zadanie prawie zawsze podaje namespace. Ustaw kontekst: `kubectl config set-context --current --namespace=dev`.
