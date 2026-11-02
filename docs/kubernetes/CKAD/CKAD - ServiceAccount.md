## Co to jest?

**ServiceAccount (SA)** to tożsamość **aplikacji** działającej w Podzie, używana do uwierzytelniania wobec Kubernetes API.

| Człowiek | Aplikacja |
|---|---|
| User Account | ServiceAccount |

```text
Pod → ServiceAccount → token → API Server → RBAC → decyzja
```

**Kluczowe rozróżnienie:**

- ServiceAccount mówi **kim jesteś** (authentication).
- Role / RoleBinding mówią **co możesz zrobić** (authorization).

Zobacz też: [[Service Account]] (notatka rozszerzona), [[CKAD - Pod]], [[CKAD - Secret]]

**Ćwiczenie:** brak manifestu w [[CKAD - Manifesty do ćwiczeń]] - do dopisania

---
## Kiedy używać?

| Sytuacja | Działanie |
|---|---|
| Pod czyta listę Podów przez API | własny SA plus Role plus RoleBinding |
| Operator / kontroler w klastrze | własny SA z ClusterRole |
| Aplikacja NIE korzysta z API | `automountServiceAccountToken: false` |
| Pull obrazów z prywatnego rejestru | `imagePullSecrets` w SA |

Zasada najmniejszych uprawnień: nigdy nie nadawaj uprawnień domyślnemu SA `default`.

---
## Najważniejsze pola YAML

### ServiceAccount

```yaml
apiVersion: v1
kind: ServiceAccount
metadata:
  name: pod-reader
  namespace: dev
automountServiceAccountToken: false    # domyslnie true
imagePullSecrets:
- name: regcred
```

### Przypisanie do Poda

```yaml
apiVersion: v1
kind: Pod
metadata:
  name: app
spec:
  serviceAccountName: pod-reader       # <- kluczowe pole
  automountServiceAccountToken: true   # nadpisuje ustawienie z SA
  containers:
  - name: app
    image: nginx
```

W Deployment / StatefulSet / Job to samo pole siedzi głębiej:

```yaml
spec:
  template:
    spec:
      serviceAccountName: pod-reader
```

### Komplet RBAC

```yaml
apiVersion: rbac.authorization.k8s.io/v1
kind: Role
metadata:
  name: pod-reader-role
  namespace: dev
rules:
- apiGroups: [""]              # "" = core API group
  resources: ["pods", "pods/log"]
  verbs: ["get", "list", "watch"]
---
apiVersion: rbac.authorization.k8s.io/v1
kind: RoleBinding
metadata:
  name: pod-reader-binding
  namespace: dev
subjects:
- kind: ServiceAccount
  name: pod-reader
  namespace: dev
roleRef:
  kind: Role
  name: pod-reader-role
  apiGroup: rbac.authorization.k8s.io
```

### Gdzie siedzi token w kontenerze

```text
/var/run/secrets/kubernetes.io/serviceaccount/
  ├── token
  ├── ca.crt
  └── namespace
```

---
## Najważniejsze komendy kubectl

```bash
# Tworzenie
kubectl create serviceaccount pod-reader
kubectl create sa pod-reader -n dev --dry-run=client -o yaml

# RBAC imperatywnie - oszczedza duzo czasu na egzaminie
kubectl create role pod-reader-role \
  --verb=get,list,watch --resource=pods -n dev

kubectl create rolebinding pod-reader-binding \
  --role=pod-reader-role \
  --serviceaccount=dev:pod-reader -n dev

kubectl create clusterrole node-reader --verb=get,list --resource=nodes
kubectl create clusterrolebinding node-reader-binding \
  --clusterrole=node-reader --serviceaccount=dev:pod-reader

# Przypisanie SA do istniejacego Deploymentu
kubectl set serviceaccount deployment/webapp pod-reader

# Token (od k8s 1.24 nie ma juz automatycznego Secretu)
kubectl create token pod-reader
kubectl create token pod-reader --duration=1h

# Weryfikacja uprawnien - BARDZO przydatne
kubectl auth can-i list pods --as=system:serviceaccount:dev:pod-reader -n dev
kubectl auth can-i --list --as=system:serviceaccount:dev:pod-reader -n dev

# Podglad
kubectl get sa
kubectl describe sa pod-reader
kubectl get pod app -o jsonpath='{.spec.serviceAccountName}'
```

---
## Typowe pułapki egzaminacyjne

1. **`serviceAccountName`, nie `serviceAccount`** - stare pole `serviceAccount` jest przestarzałe. Używaj `serviceAccountName`.
2. **W Deployment pole jest w `spec.template.spec`**, nie w `spec`. Najczęstszy błąd przy edycji manifestu.
3. **Od Kubernetes 1.24 SA nie ma automatycznie Secretu z tokenem** - token tworzy się przez `kubectl create token` albo przez projected volume.
4. **Sam ServiceAccount nie daje żadnych uprawnień** - bez RoleBinding Pod dostanie `Forbidden`.
5. **`roleRef` jest immutable** - nie zmienisz Roli w istniejącym RoleBindingu, trzeba go usunąć i stworzyć od nowa.
6. **`--serviceaccount` wymaga formatu `namespace:nazwa`** - samo `pod-reader` nie zadziała.
7. **Role jest namespaced, ClusterRole globalny** - do nodów, PV i namespace'ów potrzebujesz ClusterRole.
8. **RoleBinding może wskazywać ClusterRole** - wtedy uprawnienia obowiązują tylko w namespace tego RoleBindingu. Przydatna sztuczka.
9. **Pusty `apiGroups: [""]`** to core API (pods, services, configmaps). Deployment to `apps`, Job to `batch`, NetworkPolicy to `networking.k8s.io`.
10. **`kubectl auth can-i --as=system:serviceaccount:<ns>:<sa>`** - najszybszy sposób sprawdzenia poprawności zadania, zanim przejdziesz dalej.
