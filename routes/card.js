var express  = require('express');
var router = express.Router();

var cardDAO = require('../DAO/cardDAO.js');

router.post('/ticket/purchase',
	function(req, res, next) {
    	req.body.amount = req.body.amount * 65
    	next()
	}, 
	cardDAO.purchase, 
	function(req, res, next) {
    	res.json({message : req.message, post: req.posts});
});

module.exports = router;
