import express from "express";

import helment from "helmet";
import http from "http";
import bodyParser from "body-parser";
import publishRouter from "./routes/publishRoutes";
import * as dotenv from "dotenv";
dotenv.config();
const app = express();

// To prevent common security floaw like rate limiting, DDOS
app.use(helment());

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));

// Express Routing
app.use("/", publishRouter);

const publisherPort = process.env.publisherPort;
http.createServer(app).listen(publisherPort, () => {
  console.log(`Server Connected to PORT ${publisherPort}`);
});

module.exports = app;
