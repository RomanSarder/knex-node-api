exports.up = function(knex, Promise) {
    return Promise.all([

        knex.schema.createTable('users', function(table) {
            table.increments('uid').primary();
            table.string('password').notNullable();
            table.string('name').notNullable();
            table.string('email').unique().notNullable();
        }),

        knex.schema.createTable('items', function(table) {
            table.increments('id').primary();
            table.string('name');
            table.integer('number');
            table.integer('author_id')
                .references('uid')
                .inTable('users');
            table.json('logs');
            table.integer('state');
        }),

    ])
}

exports.down = function(knex, Promise) {
    return Promise.all([
        knex.schema.dropTable('items'),
        knex.schema.dropTable('users')
    ])
};