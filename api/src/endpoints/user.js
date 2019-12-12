const { notFound, unauthorized } = require('boom');
const { body, param } = require('express-validator');
const passport = require('passport');
const config = require('../config');
const { User } = require('../models');
const { checkValidationResult } = require('../services/errorHandler');

module.exports.authenticateWithGoogle = (req, res) => {
  passport.authenticate('google', (err, user) => {
    res.send(
      '<script>'
      + 'window.addEventListener("message",({origin,source})=>{'
      + `if(origin===${JSON.stringify(config.clientOrigin)}){`
      + ''
      + `source.postMessage({${(
        (err || !user) ? (
          'err:1'
        ) : (
          `session:${JSON.stringify(user.getNewSession())}`
        )
      )}},origin);`
      + 'window.close()'
      + '}'
      + '},false)'
      + '</script>'
    );
  })(req, res);
};

module.exports.getPhoto = [
  param('user')
    .isMongoId(),
  checkValidationResult,
  (req, res, next) => {
    User
      .findOne({
        _id: req.params.user,
        photo: { $exists: true },
      })
      .select('updatedAt')
      .then((user) => {
        if (!user) {
          throw notFound();
        }
        const lastModified = user.updatedAt.toUTCString();
        if (req.get('if-modified-since') === lastModified) {
          return res.status(304).end();
        }
        return User
          .findById(user._id)
          .select('-_id photo')
          .then(({ photo }) => (
            res
              .set('Cache-Control', 'must-revalidate')
              .set('Content-Type', 'image/jpeg')
              .set('Last-Modified', lastModified)
              .send(photo)
          ));
      })
      .catch(next);
  },
];

module.exports.login = [
  body('email')
    .isEmail()
    .normalizeEmail(),
  body('password')
    .not().isEmpty()
    .trim(),
  checkValidationResult,
  (req, res, next) => {
    passport.authenticate('local', (err, user) => {
      if (err || !user) {
        next(err || unauthorized());
        return;
      }
      res.json(user.getNewSession());
    })(req, res);
  },
];

module.exports.loginWithGoogle = (
  passport.authenticate('google', {
    prompt: 'select_account',
    scope: 'email profile',
  })
);

module.exports.refreshSession = (req, res) => {
  res.json(req.user.getNewSession());
};

module.exports.register = [
  body('email')
    .isEmail()
    .normalizeEmail(),
  body('name')
    .not().isEmpty()
    .isLength({ min: 1, max: 25 })
    .trim(),
  body('password')
    .not().isEmpty()
    .trim(),
  checkValidationResult,
  (req, res) => {
    const user = new User({
      email: req.body.email,
      name: req.body.name,
      password: req.body.password,
    });
    user.save()
      .then(() => res.json(user.getNewSession()))
      .catch(() => res.status(500).end());
  },
];
