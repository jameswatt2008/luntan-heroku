const { MongoClient } = require('mongodb');
const uri = "mongodb+srv://test1:123@cluster0.jr9zq.mongodb.net/luntan?retryWrites=true&w=majority";
const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true });
client.connect(err => {
  console.log(err);
  const collection = client.db("test").collection("1");
  // perform actions on the collection object
  client.close();

});