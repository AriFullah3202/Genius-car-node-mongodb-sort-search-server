const express = require('express');
const cors = require('cors')
const jwt = require('jsonwebtoken');
const app = express()
const port = process.env.PORT || 5000;
// middle wares
app.use(cors())
//this middleware to save data in mongodb
app.use(express.json())
//it for env file config
require('dotenv').config();



const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');
const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASSWORD}@cluster0.wg8wdsp.mongodb.net/?retryWrites=true&w=majority`;
console.log(uri)
// const token = require('crypto').randomBytes(64).toString('hex')
// console.log(token)


const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true, serverApi: ServerApiVersion.v1 });

// eita 3ta parameter nibe 
function verifyJWT(req, res, next) {
    const authHeader = req.headers.authorization;
    if (!authHeader) {
        return res.status(401).send({ message: 'unauthorized access' })
    }
    const token = authHeader.split(' ')[1]
    jwt.verify(token, process.env.ACCESS_TOKEN_SECRET, (err, decoded) => {
        if (err) {
            return res.status(401).send({ message: 'unauthorized access' })
        }
        req.decoded = decoded;
        next();
    })

}

async function run() {
    const serviceCollection = client.db('geniusCar').collection('services')
    // order er jonne different collection korlam
    const orderCollection = client.db('geniusCar').collection('orders')

    app.post('/jwt', async (req, res) => {
        const user = req.body;
        const token = jwt.sign(user, process.env.ACCESS_TOKEN_SECRET, { expiresIn: '5' })
        res.send({ token })
    })


    app.get('/services', async (req, res) => {
        const query = {};
        const cursor = serviceCollection.find(query);
        const services = await cursor.toArray();
        res.send(services)
    })
    app.get('/service/:id', async (req, res) => {
        // ekhane id pelam
        const id = req.params.id;
        //ekhane match korlam mongodb er objectId er sathe
        //objectId import korte hbe 
        const query = { _id: ObjectId(id) };
        //mongodb collection er sathe kujlam 
        const service = await serviceCollection.findOne(query);
        // ui te then e data patalam
        res.send(service);
    })
    // get data all order
    app.get('/orders', verifyJWT, async (req, res) => {

        const decoded = req.decoded;
        console.log('inside oders api ', decoded)

        // {} that means all data fetch 
        let query = {}
        if (req.query.email) {
            query = {
                email: req.query.email
            }
        }
        // find all order from mongodb
        const cursor = orderCollection.find(query);
        const orders = await cursor.toArray()
        res.send(orders);
    })

    // apply for post order
    app.post('/orders', async (req, res) => {
        const order = req.body;
        const result = await orderCollection.insertOne(order)
        res.send(result)
        console.log(result)
    }) //for delete opration
    app.delete('/orders/:id', async (req, res) => {
        const id = req.params.id;
        const query = { _id: ObjectId(id) };
        const result = await orderCollection.deleteOne(query);
        res.send(result)
    })
    app.patch('/orders/:id', async (req, res) => {

        //ekhane kon id ta updata korbo oita recieve korlam
        const id = req.params.id;
        // ekhane je property k update korbo oita raklam
        const status = req.body.status;
        const query = { _id: ObjectId(id) }
        const updatedDoc = {
            $set: {
                status: status
            }
        }
        //for update
        const result = await orderCollection.updateOne(query, updatedDoc);
        res.send(result);
    })

}
run().catch(err => { console.log(err) })



app.get('/', (req, res) => {
    res.send('geneus car server')
})

app.listen(port, () => {
    console.log(`server running on port ${port}`)
})
