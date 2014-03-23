var h;
var chartinit = {};
function updateChart(symbol, data) {
  //console.log(data);
  var series = h.series[0];
            h.series[0].addPoint(data, true);
  // Currently this code can only handle the display of one live chart at a time
}

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