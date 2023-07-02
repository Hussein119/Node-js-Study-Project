/* eslint-disable import/no-extraneous-dependencies */
const mongoose = require('mongoose');
const validator = require('validator');
// npm i bcryptjs
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Please, Provide a name'],
    trim: true, //remove whitespaces
    maxlength: [40, 'Maxlength is 40 characters!!'],
  },
  photo: String,
  email: {
    type: String,
    unique: true,
    required: [true, 'Please, Provide a email'],
    lowercase: true,
    validate: [validator.isEmail, 'Please provide a valid email'],
  },
  password: {
    type: String,
    required: [true, 'Please, Provide a password'],
    minlength: [8, 'Minlength is 8 characters!!'],
  },
  passwordConfirm: {
    type: String,
    required: [true, 'Please, Confirm your password'],
    validate: {
      // this only works with CREATE & SAVE!!
      validator: function (el) {
        return el === this.password;
      },
      message: 'Passwords are not the same!',
    },
  },
});

userSchema.pre('save', async function (next) {
  // Only run this function if password was actually modified
  if (!this.isModified('password')) return next();

  // Hash the password with cost of 12
  this.password = await bcrypt.hash(this.password, 12);

  // Delete passwordConfirm field
  this.passwordConfirm = undefined;
  next();
});

// model (Thats why we write it 'Tour' not 'tour')
const User = mongoose.model('User', userSchema);

module.exports = User;
