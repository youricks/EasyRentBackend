// call the packages we need
var express    = require('express');        // call express
var app        = express();                 // define our app using express
var bodyParser = require('body-parser');
var requireDir = require('require-dir');
var log4js = require('log4js');
const sharp = require("sharp");

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

var fs = require("fs")  
var path = require("path")  
  
var root = path.join("./unsoldTicket/OCAD")  
var dirName = "Sheridan"
readDirSync(root)  
function readDirSync(path){  
    var pa = fs.readdirSync(path);  
    pa.forEach(function(ele,index){  
        var info = fs.statSync(path+"/"+ele)      
        if(info.isDirectory()){  
            console.log("dir: "+ele)  
            readDirSync(path+"/"+ele);  
        }else{  
            console.log("file: "+ele)
            sharp("unsoldTicket/" + dirName + "/" + ele).overlayWith("unsoldTicket/background.png", { top: 0, left: 0 }).toFile("unsoldTicket/" + dirName + "_Fixed/" + ele, function(err, info) {console.log(err); console.log(info)});
        }
    })
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
