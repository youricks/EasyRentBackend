var pg = require('pg');
const fs = require('fs');
var match = process.env.DATABASE_URL.match(/postgres:\/\/([^:]+):([^@]+)@([^:]+):(\d+)\/(.+)/)
var applicationPassword = process.env.APP_PASSWORD

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

var stripe = require("stripe")("sk_live_vFlGvmxllCwWvX8mS5kk3FOo");

// Token is created using Stripe.js or Checkout!
// Get the payment token ID submitted by the form:
var token = ""; // Using Express

module.exports = {
  purchase: function(req,res,next) {
    console.log(req.body.id)
    console.log(req.body.token)
    console.log(req.body.amount)
    // Charge the user's card:
    var charge = stripe.charges.create({
      amount: 1,
      currency: "cad",
      description: "Ticket Charge",
      source: req.body.token,
    }, function(err, charge) {
      // asynchronously called
      if (err){
        console.log("visa card error");
        console.log(err);
      }
      else{
        console.log("no visa card error");
      }
      if (charge){
        console.log("charge");
        console.log(charge);
      }
      else{
        console.log("opps, no charge");
      }
    });
    next()
  }
}
