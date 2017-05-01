const express = require('express');
const router = express.Router();
const knex = require('../db/db');
const middleware = require('../middleware/index');

router.get('/:id', (req, res, next) => {
    res.send('GET route for one item')
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
router.post('/', middleware.isLogged, (req, res, next) => {
    let { name, number, state } = req.body;
    let logs = JSON.stringify([{
        action: 'Create',
        time: new Date().getTime()
    }]);
    knex('items').insert({
            name,
            number,
            state,
            logs
        }).returning('*')
        .then((item) => {
            res.send(item[0]);
        })
        .catch((err) => {
            next(err);
        })
});
router.patch('/:id', (req, res, next) => {
    res.send('PATCH route for one item');
});
router.delete('/:id', (req, res, next) => {
    res.send('DEL route for one item');
})

module.exports = router;