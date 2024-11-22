require('dotenv').config();
const express = require('express');
const cors = require('cors');
const mysql = require('mysql2');
const fs = require('fs');
const multer = require('multer');
const redis = require('redis');
const amqp = require('amqplib');
const app = express();
const upload = multer({ dest: 'uploads/' });
const port = 3000;

const client = redis.createClient({
  url: `redis://${process.env.REDIS_HOST || 'redis'}:6379`,
});

async function connectRedis(retries = 5) {
  while (retries) {
    try {
      await client.connect();
      console.log('Connected to Redis successfully!');
      return; // Exit if successful
    } catch (err) {
      console.error('Redis connection failed:', err);
      retries -= 1;
      console.log(`Retrying to connect to Redis... (${5 - retries} retries left)`);
      await new Promise(res => setTimeout(res, 5000)); // Wait before retrying
    }
  }
  console.error('Could not connect to Redis after multiple attempts');
}

// MySQL connection pool
const pool = mysql.createPool({
  host: process.env.DB_HOST || 'mysql',
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD || 'Mck050604@',
  database: process.env.DB_NAME || 'midterm_nodejs',
  port: 3306,
});

async function connectMySQL(retries = 5) {
  while (retries) {
    try {
      const connection = await pool.promise().getConnection();
      console.log('Connected to MySQL successfully!');
      connection.release();
      return; // Exit if successful
    } catch (err) {
      console.error('Error connecting to MySQL:', err);
      retries -= 1;
      console.log(`Retrying to connect to MySQL... (${5 - retries} retries left)`);
      await new Promise(res => setTimeout(res, 5000)); // Wait before retrying
    }
  }
  console.error('Could not connect to MySQL after multiple attempts');
}
// RabbitMQ channel
let channel;
async function connectRabbitMQ(retries = 5) {
  while (retries) {
    try {
      const connection = await amqp.connect(`amqp://guest:guest@rabbitmq:5672`);
      channel = await connection.createChannel();
      await channel.assertQueue('uploadQueue');
      console.log("RabbitMQ connected and channel created");
      listenForMessages();
      return; // Exit function if successful
    } catch (err) {
      console.error('Failed to connect to RabbitMQ:', err);
      retries -= 1;
      console.log(`Retrying to connect to RabbitMQ... (${5 - retries} retries left)`);
      await new Promise(res => setTimeout(res, 5000)); // Wait before retrying
    }
  }
  console.error('Could not connect to RabbitMQ after multiple attempts');
}

connectRedis();
connectMySQL();
connectRabbitMQ();

app.use(cors({
  origin: 'http://localhost:3001',
}));




app.post('/upload', upload.single('image'), async (req, res) => {
  const filePath = req.file.path;
  if (channel) {
    try {
      await channel.sendToQueue('uploadQueue', Buffer.from(filePath));
      console.log(`File path ${filePath} sent to RabbitMQ queue`);
      client.set(filePath, 'queued');

      const responseTime = new Date();
      console.log(`Response sent at ${responseTime.toISOString()}`);
      res.json({ message: 'Image uploaded and processing started' });
    } catch (error) {
      console.error('Error sending to RabbitMQ:', error);
      res.status(500).json({ error: 'Failed to send message to RabbitMQ' });
    }
  } else {
    res.status(500).json({ error: 'RabbitMQ channel is not available' });
  }
});

async function processFile(filePath) {
  const startTime = new Date(); 
  console.log(`Started processing file: ${filePath} at ${startTime.toISOString()}`);

  await new Promise(resolve => setTimeout(resolve, 5000)); 

  const endTime = new Date(); 
  const timeTaken = endTime - startTime; 

  console.log(`File ${filePath} has been processed at ${endTime.toISOString()} - Time taken: ${timeTaken} ms`);
  fs.unlink(filePath, (err) => {
    if (err) console.error('Error deleting local file:', err);
  });
}

function listenForMessages() {
  if (channel) {
    channel.consume('uploadQueue', async (msg) => {
      const filePath = msg.content.toString();
      await processFile(filePath);
      channel.ack(msg); 
    });
    console.log("Listening for messages on 'uploadQueue'");
  } else {
    console.error("Cannot listen for messages, channel is undefined");
  }
}

app.get('/api/users', async (req, res) => {
  try {
    const cachedUsers = await client.get('users');
    if (cachedUsers) {
      console.log("Users fetched from Redis cache");
      return res.json(JSON.parse(cachedUsers));
    }
    pool.query('SELECT * FROM users', (err, results) => {
      if (err) {
        console.error('Error executing query:', err);
        return res.status(500).send('Error fetching users');
      }

      console.log("Users fetched from MySQL database");
      client.setEx('users', 3600, JSON.stringify(results)); // Cache for 1 hour
      res.json(results);
    });
  } catch (error) {
    console.error('Error fetching users:', error);
    return res.status(500).send('Error fetching users');
  }
});

app.listen(port, () => {
  console.log(`Server running at http://localhost:${port}`);
});

// Close Redis client and RabbitMQ channel on exit
process.on('SIGINT', async () => {
  if (channel) {
    await channel.close();
    console.log("RabbitMQ channel closed");
  }
  await client.quit();
  console.log("Redis client disconnected");
  process.exit();
});
