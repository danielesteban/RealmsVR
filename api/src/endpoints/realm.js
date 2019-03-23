const { notFound } = require('boom');
const { body, param } = require('express-validator/check');
const { Realm } = require('../models');
const { checkValidationResult } = require('../services/errorHandler');

module.exports.create = [
  body('name')
    .not().isEmpty()
    .isLength({ min: 1, max: 25 })
    .trim(),
  body('generator')
    .optional()
    .isIn(['default', 'cave', 'csd', 'hourglass', 'sphere']),
  checkValidationResult,
  (req, res, next) => {
    const generator = req.body.generator || 'default';
    const size = 16;
    const realm = new Realm({
      creator: req.user._id,
      name: req.body.name,
      size,
      voxels: Realm.generateVoxels({ generator, size }),
    });
    realm
      .save()
      .then(({ slug }) => (
        res.json(slug)
      ))
      .catch(next);
  },
];

module.exports.get = [
  param('slug')
    .not().isEmpty()
    .isLowercase(),
  checkValidationResult,
  (req, res, next) => {
    Realm
      .findOne({
        slug: req.params.slug,
      })
      .select('creator name size')
      .populate('creator', 'name')
      .then((realm) => {
        if (!realm) {
          throw notFound();
        }
        res.json({
          ...realm._doc,
          creator: realm.creator ? realm.creator.name : undefined,
        });
      })
      .catch(next);
  },
];

module.exports.getVoxels = [
  param('id')
    .isMongoId(),
  checkValidationResult,
  (req, res, next) => {
    Realm
      .findById(req.params.id)
      .select('updatedAt')
      .then((realm) => {
        if (!realm) {
          throw notFound();
        }
        const lastModified = realm.updatedAt.toUTCString();
        if (req.get('if-modified-since') === lastModified) {
          return res.status(304).end();
        }
        return Realm
          .findById(realm._id)
          .select('-_id voxels')
          .then(({ voxels }) => (
            res
              .set('Cache-Control', 'must-revalidate')
              .set('Content-Type', 'text/plain')
              .set('Last-Modified', lastModified)
              .send(voxels)
          ));
      })
      .catch(next);
  },
];

module.exports.list = [
  param('page')
    .isInt(),
  checkValidationResult,
  (req, res, next) => {
    const { page } = req.params;
    const pageSize = 5;
    Realm
      .find()
      .select('creator name screenshot slug createdAt')
      .sort('-createdAt')
      .skip(page * pageSize)
      .limit(pageSize)
      .populate('creator', 'name')
      .then(realms => (
        res.json(realms.map(realm => ({
          ...realm._doc,
          creator: realm.creator ? realm.creator.name : undefined,
          screenshot: realm.screenshot ? realm.screenshot.toString('base64') : undefined,
        })))
      ))
      .catch(next);
  },
];

module.exports.regenerate = [
  param('id')
    .isMongoId(),
  body('generator')
    .optional()
    .isIn(['default', 'cave', 'csd', 'hourglass', 'sphere']),
  checkValidationResult,
  (req, res, next) => {
    Realm
      .findOne({
        _id: req.params.id,
        creator: req.user._id,
      })
      .then((realm) => {
        if (!realm) {
          throw notFound();
        }
        const generator = req.body.generator || 'default';
        const size = 16;
        realm.voxels = Realm.generateVoxels({ generator, size });
        return realm
          .save();
      })
      .then(() => (
        res.status(200).end()
      ))
      .catch(next);
  },
];

module.exports.remove = [
  param('id')
    .isMongoId(),
  checkValidationResult,
  (req, res, next) => {
    Realm
      .deleteOne({
        _id: req.params.id,
        creator: req.user._id,
      })
      .then(() => (
        res.status(200).end()
      ))
      .catch(next);
  },
];
