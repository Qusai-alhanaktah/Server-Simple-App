'use strict';
// 3rd Party Resources
const express = require('express');
const cors = require('cors');
const morgan = require('morgan');
// Require Resourses
const router = require('./routes.js');
// Prepare the express app
const app = express();


// app using
app.use(cors());
app.use(morgan('dev'));
app.use(express.json());
// app.use(apiRouter);
app.use(router);


/**
 * to fire our server and exports it
 */

module.exports = {
  server: app,
  start: port => {
    let PORT = port || process.env.PORT || 8080;
    app.listen(PORT, () => console.log(`I am Listening on port: ${PORT}`));

  },
};
