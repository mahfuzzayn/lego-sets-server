const express = require("express");
const cors = require("cors");
const app = express();
const port = process.env.PORT || 5000;

// middleware
app.use(cors());
app.use(express.json());

app.get("/", (req, res) => {
    res.send("Lego Sets Server is currently Building Lego Architecture!!!");
});

app.listen(port, () => {
    console.log(`Lego Sets Server is Running on Port: ${port}`)
})
