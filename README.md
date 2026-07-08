# SmartERP — Tally-inspired Modern ERP

Production-ready MVP. Premium SaaS UI (Linear / Stripe inspired). Next.js 15 + Express + Prisma + PostgreSQL.

## Quick Start

### 1. Database (Docker)
```bash
docker compose up -d db
```

### 2. Backend
```bash
cd backend
cp .env.example .env
npm install
npx prisma migrate dev --name init
npx prisma db seed
npm run dev          # http://localhost:4000
```

### 3. Frontend
```bash
cd frontend
cp .env.example .env.local
npm install
npm run dev          # http://localhost:3000
```

### Demo Login
`demo@smarterp.io` / `demo1234`

## Architecture
- **frontend/** — Next.js 15 App Router, React 19, Tailwind, shadcn/ui, TanStack Table, Zustand, Framer Motion
- **backend/** — Express + TypeScript, Prisma, JWT auth, PDFKit, ExcelJS
- **prisma/** — schema, migrations, seed

## Modules
Companies · Customers · Suppliers · Items · Purchase Vouchers · Sales Vouchers · Invoices (PDF) · Inventory · Reports (PDF + Excel)

## Keyboard
`Ctrl+K` palette · `Ctrl+H` dashboard · `F8` sales · `F9` purchase · `Ctrl+B` invoice
"# ERP" 
