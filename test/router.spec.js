process.env.NODE_ENV = 'test';

const chai = require('chai');
const should = chai.should();
const request = require('supertest');
const expect = chai.expect;
const chaiHttp = require('chai-http');
const server = require('../index');
const { SHA256 } = require('crypto-js');
const knex = require('../db/db');
const jwt = require('jsonwebtoken');
let token;
let sectoken;


describe('API routes', () => {
    beforeEach(function(done) {
        knex.migrate.rollback().then(function() {
            knex.migrate.latest().then(function() {
                return knex.seed.run().then(function() {
                    return knex('users').where('email', 'roman@ya.ru').first()
                        .then((user) => {
                            token = jwt.sign(user, 'supersecret', { expiresIn: '24h' });
                            return knex('users').where('email', 'mike@ya.ru').first();
                        }).then((mike) => {
                            sectoken = jwt.sign(mike, 'supersecret', { expiresIn: '24h' });
                        }).then(() => {
                            done();
                        })
                })

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
            request(server).post('/api/register')
                .send({
                    name: 'Roman',
                    email: 'roman.sarder@yandex.ru',
                    password: '1234'
                })
                .expect(200)
                .then((res) => {
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
            request(server)
                .post('/api/register')
                .send({
                    name: 'Roman',
                    email: 'roman@ya.ru',
                    password: '123'
                })
                .expect(500)
                .then((res) => {
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
            request(server).post('/api/login')
                .send({
                    email: 'roman@ya.ru',
                    password: '123'
                })
                .expect(200)
                .then((res) => {
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
            request(server)
                .post('/api/login')
                .send({
                    email: '123',
                    password: ''
                })
                .expect(500)
                .then((res) => {
                    res.body.should.have.property('message');
                    res.body.should.not.have.property('token');
                    res.body.message.should.be.a('string');
                    done()
                }).catch(done)
        });
    });
    describe('GET /items', () => {
        it('should return all existing items from db', (done) => {
            request(server).get('/api/items')
                .then((res) => {
                    res.body.length.should.equal(3);
                    res.body[0].name.should.equal('Notebook');
                    res.body[0].number.should.equal(12);
                    res.body[0].author_id.should.equal(1);
                    res.body[0].logs.should.be.a('array');
                    res.body[0].state.should.equal(1);
                    res.body[1].name.should.equal('Gyroscooter');
                    res.body[1].number.should.equal(2);
                    res.body[1].author_id.should.equal(2);
                    res.body[1].logs.should.be.a('array');
                    res.body[1].state.should.equal(0);
                    res.body[2].name.should.equal('Macbook');
                    res.body[2].number.should.equal(5);
                    res.body[2].author_id.should.equal(3);
                    res.body[2].logs.should.be.a('array');
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
            request(server).post('/api/items')
                .send({
                    name: item.name,
                    number: item.number,
                    state: item.state,
                    token: token
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
            request(server).post('/api/items')
                .send({
                    name: item.name,
                    number: item.number,
                    state: item.state,
                    token: "adsadafafasfasf131231"
                })
                .expect(500)
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
    describe('GET /items/:id', () => {
        it('should return single item', (done) => {
            request(server).get('/api/items/1')
                .then((res) => {
                    res.body.name.should.equal('Notebook');
                    res.body.number.should.equal(12);
                    res.body.state.should.equal(1);
                    res.body.logs.should.be.a('array');
                    res.body.should.have.property('author_id');
                    done()
                })
                .catch(done);
        });
        it('should return 404 status code for item not found', (done) => {
            request(server)
                .get('/api/items/404')
                .expect(404, done)
        });
    });
    describe('PATCH /items/:id', () => {
        it('should update single item and return it if valid token provided', (done) => {
            request(server)
                .patch('/api/items/2')
                .send({ name: 'Motorcycle', token: sectoken })
                .expect(200)
                .then((res) => {
                    res.body.name.should.equal('Motorcycle');
                    res.body.logs.length.should.equal(1);
                    res.body.number.should.be.a('number');
                    res.body.state.should.be.a('number');
                    res.body.author_id.should.be.a('number');
                    done();
                })
                .catch(done);
        });
        it('should return status code 404 if not found', (done) => {
            request(server)
                .patch('/api/items/40')
                .send({ name: 'Motorcycle', token: sectoken })
                .expect(404)
                .then((res) => {
                    res.body.should.have.property('message');
                    res.body.message.should.be.a('string');
                    done()
                })
                .catch(done)
        })
        it('should not update item if user doesnt own it', (done) => {
            request(server)
                .patch('/api/items/2')
                .send({ name: 'Motorcycle', token: token })
                .expect(403)
                .then((res) => {
                    res.body.should.have.property('message');
                    res.body.message.should.be.a('string');
                    done()
                }).catch(done)
        });
    });
});