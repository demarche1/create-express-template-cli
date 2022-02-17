require("dotenv").config();
const express = require("express");
const cors = require("cors");
const init = require("./routes");

const app = express();
const PORT = 3000;

const corsOptions = {
  origin: process.env.ALLOW_CORS || `http://localhost:8080`,
};

app.use(cors(corsOptions));

app.use(express.json());

app.use(express.urlencoded({ extended: true }));

init(app, PORT);
