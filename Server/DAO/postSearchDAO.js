const fs = require('fs');

// could be put in a file
var text = fs.readFileSync('databaseInfo.txt','utf8');
var databaseInfo = JSON.parse(text);
var user = databaseInfo.user;
var password = databaseInfo.password;
var router = databaseInfo.router;
var port = databaseInfo.port;
var database = databaseInfo.database;
sequelize_initial = 'postgres://' + user + ':' + password + '@' + router + ':' + port + '/' + database;

var Sequelize = require('sequelize');
var sequelize = new Sequelize(sequelize_initial);

var PostSearch = sequelize.define('PostSearch', {
    conditions: {
        type: Sequelize.STRING
    },
    posts: {
        type: Sequelize.JSON
    }
});

PostSearch.hook('beforeValidate', function(PostSearch, options) {

    var currentTime = Math.floor(Date.now());
    console.log(currentTime);
    var fiveMinAgo = currentTime - 5*60*1000;
    var halfMinAgo = currentTime - 0.5*60*1000;
    PostSearch.destroy({where: {createdAt: {$lte : fiveMinAgo} } }).then(function (object) {
        console.log("destroyed");
    });
})


PostSearch.sync({force: true}).then(function () {
    return PostSearch.create({
        conditions: "a_default_condition",
        posts: "[]"
    });
}); 


module.exports = {
    getSelf: PostSearch
};
