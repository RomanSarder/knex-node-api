const express = require('express');
const router = express.Router();
const knex = require('../db/db');
const middleware = require('../middleware/index');
const jwtMiddleware = require('express-jwt');
const secret = process.env.SECRET || 'supersecret';

router.get('/:id', (req, res, next) => {
    knex('items').where('id', req.params.id).first()
        .then((item) => {
            if (item) {
                res.send(item);
            } else {
                let err = new Error('Not found');
                err.status = 404;
                next(err);
            }
        })
        .catch((err) => {
            next(err);
        })
});
router.get('/', (req, res, next) => {
    knex('items').select()
        .then((items) => {
            res.status(200).json(items);
        }, (err) => {
            err.status = 404;
            next(err);
        })
})
router.post('/', jwtMiddleware({ secret: secret }), (req, res, next) => {
    let { name, number, state } = req.body;
    let logs = JSON.stringify([{
        action: 'Created',
        author: req.user.name,
        time: new Date().getTime()
    }]);
    knex('items').insert({
            name,
            number,
            state,
            logs,
            author_id: req.user.uid
        }).returning('*')
        .then((item) => {
            res.send(item[0]);
        })
        .catch((err) => {
            next(err);
        })
});
router.patch('/:id', jwtMiddleware({ secret: secret }), middleware.isExist, (req, res, next) => {
    knex('items').where('id', req.params.id).first()
        .then((item) => {
            if (!item) {
                let err = new Error('Not Found');
                err.status = 404;
                next(err);
            } else {
                let name = req.body.name || item.name;
                let number = req.body.number || item.number;
                let state = req.body.state || item.state;
                let logs = item.logs;
                logs.push({ action: "Edit", author: req.user.name, time: new Date().getTime() })
                if (req.body.state && req.body.state !== item.state) {
                    logs.push({ action: "State changed", author: req.user.name, time: new Date().getTime() })
                }
                logs = JSON.stringify(logs);
                return knex('items').where('id', req.params.id).update({
                    name,
                    number,
                    state,
                    logs
                }).returning('*')
            }
        })
        .then((updated) => {
            res.send(updated[0]);
        })
        .catch((err) => {
            next(err);
        })
});
router.delete('/:id', jwtMiddleware({ secret: secret }), middleware.isExist, (req, res, next) => {
    knex('items').where('id', req.params.id).del().returning('*')
        .then((deleted) => {
            res.send(deleted)
        })
        .catch((err) => {
            next(err);
        })
})

module.exports = router;