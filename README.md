# GoMigo

Monorepo com duas aplicações:

- `Frontend`: app Next.js existente
- `Backend`: API NestJS com Prisma e PostgreSQL

## Estrutura

```text
C:\GoMigo
|-- Frontend
|-- Backend
```

## Comandos

```bash
npm run dev:frontend
npm run dev:backend
```

## Backend

1. Copie `Backend/.env.example` para `Backend/.env`
2. Suba o PostgreSQL com `docker compose up -d` dentro de `Backend`
3. Rode `npm install`
4. Rode `npx prisma generate`
5. Rode `npx prisma migrate dev`

