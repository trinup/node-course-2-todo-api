var mongoose = require('mongoose');

mongoose.Promise = global.Promise;
mongoose.connect("mongodb://punit:punit@ds113736.mlab.com:13736/todo-api-db" || 'mongodb://localhost:27017/TodoApp');  //connect mongoose to mongoDB database


module.exports = {
    mongoose
};