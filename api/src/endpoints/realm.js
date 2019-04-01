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
      .findOne({
        slug: req.params.slug,
      })
      .select('creator fog name size')
      .then((realm) => {
        if (!realm) {
          throw notFound();
        }
        const isCreator = !!(
          req.user
          && realm.creator
          && realm.creator.equals(req.user._id)
        );
        const isHeadless = !!(
          ~(req.headers['user-agent'] || '').indexOf('Headless')
        );
        if (
          !isCreator
          && !isHeadless
        ) {
          Realm
            .updateOne(
              { _id: realm._id },
              { $inc: { views: 1 } }
            )
            .catch(() => {});
        }
        res.json({
          ...realm._doc,
          creator: undefined,
          isCreator,
        });
      })
      .catch(next);
  },
];

module.exports.getScreenshot = [
  param('id')
    .isMongoId(),
  checkValidationResult,
  (req, res, next) => {
    Realm
      .findOne({
        _id: req.params.id,
        screenshot: { $exists: true },
      })
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
          .select('-_id screenshot')
          .then(({ screenshot }) => (
            res
              .set('Cache-Control', 'must-revalidate')
              .set('Content-Type', 'image/jpeg')
              .set('Last-Modified', lastModified)
              .send(screenshot)
          ));
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
    const sorting = `${filter === 'all' ? '-views ' : ''}-createdAt`;
    Realm
      .countDocuments(selector)
      .then(count => (
        Realm
          .find(selector)
          .sort(sorting)
          .skip(page * pageSize)
          .limit(pageSize)
          .select('creator name slug createdAt')
          .populate('creator', 'name')
          .then(realms => (
            res.json({
              pages: Math.ceil(count / pageSize),
              realms,
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

module.exports.updateMetadata = [
  param('id')
    .isMongoId(),
  body('fog')
    .optional()
    .isInt()
    .toInt(),
  body('name')
    .optional()
    .not().isEmpty()
    .isLength({ min: 1, max: 25 })
    .trim(),
  checkValidationResult,
  (req, res, next) => {
    if (
      req.body.fog === undefined
      && req.body.name === undefined
    ) {
      throw badData();
    }
    Realm
      .findOne({
        _id: req.params.id,
        creator: req.user._id,
      })
      .select('-voxels -screenshot')
      .then((realm) => {
        if (!realm) {
          throw notFound();
        }
        if (req.body.fog !== undefined) {
          realm.fog = req.body.fog;
        }
        if (req.body.name !== undefined) {
          realm.name = req.body.name;
          delete realm.slug;
        }
        return realm
          .save();
      })
      .then(() => {
        res.status(200).end();
      })
      .catch(next);
  },
];

module.exports.updateVoxels = [
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
