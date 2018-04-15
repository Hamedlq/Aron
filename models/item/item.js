var mongoose = require('mongoose');
var strings = require('../../resources/strings');
var searchPlugin = require('mongoose-search-plugin');

var ItemSchema = new mongoose.Schema({
  schema_version:{
    type:  Number,
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

  itemDescription: {
    type: String,
  },
  users: [{createTime:Date,orderedBy:{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }}],
});

ItemSchema.methods.toJSON = function () {
  var obj = this.toObject()
  delete obj._id
  return obj
}

ItemSchema.index({ itemName: 'text', itemBrand:'text', itemDescription: 'text'});

var Item = mongoose.model('Item', ItemSchema);

module.exports = Item;