// Update with your config settings.

module.exports = {

    development: {
        client: 'pg',
        connection: {
            host: 'localhost',
            user: 'ramzes241',
            password: 'ramzes241',
            database: 'training'
        },
        migrations: {
            directory: __dirname + '/db/migrations'
        },
        seeds: {
            directory: __dirname + '/db/seeds/development'
        }
    },
    test: {
        client: 'pg',
        connection: {
            host: 'localhost',
            user: 'ramzes241',
            password: 'ramzes241',
            database: 'training_test'
        },
        migrations: {
            directory: __dirname + '/db/migrations'
        },
        seeds: {
            directory: __dirname + '/db/seeds/test'
        }
    }

};