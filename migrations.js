var Bookshelf  = require('bookshelf');

var sql = Bookshelf.initialize({
  client: 'sqlite3',
  connection: {
    filename : './db.sqlite3'
  }
});


// Helpers

// var createTable = function( tableName, callback ) {
//   return sql.knex.schema.hasTable(tableName).then(function(exists) {
//     console.log('has table', exists);
//     if ( exists ) {
//       console.log(tableName + 'table already exists.');
//       return;
//     }

//     sql.knex.schema.createTable(tableName, callback);

//   });
// };


// Users Table
sql.knex.schema.hasTable('users').then(function(exists) {

  if ( exists ) {
    console.log( 'Users table already exists. Not creating...');
    return;
  }

  sql.knex.schema.createTable('users', function( table ) {
    table.increments('id').primary();
    table.string('email');
    table.string('first_name');
    table.string('last_name');
    table.string('hash');
    table.string('salt');
    table.timestamps();
  })
  .then(function () {
    console.log('Users table created...');
  });

});


// Contacts Table
sql.knex.schema.hasTable('contacts').then(function(exists) {

  if ( exists ) {
    console.log( 'Contacts table already exists. Not creating...');
    return;
  }

  sql.knex.schema.createTable('contacts', function( table ) {
    table.increments('id').primary();
    table.integer('user_id');
    table.integer('contact_id');
    table.timestamps();
  })
  .then(function () {
    console.log('Contacts table created...');
  });

});


// Conversations Table
sql.knex.schema.hasTable('conversations').then(function(exists) {

  if ( exists ) {
    console.log( 'Conversations table already exists. Not creating...');
    return;
  }

  sql.knex.schema.createTable('conversations', function( table ) {
    table.increments('id').primary();
    table.timestamps();
  })
  .then(function () {
    console.log('Conversations table created...');
  });

});

//Member Table
sql.knex.schema.hasTable('member').then(function(exists) {

  if ( exists ) {
    console.log( 'Member table already exists. Not creating...');
    return;
  }

  sql.knex.schema.createTable('members', function( table ) {
    table.increments('id').primary();
    table.integer('conversation_id').references('id').inTable('conversations');
    table.integer('user_id').references('id').inTable('users');
    table.timestamps();
  })
  .then(function () {
    console.log('Members table created...');
  });

});


// Messages Table
sql.knex.schema.hasTable('messages').then(function(exists) {

  if ( exists ) {
    console.log( 'Messages table already exists. Not creating...');
    return;
  }

  sql.knex.schema.createTable('messages', function( table ) {
    table.increments('id').primary();
    table.integer('conversation_id').references('id').inTable('conversations');
    table.integer('user_id').references('id').inTable('users');
    table.string('body');
    table.timestamps();
  })
  .then(function () {
    console.log('Messages table created...');
  });

});


