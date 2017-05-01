const express = require('express');
const router = express.Router();
const knex = require('../db/db');

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
router.post('/', (req, res, next) => {
    res.send('Here will be route for creating items');
});
router.patch('/:id', (req, res, next) => {
    res.send('PATCH route for one item');
});
router.delete('/:id', (req, res, next) => {
    res.send('DEL route for one item');
})

module.exports = router;