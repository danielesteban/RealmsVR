const mongoose = require('mongoose');
const jwt = require('jsonwebtoken');
const request = require('request-promise-native');
const sharp = require('sharp');
const config = require('../config');

const UserSchema = new mongoose.Schema({
  email: {
    type: String,
    lowercase: true,
    index: true,
    required: true,
    unique: true,
  },
  name: { type: String, required: true },
  photo: Buffer,
}, { timestamps: true });

UserSchema.pre('save', function onSave(next) {
  const user = this;
  const promises = [];
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
      { expiresIn: '24h' }
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
