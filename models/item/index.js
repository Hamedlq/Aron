var express = require('express');
var strings = require('../../resources/strings');
var router = express.Router();
var Item = require('./item');
var Supplier = require('../supplier/supplier');
var User = require('../user/user');


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
                            thesupplier.items.push(item);
                            thesupplier.save(function (err) {
                                if (err) {
                                    console.log(error);
                                    return next(error);
                                } else {
                                    return res.json({ Message: strings.item_registered });
                                }
                            })
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



router.post('/supplierItems', function (req, res) {
    if (req.body.token) {
        Supplier.find({ token: req.body.token },'mobile name family shopname shopphone', function (err, supplier) {
            if (err) {
                console.log(err);
            }
        }).populate('items', '-_id item_id itemName itemBrand itemPrice itemDescription')
            .exec(function (err, items) {
                if (err) {
                    console.log(err);
                }
                if (items.length > 0) {
                    return res.json(items);
                }
            });
    } else {
        res.json({ Error: strings.user_not_found })
    }
});

router.post('/userItems', function (req, res) {
    if (req.body.token) {
        User.find({ token: req.body.token },{select: 'mobile'}, function (err, user) {
            if (err) {
                console.log(err);
            }
        }).populate({path: 'suppliers',select:'-_id mobile name family shopname shopphone',
        populate : {path : 'items',select:'-_id item_id itemName itemBrand itemPrice itemDescription'}} )
            .exec(function (err, items) {
                if (err) {
                    console.log(err);
                }
                if (items.length > 0) {
                    return res.json(items);
                }
            });
    } else {
        res.json({ Error: strings.user_not_found })
    }
});

function getItemId(callback) {
    var ranId = Math.floor(Math.random() * Math.floor(999999999999));
    console.log('ranId: ' + ranId);
    Item.count({ item_id: ranId }, function (err, count) {
        if (count == 0) {
            return callback(ranId);
        } else {
            return getItemId(callback);
        }
    })
}

module.exports = router;