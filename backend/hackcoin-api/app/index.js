// Mongoose DB
const mongoose = require('mongoose')
mongoose.connect(`mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASSWORD}@${process.env.DB_HOST}?retryWrites=true&w=majority`)
require('./models/user')


// Redis
require('./services/redisWorker')

// Websocket
require('./services/typetalkWorker')

const express = require('express'),
  app = express(),
  bodyParser = require('body-parser'),
  router = require('./routes/router')

app.use(bodyParser.urlencoded({
  extended: true
}));
app.use(bodyParser.json());
app.use('/', router)

app.listen(8080)
