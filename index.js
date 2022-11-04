const express = require('express');
const cors = require('cors')
const app = express()
const port = process.env.PORT || 5000;
// middle wares
app.use(cors())
app.use(express.json())
//it for env file config
require('dotenv').config();

const { MongoClient, ServerApiVersion } = require('mongodb');
const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASSWORD}@cluster0.wg8wdsp.mongodb.net/?retryWrites=true&w=majority`;
console.log(uri)
const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true, serverApi: ServerApiVersion.v1 });
client.connect(err => {
    const collection = client.db("test").collection("devices");
    // perform actions on the collection object
    client.close();
});




app.get('/', (req, res) => {
    res.send('geneus car server')
})

app.listen(port, () => {
    console.log(`server running on port ${port}`)
})
