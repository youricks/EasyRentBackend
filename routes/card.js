var express  = require('express');
var router = express.Router();

var cardDAO = require('../DAO/cardDAO.js');

router.post('/ticket/purchase',
	function(req, res, next) {
    	req.body.amount = req.body.amount * 50
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

module.exports = router;
