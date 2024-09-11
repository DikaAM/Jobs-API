require("dotenv").config();
require("express-async-errors");
const express = require("express");
const authUser = require("./middleware/authentication");
const app = express();
const connectDB = require("./db/connect");

//setup security
const helmet = require("helmet");
const cors = require("cors");
const xss = require("xss-clean");
const rateLimiter = require("express-rate-limit");

//router
const authRouter = require("./routes/auth");
const jobsRouter = require("./routes/jobs");
// error handler
const notFoundMiddleware = require("./middleware/not-found");
const errorHandlerMiddleware = require("./middleware/error-handler");

//security
app.set("trust proxy", 1);
app.use(
  rateLimiter({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 100, // limit each IP to 100 requests per windowMs
  })
);
app.use(express.json());
app.use(helmet());
app.use(cors());
app.use(xss());
// extra packages

// routes

app.use("/api/v1/auth", authRouter);
app.use("/api/v1/jobs", authUser, jobsRouter);

app.use(notFoundMiddleware);
app.use(errorHandlerMiddleware);

const port = process.env.PORT || 3000;

const start = async () => {
  try {
    app.listen(port, () =>
      console.log(`Server is listening on port ${port}...`)
    );
    await connectDB(process.env.MONGO_URI);
    console.log("DB connection successful");
  } catch (error) {
    console.log(error);
  }
};

start();
