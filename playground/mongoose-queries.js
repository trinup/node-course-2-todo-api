const {ObjectID} = require('mongodb');
const {mongoose} = require('./../server/db/mongoose');
const {Todo} = require('./../server/models/todo');
const {User} = require('./../server/models/user');


var id = '59b3ca768f1dbdb84ecff256';

var userID = '59b3765efe9fa27832d998d8';

// if(!ObjectID.isValid(id)){
//     console.log('ID not valid');
// }

// Todo.find({
//     _id: id
// }).then((todos) => {
//     console.log('Todos: ', todos);
// });
//
// Todo.findOne({
//     _id: id
// }).then((todo) => {
//     console.log('Todo: ', todo);
// });

// Todo.findById(id).then((todo) => {
//     if(!todo){
//         return console.log('Id not found')
//     }
//     console.log('Todo by id: ', todo);
// }).catch((e) => console.log(e));






User.findById(userID).then((user) =>{
    if(!user){
        return console.log("No user found with this ID");
    }
    console.log('User: ',user);
}).catch((e) => console.log(e));