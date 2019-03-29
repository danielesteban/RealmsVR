const bcrypt = require('bcrypt-nodejs');
const { createCanvas, registerFont } = require('canvas');
const HSV2RGB = require('hsv-rgb');
const mongoose = require('mongoose');
const jwt = require('jsonwebtoken');
const path = require('path');
const request = require('request-promise-native');
const sharp = require('sharp');
const config = require('../config');

registerFont(
  path.join(__dirname, '..', '..', 'fonts', 'roboto.ttf'),
  { family: 'Roboto' }
);

const UserSchema = new mongoose.Schema({
  email: {
    type: String,
    lowercase: true,
    index: true,
    required: true,
    unique: true,
  },
  name: { type: String, required: true },
  password: String,
  photo: Buffer,
}, { timestamps: true });

UserSchema.pre('save', function onSave(next) {
  const user = this;
  const promises = [];
  if (user.isModified('password')) {
    promises.push(
      new Promise((resolve, reject) => (
        bcrypt.genSalt(5, (err, salt) => {
          if (err) return reject(err);
          return bcrypt.hash(user.password, salt, null, (err, hash) => {
            if (err) return reject(err);
            user.password = hash;
            return resolve();
          });
        })
      ))
    );
  }
  if (user.isNew) {
    if (user.isModified('photo')) {
      promises.push(
        sharp(user.photo)
          .rotate()
          .resize(100, 100)
          .jpeg({ quality: 85 })
          .toBuffer()
          .then((photo) => {
            user.photo = photo;
          })
      );
    } else {
      promises.push(new Promise((resolve, reject) => {
        const canvas = createCanvas(100, 100);
        const ctx = canvas.getContext('2d');
        const [r, g, b] = HSV2RGB(Math.floor(Math.random() * 360), 20, 80);
        ctx.fillStyle = `rgb(${r}, ${g}, ${b})`;
        ctx.fillRect(0, 0, 100, 100);
        ctx.fillStyle = '#fff';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.font = '60px Roboto';
        ctx.fillText((
          user.name
            .substr(0, 1)
            .toUpperCase()
        ), 50, 50);
        canvas.toBuffer((err, buffer) => {
          if (err) {
            reject(err);
            return;
          }
          user.photo = buffer;
          resolve();
        });
      }));
    }
  }
  if (!promises.length) {
    return next();
  }
  return Promise
    .all(promises)
    .then(() => next())
    .catch(next);
});

UserSchema.methods = {
  comparePassword(candidatePassword) {
    const user = this;
    return new Promise((resolve, reject) => (
      bcrypt.compare(candidatePassword, user.password, (err, isMatch) => {
        if (err) {
          reject(err);
          return;
        }
        resolve(isMatch);
      })
    ));
  },
  getNewSession() {
    return {
      profile: {
        _id: this._id,
        name: this.name,
      },
      token: this.issueToken(),
    };
  },
  issueToken() {
    return jwt.sign(
      {
        _id: this._id,
      },
      config.sessionSecret,
      { expiresIn: '7d' }
    );
  },
};

UserSchema.statics = {
  findOrCreate(selector, doc) {
    const User = this;
    return User
      .findOne(selector)
      .then((user) => {
        if (user) {
          return user;
        }
        const create = () => {
          user = new User(doc);
          user.photo = doc.photo;
          return user.save();
        };
        if (doc.photo && typeof doc.photo === 'string') {
          return request({
            encoding: null,
            url: doc.photo,
          })
            .then((photo) => {
              doc.photo = photo;
              return create();
            });
        }
        return create();
      });
  },
  fromToken(token) {
    const User = this;
    return new Promise((resolve, reject) => (
      jwt.verify(token, config.sessionSecret, (err, decoded) => {
        if (err) {
          reject(err);
          return;
        }
        resolve(User.findOne({ _id: decoded._id }));
      })
    ));
  },
};

module.exports = mongoose.model('User', UserSchema);
