# BLOCK-C Test Cases

| Test Case ID | Module | Scenario | Test Steps | Expected Result | Actual Result | Status |
| --- | --- | --- | --- | --- | --- | --- |
| TC-001 | Admin Login | Admin signs in with valid credentials | Open Admin Sign In, enter `admin@blockcar.local`, enter valid password, submit | Admin is authenticated and dashboard opens | As expected in smoke test | Pass |
| TC-002 | Admin Login | Invalid password is rejected | Enter valid admin email with wrong password, submit | System shows invalid email or password message | Pending manual UI test | Pending |
| TC-003 | Forgot Password | Admin updates password | Open Forgot Password, enter admin email, enter and confirm new password, submit | New bcrypt password hash is saved in MongoDB and old sessions are revoked | Pending manual UI test | Pending |
| TC-004 | Protected Routes | Dashboard access without token | Remove token/local storage and open `/dashboard` | User is redirected to Admin Sign In | Pending manual UI test | Pending |
| TC-005 | User Management | Admin creates a user | Sign in as Admin, open Admin Users, enter user details and role, submit | User is saved in MongoDB without exposing password hash | Pending manual UI test | Pending |
| TC-006 | Vehicle Dataset | Seed dataset into MongoDB | Run `npm run seed:vehicles` from `server` | `blockchain.vehicles` contains dataset records from `server/data/vehicle_dataset.json` | 20 records seeded | Pass |
| TC-007 | View Vehicles | Frontend displays dataset | Sign in and open Vehicle Records | Vehicle registration number, owner, model, company, type, engine, chassis, status, and hash are visible | Pending manual UI test | Pending |
| TC-008 | Add Vehicle Record | Admin registers a new vehicle | Fill Register Vehicle form with unique registration, engine, and chassis values | Vehicle is saved, record hash is generated, blockchain/mock TX is returned | Pending manual UI test | Pending |
| TC-009 | Duplicate Vehicle Validation | Duplicate registration is rejected | Submit a vehicle using an existing registration number | API returns duplicate record message and does not save the record | Pending manual UI test | Pending |
| TC-010 | Search Vehicle | Search by registration number | Open Verify Vehicle, enter `ICT-2024-1452`, submit | System shows valid/original message and complete vehicle details | Verified by API smoke test | Pass |
| TC-011 | Invalid Vehicle Verification | Search fake registration | Enter `FAKE-9999`, submit | System shows not found or fake/unverified alert | Verified by API smoke test | Pass |
| TC-012 | QR Scan Verification | QR payload contains registration number | Scan QR text such as `BLOCKC|REG|LHR-2023-8821` | Matching vehicle details are displayed and verification record is saved | Pending camera/QR manual test | Pending |
| TC-013 | Document Upload Verification | Uploaded/scanned document text contains registration | Upload document or paste text containing `LHR-2023-8821` | System matches dataset, displays details, and saves verification record | Verified by API smoke test | Pass |
| TC-014 | MongoDB Save/Retrieve | Verification history persists | Perform a valid and invalid verification, then open Audit Trail | Verification records are retrieved from MongoDB with status, TX, and hashes | Verified by API smoke test | Pass |
| TC-015 | Blockchain Record Save | Registration/verification creates blockchain history | Register or verify a vehicle, then call `/api/blockchain/history` | History shows vehicle/document/verification record with TX ID and hash | Pending UI/API follow-up | Pending |
| TC-016 | Dashboard Display | Dashboard totals are correct | Open Dashboard after seeding and verifications | Counts for vehicles, active vehicles, documents, verifications, alerts, and audit events are shown | Verified by API smoke test | Pass |
| TC-017 | Security Validation | Weak or invalid input rejected | Try short password, invalid email, invalid vehicle identifier, or unsupported upload type | API returns validation error and no unsafe data is saved | Pending manual/API test | Pending |
| TC-018 | Error Handling | Backend returns clear failure message | Stop MongoDB or send malformed request | API returns controlled error message instead of crashing | Pending environment test | Pending |
