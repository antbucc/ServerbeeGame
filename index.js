const express = require("express");
const mongoose = require("mongoose");
const bodyParser = require('body-parser');
const { bool } = require("jshint/src/options");
require("dotenv").config();

const app = express();
const port = process.env.PORT || 3001;
const cors = require('cors');




// DB connection
const uri = process.env.ATLAS_URI;

mongoose.connect(uri);

const connection = mongoose.connection;

connection.once('open', () => {

    console.log("Connected Database Successfully");
});

const subjectData = new mongoose.Schema({
    userID: String,
    fishNumber: Number,
    flowerNumber: Number,
    goodActions: Number,
    badActions: Number,
    plasticStings: Number,
    detergentStings: Number,
    recycledRubbish: Number,
    preAnswers: [Number],
    postAnswers: [Number],
    numberOfParagraphsRead: Number,
    readingTimes: [Number],
    readingTimePerParagraph: Number,
    knowledgeIndex: Number,
    tutorialDone: Boolean,
    finished: Boolean,
    language: String
});


// Create a MongoDB schema and model for a single game 
const GameSchema = new mongoose.Schema({
    user: String,
    savestate: String,
    subjectData: subjectData
});


const GameModel = mongoose.model('Game', GameSchema);

// Enable CORS for all routes
app.use(cors());


// Middleware to parse JSON data from the request body
app.use(bodyParser.json());


app.use((req, res, next) => {
    res.setHeader('Access-Control-Allow-Origin', '*');
    next();
});


// POST endpoint to save game data for a user
app.post('/api/games', async (req, res) => {
    const { user, savestate, subjectData } = req.body;

    if (!user || !savestate || !subjectData) {
        return res.status(400).json({ error: 'user, savestate and subjectData are required.' });
    }

    try {
        // Check if a user with the same identifier already exists
        const existingGame = await GameModel.findOne({ user: user });

        if (existingGame) {
            // If the user exists, update the existing record
            existingGame.savestate = savestate;
            existingGame.subjectData = subjectData;
            await existingGame.save();
            return res.status(200).json(existingGame);
        } else {
            // If the user doesn't exist, create a new record
            const newGame = new GameModel({ user, savestate, subjectData });
            await newGame.save();
            return res.status(201).json(newGame);
        }
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
app.listen(port, "0.0.0.0", () => {
    console.log(`Server is running on port ${port}`);
});

