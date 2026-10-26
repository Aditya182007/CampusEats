const express = require("express");
const mongoose = require("mongoose");
const path = require("path");

const app = express();

app.use(express.json());
app.use(express.static(path.join(__dirname, "public")));

mongoose.connect(
  process.env.MONGO_URI || "mongodb://127.0.0.1:27017/campuseats"
)
.then(() => console.log("MongoDB Connected"))
.catch(err => console.log("MongoDB Error:", err.message));
const placeSchema = new mongoose.Schema({
  name: String,
  category: String,
  location: String,
  price: String
});

const Place = mongoose.model("Place", placeSchema);

// Get all places
app.get("/api/places", async (req, res) => {
  try {
    const places = await Place.find();
    res.json(places);
  } catch (err) {
    res.status(500).json({ error: "Unable to load places" });
  }
});

// Add a new place
app.post("/api/places", async (req, res) => {
  try {
    const place = await Place.create(req.body);
    res.status(201).json(place);
  } catch (err) {
    res.status(400).json({ error: "Unable to add place" });
  }
});

const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
  console.log(`CampusEats running at http://localhost:${PORT}`);
});