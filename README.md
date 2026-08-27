# DataVault Docs

Documentation and technical notes built with MkDocs Material. The project contains materials about Claude, Docker, Kubernetes, MongoDB, Redis, and .NET.

## Local Development

Requirements:

- Docker
- Docker Compose

Start the documentation server:

```powershell
docker compose up
```

After startup, the site will be available at:

```text
http://localhost:8000
```

## Project Structure

```text
.
├── docs/
│   ├── index.md
│   ├── claude/
│   ├── docker/
│   ├── kubernetes/
│   ├── mongo/
│   ├── redis/
│   └── net/
├── docker-compose.yaml
├── mkdocs.yml
└── README.md
```

## Editing Documentation

Documentation files are located in the `docs/` directory. After saving changes, MkDocs automatically refreshes the page in the browser.
