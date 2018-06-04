var mongoose = require('mongoose');
var strings = require('../../resources/strings');
var searchPlugin = require('mongoose-search-plugin');

var ItemSchema = new mongoose.Schema({
  schema_version: {
    type: Number,
    required: true,
  },
  item_id: {
    type: Number,
    required: true,
    unique: true,
    index: true
  },
  supplier_id: {
    type: mongoose.Schema.Types.ObjectId, ref: 'Supplier'
  },
  createTime: {
    type: Date,
    required: true,
  },
  itemName: {
    type: String,
  },
  itemBrand: {
    type: String,
  },
  visitorPrice: {
    type: String,
  },
  itemPrice: {
    type: String,
  },
  itemUnitCount: {
    type: String,
  },
  itemUnit: {
    type: String,
  },
  is_gift: {
    type: Boolean,
  },
  is_check_ok: {
    type: Boolean,
  },
  is_cash_discount: {
    type: Boolean,
  },
  is_pos_discount: {
    type: Boolean,
  },
  is_garbage_collect: {
    type: Boolean,
  },
  itemGiftBaseUnit: {
    type: String,
  },
  itemGiftBaseCount: {
    type: String,
  },
  itemGiftUnit: {
    type: String,
  },
  itemGiftCount: {
    type: String,
  },
  cashDiscount: {
    type: String,
  },
  posDiscount: {
    type: String,
  },
  minFactor: {
    type: String,
  },
  img:
    {
      data: Buffer,
      contentType: String
    }
  ,
  itemDescription: {
    type: String,
  },
  users: [{ createTime: Date, orderedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' } }],
});

ItemSchema.methods.toJSON = function () {
  var obj = this.toObject()
  delete obj._id
  return obj
}

ItemSchema.index({ itemName: 'text', itemBrand: 'text', itemDescription: 'text' });

var Item = mongoose.model('Item', ItemSchema);

module.exports = Item;