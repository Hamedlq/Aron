var express = require('express');
var strings = require('../../resources/strings');
var router = express.Router();
var Item = require('./item');
var Supplier = require('../supplier/supplier');
var User = require('../user/user');
var fs = require('fs');
var multer = require('multer')

var upload = multer({ storage: multer.memoryStorage() });

router.post('/insertItem', upload.single('upload'), (req, res) => {

    console.log(req.file);
    if (req.body.token) {
        Supplier.findOne({ token: req.body.token.replace(/['"]+/g, '') }, function (err, thesupplier) {
            if (thesupplier) {
                getItemId(function (randId) {
                    var date = new Date();
                    var image = {
                        data: req.file.buffer,
                        contentType: 'image/png'
                    }
                    var itemData = {
                        schema_version: 1,
                        item_id: randId,
                        supplier_id: thesupplier._id,
                        createTime: date,
                        itemName: req.body.itemName.replace(/['"]+/g, ''),
                        itemBrand: req.body.itemBrand.replace(/['"]+/g, ''),
                        itemDescription: req.body.itemDescription.replace(/['"]+/g, ''),
                        img: image,
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
                                    return res.json({ Message: item });
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


router.post('/insertItemNoImage', function (req, res, next) {
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
                                    return res.json({ Message: item });
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


router.get('/itemImage', function (req, res) {
    if (req.query.item_id) {
        Item.findOne({ item_id: req.query.item_id},
            function (err, item) {
                if (item) {
                    res.contentType('image/jpeg');
                    res.send(item.img.data);
                }
            }
        )
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
                if (items.length > 0) {
                    var obj = items[0].toObject();
                    for(var i=0; i<obj.items.length; i++){
                        obj.items[i].submitted['itemImage']=global.Host + "/v1/item/itemImage?item_id=" + obj.items[i].submitted.item_id;
                        //console.log(obj.items[i].submitted.itemImage);
                    }
                    obj.items.sort(compare); 
                    return res.json(obj);
                }
            });
    } else {
        res.json({ Error: strings.user_not_found })
    }
});


router.post('/updateItem', function (req, res, next) {
    if (req.body.token) {
        Supplier.findOne({ token: req.body.token }, function (err, thesupplier) {
            if (thesupplier) {
                //console.log(thesupplier);
                //console.log(req.body);
                Item.findOneAndUpdate({ item_id: req.body.item_id, supplier_id: thesupplier._id }, {
                    itemName: req.body.itemName,
                    itemBrand: req.body.itemBrand,
                    itemDescription: req.body.itemDescription
                }, {
                        "fields": "itemName itemBrand visitorPrice itemPrice itemDescription",
                        new: true
                    }, function (err, item) {
                        if (err) {
                            console.log(error);
                            return next(error);
                        } else {
                            return res.json({ Message: item });
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


router.post('/updateItemPrice', function (req, res, next) {
    if (req.body.token) {
        Supplier.findOne({ token: req.body.token }, function (err, thesupplier) {
            if (thesupplier) {
                //console.log(thesupplier);
                //console.log(req.body);
                Item.findOneAndUpdate({ item_id: req.body.item_id, supplier_id: thesupplier._id }, {
                    itemUnit: req.body.itemUnit,
                    itemUnitCount: req.body.itemUnitCount,
                    itemPrice: req.body.itemPrice,
                    visitorPrice: req.body.itemVisitorPrice,
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


router.post('/updateItemOptions', function (req, res, next) {
    if (req.body.token) {
        Supplier.findOne({ token: req.body.token }, function (err, thesupplier) {
            if (thesupplier) {
                //console.log(thesupplier);
                //console.log(req.body);
                Item.findOneAndUpdate({ item_id: req.body.item_id, supplier_id: thesupplier._id }, {
                    itemGiftBaseUnit: req.body.itemGiftBaseUnit,
                    itemGiftBaseCount: req.body.itemGiftBaseCount,
                    itemGiftUnit: req.body.itemGiftUnit,
                    itemGiftCount: req.body.itemGiftCount,
                    cashDiscount: req.body.cashDiscount,
                    posDiscount: req.body.posDiscount,
                    minFactor: req.body.minFactor,
                    is_gift: req.body.is_gift,
                    is_check_ok: req.body.is_check_ok,
                    is_cash_discount: req.body.is_cash_discount,
                    is_pos_discount: req.body.is_pos_discount,
                    is_garbage_collect: req.body.is_garbage_collect,

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