var mongoose = require('mongoose');
var strings = require('../../resources/strings');


var ItemSchema = new mongoose.Schema({
  item_id: {
    type: Number,
    required: true,
    unique: true,
    index: true
  },
  supplier_id: {
    type: String,
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
  itemPrice: {
    type: String,
  },
  itemDescription: {
    type: String,
  },
});

ItemSchema.methods.toJSON = function () {
  var obj = this.toObject()
  delete obj.item_id
  delete obj._id
  return obj
}


var Item = mongoose.model('Item', ItemSchema);

module.exports = Item;