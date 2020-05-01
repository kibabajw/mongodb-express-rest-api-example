'use strict';

let express = require('express');
let app = express();
let port = process.env.PORT || 3000;
let routes = require('./routes');
let mongoose = require('mongoose');

let jsonParser = require('body-parser').json;
let logger = require('morgan');

app.use(logger('dev'));
app.use(jsonParser());

mongoose.connect('mongodb://localhost:27017/qa', {
    useNewUrlParser: true,
    useUnifiedTopology: true
});

let db = mongoose.connection;

db.on('error', function(err){
    console.error('connection error: ' + err);    
});

db.once('open', function(){
    console.log('connected to mongodb succesfully');
});    

app.use(function(req, res, next) {
    res.header('Access-Control-Allow-Origin', '*');
    res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept');
    if (req.method === 'OPTIONS') {
        res.header('Access-Control-Allow-Methods', 'PUT, POST, DELETE');
        return res.status(200).json({});
    }
    next();
});

app.use('/questions', routes);

//catch 404 and pass to error handler
app.use(function(req, res, next){
    let err = new Error('Not ofund');
    err.status = 404;
    next(err);
});

//error handler function
app.use(function(err, req, res, next){
    res.status(err.status || 500);
    res.json({
        error: {
            message: err.message
        }
    });
});

app.listen(port, function(){
    console.log('Express server running on port ' + port);
});