const assert = require('assert');
const request = require('supertest');
const api = require('../src');

const testRealm = api.get('testRealm');
const testUser = api.get('testUser');

describe('Create Realm', () => {
  it('PUT /realm without a token should return a 401', () => (
    request(api)
      .put('/realm')
      .expect(401)
  ));
  it('PUT /realm should return the realm slug', () => (
    request(api)
      .put('/realm')
      .set('Authorization', `Bearer ${testUser.token}`)
      .send({
        name: testRealm.name,
      })
      .expect(200)
      .then(({ body: slug }) => {
        assert(slug === testRealm.slug);
      })
  ));
});

describe('Load Realm', () => {
  it('GET /realm/:slug with an unknown slug should return a 404', () => (
    request(api)
      .get('/realm/unknown')
      .expect(404)
  ));
  it('GET /realm/:slug should return the realm meta', () => (
    request(api)
      .get(`/realm/${testRealm.slug}`)
      .expect(200)
      .then(({ body: { _id, name } }) => {
        assert(name === testRealm.name);
        testRealm._id = _id;
      })
  ));
  it('GET /realm/:id with the creator token should return isCreator === true', () => (
    request(api)
      .get(`/realm/${testRealm.slug}`)
      .set('Authorization', `Bearer ${testUser.token}`)
      .expect(200)
      .then(({ body: { _id, isCreator } }) => {
        assert(_id === testRealm._id);
        assert(!!isCreator);
      })
  ));
});

describe('Re-generate Realm', () => {
  it('POST /realm/:id without a token should return a 401', () => (
    request(api)
      .post(`/realm/${testRealm._id}`)
      .expect(401)
  ));
  it('POST /realm/:id with an unknown generator should return a 422', () => (
    request(api)
      .post(`/realm/${testRealm._id}`)
      .set('Authorization', `Bearer ${testUser.token}`)
      .send({
        generator: 'unknown',
      })
      .expect(422)
  ));
  it('POST /realm/:id with a bad id should return a 422', () => (
    request(api)
      .post('/realm/0')
      .set('Authorization', `Bearer ${testUser.token}`)
      .expect(422)
  ));
  it('POST /realm/:id with an unknown id should return a 404', () => (
    request(api)
      .post('/realm/000000000000000000000000')
      .set('Authorization', `Bearer ${testUser.token}`)
      .expect(404)
  ));
  it('POST /realm/:id should return a 200', () => (
    request(api)
      .post(`/realm/${testRealm._id}`)
      .set('Authorization', `Bearer ${testUser.token}`)
      .expect(200)
  ));
});

describe('List Realms', () => {
  it('GET /realms/:page should return the realms list', () => (
    request(api)
      .get('/realms/0')
      .expect(200)
      .then(({ body: { realms } }) => {
        assert(Array.isArray(realms));
        assert(realms[0]._id === testRealm._id);
        assert(realms[0].name === testRealm.name);
      })
  ));
  it('GET /realms/user/:page without a token should return a 401', () => (
    request(api)
      .get('/realms/user/0')
      .expect(401)
  ));
  it('GET /realms/user/:page should return the user realms list', () => (
    request(api)
      .get('/realms/0')
      .expect(200)
      .then(({ body: { realms } }) => {
        assert(Array.isArray(realms));
        assert(realms[0]._id === testRealm._id);
        assert(realms[0].name === testRealm.name);
      })
  ));
});

describe('Update Realm metadata', () => {
  it('PUT /realm/:id/metadata without a token should return a 401', () => (
    request(api)
      .put(`/realm/${testRealm._id}/metadata`)
      .expect(401)
  ));
  it('PUT /realm/:id/metadata without params should return a 422', () => (
    request(api)
      .put(`/realm/${testRealm._id}/metadata`)
      .set('Authorization', `Bearer ${testUser.token}`)
      .expect(422)
  ));
  it('PUT /realm/:id/metadata with a bad id should return a 422', () => (
    request(api)
      .put('/realm/0/metadata')
      .set('Authorization', `Bearer ${testUser.token}`)
      .send({
        fog: 0x00ff00,
        name: 'Test',
      })
      .expect(422)
  ));
  it('PUT /realm/:id/metadata with an unknown id should return a 404', () => (
    request(api)
      .put('/realm/000000000000000000000000/metadata')
      .set('Authorization', `Bearer ${testUser.token}`)
      .send({
        fog: 0x00ff00,
        name: 'Test',
      })
      .expect(404)
  ));
  it('PUT /realm/:id/metadata should return a 200', () => (
    request(api)
      .put(`/realm/${testRealm._id}/metadata`)
      .set('Authorization', `Bearer ${testUser.token}`)
      .send({
        fog: 0x00ff00,
        name: 'Test',
      })
      .expect(200)
  ));
});

describe('Remove Realm', () => {
  it('DELETE /realm/:id without a token should return a 401', () => (
    request(api)
      .delete(`/realm/${testRealm._id}`)
      .expect(401)
  ));
  it('DELETE /realm/:id with a bad id should return a 422', () => (
    request(api)
      .delete('/realm/0')
      .set('Authorization', `Bearer ${testUser.token}`)
      .expect(422)
  ));
  it('DELETE /realm/:id with an unknown id should return a 404', () => (
    request(api)
      .delete('/realm/000000000000000000000000')
      .set('Authorization', `Bearer ${testUser.token}`)
      .expect(404)
  ));
  it('DELETE /realm/:id should return a 200', () => (
    request(api)
      .delete(`/realm/${testRealm._id}`)
      .set('Authorization', `Bearer ${testUser.token}`)
      .expect(200)
  ));
});
