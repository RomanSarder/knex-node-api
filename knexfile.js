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
    },
    production: {
        client: 'pg',
        connection: 'postgres://vjsdubrnsuzkbs:a43752eb23564fb0602e6bacce84092b95cb7a7b8d83fd1048d899b907671566@ec2-23-23-220-163.compute-1.amazonaws.com:5432/d93qu32if97il5?ssl=true'
    }

};