var express  = require('express');
var router = express.Router();

var cardDAO = require('../DAO/cardDAO.js');
var PRICE = 69
var TAX = 1.13
router.post('/ticket/purchase',
	function(req, res, next) {
        req.body.amount = 50
    	//req.body.amount = Math.ceil(req.body.amount * 100 * PRICE * TAX);
    	res.header("Access-Control-Allow-Origin", "*");
    	next()
	}, 
	cardDAO.purchase, 
	function(req, res, next) {
    	res.json({message : "Purchase Success"});
});

router.get('/ticket/verify/:id',
	cardDAO.verify, 
	function(req, res, next) {
    	res.json({message : "Purchase Success"});
});

router.get('/ticket/price', function(req, res, next) {
	res.end("69");
});

module.exports = router;
