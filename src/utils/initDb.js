const { MongoClient } = require('mongodb');

const initDb = async () => {
  try {
    const client = new MongoClient(process.env.DB_URI);
    await client.connect();
    const db = client.db(process.env.DB_NAME);
    return db;
  } catch (error) {
    console.error(error);
    throw error;
  }
};

module.exports = initDb;
