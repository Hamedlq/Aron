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


router.post('/delete', function (req, res) {
    if (req.body.token && req.body.item_id) {
        Supplier.findOne({ token: req.body.token }, function (err, supplier) {
            //console.log(supplier);
            if (err) {
                console.log(err);
            }
            if (supplier) {
                Item.find({ item_id: req.body.item_id, supplier_id: supplier._id },
                    function (err, item) {
                        if (item) {
                            //console.log(item.users);
                            if (item.users && item.users.length > 0) {
                                res.json({ Error: strings.item_has_order })
                            } else {
                                Item.remove({ item_id: req.body.item_id, supplier_id: supplier._id },
                                    function (err) {
                                        if (err) {
                                            console.log(err);
                                        } else {
                                            res.json({ Message: strings.item_removed });
                                        }
                                    });
                            }
                        }
                    }
                )
            } else {
                res.json({ Error: strings.user_not_found })
            }
        });
    }
});



router.post('/supplierItems', function (req, res) {
    if (req.body.token) {
        Supplier.find({ token: req.body.token }, 'mobile name family shopname shopphone', function (err, supplier) {
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

router.post('/supplierSearchItems', function (req, res) {
    if (req.body.token) {
        Supplier.find({ token: req.body.token }, 'mobile name family shopname shopphone', function (err, supplier) {
            if (err) {
                console.log(err);
            }
        }).populate({path:'items', select:'-_id item_id itemName itemBrand itemPrice itemDescription',
        match: { $text: { $search: req.body.query } }})
            .exec(function (err, items) {
                if (err) {
                    console.log(err);
                }
                if (items && items.length > 0) {
                    return res.json(items);
                }
            });
    } else {
        res.json({ Error: strings.user_not_found })
    }
});


router.post('/userItems', function (req, res) {
    if (req.body.token) {
        User.find({ token: req.body.token }, 'user_id', function (err, user) {
            if (err) {
                console.log(err);
            }
        }).populate({
            path: 'suppliers', select: '-_id mobile name family shopname shopphone',
            populate: { path: 'items', select: '-_id item_id itemName itemBrand itemPrice itemDescription' }
        })
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


router.post('/userSearchItem', function (req, res) {
    if (req.body.token) {
        User.find({ token: req.body.token }, 'user_id', function (err, user) {
            if (err) {
                console.log(err);
            }
            console.log(user);
            console.log("user+");
        }).populate({
            path: 'suppliers', select: '-_id mobile name family shopname shopphone',
            populate: {
                path: 'items', select: '-_id item_id itemName itemBrand itemPrice itemDescription',
                match: { $text: { $search: req.body.query } }
            }
        }).exec(function (err, items) {
            if (err) {
                console.log(err);
            }
            console.log(items);
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