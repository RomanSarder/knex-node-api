const knex = require('./db/db');

knex('items').where('name', 'some nanme').first()
    .then((item) => {
        console.log(item);
    })