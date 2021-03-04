const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const mongoose = require('mongoose');
const config = require('./config/env');
const http = require('http');

mongoose.connect(config.database.url, { useNewUrlParser: true });
mongoose.connection.on('connected', () => {
    console.log('Connected to Database ' + config.database.url);
});
mongoose.connection.on('error', (err) => {
    console.log('Database error ' + err);
});
const app = express();

//Routes
const peakloadmanagement = require('./routes/peakloadmanagement')
const electricvehiclesupplyequipment = require('./routes/electricvehiclesupplyequipment')
app.use(function (req, res, next) {
    res.header("Access-Control-Allow-Origin", "*");
    res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
    next();
});

//Ports
const port = process.env.PORT || 4000;
var production = false;

//CORS
if (production) {
    //app.use(cors({ origin: 'address_here' }));
} else {
    app.use(cors({ origin: "*" }));
}

// Body Parser Middleware
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

//App Starts
app.use('/peakloadmanagement', peakloadmanagement)
app.use('/electricvehiclesupplyequipment', electricvehiclesupplyequipment)
if (production) {
    var distDir = __dirname + "/dist/";
    app.use('/', express.static(distDir));
    app.get('*', (req, res) => {
        res.sendFile(distDir + "index.html");
    });
    const server = http.createServer(app);
    server.listen(port, () => {
        console.log('Server started on port ' + port);
    });
    app.use(express.static(distDir));
}
else {
    app.get('/', (req, res) => {
        res.send('HELLO WORLD!');
    });
    app.get('*', (req, res) => {
        res.sendFile(path.join(__dirname, 'public/index.html'));
    });
    // Start Server
    app.listen(port, () => {
        console.log('Server started on port ' + port);
    });
}