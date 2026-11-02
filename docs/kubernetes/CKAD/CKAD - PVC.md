## Co to jest?

**PersistentVolumeClaim (PVC)** to **żądanie** przestrzeni dyskowej złożone przez aplikację. **PersistentVolume (PV)** to faktyczny zasób dyskowy w klastrze.

```text
Developer                     Administrator / StorageClass
   ↓                                    ↓
  PVC   ───── binding (1:1) ─────────► PV
   ↓                                    ↓
  Pod                            realny dysk (NFS, EBS, hostPath...)
```

Analogia: PVC to zamówienie, PV to towar. Kubernetes dopasowuje je po rozmiarze, `accessModes` i `storageClassName`.

Zobacz też: [[CKAD - Pod]], [[CKAD - StatefulSet]], [[CKAD - ConfigMap]]

**Ćwiczenie:** `persistent-volume.yaml`, `storageClass.yaml`, `localPersistentStorage.yaml` → [[CKAD - Manifesty do ćwiczeń#persistent-volume.yaml, storageClass.yaml, localPersistentStorage.yaml]]

---
## Kiedy używać?

| Potrzeba | Rozwiązanie |
|---|---|
| Dane mają przetrwać restart Poda | **PVC** |
| Wymiana plików między kontenerami w Podzie | `emptyDir` |
| Konfiguracja | [[CKAD - ConfigMap]] / [[CKAD - Secret]] |
| Osobny dysk dla każdej repliki | [[CKAD - StatefulSet]] + `volumeClaimTemplates` |
| Dane tymczasowe, znikające z Podem | `emptyDir` |

### Access Modes

| Tryb | Skrót | Znaczenie |
|---|---|---|
| ReadWriteOnce | RWO | zapis z jednego **node'a** |
| ReadOnlyMany | ROX | odczyt z wielu nodów |
| ReadWriteMany | RWX | zapis z wielu nodów (NFS, CephFS) |
| ReadWriteOncePod | RWOP | zapis z dokładnie jednego **Poda** |

---
## Najważniejsze pola YAML

### PersistentVolume

```yaml
apiVersion: v1
kind: PersistentVolume
metadata:
  name: pv-data
spec:
  capacity:
    storage: 1Gi
  accessModes:
  - ReadWriteOnce
  persistentVolumeReclaimPolicy: Retain   # Retain | Delete | Recycle(deprecated)
  storageClassName: manual
  hostPath:
    path: /mnt/data
```

### PersistentVolumeClaim

```yaml
apiVersion: v1
kind: PersistentVolumeClaim
metadata:
  name: data-claim
spec:
  accessModes:
  - ReadWriteOnce
  storageClassName: manual        # "" = bez dynamic provisioning
  resources:
    requests:
      storage: 500Mi              # moze byc MNIEJ niz PV
```

### Podpięcie do Poda

```yaml
apiVersion: v1
kind: Pod
metadata:
  name: app
spec:
  containers:
  - name: app
    image: nginx
    volumeMounts:
    - name: data
      mountPath: /usr/share/nginx/html
  volumes:
  - name: data
    persistentVolumeClaim:
      claimName: data-claim
```

Ścieżka zawsze ta sama: `volumes` w `spec` Poda plus `volumeMounts` w kontenerze.

---
## Najważniejsze komendy kubectl

```bash
kubectl get pv
kubectl get pvc
kubectl get pvc -o wide
kubectl describe pvc data-claim      # tu zobaczysz, czemu jest Pending
kubectl get storageclass
kubectl get sc

# Szkielet - brak komendy imperatywnej, trzeba z YAML
kubectl apply -f pvc.yaml

# Sprawdzenie, ktory Pod uzywa PVC
kubectl describe pvc data-claim | grep -i "used by"

# Rozszerzenie PVC (jesli StorageClass ma allowVolumeExpansion: true)
kubectl edit pvc data-claim          # zwieksz spec.resources.requests.storage

# Usuniecie
kubectl delete pvc data-claim
```

### Statusy PVC

| Status | Znaczenie |
|---|---|
| `Pending` | nie znaleziono pasującego PV ani provisionera |
| `Bound` | połączony z PV, gotowy |
| `Lost` | PV zniknął |

---
## Typowe pułapki egzaminacyjne

1. **PVC w stanie `Pending`** - to standardowe zadanie diagnostyczne. Przyczyny: niezgodny `storageClassName`, za mały PV, inne `accessModes`, brak provisionera. Zawsze `kubectl describe pvc`. **Na żywo:** `manifests/persistent-volume.yaml` i `manifests/storageClass.yaml` (mimo nazwy to PVC) rozjeżdżają się na wszystkich trzech polach naraz - zaaplikuj oba i napraw.
2. **`storageClassName` musi się zgadzać** - PVC bez tego pola dostaje domyślną StorageClass, a nie PV z `storageClassName: manual`. Żeby wyłączyć dynamic provisioning: `storageClassName: ""`.
3. **PVC może żądać mniej niż PV, nigdy więcej** - PVC 2Gi nie zbinduje się z PV 1Gi.
4. **Binding jest 1:1** - jeden PV obsługuje jeden PVC. Drugi PVC zostanie `Pending`, nawet jeśli miejsca jest dużo.
5. **`accessModes` muszą się pokrywać** - PVC z RWX nie zbinduje się z PV mającym tylko RWO.
6. **ReadWriteOnce to jeden NODE, nie jeden Pod** - kilka Podów na tym samym node może dzielić RWO.
7. **Usunięcie PVC przy `reclaimPolicy: Delete` kasuje dane** - `Retain` zostawia PV w stanie `Released` (nie da się go od razu użyć ponownie).
8. **PVC nie skasuje się, dopóki używa go Pod** - zostaje w stanie `Terminating`.
9. **Zapomniany `volumeMounts`** - sam `volumes` nic nie robi. Potrzebne oba pola.
10. **PVC jest namespaced, PV jest globalny** - PVC musi być w namespace Poda.
