

// Trading
$(function() {

    $(".applytrade").click(function(e) {
          var symbol = $(this).parent().parent().attr('id');
          var direction = $('#'+symbol+' .info .direction .action').html();
          var amount = Number($('#'+symbol+' .info .amount .amountfield').val());
          console.log('New trade:' + user +':'+ symbol +':'+ amount +':'+ direction)
          amount = amount.toFixed(2);
          //user = userid;
          socket.emit('trade', {
            symbol : symbol,
            amount : amount,
            direction : direction,
            user : user
          });
        });
  $( ".amountfield" ).change(function() {
    var symbol = $(this).parent().parent().parent().parent().attr('id');
    var offer = $('#'+symbol+' .info .details .rawoffer').html();
    var amount = $('#'+symbol+' .info .trader .amount .amountfield').val();
    if (amount > 0) {
      var possiblewin = (+amount+(amount*offer));
      $('#'+symbol+' .info .details h1').html("m฿" + possiblewin.toFixed(2));
    } else {
      $('#'+symbol+' .info .trader .amount .amountfield').val(0);
      $('#'+symbol+' .info .details h1').html(offer * 100 + "%");
    }
  });
  $(".callbtn").click(function() {
    console.log('callbtn');
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
$(function() {

// UI Stuff
// Animated header strip
var headercounter = 0;
  // $('.header').click(function(e) {
  //   //e.preventDefault();
  //   $(this).disableSelection();
  //   $(this).next().toggleClass('hideme');
  // });
  $(".right").click(function() {
    if (headercounter != 1) {
      headercounter = 1;
      showAccount();
    } else {
      showSymbols();
      headercounter = 0;
    }
  });
  $(".btnfinance").click(function() {
    if (headercounter != 2) {
      headercounter = 2;
      showFinances();
    } else {
      showSymbols();
      headercounter = 0;
    }
  });
  $(".btnlogo").click(function() {
    headercounter = 0;
    showSymbols();
  });
  $(".signupbtn").click(function() {
    var email = $('#email').val();
    var password = $('#password').val();
    console.log(email + password);
  });

  $('.loginbtn').click(function() {
    var email = $("#email").val();
    var password = $("#password").val();
    var url = encodeURIComponent("/login/" + email + "/" + password);
    $.ajax({
      url: url,
      cache: false
    }).done(function( html ) {
      if (html == "Too many requests.") {
        $('.loginbtn').removeClass('btn-warning').addClass('btn-danger').html(html);
      } else if (html == "Invalid username or password."){
        $('.loginbtn').removeClass('btn-success').addClass('btn-warning').html('Try again');
      } else if (html == "OK") {
        $('.loginbtn').removeClass('btn-warning').addClass('btn-success').html('Logged in');
        setTimeout(function(){location.reload()},1000);
      }
    });
  });

    showloginfield();
    $('.info h1').html(defaultoption*100+'%');


// Proto chat

    $('#chattext').keyup(function(event) {
      if(event.keyCode == 13) {
       if ($chatInput.val()) {
        //event.preventDefault();
        chat($chatInput.val());
        $chatInput.val('');
       }
      }
    });

    $('#messages form').submit(function (event) {
      //event.preventDefault();
      message(users[target], $messagesInput.val());
      $messagesInput.val('');
    });


//Uncaught ReferenceError: $users is not defined 
    // $users.on('click', 'li', function (event) {
    //   var $user = $(this);
    //   target = $user.index();
    //   $users.find('li').removeClass('selected');
    //   $user.addClass('selected');
    // });
console.log('loaded ui jquery');

});

// Ui functions

function isOdd(num) { return num % 2;}


function hideAllPanels() {
  $(".financestray").css('height', '0px');
  $(".accounttray").css('height', '0px');    
  $(".announcesuccess").css('height', '0px');
  $(".announcedanger").css('height', '0px');
  $(".linktray").css('height', '0px');
}

function showSuccess(msg, xp, next) {
  hideAllPanels();
  $(".announcesuccess").css('height', 30);
  $(".announcesuccess .container ul li a").html(msg);
  $(".announcesuccess .container span").html(xp);
  setTimeout(function(){
    next();
  },3500);
}
function showDanger(msg, xp, next) {
  hideAllPanels();
  $(".announcedanger").css('height', 30);
  $(".announcedanger .container ul li a").html(msg);
  $(".announcedanger .container span").html(xp);
  setTimeout(function(){
    next();
  },3500);
}


function showSymbols() {
  hideAllPanels();
  $(".linktray").css('height', 30);
}
function showAccount() {
  hideAllPanels();
  $(".accounttray").css('height', 30);

}
function showFinances() {
  hideAllPanels();
$(".financestray").css('height', 30);
}

