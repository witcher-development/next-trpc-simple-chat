# Next.js + tRPC

This example shows how you can make a typed query using a minimal implementation of tRPC following [`this as a reference`](https://trpc.io/docs/nextjs/introduction).

## Setup

```bash
npx create-next-app --example https://github.com/trpc/trpc --example-path examples/next-minimal-starter trpc-minimal-starter
cd trpc-minimal-starter
npm i
npm run dev
```

## Development

### Start project

For local development add
DATABASE_URL="mongodb://localhost:27017/chat?directConnection=true"
to .env

```bash
docker-compose up -d
npm run dev        # starts next.js
```
