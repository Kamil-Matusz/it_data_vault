## Co to jest?

**Secret** przechowuje dane wrażliwe: hasła, tokeny, klucze SSH, certyfikaty TLS. Działa niemal identycznie jak [[CKAD - ConfigMap]], ale:

- wartości są trzymane w **base64** (`data`),
- nie pojawiają się w `kubectl describe`,
- mogą być szyfrowane w etcd (encryption at rest),
- mają typy (`Opaque`, `kubernetes.io/tls`, ...).

> **Base64 to NIE szyfrowanie.** `echo <wartosc> | base64 -d` odczyta hasło. To tylko kodowanie - prawdziwa ochrona to RBAC plus encryption at rest.

Zobacz też: [[CKAD - ConfigMap]], [[CKAD - ServiceAccount]], [[CKAD - Ingress]]

**Ćwiczenie:** `secret.yaml` → [[CKAD - Manifesty do ćwiczeń#secret.yaml]]

---
## Kiedy używać?

| Dane | Typ Secretu |
|---|---|
| Hasło do bazy, token API | `Opaque` (domyślny) |
| Certyfikat TLS dla [[CKAD - Ingress]] | `kubernetes.io/tls` |
| Dostęp do prywatnego rejestru obrazów | `kubernetes.io/dockerconfigjson` |
| Login i hasło | `kubernetes.io/basic-auth` |
| Klucz SSH | `kubernetes.io/ssh-auth` |
| Token Service Accountu | `kubernetes.io/service-account-token` |

---
## Najważniejsze pola YAML

### Definicja

```yaml
apiVersion: v1
kind: Secret
metadata:
  name: db-secret
type: Opaque
data:                      # wartosci MUSZA byc w base64
  DB_USER: YWRtaW4=
  DB_PASS: czNjcjN0
stringData:                # wartosci jawnym tekstem, k8s sam zakoduje
  DB_HOST: postgres.default.svc
immutable: false
```

`stringData` jest wygodniejsze przy pisaniu ręcznym - nie trzeba kodować base64. Przy odczycie k8s i tak pokaże wszystko w `data`.

### Użycie 1 - pojedyncza zmienna

```yaml
env:
- name: DB_PASS
  valueFrom:
    secretKeyRef:
      name: db-secret
      key: DB_PASS
      optional: false
```

### Użycie 2 - wszystkie klucze

```yaml
envFrom:
- secretRef:
    name: db-secret
```

### Użycie 3 - jako pliki

```yaml
spec:
  containers:
  - name: app
    image: nginx
    volumeMounts:
    - name: creds
      mountPath: /etc/secrets
      readOnly: true
  volumes:
  - name: creds
    secret:
      secretName: db-secret
      defaultMode: 0400     # uprawnienia plikow
      items:
      - key: DB_PASS
        path: password.txt
```

### Użycie 4 - prywatny rejestr obrazów

```yaml
spec:
  imagePullSecrets:
  - name: regcred
  containers:
  - name: app
    image: registry.example.com/app:1.0
```

---
## Najważniejsze komendy kubectl

```bash
# Generic
kubectl create secret generic db-secret \
  --from-literal=DB_USER=admin \
  --from-literal=DB_PASS=s3cr3t

kubectl create secret generic ssh-key --from-file=ssh-privatekey=~/.ssh/id_rsa

# TLS (dla Ingressa)
kubectl create secret tls app-tls --cert=tls.crt --key=tls.key

# Docker registry
kubectl create secret docker-registry regcred \
  --docker-server=registry.example.com \
  --docker-username=user \
  --docker-password=pass \
  --docker-email=a@b.com

# Szkielet YAML
kubectl create secret generic db --from-literal=K=V --dry-run=client -o yaml

# Odczyt wartosci
kubectl get secret db-secret -o jsonpath='{.data.DB_PASS}' | base64 -d
kubectl get secret db-secret -o yaml

# Kodowanie / dekodowanie recznie
echo -n 's3cr3t' | base64
echo 'czNjcjN0' | base64 -d

# Podglad
kubectl get secrets
kubectl describe secret db-secret     # pokaze klucze i rozmiary, NIE wartosci
```

---
## Typowe pułapki egzaminacyjne

1. **`echo` bez `-n` dodaje znak nowej linii** do base64 - hasło będzie błędne. Zawsze `echo -n 'haslo' | base64`.
2. **`data` wymaga base64, `stringData` nie** - wklejenie jawnego tekstu do `data` kończy się błędem `illegal base64 data`.
3. **`kubectl describe secret` nie pokaże wartości** - do odczytu użyj `-o jsonpath` plus `base64 -d`.
4. **Secret musi być w tym samym namespace co Pod** - dotyczy też Secretu TLS dla Ingressa.
5. **Zmienne środowiskowe z Secretu nie odświeżają się** - jak w ConfigMapie, potrzebny restart Podów.
6. **Brak Secretu blokuje start Poda** - `CreateContainerConfigError`. Diagnoza przez `kubectl describe pod`.
7. **Secret typu `tls` musi mieć dokładnie klucze `tls.crt` i `tls.key`** - inne nazwy nie zadziałają.
8. **Od Kubernetes 1.24 ServiceAccount nie dostaje automatycznie Secretu z tokenem** - token generuje się przez `kubectl create token <sa>`.
9. **`imagePullSecrets` jest w `spec` Poda, nie w kontenerze** - w Deployment: `spec.template.spec.imagePullSecrets`.
10. **Limit 1 MiB** - tak samo jak ConfigMap.
