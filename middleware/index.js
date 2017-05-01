const validator = require('validator');
const jwt = require('jsonwebtoken');
const knex = require('../db/db');

let validateRegisterInput = (req, res, next) => {
    let name = req.body.name;
    let email = req.body.email;
    let password = req.body.password;
    if (!validator.isEmail(email)) {
        next(new Error('Invalid email'));
    } else if (validator.isEmpty(name)) {
        next(new Error('Invalid name'));
    } else if (validator.isEmpty(password)) {
        next(new Error('Password is required'))
    } else {
        next();
    }
}
let validateLoginInput = (req, res, next) => {
    let email = req.body.email;
    let password = req.body.password;
    if (!validator.isEmail(email)) {
        next(new Error('Invalid email'));
    } else if (validator.isEmpty(password)) {
        next(new Error('Password is required'))
    } else {
        next();
    }
}
let isLogged = (req, res, next) => {
    jwt.verify(req.body.token, 'supersecret', (err, decoded) => {
        if (err) {
            next(new Error('Invalid token provided'));
        } else {
            knex('users').where('email', decoded.email).first()
                .then((user) => {
                    if (user) {
                        next()
                    } else {
                        next(new Error('You must log in'))
                    }
                })
        }
    })
}

module.exports = {
    validateRegisterInput,
    validateLoginInput,
    isLogged
}