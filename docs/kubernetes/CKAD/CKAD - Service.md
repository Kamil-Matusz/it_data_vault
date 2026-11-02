## Co to jest?

**Service** to stabilny punkt dostępu do zbioru Podów. Pody mają zmienne IP i umierają - Service daje **stałe IP i nazwę DNS** oraz load balancing.

Service wyszukuje Pody po **etykietach** (`selector`), nie po nazwach.

```text
Klient → Service (stałe IP + DNS) → Endpoints → Pod IP:port
```

DNS wewnątrz klastra:

```text
<service>.<namespace>.svc.cluster.local
```

W tym samym namespace wystarczy sama nazwa: `http://webapp`.

Zobacz też: [[CKAD - Deployment]], [[CKAD - Ingress]], [[CKAD - NetworkPolicy]]

**Ćwiczenie:** brak manifestu w [[CKAD - Manifesty do ćwiczeń]] - do dopisania

---
## Kiedy używać?

| Typ | Kiedy | Dostęp |
|---|---|---|
| **ClusterIP** (domyślny) | komunikacja wewnątrz klastra | tylko z klastra |
| **NodePort** | szybkie wystawienie na zewnątrz, lab/test | `NodeIP:30000-32767` |
| **LoadBalancer** | produkcja w chmurze | zewnętrzne IP od providera |
| **ExternalName** | alias DNS do usługi poza klastrem | rekord CNAME |
| **Headless** (`clusterIP: None`) | DNS zwraca IP Podów, bez LB | [[CKAD - StatefulSet]] |

---
## Najważniejsze pola YAML

```yaml
apiVersion: v1
kind: Service
metadata:
  name: webapp
spec:
  type: ClusterIP              # ClusterIP | NodePort | LoadBalancer | ExternalName
  selector:
    app: webapp                # MUSI pasowac do etykiet Podow
  ports:
  - name: http
    protocol: TCP
    port: 80                   # port Service (na nim sluchajacy ClusterIP)
    targetPort: 8080           # port w kontenerze
    nodePort: 30080            # tylko NodePort/LoadBalancer, zakres 30000-32767
```

### Trzy porty - najważniejsza tabelka

| Pole | Czyj port | Uwaga |
|---|---|---|
| `port` | Service | na ten port uderza klient w klastrze |
| `targetPort` | kontener | domyślnie równy `port`, jeśli pominięty |
| `nodePort` | node | tylko NodePort/LB; losowy, jeśli pominięty |

### Headless Service

```yaml
spec:
  clusterIP: None
  selector:
    app: db
  ports:
  - port: 5432
```

### ExternalName

```yaml
spec:
  type: ExternalName
  externalName: db.example.com
```

---
## Najważniejsze komendy kubectl

```bash
# Z Deploymentu / Poda (najszybsza droga)
kubectl expose deployment webapp --port=80 --target-port=8080
kubectl expose pod nginx --port=80 --name=nginx-svc --type=NodePort

# Imperatywnie
kubectl create service clusterip webapp --tcp=80:8080
kubectl create service nodeport webapp --tcp=80:8080 --node-port=30080

# Szkielet YAML
kubectl create service clusterip webapp --tcp=80:8080 --dry-run=client -o yaml

# Weryfikacja - KLUCZOWE
kubectl get svc
kubectl get endpoints webapp        # puste = selector nie lapie Podow
kubectl get endpointslices -l kubernetes.io/service-name=webapp
kubectl describe svc webapp

# Test z wnetrza klastra
kubectl run tmp --image=busybox --rm -it --restart=Never -- wget -qO- webapp:80
kubectl run tmp --image=busybox --rm -it --restart=Never -- nslookup webapp

# Przekierowanie na lokalna maszyne
kubectl port-forward svc/webapp 8080:80
```

---
## Typowe pułapki egzaminacyjne

1. **Puste `Endpoints`** - problem numer jeden. `selector` Service nie pasuje do etykiet Podów. Diagnoza: `kubectl get endpoints <svc>`.
2. **`port` kontra `targetPort`** - `port` to port Service, `targetPort` to port kontenera. Pomylenie równa się "connection refused".
3. **`kubectl expose deployment --port=80`** bez `--target-port` ustawia `targetPort: 80`, nawet gdy kontener słucha na 8080.
4. **nodePort poza zakresem 30000-32767** - odrzucone przez API server.
5. **ExternalName ignoruje `ports` i `selector`** - to czysty CNAME.
6. **NodePort jest też ClusterIP** - NodePort nie zastępuje ClusterIP, tylko go rozszerza.
7. **Nazwa Service to nazwa DNS** - zadanie typu "aplikacja ma się łączyć pod `db`" oznacza Service o nazwie `db`.
8. **Cross-namespace** - `webapp` nie zadziała z innego namespace. Trzeba `webapp.dev.svc.cluster.local` albo skrótowo `webapp.dev`.
9. **`containerPort` w Podzie nie jest wymagany** do działania Service - to tylko dokumentacja. Nie szukaj tam błędu.
10. **LoadBalancer w stanie `Pending`** na minikube to normalne - nie ma providera. Użyj NodePort, jeśli zadanie nie wymaga wprost LB.
