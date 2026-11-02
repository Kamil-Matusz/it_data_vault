## Co to jest?

**CronJob** tworzy [[CKAD - Job]] według harmonogramu cron. To "crontab Kubernetesa".

```text
CronJob  (harmonogram)
   ↓  co wyznaczony czas
  Job   (jedno uruchomienie)
   ↓
  Pod   (wykonuje prace)
```

Zobacz też: [[CKAD - Job]], [[CKAD - Pod]]

**Ćwiczenie:** `cron.yaml` → [[CKAD - Manifesty do ćwiczeń#cron.yaml, job.yaml, more-jobs.yaml]]

---
## Kiedy używać?

| Sytuacja | Obiekt |
|---|---|
| Backup bazy co noc | **CronJob** |
| Czyszczenie starych plików co godzinę | **CronJob** |
| Raport co poniedziałek | **CronJob** |
| Jednorazowa migracja | [[CKAD - Job]] |
| Proces działający ciągle | [[CKAD - Deployment]] |

### Składnia cron

```text
# ┌─────── minuta (0-59)
# │ ┌───── godzina (0-23)
# │ │ ┌─── dzien miesiaca (1-31)
# │ │ │ ┌─ miesiac (1-12)
# │ │ │ │ ┌ dzien tygodnia (0-6, 0=niedziela)
# * * * * *

"*/5 * * * *"     co 5 minut
"0 * * * *"       co godzine, o pelnej
"0 2 * * *"       codziennie o 2:00
"0 0 * * 0"       w kazda niedziele o polnocy
"30 3 1 * *"      1. dnia miesiaca o 3:30
"0 9-17 * * 1-5"  co godzine 9-17, pon-pt
```

---
## Najważniejsze pola YAML

```yaml
apiVersion: batch/v1
kind: CronJob
metadata:
  name: nightly-backup
spec:
  schedule: "0 2 * * *"
  timeZone: "Europe/Warsaw"        # od k8s 1.27 stabilne
  concurrencyPolicy: Forbid        # Allow | Forbid | Replace
  startingDeadlineSeconds: 300     # ile czekac na spoznione uruchomienie
  suspend: false                   # true = wstrzymaj harmonogram
  successfulJobsHistoryLimit: 3    # ile udanych Jobow trzymac (domyslnie 3)
  failedJobsHistoryLimit: 1        # ile nieudanych (domyslnie 1)

  jobTemplate:                     # <- poziom Joba
    spec:
      backoffLimit: 2
      template:                    # <- poziom Poda
        spec:
          restartPolicy: OnFailure
          containers:
          - name: backup
            image: busybox:1.36
            command: ["sh", "-c", "echo backup done"]
```

### Zagnieżdżenie - najważniejsza rzecz do zapamiętania

```text
CronJob.spec
  └── jobTemplate.spec          (= Job.spec)
        └── template.spec       (= Pod.spec)
              └── containers[]
```

Trzy poziomy `spec`. To najczęstszy błąd składniowy na egzaminie.

### concurrencyPolicy

| Wartość | Zachowanie, gdy poprzedni Job jeszcze działa |
|---|---|
| `Allow` (domyślne) | uruchom kolejny równolegle |
| `Forbid` | pomiń nowe uruchomienie |
| `Replace` | ubij stary, uruchom nowy |

---
## Najważniejsze komendy kubectl

```bash
# Tworzenie
kubectl create cronjob nightly --image=busybox --schedule="0 2 * * *" \
  -- /bin/sh -c "echo backup"

# Szkielet YAML
kubectl create cronjob nightly --image=busybox --schedule="*/1 * * * *" \
  --dry-run=client -o yaml -- /bin/sh -c "date" > cronjob.yaml

# Reczne uruchomienie teraz (bez czekania na harmonogram)
kubectl create job manual-run --from=cronjob/nightly

# Wstrzymanie i wznowienie
kubectl patch cronjob nightly -p '{"spec":{"suspend":true}}'
kubectl patch cronjob nightly -p '{"spec":{"suspend":false}}'

# Podglad
kubectl get cronjobs
kubectl get cj
kubectl describe cronjob nightly
kubectl get jobs --watch
kubectl get jobs -l job-name                    # Joby utworzone przez CronJob

# Logi ostatniego uruchomienia
kubectl logs job/nightly-28123456
```

---
## Typowe pułapki egzaminacyjne

1. **Trzy poziomy `spec`** - `spec.jobTemplate.spec.template.spec.containers`. Zgubienie jednego poziomu to najczęstszy błąd. **Na żywo:** `manifests/cron.yaml` pokazuje wszystkie trzy naraz - `completions`, `parallelism` i `backoffLimit` na poziomie Joba, `restartPolicy` i `containers` na poziomie Poda.
2. **`schedule` musi być w cudzysłowie** - `*/5 * * * *` bez cudzysłowów YAML potraktuje jako alias/anchor i rzuci błędem.
3. **`restartPolicy` jest wymagane** - jak w Jobie, tylko `Never` albo `OnFailure`, na poziomie `template.spec`.
4. **Domyślna strefa czasowa to UTC** - bez `timeZone` harmonogram liczy się wg UTC, nie wg czasu lokalnego.
5. **`concurrencyPolicy: Allow` to domyślna wartość** - długo działające zadanie nałoży się samo na siebie.
6. **`startingDeadlineSeconds` krótsze niż 10 sekund** - CronJob może w ogóle nie wystartować.
7. **Pominięcie ponad 100 uruchomień** (np. po `suspend`) powoduje, że controller przestaje planować i loguje błąd.
8. **`successfulJobsHistoryLimit: 0`** sprawia, że nie zobaczysz logów - Job znika natychmiast po sukcesie.
9. **Usunięcie CronJoba kasuje jego Joby i Pody** - zrób `--cascade=orphan`, jeśli chcesz je zachować.
10. **`kubectl create job --from=cronjob/<name>`** to jedyny sensowny sposób na przetestowanie CronJoba podczas egzaminu - nie czekaj na harmonogram.
