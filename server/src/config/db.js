const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");
const env = require("./env");
const User = require("../models/User");
const Vehicle = require("../models/Vehicle");

const seedUsersAndVehicles = async () => {
  let admin = await User.findOne({ email: "admin@blockcar.local" });
  if (!admin) {
    admin = await User.create({
      fullName: "System Admin",
      email: "admin@blockcar.local",
      passwordHash: await bcrypt.hash("Admin@123", 12),
      role: "ADMIN",
      createdAt: new Date(),
    });
  }

  const demoUsers = [
    { fullName: "Ali Owner", email: "owner1@blockcar.local", role: "OWNER" },
    { fullName: "Sara Buyer", email: "buyer1@blockcar.local", role: "BUYER" },
    { fullName: "Imran Police", email: "police1@blockcar.local", role: "TRAFFIC_POLICE" },
  ];

  for (const demo of demoUsers) {
    const exists = await User.findOne({ email: demo.email });
    if (!exists) {
      await User.create({
        ...demo,
        passwordHash: await bcrypt.hash("Admin@123", 12),
        createdAt: new Date(),
      });
    }
  }

  const hasVehicles = await Vehicle.countDocuments();
  if (hasVehicles > 0) {
    return;
  }

  const seedVehicles = [
    { vehicleName: "Honda Civic", registrationNumber: "CIVIC-101", engineNumber: "ENG-CVC-101", chassisNumber: "CHS-CVC-101" },
    { vehicleName: "Toyota Corolla", registrationNumber: "COROLLA-202", engineNumber: "ENG-COR-202", chassisNumber: "CHS-COR-202" },
    { vehicleName: "Hyundai Elantra", registrationNumber: "ELANTRA-303", engineNumber: "ENG-ELA-303", chassisNumber: "CHS-ELA-303" },
    { vehicleName: "Suzuki Alto", registrationNumber: "ALTO-404", engineNumber: "ENG-ALT-404", chassisNumber: "CHS-ALT-404" },
    { vehicleName: "Kia Sportage", registrationNumber: "SPORTAGE-505", engineNumber: "ENG-SPT-505", chassisNumber: "CHS-SPT-505" },
  ];

  for (const entry of seedVehicles) {
    await Vehicle.create({
      vehicleUid: `VHC-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
      vehicleName: entry.vehicleName,
      registrationNumber: entry.registrationNumber,
      engineNumber: entry.engineNumber,
      chassisNumber: entry.chassisNumber,
      ownerId: null,
      createdBy: admin._id,
      createdAt: new Date(),
      status: "ACTIVE",
    });
  }
};

const connectDb = async () => {
  await mongoose.connect(env.mongoUri, { dbName: env.mongoDbName });
  await seedUsersAndVehicles();
};

module.exports = connectDb;
