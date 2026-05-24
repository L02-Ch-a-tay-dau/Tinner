const dotenv = require("dotenv");
const path = require("path");

// Load the .env file in the current directory (apps/backend/.env)
dotenv.config({ path: path.resolve(__dirname, ".env") });

module.exports = {
  schema: "prisma/schema.prisma",
  migrations: {
    path: "prisma/migrations",
  },
  datasource: {
    url: process.env.DATABASE_URL,
  },
};
