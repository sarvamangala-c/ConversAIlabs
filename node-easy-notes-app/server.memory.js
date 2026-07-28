const express = require('express');
const bodyParser = require('body-parser');

// create express app
const app = express();

// parse application/x-www-form-urlencoded
app.use(bodyParser.urlencoded({ extended: true }))

// parse application/json
app.use(bodyParser.json())

// define a simple route
app.get('/', (req, res) => {
    res.json({"message": "Welcome to EasyNotes application. Take notes quickly. Organize and keep track of all your notes. (Running in memory mode)"});
});

require('./app/routes/note.routes.memory.js')(app);

// listen for requests
app.listen(3000, () => {
    console.log("Server is listening on port 3000 (Memory Mode - No MongoDB required)");
});