require('./config/config');

const _ = require('lodash');
var express = require('express');
var bodyParser = require('body-parser');
var bcrypt = require('bcryptjs');
var {ObjectID} = require('mongodb');
var {mongoose} = require('./db/mongoose');
var {Todo} = require('./models/todo');
var {User} = require('./models/user');
var {authenticate} = require('./middleware/authenticate');

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
const port = process.env.PORT;

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

app.get('/todos', (req, res) => {
    Todo.find().then((todos) => {
        res.send({
            todos
        });
    }, (err) => {
        res.status(400).send(e);
    });
});

app.get('/todos/:id', (req, res) => {
    var id = req.params.id;
    if(!ObjectID.isValid(id)){
        return res.status(404).send({error: 'Not a valid ID'});
    }
    Todo.findById(id).then((todos) => {
        if(!todos){
            return res.status(404).send({error: 'Cannot find the todo for this ID'});
        }
        res.send({todos});
        // console.log('The to do note is: ', {todos});
    }).catch((e) => res.status(400).send());
});


app.delete('/todos/:id', (req, res) => {
    var id = req.params.id;
    if(!ObjectID.isValid(id)){
        return res.status(404).send();
    }
    Todo.findByIdAndRemove(id).then((result) => {
        if (!result) {
            res.status(404).send();
        }
        res.send({todo: result});
    }).catch((e) => res.status(400).send());
});

app.patch('/todos/:id', (req, res) => {
    var id = req.params.id;
    var body = _.pick(req.body, ['text', 'completed']);
    if(!ObjectID.isValid(id)){
        return res.status(404).send();
    }
    if (_.isBoolean(body.completed) && body.completed){
        body.completedAt = new Date().getTime();
    }else{
        body.completed = false;
        body.completedAt = null;
    }
    Todo.findByIdAndUpdate(id, {$set: body}, {new: true}).then((todo) => {
        if (!todo) {
            return res.status(404).send();
        }
        res.send({todo})
    }).catch((e) => {
        res.status(400).send();
    });
});

app.post('/users', (req, res) => {
    const body = _.pick(req.body, ["email", "password"]);
    const user = new User(body);
    user.save().then((user) => {
        return user.generateAuthToken();
    }).then((token) => res.header('x-auth', token).send(user)).catch((e) => res.status(400).send(e));
});



app.get('/users/me', authenticate, (req, res) => {     //private route, needs authentication
   res.send(req.user);
});


app.post('/users/login', (req, res) => {
    const body = _.pick(req.body, ["email", "password"]);
    
    User.findByCredentials(body.email, body.password).then((user) => {
        return user.generateAuthToken().then((token) => {
            res.header('x-auth', token).send(user);
        });
    }).catch((e) => {
        res.status(400).send();
    });
});

app.delete('/users/me/token', authenticate, (req, res) => {
    req.user.removeToken(req.token).then(() => {
        res.status(200).send();
    }, () => {
        res.status(400).send();
    });
});


app.listen(port, () => {
    console.log(`Started on port ${port}`);
});

module.exports = {app};