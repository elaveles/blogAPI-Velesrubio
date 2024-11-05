const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");

const app = express();
require('dotenv').config();

mongoose.connect(process.env.MONGODB_STRING);
mongoose.connection.once('open', () => console.log('Now connected to MongoDB Atlas'));

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

const corsOptions = {
  origin: ['http://localhost:8000', 'http://localhost:3000', 'https://blog-app-rho-mocha.vercel.app/'],
  credentials: true,
  optionsSuccessStatus: 200,
}

app.use(cors(corsOptions));

const userRoutes = require("./routes/user");
const postRoutes = require("./routes/post");
const commentRoutes = require("./routes/comment");

app.use("/users", userRoutes);
app.use("/posts", postRoutes);
app.use("/comments", commentRoutes);

app.listen(process.env.PORT, () => console.log(`API is now online on port ${process.env.PORT}`));

module.exports = { app, mongoose };
