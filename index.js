const express = require('express');
const cors = require('cors');
require('dotenv').config();

const port = process.env.PORT || 3000;

const app = express();

app.use(cors());
app.use(express.json());


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

    app.get('/todo', async (req, res) =>{
        const result = await todoCollection.find().toArray();
        res.send(result);
    })
    
    app.post('/todo', async (req, res) =>{
        const data = req.body;
        const result = await todoCollection.insertOne(data);
        res.send(result);
    })

    app.get('/todo/:id', async (req, res) =>{
        const id = req.params.id;
        const query = {_id: new ObjectId(id)};
        const result = await todoCollection.findOne(query);
        res.send(result);
    })


  } finally {
    // Ensures that the client will close when you finish/error
    // await client.close();
  }
}
run().catch(console.dir);


app.get('/', async (req, res) =>{
    res.send('Server Started');
})

app.listen(port, () => {
    console.log(`Server is running at PORT: ${port}`); 
})
