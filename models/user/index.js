var express = require('express');
var strings = require('../../resources/strings');
var router = express.Router();
var User = require('./user');
var Supplier = require('../supplier/supplier');
var sendSms = require('../utils/sendSms');
//var mongoose = require('mongoose');

/* router.get('/', function (req, res) {
  User.find(function (err, users) {
    if (err)
      res.send(err);
    //responds with a json object of our database users.
    res.json(users)
  });
});
 */
router.post('/getsuppliers', function (req, res) {
  
  if (req.body.token) {
    User.find({ token: req.body.token },' mobile name family shopname shopphone', function (err, user) {
      if (err) {
        console.log(err);
      }
    }).populate('suppliers', '-_id mobile name family address shopname shopphone ')
      .exec(function (err, suppliers) {
        if (err) {
          console.log(err);
        }
        if (suppliers.length > 0) {
          return res.json(suppliers);
        }
      });
  } else {
    res.json({ Error: strings.user_not_found })
  }
});

router.post('/getUser', function (req, res) {  
  if (req.body.token) {
    User.findOne({ token: req.body.token },' mobile name family shopname shopphone', function (err, user) {
      if (err) {
        console.log(err);
      }
      if(user){
        return res.json(user);
      }

      });
  } else {
    res.json({ Error: strings.user_not_found })
  }
});


router.post('/getInitialInfo', function (req, res) {  
  if (req.body.token) {
    User.findOne({ token: req.body.token },' mobile name family shopname shopphone', function (err, user) {
      if (err) {
        console.log(err);
      }
      if(user){
        return res.json("09307606826");
      }else{
        res.status=401
        res.json({ Error: strings.user_not_found })    
      }

      });
  } else {
    res.json({ Error: strings.user_not_found })
  }
});

router.post('/addSupplier', function (req, res) {
  if (req.body.token && req.body.introducecode) {
    User.findOne({ token: req.body.token }, function (err, user) {
      console.log(user);
      if (user) {
        Supplier.findOneAndUpdate({ introducecode: req.body.introducecode }, { $push: { users: user } },
          function (err, supplier) {
            if (err) {
              console.log(err);
            } else {
              if(supplier){
                user.suppliers.push(supplier);
                user.save(function (err) {
                  if(err){
                    console.log(err);
                  }else{
                    res.json({ Message: strings.supplier_added })    
                  }
                  
                })
              }else{
                res.json({ Error: strings.wrong_refer_code })    
              }
            }
          });
      }else{
        res.json({ Error: strings.user_not_found })    
      }
    });
  }
  else {
    res.json({ Error: strings.user_not_found })
  }
});


router.post('/sendUserInfo', function (req, res, next) {
  if (req.body.token) {
    User.findOneAndUpdate({ token: req.body.token }, {
      name: req.body.name,
      family: req.body.family,
      address: req.body.address,
      propertytype: req.body.propertytype,
      shopname: req.body.shopname,
      shopphone: req.body.shopphone,
      shoplat: req.body.shoplat,
      shoplng: req.body.shoplng,
    }, { "fields": "name family shopname shopphone",
      new: true }, function (err, user) {
      if (err) {
        console.log(err);
        res.json({ Error: strings.internal_server })
      }
      if (user) {
        res.json({ Message: user })
      }
    })
  }
})


router.post('/setUserToken', function (req, res, next) {
  if (req.body.token) {
    User.findOne({ token: req.body.token }, function (err, user) {
      if (err) {
        console.log(err);
        res.json({ Error: strings.internal_server })
      }
      if (user) {
        if(user.ostoken!=req.body.oneSignalToken){
          user.ostoken=req.body.oneSignalToken;
          user.save(function(er){
            if(er){
              console.log(er);
            }else{
              res.json({ Message: strings.done })
            }
          })
        }else{
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
    User.findOne({ mobile: req.body.mobile }, function (err, user) {
      console.log(err);
      console.log(req.body.vCode);
      if (user) {
        var vcode = generateCode(user.user_id);
        console.log(vcode);
        if (vcode == req.body.vCode) {
          generateToken(function (token) {
            user.token = token;
            user.save(function (error) {
              if (!error) {
                var IsUserRegistered = null;
                if (user.name) {
                  IsUserRegistered = user.name;
                }
                return res.json({ Token: token, IsUserRegistered: IsUserRegistered });
              } else {
                return next(err);
              }
            });
          });
        }
      }
    })
  }
})

//POST route for updating data
router.post('/sendConfirmCode', function (req, res, next) {
  if (req.body.mobile && req.body.counter) {
    User.findOne({ mobile: req.body.mobile }, function (err, user) {
      if (user) {
        var vcode = generateCode(user.user_id);
        sendSms(vcode, req.body.mobile);
        if (user.smscount) {
          user.smscount = user.smscount + 1;
        } else {
          user.smscount = 1;
        }
        user.save(function (er) {
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
    User.findOne({ mobile: req.body.mobile }, function (err, user) {
      if (!user) {
        if (req.body.refercode) {
          Supplier.findOne({ introducecode: req.body.refercode }, function (err, supplier) {
            //console.log(supplier);
            if (!supplier) {
              //console.log(new Error(strings.wrong_refercode));
              return res.json({ Error: strings.wrong_refercode });
            } else {
              var date = new Date();
              var userData = {
                user_id: getUserId(),
                mobile: req.body.mobile,
                refercode: req.body.refercode,
                createTime: date,
                suppliers: [supplier]
              }
              User.create(userData, function (error, user) {
                if (error) {
                  console.log(error);
                  return next(error);
                } else {
                  supplier.users.push(user);
                  supplier.save(function (error) {
                    if (error) {
                      console.log(error);
                      return res.json({ Error: strings.internal_server });
                    } else {
                      return res.json({ Message: strings.user_registered });
                    }
                  });
                }
              });
            }
          });
        } else {
          return res.json({ Error: strings.refercode_oblige });
          /*           var err = new Error(strings.fill_fields);
                    err.status = 400;
                    return next(err); */
        }
      } else {
        return res.json({ Message: strings.user_exists });
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
  console.log('day: ' + day);
  var code = (day * _id) % 1000;
  console.log('coder: ' + code);
  return code;
}

function getUserId() {
  var ranId = Math.floor(Math.random() * Math.floor(100000));
  /* console.log('ranId: ' + ranId);
  User.count({ user_id: ranId }, function (err, count) {
      console.log(err);
    if (count>0) {
      console.log('null');
      ranId=getUserId();
    }
  }) */
  return ranId;

}


function generateToken(callback) {
  require('crypto').randomBytes(16, function (err, buffer) {
    token = buffer.toString('hex');
    return callback(token);
  });
}

function hasError(res, err) {
  if (err) {
    console.log(err);
    return res.json({ Error: strings.internal_server });
  } else {
    return false;
  }
};

module.exports = router;