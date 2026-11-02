# CKAD - Manifesty do ćwiczeń

Rozwiązania labów (KodeKloud) skopiowane do `CKAD/manifests/`. Ten sam styl zadań, co na egzaminie, więc warto je czytać jako **wzorce odpowiedzi**, a nie tylko przykłady składni.

Każdy wpis mówi: czego plik uczy, do której notatki wraca i co w nim jest nieoczywiste.

```bash
# Aplikacja calego katalogu naraz
kubectl apply -f CKAD/manifests/

# Pojedynczo
kubectl apply -f CKAD/manifests/internal-policy.yaml
```

---
## Pokrycie materiału

| Notatka | Pliki | Status |
|---|---|---|
| [[CKAD - Pod]] | `yar-log.yaml`, `resourceLimit.yaml` | pośrednio |
| [[CKAD - Deployment]] | `strategy.yaml` | częściowo (tylko `Recreate`) |
| [[CKAD - Service]] | - | **brak** |
| [[CKAD - Ingress]] | `ingres.yaml`, `tls.yaml` | dobre |
| [[CKAD - ConfigMap]] | `configMap.yaml` | podstawy |
| [[CKAD - Secret]] | `secret.yaml` | podstawy |
| [[CKAD - PVC]] | `persistent-volume.yaml`, `storageClass.yaml`, `localPersistentStorage.yaml` | komplet |
| [[CKAD - Job]] | `job.yaml`, `more-jobs.yaml` | dobre |
| [[CKAD - CronJob]] | `cron.yaml` | dobre |
| [[CKAD - NetworkPolicy]] | `internal-policy.yaml` | bardzo dobre |
| [[CKAD - StatefulSet]] | - | **brak** |
| [[CKAD - DaemonSet]] | - | **brak** |
| [[CKAD - ServiceAccount]] | `serviceAccount.yaml` | **plik pusty** |
| [[CKAD - SecurityContext]] | `securityContext.yaml` | minimum |
| [[CKAD - Probes]] | `livenessProbe.yaml`, `readinessProbe.yaml` | bardzo dobre |

Poza serią: `labels.yaml` (ReplicaSet), `crd.yaml` (pusty).

---
# Przewodnik po plikach

## internal-policy.yaml

→ [[CKAD - NetworkPolicy]]

Najciekawszy plik w zestawie. Trzy rzeczy do wyłapania:

```yaml
  ingress:
    - {}                  # pusta regula = WPUSC WSZYSTKO
  egress:
  - to:                   # regula 1
    - podSelector:
        matchLabels:
          name: mysql
    ports:
    - protocol: TCP
      port: 3306
  - to:                   # regula 2 - osobny element listy, wiec OR
    - podSelector:
        matchLabels:
          name: payroll
    ports:
    - protocol: TCP
      port: 8080
  - ports:                # regula 3 - BRAK "to", wiec dowolny cel
    - port: 53
      protocol: UDP
    - port: 53
      protocol: TCP
```

1. **`ingress: - {}`** - pusta reguła oznacza "zezwól na wszystko przychodzące". To nie to samo co pominięcie sekcji `ingress`, które przy `policyTypes: [Ingress]` **blokuje wszystko**. Jeden z najbardziej mylących idiomów w całym Kubernetesie.
2. **Trzy osobne myślniki w `egress`** - trzy niezależne reguły łączone przez OR. Porównaj z sekcją AND/OR w notatce.
3. **Trzecia reguła nie ma `to`** - samo `ports` przepuszcza port 53 do dowolnego celu. To jest ten DNS, bez którego po `default-deny` nic nie rozwiąże nazw.

---
## livenessProbe.yaml i readinessProbe.yaml

→ [[CKAD - Probes]]

Te dwa pliki czytaj **razem** - różnią się jedną sekcją i właśnie w tej różnicy jest cała lekcja.

```yaml
    env:
    - name: APP_START_DELAY
      value: "80"            # aplikacja startuje 80 sekund
    readinessProbe:
      httpGet:
        path: /ready
        port: 8080
    livenessProbe:
      httpGet:
        path: /live
        port: 8080
      periodSeconds: 1
      initialDelaySeconds: 80   # DOKLADNIE tyle, ile trwa start
```

- **`initialDelaySeconds: 80` nie jest przypadkowe.** Gdyby było domyślne 0, liveness uderzyłby w aplikację, która jeszcze wstaje, uznał ją za martwą i zrestartował - w kółko. To pułapka numer 2 z notatki, tu na żywo.
- **`periodSeconds: 1`** jest agresywne. Przy `failureThreshold: 3` (domyślne) daje 3 sekundy od pierwszej porażki do restartu.
- **Alternatywa, której w pliku nie ma:** `startupProbe` zamiast rozciągania `initialDelaySeconds`. Warto przepisać ten plik na startupProbe jako ćwiczenie.
- `readinessProbe.yaml` ma w `metadata` zostawiony `creationTimestamp` - patrz uwaga o dumpach niżej.

---
## cron.yaml, job.yaml, more-jobs.yaml

→ [[CKAD - CronJob]], [[CKAD - Job]]

`cron.yaml` to najlepsza ilustracja trzech poziomów `spec`:

```yaml
spec:                        # poziom 1: CronJob
  schedule: "30 21 * * *"
  jobTemplate:
    spec:                    # poziom 2: Job
      completions: 3
      parallelism: 3
      backoffLimit: 25
      template:
        spec:                # poziom 3: Pod
          containers:
          - name: throw-dice
            image: kodekloud/throw-dice
          restartPolicy: Never
```

Zwróć uwagę, **gdzie co siedzi**: `completions`, `parallelism`, `backoffLimit` na poziomie Joba, `restartPolicy` i `containers` na poziomie Poda. Pomylenie poziomów to najczęstszy błąd w tym temacie.

`job.yaml` kontra `more-jobs.yaml` - ta sama aplikacja, różnica w dwóch polach:

| | job.yaml | more-jobs.yaml |
|---|---|---|
| `completions` | brak (czyli 1) | 3 |
| `parallelism` | brak (czyli 1) | 3 |
| `backoffLimit` | 15 | 25 |

**Czemu `backoffLimit` jest tak wysoki?** Obraz `throw-dice` losuje liczbę i kończy się błędem, gdy nie wypadnie 6. Domyślne 6 prób by nie wystarczyło. To rzadki przypadek, gdy wysoki `backoffLimit` jest celowy, a nie zapomniany.

---
## ingres.yaml i tls.yaml

→ [[CKAD - Ingress]]

Dwa Ingressy o różnym poziomie kompletności - porównaj je.

**`ingres.yaml`** - routing po ścieżce, bez hosta i bez klasy:

```yaml
  annotations:
    nginx.ingress.kubernetes.io/rewrite-target: /
    nginx.ingress.kubernetes.io/ssl-redirect: "false"
spec:
  rules:
  - http:                    # brak "host" = regula lapie KAZDY host
      paths:
      - path: /wear
        pathType: Prefix
        backend:
          service:
            name: wear-service
            port:
              number: 8080
```

- **`rewrite-target: /` jest tu konieczny.** Aplikacja `wear-service` nie wie nic o prefiksie `/wear` - bez przepisania dostałaby żądanie na `/wear` i zwróciła 404.
- **`ssl-redirect: "false"`** - wartość w cudzysłowie, bo adnotacje to zawsze stringi. Bez cudzysłowów YAML zrobi z tego boolean i API odrzuci manifest.
- **Brak `ingressClassName`** - zadziała tylko wtedy, gdy w klastrze jest domyślna IngressClass.

**`tls.yaml`** - wersja produkcyjna: jest `ingressClassName: nginx`, jest `host`, jest TLS:

```yaml
spec:
  ingressClassName: nginx
  tls:
  - hosts:
      - app.kodekloud.local
    secretName: app-tls        # Secret typu kubernetes.io/tls, w TYM namespace
  rules:
  - host: app.kodekloud.local
```

Nazwa hosta w `tls.hosts` i w `rules.host` **musi być ta sama**, inaczej certyfikat nie zostanie użyty.

---
## persistent-volume.yaml, storageClass.yaml, localPersistentStorage.yaml

→ [[CKAD - PVC]]

**Uwaga: `storageClass.yaml` nie zawiera StorageClass. Zawiera PVC.** Mylna nazwa pliku - warto zmienić na `pvc.yaml`, zanim utrwali się zły skrót myślowy.

Te trzy pliki to **dwa różne laby**, nie jeden komplet. Gdybyś zaaplikował je razem, PVC zostałby `Pending` - i to z trzech powodów naraz:

| | PV (`persistent-volume.yaml`) | PVC (`storageClass.yaml`) | Zgodność |
|---|---|---|---|
| `accessModes` | ReadWriteMany | ReadWriteOnce | nie |
| `storageClassName` | brak | `local-path` | nie |
| rozmiar | 100Mi | 500Mi (żąda więcej) | nie |

To jest gotowe ćwiczenie diagnostyczne: zaaplikuj oba, zobacz `Pending`, przeczytaj `kubectl describe pvc local-pvc` i napraw. Trafia dokładnie w pułapkę numer 1 z notatki o PVC.

`localPersistentStorage.yaml` domyka łańcuch - Pod konsumujący PVC:

```yaml
  volumeMounts:
    - name: local-persistent-storage
      mountPath: /var/www/html
  volumes:
    - name: local-persistent-storage
      persistentVolumeClaim:
        claimName: local-pvc
```

Nazwa `local-persistent-storage` musi być identyczna w `volumeMounts` i `volumes` - to wiązanie wewnątrz Poda, niezależne od nazwy PVC.

---
## secret.yaml

→ [[CKAD - Secret]]

Merytorycznie chodzi o jedną rzecz - wstrzyknięcie całego Secretu jako zmienne środowiskowe:

```yaml
    envFrom:
    - secretRef:
        name: db-secret
```

Ale ten plik jest ciekawszy z innego powodu: to **surowy dump z klastra** (`kubectl get pod -o yaml`), ze wszystkimi śmieciami. Przed ponownym użyciem wyrzuć:

```yaml
metadata:
  creationTimestamp: "2026-06-16T18:44:27Z"   # usun
  generation: 1                                # usun
  resourceVersion: "979"                       # usun
  uid: 1f13a5a3-...                            # usun
spec:
  nodeName: controlplane                       # usun - przypina do node
  volumeMounts:
  - name: kube-api-access-6xjd4                # usun - wstrzykniete przez k8s
  terminationMessagePath: /dev/termination-log # mozna usunac
  dnsPolicy: ClusterFirst                      # mozna usunac
  schedulerName: default-scheduler             # mozna usunac
status: {}                                     # usun cala sekcje
```

**Najgroźniejsze jest `nodeName`** - zostawione przypnie Pod do node'a, którego w nowym klastrze może nie być, i Pod zostanie `Pending`.

Szybsze podejście na egzaminie:

```bash
kubectl get pod webapp-pod -o yaml --show-managed-fields=false > pod.yaml
# i tak zostanie smiec - i tak trzeba przejrzec recznie
```

---
## configMap.yaml

→ [[CKAD - ConfigMap]]

Pojedyncza zmienna z ConfigMapy:

```yaml
    env:
    - name: APP_COLOR
      valueFrom:
       configMapKeyRef:
         name: webapp-config-map
         key: APP_COLOR
```

Drobiazg wart uwagi: `configMapKeyRef` jest wcięte o **jedną** spację względem `valueFrom`, a nie o dwie. YAML to przyjmie, bo liczy się tylko to, że zagnieżdżenie jest głębsze od rodzica. Ale na egzaminie trzymaj równe 2 spacje - przy 40-liniowym manifeście nierówne wcięcia są głównym źródłem błędów, których nie widać gołym okiem.

Wersja z `envFrom` (wszystkie klucze naraz) jest w `secret.yaml` - mechanizm jest identyczny dla ConfigMapy.

---
## securityContext.yaml

→ [[CKAD - SecurityContext]]

Minimalny przykład, poziom Poda:

```yaml
spec:
  securityContext:
    runAsUser: 1010
  containers:
  - command: ["sleep", "4800"]
    image: ubuntu
    name: ubuntu-sleeper
```

Weryfikacja:

```bash
kubectl exec ubuntu-sleeper -- whoami    # blad - brak usera 1010 w /etc/passwd
kubectl exec ubuntu-sleeper -- id        # uid=1010 gid=0(root)
```

**`whoami` zwróci błąd, a `id` zadziała** - bo UID 1010 nie istnieje w `/etc/passwd` obrazu ubuntu. To normalne i nie oznacza, że `runAsUser` nie zadziałał. Używaj `id`.

Czego tu nie ma, a bywa na egzaminie: `capabilities` (tylko na poziomie kontenera), `runAsNonRoot`, `allowPrivilegeEscalation`. Dopisz je do tego pliku jako ćwiczenie.

---
## resourceLimit.yaml

→ [[CKAD - Pod]]

```yaml
  containers:
  - command: ["stress"]
    args: ["--vm", "1", "--vm-bytes", "15M", "--vm-hang", "1"]
    image: polinux/stress
    resources:
      limits:
        memory: 20Mi
      requests:
        memory: 5Mi
```

Lab o `OOMKilled`. Tu kontener zużywa 15M przy limicie 20Mi, więc **działa**. Podnieś `--vm-bytes` powyżej limitu i zobacz:

```bash
kubectl get pod elephant                  # status OOMKilled
kubectl describe pod elephant             # Reason: OOMKilled, Exit Code: 137
```

Rozróżnienie, które wraca na egzaminie:

| Przekroczony limit | Skutek |
|---|---|
| `limits.memory` | kontener **zabity** (OOMKilled, exit 137), potem restart |
| `limits.cpu` | kontener **spowolniony** (throttling), nigdy nie zabity |

---
## strategy.yaml

→ [[CKAD - Deployment]]

```yaml
spec:
  replicas: 4
  strategy:
    type: Recreate
```

`Recreate` ubija wszystkie 4 repliki, zanim postawi nowe - jest **przerwa w działaniu**. Sensowne tylko wtedy, gdy dwie wersje nie mogą działać równocześnie (np. migracja schematu bazy).

Ćwiczenie: przepisz na `RollingUpdate` z `maxSurge: 1` i `maxUnavailable: 0`, potem porównaj `kubectl get pods -w` podczas `kubectl set image`.

---
## yar-log.yaml

→ [[CKAD - Pod]]

```yaml
  volumes:
  - name: log-volume
    hostPath:
      path: /var/log/webapp
      type: Directory
```

- **`hostPath` to nie PV** - to bezpośredni dostęp do dysku node'a. Pod przeniesiony na inny node zobaczy inne dane albo żadnych.
- **`type: Directory` wymaga, by katalog już istniał.** Jeśli go nie ma, Pod nie wstanie. Wariant `DirectoryOrCreate` utworzy go sam.
- Na produkcji `hostPath` jest blokowany przez Pod Security Standards. Na egzaminie pojawia się przy zadaniach o logach i DaemonSetach.

---
## labels.yaml

→ poza serią (ReplicaSet)

```yaml
apiVersion: apps/v1
kind: ReplicaSet
spec:
   selector:
      matchLabels:
        tier: front-end
   template:
     metadata:
       labels:
        tier: front-end
```

ReplicaSet to warstwa, którą [[CKAD - Deployment]] tworzy pod spodem. Sam z siebie nie jest używany - nie ma rollingu ani rollbacku. Na egzaminie pojawia się w zadaniach typu "napraw ReplicaSet", gdzie błędem jest zwykle rozjechany `selector` kontra `template.labels`. Dokładnie ta sama pułapka, co w Deploymencie.

W vaulcie jest pusta notatka [[Replica Set]] - ten plik to dobry materiał, żeby ją wypełnić.

---
# Czego w zestawie brakuje

Cztery notatki nie mają żadnego manifestu do ćwiczeń:

- [[CKAD - Service]] - najpilniejsze, bo Service jest w etapie 1 kolejności czytania
- [[CKAD - StatefulSet]] - headless Service plus `volumeClaimTemplates`
- [[CKAD - DaemonSet]] - z tolerancją na control-plane
- [[CKAD - ServiceAccount]] - plik `serviceAccount.yaml` jest pusty (0 bajtów), tak samo `crd.yaml`

Braki w pokryciu istniejących plików:

- **Deployment** - jest tylko `Recreate`, brak `RollingUpdate` z `maxSurge` i `maxUnavailable`
- **SecurityContext** - jest tylko `runAsUser`, brak `capabilities` i `fsGroup`
- **ConfigMap** - jest tylko `configMapKeyRef`, brak montowania jako wolumen
- **Probes** - brak `startupProbe` oraz wariantów `exec` i `tcpSocket`

---
Zobacz też: [[CKAD - Spis treści]], [[Kubernetes Commands]]
