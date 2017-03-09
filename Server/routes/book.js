var express  = require('express');
var router = express.Router();
var itemDao = require('../DAO/itemDao.js');

router.get('/book', itemDao.getByName, function(req, res) {
    res.json({message:"book", item: req.item});
});
router.get('/book/:name', function(req,res,next){
    var item = {
      itemName:req.param('name'),
      postId: 234,
    }
    req.item = item;
    next();
}, itemDao.set);


module.exports = router;
