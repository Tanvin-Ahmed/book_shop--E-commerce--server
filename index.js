const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const MongoClient = require('mongodb').MongoClient;
const ObjectID = require('mongodb').ObjectID;
require('dotenv').config();

const app = express();
app.use(bodyParser.json());
app.use(cors());

app.get('/', (req, res) => {
  res.send(`<h1>NODE.JS</h1>`)
})


const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.zhub4.mongodb.net/${process.env.DB_NAME}?retryWrites=true&w=majority`;
const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true });
client.connect(err => {
  const bookCollection = client.db(`${process.env.DB_NAME}`).collection(`${process.env.DB_BOOK_COLLECTION}`);
  const orderCollection = client.db(`${process.env.DB_NAME}`).collection(`${process.env.DB_ORDER_COLLECTION}`);

  // bookCollection 
  app.post('/addBook', (req, res) => {
    const newBook = req.body;
    bookCollection.insertOne(newBook)
      .then(result => {
        console.log(result.insertedCount);
        res.send(result.insertedCount > 0);
      })
  })


  app.get('/books', (req, res) => {
    bookCollection.find()
      .toArray((error, books) => {
        if (error) {
          console.log(error);
        }
        else {
          res.send(books);
        }
      })
  })

  app.get('/chosenBook/:id', (req, res) => {
    const id = ObjectID(req.params.id);
    bookCollection.find({ _id: id })
      .toArray((error, documents) => {
        if (error) {
          console.log(error);
        }
        else {
          res.send(documents[0]);
        }
      })
  })

  app.patch('/update/:id', (req, res) => {
    const id = ObjectID(req.params.id);
    bookCollection.updateOne({ _id: id },
      {
        $set: {
          name: req.body.name,
          author: req.body.author,
          price: req.body.price
        }
      })
      .then(result => {
        res.send(result.modifiedCount > 0);
      })
  })

  app.delete('/deleteBook/:id', (req, res) => {
    const id = ObjectID(req.params.id);
    bookCollection.findOneAndDelete({ _id: id })
      .then(documents => res.send(documents.value))
  })

  // orderCollection
  app.post('/placeOrder', (req, res) => {
    const newCheckout = req.body;
    orderCollection.insertOne(newCheckout)
      .then(result => {
        res.send(result.insertedCount > 0);
      })
      .catch(err => console.log(err));
  })

  app.get('/getCurrentUserOrder', (req, res) => {
    const email = req.query.email;
    orderCollection.find({ email: email })
      .toArray((err, documents) => {
        if (err) {
          console.log(err);
        }
        else {
          res.send(documents);
        }
      })
  })

  app.delete('/cancelOrder/:id', (req, res) => {
    const id = req.params.id;
    console.log(id)
    orderCollection.findOneAndDelete({ _id: id })
      .then(documents => res.send(documents.value))
  })

  console.log('Database connected')
});


app.listen('5000' || process.env.PORT, () => console.log('Server is Connected'))