var express = require('express');
var app = express();

var x, y, z, profit = 0;
var bank = 500000000;

app.get('/', function(req, res){

res.send('Use the address bar to enter variables.');

//./
});


// Binary Trading
app.get('/trade/', function(req, res){

var maxbid = Math.round((bank * 0.8)/10);
var minbid = 1000000;

var trade = trade();

function trade() {
	var err, winnings, rake, shake = 0;
	var offer = 0.8;
	 var call = Math.floor((Math.random()*maxbid)+minbid);
	 var put = Math.floor((Math.random()*maxbid)+minbid);

	 call = call * Math.floor((Math.random()*10)+1);
	 put = put * Math.floor((Math.random()*10)+1);
	//var call = 10;
	//var put = 10;


	var winner = Math.floor((Math.random()*2)+1);

	var total = Math.round(call + put);

	res.send('Bank: ' + bank + '<br />')
	if (winner == 1) {

		winnings = Math.round(call+(call*offer));
		if (winnings > total) {
			shake = Math.round(winnings - total);
			bank = Math.round(bank - shake);
			res.send("\r\n" + 'Maxbid: ' + maxbid + ' <br /> Call wins ' + winnings + ' and bank loses ' + shake);
			console.log(' Lose');
			if (offer > 0.5) {
				offer = offer - 0.1;
			}
		} else {
			rake = Math.round(total - winnings);
			bank = Math.round(bank + rake);
			res.send("\r\n" + 'Maxbid: ' + maxbid + ' <br /> Call wins ' + winnings + ' and bank wins ' + rake);
			console.log(' Win');
			if (offer < 0.8) {
				offer = offer + 0.1;
			}
		}

	} else if (winner == 2) {

		winnings = Math.round(put+(put*offer));
		if (winnings > total) {
			shake = Math.round(winnings - total);
			bank = Math.round(bank - shake);
			res.send("\r\n" + 'Maxbid: ' + maxbid + ' <br /> Put wins ' + winnings + ' and bank loses ' + shake);
			console.log(' Lose');
			if (offer > 0.5) {
				offer = offer - 0.01;
			}
		} else {
			rake = Math.round(total - winnings);
			bank = Math.round(bank + rake);
			res.send("\r\n" + 'Maxbid: ' + maxbid + ' <br /> Put wins ' + winnings + ' and bank wins ' + rake);
			console.log(' Win');
			if (offer < 0.8) {
				offer = offer + 0.01;
			}
		}

	} else {
		err++;
	}
 maxbid = Math.round((bank * 0.8)/10);
 minbid = 1000000;
 
 profit = profit + Math.round(bank * 0.01);
 res.send('Profit ' + profit);
 bank = Math.round(bank * 0.9);

	return bank;
}

//trade/
});




app.listen(80);
console.log('Trade server started...');