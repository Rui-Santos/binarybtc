require(['modules/historictrades']);
require(['modules/chart']);
require(['modules/protodate']);
var displayoptions = require(['modules/displayoptions']);
var showactive = require(['modules/activetrades']);

function validateEmail(email) { 
    var re = /^(([^<>()[\]\\.,;:\s@\"]+(\.[^<>()[\]\\.,;:\s@\"]+)*)|(\".+\"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
    return re.test(email);
} 
function symbolSwitch(symbol) {
    switch (symbol) {
      case '^DJI':
        symbol = 'DOW'
      break;
      case 'CLJ14.NYM':
        symbol = 'OIL'
      break;
      case 'GCJ14.CMX':
        symbol = 'GOLD'
      break;
      case '^GSPC':
        symbol = 'SP500'
      break;
      case '^IXIC':
        symbol = 'NASDAQ'
      break;
      case 'SLV':
        symbol = 'SILVER'
      break;
    }
    return symbol;
}

var tradingopen = true;


var defaultoption = 0.75;

var autocolor = 1;
function uitradeico(symbol, direction, manual) {
  if (manual) { autocolor = 0; }
  if (direction == 0) {
       $(".icon"+symbol).removeClass('green').removeClass('glyphicon-arrow-up').addClass('red').addClass('glyphicon-arrow-down');
    } else {
        $(".icon"+symbol).removeClass('red').removeClass('glyphicon-arrow-down').addClass('green').addClass('glyphicon-arrow-up');
    }
}



function showloginfield(username) {
if (username) {
  var login = '<div class="btn-group accountinfo" style="padding: 0px;">'+
        '<button type="button" style="height: 31px;" class="btn btn-success btnuser username">'+username+'</button>'+      
        '<button type="button" style="height: 31px;" class="btn btn-blue userbal btnfinance"></button>'+
      '</div>';

    $('.topcontainer .right').html(login);
}
}



    // $('.box').cycle({ 
    // fx:     'scrollLeft', 
    // speed:  300, 
    // next:   '.box', 
    // timeout: 0 
    // });
    
    var socket = io.connect('https://vbit.io:3000', {secure: true});
    var user, userid, option, offer, price, expires, direction, userdeposit;
    var $users = $('#users ul');
    var $chatOutput = $('.messages');
    var $chatInput = $('#chat input');
    var $messagesOutput = $('.messages');
    var $messagesInput = $('#chat input');
    var target = 0;

function loadtrades(displaysymbols) {
  if (!displaysymbols) {
  }
  // Load chart
  displayOptions(displaysymbols);
    $.each(displaysymbols, function( index, symbol ) {
      socket.on(symbol+'_chart', function (data) {
      symbol = symbolSwitch(symbol);
      if (chartinit[symbol] != true) {
       loadChart(symbol, data);
      }
    });      
      socket.on(symbol+'_updatedchart', function (data) {
      symbol = symbolSwitch(symbol);
      updateChart(symbol, data);
    });
  });
}
              //Bitcoin   Euro      Pound    Yen       Dow     Oil           Gold        Silver  S&P 500   Nasdaq
var symbols = ['BTCUSD', 'EURUSD', 'GBPUSD', 'JPYUSD', '^DJI', 'CLJ14.NYM', 'GCJ14.CMX', 'SLV', '^GSPC', '^IXIC'];
    
    socket.on('loadpage', function (data) {
      switch (data.page) {
        case 'trade':
          loadtrades(data.symbol)
        break;
        case 'accound':
          loadaccount(data.user);
        break;
      }
    });

    // socket.on('displaysymbols', function (data) {
    //   loadtrades(data);
    // });


    socket.on('hello', function (data) {
      $('.username').html(data.hello);
      showloginfield(data.hello);
      console.log('hello:', data.hello+':id'+data.id);
      user = data.hello;
      userid = data.id; //
      userdeposit = data.btc;
    });
  var lastbal = 0;
   socket.on('bankbal', function (data) {
      $('.bankbal').html(data);
    });   
    
   socket.on('userbal', function (data) {
      $('.userbal').html('m฿'+data+'');
      if (lastbal < data) {
        $('.userbal').addClass("btn-success").removeClass('btn-danger').removeClass('btn-blue');
      } else if (lastbal > data) {
        $('.userbal').addClass("btn-danger").removeClass('btn-success').removeClass('btn-blue');
      } else {
        $('.userbal').addClass("btn-blue").removeClass('btn-success').removeClass('btn-danger');
      }
      lastbal = data;
    });   


   socket.on('totalcall', function (data) {
      $('.totalcall').html(data);
    });   
   socket.on('totalput', function (data) {
      $('.totalput').html(data);
    });   
   socket.on('option', function (data) {
      $('.info h1').html(data);
    });      
   socket.on('ratios', function (data) {
      for (var key in data) {
        var obj = data[key]; 
        key = symbolSwitch(key);
        //console.log(key + obj);
        $('.progress'+key+' .progress-bar').attr('aria-valuetransitiongoal', obj);
        $('.progress'+key+' .progress-bar').progressbar();
      }
    });   
   socket.on('offer', function (data) {
      $('.rawoffer').html(data);
      $('.info h1').html(data*100+'%');
      
    });    
   socket.on('servertime', function (data) {
    var date = new Date(data);
      $('.servertime').html(date.customFormat( "#hhh#:#mm#:#ss#" ));      
    }); 
   // New Trade



// Keystones and Prices
   var lastprice, index, symbol;
   var price = {};
   
  $.each(symbols, function( index, symbol ) {

   socket.on(symbol+'_price', function (data) {
     symbol = symbolSwitch(symbol);
    if (price[symbol] > data){
        $('.keystone'+symbol).addClass('red');
        $('.keystone'+symbol).removeClass('green');
       uitradeico(symbol,0); 
      } else if (price[symbol] < data){
        $('.keystone'+symbol).addClass('green');
        $('.keystone'+symbol).removeClass('red');
        uitradeico(symbol,1);
      } else {
        $('.keystone'+symbol).removeClass('red');
        $('.keystone'+symbol).removeClass('green');
      }
      if (price[symbol] != data){
        $('.controls .price .lock').html('');
      }
      $('.keystone'+symbol).html(data);
      //lastprice = data;
      price[symbol] = data;
    });
  });


var publictrades = true;
socket.on('activetrades', function (data) {
  showactive(data);
});

   socket.on('historictrades', function (data) {
showhistoric(data, user, lastprice);
});

    $('.showallhistoric').click(function() {
      $('.historictrade').each(function( index ) {
        $(this).addClass('hide');
      });
    });


        socket.on('bank', function (data) {
          console.log('Bank: '+data);
        });

         socket.on('nexttrade', function (data) {
           data[1] = ('0' + data[1]).slice(-2)
            if (data[0] || data[1]) {
              $('.expiretime').html(data[0] + ':' + data[1]);
            }
          });     

         socket.on('tradeadded', function (symbol) {
          symbol = symbolSwitch(symbol);
           $('.apply'+symbol).removeClass('btn-warning').addClass('btn-success').html('<span class="glyphicon glyphicon-ok"></span>');

           setTimeout(function(e){
                $('.call'+symbol).removeClass('btn-default').addClass('btn-success');
                $('.put'+symbol).removeClass('btn-default').addClass('btn-danger');
                $('#'+symbol+' .direction .action').html('If');
                $('.apply'+symbol).removeClass('btn-success').addClass('btn-default').html('Apply');
            },500);
          });      

         socket.on('tradeerror', function (data) {
          symbol = data.sym;
          var err = data.msg;
          symbol = symbolSwitch(symbol);
           $('.apply'+symbol).removeClass('btn-warning').addClass('btn-danger').html('<span  class="glyphicon glyphicon-remove"></span> '+err);

           setTimeout(function(e){
                $('.apply'+symbol).removeClass('btn-danger').addClass('btn-warning').html('Apply');
            },2500);
          });   



var sitename = $('.btnlogo .sitename').html();

  socket.on('disconnect', function () {
    $('.btnlogo').removeClass('btn-warning').addClass('btn-danger');
    $('.btnlogo .sitename').html('<span class="glyphicon glyphicon-warning-sign"></span> Lost Connection');
  })
  socket.on('reconnect', function () {
    $('.btnlogo').removeClass('btn-warning').removeClass('btn-danger').addClass('btn-success');
    $('.btnlogo .sitename').html('<span class="glyphicon glyphicon-lock"></span> Reconnected');
    setTimeout(function(){
      $('.btnlogo').removeClass('btn-success').removeClass('btn-danger').addClass('btn-warning');
      $('.btnlogo .sitename').html(sitename);
    },3000);
  })



  socket.on('loginreturn', function (data) {
    console.log(data);
  });

  socket.on('tradingopen', function (data) {
    var tradingopen = data;
    //console.log(tradingopen);
  });

socket.on('alertuser', function (data) {
  if (data.color == 'green') {
    showSuccess(data.message, data.trinket, showSymbols);
  } else if (data.color == 'red') {
    showDanger(data.message, data.trinket, showSymbols);
  }
});

// Proto
    socket.on('listing', function (data) {
     // console.log('listing:', data);
      window.users = data; 
      target = 0;
      $users.empty();
      $.each(data, function (index, user) {
        //console.log(arguments);
        $users.append('<li>' + user);
      });
      $users.find('li:first').addClass('selected');
    });
    socket.on('chat', function (message) {
      console.log('chat:', message); 
      $messagesOutput.append('<div>' + message);
      $(".messages").scrollTop($(".messages")[0].scrollHeight);
    });
    socket.on('message', function (message) {
      console.log('message', message); 
      $messagesOutput.append('<div>' + message +'</div>'); 
      $(".messages").scrollTop($(".messages")[0].scrollHeight);
    });
    
    function chat(message) {
      socket.emit('chat', message);   
    }
    function message(user, message) {
      socket.emit('message', {
        user: user,
        message: message
      });
    }


require(['modules/onloadui']);