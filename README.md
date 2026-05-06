# BLOCK-C: Blockchain Vehicle Registration and Verification System

Full-stack FYP project for secure vehicle registration, document hashing, and vehicle authenticity verification.

## Stack

- Frontend: React + Vite
- Backend: Node.js + Express
- Database: MongoDB, database name `blockchain`
- Blockchain: Solidity + Hardhat, with automatic mock transaction fallback when a local chain is not running

## Main Features

- Admin sign in with JWT sessions and bcrypt password hashing
- Forgot Password flow for Admin password update in MongoDB
- Role-based protected APIs for Admin, Owner, Buyer, and Traffic Police
- Seeded vehicle registration dataset in `server/data/vehicle_dataset.json`
- MongoDB vehicle records with owner, company, model, type, registration, engine, chassis, document number, dates, status, and immutable record hash
- Manual, QR, and uploaded document verification by registration/engine/chassis/document number
- Success/fake alert messages for valid and invalid vehicle checks
- Verification records saved in MongoDB with blockchain/mock transaction ID and hash chain
- Document upload with SHA-256 hash storage and blockchain transaction record
- Dashboard overview, vehicle table, verification history, blockchain history, and audit trail
- Test case document in `TEST_CASES.md`

## Default Admin

- Email: `admin@blockcar.local`
- Password: `Admin@123`

## Run Instructions

Install dependencies in each folder if needed:

```bash
cd server
npm install
cd ../client
npm install
cd ../contracts
npm install
```

Configure `server/.env`:

```env
PORT=5001
CLIENT_URL=http://localhost:5173
JWT_SECRET=change_this_to_a_secure_secret
JWT_EXPIRY=8h
MONGO_URI=mongodb://127.0.0.1:27017
MONGO_DB_NAME=blockchain
UPLOAD_DIR=./uploads
BLOCKCHAIN_RPC_URL=http://127.0.0.1:8545
BLOCKCHAIN_CHAIN_ID=31337
BLOCKCHAIN_PRIVATE_KEY=0xac0974bec39a17e36ba4a6b4d238ff944bacb478cbed5efcae784d7bf4f2ff80
BLOCKCHAIN_CONTRACT_ADDRESS=
```

Seed vehicle dataset:

```bash
cd server
npm run seed:vehicles
```

Start backend:

```bash
cd server
npm run dev
```

Start frontend:

```bash
cd client
npm run dev
```

Open:

- Frontend: `http://localhost:5173`
- Backend: `http://localhost:5001/api/health`

Optional live blockchain:

```bash
cd contracts
npm run node
npm run compile
npm run deploy:local
```

If the chain is not running, backend operations continue in mock mode and still save transaction-style IDs.

## Important API Areas

- `POST /api/auth/login`
- `POST /api/auth/admin/forgot-password`
- `GET /api/dashboard`
- `GET /api/vehicles`
- `POST /api/vehicles`
- `POST /api/verification/search`
- `POST /api/verification/document`
- `GET /api/verification/records`
- `GET /api/blockchain/history`
- `GET /api/audit`

## Project Files Added

- `server/data/vehicle_dataset.json`
- `server/scripts/seedVehicles.js`
- `server/src/models/VerificationRecord.js`
- `server/src/routes/verificationRoutes.js`
- `server/src/routes/dashboardRoutes.js`
- `TEST_CASES.md`
