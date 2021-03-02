import dotenv from 'dotenv';

const connectToDB = () => {
  // Load in environment variables from file.
  dotenv.config();

  // Log the values.
  console.log(`Host = ${process.env.HOST}`);
  console.log(`User = ${process.env.USER}`);
  console.log(`Password = ${process.env.PASSWORD}`);
  console.log(`Port = ${process.env.PORT}`);
};

export default connectToDB;
