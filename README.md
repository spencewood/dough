# Dough

A dashboard for Tezos bakers to monitor their node, baking/attestation rights, rewards, and DAL status.

## Getting Started

1. Copy `.env.example` to `.env` and configure your settings
2. Install dependencies and run:

```bash
pnpm install
pnpm dev
```

The dashboard will be available at http://localhost:3000

## Docker

The easiest way to run Dough is with Docker. Create a `docker-compose.yml` file:

**Linux** (connects to services on localhost):
```yaml
services:
  dough:
    image: spencewood/dough
    container_name: dough
    restart: unless-stopped
    network_mode: host
    volumes:
      - dough-data:/app/data

volumes:
  dough-data:
```

**macOS / Windows** (Docker Desktop):
```yaml
services:
  dough:
    image: spencewood/dough
    container_name: dough
    restart: unless-stopped
    ports:
      - "3000:3000"
    volumes:
      - dough-data:/app/data

volumes:
  dough-data:
```

Then run:
```bash
docker compose up -d
```

The dashboard will be available at http://localhost:3000. Configure your node URLs and baker address through the settings interface.

## Configuration

Settings can be configured via environment variables or through the in-app settings modal. See `.env.example` for available options.

## Development

```bash
pnpm dev        # Start dev server
pnpm build      # Build for production
pnpm test       # Run tests
pnpm lint       # Check linting
pnpm typecheck  # Check types
```

## Tech Stack

- [TanStack Start](https://tanstack.com/start) (React, Router, Query)
- [Tailwind CSS](https://tailwindcss.com/)
- [Taquito](https://taquito.io/) for Tezos RPC
- SQLite for settings persistence
