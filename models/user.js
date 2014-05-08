var sql = require('bookshelf').sql;
var Promise = require("bluebird");

exports.User = User = sql.Model.extend({

  tableName : 'users',

  initialize : function() {

  },

  fetchConversations : function( withDeps ) {
    var user = this;
    var withDeps = withDeps || false;

    return new Promise( function( resolve, reject ) {
      user.belongsToMany(Conversation)
        .through(Member, 'user_id', 'conversation_id')
        .fetch()
        .then(function( collection ) {
          if ( !collection ) {
            resolve();
          }

          if ( withDeps ) {
            collection.invokeThen('recipients', user.id).then(function() {
              collection.invokeThen('messages', null).then(function() {
                resolve(collection);
              });
            });
          } else {
            resolve(collection);
          }

        })
        .catch(function() {
          reject();
        });

    });
  },

  fetchConversation : function( id ) {

    var promise = this.belongsToMany(Conversation)
      .through(Member, 'user_id', 'conversation_id')
      .query('where', 'conversation_id', '=', id)
      .fetch();
      // .then(function( model ) {

      // });

    return promise;
  },

  startConversationWith : function( recipientEmail ) {
    var user = this;

    return new Promise( function( resolve, reject ) {
      User.forge({ email : recipientEmail })
        .fetch()
        .then(function( recipient ) {
          if ( !recipient ) {
            reject('User not found');
          } else {
            Members
              .forge()
              .query(function(qb) {
                  qb.where('user_id', '=', user.id).orWhere('user_id', '=', recipient.id);
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
                            reject('Conversation already exists.');
                          });
                        break;
                      }
                    }
                  }
                  if ( match ) { break; }
                }
                if ( !match ) {
                  Conversation
                    .forge()
                    .save()
                    .then(function( conv ) {
                      // TODO: Add callback to addMembers
                      conv.addMembers([ user.id, recipient.id ]);
                      resolve( conv );
                    });
                }
              });
          }
        });
    });
  },

  saveMessageForConversation : function( convId, message ) {
    var user = this;
    return new Promise(function( resolve, reject ) {
      Conversation.forge({ id : convId })
        .fetch()
        .then(function( conversation ) {
          if ( !conversation ) {
            reject('Conversation not found');
          }

          conversation
            .addMessage( user.id, message )
            .then(function( model ) {
              resolve(model);
            });

        });
    });
  }

},{
// Class methods

  findByEmail : function( email, callback ) {
    new User({ email : email })
      .fetch()
      .then(callback);
  }

});

var Conversation = require('./conversation').Conversation;
var Member = require('./member').Member;
var Members = require('./member').Members;


