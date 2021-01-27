import express from "express";

const router = express.Router();

import PubsubManager from "../PubsubManager.js";

const pubsub = new PubsubManager();

router.post("/publish/:topic", (req, res) => {
  pubsub.publish(req.params.topic, JSON.stringify(req.body.data));
  res.status(201).send({
    topic: req.params.topic,
    data: req.body.data,
  });
});

module.exports = router;
