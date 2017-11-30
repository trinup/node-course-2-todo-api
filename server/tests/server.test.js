const expect = require('expect');
const request = require('supertest');
const {ObjectID} = require('mongodb');
const _ = require('lodash');

const {app} = require('./../server');
const {Todo} = require('./../models/todo');
const {User} = require('./../models/user');
const {todos, populateTodos, users, populateUsers} = require('./seed/seed');

var id;
//seed data


//lifecycle method    
beforeEach(populateUsers);
beforeEach(populateTodos);

describe('POST /todos', () => {
    it('should create a new todo', (done) => {
        var text = 'Test todo text';
        request(app)
        .post('/todos')
        .send({text})
        .expect(200)
        .expect((res) => {
            expect(res.body.text).toBe(text)
        })
        .end((err, res) => {
            if(err) {
                return done(err);
            }
            Todo.find({text}).then((todos) => {
                expect(todos.length).toBe(1);
                expect(todos[0].text).toBe(text);
                done();
            }).catch((e) => done(e));
        });
    });

    it('should not create todo with invalid body data', (done) => {
        var text = '';
        request(app)
        .post('/todos')
        .send({text})
        .expect(400)
        .end((err, res) => {
            if(err) {
                return done(err);
            }
            Todo.find().then((todos) => {
                expect(todos.length).toBe(2);
                done();
            }).catch((e) => done(e));
        });
    });
});

describe('GET /todos', () => {
    it('should get all todos', (done) => {
        request(app)
        .get('/todos')
        .expect(200)
        .expect((res) => {
            expect(res.body.todos.length).toBe(2);
        })
        .end(done);
    });
});

describe('GET /todos/:id', () => {
    it('should get the correct todo', (done) => {
        let todo = {text: 'First test todo'};
        Todo.findOne(todo).then((item) => {
            id = item._id;
            let url = `/todos/${id.toHexString()}`;
            return url;
        }).then((url) => {
            request(app)
                .get(url)
                .expect(200)
                .expect((res) => {
                    expect(res.body.todos.text).toBe(todos[0].text);
                })
                .end(done);
        }).catch((e) => console.log("Error:", e));
    });


    it('should give 400 for invalid ID', (done) => {
        let id = "abc";
        request(app)
            .get(`/todos/${id}`)
            .expect(404)
            .end(done);
    });

    it('should give 404 for valid ID which is not in database', (done) => {
        request(app)
            .get(`/todos/${id}`)
            .expect(404)
            .end(done);
    });

});

describe('DELETE /todos/:id', () => {
    it('should remove a todo', (done) => {
        var todo = {text: 'First test todo'};
        Todo.findOne(todo).then((item) => {
            let id = item._id;
            return id.toHexString();
        }).then((id) => {
            request(app)
            .delete(`/todos/${id}`)
            .expect(200)
            .expect((res) => {
                expect(res.body.todo.text).toBe("First test todo");
        })
        .end((err, res) => {
            if (err) {
                return done(err);
            }
            Todo.findById(id).then((todo) => {
                expect(todo).toNotExist();
                done();
            }).catch((e) => done(e));
        });
    });
});

    it('Should return 404 if todo not found', (done) => {
        let newID = new ObjectID().toHexString();
        request(app)
        .delete(`/todos/${newID}`)
        .expect(404)
        .end(done);
    });

    it('Should return 404 if object id is invalid', (done) => {
        request(app)
        .delete('/todos/abc')
        .expect(404)
        .end(done);
    });
});

describe('PATCH /todos/:id', () => {
    it("Should update the todo", (done) => {
        let updatedObj = {
            text: 'Updated first test todo',
            completed: true
        };
        let todo = {text: 'First test todo'};
        Todo.findOne(todo).then((item) => {
            id = item._id;
            var url = `/todos/${id.toHexString()}`;
            return url;
        }).then((url) => {
            request(app)
            .patch(url)
            .send(updatedObj)
            .expect(200)
            .expect((res) => {
                expect(res.body.todo.text).toBe(updatedObj.text);
                expect(res.body.todo.completed).toBe(true);
                expect(res.body.todo.completedAt).toBeA('number');
            })
            .end(done);
        });
    });

    it("Should clear completedAt when todo is not completed", (done) => {
        let updatedObj = {
            text: 'Updated second test todo',
            completed: false
        };
        let todo = {text: 'Second test todo'};
        Todo.findOne(todo).then((item) => {
            id = item._id;
            var url = `/todos/${id.toHexString()}`;
            return url;
        }).then((url) => {
            request(app)
            .patch(url)
            .send(updatedObj)
            .expect(200)
            .expect((res) => {
                expect(res.body.todo.text).toBe(updatedObj.text);
                expect(res.body.todo.completed).toBe(false);
                expect(res.body.todo.completedAt).toNotExist();
            })
            .end(done);
        });
    });
});


describe("GET /users/me", () => {
    it("Should return user if authenticated", (done) => {
        request(app)
        .get('/users/me')
        .set('x-auth', users[0].tokens[0].token)
        .expect(200)
        .expect((res) => {
            expect(res.body._id).toBe(users[0]._id.toHexString());
            expect(res.body.email).toBe(users[0].email);
        })
        .end(done);
    });

    it("Should return 401 if not authenticated", (done) => {
        request(app)
        .get('/users/me')
        .expect(401)
        .expect((res) => {
            expect(res.body).toEqual({});
        })
        .end(done);
    });
});

describe("POST /users", () => {
    it("Should create a user", (done) => {
        const newUser = {
            email: 'testEmail@example.com',
            password: 'testPassword"'
        };
        request(app)
        .post('/users')
        .send(newUser)
        .expect(200)
        .expect((res) => {
            expect(res.headers['x-auth']).toExist();
            expect(res.body.email).toBe(newUser.email)
            expect(res.body._id).toExist();
        })
        .end((err) => {
            if (err) {
                return done(err);
            }
            User.findOne({email: newUser.email}).then((user) => {
                expect(user).toExist();
                expect(user.password).toNotBe(newUser.password);
                done();
            }).catch((e) => done(e));
        });
    });

    it("Should return validation errors if request invalid", (done) => {
        const newUser = {
            email: 'testEmail@example.com',
            password: 'test'
        };
        request(app)
        .post('/users')
        .send(newUser)
        .expect(400)
        .expect((res) => {
            expect(res.headers['x-auth']).toNotExist();
            expect(res.body.errors).toExist();
        })
        .end(done);
    });

    it("Should not create user if email in use", (done) => {
        const newUser = _.pick(users[0], ["email", "password"]);
        request(app)
        .post('/users')
        .send(newUser)
        .expect(400)
        .expect((res) => {
            expect(res.headers['x-auth']).toNotExist();
            expect(res.body.errmsg).toExist();
        })
        .end(done);
    });
});

describe("POST /users/login", () => {
    const newUser = _.pick(users[0], ["email", "password"]);
    it("Should login a valid user and return auth token", (done) => {
        request(app)
        .post('/users/login')
        .send(newUser)
        .expect(200)
        .expect((res) => {
            expect(res.headers['x-auth']).toExist();
            expect(res.body.email).toBe(newUser.email);
        })
        .end((e, res) => {
            if (e) {
                return done(e);
            }
           User.findById(users[0]._id).then((user) => {
               console.log(user.tokens);
               expect(user.tokens[0]).toInclude({
                   access: 'auth',
                   token: res.headers['x-auth']
               });
               done();
           }).catch((e) => done(e)); 
        });
    });

    it("Should not login for invalid user", (done) => {
        newUser.password = "wrongpassword";
        request(app)
        .post('/users/login')
        .send(newUser)
        .expect(400)
        .expect((res) => {
            expect(res.headers['x-auth']).toNotExist();
        })
        .end(done);
    });
});

describe("DELETE /users/me/token", () => {
    it('should remove auth token on logout', (done) => {
        request(app)
        .delete('/users/me/token')
        .set('x-auth', users[0].tokens[0].token)
        .expect(200)
        .end((err) => {
            if (err) {
                return done(err);
            }
            User.findById(users[0]._id).then(user => {
                expect(user.tokens.length).toBe(0);
                done();
            }).catch((e) => done(e));
        });
    });
});