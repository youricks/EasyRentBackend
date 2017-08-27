const HOST_ADDRESS = "https://haoyizu.herokuapp.com/"
//const HOST_ADDRESS = "http://192.168.31.53:5432/" 
//const HOST_ADDRESS = "http://192.168.16.108:5432/" 
var qr = require('qr-image')
const sharp = require("sharp");

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
var stripe = require("stripe")("sk_live_iODiHHQacpT1jU3VxiAhtWhf")
var validCode = ['932648', '391842', '405917', '630717', '727538', '260831', '291739', '318427', '591837', '517396']

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
    ticketNumber: {
        type: Sequelize.INTEGER,
        allowNull: false
    },
    wechat: {
        type: Sequelize.STRING,
        allowNull: false
    }, 
    email: {
        type: Sequelize.STRING,
        allowNull: false
    }
    }, {
      freezeTableName: true // Model tableName will be the same as the model name
});

var CodeRecord = sequelize.define('CodeRecord', {
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
    ticketNumber: {
        type: Sequelize.INTEGER,
        allowNull: false
    },
    wechat: {
        type: Sequelize.STRING,
        allowNull: false
    }, 
    email: {
        type: Sequelize.STRING,
        allowNull: false
    },
    promotionalCode: {
        type: Sequelize.STRING,
        allowNull: false
    }
    }, {
      freezeTableName: true // Model tableName will be the same as the model name
});

var Ticket = sequelize.define('Ticket', {
    code: {
        type: Sequelize.STRING,
        allowNull: false,
        unique: true
    },
    email: {
        type: Sequelize.STRING,
        allowNull: true
    },
    isValid: {
        type: Sequelize.BOOLEAN,
        allowNull: false
    },
    isSold: {
        type: Sequelize.BOOLEAN,
        allowNull: false
    }
    }, {
      freezeTableName: true // Model tableName will be the same as the model name
});

var VIPTicket = sequelize.define('VIPTicket', {
    code: {
        type: Sequelize.STRING,
        allowNull: false,
        unique: true
    },
    email: {
        type: Sequelize.STRING,
        allowNull: true
    },
    isValid: {
        type: Sequelize.BOOLEAN,
        allowNull: false
    },
    isSold: {
        type: Sequelize.BOOLEAN,
        allowNull: false
    },
    tableNumber: {
        type: Sequelize.STRING,
        allowNull: false
    },
    ticketType: {
        type: Sequelize.STRING,
        allowNull: true
    },
    comment: {
        type: Sequelize.STRING,
        allowNull: true
    }
    }, {
      freezeTableName: true // Model tableName will be the same as the model name
});


Purchase.sync()
CodeRecord.sync()
Ticket.sync()
VIPTicket.sync()

console.log("rrrrrr")

/*
var fileType = 'png'
var qr_png = qr.image(HOST_ADDRESS + "ticket/vipverify/" + "table_90ckn1u0nnho8sbjned841jor", { type: fileType, size: 9});
var stream = qr_png.pipe(fs.createWriteStream("code.png"));
*/

/*
VIPTicket.create({
    code: 'table' + '_' + Math.random().toString(36).substr(2),
    email: "",
    isValid: true,
    isSold: true,
    tableNumber: "wf5",
    type: "",
    comment: ""
}).then(function(newTicket){
     console.log("new ticket is created")
}).catch(function (error){
    console.log(error)
    console.log("failed to create ticket");
});
*/

/*
// tickets creation
for (var ticketOrder=1; ticketOrder<=3500; ticketOrder++){

    Ticket.create({
        code: '' + ticketOrder + '_' + Math.random().toString(36).substr(2),
        email: "",
        isValid: true,
        isSold: false
    }).then(function(newTicket){
         console.log("new ticket is created")
    }).catch(function (error){
        console.log("failed to create ticket");
    });
}
*/


// Token is created using Stripe.js or Checkout!
// Get the payment token ID submitted by the form:
var token = ""; // Using Express
var authInfo = fs.readFileSync('authInfo.txt').toString().split('\n');

var transporter = nodemailer.createTransport({
    service: "QQ",
    auth: {
        user: "439842225@qq.com",
        pass: "iwsffbmaxhxsbifa"

    }
});

function sendEmail(currentTicketInfo, emailAddress){
    var images = []
    var qrCodes = []
    var attachment = []
    streamDoneCount = 0
    overLayCount = 0

    for (var imageCount=0; imageCount<currentTicketInfo.length; imageCount++){
        //create image
        var path = currentTicketInfo[imageCount]["ticketId"] + '_ticket_record_' + imageCount + '.png'
        const ticketName = currentTicketInfo[imageCount]["ticketId"] + "_Ticket" + imageCount + ".jpg"
        images[imageCount] = ticketName
        qrCodes[imageCount] = path
        var fileType = 'png'
        var qr_png = qr.image(HOST_ADDRESS + "ticket/verify/" + currentTicketInfo[imageCount].ticketCode, { type: fileType, size: 9});
        var stream = qr_png.pipe(fs.createWriteStream(path));

        theAttachment = {filename: ticketName, path: ticketName}
        attachment[imageCount] = theAttachment

        stream.on('finish', function(){
            var source = currentTicketInfo[streamDoneCount]["ticketId"] + '_ticket_record_' + streamDoneCount + '.png'
            var target = currentTicketInfo[streamDoneCount]["ticketId"] + "_Ticket" + streamDoneCount + ".jpg"
            streamDoneCount += 1
            sharp("ticket_background.png").overlayWith(source, { top: 642, left: 1710 }).toFile(target, function(err, info) {
                // output.dzi is the Deep Zoom XML definition
                // output_files contains 512x512 tiles grouped by zoom level
                overLayCount += 1
                console.log("error when exporting png?")
                if (err){
                    console.log(err)
                }
                else{
                    console.log(info)
                    console.log(currentTicketInfo.length)
                    console.log(streamDoneCount)
                    
                    if (overLayCount == currentTicketInfo.length){
                        console.log("To send the email now")
                        var code = ""
                        for (i in currentTicketInfo) {
                            if (currentTicketInfo) {
                                code += (currentTicketInfo[i].ticketCode + "\n")
                            }
                        }
                        var mailOptions = {
                            from: '439842225@qq.com', // 发件地址
                            to: emailAddress, // 收件列表
                            subject: '门票购票凭证', // 标题
                            //text和html两者只支持一种
                            html: `<h2>恭喜您成功购得2017年9月15日将在Toronto Event Centre 举办的 MEET EDC IN TORONTO TICKET 1张。</h2>
                            <p>TICKET TYPE： EARLY BIRD.</p>
                            <p>TICKET NUMBER： ` + code + `</p>
                            <p>请于演出开始前一周到指定取票点取实体票， 线下取票点请关注CSSA， MAPLE CAR， TK， TAIYA AUTO公众号。 </p>

                            `,
                            attachments: attachment
                        }
                        console.log("before sending email")

                        // send mail with defined transport object
                        transporter.sendMail(mailOptions, function(error, info){
                            if(error){
                                console.log("email error")
                            }
                            console.log('Message sent: ' + info.response);
                            try{
                                for (var num=0; num<images.length; num++){
                                    fs.unlinkSync(images[num])
                                    fs.unlinkSync(qrCodes[num])
                                }
                            }catch(e){
                                // Handle error
                                console.log('png file does not exist')
                            }
                        });
                    }
                }
                
            });
        })
    }



}

function getSomeTickets(currentTicketNumbers, targetTicketNumbers, currentTicketInfo, emailAddress){
    console.log("currentTicketInfo length: " + currentTicketInfo.length)
    if (currentTicketNumbers == targetTicketNumbers){
        sendEmail(currentTicketInfo, emailAddress)

        console.log("final return")
        return currentTicketInfo
    }
    else{
        Ticket.findOne({where: {isSold:false, id:{lte: 2000}}}).then(function(ticket){
            if (ticket){
                console.log("ticket.id: " + ticket.id)
                ticket.updateAttributes({
                    isSold:true,
                    email:emailAddress
                }).then(function(updated){
                    thisTicketInfo = []
                    thisTicketInfo["ticketId"] = ticket.id
                    thisTicketInfo["ticketCode"] = ticket.code
                    currentTicketInfo.push(thisTicketInfo)
                    currentTicketNumbers += 1
                    return getSomeTickets(currentTicketNumbers, targetTicketNumbers, currentTicketInfo, emailAddress)                    
                })
            }
            else{
                return currentTicketInfo
            }

        })
    }
}

function contains(arr, obj) {
  var index = arr.length;
  while (index--) {
    if (arr[index] === obj) {
      return true;
    }
  }
  return false;
}

module.exports = {
    purchase: function(req,res,next) {
        console.log(req.body.id)
        console.log(req.body.token)
        console.log(req.body.amount)
        console.log(req.body.wechat)
        console.log(req.body.ticketNumber)
        console.log(req.body.email)
        //req.body.amount = 50

        // Check if any error in parameter. Will not charge if anything missing
        if (!req.body.id  || !req.body.amount || !req.body.wechat || !req.body.ticketNumber || !req.body.email) {
            console.log("Invalid purchase request")
            res.status(400).send("Invalid Request. Please check your parameters. Card not charged");
            return;
        }

        /* delete this line*/
        // Charge the user's card:
        console.log("going to charge");
        console.log(req.body.amount);
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
            /*delete this line */ 

            Purchase.create({
                userId: req.body.id,
                amount: req.body.amount,
                wechat: req.body.wechat,
                email: req.body.email,
                ticketNumber: req.body.ticketNumber
            }).then(function(newPurchase){
                 console.log("purchase succeed")
                 
                 CodeRecord.create({
                    userId: req.body.id,
                    amount: req.body.amount,
                    wechat: req.body.wechat,
                    email: req.body.email,
                    ticketNumber: req.body.ticketNumber,
                    promotionalCode :req.body.code
                })

                 // retrieve the ticket ids
                 var retrievedTicketInfo = getSomeTickets(0, req.body.ticketNumber, [], req.body.email)
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
            next()
            
            /* delete this line */
          }
          else{
            console.log("opps, no charge");
            res.status(500).send(err);
          }
        });
        /*delete this line*/  

    },
    verify: function(req,res,next) {
        var ticketId = req.params.id
        console.log(ticketId)
        Ticket.findOne({where: {code:ticketId}}).then(function(ticket){
            if (ticket) {
                if (ticket.isValid){
                    if (ticket.isSold) {
                        res.end("此票有效，请入场。票号为: " + req.params.id)
                        /*
                        ticket.updateAttributes({
                            isValid:false,
                        }).then(function(updated){
                            res.end("此票有效，票号为: " + req.params.id)
                        })
                        */

                    }
                    else {
                        res.end("此票并未出售。请联系技术人员。票号为: " + req.params.id)
                    }
                }
                else {
                    res.end("抱歉，此票已经被扫。票号为: " + req.params.id)
                }
            }
            else {
                res.end("此票无效")
            }
        })
    },
    vipVerify: function(req,res,next){
        var ticketId = req.params.id
        console.log(ticketId)
        VIPTicket.findOne({where: {code:ticketId}}).then(function(ticket){
            if (ticket) {
                if (ticket.isValid){
                    if (ticket.isSold) {
                        res.end("此票有效，请入场。票号为: " + req.params.id + "卡座号为: " + ticket.tableNumber)
                        /*
                        ticket.updateAttributes({
                            isValid:false,
                        }).then(function(updated){
                            res.end("此票有效，请入场。票号为: " + req.params.id + "卡座号为: " + ticket.tableNumber)
                        })
                        */

                    }
                    else {
                        res.end("此票并未出售。请联系技术人员。票号为: " + req.params.id + "卡座号为: " + ticket.tableNumber)
                    }
                }
                else {
                    res.end("抱歉，此票已经被扫。票号为: " + req.params.id + "卡座号为: " + ticket.tableNumber)
                }
            }
            else {
                res.end("此票无效")
            }
        })

    },
    codeVerify: function (req, res, next) {
        var code = req.body.code
        console.log("code:==" + code + "===")

        // If no code given, just pass
        if (!code) {
            console.log("no code is given")
            req.isVerified = true
            req.isValid = false
            next()
            return;
        }

        // If correct code given, 
        if(contains(validCode, code)){
            console.log("Code is right")
            req.isVerified = true
            req.isValid = true
            next()
        }
        // If code given incorrect, return error directly
        else{
            console.log("Code is wrong")
            req.isVerified = true
            req.isValid = false
            res.status(500).send("Incorrect Code Given")
        }
    }
}
