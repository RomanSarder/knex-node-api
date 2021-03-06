const { SHA256 } = require('crypto-js');
exports.seed = function(knex, Promise) {
    // Deletes ALL existing entries
    return knex('items').del()
        .then(function() {
            return knex('users').del();
        })

    .then(function() {
        // Inserts seed entries
        return knex('users').insert({
            password: SHA256('123' + 'roman@ya.ru').toString(),
            name: 'Roman',
            email: "roman@ya.ru"
        }).then(function() {
            return knex('users').insert({
                password: SHA256('123' + 'mike@ya.ru').toString(),
                name: 'Mike',
                email: 'mike@ya.ru'
            });
        }).then(function() {
            return knex('users').insert({
                password: SHA256('123' + 'john@ya.ru').toString(),
                name: 'John',
                email: 'john@ya.ru'
            });
        });
    }).then(function() {
        return knex('items').insert({
            name: 'Notebook',
            number: 12,
            author_id: 1,
            logs: JSON.stringify([{ author: 'Roman', time: new Date().getTime(), action: 'Created' }]),
            state: 'In warehouse'
        });
    }).then(function() {
        return knex('items').insert({
            name: 'Gyroscooter',
            number: 2,
            author_id: 2,
            logs: JSON.stringify([{ author: 'Mike', time: new Date().getTime(), action: 'Created' }]),
            state: 'In transit'
        });
    }).then(function() {
        return knex('items').insert({
            name: 'Macbook',
            number: 5,
            author_id: 3,
            logs: JSON.stringify([{ author: 'John', time: new Date().getTime(), action: 'Created' }]),
            state: 'In warehouse'
        })
    });
};