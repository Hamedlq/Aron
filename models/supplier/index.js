var express = require('express');
var strings = require('../../resources/strings');
var router = express.Router();
var Supplier = require('./supplier');
var sendSms = require('../utils/sendSms');
var Item = require('../item/item');
var sendNotif = require('../utils/sendSupplierNotification');
//var mongoose = require('mongoose');

/* router.get('/', function (req, res) {
  Supplier.find(function (err, suppliers) {
    if (err)
      res.send(err);
    //responds with a json object of our database Suppliers.
    console.log(getSupplierId());
    res.json(suppliers)
  });
}); */


router.post('/getusers', function (req, res) {
  if (req.body.token) {
    Supplier.find({ token: req.body.token }, 'mobile name family address shopname shopphone users', function (err, supplier) {
      if (err) {
        console.log(err);
      }
    }).populate('users.present', '-_id mobile name family address shopname shopphone ')
      .exec(function (err, users) {
        if (err) {
          console.log(err);
        }
        if (users.length > 0) {
          users[0].users.sort(compare);
          return res.json(users);
        }
      });
  } else {
    res.json({ Error: strings.user_not_found })
  }
});

router.post('/sendSupplierInfo', function (req, res, next) {
  if (req.body.token) {
    Supplier.findOneAndUpdate({ token: req.body.token }, {
      name: req.body.name,
      family: req.body.family,
      address: req.body.address,
      supportbrands: req.body.supportbrands,
      shopphone: req.body.shopphone,
      shoplat: req.body.shoplat,
      shoplng: req.body.shoplng,
    }, {
      "fields": "name family shopname shopphone",
        new: true
      }, function (err, supplier) {
        if (err) {
          console.log(err);
          res.json({ Error: strings.internal_server })
        }
        if (supplier) {
          res.json({ Message: supplier })
        } else {
          res.json({ Error: strings.user_not_found })
        }
      })
  }
});

router.post('/getInitialInfo', function (req, res) {  
  if (req.body.token) {
    Supplier.findOne({ token: req.body.token },' mobile name family supportbrands shopphone', function (err, supplier) {
      if (err) {
        console.log(err);
      }
      if(supplier){
        return res.json({ Message: "09307606826" });
      }else{
        //res.status=401;
        res.send(401, { Error: strings.user_not_found });
      }
      });
  } else {
    res.json({ Error: strings.user_not_found })
  }
});


router.post('/setSupplierToken', function (req, res, next) {
  if (req.body.token) {
    Supplier.findOne({ token: req.body.token }, function (err, supplier) {
      if (err) {
        console.log(err);
        res.json({ Error: strings.internal_server })
      }
      if (supplier) {
        if (supplier.ostoken != req.body.oneSignalToken) {
          supplier.ostoken = req.body.oneSignalToken;
          supplier.save(function (er) {
            if (er) {
              console.log(er);
            } else {
              res.json({ Message: strings.done })
            }
          })
        } else {
          res.json({ Error: strings.repeated_code })
        }
      } else {
        res.json({ Error: strings.user_not_found })
      }
    })
  }
});


router.post('/confirmSmsCode', function (req, res, next) {
  if (req.body.mobile && req.body.vCode) {
    Supplier.findOne({ mobile: req.body.mobile }, function (err, supplier) {
      console.log(err);
      console.log(req.body.vCode);
      if (supplier) {
        var vcode = generateCode(supplier.supplier_id);
        console.log(vcode);
        if (vcode == req.body.vCode) {
          generateToken(function (token) {
            supplier.token = token;
            supplier.introducecode = generateRandom();
            supplier.schema_version = 1;
            supplier.save(function (error) {
              if (!error) {
                var IsSupplierRegistered = null;
                if (supplier.name) {
                  IsSupplierRegistered = supplier.name;
                }
                return res.json({
                  Token: token,
                  IsSupplierRegistered: IsSupplierRegistered,
                  Introducecode: supplier.introducecode
                });
              } else {
                console.log(error)
                return next(error);
              }
            });
          });
        } else {
          return res.json({ Error: strings.wrong_confirmcode });
        }
      }else {
        return res.json({ Error: strings.user_not_found });
      }
    })
  }
})

/* 
router.post('/sendnotif', function (req, res, next) {
  if (req.body.token) {
    Supplier.findOne({ token: req.body.token }, function (err, supplier) {
      if (err) {
        console.log(err);
        res.json({ Error: strings.internal_server })
      }
      if (supplier) {
        console.log(supplier.ostoken);
        sendNotif(supplier.ostoken, 'پفک نمکی مینو', 'نوتیف');

        res.json({ Message: strings.done })
      } else {
        res.json({ Error: strings.user_not_found })
      }
    })
  }
}); */

//POST route for updating data
router.post('/sendConfirmCode', function (req, res, next) {
  if (req.body.mobile && req.body.counter) {
    Supplier.findOne({ mobile: req.body.mobile }, function (err, supplier) {
      if (supplier) {
        var vcode = generateCode(supplier.supplier_id);
        sendSms(vcode, req.body.mobile);
        supplier.schema_version=1;
        if (supplier.smscount) {
          supplier.smscount = supplier.smscount + 1;
        } else {
          supplier.smscount = 1;
        }
        supplier.save(function (er) {
          if (er) {
            console.log(er);
            return res.json({ Error: strings.internal_server });
          }
        })
        //console.log("sms");
        return res.json({ Message: strings.code_sent });
      }
    })
  }
})

//POST route for updating data
router.post('/login', function (req, res, next) {
  //console.log("omad login" + req.body.mobile);
  if (req.body.mobile) {
    //console.log(req.body.mobile);
    Supplier.findOne({ mobile: req.body.mobile }, function (err, thesupplier) {
      if (!thesupplier) {
        if (req.body.refercode) {
          Supplier.findOne({ introducecode: req.body.refercode }, function (err, supplier) {
            //console.log(supplier);
            if (!supplier) {
              console.log(supplier);
              return res.json({ Error: strings.wrong_refercode });
            } else {
              getSupplierId(function (randId) {
                var date = new Date();
                var supplierData = {
                  schema_version: 1,
                  supplier_id: randId,
                  mobile: req.body.mobile,
                  refercode: req.body.refercode,
                  createTime: date,
                }
                //console.log(supplierData);

                Supplier.create(supplierData, function (error, supplier) {
                  if (error) {
                    console.log(error);
                    return next(error);
                  } else {
                    console.log("true");
                    return res.json({ Message: strings.supplier_registered });
                  }
                });
              })
            }
          });
        } else {
          return res.json({ Error: strings.refercode_oblige });
          /*           var err = new Error(strings.fill_fields);
                    err.status = 400;
                    return next(err); */
        }
      } else {
        return res.json({ Message: strings.supplier_exists });
      }
    });
  }
});

function generateCode(_id) {
  var now = new Date();
  var start = new Date(now.getFullYear(), 0, 0);
  var diff = (now - start) + ((start.getTimezoneOffset() - now.getTimezoneOffset()) * 60 * 1000);
  var oneDay = 1000 * 60 * 60 * 24;
  var day = Math.floor(diff / oneDay);
  //console.log('day: ' + day);
  var code = (day * _id) % 1000;
  console.log('coder: ' + code);
  return code;
}

function getSupplierId(callback) {
  var ranId = Math.floor(Math.random() * Math.floor(999999));
  console.log('ranId: ' + ranId);
  Item.count({ item_id: ranId }, function (err, count) {
    if (count == 0) {
      return callback(ranId);
    } else {
      return getItemId(callback);
    }
  })
}


function generateToken(callback) {
  require('crypto').randomBytes(16, function (err, buffer) {
    token = buffer.toString('hex');
    console.log(token);
    return callback(token);
  });
}

function generateRandom() {
  var ranId = Math.floor(Math.random() * Math.floor(999999));
  return ranId;
}

function compare(a,b) {
  if (a.createTime < b.createTime)
    return 1;
  if (a.createTime > b.createTime)
    return -1;
  return 0;
}


module.exports = router;