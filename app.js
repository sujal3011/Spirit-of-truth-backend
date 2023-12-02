const express = require("express");
const port = process.env.PORT || 3000;
const methodOverride = require('method-override');
const bodyParser = require("body-parser");
require('dotenv').config();
const cors = require('cors');
const app = express();

app.use(cors());

// app.use(bodyParser.json());
app.use(bodyParser.json({limit: '50mb'}));
app.use(bodyParser.urlencoded({limit: '50mb', extended: true}));
app.use(methodOverride("_method"));


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

const auth=require('./routes/authRoutes');
app.use('/api/auth',auth);

const editRoutes=require('./routes/editRoutes');
app.use('/api/changes',editRoutes);

const courseRoutes=require('./routes/courses/courseRoutes');
app.use('/api/courses/course',courseRoutes);

const moduleRoutes=require('./routes/courses/moduleRoutes');
app.use('/api/courses/module',moduleRoutes);

const sectionRoutes=require('./routes/courses/sectionRoutes');
app.use('/api/courses/section',sectionRoutes);

const fileRoutes=require('./routes/courses/fileRoutes');
app.use('/api/courses/file',fileRoutes);



app.listen(port, () => {
  console.log(`Express app is listening on port ${port}`);
});
