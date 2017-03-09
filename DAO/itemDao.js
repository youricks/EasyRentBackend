var mysql = require('mysql');
var Sequelize = require('sequelize');
var sequelize = new Sequelize('mysql://root:81828880@youricks.xicp.net:3306/SecondBook');

var Item = sequelize.define('Item', {
  itemName: {
    type: Sequelize.STRING,
    primaryKey: true,
    unique: true,
    field: 'itemName' // Will result in an attribute that is firstName when user facing but first_name in the database
  },
  postId: {
  	type: Sequelize.INTEGER,
  	field: 'postId'
  }
}, {
  freezeTableName: true // Model tableName will be the same as the model name
});


module.exports = {
  getByName: function(req, res, next){
    Item.findAll({where: {itemName:"MATA43"}}).then(function(object){
        req.item = object;
	next();
    });
  },
  set: function(req, res, next){
    Item.create(req.item);
    res.json({message: 'success'});
  }
}
