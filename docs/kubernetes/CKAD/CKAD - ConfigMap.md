## Co to jest?

**ConfigMap** przechowuje konfigurację **jawnym tekstem** (nie-wrażliwą) i oddziela ją od obrazu kontenera. Ten sam obraz może działać w dev i prod, różniąc się tylko ConfigMapą.

Dane można podać kontenerowi na trzy sposoby:

```text
ConfigMap
 ├── env (pojedyncza zmienna)      → valueFrom.configMapKeyRef
 ├── envFrom (wszystkie klucze)    → envFrom.configMapRef
 └── volume (pliki)                → volumes.configMap
```

Zobacz też: [[CKAD - Secret]], [[CKAD - Pod]], [[CKAD - Deployment]]

**Ćwiczenie:** `configMap.yaml` → [[CKAD - Manifesty do ćwiczeń#configMap.yaml]]

---
## Kiedy używać?

| Dane | Obiekt |
|---|---|
| URL backendu, poziom logowania, feature flagi | **ConfigMap** |
| Hasła, tokeny, klucze API, certyfikaty | [[CKAD - Secret]] |
| Pliki konfiguracyjne (`nginx.conf`, `application.yaml`) | **ConfigMap** jako volume |
| Dane większe niż 1 MiB | ani jedno, ani drugie - wolumen / zewnętrzny storage |

---
## Najważniejsze pola YAML

### Definicja

```yaml
apiVersion: v1
kind: ConfigMap
metadata:
  name: app-config
immutable: false          # true = nie da sie zmienic, tylko usunac
data:
  LOG_LEVEL: "debug"
  APP_MODE: "production"
  nginx.conf: |           # caly plik jako wartosc
    server {
      listen 80;
      server_name localhost;
    }
binaryData: {}            # wartosci base64, dla danych binarnych
```

### Użycie 1 - pojedyncza zmienna

```yaml
spec:
  containers:
  - name: app
    image: nginx
    env:
    - name: LOG_LEVEL
      valueFrom:
        configMapKeyRef:
          name: app-config
          key: LOG_LEVEL
          optional: true      # Pod wstanie, nawet gdy klucza nie ma
```

### Użycie 2 - wszystkie klucze naraz

```yaml
spec:
  containers:
  - name: app
    image: nginx
    envFrom:
    - configMapRef:
        name: app-config
      prefix: CFG_          # opcjonalny prefiks nazw zmiennych
```

### Użycie 3 - jako pliki

```yaml
spec:
  containers:
  - name: app
    image: nginx
    volumeMounts:
    - name: config
      mountPath: /etc/nginx/conf.d
      readOnly: true
  volumes:
  - name: config
    configMap:
      name: app-config
      items:                # opcjonalnie: tylko wybrane klucze
      - key: nginx.conf
        path: default.conf
```

Efekt: każdy klucz staje się plikiem o nazwie klucza, a wartość - treścią pliku.

---
## Najważniejsze komendy kubectl

```bash
# Z wartosci podanych wprost
kubectl create configmap app-config \
  --from-literal=LOG_LEVEL=debug \
  --from-literal=APP_MODE=production

# Z pliku (klucz = nazwa pliku)
kubectl create configmap nginx-config --from-file=nginx.conf

# Z pliku, wlasny klucz
kubectl create configmap nginx-config --from-file=default.conf=nginx.conf

# Z calego katalogu
kubectl create configmap app-config --from-file=./config-dir/

# Z pliku .env (kazda linia KEY=VALUE osobnym kluczem)
kubectl create configmap app-config --from-env-file=app.env

# Szkielet YAML
kubectl create configmap app-config --from-literal=K=V --dry-run=client -o yaml

# Podglad
kubectl get cm
kubectl describe cm app-config
kubectl get cm app-config -o yaml
kubectl get cm app-config -o jsonpath='{.data.LOG_LEVEL}'

# Sprawdzenie w dzialajacym Podzie
kubectl exec app -- env | grep LOG_LEVEL
kubectl exec app -- cat /etc/nginx/conf.d/default.conf
```

---
## Typowe pułapki egzaminacyjne

1. **Zmienna środowiskowa NIE odświeża się** po zmianie ConfigMapy. Trzeba zrestartować Pody: `kubectl rollout restart deployment/webapp`.
2. **Wolumen odświeża się sam**, ale z opóźnieniem (do ~1 minuty, zależnie od kubelet sync period). Nie działa to dla `subPath`.
3. **`subPath` zamraża plik** - zamontowany przez `subPath` nigdy nie dostanie aktualizacji.
4. **Montowanie ConfigMapy na katalog nadpisuje jego zawartość** - `mountPath: /etc/nginx` skasuje wszystko, co było w obrazie. Montuj podkatalog albo używaj `subPath`.
5. **Brak ConfigMapy blokuje start Poda** - status `CreateContainerConfigError`. Ratunek: `optional: true`.
6. **ConfigMap jest namespaced** - musi być w tym samym namespace co Pod.
7. **Wartości muszą być stringami** - `PORT: 8080` w YAML to liczba i API to odrzuci. Pisz `PORT: "8080"`.
8. **`--from-file` kontra `--from-env-file`** - pierwszy robi jeden klucz z całym plikiem, drugi parsuje linie `KEY=VALUE`.
9. **Limit 1 MiB** na ConfigMapę.
10. **`envFrom` z niepoprawnymi nazwami kluczy** (np. `my-key` z myślnikiem) po cichu je pomija - nie staną się zmiennymi środowiskowymi.
