const assert = require('assert');
const request = require('supertest');
const api = require('../src');

const testUser = api.get('testUser');

describe('Sign-up User', () => {
  it('PUT /user without params should return a 422', () => (
    request(api)
      .put('/user')
      .expect(422)
  ));
  it('PUT /user should return a new session', () => (
    request(api)
      .put('/user')
      .send({
        name: testUser.name,
        email: testUser.email,
        password: testUser.password,
      })
      .expect(200)
      .then(({ body: { profile, token } }) => {
        assert(!!token);
        assert(profile.name === testUser.name);
        testUser.profile = profile;
      })
  ));
});

describe('Sign-in User', () => {
  it('POST /user without params should return a 422', () => (
    request(api)
      .post('/user')
      .expect(422)
  ));
  it('POST /user with a bad password should return a 401', () => (
    request(api)
      .post('/user')
      .send({
        email: testUser.email,
        password: 'badpassword',
      })
      .expect(401)
  ));
  it('POST /user should return a new session', () => (
    request(api)
      .post('/user')
      .send({
        email: testUser.email,
        password: testUser.password,
      })
      .expect(200)
      .then(({ body: { profile, token } }) => {
        assert(!!token);
        assert(profile._id === testUser.profile._id);
        assert(profile.name === testUser.name);
        testUser.token = token;
      })
  ));
});

describe('Refresh Session', () => {
  it('GET /user without a token should return a 401', () => (
    request(api)
      .get('/user')
      .expect(401)
  ));
  it('GET /user should return a session token', () => (
    request(api)
      .get('/user')
      .set('Authorization', `Bearer ${testUser.token}`)
      .expect(200)
      .then(({ body: { profile, token } }) => {
        assert(!!token);
        assert(profile._id === testUser.profile._id);
        assert(profile.name === testUser.name);
      })
  ));
});
