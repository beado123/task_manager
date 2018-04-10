// Load required packages
var mongoose = require('mongoose');
// var ObjectId = mongoose.Schema.Types.ObjectId;
// Define our beer schema
var UserSchema   = new mongoose.Schema({
  // _id: ObjectId,
  name: String,
  email: String,
  pendingTasks: [String],
  dateCreated: Date
});

// Export the Mongoose model
module.exports = mongoose.model('User', UserSchema);
