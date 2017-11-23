var mongoose = require('mongoose');

mongoose.Promise = global.Promise;
mongoose.connect(process.env.MONGODB_URI);  //connect mongoose to mongoDB database


module.exports = {
    mongoose
};