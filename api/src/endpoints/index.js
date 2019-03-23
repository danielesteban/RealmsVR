// const multer = require('multer');
const nocache = require('nocache');
const realm = require('./realm');
const user = require('./user');
const {
  requireAuth,
} = require('../services/passport');

const preventCache = nocache();
// const upload = multer({
//   storage: multer.memoryStorage(),
// });

module.exports = (api) => {
  /**
   * @swagger
   * /realm:
   *   put:
   *     description: Create a realm
   *     tags: [Realm]
   *     requestBody:
   *      required: true
   *      content:
   *        application/json:
   *          schema:
   *            type: object
   *            properties:
   *              name:
   *                description: Realm name
   *                type: string
   *              generator:
   *                description: Realm generator
   *                type: string
   *                enum: [default, cave, csd, hourglass, sphere]
   *     responses:
   *       200:
   *         description: New realm slug
   *       401:
   *         description: Invalid/expired session token
   */
  api.put(
    '/realm',
    preventCache,
    requireAuth,
    realm.create
  );

  /**
   * @swagger
   * /realm/{slug}:
   *   get:
   *     description: Get realm metadata
   *     tags: [Realm]
   *     security: []
   *     parameters:
   *       - name: slug
   *         in: path
   *         description: Realm slug
   *         required: true
   *         schema:
   *           type: string
   *     responses:
   *       200:
   *         description: Realm metadata
   *       401:
   *         description: Invalid/expired session token
   *       404:
   *         description: Realm not found
   */
  api.get(
    '/realm/:slug',
    preventCache,
    realm.get
  );

  /**
   * @swagger
   * /realm/{id}:
   *   post:
   *     description: Re-generate a realm
   *     tags: [Realm]
   *     parameters:
   *       - name: id
   *         in: path
   *         description: Realm id
   *         required: true
   *         schema:
   *           type: string
   *     requestBody:
   *      required: true
   *      content:
   *        application/json:
   *          schema:
   *            type: object
   *            properties:
   *              generator:
   *                description: Realm generator
   *                type: string
   *                enum: [default, cave, csd, hourglass, sphere]
   *     responses:
   *       200:
   *         description: Successfully re-generated
   *       401:
   *         description: Invalid/expired session token
   */
  api.post(
    '/realm/:id',
    preventCache,
    requireAuth,
    realm.regenerate
  );

  /**
   * @swagger
   * /realm/{id}:
   *   delete:
   *     description: Remove a realm
   *     tags: [Realm]
   *     parameters:
   *       - name: id
   *         in: path
   *         description: Realm id
   *         required: true
   *         schema:
   *           type: string
   *     responses:
   *       200:
   *         description: Successfully removed
   *       401:
   *         description: Invalid/expired session token
   */
  api.delete(
    '/realm/:id',
    preventCache,
    requireAuth,
    realm.remove
  );

  /**
   * @swagger
   * /realm/{id}/voxels:
   *   get:
   *     description: Get realm voxels
   *     tags: [Voxels]
   *     security: []
   *     parameters:
   *       - name: id
   *         in: path
   *         description: Realm id
   *         required: true
   *         schema:
   *           type: string
   *     responses:
   *       200:
   *         description: Realm voxels
   *       401:
   *         description: Invalid/expired session token
   *       404:
   *         description: Realm not found
   */
  api.get(
    '/realm/:id/voxels',
    realm.getVoxels
  );

  /**
   * @swagger
   * /realms/{page}:
   *   get:
   *     description: List realms
   *     tags: [Lobby]
   *     security: []
   *     parameters:
   *       - name: page
   *         in: path
   *         description: Page
   *         required: true
   *         schema:
   *           type: number
   *     responses:
   *       200:
   *         description: Realms list
   *       401:
   *         description: Invalid/expired session token
   */
  api.get(
    '/realms/:page',
    preventCache,
    realm.list
  );

  /**
   * @swagger
   * /user:
   *   get:
   *     description: Refresh a user session
   *     tags: [User]
   *     responses:
   *       200:
   *         description: Refreshed session
   *         content:
   *           application/json:
   *             schema:
   *               type: object
   *               properties:
   *                 profile:
   *                   type: object
   *                   description: User's profile
   *                 token:
   *                   type: string
   *                   description: Refreshed user token
   *       401:
   *         description: Invalid/expired session token
   */
  api.get(
    '/user',
    preventCache,
    requireAuth,
    user.refreshSession
  );

  /**
   * @swagger
   * /user/google:
   *   get:
   *     description: Get redirected to the google auth popup
   *     tags: [User]
   *     security: []
   */
  api.get(
    '/user/google',
    preventCache,
    user.loginWithGoogle
  );

  /**
   * @swagger
   * /user/google/authenticate:
   *   get:
   *     description: Google auth callback endpoint
   *     tags: [User]
   *     security: []
   */
  api.get(
    '/user/google/authenticate',
    preventCache,
    user.authenticateWithGoogle
  );

  /**
   * @swagger
   * /user/{user}/photo:
   *   get:
   *     description: Get user photo
   *     tags: [User]
   *     security: []
   *     parameters:
   *       - name: user
   *         in: path
   *         description: User id
   *         required: true
   *         schema:
   *           type: string
   *     responses:
   *       200:
   *         description: User photo
   *       401:
   *         description: Invalid/expired session token
   *       404:
   *         description: User not found
   */
  api.get(
    '/user/:user/photo',
    user.getPhoto
  );
};
