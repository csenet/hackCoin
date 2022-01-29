// Websocket

const express = require('express'),
  app = express(),
  bodyParser = require('body-parser'),
  router = require('./routes/router')

app.use(bodyParser.urlencoded({
  extended: true
}));
app.use(bodyParser.json());
app.use('/', router)

app.listen(3000)
