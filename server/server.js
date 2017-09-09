var express = require('express');
var bodyParser = require('body-parser');

var {mongoose} = require('./db/mongoose');
var {Todo} = require('./models/todo');
var {User} = require('./models/user');

//model of our todo database


// var newTodo = new Todo({
//     text: 'Cook dinner'
// });

// newTodo.save().then((doc) => {
//     console.log('Saved todo', doc);
// }, (e) => {
//     console.log('Unable to save todo');
// });

// var newTodo = new Todo({
//     text: 'Code and learn everyday',
//     completed: true,
//     completedAt: 530
// });

// newTodo.save().then((doc) => {
//     console.log('Todo saved: ', newTodo);
// },(e) => {
//     console.log('Error: ', e);
// });

var app = express();

app.use(bodyParser.json());

//PUT resource creation
app.post('/todos', (req, res) => {
    var todo = new Todo({
        text: req.body.text
    });
    todo.save().then((doc) => {
        res.send(doc);
    }, (e) => {
        res.status(400).send(e);
    });
});




app.listen(3000, () => {
    console.log('Started on port 3000');
});