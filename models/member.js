var sql = require('bookshelf').sql;


exports.Member = Member = sql.Model.extend({

  tableName : 'members',

  initialize : function() {

  },

},{
// Class funcions here


});

exports.Members = sql.Collection.extend({

  model : Member,

  initialize : function() {

  }

});

