const pandemic = require('pandemic');

const filePath = process.argv[2];
pandemic.publish({source: filePath})
  .then((res) => {
    process.exit(0);
  })
  .catch((err) => {
    process.send(err.message);
    process.exit(1);
  });
