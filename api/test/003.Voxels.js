const assert = require('assert');
const request = require('supertest');
const binaryParser = require('superagent-binary-parser');
const api = require('../src');

const testRealm = api.get('testRealm');
const testUser = api.get('testUser');

describe('Get realm voxels', () => {
  before(() => (
    // Create test realm
    request(api)
      .put('/realm')
      .set('Authorization', `Bearer ${testUser.token}`)
      .send({
        name: testRealm.name,
      })
      .expect(200)
      .then(({ body: slug }) => {
        assert(slug === testRealm.slug);
        return request(api)
          .get(`/realm/${testRealm.slug}`)
          .expect(200)
          .then(({ body: { _id, name, size } }) => {
            assert(name === testRealm.name);
            testRealm._id = _id;
            testRealm.size = size;
          });
      })
  ));
  it('GET /realm/:id/voxels with a bad id should return a 422', () => (
    request(api)
      .get('/realm/0/voxels')
      .expect(422)
  ));
  it('GET /realm/:id/voxels with an unknown id should return a 404', () => (
    request(api)
      .get('/realm/000000000000000000000000/voxels')
      .expect(404)
  ));
  it('GET /realm/:id/voxels should return the realm voxels', () => (
    request(api)
      .get(`/realm/${testRealm._id}/voxels`)
      .expect(200)
      .expect('Content-Type', 'text/plain; charset=utf-8')
      .parse(binaryParser)
      .buffer()
      .then(({ body: buffer }) => {
        const voxels = new Uint32Array((new Uint8Array(Buffer.from(buffer))).buffer);
        assert(voxels.length === testRealm.size ** 3);
        testRealm.voxels = buffer;
      })
  ));
});

describe('Update realm voxels', () => {
  it('PUT /realm/:id/voxels without a token should return a 401', () => (
    request(api)
      .put(`/realm/${testRealm._id}/voxels`)
      .expect(401)
  ));
  it('PUT /realm/:id/voxels without params should return a 422', () => (
    request(api)
      .put(`/realm/${testRealm._id}/voxels`)
      .set('Authorization', `Bearer ${testUser.token}`)
      .expect(422)
  ));
  it('PUT /realm/:id/voxels with wrong dimensions should return a 422', () => (
    request(api)
      .put(`/realm/${testRealm._id}/voxels`)
      .set('Authorization', `Bearer ${testUser.token}`)
      .attach('voxels', testRealm.voxels.slice(0, testRealm.voxels.byteLength / 2), 'voxels.txt')
      .expect(422)
  ));
  it('PUT /realm/:id/voxels with a bad id should return a 422', () => (
    request(api)
      .put('/realm/0/voxels')
      .set('Authorization', `Bearer ${testUser.token}`)
      .attach('voxels', testRealm.voxels, 'voxels.txt')
      .expect(422)
  ));
  it('PUT /realm/:id/voxels with an unknown id should return a 404', () => (
    request(api)
      .put('/realm/000000000000000000000000/voxels')
      .set('Authorization', `Bearer ${testUser.token}`)
      .attach('voxels', testRealm.voxels, 'voxels.txt')
      .expect(404)
  ));
  it('PUT /realm/:id/voxels should return a 200', () => (
    request(api)
      .put(`/realm/${testRealm._id}/voxels`)
      .set('Authorization', `Bearer ${testUser.token}`)
      .attach('voxels', testRealm.voxels, 'voxels.txt')
      .expect(200)
  ));
  after(() => (
    // Remove test realm
    request(api)
      .delete(`/realm/${testRealm._id}`)
      .set('Authorization', `Bearer ${testUser.token}`)
      .expect(200)
  ));
});
