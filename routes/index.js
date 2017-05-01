const express = require('express');
const router = express.Router();
const knex = require('../db/db');
const jwt = require('jsonwebtoken');
const middleware = require('../middleware/index');
const { SHA256 } = require('crypto-js');

router.get('/', (req, res, next) => {
    res.send('Dashboard');
});
router.post('/login', middleware.validateLoginInput, (req, res, next) => {
    let email = req.body.email;
    let password = SHA256(req.body.password + email).toString();
    knex('users').where('email', email).first()
        .then((user) => {
            if (!user) {
                throw new Error('Email is incorrect');
            } else if (user.password === password) {
                let token = jwt.sign(user, 'supersecret', { expiresIn: '24h' });
                return token;
            } else {
                throw new Error('Password is incorrect');
            }
        })
        .then((token) => {
            res.send({ token });
        }, (err) => {
            res.send({ message: err.message });
        })
});
router.post('/register', middleware.validateRegisterInput, (req, res, next) => {
    knex('users').where('email', req.body.email).first()
        .then((user) => {
            if (user) {
                throw new Error('User already exists');
            }
            return knex('users').insert({
                name: req.body.name,
                email: req.body.email,
                password: SHA256(req.body.password + req.body.email).toString()
            }).returning('*')
        })
        .then((user) => {
            let token = jwt.sign(user[0], 'supersecret', { expiresIn: '24h' });
            return token;
        })
        .then((token) => {
            res.send({ token });
        })
        .catch((err) => {
            res.send({ message: err.message });
        })
})

module.exports = router;