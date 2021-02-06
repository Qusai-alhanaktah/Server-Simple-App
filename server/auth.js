const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const mongoose = require('mongoose');

const users = new mongoose.Schema({
  username: {type: String, required: true, unique: true},
  password: {type: String, required: true},
  email:{type: String , required : true},
});

users.pre('save', async function(){
  if (!users.username) {
    this.password = await bcrypt.hash(this.password, 10);
  }
});

users.statics.authenticateBasic = function(auth) {
  return this.findOne({username: auth.username})
    .then(user => {
      if (user) {
        return user.passCompare(auth.password).then(valid =>{
          if (valid) return user
          else return 'Your password is incorrect'
        })
      } else {
        return 'There is no account with this user name, please try to check your username or sign up first'
      }
  }).catch(console.error);
};

users.methods.passCompare = function(password) {
  return bcrypt.compare(password, this.password)
    .then(valid => valid ? this : null);
};


users.methods.generateToken = function(user) {
  let userData = {
    username: user.username,
    userEamil: user.email,
  };
  let token = jwt.sign(userData, process.env.SECRET);
  return token;
};

module.exports = mongoose.model('users',users);
