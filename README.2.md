# README.2 - Friend Setup Guide (GitHub + Run + MongoDB)

This guide explains:
- How to upload this project to GitHub
- What dependencies your friend needs
- How your friend can run the project
- How to use the MongoDB database and collections

---

## 1. Project Structure

- `client/` -> React frontend (Vite)
- `server/` -> Node.js + Express backend + MongoDB connection
- `contracts/` -> Hardhat + Solidity smart contract

---

## 2. Prerequisites (install first)

Your friend should install:
- Node.js (recommended v20+)
- npm (comes with Node.js)
- MongoDB Community Server (local) OR MongoDB Atlas
- MongoDB Compass (optional GUI)

Optional for blockchain live mode:
- Hardhat local node (runs from `contracts/`)

---

## 3. Required Libraries (already in package.json)

### Backend (`server/package.json`)
- express
- cors
- dotenv
- bcryptjs
- jsonwebtoken
- express-validator
- multer
- mongoose
- ethers
- uuid
- nodemon (dev)

### Frontend (`client/package.json`)
- react
- react-dom
- react-router-dom
- axios
- html5-qrcode
- jwt-decode
- vite

### Contracts (`contracts/package.json`)
- hardhat
- @nomicfoundation/hardhat-ethers

---

## 4. Upload to GitHub (from your machine)

Run in PowerShell from project root (`D:\BLOCK-C`):

```powershell
git init
git add .
git commit -m "Initial commit: BCDVS full-stack project"
git branch -M main
git remote add origin https://github.com/<your-username>/<your-repo>.git
git push -u origin main
```

If repo already exists, only run:

```powershell
git add .
git commit -m "Update project"
git push
```

---

## 5. Friend Setup After Clone

### Step A: Clone

```powershell
git clone https://github.com/<your-username>/<your-repo>.git
cd <your-repo>
```

### Step B: Install all dependencies

```powershell
cd server
npm install
cd ..
cd client
npm install
cd ..
cd contracts
npm install
cd ..
```

### Step C: Configure environment files

#### `server/.env`
Create and set:

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

#### `client/.env`

```env
VITE_API_URL=http://localhost:5001/api
```

---

## 6. Run Project

Open multiple terminals:

### Terminal 1: Contracts node (optional, for live blockchain mode)

```powershell
cd contracts
npm run node
```

### Terminal 2: Deploy contract (optional, for live blockchain mode)

```powershell
cd contracts
npm run compile
npm run deploy:local
```

### Terminal 3: Backend

```powershell
cd server
npm run dev
```

### Terminal 4: Frontend

```powershell
cd client
npm run dev
```

Open frontend:
- `http://localhost:5173`

Default seeded login:
- Email: `admin@blockcar.local`
- Password: `Admin@123`

---

## 7. MongoDB Database and Collections

Database name:
- `blockchain`

Collections used:
- `users`
- `sessions`
- `vehicles`
- `documents`
- `ownership_transfers`
- `audit_trail`
- `verification_records`

---

## 8. How Friend Uses Your MongoDB Data

Important: your local MongoDB data is **not automatically shared** through GitHub.
You must share data separately by export/import.

### Option A (easy): Export/Import with Compass

From your system:
1. Open Compass
2. Open each collection
3. Export data as JSON (or CSV)

On friend system:
1. Create same DB `blockchain`
2. Create same collections
3. Import JSON files into corresponding collections

### Option B (recommended): `mongodump` / `mongorestore`

On your machine:

```powershell
mongodump --db blockchain --out .\mongo-backup
```

Share `mongo-backup` folder with friend.

On friend machine:

```powershell
mongorestore .\mongo-backup
```

---

## 9. Notes for Common Errors

- `Forbidden: insufficient role permissions`:
  - Use ADMIN/OWNER account with correct route access.

- CORS error:
  - Check `CLIENT_URL` and frontend port.

- Mongo not connecting:
  - Ensure MongoDB service is running on `127.0.0.1:27017`.

- Invalid owner ID:
  - `Owner User ID` must be MongoDB ObjectId or leave blank.

---

## 10. Suggested GitHub Files to Keep

Keep:
- Source code
- `README.md`
- `README.2.md`
- `.env.example` files

Do not push:
- Real `.env` with secrets
- `node_modules`
- local DB dumps unless intentionally sharing
