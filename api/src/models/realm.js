const mongoose = require('mongoose');
const URLSlugs = require('mongoose-url-slugs');
const config = require('../config');
const Generators = require('../generators');
const Screenshots = require('../services/screenshots');

const RealmSchema = new mongoose.Schema({
  creator: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    index: true,
  },
  fog: { type: Number, default: 0x020214 },
  name: { type: String, required: true },
  size: { type: Number, required: true },
  screenshot: Buffer,
  views: {
    type: Number,
    default: 0,
    index: -1,
  },
  voxels: { type: Buffer, required: true },
  createdAt: { type: Date, index: -1 },
  updatedAt: Date,
}, { timestamps: true });

RealmSchema.pre('save', function onSave(next) {
  this.needsScreeenshot = (
    this.isModified('fog')
    || this.isModified('size')
    || this.isModified('voxels')
  );
  next();
});

RealmSchema.post('save', function onSaved() {
  const realm = this;
  if (realm.needsScreeenshot) {
    Screenshots.update({
      model: realm,
      url: `${config.clientOrigin}/${realm.slug}`,
    });
  }
});

RealmSchema.statics = {
  generateVoxels({ generator, size }) {
    const voxels = new Uint32Array(size * size * size);
    generator = (Generators[generator] || (() => () => (0)))({ size });
    for (let z = 0; z < size; z += 1) {
      for (let y = 0; y < size; y += 1) {
        for (let x = 0; x < size; x += 1) {
          voxels[z * size * size + y * size + x] = generator({ x, y, z }) || 0;
        }
      }
    }
    return Buffer.from(voxels.buffer);
  },
};

RealmSchema.plugin(URLSlugs('name', { update: true }));

module.exports = mongoose.model('Realm', RealmSchema);
