var mongoose = require('mongoose');
var User = require('../user/user');
var Item = require('../item/item');
var strings = require('../../resources/strings');


var SupplierSchema = new mongoose.Schema({
  schema_version:{
    type:  Number,
    required: true,
  },
  supplier_id: {
    type: Number,
    required: true,
    unique: true,
    index: true
  },
  token: {
    type: String,
    unique: true,
    index: true
  },
  ostoken: {
    type: String,
  },
  introducecode: {
    type: String,
    trim: true,
    unique: true
  },
  refercode: {
    type: String,
    required: true,
    trim: true
  },
  mobile: {
    type: String,
    unique: true,
    required: true,
    trim: true,
    validate: {
      validator: function (v) {
        return /^09[0-9]*/.test(v);
      },
      message: 'شماره موبایل با ۰۹ آغاز می‌شود'
    },
    validate: {
      validator: function (v) {
        return v.length == 11;
      },
      message: 'شماره موبایل ۱۱ عدد می‌باشد'
    },
  },
  createTime: {
    type: Date,
    required: true,
  },
  smscount: {
    type: Number,
  },
  name: {
    type: String,
  },
  family: {
    type: String,
  },
  address: {
    type: String,
  },
  propertytype: {
    type: String,
  },
  shopname: {
    type: String,
  },
  supportbrands: {
    type: String,
  },
  shopphone: {
    type: String,
  },
  shoplat: {
    type: String,
  },
  shoplng: {
    type: String,
  },
  users: [{createTime: Date, present:{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }}],
  items: [{createTime: Date, submitted:{ type: mongoose.Schema.Types.ObjectId, ref: 'Item' }}],
});

SupplierSchema.methods.toJSON = function () {
  var obj = this.toObject()
  delete obj.supplier_id
  delete obj._id
  delete obj.token
  return obj
}


var Supplier = mongoose.model('Supplier', SupplierSchema);

module.exports = Supplier;