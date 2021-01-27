import express from "express";

import helmet from "helmet";
import http from "http";
import bodyParser from "body-parser";
import subscribeRouter from "./routes/subscriberRoutes";
import * as dotenv from "dotenv";

dotenv.config();

const app = express();
// To prevent common security floaw like rate limiting, DDOS
app.use(helmet());

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));

// Express Routing
app.use("/", subscribeRouter);

const subscriberPort = process.env.subscriberPort;
http.createServer(app).listen(subscriberPort, () => {
  console.log(`Server Connected to PORT ${subscriberPort}`);
});

module.exports = app;
