/**
 * Created by duanzhengmou on 6/8/16.
 */


var trasaction_data_all;
var total_capital;
$(document).ready(function () {

    var url = location.href.split("?")[1];
    if(url.split("&")[0].split("=")[1]!="diy") {
        draw_compare_chart(url);
        var data =
            [
                {
                    "factor": "FACTOR2",
                    "weight": 0.2
                },
                {
                    "factor": "FACTOR1",
                    "weight": 0.5
                },
                {
                    "factor": "FACTOR3",
                    "weight": 0.3
                }
            ];
        var data2 =
            [
                {"stock_name": "stock 1", "stock_code": "sh600001"},
                {"stock_name": "stock 2", "stock_code": "sh600002"},
                {"stock_name": "stock 1", "stock_code": "sh600001"},
                {"stock_name": "stock 2", "stock_code": "sh600002"},
                {"stock_name": "stock 1", "stock_code": "sh600001"},
                {"stock_name": "stock 2", "stock_code": "sh600002"},
                {"stock_name": "stock 1", "stock_code": "sh600001"},
                {"stock_name": "stock 2", "stock_code": "sh600002"},
                {"stock_name": "stock 1", "stock_code": "sh600001"},
                {"stock_name": "stock 2", "stock_code": "sh600002"},
                {"stock_name": "stock 3", "stock_code": "sh600003"}
            ];

        init_factor_table(data);
        init_stock_pool_table(data2);
        // init_transaction_table();
        init_transaction_detail_table();
    }else{
        //diy part
        alert("diy");
        draw_compare_chart_diy(url);
    }
});
function draw_compare_chart_diy(url) {
    var params = url.split("&");
    var data_obj = new Object();
    var factor_map = ["PE","PB","VOL5","VOL10","VOL60","VOL120","PS","PCF"];
    data_obj.baseCode = params[1].split("=")[1];
    data_obj.capital = params[2].split("=")[1];
    data_obj.taxRate = params[3].split("=")[1];
    data_obj.codes = params[4].split("=")[1];
    data_obj.interval = params[5].split("=")[1];
    data_obj.start = params[6].split("=")[1];
    data_obj.end = params[7].split("=")[1];
    var factor_weight = {};
    var factors = params[8].split("=")[1].split(",");
    for (var i=0;i<factors.length;i++){
        if(factors[i]!=0){
            factor_weight[factor_map[i]] = parseFloat(factors[i]);
        }
    }
    data_obj.factorWeight = factor_weight;
    data_obj.investWeight = params[9].split("=")[1];
    document.getElementById('start_fund').innerHTML = data_obj.capital;
    document.getElementById('begin_time').innerHTML = data_obj.start;
    document.getElementById('end_time').innerHTML = data_obj.end;
    document.getElementById('trade_rate').innerHTML = data_obj.taxRate;
    document.getElementById('base_bench').innerHTML = data_obj.baseCode;
    document.getElementById('interval').innerHTML = data_obj.interval;
    alert("invest:"+data_obj.investWeight);
    // alert(JSON.stringify(data_obj));
    // alert("data: "+JSON.stringify(factor_weight));
    test_strategy_with_factor(JSON.stringify(data_obj));

}
function draw_compare_chart(url_params) {
    var params = url_params.split("&");
    var data_obj = new Object();

    data_obj.name=params[0].split("=")[1];//strategy name
    data_obj.baseCode=params[1].split("=")[1];
    data_obj.capital=params[2].split("=")[1];
    data_obj.taxRate=params[3].split("=")[1];
    data_obj.vol=params[4].split("=")[1];//num of stock
    data_obj.interval=params[5].split("=")[1];
    data_obj.start=params[6].split("=")[1];
    data_obj.end=params[7].split("=")[1];
    total_capital =data_obj.capital;

    document.getElementById('start_fund').innerHTML = data_obj.capital;
    document.getElementById('begin_time').innerHTML = data_obj.start;
    document.getElementById('end_time').innerHTML = data_obj.end;
    document.getElementById('trade_rate').innerHTML = data_obj.taxRate;
    document.getElementById('base_bench').innerHTML = data_obj.baseCode;
    document.getElementById('interval').innerHTML = data_obj.interval;
    var json_data = JSON.stringify(data_obj);
    alert(json_data);
    test_specific_strategy(json_data);
    // for (var i=1;i<params.length;i++){
    //     alert(params[i]);
    //    
    // }
}
function test_specific_strategy(json_data) {
    $.ajax({
        type:'post',
        url:'/Strategy/analyseWithSpecificStrategy',
        // data:{name:"Strategy_Vol",capital:1000000,
        //     taxRate:0.001,baseCode:"000010",interval:7,start:"2015/01/01",end:"2015/06/01",vol:100},
        
        data:{arguments:json_data},
        success:function (data) {
            trasaction_data_all = data;
            alert("seccess !");
            // alert("->"+data.cumRtnVOList[0].baseValue);
            // alert("length->"+data.cumRtnVOList.length);
            var cumRtnVOList = data.cumRtnVOList;
            var trade_data = data.tradeDataVOList;
            var compare_datas = [];
            var compare_base = [];
            var compare_test = [];
            for(var i=0;i<cumRtnVOList.length;i++){
                // alert(cumRtnVOList[i].baseValue);
                var str_date = cumRtnVOList[i].date.year+"-"+cumRtnVOList[i].date.month+"-"+cumRtnVOList[i].date.day;
                // alert(str_date);
                var date = new Date(str_date).getTime();
                compare_base.push([date,cumRtnVOList[i].baseValue]);
                compare_test.push([date,cumRtnVOList[i].testValue]);
                // alert("base "+compare_base+"test "+compare_test);
            }
            compare_datas.push(compare_base);
            compare_datas.push(compare_test);
            init_compare_chart(compare_datas);
            var trade_table_data = [];
            var trade_table_data_item;
            document.getElementById('summary').innerHTML= JSON.stringify(trasaction_data_all);
            for (var i=0;i<trade_data.length;i++){
                trade_table_data_item = new Object();
                var trade_total=0,trade_num=0;
                for(var j=0;j<trade_data[i].tradeDetailVOs.length;j++){
                    // alert("trade_num:"+trade_num+"  trade_total:"+trade_total);
                    trade_num += trade_data[i].tradeDetailVOs[j].numofTrade;
                    trade_total += (trade_data[i].tradeDetailVOs[j].tradePrice * trade_data[i].tradeDetailVOs[j].numofTrade);
                }
                trade_table_data_item.date=trade_data[i].tradeDate.year+"-"+trade_data[i].tradeDate.month+"-"+trade_data[i].tradeDate.day;
                // alert("date: "+trade_table_data_item.date);
                trade_table_data_item.trade_amount = trade_total;
                trade_table_data_item.trade_num = trade_num;
                trade_table_data_item.profit = trade_data[i].profit;
                trade_table_data_item.profit_rate = (trade_data[i].profit/total_capital)*100 + "%";
                trade_table_data.push(trade_table_data_item);
                // alert("date"+trade_table_data_item.date+"total"+trade_table_data_item.trade_amount+" num:"+trade_table_data_item.trade_num);
            }
            // alert("object: "+JSON.stringify(trade_table_data));
            init_transaction_table(JSON.parse(JSON.stringify(trade_table_data)));
        },
        error:function (data) {
            alert("error:");
        }
    });
}
function test_strategy_with_factor(json_data) {
    alert("params-->"+json_data);
    $.ajax({
        type:'post',
        url:'/Strategy/analyseWithFactor',
        // data:{name:"Strategy_Vol",capital:1000000,
        //     taxRate:0.001,baseCode:"000010",interval:7,start:"2015/01/01",end:"2015/06/01",vol:100},
        data:{arguments:json_data},
        success:function (data) {
            alert("seccess !");
            document.getElementById("summary").innerHTML = JSON.stringify(data);
        },
        error:function (data) {
            alert("error:");
        }
    });
}
function init_factor_table(allStock) {
    var table = $('#factor_weight_table').DataTable( {

        data:allStock,
        lengthChange:false,
        pageLength:10,
        dom: 'lrtp',
        // "order":[[1,"asc"]],
        columns:[
            {data:'factor'},
            {data:'weight'}
        ],
        /*
         *自适应宽度 默认true 关闭可提升性能,同时方便管理布局
         */
        // "autoWidth":false,
        //国际化
        "oLanguage": {
            "sProcessing": "疯狂加载数据中.",
            "sLengthMenu": "每页显示 _MENU_ 条记录",
            "sZeroRecords": "抱歉， 没有找到",
            "sInfo": "从 _START_ 到 _END_ /共 _TOTAL_ 条数据",
            "sInfoEmpty": "没有数据",
            "sInfoFiltered": "(从 _MAX_ 条数据中检索)",
            "sSearch": "模糊查询:  ",
            "oPaginate": {
                "sFirst": "首页",
                "sPrevious": "前一页",
                "sNext": "后一页",
                "sLast": "尾页"
            }
        }
    } );
}
function init_stock_pool_table(allStock) {
    var table = $('#stock_pool_table').DataTable( {

        data:allStock,
        lengthChange:false,
        pageLength:10,
        dom: 'lrtp',
        // "order":[[1,"asc"]],
        columns:[
            {data:'stock_name'},
            {data:'stock_code'}
        ],
        /*
         *自适应宽度 默认true 关闭可提升性能,同时方便管理布局
         */
        // "autoWidth":false,
        //国际化
        "oLanguage": {
            "sProcessing": "疯狂加载数据中.",
            "sLengthMenu": "每页显示 _MENU_ 条记录",
            "sZeroRecords": "抱歉， 没有找到",
            "sInfo": "从 _START_ 到 _END_ /共 _TOTAL_ 条数据",
            "sInfoEmpty": "没有数据",
            "sInfoFiltered": "(从 _MAX_ 条数据中检索)",
            "sSearch": "模糊查询:  ",
            "oPaginate": {
                "sFirst": "首页",
                "sPrevious": "前一页",
                "sNext": "后一页",
                "sLast": "尾页"
            }
        }
    } );
}
function init_compare_chart(data) {
    // alert("[0]-->"+data[0]);
    // alert("[1]-->"+data[1]);
            // Create the chart
            $('#compare_chart').highcharts('StockChart', {


                rangeSelector : {
                    selected : 1
                },

                title : {
                    text : 'AAPL Stock Price'
                },

                series : [
                    {
                        name : '基准',
                        data : data[0],
                        tooltip: {
                        valueDecimals: 8
                        }
                    },
                    {
                        name : '回测',
                        data : data[1],
                        tooltip: {
                            valueDecimals: 8
                        }
                    }
                ]
            });
}
function init_transaction_table(data) {
    // alert("init_table"+data);
    // alert("new_data:"+new_data);
    var table = $('#transaction_table').DataTable( {
    
        // data:data,
        data:data,
        lengthChange:false,
        pageLength:10,
        dom: 'lrtp',
        // "order":[[1,"asc"]],
        columns:[
            {data:'date'},
            {data:'trade_amount'},
            {data:'trade_num'},
            {data:'profit'},
            {data:'profit_rate'}
        ],
        /*
         *自适应宽度 默认true 关闭可提升性能,同时方便管理布局
         */
        // "autoWidth":false,
        //国际化
        "oLanguage": {
            "sProcessing": "疯狂加载数据中.",
            "sLengthMenu": "每页显示 _MENU_ 条记录",
            "sZeroRecords": "抱歉， 没有找到",
            "sInfo": "从 _START_ 到 _END_ /共 _TOTAL_ 条数据",
            "sInfoEmpty": "没有数据",
            "sInfoFiltered": "(从 _MAX_ 条数据中检索)",
            "sSearch": "模糊查询:  ",
            "oPaginate": {
                "sFirst": "首页",
                "sPrevious": "前一页",
                "sNext": "后一页",
                "sLast": "尾页"
            }
        }
    } );

    //下面是选择行
    $('#transaction_table tbody').on( 'click', 'tr', function () {
        table.$('tr.selected').removeClass('selected');
        $(this).addClass('selected');
        var selected_row = table.row('.selected').index();
        var detail_data = trasaction_data_all.tradeDataVOList[selected_row].tradeDetailVOs;
        // alert(detail_data[0].code);
        // var current_detail_data = all_detail_data[selected_row]
        var detail_data_item;
        var detail_table_data = [];
        for(var i=0;i<detail_data.length;i++){
            detail_data_item = new Object();
            var date_data = trasaction_data_all.tradeDataVOList[selected_row].tradeDate;
            // alert(date_data.year);
            detail_data_item.date = date_data.year+"-"+date_data.month+"-"+date_data.day;
            detail_data_item.name = detail_data[i].codeName;
            if(detail_data[i].buyOrSell==false){
                detail_data_item.statu = "卖出";
            }else{
                detail_data_item.statu = "买入";
            }
            detail_data_item.trade_num = detail_data[i].numofTrade;
            detail_data_item.trade_amount = detail_data[i].tradePrice;
            detail_table_data.push(detail_data_item);
        }
        $('#transaction_detail_table').DataTable().clear().draw();
        $('#transaction_detail_table').DataTable().rows.add(JSON.parse(JSON.stringify(detail_table_data))).draw();
        
        
        // var table_detail = $('transaction_detail_table').DataTable();
        // if(table_detail!=null){
        //     alert("destroy");
        //     table_detail.destroy();
        // }
        // alert("add done");
        // init_transaction_detail_table(JSON.parse(JSON.stringify(detail_table_data)));
        // $('#transaction_table').DataTable().row.add({
        //         "date":       "Tiger Nixon",
        //         "profit":   "System Architect",
        //         "trade_amount":     "$3,120",
        //         "profit_rate": "2011/04/25",
        //         "trade_num":     "Edinburgh"
        //     }
        // ).draw();

    } );
}
function init_transaction_detail_table(allStock) {
    var table = $('#transaction_detail_table').DataTable( {

        data:allStock,
        lengthChange:false,
        pageLength:10,
        dom: 'lrtp',
        // "order":[[1,"asc"]],
        columns:[
            {data:'date'},
            {data:'statu'},
            {data:'trade_amount'},
            {data:'name'},
            {data:'trade_num'}
        ],
        /*
         *自适应宽度 默认true 关闭可提升性能,同时方便管理布局
         */
        // "autoWidth":false,
        //国际化
        "oLanguage": {
            "sProcessing": "疯狂加载数据中.",
            "sLengthMenu": "每页显示 _MENU_ 条记录",
            "sZeroRecords": "抱歉， 没有找到",
            "sInfo": "从 _START_ 到 _END_ /共 _TOTAL_ 条数据",
            "sInfoEmpty": "没有数据",
            "sInfoFiltered": "(从 _MAX_ 条数据中检索)",
            "sSearch": "模糊查询:  ",
            "oPaginate": {
                "sFirst": "首页",
                "sPrevious": "前一页",
                "sNext": "后一页",
                "sLast": "尾页"
            }
        }
    } );
}