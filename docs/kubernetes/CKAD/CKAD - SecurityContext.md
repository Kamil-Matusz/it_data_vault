## Co to jest?

**SecurityContext** określa uprawnienia i ustawienia bezpieczeństwa procesu w kontenerze: jako kto działa, co mu wolno na poziomie jądra, czy może podnieść uprawnienia.

Występuje na **dwóch poziomach**:

```text
pod.spec.securityContext                  → dotyczy wszystkich kontenerow
pod.spec.containers[].securityContext     → nadpisuje ustawienia Poda
```

Poziom kontenera **zawsze wygrywa** z poziomem Poda.

Zobacz też: [[CKAD - Pod]], [[CKAD - ServiceAccount]]

**Ćwiczenie:** `securityContext.yaml` → [[CKAD - Manifesty do ćwiczeń#securityContext.yaml]]

---
## Kiedy używać?

| Wymaganie | Pole |
|---|---|
| Kontener nie może działać jako root | `runAsNonRoot: true` plus `runAsUser` |
| Konkretny UID/GID | `runAsUser`, `runAsGroup` |
| Dostęp do wolumenu dla grupy | `fsGroup` |
| Blokada eskalacji uprawnień | `allowPrivilegeEscalation: false` |
| Dodanie jednej zdolności jądra | `capabilities.add: ["NET_ADMIN"]` |
| System plików tylko do odczytu | `readOnlyRootFilesystem: true` |
| Pełne uprawnienia (unikaj) | `privileged: true` |

---
## Najważniejsze pola YAML

```yaml
apiVersion: v1
kind: Pod
metadata:
  name: secure-app
spec:
  securityContext:                  # POZIOM PODA
    runAsUser: 1000
    runAsGroup: 3000
    runAsNonRoot: true
    fsGroup: 2000                   # grupa wlasciciela zamontowanych wolumenow
    fsGroupChangePolicy: OnRootMismatch
    supplementalGroups: [4000]
    seccompProfile:
      type: RuntimeDefault

  containers:
  - name: app
    image: busybox:1.36
    command: ["sh", "-c", "sleep 3600"]

    securityContext:                # POZIOM KONTENERA - nadpisuje powyzsze
      runAsUser: 2000
      allowPrivilegeEscalation: false
      readOnlyRootFilesystem: true
      privileged: false
      capabilities:
        add: ["NET_ADMIN", "SYS_TIME"]
        drop: ["ALL"]
```

### Które pole na którym poziomie

| Pole | Pod | Kontener |
|---|---|---|
| `runAsUser` / `runAsGroup` / `runAsNonRoot` | tak | tak |
| `fsGroup` | **tylko Pod** | nie |
| `supplementalGroups` | **tylko Pod** | nie |
| `capabilities` | nie | **tylko kontener** |
| `privileged` | nie | **tylko kontener** |
| `allowPrivilegeEscalation` | nie | **tylko kontener** |
| `readOnlyRootFilesystem` | nie | **tylko kontener** |
| `seccompProfile` / `seLinuxOptions` | tak | tak |

To rozróżnienie jest najczęściej sprawdzane na egzaminie.

---
## Najważniejsze komendy kubectl

```bash
# Brak komendy imperatywnej - zawsze YAML plus edycja
kubectl run secure --image=busybox --dry-run=client -o yaml \
  --command -- sleep 3600 > pod.yaml

# Weryfikacja uzytkownika w dzialajacym kontenerze
kubectl exec secure-app -- id
kubectl exec secure-app -- whoami
kubectl exec secure-app -- ps aux

# Podglad ustawien
kubectl get pod secure-app -o yaml | grep -A10 securityContext
kubectl get pod secure-app -o jsonpath='{.spec.securityContext}'
kubectl describe pod secure-app

# Dokumentacja pol - bardzo przydatne
kubectl explain pod.spec.securityContext
kubectl explain pod.spec.containers.securityContext
kubectl explain pod.spec.containers.securityContext.capabilities

# Test zapisu przy readOnlyRootFilesystem
kubectl exec secure-app -- touch /test     # powinno zwrocic blad
```

---
## Typowe pułapki egzaminacyjne

1. **`capabilities` działa tylko na poziomie kontenera** - wstawienie go w `pod.spec.securityContext` to błąd walidacji. To pułapka numer jeden.
2. **`fsGroup` działa tylko na poziomie Poda** - odwrotnie niż `capabilities`.
3. **Kontener nadpisuje Poda** - przy `runAsUser: 1000` w Podzie i `runAsUser: 2000` w kontenerze obowiązuje 2000.
4. **`runAsNonRoot: true` bez `runAsUser`** - Pod wstanie tylko wtedy, gdy obraz ma w sobie `USER` różny od 0. Inaczej `CreateContainerConfigError`.
5. **Nazwy capabilities bez prefiksu `CAP_`** - piszemy `NET_ADMIN`, nie `CAP_NET_ADMIN`.
6. **`drop: ["ALL"]` plus `add` w jednej sekcji** - najpierw jest drop, potem add, więc taka kombinacja działa poprawnie i jest dobrą praktyką.
7. **`readOnlyRootFilesystem: true` psuje aplikacje zapisujące do `/tmp`** - zamontuj `emptyDir` pod `/tmp`.
8. **`privileged: true` nadpisuje wszystko inne** - unikaj, chyba że zadanie wprost tego wymaga.
9. **`allowPrivilegeEscalation` jest domyślnie `true`** dla zwykłych kontenerów, ale `false`, gdy ustawiono `privileged: false` plus brak capabilities - nie zgaduj, ustaw jawnie.
10. **Pliki na wolumenie są nie do zapisu** - zwykle brakuje `fsGroup` pasującej do `runAsGroup`.
