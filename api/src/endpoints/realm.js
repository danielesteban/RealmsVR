const { badData, notFound } = require('boom');
const { body, param } = require('express-validator/check');
const namor = require('namor');
const { Realm } = require('../models');
const { checkValidationResult } = require('../services/errorHandler');

module.exports.create = [
  body('name')
    .optional()
    .not().isEmpty()
    .isLength({ min: 1, max: 25 })
    .trim(),
  body('generator')
    .optional()
    .isIn(['default', 'cave', 'csd', 'hourglass', 'sphere']),
  checkValidationResult,
  (req, res, next) => {
    const generator = req.body.generator || 'default';
    const name = req.body.name || namor.generate();
    const size = 24;
    const realm = new Realm({
      creator: req.user._id,
      name,
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
      .findOneAndUpdate(
        {
          slug: req.params.slug,
        },
        {
          $inc: { views: 1 },
        }
      )
      .select('creator name size')
      .then((realm) => {
        if (!realm) {
          throw notFound();
        }
        res.json({
          ...realm._doc,
          creator: undefined,
          isCreator: !!(
            req.user
            && realm.creator
            && realm.creator.equals(req.user._id)
          ),
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

module.exports.list = filter => ([
  param('page')
    .isInt(),
  checkValidationResult,
  (req, res, next) => {
    const { page } = req.params;
    const pageSize = 4;
    const selector = filter === 'user' ? { creator: req.user._id } : {};
    Realm
      .countDocuments(selector)
      .then(count => (
        Realm
          .find(selector)
          .select('creator name screenshot slug createdAt')
          .sort('-views -createdAt')
          .skip(page * pageSize)
          .limit(pageSize)
          .populate('creator', 'name')
          .then(realms => (
            res.json({
              pages: Math.ceil(count / pageSize),
              realms: realms.map(realm => ({
                ...realm._doc,
                screenshot: realm.screenshot ? realm.screenshot.toString('base64') : undefined,
              })),
            })
          ))
      ))
      .catch(next);
  },
]);

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
      .select('slug')
      .then((realm) => {
        if (!realm) {
          throw notFound();
        }
        const generator = req.body.generator || 'default';
        const size = 24;
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
      .then(({ deletedCount }) => (
        res.status(deletedCount === 1 ? 200 : 404).end()
      ))
      .catch(next);
  },
];

module.exports.update = [
  param('id')
    .isMongoId(),
  checkValidationResult,
  (req, res, next) => {
    if (
      !req.file
      || !req.file.buffer
      || req.file.mimetype !== 'text/plain'
    ) {
      throw badData();
    }
    Realm
      .findOne({
        _id: req.params.id,
        creator: req.user._id,
      })
      .select('size slug')
      .then((realm) => {
        if (!realm) {
          throw notFound();
        }
        const { size } = realm;
        if (req.file.buffer.byteLength !== size * size * size * Uint32Array.BYTES_PER_ELEMENT) {
          throw badData();
        }
        realm.voxels = req.file.buffer;
        return realm
          .save();
      })
      .then(() => {
        res.status(200).end();
      })
      .catch(next);
  },
];
