const express = require("express");
const mongoose = require("mongoose");
const bodyParser = require('body-parser');
require("dotenv").config();

const app = express();
const port = process.env.PORT || 3001;

// DB connection
const uri = process.env.ATLAS_URI;

mongoose.connect(uri);

const connection = mongoose.connection;

connection.once('open', () => {

    console.log("Connected Database Successfully");
});

// Create a MongoDB schema and model for a single game 
const GameSchema = new mongoose.Schema({
    user: String,
    savestate: {
        flowerNumber: Number,
        fishNumber: Number,
        tutorialComplete: Boolean,
    },
});

const GameModel = mongoose.model('Game', GameSchema);

// Middleware to parse JSON data from the request body
app.use(bodyParser.json());

// Create a POST endpoint to save user data
app.post('/api/games', async (req, res) => {
    const { user, savestate } = req.body;

    if (!user || !savestate) {
        return res.status(400).json({ error: 'Both user and savestate are required.' });
    }

    try {
        const newGame = new GameModel({ user, savestate });
        await newGame.save();
        return res.status(201).json(newGame);
    } catch (error) {
        return res.status(500).json({ error: 'Failed to save game data.' });
    }
});


app.get("/", (req, res) => {
    res.send("Welcome to Bee Game!");
});

// Create a GET endpoint to retrieve games
app.get('/api/games', async (req, res) => {
    try {
        const games = await GameModel.find(); // Retrieve all games
        return res.status(200).json(games);
    } catch (error) {
        return res.status(500).json({ error: 'Failed to retrieve games.' });
    }
});

// Start the server
app.listen(port, () => {
    console.log(`Server is running on port ${port}`);
});