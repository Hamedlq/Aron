var express = require('express');
var strings = require('../../resources/strings');
var router = express.Router();
var Item = require('../item/item');
var Supplier = require('../supplier/supplier');
var User = require('../user/user');
var sendNotif = require('../utils/sendSupplierNotification');

router.post('/insertOrder', function (req, res, next) {
    if (req.body.token && req.body.item_id) {
        var date = new Date();
        User.findOne({ token: req.body.token }, function (err, user) {
            if (user) {
                Item.findOneAndUpdate({ item_id: req.body.item_id }, {
                    $push: {
                        users: {
                            createTime: date,
                            orderedBy: user
                        }
                    }
                },
                    function (err, item) {
                        if (err) {
                            console.log(err);
                        } else {
                            if (item) {
                                var itemObj = {
                                    createTime: date,
                                    ordered: item
                                };
                                user.items.push(itemObj);
                                user.save(function (err) {
                                    if (err) {
                                        console.log(err);
                                    } else {
                                        Supplier.findOne({ _id: item.supplier_id }, function (err, supplier) {
                                            if (err) { console.log(err) } else {
                                                sendNotif(supplier.ostoken,
                                                    item.itemName + " " + item.itemBrand,
                                                    user.name + " " + user.family + " سفارش " + item.itemName + " " + item.itemBrand + " ثبت کرده است");
                                            }
                                        })
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
                //console.log(supplier);
                Item.find({ supplier_id: supplier._id }, 'itemName itemBrand itemPrice visitorPrice itemDescription users', 
                function (err, item) {
                    if (err) {
                        console.log(err);
                    }
                }).populate('users.orderedBy', '-_id mobile name family address shopname shopphone ')
                    .exec(function (err, users) {
                        if (err) {
                            console.log(err);
                        }
                        if (users.length > 0) {
                            users[0].users.sort(compare);
                            console.log(users);
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
        User.find({ token: req.body.token }, 'mobile items', function (err, user) {
            if (err) {
                console.log(err);
            }
            console.log(req.body.token);
            console.log(user);
        }).populate({
            path: 'items.ordered', select: '-_id item_id itemName itemBrand itemPrice visitorPrice itemDescription ',
            populate: {
                path: 'supplier_id',
                select: '-_id mobile name family shopname shopphone'
            }
        })
            .exec(function (err, items) {

                if (err) {
                    console.log(err);
                }
                if (items.length > 0) {
                    //console.log(items);
                    items[0].items.sort(compare);
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
                    { $pull: { users:{ orderedBy:user._id } }},
                    function (err, item) {
                        if (err) {
                            console.log(err);
                        }
                        if (item) {
                            user.update({ $pull: { items:{ ordered:item._id } }}, function (err) {
                                if (err) {
                                    console.log(err);
                                } else {
                                    Supplier.findOne({ _id: item.supplier_id }, function (err, supplier) {
                                        if (err) { console.log(err) } else {
                                            sendNotif(supplier.ostoken,
                                                'سفارش ' + item.itemName + " " + item.itemBrand + " کنسل شد",
                                                user.name + " " + user.family + " سفارش " + item.itemName + " " + item.itemBrand + " را حذف کرد");
                                        }
                                    })
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

function compare(a,b) {
    if (a.createTime < b.createTime)
      return 1;
    if (a.createTime > b.createTime)
      return -1;
    return 0;
  }


module.exports = router;