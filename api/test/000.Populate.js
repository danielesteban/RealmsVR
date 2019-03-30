process.env.NODE_ENV = 'test';
const colors = require('colors/safe');
const mongoose = require('mongoose');
const populate = require('../src/services/population');
const api = require('../src');

api.set('testRealm', {
  name: 'Test Realm',
});
api.set('testUser', {
  name: 'Test User',
  email: 'test@test.com',
  password: 'test',
});

before(function wipeAndPopulate(done) {
  this.timeout(10000);
  mongoose.connection.once('connected', () => {
    console.log(colors.red('Wiping test db...'));
    mongoose.connection.db.dropDatabase().then(() => (
      populate().then(() => {
        console.log('\n');
        done();
      })
    ));
  });
});
