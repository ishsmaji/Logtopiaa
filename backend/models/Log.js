const mongoose = require("mongoose");

const logSchema = new mongoose.Schema({
  timestamp: {
    type: Date,
    required: true,
    default: Date.now
  },
  level: {
    type: String,
    required: true,
    enum: ['info', 'warning', 'error']
  },
  source: {
    type: String,
    required: true
  },
  message: {
    type: String,
    required: true
  },
  details: {
    stack: String,
    metadata: {
      userId: String,
      requestId: String
    }
  }
});

const Log = mongoose.model("Log", logSchema);

module.exports = {
  Log
};