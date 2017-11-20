const expect = require('expect');
const request = require('supertest');
const {ObjectID} = require('mongodb');

const {app} = require('./../server');
const {Todo} = require('./../models/todo');

//seed data
const todos = [
    {   _id: new ObjectID(),
        text: 'First test todo'},
    {   _id: new ObjectID(),
        text: 'Second test todo'}];

//lifecycle method    
beforeEach((done) => {
    Todo.remove({}).then(() => {
        return Todo.insertMany(todos);
}).then(() => done());
});

describe('GET /todos/:id', () => {
    it('Should return valid note for an existing ID', (done) => {
        request(app)
        .get(`/todos/${todos[0]._id.toHexString}`)
        .expect(200)
        .expect((res) => {
            expect(res.body.todo.text).toBe(todos[0].text);
        })
        .end(done());
    });
});