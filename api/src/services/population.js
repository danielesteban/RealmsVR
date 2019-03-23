const colors = require('colors/safe');
const { Realm } = require('../models');

module.exports = () => (
  Promise.all([
    Realm
      .countDocuments()
      .then((count) => {
        if (count > 0) {
          return false;
        }
        console.log(colors.blue('Populating default Realms...'));
        return Promise.all([
          'default',
          'cave',
          'csd',
          'hourglass',
          'sphere',
        ].map((generator) => {
          const size = 16;
          const realm = new Realm({
            name: generator,
            size,
            voxels: Realm.generateVoxels({ generator, size }),
          });
          return realm
            .save();
        }))
          .then(() => (
            console.log(colors.green('Successfully populated default Realms'))
          ))
          .catch(() => console.error(colors.red('Failed to populate default Realms')));
      }),
  ])
);
