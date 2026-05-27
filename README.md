# LW3 Supply Chain — Product Lifecycle Tracker

A blockchain-inspired supply chain tracking system with hash-linked, append-only event chains for tamper-evident product lifecycle management.

## Architecture

```
backend/   → Express.js + TypeScript + MongoDB + Redis
frontend/  → Next.js 15 + TypeScript + Tailwind + shadcn/ui + RTK Query
```

## Quick Start

### Prerequisites
- Node.js 18+
- Docker & Docker Compose (for MongoDB + Redis)

### 1. Start Infrastructure
```bash
docker-compose up -d
```

### 2. Backend
```bash
cd backend
npm install
cp .env.example .env
npm run seed      # seeds sample data + prints JWT tokens
npm run dev       # starts on http://localhost:5000
```

### 3. Frontend
```bash
cd frontend
npm install
npm run dev       # starts on http://localhost:3000
```

## API Endpoints

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| POST | `/api/auth/login` | Public | Get JWT token |
| POST | `/api/products` | Internal | Register a new product |
| POST | `/api/products/:id/events` | Internal | Append lifecycle event |
| GET | `/api/products/:id` | All | Product with full event history |
| GET | `/api/products` | All | List with filters + cursor pagination |
| GET | `/api/products/:id/verify` | All | Verify event chain integrity |

### Filters on GET /products
- `status` — filter by current lifecycle status
- `partnerId` — filter by partner (auto-applied for partner role)
- `fromDate` / `toDate` — creation date range
- `cursor` — cursor-based pagination (pass `_id` of last item)
- `limit` — page size (default 20, max 100)

## Design Decisions

### Blockchain-Like Event Chain
Each event contains a SHA-256 hash computed from its data + the previous event's hash, forming a tamper-evident chain identical in concept to a blockchain. The `/verify` endpoint walks the full chain and recomputes every hash to detect tampering.

### Append-Only Enforcement
Immutability is enforced at the Mongoose schema level — `updateOne`, `findOneAndUpdate`, `deleteOne`, `findOneAndDelete`, and `deleteMany` all throw errors. This is defense-in-depth beyond just omitting routes.

### Cursor-Based Pagination
Skip/offset pagination degrades at O(n) for large collections. Cursor pagination using `_id` comparison is O(1) with an index, critical for 100k+ products.

### Denormalized `currentStatus`
Product stores the latest status to avoid aggregating all events for list queries. Updated atomically when a new event is appended.

### Race Condition Protection
Event appends use MongoDB transactions + unique compound index on `(productId, sequenceNumber)` to prevent duplicate sequence numbers under concurrent writes.

### Rate Limiting
Redis-backed rate limiting with `rate-limiter-flexible`. Partners: 100 req/min. Internal: 1000 req/min.

## Assumptions

1. **Event types**: `manufactured`, `in_transit`, `shipped`, `received`, `inspected`, `stored`, `sold`, `returned`, `recycled`, `recalled`, `disposed`
2. **Product registration** auto-creates a genesis `manufactured` event
3. **Partner scoping**: partners only see products where `partnerId` matches their JWT claim
4. **No login UI**: seed script generates JWT tokens for testing
5. **Event metadata** is a flexible JSON field for domain-specific data (carrier info, inspection notes, etc.)

## What I'd Do With More Time

- **Merkle tree** for batch verification across multiple products
- **Asymmetric key signatures** per event (aligns with LW3's post-quantum angle)
- **WebSocket** real-time event stream for live tracking dashboards
- **Redis caching** for hot product lookups with cache invalidation on new events
- **OpenAPI/Swagger** auto-generated docs
- **Integration tests** with supertest + mongodb-memory-server
- **Event sourcing** pattern with projections for complex read models
- **Audit log** for API access tracking
