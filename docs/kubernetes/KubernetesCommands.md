# Kubernetes - Lista Komend (Cheat Sheet)

### Podstawowe polecenia

```sh
### Tworzenie nowego pod-a
kubectl run hello-minikube --image=kicbase/echo-server:1.0

### Wyświetla informacje o klastrze Kubernetes, m.in. adres API serwera, dashboardu itd.
kubectl cluster-info

### Pokazuje listę węzłów (nodes) w klastrze wraz z ich stanem, wersją Kubelet itp.
kubectl get nodes

### Wyświetlanie wszystkich zasobów w bieżącym namespace (pody, serwisy, deploymenty)
kubectl get all

### Wyświetla nazwę aktualnie używanego kontekstu
kubectl config current-context

### Pokazuje adresy IP podów powiązanych z usługami
kubectl get endpoints

### Tworzenie nowego namespace
kubectl create ns webhook-demo

### Uruchomienie polecenia wewnątrz pod-a
kubectl exec ubuntu-sleeper -- whoami
```

### Pody

```sh
### Wyświetlanie listy wszystkich podów w domyślnym namespace
kubectl get pods

### Wyświetlanie podów ze wszystkich namespaców
kubectl get pods -A

### Wyświetlanie szczegółów pod-a
kubectl describe pod nginx

### Usuwanie pod-a
kubectl delete pod webapp

### Wyświetlanie wszystkich podów w klastrze wraz ze szczegółami
kubectl get pods -o wide

### Opis poda w formacie yaml
kubectl get pods -o yaml

### Wyświetlanie podów z konkretnego namespace-a
kubectl get pods -n <namespace>

### Dokumentacja pod-a
kubectl explain pods

### Dokumentacja pola, w tym przypadku spec
kubectl explain pods.spec

### Rekurencyjne wyświetlanie wszystkich pól pod-a
kubectl explain pods --recursive

### Rekurencyjne wyświetlanie wszystkich pól sekcji spec pod-a
kubectl explain pod.spec --recursive

### Tworzenie nowego pod-a o nazwie `nginx`, uruchamiającego kontener z oficjalnym obrazem `nginx`
kubectl run nginx --image nginx

### Tworzenie poda o nazwie `redis` z obrazem `redis123`
kubectl run redis --image=redis123

### Utworzenie pod-a z etykietą
kubectl run redis --image redis:alpine --labels="<label>"

### Tworzenie lub aktualizacja zasobu (np. poda) na podstawie pliku YAML `redis-pod.yaml`
kubectl apply -f redis-pod.yaml

### Symuluje utworzenie poda (bez faktycznego uruchomienia) i wypisuje wynikowy plik YAML - przydatne do generowania definicji
kubectl run redis --image=redis123 --dry-run=client -o yaml

### Eksport definicji pod-a do pliku YAML
kubectl get pod <pod-name> -o yaml > pod-definition.yaml

### Edycja pod-a
kubectl edit pod <pod-name>

### Liczba podów w danym namespace
kubectl -n research get pods --no-headers | wc -l

### Wyszukiwanie podów zawierających konkretną nazwę
kubectl get pods --all-namespaces | grep blue

### Utworzenie pod-a i automatyczne wystawienie go jako serwis
kubectl run httpd --image=httpd:alpine --port=80 --expose

### Podgląd securityContext pod-a
kubectl get pod pod-with-defaults -o yaml | grep -A2 "securityContext:"

### Edycja pliku YAML z definicją pod-a
nano ubuntu-sleeper.yaml
```

### Etykiety i selektory

```sh
### Dodanie etykiety do node-a
kubectl label node node01 color=blue

### Liczba podów z etykietą `env=dev`
kubectl get pods --selector env=dev --no-headers | wc -l

### Wszystkie zasoby pasujące do kilku etykiet naraz
kubectl get all --selector env=prod,bu=finance,tier=frontend
```

### Taints i Tolerations

```sh
### Sprawdzenie taintów na node-dzie
kubectl describe node node01 | grep -i taints

### Dodanie taintu blokującego planowanie podów bez tolerancji
kubectl taint nodes node01 spray=mortein:NoSchedule

### Usunięcie taintu (znak `-` na końcu)
kubectl taint nodes controlplane node-role.kubernetes.io/control-plane:NoSchedule-
```

### Logi i diagnostyka

```sh
### Wyświetlanie logów z kontenera w podzie (jeśli jest jeden kontener)
kubectl logs <nazwa-poda>

### Logi z konkretnego kontenera w podzie
kubectl logs <nazwa-poda> -c <nazwa-kontenera>

### Śledzenie logów na żywo
kubectl logs -f <nazwa-poda>

### Przekierowanie portu pod-a na maszynę lokalną
kubectl port-forward pod/<nazwa-poda> 8080:80

### Wyświetlanie liczby namespace
kubectl get ns --no-headers | wc -l

### Wyświetlanie dostępnych typów zasobów
kubectl api-resources

### Node o najwyższym zużyciu CPU
kubectl top node --sort-by='cpu' --no-headers | head -1
```

### Repliki

```sh
### Wyświetlanie ReplicaSetów utworzonych automatycznie przez Deploymenty
kubectl get replicaset

### Szczegóły o ReplicaSecie
kubectl describe rs <nazwa>

### Tworzy ReplicaSet na podstawie definicji w pliku YAML
kubectl create -f replicaset-definition.yml

### Zastępowanie istniejącego ReplicaSet nową definicją z pliku YAML
kubectl replace -f replicaset-definition.yml

### Zmiana liczby replik w ReplicaSet zdefiniowanym w pliku YAML
kubectl scale --replicas=6 -f replicaset-definition.yml

### Skalowanie istniejącego ReplicaSet `myapp-replicaset` do 6 replik
kubectl scale --replicas=6 replicaset myapp-replicaset

### Usuwanie ReplicaSet `myapp-replicaset`
kubectl delete replicaset myapp-replicaset

### Usuwanie naraz dwóch ReplicaSetów `replicaset-1` i `replicaset-2`
kubectl delete replicaset replicaset-1 replicaset-2

### Usuwanie konkretnego poda należącego do ReplicaSetu
kubectl delete pod new-replica-set-568zw

### Otwiera edytor `nano` do edycji pliku YAML definicji ReplicaSetu
nano /root/replicaset-definition-1.yaml

### Pobiera definicję ReplicaSet `new-replica-set` w formacie YAML i filtruje tylko linie zawierające `image:`
kubectl get rs new-replica-set -o yaml | grep image:

### Edycja ReplicaSetu przez nano
KUBE_EDITOR="nano" kubectl edit rs new-replica-set
```

### Deploymenty

```sh
### Pokazanie listy wszystkich Deploymentów
kubectl get deployments

### Tworzy Deployment z pliku `deployment-definition.yml`
kubectl create -f deployment-definition.yml

### Tworzy nowy Deployment o nazwie `httpd-frontend`, uruchamiający 3 repliki kontenera `httpd:2.4-alpine`
kubectl create deployment httpd-frontend --image=httpd:2.4-alpine --replicas=3

### Tworzy Deployment `redis-deploy` z 2 replikami w namespace `dev-ns`
kubectl create deployment redis-deploy --image=redis --replicas=2 -n dev-ns

### Pokazuje szczegółowe informacje o Deploymencie o nazwie `simple-webapp-deployment`
kubectl describe deploy simple-webapp-deployment

### Pokazuje status procesu wdrażania (rolloutu) Deploymentu `myapp-deployment`
kubectl rollout status deployment/myapp-deployment

### Wyświetla historię rolloutów Deploymentu (wersje, zmiany)
kubectl rollout history deployment/myapp-deployment

### Podmiana obrazu kontenera `simple-webapp` w Deploymencie `frontend`
kubectl set image deploy frontend simple-webapp=kodekloud/webapp-color:v2

### Skalowanie Deploymentu `frontend-v2` do 1 repliki
kubectl scale deployment --replicas=1 frontend-v2

### Edycja pliku deploymentu
nano deployment-definition-1.yaml

### Edycja Deploymentu w nano, w konkretnym namespace
EDITOR=nano kubectl edit deployment -n kinguin-order order
```

### Jobs

```sh
### Podgląd Joba na żywo (aktualizacja statusu)
kubectl get job throw-dice-job --watch

### Dokumentacja zasobu Job
kubectl explain job
```

### Serwisy

```sh
### Lista wszystkich usług w klastrze
kubectl get services

### Skrót polecenia `kubectl get services` - działa identycznie
kubectl get svc

### Szczegółowe informacje o usłudze
kubectl describe svc kubernetes

### Przekierowanie ruchu do usługi (Service)
kubectl port-forward service/<nazwa> 8080:80

### Wystawienie pod-a jako serwis
kubectl expose pod redis --port 6379 --name redis-service
```

### Ingress

```sh
### Lista Ingressów ze wszystkich namespace
kubectl get ingress --all-namespaces

### Szczegóły Ingressów w konkretnym namespace
kubectl describe ingress --namespace app-space
```

### Network Policies

```sh
### Lista Network Policy (skrót)
kubectl get netpol

### Lista Network Policy (pełna nazwa zasobu)
kubectl get networkpolicy
```

### ConfigMapy

```sh
### Lista ConfigMap
kubectl get configmaps

### Szczegóły wszystkich ConfigMap
kubectl describe configmaps

### Szczegóły konkretnej ConfigMapy
kubectl describe configmap db-config

### Tworzenie ConfigMapy z par klucz-wartość
kubectl create configmap webapp-config-map \
  --from-literal=APP_COLOR=darkblue \
  --from-literal=APP_OTHER=disregard
```

### Sekrety

```sh
### Lista sekretów
kubectl get secrets

### Szczegóły wszystkich sekretów
kubectl describe secrets

### Podgląd sekretu w formacie YAML (wartości zakodowane w base64)
kubectl get secret app-secret -o yaml

### Tworzenie sekretu z par klucz-wartość
kubectl create secret generic db-secret \
  --from-literal=DB_Host=sql01 \
  --from-literal=DB_User=root \
  --from-literal=DB_Password=password123

### Tworzenie sekretu TLS z certyfikatu i klucza
kubectl -n webhook-demo create secret tls webhook-server-tls \
  --cert "/root/keys/webhook-server-tls.crt" \
  --key "/root/keys/webhook-server-tls.key"
```

### Storage (PV, PVC, StorageClass)

```sh
### Lista PersistentVolume
kubectl get pv

### Lista StorageClass
kubectl get sc

### Szczegóły konkretnej StorageClass
kubectl describe sc portworx-io-priority-high
```

### Wymagania zasobów (Resource Requirements)

```sh
### Sprawdzenie ostatniego stanu kontenera (np. powód OOMKilled)
kubectl describe pod elephant | grep -A5 "Last State"
```

### Service Account

```sh
### Tworzenie Service Account
kubectl create serviceaccount sa

### Lista Service Account
kubectl get serviceaccount

### Szczegóły Service Account
kubectl describe serviceaccount sa

### Sprawdzenie, jakiego Service Account używają pody
kubectl get pods -o yaml | grep serviceAccountName

### Wygenerowanie tokenu dla Service Account
kubectl create token dashboard-sa
```

### RBAC

```sh
### Lista Role w bieżącym namespace
kubectl get roles

### Lista RoleBinding w bieżącym namespace
kubectl get rolebindings

### Szczegóły Roli
kubectl describe role developer

### Sprawdzenie własnych uprawnień
kubectl auth can-i create deployments
kubectl auth can-i delete nodes

### Sprawdzenie uprawnień innego użytkownika
kubectl auth can-i create deployments --as dev-user

### Liczba ClusterRole i ClusterRoleBinding
kubectl get clusterroles --no-headers | wc -l
kubectl get clusterrolebindings --no-headers | wc -l

### Szczegóły ClusterRoleBinding
kubectl describe clusterrolebinding cluster-admin

### Tworzenie ClusterRole na zasobie `nodes`
kubectl create clusterrole michelle-role \
  --verb=get,list,watch,create,delete \
  --resource=nodes

### Przypięcie ClusterRole do użytkownika
kubectl create clusterrolebinding michelle-role-binding \
  --clusterrole=michelle-role \
  --user=michelle
```

### Kontekst i kubeconfig

```sh
### Podgląd aktualnej konfiguracji klienta
kubectl config view

### Podgląd konfiguracji z konkretnego pliku
kubectl config view --kubeconfig my-kube-config

### Aktualny kontekst z konkretnego pliku
kubectl config current-context --kubeconfig my-kube-config

### Przełączenie kontekstu w konkretnym pliku
kubectl config --kubeconfig=/root/my-kube-config use-context research
```
