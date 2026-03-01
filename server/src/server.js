const app = require("./app");
const env = require("./config/env");
const { initBlockchain } = require("./services/blockchainService");
const connectDb = require("./config/db");

initBlockchain();

connectDb()
  .then(() => {
    app.listen(env.port, () => {
      console.log(`Server running on http://localhost:${env.port}`);
    });
  })
  .catch((error) => {
    console.error("MongoDB connection failed:", error.message);
    process.exit(1);
  });
