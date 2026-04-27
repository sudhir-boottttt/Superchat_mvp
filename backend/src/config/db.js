const mongoose = require("mongoose");

async function connectDatabase() {
  const mongoUri = process.env.MONGODB_URI;

  if (!mongoUri) {
    throw new Error("MONGODB_URI is missing");
  }

  await mongoose.connect(mongoUri);
  console.log("MongoDB connected");
}

module.exports = connectDatabase;
// mongodb+srv://superchat_user:<db_password>@superchatuser.ayecdp3.mongodb.net/?appName=superchatuser