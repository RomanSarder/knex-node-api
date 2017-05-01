process.env.NODE_ENV = 'test';

const chai = require('chai');
const should = chai.should();
const expect = chai.expect;
const chaiHttp = require('chai-http');
const server = require('../index');
const { SHA256 } = require('crypto-js');
const knex = require('../db/db');
const jwt = require('jsonwebtoken');

chai.use(chaiHttp);

describe('API routes', () => {
    beforeEach(function(done) {
        knex.migrate.rollback().then(function() {
            knex.migrate.latest().then(function() {
                return knex.seed.run().then(function() {
                    done();
                });
            });
        });
    });

    afterEach(function(done) {
        knex.migrate.rollback()
            .then(function() {
                done();
            });
    });
    describe('POST /register', () => {
        it('Should register user and return token', (done) => {
            let response;
            chai.request(server).post('/api/register')
                .send({
                    name: 'Roman',
                    email: 'roman.sarder@yandex.ru',
                    password: '1234'
                })
                .then((res) => {
                    res.should.have.status(200);
                    res.should.be.json;
                    res.body.should.be.a('object');
                    res.body.should.have.property('token');
                    res.body.token.should.be.a('string');
                    response = res;

                }).then(() => {
                    return knex('users').where('email', 'roman.sarder@yandex.ru').first()
                }).then((user) => {
                    let token = jwt.sign(user, 'supersecret', { expiresIn: '24h' });
                    response.body.token.should.equal(token);
                    user.name.should.equal('Roman');
                    user.email.should.equal('roman.sarder@yandex.ru');
                    user.password.should.equal(SHA256('1234' + user.email).toString());
                    done();
                }).catch(done);
        });
        it('Should not register user if user exists', (done) => {
            chai.request(server).post('/api/register')
                .send({
                    name: 'Roman',
                    email: 'roman@ya.ru',
                    password: '123'
                })
                .then((res) => {
                    res.should.have.status(200);
                    res.body.should.not.have.property('token');
                    res.body.should.have.property('message');
                    res.body.message.should.be.a('string');
                }).then(() => {
                    return knex('users').where('email', 'roman@ya.ru').select()
                }).then((users) => {
                    users.length.should.equal(1);
                    users[0].password.should.equal(SHA256('123' + 'roman@ya.ru').toString());
                    users[0].name.should.equal('Roman');
                    done();
                })
                .catch(done);
        });
    });
    describe('POST /login', () => {
        it('it should return token if user exists in db', (done) => {
            let response;
            chai.request(server).post('/api/login')
                .send({
                    email: 'roman@ya.ru',
                    password: '123'
                })
                .then((res) => {
                    res.should.have.status(200);
                    res.body.should.have.property('token');
                    res.body.token.should.be.a('string');
                    response = res;
                    return knex('users').where('email', 'roman@ya.ru').first()
                })
                .then((user) => {
                    let token = jwt.sign(user, 'supersecret', { expiresIn: '24h' });
                    response.body.token.should.equal(token);
                    done();
                })
                .catch(done);
        });
        it('should return message if invalid data', (done) => {
            chai.request(server).post('/api/login')
                .send({
                    email: '123',
                    password: ''
                }).then((res) => {
                    res.should.have.status(200);
                    res.body.should.have.property('message');
                    res.body.should.not.have.property('token');
                    res.body.message.should.be.a('string');
                    done()
                }).catch(done)
        });
    });
    describe('GET /items', () => {
        it('should return all existing items from db', (done) => {
            chai.request(server).get('/api/items')
                .then((res) => {
                    res.body.length.should.equal(3);
                    res.body[0].name.should.equal('Notebook');
                    res.body[0].number.should.equal(12);
                    res.body[0].author_id.should.equal(1);
                    res.body[0].logs.should.be.a('object');
                    res.body[0].state.should.equal(1);
                    res.body[1].name.should.equal('Gyroscooter');
                    res.body[1].number.should.equal(2);
                    res.body[1].author_id.should.equal(2);
                    res.body[1].logs.should.be.a('object');
                    res.body[1].state.should.equal(0);
                    res.body[2].name.should.equal('Macbook');
                    res.body[2].number.should.equal(5);
                    res.body[2].author_id.should.equal(3);
                    res.body[2].logs.should.be.a('object');
                    res.body[2].state.should.equal(1);
                    done();
                }).catch(done);
        });
    });
    describe('POST /items', () => {
        it('should save item to db and return it if valid token provided', (done) => {
            let item = {
                name: 'Bike',
                number: 13,
                state: 0
            };
            chai.request(server).post('/api/items')
                .send({
                    name: item.name,
                    number: item.number,
                    state: item.state,
                    token: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1aWQiOjEsInBhc3N3b3JkIjoiMThhMDI1YTZmYTZjMmEwNDZmZTM1ZDUyMWNiMjI5ZDM5YjI4NGE5NjdlY2I5ZjJmOGU1MGM1NjM1YTM0YzE0NCIsIm5hbWUiOiJSb21hbiIsImVtYWlsIjoicm9tYW5AeWEucnUiLCJpYXQiOjE0OTM2Mzg3NjksImV4cCI6MTQ5MzcyNTE2OX0.uSpIVTr8FnS6ltX6I53NnbBwAPsLAHOS3XPv0wJhe_Q"
                })
                .then((res) => {
                    res.body.name.should.equal(item.name);
                    res.body.number.should.equal(item.number);
                    res.body.state.should.equal(item.state);
                    res.body.logs.should.be.a('array');
                    res.body.logs[0].should.have.property('action');
                    res.body.logs[0].should.have.property('time');
                    res.body.logs[0].time.should.be.a('number');
                    res.body.logs[0].action.should.be.a('string');
                    done();
                }).catch(done);
        });
        it('should not save item to db and return it if invalid token provided', (done) => {
            let item = {
                name: 'Bike',
                number: 13,
                state: 0
            };
            chai.request(server).post('/api/items')
                .send({
                    name: item.name,
                    number: item.number,
                    state: item.state,
                    token: "adsadafafasfasf131231"
                })
                .then((res) => {
                    res.body.should.have.property('message');
                    res.body.message.should.be.a('string');
                    res.body.message.should.equal('Invalid token provided');
                })
                .then(() => {
                    return knex('items').where('name', item.name).first()
                })
                .then((item) => {
                    expect(item).to.be.a('undefined');
                    done();
                })
                .catch(done);
        });
    });
});