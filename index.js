const express = require('express');
const cors = require('cors');
require('dotenv').config();

const http = require("http");
const { Server } = require("socket.io");

const port = process.env.PORT || 3000;

const app = express();

const server = http.createServer(app);

const io = new Server(server, {
  cors: {
    origin: ["http://localhost:5173", "https://task-management-app-web.netlify.app"], // Replace with your frontend URL
    methods: ["GET", "POST", "PUT", "DELETE"],
  },
});

app.use(cors());
app.use(express.json());


io.on("connection", (socket) => {
  console.log(`User Connected: ${socket.id}`);

  // Listening for messages from the client
  socket.on("send_message", (data) => {
    console.log("Message received:", data);
    io.emit("receive_message", data); // Broadcast message to all clients
  });

  // Handle user disconnection
  socket.on("disconnect", () => {
    console.log(`User Disconnected: ${socket.id}`);
  });
});


const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');
const uri = `mongodb+srv://${process.env.DB_USER_NAME}:${process.env.DB_USER_PASS}@cluster0.lgngp.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0`;

// Create a MongoClient with a MongoClientOptions object to set the Stable API version
const client = new MongoClient(uri, {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  }
});

async function run() {
  try {
    // Connect the client to the server	(optional starting in v4.7)
    // await client.connect();
    // Send a ping to confirm a successful connection
    // await client.db("admin").command({ ping: 1 });
    console.log("Pinged your deployment. You successfully connected to MongoDB!");

    const db = client.db('Task-management');
    const todoCollection = db.collection('todo');
    const usersCollection = db.collection('users');

    app.get('/todo', async (req, res) => {
      const result = await todoCollection.find().toArray();
      res.send(result);
    })

    app.post('/todo', async (req, res) => {
      const data = req.body;
      const result = await todoCollection.insertOne(data);
      res.send(result);
    })

    app.get('/todo/:id', async (req, res) => {
      const id = req.params.id;
      const query = { _id: new ObjectId(id) };
      const result = await todoCollection.findOne(query);
      res.send(result);
    })

    app.get('/todoList/:userEmail', async (req, res) => {
      const userEmail = req.params.userEmail;
      // const query = { _id: new ObjectId(id) };
      const result = await todoCollection.find({userEmail}).toArray();
      res.send(result);
    })

    app.delete('/todo/:id', async (req, res) => {
      const id = req.params.id;
      const query = { _id: new ObjectId(id) };
      const result = await todoCollection.deleteOne(query);
      res.send(result);
    })

    app.put('/todo/:id', async (req, res) => {
      const id = req.params.id;
      const query = { _id: new ObjectId(id) };
      const data = req.body;
      const option = {upsert: true};
      const update = {
        $set: {
          category : data.category,
        }
      }
      const result = await todoCollection.updateOne(query, update, option);
      res.send(result);
    })

    // All Users Data

    app.get('/users', async (req, res) => {
      const data = await usersCollection.find().toArray();
      res.send(data);
    })
    
    // app.get('/users/:userEmail', async (req, res) => {
    //   const userEmail = req.params.userEmail;
    //   const data = await usersCollection.findOne({userEmail})
    //   res.send(data);
    // })

    app.post('/users', async (req, res) => {
      try {
        const { email } = req.body;
        const user = req.body;

        const existingUser = await usersCollection.findOne({ email });

        if (existingUser) {
          return res.status(400).send({ message: 'User Alreay Exist.' })
        }

        const data = await usersCollection.insertOne(user);
        res.send(data);
        
      } catch (error) {
        res.status(500).send({ message: 'Internal Server Error', error: error.message })
      }
    })


  } finally {
    // Ensures that the client will close when you finish/error
    // await client.close();
  }
}
run().catch(console.dir);


app.get('/', async (req, res) => {
  res.send('Server Started');
})

server.listen(port, () => {
  console.log(`Server is running at PORT: ${port}`);
})
