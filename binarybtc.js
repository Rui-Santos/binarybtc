var port = 8080
  , fs = require('fs')
  , url = require('url')
  , path = require('path')
  , http = require('http')
  , nowjs = require('now')
  , https = require('https')
  , express = require('express')
  , mongoose = require('mongoose')
  , passport = require('passport')
  , Keygrip = require('keygrip')
  , BlockchainWallet = require('blockchain-wallet')
  , bitcoin = require('bitcoin')
  , LocalStrategy = require('passport-local').Strategy
  , StringDecoder = require('string_decoder').StringDecoder


// Database connect
fs.readFile('/home/node/keys/mongo.key', 'utf8', function (err,data) {
  if (err) throw (err)
  var key = data.replace("\n", "").replace("\r", "");
  mongoose.connect(key);
  var db = mongoose.connection;
  db.on('error', console.error.bind(console, 'connection error:'));
  db.once('open', function callback () {
    console.log('Database connected on port 27017');
  });
});


// Setup database schemas and models
var schema = new mongoose.Schema({ key: 'string', user: 'string', createdAt: { type: Date, expires: '1h' }});
var Activeusers = mongoose.model('activeusers', schema);
var schema = new mongoose.Schema({ username: 'string', createdAt: { type: Date, expires: '1h' }});
var Userfirewall = mongoose.model('userfirewall', schema);
var schema = new mongoose.Schema({ ip: 'string', time: 'string', handle: 'string' });
var Pageviews = mongoose.model('pageviews', schema);
var schema = new mongoose.Schema({ symbol: 'string', price: 'string', offer: 'string', amount: 'string', direction: 'string', time: 'string', user: 'string' });
var Activetrades = mongoose.model('activetrades', schema);
var schema = new mongoose.Schema({ symbol: 'string', price: 'string', offer: 'string', amount: 'string', direction: 'string', time: 'string', user: 'string', outcome: 'string' });
var Historictrades = mongoose.model('historictrades', schema);
var schema = new mongoose.Schema({ symbol: 'string', chart: 'string'});
var Historicprices = mongoose.model('historicprices', schema);

// Empty temporary database
Pageviews.remove({}, function(err) {
  if (err) console.log(err);  
});
// Activetrades.remove({}, function(err) {
//   if (err) console.log(err);  
// });

// Webserver

// Include SSL server.key and domain.crt from a safe place
var options = {
  key: fs.readFileSync('/home/node/keys/server.key'),
  cert: fs.readFileSync('/home/node/keys/vbit_io.crt')
}
// Start secure webserver
//var keys = new Keygrip(["SEKRIT2", "SEKRIT1"]);
var app = module.exports = express();
app.configure(function() {
  app.use(express.static('public'));
  app.use(app.router);
  app.use(express.cookieParser('SEKRIT1'));
  app.use(passport.initialize());
  app.use(passport.session());
  app.use(express.bodyParser());
});
app.engine('.html', require('ejs').__express);
app.set('views', __dirname + '/views');
app.set('view engine', 'html');
// Create the server object
var server = https.createServer(options, app).listen(port, function(){
  console.log("Express server listening on port " + port);
});

// Start secure socket server
var io = require('socket.io').listen(3000, options);
io.set('log level', 1); // reduce logging

// User Middleware
var User = require('user-model');

var btc = require('bitcoinclient');
//require('blockchain.js');
// dump(1, 'liam');
//console.log(balances);


// Tradeserver Variables
              //Bitcoin   Euro      Pound    Yen       Dow     Oil           Gold        Silver  S&P 500   Nasdaq
var symbols = ['BTCUSD', 'EURUSD', 'GBPUSD', 'JPYUSD', '^DJI', 'CLJ14.NYM', 'GCJ14.CMX', 'SLV', '^GSPC', '^IXIC'];

var bank = 200;
var put = 0;
var call = 0;
var maxamount = 75; // the max amount a user can set for any one trade
var maxoffset = { bottom: 75, top: 25 }; 
var cuttrading = 0; // seconds before trading where the user is locked out from adding a trade (zero to disable)
var offer = 0.75;
var tradeevery = 5; // Default time in minutes before trading again
var userNumber = 1;
var userbalance = new Array();
var blockchainadd = new Array();
var trades = new Array();
var signupsopen = true; // Allow signups?
var tradingopen = true; // Allow trading? -proto
var users = {};
var price = {};
var ratio = {};
var balance = {};
var calls = {};
var puts = {};
var totalcall = {};
var totalput = {};
var a = 0;

// Global clock
var date = 0;
var time = 0;
var clock = setInterval(function() {
  time = new Date().getTime();
  date = new Date();
  io.sockets.emit('servertime', time);
}, 1000);

// The wild-west of functions

// Check if a user exists
function userCheck(username) {
  var usern = null;
  // fetch user and test password verification
  User.findOne({ username: username }, function(err, user) {
    if (err) throw err;
    if (user != null){
    usern = user.username;
    }
  });
  // return the username or null
  return usern;
}
// Check if a username and password are true
function userFetch(username, password) {
  // Find the user in the database
  User.findOne({ username: username }, function(err, user) {
    if (err) throw err;
    if (user) {
     // Test the supplied password using middleware
    user.comparePassword(password, function(err, isMatch) {
         if (err) throw err;
         // return true or false
         return isMatch;
    });
  }
});
}


// Master trade function
function trade() {
  var index;//Loop the trades
    for (index = 0; index < trades.length; ++index) {
      var entry = trades[index]; ///example data
      var tradesymbol = entry[0]; //BTCUSD
      var tradeprice = entry[1]; //600
      var offer = entry[2]; //0.75
      var amount = entry[3];//5
      var direction = entry[4]; //Call
      var tradetime = entry[5]; //1393712774917
      var tradeuser = entry[6]; //Guest123
      var outcome = null;
      var winnings = 0;

      // Check the direction and calculate the outcome
      if (direction == 'Put'){
        if (tradeprice > price[tradesymbol]){
          outcome = 'Win';//Win
          winnings = (+amount+(amount*offer));
          userbalance[tradeuser] = round((+userbalance[tradeuser] + winnings), 2);
          bank = (+bank-(amount*offer));
          //pay(winnings, tradeuser);
          processTrade(tradeuser, outcome, winnings)
        } else if (tradeprice < price[tradesymbol]) {
          outcome = 'Lose';//Lose
          //bank = (bank+amount);
          processTrade(tradeuser, outcome, amount)
        } else if (tradeprice == price[tradesymbol]) {
          outcome = 'Tie';// Tie
          //pay(amount, tradeuser);
          userbalance[tradeuser] = (+userbalance[tradeuser] + amount);  
          processTrade(tradeuser, outcome, amount)      
        }
      } else if (direction == 'Call'){
        if (tradeprice < price[tradesymbol]){
          outcome = 'Win';//Win
          winnings = (amount+(amount*offer));
          userbalance[tradeuser] = round((+userbalance[tradeuser] + winnings), 2);
          bank = (bank-(amount*offer));
          //pay(winnings, tradeuser);
          processTrade(tradeuser, outcome, winnings)
        } else if (tradeprice > price[tradesymbol]) {
          outcome = 'Lose';//Lose
          //bank = (bank+amount);  
          processTrade(tradeuser, outcome, amount)
        } else if (tradeprice == price[tradesymbol]) {
          outcome = 'Tie';// Tie
          userbalance[tradeuser] = (+userbalance[tradeuser] + amount);
          //pay(amount, tradeuser);
          processTrade(tradeuser, outcome, amount)      
        }
      }

      if (winnings > 0) {
        var outcomestring = 'User'+tradeuser+' '+outcome+' Trade: ' + tradesymbol + ':' + tradeprice  + ':' + direction + ' paid $' + winnings;
      } else {
        var outcomestring = 'User'+tradeuser+' '+outcome+' Trade: ' + tradesymbol + ':' + tradeprice  + ':' + direction + ' lost $' + amount;
      }
      console.log(outcomestring);
    
    var dbhistorictrades = new Historictrades({ 
      symbol: tradesymbol,
      price: tradeprice,
      offer: offer,
      amount: amount,
      direction: direction,
      time: tradetime,
      user: tradeuser,
      outcome: outcome
    });
    dbhistorictrades.save(function (err) {
      if (err) console.log(err)
    });
  ratio[tradesymbol] = 50;
    }//foreach trade
  // empty the ram and database of old objects
  calls = {};
  puts = {};
  totalcall = {};
  totalput = {};
  trades = [];
  Activetrades.remove({}, function(err) {
  if (err) console.log(err);  
  });
      console.log('$'+bank+' '+date);
      io.sockets.emit('bank', bank);
}

// Add a trade for a user
function addTrade(symbol, amount, direction, user, socket) {
  var err = {};
  symbol = symbolswitch(symbol);

  // Check the amount
  if (amount > 0) {
  // Check the direction and make sure price[symbol] exists
  if (direction == 'Call' || direction == 'Put' && price[symbol]) {
    // Put the amount info a number
    amount = Number(amount);
    // Check if the amount is over maxamount
    if (amount <= maxamount) {
      // Check if the amount is over the user balance
      if (userbalance[user] >= amount) {

        if (direction == 'Call' && ratio[symbol] > maxoffset.bottom) {
          // The direction is invalid
              err.sym = symbol;
              err.msg = 'Call';
              socket.emit('tradeerror', err);
          return false;
        }else if (direction == 'Put' && ratio[symbol] < maxoffset.top) {
          // The direction is invalid
              err.sym = symbol;
              err.msg = 'Put';
              socket.emit('tradeerror', err);
              return false;
        } else {
          var now = time;
          // Update the user balance
          userbalance[user] = round((userbalance[user]-amount), 2);
          //collect(amount, user);

          // Adjust the totals
          if (direction == 'Call') {
            if (calls[symbol]) {calls[symbol]++;}else {calls[symbol] = 1}
            if (totalcall.symbol) {
              var totalcallsi= Number(totalcall.symbol) + Number(amount);
            } else {
              var totalcallsi= Number(amount);
            }
            totalcall = { symbol: totalcallsi };
          } if (direction == 'Put') {
              if (puts[symbol]) { puts[symbol]++; }else {puts[symbol] = 1}
            if (totalput.symbol) {
              var totalputsi= Number(totalput.symbol) + Number(amount);
            } else {
              var totalputsi= Number(amount);
            }
            totalput = { symbol: totalputsi };
          }
          if (!totalcall.symbol) { totalcall.symbol = 0; }
          if (!totalput.symbol) { totalput.symbol = 0; }

            // Adjust the ratios
          var t = Number(totalcall.symbol) + Number(totalput.symbol);
          console.log('Total '+symbol+' pot $'+t);
          ratio[symbol] = round(Number(totalcall.symbol) / Number(t) * 100);


          // Insert the trade into the database
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
            if (err) throw (err);
            // Announe the trade
            console.log('New trade:'+user +':'+ symbol+':'+direction+':'+amount);
            console.log('Total Call '+symbol+':'+totalcall.symbol);
            console.log('Total Put '+symbol+':'+totalput.symbol);
            console.log('Ratio '+symbol+' %'+ratio[symbol]);
              // Inser the trade into the ram
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
              return true;
          });
      }
    } else {
      // The amount is larger than the user's balance
      err.sym = symbol;
      err.msg = '';
      socket.emit('tradeerror', err);
      return false;
    } // err
  } else {
    // The amount is over the max ammount
    err.sym = symbol;
    err.msg = 'High';
    socket.emit('tradeerror', err);
    return false;
  }
  } else {
    // The direction is invalid
    err.sym = symbol;
    err.msg = '';
    socket.emit('tradeerror', err);
    return false;
  }
  }else {
    // The amount is not over zero
    err.sym = symbol;
    err.msg = '';
    socket.emit('tradeerror', err);
    return false;
  } 
}

// Calculate the next trade
function checknextTrade() {

    time = new Date().getTime();
  date = new Date();
  // Get minutes in the global date object [10:01:02AM]
  var mins = date.getMinutes(); // [01]
    mins = (59-mins) % tradeevery; // Trade every % ten minutes
  // Get seconds
  var secs = date.getSeconds(); // [02]
  if (secs != 60){
    secs = (59-secs) % 60;
  } else {
    secs = 00;
  }
  var nexttrade = [Number(mins),Number(secs)];  // Put the next trade in an array [8:58]
  io.sockets.emit('nexttrade', nexttrade); // Emit to chrome
  // If it's time to trade
  if (nexttrade[0] == 0 && nexttrade[1] == 0){
    trade();
  }
// Kindly reurn the next trade array
  return nexttrade;
}

// Proto trade shaping
// function calculateImbalance(symbol) {
//   Activetrades.find({symbol: symbol},function(err,trades){ 
//     trades.forEach(function(elem, index, array) {
//       elem.offer = "apple";
//       elem.amount =
//     elem.save();
// });
// }
// }


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

// price and chart updaters

var i = 0;
var lastentry, firstentry, timewindow, chartsymbol, lastprice;
var chartdata = [];
var chart = {};

function updatePrice(data, force, symbol) {
   // if (lastprice != data) {
      io.sockets.emit(symbol+'_price', data);
      updateChart(data, symbol);
      chartPoint(data, symbol);
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
             if (timewindow > 1800000) {
              i--;
              chartdata.shift();
              io.sockets.emit(chartsymbol, chart[symbol]);
              //console.log(chartdata);
            }
      } 
    //}
}

// Emit a single updated chart point for the client
function chartPoint( data, symbol) {
          chartsymbol = symbol + '_updatedchart';
        if (Number(data)) {
          chartentry[symbol] = [time, Number(data)];
          io.sockets.emit(chartsymbol, chartentry[symbol]);
      } 
}


var symbolindex = 0;
var tradeupdater = setInterval(function() {
for (index = 0; index < symbols.length; ++index) {
    getPrice(symbols[index], 1);
}
}, 4000);
User.count({ }, function (err, count) {
  if (err) throw(err);
  userNumber = (userNumber+count);
});

// Socketeering
var myName, myNumber;
// User Connects
io.sockets.on('connection', function (socket) {
  var hs = socket.handshake;
  var ipaddress = hs.address; //ipaddress.address/ipaddress.port
  ipaddress = ipaddress.address;


  var updater = setInterval(function() {
    checknextTrade(); // Check for the next trade
  },1000); // Run every second

  
  // Check the users cookie key
  checkcookie(socket, function(myName, isloggedin) { // isloggedin = true/false
    // Run the script securely

// Add the users banace to the global blanace array and let them know strait away

  // bal(myName, function(balance) {
  //   userbalance[myName] = balance;
  //   socket.emit('userbal', userbalance[myName]);
  // });

if (!userbalance[myName]) {
  userbalance[myName] = 15;
}


  //address(myName, function(add) {
    blockchainadd[myName] = 'add';
    //console.log(blockchainadd[myName]);
  //});

  myNumber = userNumber++;
  if (!myName) { myName = 'Guest'+myNumber; } 

// Assign the socket to a user array
  users[myName] = socket;

  // Say hello
  console.log('hello ' + myName + ' id' + myNumber + ' $' + userbalance[myName] + ' ' + blockchainadd[myName])
  socket.emit('hello', { hello: myName, id: myNumber, btc: blockchainadd[myName] });

  //Send user current data on connect
  for (index = 0; index < symbols.length; ++index) { 
      io.sockets.emit(symbols[index]+'_price', price[symbols[index]]);
      io.sockets.emit(symbols[index]+'_chart', chart[symbols[index]]);
  }
  Historictrades.find({ user: myName }, function (err, historictrades) {
    //console.log(historictrades)
    socket.emit('historictrades', historictrades);
  });

  // Emit any active trades on pageload
  if (trades) {
    socket.emit('activetrades', trades);
  }

  // Pass new trade details from the socket to addTrade
  socket.on('trade', function (data) {
    // Check if input data is valid
    var re = new RegExp(/[\s\[\]\(\)=,"\/\?@\:\;]/g); 
    if (re.test(data.amount)) { console.log('Illegal trade input from '+myName); } else {
      // Push data to addTrade
      //console.log('add trade for ' + data.user);
      addTrade(data.symbol, data.amount, data.direction, data.user, socket);
      // Emit active trades again
      socket.emit('activetrades', trades);
    }
  });

  // Proto action socket listener
  socket.on('action', function (data) {
    console.log('action: '+data);
  });

  // Create a general script updater
  var updater = setInterval(function() {
    // bal(myName, function(balance) {
    //   userbalance[myName] = balance;
    //   socket.emit('userbal', balance);
    // });
    socket.emit('userbal', userbalance[myName]); // Update userbalance
    if (trades) {
      socket.emit('activetrades', trades); // Update active trades
    }
    Historictrades.find({  user: myName }, function (err, historictrades) {
      socket.emit('historictrades', historictrades); // Update historic trades
    });

    io.sockets.emit('tradingopen', tradingopen); // Update trading status
    socket.emit('ratios', ratio); // Update ratios
    io.sockets.emit('listing', getUsers()); // Update user listing
  },1000); // Run every second


// User functions
 
 // Emit trade objects
  socket.emit('symbols', symbols);
  io.sockets.emit('totalcall', call);
  io.sockets.emit('totalput', put);
  //io.sockets.emit('option', symbol);
  io.sockets.emit('offer', offer);
  
  // Protochat
  // socket.on('chat', function (message) {
  //   io.sockets.emit('chat', myName + ': ' + message);
  // });  
  // socket.on('message', function (data) {
  //   users[data.user] &&
  //     users[data.user].emit('message', myName + '-> ' + data.message); 
  // });

// User disconnects
  socket.on('disconnect', function () {
    console.log(myName+' disconnected');
    //users[myName] = null;
    //userbalance[myName] = null;
    // if (guest == true) {
    //   Historictrades.remove({ user: myNumber }, function (err) {
    //   if (err) throw(err);
    //   });
    // }
    clearInterval(updater);
    io.sockets.emit('listing', getUsers());
  });


  }); // Cookies

var userpage = [];
var displaysymbols = ['GCJ14.CMX'];

if (!userpage[myName]){
socket.emit('loadpage', {page: 'trade', symbol: displaysymbols});
}
//socket.emit('displaysymbols', displaysymbols);
io.sockets.emit('tradingopen', tradingopen); // Update trading status

});

// Express webservice

// Use the Views directory
app.use('/', express.static(__dirname + '/views'));
// Send index
app.get('/', function(req,res) {
  res.render('index', {
    symbol: 'GCJ14.CMX',
    user: true,
    activetrades: true,
    historictrades: true,
    col: 2
  });  

});
app.get('/index', function(req, res) {
    res.render('index', {
    symbol: 'GCJ14.CMX',
    user: true,
    activetrades: true,
    historictrades: true,
    col: 2
  });
});

app.get('/nexttrade/', function(req, res, next){
  var nexttrade = checknextTrade();
  res.send(nexttrade[0]+':'+nexttrade[1]);
});
// Proto
app.get('/symbol/:id', function(req, res, next){
  res.render('index', {
    symbol: req.params.id,
    user: true,
    activetrades: true,
    historictrades: true,
    col: 2
  });
});
app.get('/trade/:id', function(req, res, next){
  res.send(req.params.id);
  //res.render('index.html');
});

app.get('/logout', function(req, res) {
  res.clearCookie('key');
  res.send('OK');
  res.end();
});

// Login
app.get('/login/:email/:password', function(req, res) {
      // Get username and password variables
      var password = decodeURI(req.param('password', null));
      var email = decodeURI(req.param('email', null));
      //console.log('login request recieved: ' + email + ':' + password);
          // Check if this username is in the userfilewall
          Userfirewall.count({username: email}, function(err, c){
            if (err) throw (err)
            // If this user has less than 5 failed login attempts in the past hour
            if (c < 5) {
              // If the username and password exist
              if (email && password) {
                // Find the user in the database
                User.findOne({ username: email }, function(err, user) {
                  if (err) throw err;
                  // If user exits
                  if (user) {
                   // Test the password
                    user.comparePassword(password, function(isMatch, err) {
                      if (err)  { throw (err); } else {
                        // On success
                        if (isMatch == true) {
                          // Generate a signature
                          var signature = randomString(32, 'HowQuicklyDaftJumpingZebrasVex');
                          // Add it into a secured cookie
                          res.cookie('key', signature, { maxAge: 3600000, path: '/', secure: true });
                          // Add the username and signature to the database
                          var userKey = new Activeusers({
                            key: signature,
                            user: email,
                            createdAt: date
                          });
                          userKey.save(function(err) {
                             if (err) { throw (err) }
                            });
                           res.send("OK");
                        } else if (isMatch == false) {
                          // On error
                          res.send("Invalid username or password.");
                          // Log the failed request
                          var loginRequest = new Userfirewall({
                            username: email,
                            createdAt: date
                          });
                         loginRequest.save(function(err) {
                           if (err) { throw (err) }
                          });
                        }
                    }
                    });
                } else {
                  res.send("Invalid username or password.");
                }
                });
              }
            } else {
              // Block brute force
              res.send("Too many requests.");
            }
          });
});app.get('/login', function(req, res){
  res.send('Let me explain: /login/{email}/{password}');
});

// Add a user
app.get('/adduser/:username/:password', function(req, res, next){
if (signupsopen == true) {

  // Create a new blockchain address
    var blockchainpass = randomString(32, 'HowQuicklyDaftJumpingZebrasVex'); // Random pass
    var blockchainuser = String(req.params.username); // Username
    blockchain.newAddress({second_password: blockchainpass, label: blockchainuser}, 
    function(err, data) {
      if(err) {throw err; console.log('Error on a new Blockchain: ' + err); }
  // create a user a new user
    var blockchainaddress = data.address;
    var newUser = new User({
        username: req.params.username,
        password: req.params.password,
        bitcoin: blockchainaddress
    });
  // save user to database
  newUser.save(function(err) {
    if (err) { // Something goes wrong
      // clean up the blockchain
      blockchain.archiveAddress(blockchainaddress, function(err, data) {
        if (err) throw(err)
      });

      switch(err.code){
        case 11000: // Username exists
        res.send('Username Taken');
      break
        default:
        res.send(err);
        }
    } else {
      res.send('OK');

    }
    });
  });
} else {
  res.send('Signups are not open at this time.');
}
});
app.get('/adduser/:username', function(req, res, next){
  res.send('Specify a Password<br />/adduser/{username}/{password}');
});app.get('/adduser', function(req, res, next){
  res.send('Specify an Email and Password<br />/adduser/{username}/{password}');
});

// Load subpages
app.get('/account/', function(req, res, next){
  //res.send(req.params.id);
  res.sendfile('views/a.html');
});
app.get('/finance/', function(req, res, next){
  //res.send(req.params.id);
  res.sendfile('views/f.html');
});

// function wasteland */

function checkcookie(socket, next) {
var result = null;
  //Parse existing cookies
  if (socket.handshake.headers.cookie) {
    var cookie = socket.handshake.headers.cookie;
    var cookieObj = {};
    var cookieArr = cookie.split(';');
    for (index = 0; index < cookieArr.length; ++index) {
      var cookieKV = cookieArr[index];
      cookieKV = cookieKV.trim();
      var cookieKVArr = cookieKV.split('=');
      cookieObj[cookieKVArr[0]] = cookieKVArr[1];
      //console.log(cookieObj.key);
    }
    if (cookieObj.key) {
      Activeusers.find({ key: cookieObj.key }, function (err, docs) {
        if (err) { } else {
        docs = docs[0];
        // User authorized
        if (docs) {
          //console.log(docs.user + ":" + docs.key);
          next(docs.user, true);
            //console.log(myName+':'+myNumber+' connected');
          // Log the connection
          var pageload = new Pageviews({ 
            ip: socket.handshake.address.address,
            time: time,
            handle: myName
          });
          pageload.save(function (err) { 
            if (err) throw (err);
          }); 
        } // if docs
        }
      });
      }
    } // if cookie
}

  function processTrade(tradeuser, outcome, amount) {

    //loginfo(); // Bitcoin info logger

    socket = users[tradeuser];
    if (outcome == 'Win') {
    socket.emit('alertuser', {
     color: 'green',
      message: 'You won '+amount+''
    });
    } else if (outcome == 'Lose') {
    socket.emit('alertuser', {
     color: 'red',
      message: 'You lost '+amount+''
    });
    } else if (outcome == 'Tie') {
    socket.emit('alertuser', {
     color: 'green',
      message: 'Push for '+amount+''
    });
    }
  }



function round(num, places) {
  if (!places) places = 0;
    var multiplier = Math.pow(10, places);
    return Math.round(num * multiplier) / multiplier;
}

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

function randomString(length, chars) {
    var result = '';
    for (var i = length; i > 0; --i) result += chars[Math.round(Math.random() * (chars.length - 1))];
    return result;
}
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
