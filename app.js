const express = require("express");
const app = express();
const port = process.env.PORT || 3000;
require("dotenv").config();

const mongoose = require("mongoose");
const mongoURL = process.env.MONGODB_URL;
mongoose.connect(mongoURL);

const db = mongoose.connection;

db.on("error", (error) => {
  console.error("MongoDB connection error:", error);
});

db.once("open", () => {
  console.log("Successfully connected to MongoDB");
});


app.get("/", (req, res) => {
  res.send("Hello World!");
});

app.listen(port, () => {
  console.log(`Express app is listening on port ${port}`);
});
