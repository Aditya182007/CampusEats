const mongoose = require("mongoose");

const Place = mongoose.model("Place", new mongoose.Schema({
  name: String,
  category: String,
  location: String,
  price: String
}));

async function seedData() {
  try {
    await mongoose.connect(
      process.env.MONGO_URI ||
      "mongodb://127.0.0.1:27017/campuseats"
    );

    await Place.deleteMany({});

    await Place.insertMany([
      {
        name: "Dose Cafe",
        category: "Cafe",
        location: "K Narayanapura Main Road",
        price: "Budget friendly"
      },
      {
        name: "Litti Chokha.com",
        category: "Restaurant",
        location: "Opposite Kristu Jayanti",
        price: "₹200-400"
      },
      {
        name: "FRIED A",
        category: "Fast Food",
        location: "Opposite Kristu Jayanti University",
        price: "Budget friendly"
      },
      {
        name: "College Hangout",
        category: "Hangout",
        location: "Near campus",
        price: "Check locally"
      }
    ]);

    console.log("Sample places added!");
  } catch (err) {
    console.log(err.message);
  } finally {
    await mongoose.disconnect();
  }
}

seedData();