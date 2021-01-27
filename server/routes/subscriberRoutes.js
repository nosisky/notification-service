import express from "express";

const router = express.Router();

import PubsubManager from "../PubsubManager.js";

const pubsub = new PubsubManager();

router.post("/subscribe/:topic", (req, res) => {
  pubsub.subscribe(req.params.topic, req.body.url, (response) => {
    console.log(JSON.parse(response));
  });
});

module.exports = router;
