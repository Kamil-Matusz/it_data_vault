## Co to jest?

**Job** uruchamia Pody, które mają **wykonać zadanie i zakończyć się sukcesem**. W odróżnieniu od [[CKAD - Deployment]], który pilnuje, żeby Pody działały bez końca, Job pilnuje, żeby się **poprawnie skończyły**.

```text
Job
 ↓
Pod (exit code 0) → Completed → Job: Complete
Pod (exit code != 0) → retry do backoffLimit → Job: Failed
```

Zobacz też: [[CKAD - CronJob]], [[CKAD - Pod]], [[CKAD - Deployment]]

**Ćwiczenie:** `job.yaml`, `more-jobs.yaml` → [[CKAD - Manifesty do ćwiczeń#cron.yaml, job.yaml, more-jobs.yaml]]

---
## Kiedy używać?

| Sytuacja | Obiekt |
|---|---|
| Migracja bazy danych, import danych | **Job** |
| Wygenerowanie raportu raz | **Job** |
| Przetworzenie kolejki zadań równolegle | **Job** z `parallelism` |
| To samo, ale co noc o 2:00 | [[CKAD - CronJob]] |
| Serwer HTTP działający bez końca | [[CKAD - Deployment]] |

---
## Najważniejsze pola YAML

```yaml
apiVersion: batch/v1
kind: Job
metadata:
  name: data-import
spec:
  completions: 5             # ile Podow musi sie udac (domyslnie 1)
  parallelism: 2             # ile Podow naraz (domyslnie 1)
  backoffLimit: 4            # ile prob przed uznaniem za Failed (domyslnie 6)
  activeDeadlineSeconds: 300 # twardy limit czasu calego Joba
  ttlSecondsAfterFinished: 100  # auto-sprzatanie po zakonczeniu
  completionMode: NonIndexed # NonIndexed | Indexed

  template:
    spec:
      restartPolicy: Never   # WYMAGANE: Never lub OnFailure
      containers:
      - name: importer
        image: busybox:1.36
        command: ["sh", "-c", "echo importing; sleep 5"]
```

### Najważniejsze cztery pola

| Pole | Domyślnie | Co robi |
|---|---|---|
| `completions` | 1 | ile udanych zakończeń potrzeba |
| `parallelism` | 1 | ile Podów może biec równolegle |
| `backoffLimit` | 6 | ile razy ponawiać po porażce |
| `restartPolicy` | brak domyślnej | musi być `Never` albo `OnFailure` |

### Wzorce

```yaml
# Jedno zadanie
completions: 1
parallelism: 1

# Praca z kolejki - N workerow, konczy sie gdy kolejka pusta
completions: 1        # albo pominac
parallelism: 5

# Stala liczba zadan, po kilka naraz
completions: 10
parallelism: 3
```

---
## Najważniejsze komendy kubectl

```bash
# Tworzenie
kubectl create job data-import --image=busybox -- /bin/sh -c "echo hello"

# Szkielet YAML
kubectl create job data-import --image=busybox --dry-run=client -o yaml \
  -- /bin/sh -c "echo hello" > job.yaml

# Job z istniejacego CronJoba (recznie wywolanie)
kubectl create job manual-run --from=cronjob/nightly-backup

# Podglad
kubectl get jobs
kubectl get jobs -w
kubectl describe job data-import
kubectl get pods --selector=job-name=data-import

# Logi
kubectl logs job/data-import
kubectl logs -l job-name=data-import --tail=-1

# Usuwanie
kubectl delete job data-import
kubectl delete job data-import --cascade=orphan   # zostaw Pody
```

---
## Typowe pułapki egzaminacyjne

1. **Brak `restartPolicy`** - w Jobie nie ma domyślnego `Always`. Pominięcie pola albo wpisanie `Always` kończy się błędem walidacji.
2. **`Never` kontra `OnFailure`** - `Never` tworzy **nowego Poda** przy każdej porażce (zostają po nim ślady), `OnFailure` restartuje kontener w tym samym Podzie.
3. **`backoffLimit: 0` nie oznacza "bez ponowień"** z punktu widzenia `OnFailure` - liczone są restarty kontenera.
4. **`parallelism` większe niż `completions`** - Kubernetes i tak nie uruchomi więcej niż brakuje do `completions`.
5. **Job nie usuwa się sam** - zakończone Joby i ich Pody zostają w klastrze. Do auto-sprzątania służy `ttlSecondsAfterFinished`.
6. **`activeDeadlineSeconds` ma pierwszeństwo nad `backoffLimit`** - po upływie czasu Job jest `Failed`, niezależnie od liczby prób.
7. **`spec.template.spec` to poziom Poda** - `restartPolicy` idzie tam, a nie bezpośrednio w `spec` Joba.
8. **Job jest w większości immutable** - nie zmienisz `completions` ani `template` po utworzeniu. Trzeba skasować i stworzyć od nowa.
9. **Logi z wielu Podów** - `kubectl logs job/<name>` pokaże tylko jeden Pod. Przy `completions > 1` użyj `-l job-name=<name>`.
10. **Komenda po `--`** w `kubectl create job` - bez tego argumenty trafią do kubectl.
