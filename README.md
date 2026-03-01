# BLOCK-C: Blockchain Car Document Verification System

Full-stack FYP implementation with:
- Frontend: React + Vite
- Backend: Node.js + Express + SQLite
- Blockchain: Solidity smart contract + Hardhat

## Modules Implemented

1. User Management Module
- Secure signup/login (`bcrypt` + `JWT`)
- Role-based access (`ADMIN`, `OWNER`, `BUYER`, `TRAFFIC_POLICE`)
- Session storage and logout
- Password recovery token flow

2. Vehicle Registration Module
- Vehicle registration with unique identifiers
- Vehicle metadata storage
- Document upload with validation
- Unique vehicle UID assignment

3. Document Hashing & Blockchain Storage Module
- SHA-256 hash generation for uploaded files
- Hash uniqueness check
- Hash write to blockchain smart contract (or mock mode)
- TX ID and timestamp recording + retrieval

4. Smart Contract & Audit Trail Module
- Solidity contract for vehicle/doc/ownership records
- On-chain ownership transfer transaction support
- Immutable audit chain (`previous_hash -> current_hash`)
- Audit log listing endpoint

## Project Structure

- `client/` React frontend with login UI, dashboard, module pages, camera QR scanner
- `server/` Express APIs, auth, RBAC, uploads, SQLite, hashing, audit
- `contracts/` Solidity contract and Hardhat scripts

## Run Instructions

Open 3 terminals.

1) Start blockchain node
```bash
cd contracts
npm install
npm run node
```

2) Deploy smart contract (new terminal)
```bash
cd contracts
npm run compile
npm run deploy:local
```

3) Start backend (new terminal)
```bash
cd server
npm install
copy .env.example .env
npm run dev
```

4) Start frontend (new terminal)
```bash
cd client
npm install
npm run dev
```

Frontend URL: `http://localhost:5173`
Backend URL: `http://localhost:5000`

## Default Seed Admin

- Email: `admin@blockcar.local`
- Password: `Admin@123`

## Notes

- If contract is not deployed, backend automatically falls back to `MOCK` blockchain mode.
- Logo used: `c1.png` copied to `client/public/c1.png`.
- Camera scanner is available in dashboard under `Camera Scanner`.
