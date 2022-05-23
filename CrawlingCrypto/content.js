

// var dom = document.getElementsByClassName("orderbook_leftItem__0SCEq").childNodes;


// while(true){
//     console.log($(".orderbook_leftItem__0SCEq span").text());
// }
const interval = 3000;


// alert(window.location.hostname);

if (window.location.hostname == "www.mexc.com") {

    setInterval(function () {
        console.clear();
        var mexccoins = [];

        $(".markets_wrapper__ZjTSl").css("height", "100000000px")
        console.log(".markets_row__xELC_=>" + $('.markets_row__xELC_').length)
        $('.markets_row__xELC_').each(function (i, obj) {


            // if ($(obj).find("b.markets_badge__c28Xx").text().length == 0) {


            var child0 = $(obj).children(".markets_col1__kEdFH")[0];
            var childName = $(child0).find("span.markets_strong__s_Hxk").text();
            var childNamePair = $(child0).find("span.markets_strong__s_Hxk").siblings("span").text();

            // console.log(childName);

            var child1 = $(obj).children(".markets_col2__RMpcV");
            var childPrice = $(child1).children(".markets_strong__s_Hxk").text();

            console.log({ name: childName, pair: childNamePair, price: childPrice, count: $('.markets_row__xELC_').length })

            // console.log({count: coins.length,name: childName, price: childPrice});
            mexccoins.push({ name: childName + childNamePair.replace("/","@"), price: childPrice });
            // }
        });




        $.post("http://localhost:3000/mexcprice", { arr: JSON.stringify(mexccoins) }, function (result) {
            // console.log(result);
        });

    }, interval);
}
