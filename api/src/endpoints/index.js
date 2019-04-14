const nocache = require('nocache');
const realm = require('./realm');
const user = require('./user');
const {
  authenticate,
  requireAuth,
} = require('../services/passport');

const preventCache = nocache();

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
   *                enum: [default, box, cave, columns, csd, holes, hourglass, sphere]
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
    authenticate,
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
   *                enum: [default, box, cave, columns, csd, holes, hourglass, sphere]
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
   *       404:
   *         description: Realm not found
   */
  api.delete(
    '/realm/:id',
    preventCache,
    requireAuth,
    realm.remove
  );

  /**
   * @swagger
   * /realm/{id}/metadata:
   *   put:
   *     description: Update realm metadata
   *     tags: [Metadata]
   *     parameters:
   *       - name: id
   *         in: path
   *         description: Realm id
   *         required: true
   *         schema:
   *           type: string
   *     requestBody:
   *       required: true
   *       content:
   *         application/json:
   *           schema:
   *             type: object
   *             properties:
   *               fog:
   *                 description: Realm fog color
   *                 type: number
   *               name:
   *                 description: Realm name
   *                 type: number
   *     responses:
   *       200:
   *         description: Successfully updated
   *       401:
   *         description: Invalid/expired session token
   *       404:
   *         description: Realm not found
   */
  api.put(
    '/realm/:id/metadata',
    preventCache,
    requireAuth,
    realm.updateMetadata
  );

  /**
   * @swagger
   * /realm/{id}/screenshot:
   *   get:
   *     description: Get realm screenshot
   *     tags: [Screenshot]
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
   *         description: Realm screenshot
   *       401:
   *         description: Invalid/expired session token
   *       404:
   *         description: Realm/Screenshot not found
   */
  api.get(
    '/realm/:id/screenshot',
    realm.getScreenshot
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
   * /realm/{id}/voxels:
   *   put:
   *     description: Update realm voxels
   *     tags: [Voxels]
   *     parameters:
   *       - name: id
   *         in: path
   *         description: Realm id
   *         required: true
   *         schema:
   *           type: string
   *     requestBody:
   *       required: true
   *       content:
   *         multipart/form-data:
   *           schema:
   *             type: object
   *             properties:
   *               voxels:
   *                 type: string
   *                 format: binary
   *     responses:
   *       200:
   *         description: Successfully updated
   *       401:
   *         description: Invalid/expired session token
   *       404:
   *         description: Realm not found
   */
  api.put(
    '/realm/:id/voxels',
    preventCache,
    requireAuth,
    api.get('multer').single('voxels'),
    realm.updateVoxels
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
    realm.list('all')
  );

  /**
   * @swagger
   * /realms/user/{page}:
   *   get:
   *     description: List user realms
   *     tags: [Lobby]
   *     parameters:
   *       - name: page
   *         in: path
   *         description: Page
   *         required: true
   *         schema:
   *           type: number
   *     responses:
   *       200:
   *         description: User realms list
   *       401:
   *         description: Invalid/expired session token
   */
  api.get(
    '/realms/user/:page',
    preventCache,
    requireAuth,
    realm.list('user')
  );

  /**
   * @swagger
   * /user:
   *   put:
   *     description: Register user account
   *     tags: [User]
   *     security: []
   *     requestBody:
   *      required: true
   *      content:
   *        application/json:
   *          schema:
   *            type: object
   *            properties:
   *              name:
   *                description: User name
   *                type: string
   *              email:
   *                description: User email
   *                type: string
   *              password:
   *                description: User password
   *                type: string
   *     responses:
   *       200:
   *         description: User session
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
  api.put(
    '/user',
    preventCache,
    user.register
  );

  /**
   * @swagger
   * /user:
   *   post:
   *     description: Login with email & password
   *     tags: [User]
   *     security: []
   *     requestBody:
   *      required: true
   *      content:
   *        application/json:
   *          schema:
   *            type: object
   *            properties:
   *              email:
   *                description: User email
   *                type: string
   *              password:
   *                description: User password
   *                type: string
   *     responses:
   *       200:
   *         description: User session
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
  api.post(
    '/user',
    preventCache,
    user.login
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
