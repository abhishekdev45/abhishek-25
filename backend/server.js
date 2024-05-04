const express = require("express");
const app = express();
const mongoose = require("mongoose");
const dotenv = require("dotenv");
dotenv.config();
const cors = require("cors");

const authRoute = require("./routes/auth");
const memeCoinRoute = require("./routes/meme-coins");
const websiteRoute = require("./routes/website");
const listRoute = require("./routes/list");

app.use(cors());
app.use(express.json());

app.use("/api/user", authRoute);
app.use("/api/meme-coins", memeCoinRoute);
app.use("/api/website", websiteRoute);
app.use("/api/list" , listRoute);

mongoose
  .connect(process.env.MONGO_URL)
  .then(() => {
    console.log("mongodb connected");
    app.listen(process.env.PORT || 5000, () => {
      console.log("Node App running ");
    });
  })
  .catch((err) => {
    console.log(err);
  });
