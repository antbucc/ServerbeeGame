const express = require("express");
require("dotenv").config();

const app = express();
const port = process.env.PORT || 3001;

app.get("/", (req, res) => {
    res.send("Hello World");
});

app.listen(port, () => console.log(`App listening on port: ${port}`));