var express = require('express');
var app = express();

var x, y, z, profit = 0;
var bank = 1000;

app.get('/', function(req, res){

res.send('Use the address bar to enter variables.');

//./
});
var trades = 0;

// Binary Trading
app.get('/trade/', function(req, res){

var maxbid = Math.round((bank * 0.8)/100);
if (maxbid > 200) {
	maxbid = 1000;
}
//maxbid = 100;
var minbid = 0;


var trade = trade();



function trade() {
	var err, winnings, rake, shake = 0;
	var offer = 0.75;
	var call = 0;
	var put = 0;

var putvariance = Math.floor((Math.random()*80)+20);
var callvariance = Math.floor((Math.random()*80)+20);

	for(var i = 0; i < putvariance;i++){
	    call = call + generateRandomBid();
	}
	for(var i = 0; i < callvariance;i++){
	    put = put + generateRandomBid();
	}

  function generateRandomBid(){
  	return Math.floor((Math.random()*maxbid)+minbid);
  }

	var winner = Math.floor((Math.random()*2)+1);
	var total = Math.round(call + put);

	res.send('Bank: ' + bank + '');
	if (winner == 1) {

		winnings = Math.round(call+(call*offer));
		if (winnings > total) {
			shake = Math.round(winnings - total);
			bank = Math.round(bank - shake);
			console.log("\r\n" + 'Maxbid: ' + maxbid + '  Call wins ' + winnings + ' and bank loses ' + shake);
			console.log(' Lose');
			if (offer > 0.5) {
				offer = offer - 0.1;
			}
		} else {
			rake = Math.round(total - winnings);
			bank = Math.round(bank + rake);
			console.log("\r\n" + 'Maxbid: ' + maxbid + '  Call wins ' + winnings + ' and bank wins ' + rake);
			console.log(' Win');
			if (offer < 0.8) {
				offer = offer + 0.1;
			}
		}

	} else if (winner > 1) {

		winnings = Math.round(put+(put*offer));
		if (winnings > total) {
			shake = Math.round(winnings - total);
			bank = Math.round(bank - shake);
			console.log("\r\n" + 'Maxbid: ' + maxbid + '  Put wins ' + winnings + ' and bank loses ' + shake);
			console.log(' Lose');
			if (offer > 0.5) {
				offer = offer - 0.01;
			}
		} else {
			rake = Math.round(total - winnings);
			bank = Math.round(bank + rake);
			console.log("\r\n" + 'Maxbid: ' + maxbid + '  Put wins ' + winnings + ' and bank wins ' + rake);
			console.log(' Win');
			if (offer < 0.8) {
				offer = offer + 0.01;
			}
		}

	} else {
		err++;
	}
 maxbid = Math.round((bank * 0.5)/10);
 minbid = 0;
 

	return bank;
}
trades++;
//trade/
});




app.listen(8080);
console.log('Trade server started...');