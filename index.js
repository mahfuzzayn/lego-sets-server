const express = require("express");
const cors = require("cors");
const { MongoClient, ServerApiVersion, ObjectId } = require("mongodb");
require("dotenv").config();
const app = express();
const port = process.env.PORT || 5000;

// middleware
app.use(cors());
app.use(express.json());

const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.wfuffuf.mongodb.net/?retryWrites=true&w=majority`;

const client = new MongoClient(uri, {
    serverApi: {
        version: ServerApiVersion.v1,
        strict: true,
        deprecationErrors: true,
    },
});

async function run() {
    try {
        await client.connect();

        const toysCollection = client.db("toysDB").collection("toys");

        // Toys routes
        app.get("/all-toys", async (req, res) => {
            const result = await toysCollection.find().toArray();
            res.send(result);
        });

        app.get("/toy/:id", async (req, res) => {
            const id = req.params.id;
            const query = { _id: new ObjectId(id) };
            const result = await toysCollection.findOne(query);
            res.send(result);
        });

        app.get("/my-toys", async (req, res) => {
            const query = req.query;
            if (!query.email) {
                res.send({
                    error: "true",
                    message: "email not found in query",
                });
                return;
            }
            const result = await toysCollection.find(query).toArray();
            res.send(result);
        });

        app.post("/add-a-toy", async (req, res) => {
            const toy = req.body;
            const result = await toysCollection.insertOne(toy);
            res.send(result);
        });

        app.delete("/all-toys/:id", async (req, res) => {
            const id = req.params.id;
            const query = { _id: new ObjectId(id) };
            const result = await toysCollection.deleteOne(query);
            res.send(result);
        });

        // Toys routes

        await client.db("admin").command({ ping: 1 });
        console.log(
            "Pinged your deployment. You successfully connected to MongoDB!"
        );
    } finally {
        // Finally Code Goes Here...
    }
}
run().catch(console.dir);

app.get("/", (req, res) => {
    res.send("Lego Sets Server is currently Building Lego Architecture!!!");
});

app.listen(port, () => {
    console.log(`Lego Sets Server is Running on Port: ${port}`);
});