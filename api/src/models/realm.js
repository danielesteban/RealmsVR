const mongoose = require('mongoose');
const URLSlugs = require('mongoose-url-slugs');
const Generators = require('../generators');

const RealmSchema = new mongoose.Schema({
  creator: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    index: true,
  },
  name: { type: String, required: true },
  size: { type: Number, required: true },
  voxels: { type: Buffer, required: true },
  createdAt: { type: Date, index: -1 },
  updatedAt: Date,
}, { timestamps: true });

RealmSchema.plugin(URLSlugs('name'));

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

module.exports = mongoose.model('Realm', RealmSchema);
