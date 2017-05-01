process.env.NODE_ENV = 'test';

const chai = require('chai');
const should = chai.should();
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
                    let token = jwt.sign(user, user.email, { expiresIn: '24h' });
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
                    let token = jwt.sign(user, user.email, { expiresIn: '24h' });
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
});