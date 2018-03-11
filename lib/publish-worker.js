const pandemic = require('pandemic');

const filePath = process.argv[2];

try {
  pandemic.publish({source: filePath});
} catch (err) {
  process.send(err.message);
  process.exit(1);
}
process.exit(0);
