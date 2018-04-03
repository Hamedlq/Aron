var express = require('express');
var strings = require('../../resources/strings');
var router = express.Router();
var Item = require('../item/item');
var Supplier = require('../supplier/supplier');
var User = require('../user/user');


router.post('/insertOrder', function (req, res, next) {
    if (req.body.token && req.body.item_id) {
        User.findOne({ token: req.body.token }, function (err, user) {
            if (user) {
                Item.findOneAndUpdate({ item_id: req.body.item_id }, { $push: { users: user } },
                    function (err, item) {
                        if (err) {
                            console.log(err);
                        } else {
                            if (item) {
                                user.items.push(item);
                                user.save(function (err) {
                                    if (err) {
                                        console.log(err);
                                    } else {
                                        res.json({ Message: strings.item_added })
                                    }
                                })
                            }
                        }
                    });
            } else {
                res.json({ Error: strings.user_not_found })
            }
        });
    }
    else {
        res.json({ Error: strings.user_not_found })
    }
})



router.post('/supplierOrders', function (req, res) {
    if (req.body.token) {
        Supplier.findOne({ token: req.body.token }, function (err, supplier) {
            if (err) {
                console.log(err);
            } else {
                console.log(supplier);
                Item.find({ supplier_id: supplier._id },'itemName itemBrand itemPrice itemDescription', function (err, item) {
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
            }
        })
    } else {
        res.json({ Error: strings.user_not_found })
    }
});

router.post('/userOrders', function (req, res) {
    if (req.body.token) {
        User.find({ token: req.body.token }, 'mobile' , function (err, user) {
            if (err) {
                console.log(err);
            }
        }).populate({
            path: 'items', select: '-_id item_id itemName itemBrand itemPrice itemDescription',
            populate: { path: 'supplier_id', select: '-_id mobile name family shopname shopphone' }
        })
            .exec(function (err, items) {

                if (err) {
                    console.log(err);
                }
                if (items.length > 0) {
                    console.log(items);
                    return res.json(items);
                }
            });
    } else {
        res.json({ Error: strings.user_not_found })
    }
});


router.post('/cancelOrder', function (req, res) {
    if (req.body.token && req.body.item_id) {
        User.findOne({ token: req.body.token }, function (err, user) {
            console.log(user);
            if (err) {
                console.log(err);
            }
            if (user) {
                Item.findOneAndUpdate({ item_id: req.body.item_id },
                    { $pull: { users: user._id } },
                    function (err, item) {
                        if (err) {
                            console.log(err);
                        }
                        if(item){
                            user.update({ $pull: { items: item._id } },function(err){
                                if (err) {
                                    console.log(err);
                                }else{
                                    res.json({ Message: strings.order_removed })
                                }       
                            })
                        }
                    });
            } else {
                res.json({ Error: strings.user_not_found })
            }
        });
    }
});


module.exports = router;