var option = new Array();
function displayOptions(displaysymbols) {
  if (displaysymbols) {
  $.each(displaysymbols, function( index, symbol ) {
    symbol = symbolSwitch(symbol);
    var show = '<div class="controls" id="'+symbol+'">'+
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
                  '<input type="number" class="form-control amountfield" placeholder="">'+
            '</div></div>'+
            '<button type="button" class="btn btn-default applytrade apply'+symbol+'">Apply</button>'+
          '</div>'+
         '</div>'+
        '<span class="tradewarning">You cannot cancel a trade.</span>';
    var lock = '<div class="nooffer"><i class="fa fa-lock" style="font-size: 25px;"></i><br />Trading is Closed <br />'+symbol+':<span class="keystone'+symbol+'"></span></div>';

    //if trading is allowed on this symbol
    if (tradingopen) {
    var renderoffer = show;
    } else {
    var renderoffer = lock;
    }

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
       $(".trading").html(option[index]);
      });
    $(".trading").addClass('symbols');
  }
  }
