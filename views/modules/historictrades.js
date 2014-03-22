function showhistoric(data, user, lastprice){
    var display = 5;
    var tid = 0;
    $('.historictrades').html('');
      var tradehtml = '<div class="userblock"><div class="header">Trade History</div>';    
    tradehtml = tradehtml + '<div class="row-fluid"><div class="span12"><div><table class="table" id="historictrades">';
    tradehtml = tradehtml + '<tbody>';
    var index;
    for (index = 0; index < data.length; ++index) {
      entry = data[index];
       //console.log(entry.symbol);
      entry.symbol = symbolSwitch(entry.symbol);

      if (entry.user == user) {
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


        //if (tid < display) {
        tradehtml = tradehtml + '<tr class="historictrade" id="'+entry._id+'">' +
                    '<td class="symbol">'+entry.symbol+'</td>'+
                    '<td>'+entrytime+'</td>'+
                    '<td>'+arrowhtml+' <span class="tradeprice">'+entry.price+'</span></td>'+
                    //'<td title="Expires: '+thisdate+' '+thistime+'">'+thistime+'</td>'+
                    '<td>'+thumbhtml+'</td>'+
                    //'<td class="bold" title="Expires: '+thisdate+' '+thistime+'">Trade in: <span class="expiretime"></span></td>'+
                  '</tr>';
        //}
      tid++;
    }
  }
    tradehtml = tradehtml + '</div></div></div></tbody></table></div>';
    $('.historictrades').html(tradehtml);
}