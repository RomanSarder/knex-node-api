const validator = require('validator');

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

module.exports = {
    validateRegisterInput,
    validateLoginInput
}