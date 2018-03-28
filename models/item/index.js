var express = require('express');
var strings = require('../../resources/strings');
var router = express.Router();
var Item = require('./item');


router.get('/', function (req, res) {
    Supplier.find(function (err, suppliers) {
        if (err)
            res.send(err);
        //responds with a json object of our database Suppliers.
        console.log(getSupplierId());
        res.json(suppliers)
    });
});

router.post('/insertItem', function (req, res, next) {
    if (req.body.token) {
        Supplier.findOne({ token: req.body.token }, function (err, thesupplier) {
            if (thesupplier) {
                getItemId(function (randId) {
                    var date = new Date();
                    var itemData = {
                        item_id: randId,
                        supplier_id: thesupplier._id,
                        createTime: date,
                        itemName: req.body.itemName,
                        itemBrand: req.body.itemBrand,
                        itemPrice: req.body.itemPrice,
                        itemDescription: req.body.itemDescription,
                    }

                    Item.create(itemData, function (error, item) {
                        if (error) {
                            console.log(error);
                            return next(error);
                        } else {
                            console.log("true");
                            return res.json({ Message: strings.item_registered });
                        }
                    });

                })


            } else {
                res.json({ Error: strings.user_not_found })
            }
        });
    } else {
        return res.json({ Error: strings.fill_fields });
    }
})



router.post('/getusers', function (req, res) {
    if (req.body.token) {
        Supplier.find({ token: req.body.token }, function (err, supplier) {
            if (err) {
                console.log(err);
            }
        }).populate('users', '-_id mobile name family address shopname shopphone ')
            .exec(function (err, users) {
                if (err) {
                    console.log(err);
                }
                if (users.length > 0) {
                    return res.json(users);
                }
            });
    } else {
        res.json({ Error: strings.user_not_found })
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
                        supplier.save(function (error) {
                            if (!error) {
                                var IsSupplierRegistered = false;
                                if (supplier.name) {
                                    IsSupplierRegistered = true;
                                }
                                return res.json({ Token: token, IsSupplierRegistered: IsSupplierRegistered });
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
        Supplier.findOne({ mobile: req.body.mobile }, function (err, supplier) {
            if (supplier) {
                var vcode = generateCode(supplier.supplier_id);
                sendSms(vcode, 09358695785);
                if (supplier.smscount) {
                    supplier.smscount = supplier.smscount + 1;
                } else {
                    supplier.smscount = 1;
                }
                supplier.save(function (er) {
                    if (er) {
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
    console.log("omad login" + req.body.mobile);
    if (req.body.mobile) {
        console.log(req.body.mobile);
        Supplier.findOne({ mobile: req.body.mobile }, function (err, thesupplier) {
            if (!thesupplier) {
                if (req.body.refercode) {
                    Supplier.findOne({ introducecode: req.body.refercode }, function (err, supplier) {
                        console.log(supplier);
                        if (!supplier) {
                            //console.log(new Error(strings.wrong_refercode));
                            return res.json({ Error: strings.wrong_refercode });
                        } else {
                            var date = new Date();
                            var supplierData = {
                                supplier_id: getSupplierId(),
                                mobile: req.body.mobile,
                                refercode: req.body.refercode,
                                createTime: date,
                            }
                            console.log(supplierData);

                            Supplier.create(supplierData, function (error, supplier) {
                                if (error) {
                                    console.log(error);
                                    return next(error);
                                } else {
                                    console.log("true");
                                    return res.json({ Message: strings.supplier_registered });
                                }
                            });
                        }
                    });
                } else {
                    return res.json({ Error: strings.fill_fields });
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
    console.log('day: ' + day);
    var code = (day * _id) % 1000;
    console.log('coder: ' + code);
    return code;
}

function getItemId(callback) {
    var ranId = Math.floor(Math.random() * Math.floor(99999));
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
        return callback(token);
    });
}

function generateRandom() {
    var ranId = Math.floor(Math.random() * Math.floor(999999));
    return ranId;
}

module.exports = router;