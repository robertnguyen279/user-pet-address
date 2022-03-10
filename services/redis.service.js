const { createClient } = require('redis');
const redisClient = createClient();

const set = async (key, value) => {
  redisClient.connect();
  await redisClient.set(key, JSON.stringify(value));
  redisClient.disconnect();
};

const get = async (key) => {
  redisClient.connect();
  const result = await redisClient.get(key);
  redisClient.disconnect();
  return JSON.parse(result);
};

const del = async (key) => {
  redisClient.connect();
  await redisClient.del(key);
  redisClient.disconnect();
  return;
};

module.exports = { get, set, del };
