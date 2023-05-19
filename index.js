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
            const query = req.query;
            if (query?.sub_category) {
                const subCategoryQuery = {
                    subCategory: query?.sub_category,
                };
                if (query?.limit) {
                    const limitQuery = parseInt(query?.limit);
                    const result = await toysCollection
                        .find(subCategoryQuery)
                        .limit(limitQuery)
                        .toArray();
                    res.send(result);
                } else {
                    const result = await toysCollection
                        .find(subCategoryQuery)
                        .toArray();
                    res.send(result);
                }
            } else {
                const result = await toysCollection.find().limit(20).toArray();
                res.send(result);
            }
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
            const emailQuery = { email: query?.email };
            const sortingMethod = req.query?.sort;
            if (sortingMethod === "ascending") {
                const result = await toysCollection
                    .find(emailQuery)
                    .collation({ locale: "en_US", numericOrdering: true })
                    .sort({ price: 1 })
                    .toArray();
                res.send(result);
            } else if (sortingMethod === "descending") {
                const result = await toysCollection
                    .find(emailQuery)
                    .collation({ locale: "en_US", numericOrdering: true })
                    .sort({ price: -1 })
                    .toArray();
                res.send(result);
            } else {
                const result = await toysCollection.find(emailQuery).toArray();
                res.send(result);
            }
        });

        app.post("/add-a-toy", async (req, res) => {
            const toy = req.body;
            const result = await toysCollection.insertOne(toy);
            res.send(result);
        });

        app.patch("/all-toys/:id", async (req, res) => {
            const id = req.params.id;
            const filter = { _id: new ObjectId(id) };
            const updatedToy = req.body;
            const updatedDoc = {
                $set: {
                    photoURL: updatedToy.photoURL,
                    name: updatedToy.name,
                    subCategory: updatedToy.subCategory,
                    price: updatedToy.price,
                    rating: updatedToy.rating,
                    quantity: updatedToy.quantity,
                    description: updatedToy.description,
                },
            };
            const result = await toysCollection.updateOne(filter, updatedDoc);
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
