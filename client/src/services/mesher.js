import Worker from '@/services/mesher.worker';

class Mesher {
  constructor() {
    this.promiseId = 0;
    this.promises = {};
    this.worker = new Worker();
    this.worker.onmessage = this.onMessage.bind(this);
  }

  generate({ size, voxels }) {
    const { promiseId, promises, worker } = this;
    return new Promise((resolve) => {
      promises[promiseId] = resolve;
      this.promiseId += 1;
      worker.postMessage({
        promiseId,
        size,
        voxels,
      });
    });
  }

  onMessage({ data: { geometry, promiseId } }) {
    const { promises } = this;
    promises[promiseId](geometry);
    delete promises[promiseId];
  }
}

export default new Mesher();
