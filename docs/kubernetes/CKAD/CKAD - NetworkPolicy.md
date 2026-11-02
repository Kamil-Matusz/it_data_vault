## Co to jest?

**NetworkPolicy** to firewall na poziomie Podów. Określa, **kto może się łączyć z Podem** (ingress) i **z kim Pod może się łączyć** (egress).

Dwie zasady, które trzeba znać na pamięć:

1. **Domyślnie wszystko jest dozwolone.** Bez żadnej NetworkPolicy każdy Pod gada z każdym.
2. **Gdy jakakolwiek polityka wybierze Pod, wszystko inne staje się zabronione.** Polityki są **addytywne** (OR) i działają jak whitelist - nie ma reguł typu "deny".

> NetworkPolicy wymaga CNI, które ją wspiera (Calico, Cilium, Weave). Na flannel polityka powstanie, ale nic nie zrobi.

Zobacz też: [[CKAD - Service]], [[CKAD - Pod]]

**Ćwiczenie:** `internal-policy.yaml` → [[CKAD - Manifesty do ćwiczeń#internal-policy.yaml]]

---
## Kiedy używać?

| Sytuacja | Polityka |
|---|---|
| Baza danych tylko dla backendu | ingress z `podSelector: app=backend` |
| Izolacja namespace'u | `podSelector: {}` plus `policyTypes: [Ingress]` |
| Zablokowanie ruchu wychodzącego poza klaster | egress z `ipBlock` plus `except` |
| Zezwolenie tylko na DNS | egress do portu 53 UDP/TCP |

---
## Najważniejsze pola YAML

```yaml
apiVersion: networking.k8s.io/v1
kind: NetworkPolicy
metadata:
  name: db-policy
  namespace: prod
spec:
  podSelector:                 # KTORE Pody chronimy; {} = wszystkie w namespace
    matchLabels:
      app: database

  policyTypes:                 # ktore kierunki kontrolujemy
  - Ingress
  - Egress

  ingress:
  - from:
    - podSelector:             # Pody w TYM SAMYM namespace
        matchLabels:
          app: backend
    - namespaceSelector:       # wszystkie Pody we wskazanym namespace
        matchLabels:
          env: prod
    - ipBlock:
        cidr: 10.0.0.0/16
        except:
        - 10.0.1.0/24
    ports:
    - protocol: TCP
      port: 5432

  egress:
  - to:
    - podSelector:
        matchLabels:
          app: cache
    ports:
    - protocol: TCP
      port: 6379
  - to: []                     # DNS - prawie zawsze potrzebne
    ports:
    - protocol: UDP
      port: 53
    - protocol: TCP
      port: 53
```

### AND kontra OR - pułapka numer jeden

```yaml
# OR: Pody z etykieta app=backend W TYM namespace
#     LUB wszystkie Pody w namespace env=prod
from:
- podSelector:
    matchLabels:
      app: backend
- namespaceSelector:
    matchLabels:
      env: prod
```

```yaml
# AND: tylko Pody app=backend ZNAJDUJACE SIE w namespace env=prod
from:
- podSelector:
    matchLabels:
      app: backend
  namespaceSelector:
    matchLabels:
      env: prod
```

Różnica to **jeden myślnik**. Dwa myślniki = dwa osobne elementy listy = OR. Jeden myślnik = jeden element z dwoma selektorami = AND.

### Deny all

```yaml
apiVersion: networking.k8s.io/v1
kind: NetworkPolicy
metadata:
  name: default-deny-all
spec:
  podSelector: {}
  policyTypes:
  - Ingress
  - Egress
```

---
## Najważniejsze komendy kubectl

```bash
kubectl get networkpolicies
kubectl get netpol
kubectl describe netpol db-policy
kubectl get netpol -o yaml

# Brak komendy imperatywnej - zawsze YAML
kubectl apply -f netpol.yaml

# Sprawdzenie etykiet Podow i namespace (podstawa doboru selektorow)
kubectl get pods --show-labels
kubectl get ns --show-labels

# Test lacznosci
kubectl run tmp --image=busybox --rm -it --restart=Never -- \
  wget -qO- --timeout=2 database:5432

kubectl exec backend -- nc -zv database 5432

# Dokumentacja pol
kubectl explain networkpolicy.spec.ingress.from --recursive
```

---
## Typowe pułapki egzaminacyjne

1. **Myślnik decyduje o AND/OR** - najważniejsza pułapka całego tematu. Sprawdź wcięcia dwa razy.
2. **Polityka blokuje DNS** - po `default-deny` egress Pody nie rozwiążą nazw. Prawie każde zadanie z egress wymaga dopuszczenia portu 53 UDP i TCP. **Na żywo:** w `manifests/internal-policy.yaml` odpowiada za to trzecia reguła egress - ma same `ports`, bez `to`, więc przepuszcza port 53 do dowolnego celu.
3. **`policyTypes` trzeba wypisać jawnie** - jeśli dodasz sekcję `egress`, ale nie wpiszesz `Egress` w `policyTypes`, reguła nie zadziała. Dla pewności podaj zawsze.
4. **Pusty `podSelector: {}` wybiera WSZYSTKIE Pody** w namespace, a nie żadnego.
5. **Brak sekcji `ingress` przy `policyTypes: [Ingress]`** = blokada całego ruchu przychodzącego.
6. **Polityka jest namespaced** - działa tylko na Pody w swoim namespace. Musi być w namespace Poda, który chronisz.
7. **`namespaceSelector` używa etykiet namespace'u, nie jego nazwy** - do dopasowania po nazwie służy wbudowana etykieta `kubernetes.io/metadata.name`.
8. **Polityki są addytywne** - nie da się "odjąć" uprawnień. Druga polityka może tylko dodać dozwolony ruch.
9. **NetworkPolicy nie dotyczy ruchu Service to Pod jako takiego** - filtrowanie odbywa się po IP Poda źródłowego; ruch przez NodePort/LB może mieć przepisany adres źródłowy.
10. **Brak wsparcia CNI** - polityka zostanie przyjęta przez API i nic nie zrobi. Na egzaminie klaster ma Calico, więc działa.
