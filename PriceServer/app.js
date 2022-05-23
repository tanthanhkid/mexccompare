var createError = require('http-errors');
var express = require('express');
var path = require('path');
var cookieParser = require('cookie-parser');
var logger = require('morgan');
var cors = require('cors');
var cron = require('cron');

var indexRouter = require('./routes/index');
var usersRouter = require('./routes/users');

var app = express();

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'jade');

app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));
app.use('/', indexRouter);
app.use('/users', usersRouter);

var whitelist = ['https://www.mexc.com', 'https://mexc.com']
var corsOptionsDelegate = function (req, callback) {
  var corsOptions;
  if (whitelist.indexOf(req.header('Origin')) !== -1) {
    corsOptions = { origin: true } // reflect (enable) the requested origin in the CORS response
  } else {
    corsOptions = { origin: false } // disable CORS for this request
  }
  callback(null, corsOptions) // callback expects two parameters: error and options
}

global.BTC_USDT_Price = 0;
global.ETH_USDT_Price = 0;
global.MexcPrices = [];

app.post('/mexcprice', cors(corsOptionsDelegate), function (req, res, next) {
  global.MexcPrices = [];
  var coinArray = JSON.parse(req.body.arr);

  for (const coin of coinArray) {
    var coinName = coin.name.split("@")[0];
    var coinPair = coin.name.split("@")[1];
    coin.price = coin.price.replace(",", "");

    // if (Number(coin.price) > 0 && coinName.length < 20) {

    if (coin.name == "BTC@USDT") {
      global.BTC_USDT_Price = Number(coin.price);
      console.log("BTC_USDT_Price: " + BTC_USDT_Price)
    }

    if (coin.name == "ETH@USDT") {
      global.ETH_USDT_Price = Number(coin.price);
      console.log("ETH_USDT_Price: " + ETH_USDT_Price)
    }

    // console.log({ name: coinName, price: Number(coin.price), pair: coinPair });
    global.MexcPrices.push({ name: coinName, price: Number(coin.price), pair: coinPair });

    // }
  }

  // console.clear();
  // console.log(global.MexcPrices);

  res.json({ msg: 'update :' + JSON.stringify(global.MexcPrices) })
});



const percent = Number(1);
global.MATCH_PAIRS = [];

var cronJob = cron.job("*/3 * * * * *", function () {
  console.clear();
  try {
    // console.log("name: \x1b[34m" + gateiocoin.name + "\x1b[0m - diff: " + diffPrice + " - % : \x1b[33m" + percent+"\x1b[0m");

    for (const coin of global.MexcPrices) {

      if (coin.pair == "USDT") {
        var matches = global.MexcPrices.filter(c => c.name == coin.name && c.pair != "USDT");

        for (const matchItem of matches) {
          var diffPrice = 0;
          var diffpercent = 0;

          if (matchItem.pair == "ETH") {
            diffPrice = Number(matchItem.price * Number(global.ETH_USDT_Price)) - Number(coin.price);
            diffpercent = 100 - ((Number(matchItem.price * Number(global.ETH_USDT_Price))) * 100 / Number(coin.price));

            var instruction = "";
            if (diffpercent < 0) {
              diffpercent = diffpercent * -1;
              instruction = "MUA ETH BAN USDT";
            } else {
              instruction = "";
              instruction = "MUA USDT BAN ETH";
            }

            if (diffpercent > 1) {

              global.MATCH_PAIRS.push({ name: coin.name + "/" + coin.pair, pair: "ETH", diffPrice: diffPrice, percent: diffpercent });
              console.log("Name: \x1b[34m" + coin.name + "/" + coin.pair + "\x1b[0m - origin: " + Number(coin.price) + "\x1b[0m - diff: " + diffPrice + " - % : \x1b[33m" + diffpercent + "\x1b[0m , pair: \x1b[34mETH\x1b[0m, >> instruction:  \x1b[31m"+ instruction +"\x1b[34m");

            }


          }

          if (matchItem.pair == "BTC") {
            diffPrice = Number(matchItem.price * Number(global.BTC_USDT_Price)) - Number(coin.price);
            diffpercent = 100 - ((Number(matchItem.price * Number(global.BTC_USDT_Price))) * 100 / Number(coin.price));

            var instruction = "";
            if (diffpercent < 0) {
              diffpercent = diffpercent * -1;
              instruction = "MUA BTC BAN USDT";
            } else {
              instruction = "";
              instruction = "MUA USDT BAN BTC";
            }

            if (diffpercent > 1) {

              global.MATCH_PAIRS.push({ name: coin.name + "/" + coin.pair, pair: "BTC", diffPrice: diffPrice, percent: diffpercent });
              console.log("Name: \x1b[34m" + coin.name + "/" + coin.pair + "\x1b[0m - origin: " + Number(coin.price) + "\x1b[0m - diff: " + diffPrice + " - % : \x1b[33m" + diffpercent + "\x1b[0m , pair: \x1b[34mBTC\x1b[0m, >> instruction:  \x1b[31m"+ instruction +"\x1b[34m");

            }

          }

        }

      }

    }



  } catch (e) {
    console.error(e)
  }


});
cronJob.start();

// catch 404 and forward to error handler
app.use(function (req, res, next) {
  next(createError(404));
});

// error handler
app.use(function (err, req, res, next) {
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get('env') === 'development' ? err : {};

  // render the error page
  res.status(err.status || 500);
  res.render('error');
});

module.exports = app;
