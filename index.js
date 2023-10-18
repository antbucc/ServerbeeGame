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
    savestate: String
});

const GameModel = mongoose.model('Game', GameSchema);

// Middleware to parse JSON data from the request body
app.use(bodyParser.json());

// POST endpoint to save user data
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

// GET endpoint to retrieve games
app.get('/api/games', async (req, res) => {
    try {
        const games = await GameModel.find(); // Retrieve all games
        return res.status(200).json(games);
    } catch (error) {
        return res.status(500).json({ error: 'Failed to retrieve games.' });
    }
});


//GET endpoint to retrieve a user's savestate by ID
app.get('/api/games/:user', async (req, res) => {
    const user = req.params.user;
    if (!user) {
        return res.status(400).json({ error: 'User ID is required.' });
    }
    try {
        const states = await GameModel.find({ user });
        console.log("STATES: " + states.length);
        if (states.length === 0) {
            return res.status(404).json({ error: 'User not found.' });
        }
        return res.status(200).json(states[0].savestate);
    } catch (error) {
        return res.status(500).json({ error: 'Failed to retrieve user savestate.' });
    }
});


// Start the server
app.listen(port, () => {
    console.log(`Server is running on port ${port}`);
});