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
    // let isLogged = (req, res, next) => {
    //     if (!req.body.token) {
    //         let err = new Error('You must log in');
    //         err.status = 401;
    //         next(err);
    //     }
    //     jwt.verify(req.body.token, secret, (err, decoded) => {
    //         if (err) {
    //             next(new Error('Invalid token provided'));
    //         } else {
    //             knex('users').where('email', decoded.email).first()
    //                 .then((user) => {
    //                     if (user) {
    //                         req.user = user;
    //                         next()
    //                     } else {
    //                         next(new Error('You must log in'))
    //                     }
    //                 })
    //         }
    //     })
    // }
let isExist = (req, res, next) => {
    knex('items').where('id', req.params.id).first()
        .then((item) => {
            if (!item) {
                let error = new Error('Not Found');
                error.status = 404;
                next(error);
            } else {
                next();
            }
        })
}

module.exports = {
    validateRegisterInput,
    validateLoginInput,
    isExist
}