var mongoose = require('mongoose');
var strings = require('../../resources/strings');
var Supplier=require('../supplier/supplier');

var UserSchema = new mongoose.Schema({
  schema_version:{
    type:  Number,
    required: true,
  },
  user_id: {
    type:  Number,
    required: true,
    unique: true,
    index:true
  },
  token:{
    type: String,
    unique: true,
    index:true
  },
  ostoken:{
    type: String
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
      validator: function(v) {
        return /09[0-9]*/.test(v);
      },
      message: 'شماره موبایل با ۰۹ آغاز می‌شود'
    },
    validate: {
      validator: function(v) {
        return v.length==11;
      },
      message: 'شماره موبایل ۱۱ عدد می‌باشد'
    },
  },
  createTime:{
    type:Date,
    required:true,
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
  shopphone: {
    type: String,
  },
  shoplat: {
    type: String,
  },
  shoplng: {
    type: String,
  },
  suppliers : [{createTime:Date,presentedBy:{ type: mongoose.Schema.Types.ObjectId, ref: 'Supplier' }}],

  items : [{createTime:Date,ordered:{ type: mongoose.Schema.Types.ObjectId, ref: 'Item' }}]
},{timestamps: true});

UserSchema.methods.toJSON = function() {
  var obj = this.toObject()
  delete obj.user_id
  delete obj._id
  delete obj.token
  return obj
}

var User = mongoose.model('User', UserSchema);

module.exports = User;