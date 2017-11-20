const expect = require('expect');
const request = require('supertest');
const {ObjectID} = require('mongodb');

const {app} = require('./../server');
const {Todo} = require('./../models/todo');

//seed data
const todos = [
    {text: 'First test todo'},
    {text: 'Second test todo'}];

beforeEach((done) => {
    Todo.remove({}).then(() => {
        return Todo.insertMany(todos);
}).then(() => done());
});

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
    it('should get all todos',(done) => {
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
    var id;
    it('should get the correct todo', (done) => {
        var todo = {text: 'First test todo'};
        Todo.findOne(todo).then((item) => {
            id = item._id;
            var url = `/todos/${id.toHexString()}`;
            return url;
        }).then((url) => {
            request(app)
                .get(url)
                .expect(200)
                .expect((res) => {
                    expect(res.body.text).toBe(todos[0].text);
                })
                .end(done);
        }).catch((e) => console.log("Error:", e));
    });


    it('should give 400 for invalid ID', (done) => {
        let id = "abc";
        request(app)
            .get(`/todos/${id}`)
            .expect(400)
            .end(done);
    });

    it('should give 404 for valid ID which is not in database', (done) => {
        request(app)
            .get(`/todos/${id}`)
            .expect(404)
            .end(done);
    });

});