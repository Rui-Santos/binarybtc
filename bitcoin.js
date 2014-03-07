var bitcoin = require('bitcoin');
var client = new bitcoin.Client('localhost', 8332, '54939106-c9d5-4e20-ab4d-991e5707db9f', '42YellowWarbler');

client.getBalance('*', 6, function(err, balance) {
  if (err) return console.log(err);
  console.log('Balance:', balance);
});
