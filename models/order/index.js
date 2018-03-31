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
                Item.find({ supplier_id: supplier._id }, function (err, item) {
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
        User.find({ token: req.body.token },{select: 'mobile'}, function (err, user) {
          if (err) {
            console.log(err);
          }
        }).populate('items', '-_id itemName itemBrand itemPrice itemDescription')
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

module.exports = router;