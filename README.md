# Neelkanth Business

Business management web application for Neelkanth Stones.

## Current version

- React + Vite
- Supabase Auth
- Supabase PostgreSQL connection
- Owner login
- Business-aware dashboard
- Responsive sidebar
- Module placeholders for Customers, Products, Invoices, Payments, Transactions, Expenses, Reports and Settings

## Environment variables

Create a `.env` file from `.env.example`:

```env
VITE_SUPABASE_URL=https://piujdjsaeyhfyljlngww.supabase.co
VITE_SUPABASE_PUBLISHABLE_KEY=your_publishable_key
```

Never put a Supabase secret/service-role key in frontend code.

## Run

```bash
npm install
npm run dev
```

## Build

```bash
npm run build
```