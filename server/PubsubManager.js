import { PubSub, Topic, Subscription } from "@google-cloud/pubsub";
import retry from "async-retry";
import { join } from "path";
import * as dotenv from "dotenv";

dotenv.config();

export default class PubsubManager {
  constructor() {
    this.projectId = process.env.projectId;

    this.pubsub = new PubSub({ projectId: this.projectId });
  }

  async checkTopicExist(topicName) {
    const fullPath = `projects/${this.projectId}/topics/${topicName}`;
    const [topics] = await this.pubsub.getTopics();

    let topic = topics.find((topic) => fullPath === topic.name);
    return !!topic;
  }

  async getTopic(topicName) {
    let flag = await this.checkTopicExist(topicName);
    let topic;
    if (!flag) {
      [topic] = await this.pubsub.createTopic(topicName);
    } else {
      topic = await this.pubsub.topic(topicName);
    }

    return topic;
  }

  async checkSubscriptionExist(topicName, subscriptionName) {
    const fullPath = `projects/${this.projectId}/subscriptions/${subscriptionName}`;
    const [subscriptions] = await this.pubsub.getSubscriptions();
    let subscription = subscriptions.find((subscription) => {
      return fullPath === subscription.name;
    });
    return !!subscription;
  }

  async getSubscription(topicName, subscriptionName) {
    let flag = await this.checkSubscriptionExist(topicName, subscriptionName);
    let subscription;
    if (!flag) {
      [subscription] = await this.pubsub
        .topic(topicName)
        .createSubscription(subscriptionName);
    } else {
      subscription = await this.pubsub.subscription(subscriptionName);
    }
    return subscription;
  }

  async publish(topicName, data) {
    let topic = await this.getTopic(topicName);
    const dataBuffer = Buffer.from(data);
    const messageId = await topic.publish(dataBuffer);
    console.log(`Message ${messageId} published.`);
  }

  async subscribe(topicName, subscriptionName, fn) {
    try {
      await this.getTopic(topicName, subscriptionName);

      let subscription = await this.getSubscription(
        topicName,
        subscriptionName
      );
      let messageHandler = (message) => {
        console.log(`Received message with id ${message.id}:`);
        try {
          fn(message.data.toString());
          message.ack();
        } catch (err) {
          console.log(err);
          console.log(`Error acknowledging message with id ${message.id}`);
        }
      };
      console.log("Subscribed successfully ===>");
      subscription.on("message", messageHandler);
    } catch (err) {
      this.retrySubscription(topicName, subscriptionName, fn);
    }
  }

  async retrySubscription(topicName, subscriptionName, fn) {
    await retry(
      async (bail) => {
        let subscription = await this.getSubscription(
          topicName,
          subscriptionName
        );
        let messageHandler = (message) => {
          console.log(`Received message with id ${message.id}:`);
          try {
            fn(message.data.toString());
            message.ack();
          } catch (err) {
            console.log(err);
            console.log(`Error acknowledging message with id ${message.id}`);
          }
        };
        subscription.on("message", messageHandler);
      },
      {
        retries: 100,
        minTimeout: 10000,
        maxTimeout: 15000,
        factor: 2,
      }
    );
  }
}
