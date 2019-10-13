const pandemics = require('pandemics');

pandemics.publish({
  source: process.argv[2]
})
.then((res) => {
  console.log('ok')
  process.exit(0);
})
.catch((err) => {
  console.log('error')
  process.send(err.message);
  process.exit(1);
});
