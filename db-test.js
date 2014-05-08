var Bookshelf  = require('bookshelf');
var Promise = require('bluebird');

var sql = Bookshelf.sql = Bookshelf.initialize({
  client: 'sqlite3',
  connection: {
    filename : './db.sqlite3'
  }
});

// Models
var Conversation = require('./models/conversation').Conversation;
var Members = require('./models/member').Members;

var getConv = function() {
  return new Promise(function( resolve, reject ) {

    Members
      .forge()
      .query(function(qb) {
          qb.where('user_id', '=', 1).orWhere('user_id', '=', 2);
      })
      .fetch()
      .then(function( col ) {
        var match = false;
        var leng = col.models.length;
        for ( var i = 0; i < leng; i++ ) {
          for ( var ii = 0; ii < leng; ii++ ) {
            if ( i !== ii ) {
              if ( col.models[i].get('conversation_id') === col.models[ii].get('conversation_id') ) {
                match = true;
                Conversation
                  .forge({ id : col.models[i].get('conversation_id') })
                  .fetch()
                  .then(function( model ) {
                    resolve( model );
                  });
                break;
              }
            }
          }
          if ( match ) { break; }
        }
        if ( !match ) { reject(); }
      });

  });
}



getConv()
  .then(
    function(model) {
      console.log('found conv', model)
    },
    function() {
      console.log('no conv found')
    }
  )
  .then(function() {
    process.exit();
  });
