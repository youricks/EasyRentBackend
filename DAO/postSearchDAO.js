const fs = require('fs');

// could be put in a file
var match = process.env.DATABASE_URL.match(/postgres:\/\/([^:]+):([^@]+)@([^:]+):(\d+)\/(.+)/)

var Sequelize = require('sequelize');
var sequelize = new Sequelize(match[5], match[1], match[2], {
    dialect:  'postgres',
    protocol: 'postgres',
    port:     match[4],
    host:     match[3],
    logging: false,
    dialectOptions: {
        ssl: true
    }
});

var PostSearch = sequelize.define('PostSearch', {
    conditions: {
        type: Sequelize.STRING
    },
    posts: {
        type: Sequelize.JSON
    }
});

PostSearch.hook('beforeValidate', function(PostSearch, options) {
    console.log("calling PostSearch.hook")
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
