const { MongoClient } = require("mongodb");

const uri = process.env.DB_URL;
if (!uri) {
    throw new Error("DB_URL is not defined");
}

const client = new MongoClient(uri);
const db = client.db("carsvp");

const users = db.collection("users");
const cars = db.collection("cars");
const events = db.collection("events");
const eventAttending = db.collection("eventAttending");

// test the connection
async function main() {
    await client.connect();
    console.log("Connected to MongoDB");
    await client.close();
}

module.exports = { users, cars, events, eventAttending };