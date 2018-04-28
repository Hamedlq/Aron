var express = require('express');
var strings = require('../../resources/strings');
var router = express.Router();
var Item = require('./item');
var Supplier = require('../supplier/supplier');
var User = require('../user/user');


/* router.get('/', function (req, res) {
    Supplier.find(function (err, suppliers) {
        if (err)
            res.send(err);
        //responds with a json object of our database Suppliers.
        console.log(getSupplierId());
        res.json(suppliers)
    });
}); */

router.post('/insertItem', function (req, res, next) {
    if (req.body.token) {
        Supplier.findOne({ token: req.body.token }, function (err, thesupplier) {
            if (thesupplier) {
                getItemId(function (randId) {
                    var date = new Date();
                    var itemData = {
                        schema_version: 1,
                        item_id: randId,
                        supplier_id: thesupplier._id,
                        createTime: date,
                        itemName: req.body.itemName,
                        itemBrand: req.body.itemBrand,
                        visitorPrice: req.body.visitorPrice,
                        itemPrice: req.body.itemPrice,
                        itemDescription: req.body.itemDescription,
                    }
                    Item.create(itemData, function (error, item) {
                        if (error) {
                            console.log(error);
                            return next(error);
                        } else {
                            var date = new Date();
                            var itemObj = {
                                createTime: date,
                                submitted: item
                            };
                            thesupplier.items.push(itemObj);
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

router.post('/updateItem', function (req, res, next) {
    if (req.body.token) {
        Supplier.findOne({ token: req.body.token }, function (err, thesupplier) {
            if (thesupplier) {
                //console.log(thesupplier);
                //console.log(req.body);
                Item.findOneAndUpdate({ item_id: req.body.item_id, supplier_id: thesupplier._id }, {
                    itemName: req.body.itemName,
                    itemBrand: req.body.itemBrand,
                    visitorPrice: req.body.visitorPrice,
                    itemPrice: req.body.itemPrice,
                    itemDescription: req.body.itemDescription
                }, {
                        "fields": "itemName itemBrand visitorPrice itemPrice itemDescription",
                        new: true
                    }, function (err, item) {
                        if (err) {
                            console.log(error);
                            return next(error);
                        } else {
                            return res.json({ Message: strings.item_updated });
                        }
                    })
            } else {
                res.json({ Error: strings.user_not_found })
            }
        })
    } else {
        res.json({ Error: strings.user_not_found })
    }

})



router.post('/delete', function (req, res) {
    if (req.body.token && req.body.item_id) {
        Supplier.findOne({ token: req.body.token },
            function (err, supplier) {
                //console.log(supplier);
                if (err) {
                    console.log(err);
                }
                if (supplier) {
                    Item.findOne({ item_id: req.body.item_id, supplier_id: supplier._id },
                        function (err, item) {
                            if (item) {
                                //console.log(item.users);
                                if (item.users && item.users.length > 0) {
                                    res.json({ Error: strings.item_has_order })
                                } else {
                                    Supplier.update({ token: req.body.token },
                                        { $pull: { items: { submitted: item._id } } },
                                        function (err, del) {
                                            if (err) {
                                                console.log(err);
                                            } else {
                                                Item.remove({ item_id: req.body.item_id, supplier_id: supplier._id },
                                                    function (err) {
                                                        if (err) {
                                                            console.log(err);
                                                        } else {
                                                            res.json({ Message: strings.item_removed });
                                                        }
                                                    }
                                                )
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
        Supplier.find({ token: req.body.token }, 'mobile name family supportbrands shopphone items',
            function (err, supplier) {
                if (err) {
                    console.log(err);
                }
            }).populate('items.submitted', '-_id item_id itemName itemBrand itemPrice visitorPrice itemDescription')
            .exec(function (err, items) {
                if (err) {
                    console.log(err);
                }
                //console.log(items);
                if (items.length > 0) {
                    items[0].items.sort(compare);
                    return res.json(items);
                }
            });
    } else {
        res.json({ Error: strings.user_not_found })
    }
});

router.post('/supplierSearchItems', function (req, res) {
    if (req.body.token) {
        var regex = new RegExp(req.body.query, 'i');
        Supplier.find({ token: req.body.token }, 'mobile name family shopname shopphone items',
            function (err, supplier) {
                if (err) {
                    console.log(err);
                }
            }).populate({
                path: 'items.submitted', select: '-_id item_id itemName itemBrand itemPrice visitorPrice itemDescription',
                //match: { $text: { $search: req.body.query } }
                match: {
                    $or: [
                        { 'itemName': regex },
                        { 'itemBrand': regex },
                        { 'itemDescription': regex }
                    ]
                }
            }).exec(function (err, items) {
                if (err) {
                    console.log(err);
                }
                //null items
                if (items && items.length > 0) {
                    for (var i = 0; i < items.length; i++) {
                        for (var j = 0; j < items[i].items.length; j++) {
                            if (items[i].items[j].submitted != null) {
                            } else {
                                delete items[i].items[j];
                            }
                        }
                    }
                    //remove nulls
                    for (var i = 0; i < items.length; i++) {
                        items[i].items = items[i].items.filter(function (item) {
                            return item !== null
                        })
                    }
                    return res.json(items);
                }
            });
    } else {
        res.json({ Error: strings.user_not_found })
    }
});


router.post('/userItems', function (req, res) {
    if (req.body.token) {
        User.find({ token: req.body.token }, 'user_id suppliers', function (err, user) {
            if (err) {
                console.log(err);
            }
        }).populate({
            path: 'suppliers.presentedBy', select: '-_id mobile name family shopname shopphone items',
            populate: {
                path: 'items.submitted',
                select: '-_id item_id itemName itemBrand itemPrice visitorPrice itemDescription'
            }
        })
            .exec(function (err, items) {
                if (err) {
                    console.log(err);
                }
                if (items.length > 0) {
                    //console.log(items[0].suppliers);
                    items[0].suppliers.sort(compare);
                    return res.json(items);
                }
            });
    } else {
        res.json({ Error: strings.user_not_found })
    }
});


router.post('/userSearchItem', function (req, res) {
    if (req.body.token) {
        var regex = new RegExp(req.body.query, 'i');
        User.find({ token: req.body.token }, 'user_id', function (err, user) {
            if (err) {
                console.log(err);
            }
        }).populate({
            path: 'suppliers.presentedBy', select: '-_id mobile name family shopname shopphone items',
            populate: {
                path: 'items.submitted', select: '-_id item_id itemName itemBrand itemPrice visitorPrice itemDescription',
                match: {
                    $or: [
                        { 'itemName': regex },
                        { 'itemBrand': regex },
                        { 'itemDescription': regex }
                    ]
                }
                //match: { $text: { $search: req.body.query } },
            }
        }).exec(function (err, items) {
            if (err) {
                console.log(err);
            }
            //console.log(items);
            //null items
            if (items && items.length > 0) {
                for (var i = 0; i < items.length; i++) {
                    for (var f = 0; f < items[i].suppliers.length; f++) {
                        for (var j = 0; j < items[i].suppliers[f].presentedBy.items.length; j++) {
                            if (items[i].suppliers[f].presentedBy.items[j].submitted != null) {
                            } else {
                                delete items[i].suppliers[f].presentedBy.items[j];
                            }
                        }
                    }
                }
                //remove nulls
                for (var i = 0; i < items.length; i++) {
                    for (var f = 0; f < items[i].suppliers.length; f++) {
                        items[i].suppliers[f].presentedBy.items = items[i].suppliers[f].presentedBy.items.filter(function (item) {
                            return item !== null
                        })
                    }
                }
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

function compare(a, b) {
    if (a.createTime < b.createTime)
        return 1;
    if (a.createTime > b.createTime)
        return -1;
    return 0;
}

module.exports = router;