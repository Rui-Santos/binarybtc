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

var autocolor = 1;
function uitradeico(symbol, direction, manual) {
  if (manual) { autocolor = 0; }
  if (direction == 0) {
       $(".icon"+symbol).removeClass('green').removeClass('glyphicon-arrow-up').addClass('red').addClass('glyphicon-arrow-down');
    } else {
        $(".icon"+symbol).removeClass('red').removeClass('glyphicon-arrow-down').addClass('green').addClass('glyphicon-arrow-up');
    }
}
var option = new Array();
function displayOptions(displaysymbols) {
  $.each(displaysymbols, function( index, symbol ) {
    symbol = symbolSwitch(symbol);
    var open = '<div class="controls" id="'+symbol+'">'+
        '<div class="progress progress'+symbol+' vertical">'+
            '<div class="progress-bar progress-bar-success" role="progressbar" aria-valuetransitiongoal="0"></div>'+
        '</div>'+
            '<div class="btn-group-vertical callputcontainer">'+
            '<button type="button" class="btn btn-success callbtn call'+symbol+'">'+
             ' <span class="glyphicon glyphicon-arrow-up"></span>'+
              'Call'+
            '</button>'+
             '<button type="button" class="keystone btn btn-default keystone'+symbol+'" style="font-weight: bold;">'+
              '--.--'+
            '</button>'+
            '<button type="button" class="btn btn-danger putbtn put'+symbol+'">'+
              'Put'+
              '<span class="glyphicon glyphicon-arrow-down"></span>'+
            '</button>'+
          '</div>'+
          '<div class="info">'+
          '<div class="details">'+
            '<h1>--.-</h1>'+
            '<span class="hide rawoffer"></span>'+
           '<!--  <span class="bold rate">Payout if</span><br /> -->'+
            '<span class="direction bold"><span class="action">If</span>: <span class="option">'+symbol+'</span> <span class="tradeicon glyphicon icon'+symbol+' green glyphicon-arrow-up"></span></span><br />'+
            '<span class="price">From: <span class="keystone keystone'+symbol+'"> --.--</span> <span class="lock"></span></span><br />'+
            '<span class="expires bold">In: <span class="expiretime"></span></span>'+
          '</div><div class="trader">' +
            '<div class="input-group amount">'+
                  '<span class="input-group-addon">m฿</span>'+
                  '<input type="number" class="form-control amountfield" style="height: 28px;" placeholder="">'+
            '</div></div>'+
            '<button type="button" class="btn btn-default applytrade apply'+symbol+'">Apply</button>'+

          '</div>'+
         '</div>';
    var closed = '<div class="nooffer"><i class="fa fa-lock" style="font-size: 25px;"></i><br />Trading is Closed <br />'+symbol+':<span class="keystone'+symbol+'"></span></div>';

    //if trading is allowed on this symbol
    var renderoffer = open;

    if (index > 0){
    var header = '<div class="header" style="border-top: 1px solid #eee;">'+symbol+'</div>';
    } else {
    var header = '<div class="header">'+symbol+'</div>';
    } 

    option.push(header+'<div class="panel'+symbol+'">'+
      // '<div class="header">'+symbol+'</div>'+
      '<div class="numbotron" id="'+symbol+'_container">'+
      '</div>'+
      '<div class="controls" id="'+symbol+'">'+
        renderoffer +
         '</div>'+
         '<div style="clear:both;"></div>'+
        '</div>');
       $(".symbols").append(option[index]);
      });
  }
  $(function () {
    // $('.box').cycle({ 
    // fx:     'scrollLeft', 
    // speed:  300, 
    // next:   '.box', 
    // timeout: 0 
    // });
    
    var socket = io.connect('https://vbit.io:3000', {secure: true});
    var user, userid, option, offer, price, expires, direction;
    var $users = $('#users ul');
    var $chatOutput = $('.messages');
    var $chatInput = $('#chat input');
    var $messagesOutput = $('.messages');
    var $messagesInput = $('#chat input');
    var target = 0;


              //Bitcoin   Euro      Pound    Yen       Dow     Oil           Gold        Silver  S&P 500   Nasdaq
var symbols = ['BTCUSD', 'EURUSD', 'GBPUSD', 'JPYUSD', '^DJI', 'CLJ14.NYM', 'GCJ14.CMX', 'SLV', '^GSPC', '^IXIC'];

   displayOptions(displaysymbols);


    socket.on('hello', function (data) {
      $('.username').html(data.hello);
      console.log('hello:', data.hello);
      user = data.hello;
      userid = data.id;
    });
  var lastbal = 0;
   socket.on('bankbal', function (data) {
      $('.bankbal').html(data);
    });      
   socket.on('userbal', function (data) {
      $('.userbal').html('m฿'+data+'');
      if (lastbal < data) {
        //$('.userbal').effect("highlight", {color: 'hsl(113, 100%, 35%, 0.15)'}, 1530, "easeInOutCirc");
      } else if (lastbal > data) {
        //$('.userbal').effect("highlight", {color: 'hsl(360, 100%, 35%, 0.25)'}, 1530, "easeInOutCirc");
      }
      lastbal = data;
      //console.log(lastbal);
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


// Charts
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

var publictrades = true;
   socket.on('activetrades', function (data) {
    //console.log(data);
    $('.tradesbody').html('');
    if (data[0] != null) {
      var tradehtml = '<div class="header">Your Active Trades <span style="float:right;"><i class="fa fa-clock-o"></i> <span class="expiretime"></span></span></div>';
    } else {
      var tradehtml = '<div class="header">No Active Trades</div>';
    }
    
           tradehtml = tradehtml + '<div><table class="table tradestable" id="trades">';
              // '<thead>' +
              //   '<tr>' +
              //     '<th class="symbol">Symbol</th>' +
              //     '<th>Trade</th>' +
              //     '<th>Amount</th>' +
              //     '<th>End</th>' +
              //     '<th>Payout</th>';
        //if (publictrades == true) { tradehtml = tradehtml + '<th>User</th>'; }
       // tradehtml = tradehtml + '</tr>' +
              //'</thead>'+
              tradehtml = tradehtml + '<tbody class="tradesbody">';
    var index;
    for (index = 0; index < data.length; ++index) {
            entry = data[index];
      entry[0] = symbolSwitch(entry[0]);


      if (entry[6] == userid || publictrades == true) {
        var possiblewin = (+entry[3]+(entry[3]*entry[2]));
        possiblewin = possiblewin.toFixed(2);
        var date = new Date(entry[5]);
        var thistime = date.customFormat( "#hh#:#mm# #AMPM#" );
        var thisdate = date.customFormat( "#DD#/#MM#/#YYYY#" );
        entry[1] = Number(entry[1]);

        if (!lastprice) {
          lastprice = '-.--';
        }


        if (entry[4] == 'Call') {
          var arrowhtml = '<span class="green glyphicon glyphicon-arrow-up"></span>';
        } else if (entry[4] == 'Put') {
          var arrowhtml = '<span class="red glyphicon glyphicon-arrow-down"></span>';
        }

        tradehtml = tradehtml + '<tr class="bgtransition usertrade" id="trade'+index+'">' +
                    '<td class="symbol">'+entry[0]+':<span class="keystone keystone'+entry[0]+'">'+price[entry[0]]+'</span></td>'+
                    '<td>'+arrowhtml+' <span class="direction">'+entry[4]+'</span> from <span class="tradeprice">'+entry[1]+'</span></td>'+
                    '<td>m฿'+entry[3]+'</td>'+
                    //'<td title="Expires: '+thisdate+' '+thistime+'">'+thistime+'</td>'+
                    '<td>m฿'+possiblewin+'</td>'+
                    //'<td class="bold" title="Expires: '+thisdate+' '+thistime+'">Trade in: <span class="expiretime"></span></td>'+
                  '</tr>';
        //     if (lastprice > entry[1]) {
        //   $('#trade'+index+'').removeClass('redbg').addClass('greenbg');
        // } else if (lastprice < entry[1]) {
        //   $('#trade'+index+'').removeClass('greenbg').addClass('redbg');
        // } else {
        //   $('#trade'+index+'').removeClass('greenbg').removeClass('redbg');
        // }
      }
    }
    tradehtml = tradehtml + '</tbody></table></div>';
     $('.tradestable').html(tradehtml);

$( ".usertrade" ).each(function( index ) {
      var tradeid = $(this).attr('id');
      var symbolprice = $('#'+tradeid+' .keystone').html();
      var tradeprice = $('#'+tradeid+' .tradeprice').html();
      var direction = $('#'+tradeid+' .direction').html();


      symbolprice = Number(symbolprice);
      tradeprice = Number(tradeprice);
      symbolprice = symbolprice.toFixed(4);
      tradeprice = tradeprice.toFixed(4);

      //console.log(tradeid + ',' + symbolprice + ',' + tradeprice + ',' + direction);
      if (direction == 'Put') {
        if (symbolprice < tradeprice) {
          $('#'+tradeid+'').css('background-color', 'hsl(113, 100%, 35%, 0.15)');
          //$('#'+tradeid+'').effect("highlight", {color: 'hsl(113, 100%, 35%, 0.15)'}, 2030, "easeInOutCirc");
        } else if (symbolprice > tradeprice) {
          $('#'+tradeid+'').css('background-color', 'hsl(360, 100%, 35%, 0.25)');
          //$('#'+tradeid+'').effect("highlight", {color: 'hsl(360, 100%, 35%, 0.25)'}, 2030, "easeInOutCirc");
        } else {
          //
        }
      } else if (direction == 'Call') {
        if (symbolprice > tradeprice) {
          $('#'+tradeid+'').css('background-color', 'hsl(113, 100%, 35%, 0.15)');
          //$('#'+tradeid+'').effect("highlight", {color: 'hsl(113, 100%, 35%, 0.15)'}, 2030, "easeInOutCirc");
        } else if (symbolprice < tradeprice) {
          $('#'+tradeid+'').css('background-color', 'hsl(360, 100%, 35%, 0.25)');
          //$('#'+tradeid+'').effect("highlight", {color: 'hsl(360, 100%, 35%, 0.25)'}, 2030, "easeInOutCirc");
        } else {
          //$('#'+tradeid+'').effect("highlight", {color: 'hsl(360, 100%, 35%, 0.25)'}, 1530, "easeInOutCirc");
        }
        }
   });
});

   socket.on('historictrades', function (data) {
    var tid = 0;
    $('.historictrades').html('');
    if (data[0] != null) {
      var tradehtml = '<div class="header">Trade History</div>';
    } else {
      var tradehtml = '<div class="header">Trade History</div>';
    }
    
    tradehtml = tradehtml + '<div><table class="table" id="historictrades">';
    tradehtml = tradehtml + '<tbody>';
    var index;
    for (index = 0; index < data.length; ++index) {
      entry = data[index];
       //console.log(entry.symbol);
      entry.symbol = symbolSwitch(entry.symbol);

      if (entry.user == userid || publictrades == true) {
        var possiblewin = (+entry.amount+(entry.amount*entry.offer));
        possiblewin = possiblewin.toFixed(2);
        entry.price = Number(entry.price);

        if (!lastprice) {
          lastprice = '-.--';
        }


        if (entry.direction == 'Call') {
          var arrowhtml = '<span style="opacity: 0.7" class="glyphicon glyphicon-arrow-up"></span>';
        } else if (entry.direction == 'Put') {
          var arrowhtml = '<span style="opacity: 0.7" class="glyphicon glyphicon-arrow-down"></span>';
        }

        if (entry.outcome == 'Win') {
          var thumbhtml = '<span class="green">Won</span></td><td> m฿'+possiblewin+'</span></td>';
        } else if (entry.outcome == 'Lose') {
          var thumbhtml = '<span class="red">Lost</span></td><td> m฿'+entry.amount+'</span></td>';
        } else if (entry.outcome == 'Tie') {
          var thumbhtml = '<span>Push</span></td><td> m฿'+entry.amount+'</span></td>';
        }
        var entrytime = new Date(0);
        var entrydate = new Date(0);
        entrytime.setUTCMilliseconds(entry.time);
        entrydate.setUTCMilliseconds(entry.time);
        entrytime = entrytime.customFormat( "#hhh#:#mm#:#ss# " );
        entrydate = entrydate.customFormat( "#DD#/#MM#/#YYYY#" );


        if (tid < 5) {
        tradehtml = tradehtml + '<tr class="historictrade" id="'+entry._id+'">' +
                    '<td class="symbol">'+entry.symbol+'</td>'+
                    '<td>'+entrydate+'</td>'+
                    '<td>'+arrowhtml+' <span class="tradeprice">'+entry.price+'</span></td>'+
                    //'<td title="Expires: '+thisdate+' '+thistime+'">'+thistime+'</td>'+
                    '<td>'+thumbhtml+'</td>'+
                    //'<td class="bold" title="Expires: '+thisdate+' '+thistime+'">Trade in: <span class="expiretime"></span></td>'+
                  '</tr>';
        }
        //     if (lastprice > entry[1]) {
        //   $('#trade'+index+'').removeClass('redbg').addClass('greenbg');
        // } else if (lastprice < entry[1]) {
        //   $('#trade'+index+'').removeClass('greenbg').addClass('redbg');
        // } else {
        //   $('#trade'+index+'').removeClass('greenbg').removeClass('redbg');
        // }
      }
      tid++;
    }
    tradehtml = tradehtml + '</tbody></table></div>';
    $('.historictrades').html(tradehtml);
});

    $(".applytrade").click(function(e) {
          var symbol = $(this).parent().parent().attr('id');
          var direction = $('#'+symbol+' .info .direction .action').html();
          var amount = Number($('#'+symbol+' .info .amount .amountfield').val());

          amount = amount.toFixed(2);
          //user = userid;
          socket.emit('trade', {
            symbol : symbol,
            amount : amount,
            direction : direction,
            user : userid
          });
      });

         socket.on('nexttrade', function (data) {
           data[1] = ('0' + data[1]).slice(-2)
            $('.expiretime').html(data[0] + ':' + data[1]);
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




  $('#email').keyup(function() {
    var email = $(this).val();
    if (email) {
    if (validateEmail(email)) {
      socket.emit('validateemail', {
        email: email
      });
    } 
    }
  });


  socket.on('validateemailresponce', function (data) {
    $('.loginbtn').html(data);
    if (data == 'Signup') {
      $('.loginbtn').addClass('btn-warning');
    } else {
      $('.loginbtn').removeClass('btn-warning');
    }
  });

  $('.loginbtn').click(function (e) {
    //e.preventDefault();
    var email = $("#email").val();
    var password = $("#password").val();
    // $.ajax({
    //   url: "/login/" + email + "/" + password ,
    //   cache: false
    // }).done(function( html ) {
    //   console.log( html );
    // });
    // $.post( "/login/", function( data ) {
    //   $( ".result" ).html( data );
    // });
    // return false;
  });
// $('.loginbtn').click(function() {
//     var email = $('#email').val();
//     var password = $('#password').val();
//     if (validateEmail(email)) {
//       socket.emit('login', {
//         email: email,
//         password: password
//       });
//     }
//   });
  socket.on('loginreturn', function (data) {
    console.log(data);
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

    $('#chattext').keyup(function(event) {
      if(event.keyCode == 13) {
       if ($chatInput.val()) {
        event.preventDefault();
        chat($chatInput.val());
        $chatInput.val('');
       }
      }
    });

    $('#messages form').submit(function (event) {
      event.preventDefault();
      message(users[target], $messagesInput.val());
      $messagesInput.val('');
    });

    $users.on('click', 'li', function (event) {
      var $user = $(this);
      target = $user.index();
      $users.find('li').removeClass('selected');
      $user.addClass('selected');
    });
});
var h = null;
function updateChart(symbol, data) {
  //console.log(data);
  var series = h.series[0]; // shift if the series is 
                                                 // longer than 20
            h.series[0].addPoint(data, true);
}
var chartinit = {};
function loadChart(symbol, data) {
  // create the chart
// she can not be tamed
symbol = symbolSwitch(symbol);
  Highcharts.setOptions({
    global: {
      useUTC: false,
      timezoneOffset:240
    }
  });
    var container = symbol + "_container";
    h=new Highcharts.Chart({
        chart: {
          renderTo: container,
            zoomType: 'x',
            resetZoomButton: {
                theme: {
                    fill: 'rgba(238, 238, 238, 0.5)',
                    stroke: 'rgba(238, 238, 238, 0.7)',
                    style: {
                      color: 'rgba(0, 0, 0, 0.5)',
                    },
                    r: 0,
                    states: {
                        hover: {
                            fill: '#eee',
                            stroke: '#adadad',
                            style: {
                                color: 'black',
                            }
                        }
                    }
                }
            },
            style: {
             fontFamily: '"Helvetica Neue", Helvetica, Arial, sans-serif',
              fontSize: '15px'
            }
        },
        xAxis: {
            type: 'datetime',
            lineColor: '#eee'
        },
      yAxis : {
        title : {
          text : ' '
        },
        gridLineColor: '#eee'
      },
        title : {
        text : ' '
        },
        legend: {
            enabled: false
        },
        plotOptions: {
          line: {
            animation: false
          },
          series: {
            lineWidth: 2,
            marker: {
              enabled: false,
              radius: 2,
              states: {
                hover: {
                  enabled: true
                }
              }
            },
          },
        },
        series : [
          {
          type : 'line',
          color: '#e96d01',
          name : symbol,
          data : data
          }
        //  ,{
        //   type : 'flags',
        //   data : [{
        //     x : 1393696469543,
        //     y : 568.12,
        //     title : " ",
        //     shape : "url(http://64.90.187.148/assets/img/down.png)",
        //     text : 'Put at 568.12'
        //   }, {
        //     x : 1393696359543,
        //     y : 568.6,
        //     title : " ",
        //     shape : "url(http://64.90.187.148/assets/img/up.png)",
        //     text : 'Call at 568.6'
        //   }],
        //   color : '#5F86B3',
        //   fillColor : '#5F86B3',
        //   onSeries : 'dataseries',
        //   width : 1,
        //   style : {// text style
        //     color : 'white'
        //   },
        //   states : {
        //     hover : {
        //       fillColor : '#395C84' // darker
        //     }
        //   }
        // }
        ]
    });
  chartinit[symbol] = true;
}


$(function() {

// UI Stuff
  $( ".amountfield" ).keyup(function() {
    var symbol = $(this).parent().parent().parent().attr('id');
    var offer = $('#'+symbol+' .info .rawoffer').html();
    var amount = $('#'+symbol+' .info .amount .amountfield').val();
    if (amount > 0) {
      var possiblewin = (+amount+(amount*offer));
      $('#'+symbol+' .info h1').html("m฿" + possiblewin.toFixed(2));
    } else {
      $('#'+symbol+' .info h1').html(offer * 100 + "%");
    }
  });


  $(".callbtn").click(function() {
    var symbol = $(this).parent().parent().attr('id');
    $('.apply'+symbol).removeClass('btn-default').addClass('btn-warning');
    $('.put'+symbol).removeClass('btn-danger').addClass('btn-default');
    $('.call'+symbol).removeClass('btn-default').addClass('btn-success');
    uitradeico(symbol, 1, 1);
    $('#'+symbol+' .direction .action').html('Call');
    //$('.controls .price .lock').html('<span class="glyphicon glyphicon-lock"></span>');
    var autocolor = 0;
    var direction = 'call';
  });
  
  $(".putbtn").click(function() {
    var symbol = $(this).parent().parent().attr('id');
    $('.apply'+symbol).removeClass('btn-default').addClass('btn-warning');
    $('.put'+symbol).addClass('btn-danger').removeClass('btn-default');
    $('.call'+symbol).addClass('btn-default').removeClass('btn-success');
    uitradeico(symbol, 0, 1);
    $('#'+symbol+' .direction .action').html('Put');
    //$('.controls .price .lock').html('<span class="glyphicon glyphicon-lock"></span>');
    var direction = 'put';
  });
});




function isOdd(num) { return num % 2;}
$(function() {
// page loaded
var headercounter = 0;

function showSymbols(){
  $(".financestray").css('height', '0px');
  $(".accounttray").css('height', '0px');    
  $(".announcedanger").css('height', '0px');
  $(".announcesuccess").css('height', '0px');
  $(".linktray").css('height', 30);
}
function showAccount() {
  $(".accounttray").css('height', 30);
  $(".announcedanger").css('height', '0px');
  $(".announcesuccess").css('height', '0px');
  $(".financestray").css('height', '0px');
  $(".linktray").css('height', '0px');
}
function showFinances() {
  $(".accounttray").css('height', '0px');    
  $(".announcedanger").css('height', '0px');
  $(".announcesuccess").css('height', '0px');
  $(".financestray").css('height', 30);
  $(".linktray").css('height', '0px'); 
}

  $('.header').click(function(e) {
    e.preventDefault();
    $(this).disableSelection();
    $(this).next().toggleClass('hideme');
  });

  $(".btnlogo").click(function () {
    headercounter = 0;
    showSymbols();
  });

  $(".btnuser").click(function () {
    if (headercounter != 1) {
    headercounter = 1;
    showAccount();
    } else {
    showSymbols();
    headercounter = 0;
    }
  });

  $(".btnfinance").click(function () {
    if (headercounter != 2) {
    headercounter = 2;
    showFinances();
    } else {
    showSymbols();
    headercounter = 0;
    }
  });



  $(".signupbtn").click(function () {
    var email = $('#email').val();
    var password = $('#password').val();
    console.log(email + password);
  });



function showSuccess() {
    $(".financestray").css('height', '0px');
    $(".accounttray").css('height', '0px');    
    $(".announcedanger").css('height', '0px');
    $(".linktray").css('height', '0px');
    $(".announcesuccess").css('height', 30);
}
function showDanger() {
    $(".financestray").css('height', '0px');
    $(".accounttray").css('height', '0px');    
    $(".announcesuccess").css('height', '0px');
    $(".linktray").css('height', '0px');
    $(".announcedanger").css('height', 30);
}


$("#chattext").focus();
var symbol = $(".controls").attr('id');
// shake(); // the clouds
// rake(); // the coins
uitradeico(symbol, 1, 1);
//enterCall(70);

$('.introbutton').click(function() {
multicoin.play();
});

});


// sleezy marketing aside...
function enterCall(val){
$('#amount').val('');
output = [],
sNumber = val.toString();
for (var i = 0, len = sNumber.length; i < len; i += 1) {
    output.push(+sNumber.charAt(i));
}
var chars = '';
for (var i = 0, len = output.length; i < len; i += 1) {
chars = ''+chars +''+ output[i]+'';
 $('#amount').val(chars);    
setTimeout(function(){
    
         
    var offer = $('.rawoffer').html();
    var amount = $("#amount").val();
    if (amount > 0) {
      var possiblewin = (+amount+(amount*offer));
      $(".info h1").html("$" + possiblewin.toFixed(2));
    } else {
      $(".info h1").html(offer * 100 + "%");
    }
  },2500);
}
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
