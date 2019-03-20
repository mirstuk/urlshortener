const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const UrlSchema = new Schema({
  url: {
    type: String,
    required: true
  },
  short: {
    type: String,
    required: true,
    unique: true
  }
});

module.exports = Url = mongoose.model('url', UrlSchema);
