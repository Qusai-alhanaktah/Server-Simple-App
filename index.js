'use strict';

require('dotenv').config();
const mongoose = require('mongoose');
const server = require('./server/server.js');

const mongoOption = {
  useNewUrlParser: true,
  useCreateIndex: true,
  useUnifiedTopology: true,
  useFindAndModify: false,
};

mongoose.connect(process.env.MONGODB_URI, mongoOption);

server.start(process.env.PORT);
