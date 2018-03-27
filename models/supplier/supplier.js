var mongoose = require('mongoose');

var SupplierSchema = new mongoose.Schema({

  refercode: {
    type: String,
    required: true,
    trim: true
  },
  introducecode: {
    type: String,
    required: true,
    trim: true,
    unique:true
  },
  mobile: {
    type: String,
    unique: true,
    required: true,
    trim: true
  },
  createTime:{
    type:Date,
    required:true,
  }

});

var Supplier = mongoose.model('Supplier', SupplierSchema);

module.exports = Supplier;