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
