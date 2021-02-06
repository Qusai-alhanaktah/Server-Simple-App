'use strict';

const express = require('express');
const bcrypt = require('bcryptjs');
const routes = express.Router();
const Users = require('./auth.js');

// CALCULATION API

routes.post('/api/v1/calculate', (req, res, next) => {
  console.log(req.body);
  let { firstNumber, secondNumber, operation } = req.body;
  var result;
  switch (operation) {
    case '+':
      result = firstNumber + secondNumber;
      break;
    case '-':
      result = firstNumber - secondNumber;
      break;
    case '*':
      result = firstNumber * secondNumber;
      break;
    case '/':
      result = firstNumber / secondNumber;
      break;
    default:
      result = 'invalid operation';
      break;
  }
  res.status(200).send(`${result}`);
});

// AUTH API

routes.post('/signup', (req, res, next) => {
  Users.findOne({username: req.body.username})
  .then(user => {
    if (user) {
      res.status(200).send({
        message : 'This user is existed',
        user: {},
        token: ''
      });
    } else {
      let user = new Users(req.body);
      user.save()
      .then(data => {
        let token = user.generateToken(data);
        res.status(200).send({
          message : 'Sign Up Successfully',
          user: {
            username: user.username,
            email: user.email
          },
          token: token
        });
      }).catch(next);
    }
  })
});

routes.post('/signin', basicAuth, (req, res) => {
  res.status(200).send({
    message : req.message,
    user: {
      username: req.user.username,
      email: req.user.email
    },
    token: req.token
  });
});

routes.post('/changePassword', changePassword, (req, res) => {
  res.status(200).send({
    message : req.message,
    user: {
      username: req.user.username,
      email: req.user.email
    },
    token: req.token,
  });
});

routes.post('/forgetPass', checkAccount, (req, res) => {
  res.status(200).send({
    message : req.message,
    user: {
      username: req.user.username,
      email: req.user.email
    },
    token: req.token,
  });
});

function checkAccount(req, res, next) {
  Users.findOne({ username: req.body.username, email: req.body.email })
  .then(user => {
    if (user) {
      req.message = 'Create a new password';
      req.user = user;
      req.token = user.generateToken(user);
    } else {
      req.message = 'Invalid Email or Username';
      req.user = {};
    }
    next()
  });
}

function changePassword(req, res, next) {
  Users.findOne({ username: req.body.username, email: req.body.email })
  .then(user => {
    if (user) {
      bcrypt.hash(req.body.password, 10)
      .then(newPassword => {
        user.password = newPassword;
        Users.findByIdAndUpdate(user.id, user, {new: true})
        .then(updatedUser => {
          req.message = 'Created a new password Successfully';
          req.user = updatedUser;
          req.token = updatedUser.generateToken(updatedUser);
          next()
        });
      });
    } else {
      req.message = 'Invalid Email or Username';
      next()
    }
  });
}

function basicAuth (req, res, next) {
  let [authType, encodedString] = req.headers.authorization.split(/\s+/);

  switch(authType.toLowerCase()) {
  case 'basic':
    return authBasic(encodedString);
  default:
    break;
  }

  function authBasic(authString) {
    let base64Buffer = Buffer.from(authString,'base64');
    let bufferString = base64Buffer.toString();
    let [username,password] = bufferString.split(':');
    let auth = {username,password};
    return Users.authenticateBasic(auth)
    .then( user =>{
        if (typeof user == 'string') {
          req.user = {};
          req.message = user;
          req.token = '';
          next();
        } else {
          req.user = user;
          req.message = 'Sign In Successfully';
          req.token = user.generateToken(user);
          next();
        }
      });
  }
}
module.exports = routes;
