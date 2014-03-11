var fs = require('fs')
  , url = require('url')
  , path = require('path')
  , http = require('http')
  , express = require('express')
  , nowjs = require("now")
  , mongoose = require('mongoose')
  , StringDecoder = require('string_decoder').StringDecoder
  , port = 8080;


// in no particular order...

// Database connect
mongoose.connect('mongodb://localhost/test');
var db = mongoose.connection;
db.on('error', console.error.bind(console, 'connection error:'));
db.once('open', function callback () {
  console.log('Database connected on port 27017');
});

// Setup database schemas and models
var schema = new mongoose.Schema({ ip: 'string', time: 'string' });
var Pageviews = mongoose.model('pageviews', schema);
var schema = new mongoose.Schema({ symbol: 'string', price: 'string', offer: 'string', amount: 'string', direction: 'string', time: 'string', user: 'string' });
var Activetrades = mongoose.model('activetrades', schema);

// Empty temporary database
Pageviews.remove({}, function(err) {
  if (err) console.log(err);  
});
Activetrades.remove({}, function(err) {
  if (err) console.log(err);  
});

// Webserver
var io = require('socket.io').listen(3000);
io.set('log level', 1); // reduce logging
var app = express();

var server = app.listen(port, function() {
    console.log('Listening on port %d', server.address().port);
});
//app.use(express.static(path.join(__dirname, '')));
app.use("/", express.static(__dirname + '/views'));
app.get('/', function(req,res) {
  res.sendfile('views/index.html');
});

app.get('/symbol/:id', function(req, res, next){
  res.send(req.params.id);
  //res.render('index.html');
});
app.get('/trade/:id', function(req, res, next){
  res.send(req.params.id);
  //res.render('index.html');
});
app.get('/user/:id', function(req, res, next){
  res.send(req.params.id);
  //res.render('index.html');
});

// app.get('/', function(req, res){
//   res.render('index.html');
// });
// simple logger
// app.use(function(req, res, next){
//   console.log('%s %s', req.method, req.url);
//   next();
// });





// Tradeserver
var bank = 100;
var put = 0;
var call = 0;

var offer = 0.75;
var expires = '30 Minutes';
var price = {};
var a = 0;
var trades = new Array();
              //Bitcoin   Euro      Pound    Yen       Dow     Oil           Gold        Silver  S&P 500   Nasdaq
var symbols = ['BTCUSD', 'EURUSD', 'GBPUSD', 'JPYUSD', '^DJI', 'CLJ14.NYM', 'GCJ14.CMX', 'SLV', '^GSPC', '^IXIC'];

var users = {};
var userNumber = 1;
var userbalance = new Array();
var time = 0;
var clock = setInterval(function() {
  time = new Date().getTime();
  //console.log(Date(time));
  io.sockets.emit('servertime', time);
}, 1000);

var ratio = {};
var calls = {};
var puts = {};
var totalcall = {};
var totalput = {};


function trade() {
    ratio = {}; //Reset global objects
    calls = {};
    puts = {};
    totalcall = {};
    totalput = {};
  var index;//Loop the trades
    for (index = 0; index < trades.length; ++index) {
      var entry = trades[index];
      var tradesymbol = entry[0]; //BTCUSD
      var tradeprice = entry[1]; //600
      var offer = entry[2]; //0.75
      var amount = entry[3];//5
      var direction = entry[4]; //Call
      var tradetime = entry[5]; //1393712774917
      var tradeuser = entry[6]; //3
      var outcome = null;
      var winnings = 0;

      if (direction == 'Put'){
        if (tradeprice > price[tradesymbol]){
          outcome = 'Win';//Win
          winnings = (+amount+(amount*offer));
          userbalance[tradeuser] = round((+userbalance[tradeuser] + winnings), 2);
          bank = (bank-amount);

        } else if (tradeprice < price[tradesymbol]) {
          outcome = 'Lose';//Lose
          bank = (bank+amount);

        } else if (tradeprice == price[tradesymbol]) {
          outcome = 'Tie';// Tie
          userbalance[tradeuser] = (+userbalance[tradeuser] + amount);
        }
      } else if (direction == 'Call'){
        if (tradeprice < price[tradesymbol]){
          outcome = 'Win';//Win
          winnings = (amount+(amount*offer));
          userbalance[tradeuser] = round((+userbalance[tradeuser] + winnings), 2);
          bank = (bank-amount);

        } else if (tradeprice > price[tradesymbol]) {
          outcome = 'Lose';//Lose
          bank = (bank+amount);

        } else if (tradeprice == price[tradesymbol]) {
          outcome = 'Tie';// Tie
          userbalance[tradeuser] = (+userbalance[tradeuser] + amount);
        }
      }
    }//foreach trade
  trades = [];//empty the trades array
  console.log('$'+bank);
}


function addTrade(symbol, amount, direction, user, socket) {
  symbol = symbolswitch(symbol);
  if (direction == 'Call' || direction == 'Put') {
    amount = Number(amount);
    if (userbalance[user] >= amount) {
    var now = time;
    userbalance[user] = round((userbalance[user]-amount), 2);
    console.log('New trade:'+user +':'+ symbol+':'+direction+':'+amount);
    if (direction == 'Call') {
      if (calls[symbol]) { calls[symbol]++; }else {calls[symbol] = 1}
      totalcall[symbol] = Number((+totalcall[symbol] + amount));
    }if (direction == 'Put') {
      if (puts[symbol]) { puts[symbol]++; }else {puts[symbol] = 1}
      totalput[symbol] = Number((+totalput[symbol] + amount));
    }
    var t = Number(totalcall[symbol]) + Number(totalput[symbol]);
    ratio[symbol] = (Number(totalcall[symbol]) / Number(t) * 100);

    var dbactivetrades = new Activetrades({ 
      symbol: symbol,
      price: price[symbol],
      offer: offer,
      amount: amount,
      direction: direction,
      time: now,
      user: user
    });
    dbactivetrades.save(function (err) {
    });

    var valueToPush = new Array();
    valueToPush[0] = symbol;
    valueToPush[1] = price[symbol];
    valueToPush[2] = offer;
    valueToPush[3] = amount;
    valueToPush[4] = direction;
    valueToPush[5] = now;
    valueToPush[6] = user;
    trades.push(valueToPush);
    socket.emit('ratios', ratio);
    socket.emit('tradeadded', symbol);
    socket.emit('activetrades', trades);
    a++;
  } else {
    socket.emit('tradeerror', symbol);
  }
}
}

function checknextTrade() {
      var nexttrade = new Date();
      var mins = nexttrade.getMinutes();
      mins = (59-mins) % 30;
      var secs = nexttrade.getSeconds();
      if (secs != 60){
      secs = (59-secs) % 60;
      } else {
      secs = 00;
      }
      nexttrade = [Number(mins),Number(secs)];
      io.sockets.emit('nexttrade', nexttrade);

      if (mins == 0 && secs == 0){
        trade();
      }
      return nexttrade;
}




function getUsers () {
   var userNames = [];
   for(var name in users) {
     if(users[name]) {
       userNames.push(name);  
     }
   }
   return userNames;
}


var chartdata = new Array();

var lag = 0;
function getPrice(symbol, force, callback) {
  var err = 0;var data = null;
if (lag < 1) {
if (symbol == 'BTCUSD') {
var options = {
  host: 'api.bitcoinaverage.com',
  port: 80,
  path: '/ticker/USD/last'
};
http.get(options, function(resp){
  var decoder = new StringDecoder('utf8');
  resp.on('data', function(chunk){
    chunk = decoder.write(chunk);
    //console.log(chunk);
    var data = chunk;
    if(parseInt(data, 10) > 0) { 
    //console.log('Polling '+options.host+' for '+symbol+' : '+data);
    updatePrice(data, force, symbol);
    price[symbol] = data;
    }else {
      lag = lag+2;
    }
  });
}).on("error", function(e){
  console.log("Got error: " + e.message);
}); // if symbol is a currency, we run it through for the exchange rate
}else if (symbol == 'EURUSD' || symbol == 'GBPUSD' || symbol == 'JPYUSD') {
var options = {
  host: 'download.finance.yahoo.com',
  port: 80,
  path: '/d/quotes.csv?s='+symbol+'=X&f=sl1d1t1c1ohgv&e=.csv'
};
http.get(options, function(resp){
  var decoder = new StringDecoder('utf8');
  resp.on('data', function(chunk){
    chunk = decoder.write(chunk);
    data = chunk.split(',');
    data = data[1];

    if(isNumber(data)) { // is this data even numeric?
      //console.log('Polling '+options.host+' for '+symbol+' : '+data);
      updatePrice(data, force, symbol);
      //price_eurusd = data;
      price[symbol] = data;
    }else {
      lag = lag+2;
    }
  });
}).on("error", function(e){
  console.log("Got error: " + e.message);
  err++;
});
// if symbol is a stock, run it through for the price
}else {
var options = {
  host: 'download.finance.yahoo.com',
  port: 80,
  path: '/d/quotes.csv?s='+symbol+'&f=sl1d1t1c1ohgv&e=.csv'
};
http.get(options, function(resp){
  var decoder = new StringDecoder('utf8');
  resp.on('data', function(chunk){
    chunk = decoder.write(chunk);
    data = chunk.split(',');
    data = data[1];

    if(parseInt(data, 10) > 0) { // is this data even numeric?
      //console.log('Polling '+options.host+' for '+symbol+' : '+data);
      updatePrice(data, force, symbol);
      //price_eurusd = data;
      price[symbol] = data;
    }else {
      lag = lag+2;
    }
  });
}).on("error", function(e){
  console.log("Got error: " + e.message);
  err++;
});
}// jump over third-party gates
} else {
  //console.log('Finances API Lag: '+lag);
  lag--;
}
}

// price and chart updators

var i = 0;
var lastentry, firstentry, timewindow, chartsymbol, lastprice;
var chartdata = [];
var chart = {};

function updatePrice(data, force, symbol) {
   // if (lastprice != data) {
      io.sockets.emit(symbol+'_price', data);
      updateChart(data, symbol);
   // }
}
          chartdata = [];
function updateChart(data, symbol, force) {
      //if (data != lastchart || force) {
          chartsymbol = symbol + '_chart';

        if (Number(data)) {
          if (chart[symbol]) {
            chartdata = chart[symbol];
          } else {
            chartdata = [];
          }
          chartentry = new Array(time, Number(data));
//console.log('Charting '+symbol+' : '+chartentry);
          chartdata.push(chartentry);
          //console.log(chartdata);
          chart[symbol] = chartdata;
          io.sockets.emit(chartsymbol, chart[symbol]);
          lastchart = data;
            if (i == 0) {
              firstentry = time;
              lastentry = time;
            } else {
              lastentry = time;
            }
              i++;
              timewindow = lastentry - firstentry;
             if (timewindow > 3600000) {
              i--;
              chartdata.shift();
              io.sockets.emit(chartsymbol, chart[symbol]);
              //console.log(chartdata);
            }
      } 
    //}
}

function round(num, places) {
    var multiplier = Math.pow(10, places);
    return Math.round(num * multiplier) / multiplier;
}

// Timers and updators
// var priceupdator = setInterval(function() {
// }
// }, 4000);

var symbolindex = 0;
var tradeupdator = setInterval(function() {
for (index = 0; index < symbols.length; ++index) {
    getPrice(symbols[index], 1);
}
    // if (symbolindex < symbols.length) {
    //  getPrice(symbols[index],'', updatePrice);
    //  symbolindex++;
    // } else {
    //   symbolindex = 0;
    // }
}, 4000);

// User Connects
io.sockets.on('connection', function (socket) {
var ipaddress = socket.handshake.address; //ipaddress.address/ipaddress.port

// Log the connection
var pageload = new Pageviews({ 
  ip: ipaddress.address,
  time: time
});
pageload.save(function (err) {
  //if (err) // ...
  console.log(ipaddress.address+':'+ipaddress.port+' connected');
});


//Send user current data on connect
for (index = 0; index < symbols.length; ++index) { 
    io.sockets.emit(symbols[index]+'_price', price[symbols[index]]);
    io.sockets.emit(symbols[index]+'_chart', chart[symbols[index]]);
}

// Users

  var myNumber = userNumber++;
  var myName = 'User' + myNumber;

  users[myNumber] = socket;
  userbalance[userNumber] = 10;
if (trades) {
socket.emit('activetrades', trades);
}

//console.log('user connected.');
//console.log(chartdata);

  socket.on('trade', function (data) {
    var re = new RegExp(/[\s\[\]\(\)=,"\/\?@\:\;]/g); 
    if (re.test(data.amount)) { console.log('Illegal trade input from '+myName); } else {
    addTrade(data.symbol, data.amount, data.direction, data.user, socket);
    socket.emit('activetrades', trades);
      }
  });
  socket.on('action', function (data) {
    console.log(data);
  });


    socket.emit('userbal', userbalance[myNumber]);
  var updator = setInterval(function() {
    socket.emit('userbal', userbalance[myNumber]);
    if (trades) {
    socket.emit('activetrades', trades);
    }
        socket.emit('ratios', ratio);
      checknextTrade();
  },999);

// open sockets to chrome
  socket.emit('hello', { hello: myName, id: myNumber });
 
  io.sockets.emit('totalcall', call);
  io.sockets.emit('totalput', put);

  socket.emit('symbols', symbols);
  //io.sockets.emit('option', symbol);
  io.sockets.emit('offer', offer);
  io.sockets.emit('expires', expires);
  
  socket.on('chat', function (message) {
    io.sockets.emit('chat', myName + ': ' + message);
  });

  socket.on('message', function (data) {
    users[data.user] &&
      users[data.user].emit('message', myName + '-> ' + data.message); 
  });
  
  // remove user from ram on disconnect
  socket.on('disconnect', function () {
    users[myName] = null;
    userbalance[myNumber] = null;
    clearInterval(updator);
    io.sockets.emit('listing', getUsers());
  });
});


function isNumber(n) {
  return !isNaN(parseFloat(n)) && isFinite(n);
}

function symbolswitch(symbol){
      // switch out illigal characters
    switch (symbol) {
      case 'DOW':
        symbol = '^DJI'
      break;
      case 'OIL':
        symbol = 'CLJ14.NYM'
      break;
      case 'GOLD':
        symbol = 'GCJ14.CMX'
      break;
      case 'SP500':
        symbol = '^GSPC'
      break;
      case 'NASDAQ':
        symbol = '^IXIC'
      break;      
      case 'SILVER':
        symbol = 'SLV'
      break;
    }
  return symbol;
}

// probably important?
var exec = require('child_process').exec;

// Function to add custom formats to dates in milliseconds
Date.prototype.customFormat = function(formatString){
    var YYYY,YY,MMMM,MMM,MM,M,DDDD,DDD,DD,D,hhh,hh,h,mm,m,ss,s,ampm,AMPM,dMod,th;
    var dateObject = this;
    YY = ((YYYY=dateObject.getFullYear())+"").slice(-2);
    MM = (M=dateObject.getMonth()+1)<10?('0'+M):M;
    MMM = (MMMM=["January","February","March","April","May","June","July","August","September","October","November","December"][M-1]).substring(0,3);
    DD = (D=dateObject.getDate())<10?('0'+D):D;
    DDD = (DDDD=["Sunday","Monday","Tuesday","Wednesday","Thursday","Friday","Saturday"][dateObject.getDay()]).substring(0,3);
    th=(D>=10&&D<=20)?'th':((dMod=D%10)==1)?'st':(dMod==2)?'nd':(dMod==3)?'rd':'th';
    formatString = formatString.replace("#YYYY#",YYYY).replace("#YY#",YY).replace("#MMMM#",MMMM).replace("#MMM#",MMM).replace("#MM#",MM).replace("#M#",M).replace("#DDDD#",DDDD).replace("#DDD#",DDD).replace("#DD#",DD).replace("#D#",D).replace("#th#",th);

    h=(hhh=dateObject.getHours());
    if (h==0) h=24;
    if (h>12) h-=12;
    hh = h<10?('0'+h):h;
    AMPM=(ampm=hhh<12?'am':'pm').toUpperCase();
    mm=(m=dateObject.getMinutes())<10?('0'+m):m;
    ss=(s=dateObject.getSeconds())<10?('0'+s):s;
    return formatString.replace("#hhh#",hhh).replace("#hh#",hh).replace("#h#",h).replace("#mm#",mm).replace("#m#",m).replace("#ss#",ss).replace("#s#",s).replace("#ampm#",ampm).replace("#AMPM#",AMPM);
}