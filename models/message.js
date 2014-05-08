var sql = require('bookshelf').sql;

exports.Message = Message = sql.Model.extend({

  tableName : 'messages',

  initialize : function() {

  }

},{
// Class functions here


});

// exports.Members = sql.Collection.extend({

//   model : Member,

//   initialize : function() {

//   }

// });

