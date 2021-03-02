import dotenv from 'dotenv';

const connectToDB = () => {
  // Load in environment variables from file.
  dotenv.config();

  // Log the values.
  console.log(`Host = ${process.env.HOST}`);
  console.log(`User = ${process.env.USER}`);
  console.log(`Password = ${process.env.PASSWORD}`);
  console.log(`dbName = ${process.env.DBNAME}`);

  const MongoClient = require('mongodb').MongoClient;
  const uri = `mongodb+srv://${process.env.USER}:${process.env.PASSWORD}
               ${process.env.HOST}/${process.env.DBNAME}?retryWrites=true&w=majority`;

  const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true });

  client.connect(err => {
    const collection = client.db("test").collection("devices");
    // perform actions on the collection object
    client.close();
  });
};

export default connectToDB;
