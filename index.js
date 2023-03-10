const express = require('express');
const cors = require('cors');
const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');
const stripe = require("stripe")(process.env.STRIPE_SECRET_KEY);

require('dotenv').config();
// const stripe = require("stripe")(process.env.STRIPE_SECRET_KEY);

const port = process.env.PORT || 5000;

const app = express();

// middleware
app.use(cors());
app.use(express.json());

const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASSWORD}@cluster0.9wy3smt.mongodb.net/?retryWrites=true&w=majority`;

const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true, serverApi: ServerApiVersion.v1 });





async function run(){
  try{
    const categoriesCollection = client.db('Art_Sell').collection('Categories');
    const productCollection = client.db('Art_Sell').collection('products');
    const usersCollection = client.db('Art_Sell').collection('allUsers');
    const bookingsCollection = client.db('Art_Sell').collection('booking');
    const paymentsCollection = client.db('Art_Sell').collection('payments');
    

    // const verifyAdmin = async (req, res, next) => {
    //     const decodedEmail = req.decoded.email;
    //     const query = { email: decodedEmail };
    //     const user = await usersCollection.findOne(query);

    //     if (user?.role !== 'admin') {
    //         return res.status(403).send({ message: 'forbidden access' })
    //     }
    //     next();
    // }
    // const verifyBuyer = async (req, res, next) => {
    //     const decodedEmail = req.decoded.email;
    //     const query = { email: decodedEmail };
    //     const user = await usersCollection.findOne(query);

    //     if (user?.role !== 'buyer') {
    //         return res.status(403).send({ message: 'forbidden access' })
    //     }
    //     next();
    // }
    // const verifySeller = async (req, res, next) => {
    //     const decodedEmail = req.decoded.email;
    //     const query = { email: decodedEmail };
    //     const user = await usersCollection.findOne(query);

    //     if (user?.role !== 'seller') {
    //         return res.status(403).send({ message: 'forbidden access' })
    //     }
    //     next();
    // }

  
        app.get('/products', async(req,res)=>{
            const query = {}
            const cursor = productCollection.find(query);
            const categories = await (await cursor.toArray());
            res.send(categories);
        })
      
        app.post('/products',  async (req, res) => {
            const product = req.body;
            const result = await productCollection.insertOne(product);
            res.send(result);
        });

        

        app.get('/categories', async(req,res)=>{
            const query = {}
            const cursor = categoriesCollection.find(query);
            const categories = await (await cursor.toArray());
            res.send(categories);
        })
        app.get('/booking', async(req,res)=>{
            const query = {}
            const cursor = bookingsCollection .find(query);
            const products = await (await cursor.toArray());
            res.send(products );
        })
        app.post('/booking', async (req, res) => {
            const product = req.body;
            const result = await bookingsCollection.insertOne(product);
            res.send(result);
            });
            app.delete('/booking/:id', async (req, res) => {
                const id = req.params.id;
                const query = { _id: new ObjectId(id) };
                const result = await bookingsCollection.deleteOne(query);
                res.send(result);
            })
        
    
    

       

        app.get('/booking', async (req, res) => {
            // const email = req.query.email;
            // const decodedEmail = req.decoded.email;
            // if( email !== decodedEmail){
            //     return res.status(403).send({ message: 'forbidden access' });
            // }
            const query = { };
            const bookings= await bookingsCollection.find(query).toArray();
            res.send(bookings);
        })

        app.get('/booking/:id', async (req, res) => {
            const id = req.params.id;
            const query = { _id:new ObjectId(id) };
            const booking = await bookingsCollection.findOne(query);
            res.send(booking);
        })
        app.get('/create-payment-intent', async (req, res) => {
            const id = req.params.id;
            const query = { _id:new ObjectId(id) };
            const booking = await bookingsCollection.findOne(query);
            res.send(booking);
        })

        app.post('/create-payment-intent', async (req, res) => {
            const booking = req.body;
            const price = booking.price;
            const amount = price * 100;

            const paymentIntent = await stripe.paymentIntents.create({
                currency: 'usd',
                amount: amount,
                "payment_method_types": [
                    "card"
                ]
            });
            res.send({
                clientSecret: paymentIntent.client_secret,
            });
        });

        app.post('/payments', async (req, res) => {
            const payment = req.body;
            const result = await paymentsCollection.insertOne(payment);
            const id = payment.bookingId
            const filter = { _id: new ObjectId(id) }
            const updatedDoc = {
                $set: {
                    paid: true,
                    transactionId: payment.transactionId
                }
            }
            const updatedResult = await bookingsCollection.updateOne(filter, updatedDoc)
            res.send(result);
        })

        // app.post('/bookings', async (req, res) => {
        //     const booking = req.body;
        //     console.log(booking);
        //     const query = {
        //         bookingProduct: booking.product,
        //         email: booking.email,
               
        //     }

        //     const result = await bookingsCollection.insertOne(booking);
        //     res.send(result);
        // });

        app.get('/users', async (req, res) => {
            const query = {};
            const users = await usersCollection.find(query).toArray();
            res.send(users);
        })
        app.post('/users',  async (req, res) => {
            const user = req.body;
            const result = await usersCollection.insertOne(user);
            res.send(result);
        });
        app.delete('/users/:id',  async (req, res) => {
            const id = req.params.id;
            const filter = { _id: new ObjectId(id) };
            const result = await usersCollection.deleteOne(filter);
            res.send(result);
        })
        

  }
  finally{

  }
}
run().catch(e=> console.log(e))



app.get('/', async (req, res) => {
    res.send('Art Selling server is running');
})

app.listen(port, () => {console.log(`Art Selling running on ${port}`);
})