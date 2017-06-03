// call the packages we need
var express    = require('express');        // call express
var app        = express();                 // define our app using express
var bodyParser = require('body-parser');
var requireDir = require('require-dir');
var log4js = require('log4js');

//Set the logger
log4js.configure({
  appenders: [
    { type: 'console' }, //控制台输出
    {
      type: 'dateFile', //文件输出
      filename: 'logs/access.log', 
      pattern: "-yyyy-MM-dd-hh-mm",
      backups:3,
      category: 'normal' 
    }
  ],
  replaceConsole: true
});
var logger = log4js.getLogger('normal');
logger.setLevel('INFO');
app.use(log4js.connectLogger(logger, {level:log4js.levels.INFO}));

exports.logger=function(name){
  var logger = log4js.getLogger(name);
  logger.setLevel('INFO');
  return logger;
}

// Mysql connection is done

// configure app to use bodyParser()
// this will let us get the data from a POST
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());

//StormPath e.g.====================================================================================================
//https://api.stormpath.com/ui2/index.html#/quickstart/none/nodejs/backend/project-type/existing
var port = process.env.PORT;        // set our port

// ROUTES FOR OUR API
// =============================================================================
var routes = requireDir('./routes'); // https://www.npmjs.org/package/require-dir
for (var i in routes) app.use('/', routes[i]);

// START THE SERVER
// =============================================================================
app.listen(port);
console.log('Magic happens on port ' + port);

// Ping server every 5 mins to prevent it from idling
var http = require("http");
setInterval(function() {
    http.get("http://haoyizu.herokuapp.com");
}, 300000); // every 5 minutes (300000)
