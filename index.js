const express = require('express')
const cors = require('cors');
const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');
require('dotenv').config()
const app = express()
const port = process.env.PORT || 5000

// middleware
app.use(
    cors({
      origin: ["http://localhost:5173"],
      credentials: true,
    })
  );
  app.use(express.json())
  


app.get('/', (req, res) => {
  res.send('Welcome to your task manager server!')
})


const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.ctrkbrk.mongodb.net/?retryWrites=true&w=majority`;

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
    await client.connect();

    const database = client.db("TaskManagerDB");
    const TaskCollection = database.collection("TaskCollection");
   
    // middlewares
    const verifyToken = (req, res, next) => {
        // console.log('inside verify token', req.headers.authorization);
        if (!req.headers.authorization) {
          return res.status(401).send({ message: "unauthorized access" });
        }
        const token = req.headers.authorization.split(" ")[1];
        jwt.verify(token, process.env.SECRET, (err, decoded) => {
          if (err) {
            return res.status(401).send({ message: "unauthorized access" });
          }
          req.decoded = decoded;
          next();
        });
      };
    // Read all tasks
    app.get('/tasks', async(req,res)=>{  
      const result = await TaskCollection.find().toArray();
      res.send(result);
    })
    // Read specific user tasks
    app.get('/tasks/email', async(req,res)=>{  
      const email = req.query.email
      const query = {email : email}
      const result = await TaskCollection.find(query).toArray();
      res.send(result);
    })
    // post tasks
    app.post('/tasks', async(req,res)=>{
        const newTask= req.body
        console.log(newTask)
        const result = await TaskCollection.insertOne(newTask);
        res.send(result)
      })

      // get single product
    app.get('/tasks/:id', async (req, res) => {
          const id = req.params.id
          const filter = { _id: new ObjectId(id) }
          const result = await TaskCollection.findOne(filter); 
          res.send(result);
        })
        
    // update by id
    app.put('/tasks/:id', async (req, res) => {
      const id = req.params.id;
      const Task = req.body;
      console.log("Body", id, Task);
      const filter = { _id: new ObjectId(id) };
      const options = { upsert: true };
      const updatedTAsk ={
        $set: {
         name : Task.name,
         price : Task.price,
         rating : Task.rating,
         brands : Task.brands,
         types : Task.types,
         description : Task.description,
         photo : Task.photo,

      },
    };
      const result = await TaskCollection.updateOne(
        filter,
        updatedTask,
        options
      );
      res.send(result);
    });


    //delete

       
          app.delete('/tasks/:id', async (req, res) => {
            const id = req.params.id;
            const query = { _id: new ObjectId(id) }
            const result = await TaskCollection.deleteOne(query);
            res.send(result);
        })
          


    // Send a ping to confirm a successful connection
    await client.db("admin").command({ ping: 1 });
    console.log("Pinged your deployment. You successfully connected to MongoDB!");

  } finally {
 
  }
}
run().catch(console.dir);


app.listen(port, () => {
  console.log(`Your task manager server is listening on port ${port}`)
})