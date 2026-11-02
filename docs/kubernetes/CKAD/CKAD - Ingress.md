## Co to jest?

**Ingress** to reguła routingu HTTP/HTTPS z zewnątrz do Service'ów w klastrze. Działa na **warstwie 7** (host, ścieżka URL), w odróżnieniu od Service, który działa na L4.

Ingress to tylko **konfiguracja**. Ruch obsługuje **Ingress Controller** (nginx, traefik, HAProxy) - bez zainstalowanego kontrolera Ingress nic nie robi.

```text
Internet
   ↓
Ingress Controller (Pod + Service type LoadBalancer/NodePort)
   ↓  (czyta reguly z obiektow Ingress)
Service (ClusterIP)
   ↓
Pody
```

Zobacz też: [[CKAD - Service]], [[CKAD - Secret]]

**Ćwiczenie:** `ingres.yaml`, `tls.yaml` → [[CKAD - Manifesty do ćwiczeń#ingres.yaml i tls.yaml]]

---
## Kiedy używać?

| Sytuacja | Rozwiązanie |
|---|---|
| Kilka aplikacji pod jednym IP/domeną | **Ingress** |
| Routing po ścieżce `/api`, `/shop` | **Ingress** |
| Routing po hoście `api.example.com` | **Ingress** |
| Terminacja TLS w jednym miejscu | **Ingress** + [[CKAD - Secret]] typu `tls` |
| Ruch TCP/UDP nie-HTTP | [[CKAD - Service]] NodePort/LoadBalancer |
| Komunikacja wewnątrz klastra | [[CKAD - Service]] ClusterIP |

---
## Najważniejsze pola YAML

```yaml
apiVersion: networking.k8s.io/v1      # UWAGA: v1, nie extensions/v1beta1
kind: Ingress
metadata:
  name: app-ingress
  annotations:
    nginx.ingress.kubernetes.io/rewrite-target: /
spec:
  ingressClassName: nginx             # ktory controller ma to obsluzyc

  tls:
  - hosts:
    - app.example.com
    secretName: app-tls               # Secret typu kubernetes.io/tls

  rules:
  - host: app.example.com
    http:
      paths:
      - path: /api
        pathType: Prefix              # WYMAGANE: Prefix | Exact | ImplementationSpecific
        backend:
          service:
            name: api-svc
            port:
              number: 80
      - path: /shop
        pathType: Prefix
        backend:
          service:
            name: shop-svc
            port:
              number: 80

  defaultBackend:                     # gdy nic nie pasuje
    service:
      name: fallback-svc
      port:
        number: 80
```

### pathType

| Wartość | Znaczenie |
|---|---|
| `Prefix` | dopasowanie po segmentach ścieżki, `/api` łapie `/api/v1` |
| `Exact` | dokładnie ta ścieżka, wielkość liter ma znaczenie |
| `ImplementationSpecific` | zależne od kontrolera |

---
## Najważniejsze komendy kubectl

```bash
# Tworzenie imperatywne (dziala od kubectl 1.19+)
kubectl create ingress app-ingress \
  --rule="app.example.com/api*=api-svc:80"

# Kilka regul naraz
kubectl create ingress app-ingress \
  --rule="app.example.com/api*=api-svc:80" \
  --rule="app.example.com/shop*=shop-svc:80" \
  --class=nginx

# Z TLS
kubectl create ingress secure \
  --rule="app.example.com/*=app-svc:80,tls=app-tls"

# Szkielet YAML
kubectl create ingress app --rule="/=svc:80" --dry-run=client -o yaml

# Podglad
kubectl get ingress
kubectl describe ingress app-ingress
kubectl get ingressclass

# Secret TLS dla Ingressa
kubectl create secret tls app-tls --cert=tls.crt --key=tls.key
```

---
## Typowe pułapki egzaminacyjne

1. **Zły `apiVersion`** - obowiązuje `networking.k8s.io/v1`. Stare `extensions/v1beta1` jest usunięte.
2. **Brak `pathType`** - w `networking.k8s.io/v1` to pole **obowiązkowe**. Bez niego Ingress się nie utworzy.
3. **Nowa struktura `backend`** - w v1 jest `service.name` i `service.port.number`, a nie dawne `serviceName` / `servicePort`.
4. **Ingress bez kontrolera nic nie robi** - obiekt powstanie, ale `ADDRESS` zostanie pusty.
5. **Ingress musi być w tym samym namespace co Service** - nie da się routować do Service w innym namespace.
6. **Secret TLS musi być w namespace Ingressa** i mieć typ `kubernetes.io/tls` z kluczami `tls.crt` i `tls.key`.
7. **`rewrite-target` to adnotacja, nie pole spec** - i jest specyficzna dla nginx controllera.
8. **Gwiazdka w `kubectl create ingress`** - `--rule="host/path*=svc:port"` daje `pathType: Prefix`, bez gwiazdki `Exact`.
9. **`ingressClassName` kontra stara adnotacja** `kubernetes.io/ingress.class` - używaj pola, adnotacja jest przestarzała.
10. **Port Service, nie port kontenera** - w `backend` podajesz port Service, nie `targetPort`.
