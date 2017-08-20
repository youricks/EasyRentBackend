var pg = require('pg');
const fs = require('fs');
var match = process.env.DATABASE_URL.match(/postgres:\/\/([^:]+):([^@]+)@([^:]+):(\d+)\/(.+)/)
var applicationPassword = process.env.APP_PASSWORD
var QRCode = require('qrcode')

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

var Purchase = sequelize.define('Purchase', {
    userId: {
        type: Sequelize.STRING,
        allowNull: false,
        //unique: true,
        //primaryKey: true
    },
    amount: {
        type: Sequelize.INTEGER,
        allowNull: false
    },
    wechat: {
        type: Sequelize.STRING,
        allowNull: false
    },
    qrString: {
        type: Sequelize.STRING
    },
    email: {
        type: Sequelize.STRING,
        allowNull: false
    }
    }, {
      freezeTableName: true // Model tableName will be the same as the model name
});

Purchase.sync()

var stripe = require("stripe")("sk_live_vFlGvmxllCwWvX8mS5kk3FOo");

// Token is created using Stripe.js or Checkout!
// Get the payment token ID submitted by the form:
var token = ""; // Using Express
var TICKET_PRICE = 65;

module.exports = {
  purchase: function(req,res,next) {
    console.log(req.body.id)
    console.log(req.body.token)
    console.log(req.body.amount)
    console.log(req.body.wechat)
    console.log(req.body.ticketNumber)
    console.log(req.body.email)

    // Check if any error in parameter. Will not charge if anything missing
    if (!req.body.id  || !req.body.amount || !req.body.wechat || !req.body.ticketNumber || !req.body.email) {
        console.log("Invalid purchase request")
        res.status(400).send("Invalid Request. Please check your parameters. Card not charged");
        return;
    }
    /**/
    // Charge the user's card:
    var charge = stripe.charges.create({
      amount: req.body.amount,
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
        for (var count=0; count<req.body.ticketNumber; count++){
          // Create Puchase Record
          Purchase.create({
              userId: req.body.id,
              amount: TICKET_PRICE,
              wechat: req.body.wechat,
              email: req.body.email
          }).then(function(newPurchase){
              console.log("Purchase Success");
              console.log(newPurchase["dataValues"]);
              var qr = "" + newPurchase["dataValues"]["id"] +  "_" + newPurchase["dataValues"]["email"] + "_" + newPurchase["dataValues"]["createdAt"]
              console.log("qrString: " + qr)
              
              Purchase.findOne({where: {id:newPurchase["dataValues"]["id"]}}).then(function(object){
                  console.log(object)
                  if (object){
                      object.updateAttributes({
                          qrString: qr
                      });
                  }
              })     

              QRCode.toDataURL(qr, function (err, url) {
                console.log(url)
                // send email here
              })
               
          }).catch(function (error){
              console.log("FAILEDDDDDDDDDD");
              req.user = error
              console.log("Charged but error happened")
              console.log(req.body.id)
              console.log(req.body.amount)
              console.log(req.body.token)
              console.log(error)
              res.status(500).send(error);
          }); 
        }
        next()
        
      }
      else{
        console.log("opps, no charge");
        res.status(500).send(err);
      }
    });

  }
}
