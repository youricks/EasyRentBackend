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
var nodemailer = require('nodemailer')
var stripe = require("stripe")("sk_live_vFlGvmxllCwWvX8mS5kk3FOo")

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
    },
    isValid: {
        type: Sequelize.BOOLEAN,
        allowNull: false
    }
    }, {
      freezeTableName: true // Model tableName will be the same as the model name
});

Purchase.sync()

// Token is created using Stripe.js or Checkout!
// Get the payment token ID submitted by the form:
var token = ""; // Using Express
var TICKET_PRICE = 65;
var authInfo = fs.readFileSync('authInfo.txt').toString().split('\n');
var qr = require('qr-image')

console.log(authInfo[0])
console.log(authInfo[1])


var transporter = nodemailer.createTransport({
    host: "smtp.163.com",
    secure: true,
    port:465,
    auth: {
        user: authInfo[0],
        pass: authInfo[1]

    }
});

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
    /* delete this line
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
        delete this line */ 
        var images = []
        var attachment = []

        for (var count=0; count<req.body.ticketNumber; count++){
          // Create Puchase Record
          Purchase.create({
              userId: req.body.id,
              amount: TICKET_PRICE,
              wechat: req.body.wechat,
              email: req.body.email,
              isValid: true
          }).then(function(newPurchase){
              console.log("Purchase Success");
              console.log(newPurchase["dataValues"]);
              var generatedQRString = "" + newPurchase["dataValues"]["id"] +  "_" + newPurchase["dataValues"]["email"] + "_" + newPurchase["dataValues"]["createdAt"]
              console.log("qrString: " + generatedQRString)
              
              //create image
              var imageCount = images.length
              var path = 'ticket_record_' + imageCount + '.png'
              images[imageCount] = 'ticket_record_' + imageCount + '.png'
              var fileType = 'png'
              var qr_png = qr.image(generatedQRString, { type: fileType});
              qr_png.pipe(fs.createWriteStream(path));

              theAttachment = {filename: images[imageCount], path: images[imageCount]}
              attachment[imageCount] = theAttachment

              Purchase.findOne({where: {id:newPurchase["dataValues"]["id"]}}).then(function(object){
                  console.log(object)
                  if (object){
                      object.updateAttributes({
                          qrString: generatedQRString
                      });
                  }
              })     

              console.log("imageCount: " + imageCount)
              console.log("req.body.ticketNumber: " + req.body.ticketNumber)
              // send email
              if (imageCount == req.body.ticketNumber-1){
                  console.log("To send the email now")
                  var mailOptions = {
                      from: 'easyrent_2017@163.com', // 发件地址
                      to: req.body.email, // 收件列表
                      subject: 'EasyRent购票凭证', // 标题
                      //text和html两者只支持一种
                      html: "<h2>购票凭证</h2><h3>二维码在附件</h3>",
                      attachments: attachment
                  }
                  console.log("before sending email")

                  // send mail with defined transport object
                  transporter.sendMail(mailOptions, function(error, info){
                      if(error){
                          console.log("email error")
                          return console.log(error);
                      }
                      console.log('Message sent: ' + info.response);
                      try{
                          for (var num=0; num<images.length; num++){
                              fs.unlinkSync(images[num])
                          }
                      }catch(e){
                         // Handle error
                         console.log('png file does not exist')
                      }
                  });
                  
              }
               
          }).catch(function (error){
              console.log("FAILEDDDDDDDDDD");
              req.user = error
              console.log("Charged but error happened")
              try{
                  for (var num=0; num<images.length; num++){
                      fs.unlinkSync(images[num])
                  }
              }catch(e){
                 // Handle error
                 console.log('png file does not exist')
              }
              console.log(req.body.id)
              console.log(req.body.amount)
              console.log(req.body.token)
              console.log(error)
              res.status(500).send(error);
          }); 
        }
        
        next()
        
        /* delete this line
      }
      else{
        console.log("opps, no charge");
        res.status(500).send(err);
      }
    });
    delete this line*/  

  }
}
