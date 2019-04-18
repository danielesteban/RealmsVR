[RealmsVR](https://realmsvr.gatunes.com/)
[![Build Status](https://travis-ci.org/danielesteban/RealmsVR.svg?branch=master)](https://travis-ci.org/danielesteban/RealmsVR)
===

[![screenshot](client/src/screenshot.jpg)](https://realmsvr.gatunes.com/)

> A recursive VR experience

### API

[![dependencies Status](https://david-dm.org/danielesteban/RealmsVR/status.svg?path=api)](https://david-dm.org/danielesteban/RealmsVR?path=api)
[![devDependencies Status](https://david-dm.org/danielesteban/RealmsVR/dev-status.svg?path=api)](https://david-dm.org/danielesteban/RealmsVR?path=api&type=dev)

 * [Docker image](https://hub.docker.com/r/danigatunes/realmsvr_api)
 * [Documentation](https://projects.gatunes.com/realmsvr/doc/)

### Client

[![dependencies Status](https://david-dm.org/danielesteban/RealmsVR/status.svg?path=client)](https://david-dm.org/danielesteban/RealmsVR?path=client)
[![devDependencies Status](https://david-dm.org/danielesteban/RealmsVR/dev-status.svg?path=client)](https://david-dm.org/danielesteban/RealmsVR?path=client&type=dev)

 * [Discord server](https://discord.gg/9KyFbe8)
 * [Live environment](https://realmsvr.gatunes.com/)

## Dev environment

 * [MongoDB](https://www.mongodb.com/download-center/community) >= 4.0
 * [Node.js](https://nodejs.org/en/download/) >= 10.15
 * [Yarn](https://yarnpkg.com/en/docs/install) >= 1.15

```bash
git clone https://github.com/danielesteban/RealmsVR.git
cd RealmsVR
yarn install # (or run the "Install dependencies" task in vscode)
yarn start # (or press F5 in vscode)
```

> You'll need to write your own `GOOGLE_CLIENT_ID` and `GOOGLE_CLIENT_SECRET` into `api/.env` if you want to sign-in using the GoogleStrategy.
