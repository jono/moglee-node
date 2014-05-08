var sql = require('bookshelf').sql;

// Model Deps
var Member = require('./member').Member;
var Members = require('./member').Members;
var Message = require('./message').Message;
var User = require('./user').User;

exports.Conversation = Conversation = sql.Model.extend({

  tableName : 'conversations',

  initialize : function() {

  },

  addMembers : function( userIds ) {
    var mapFunc = function( uid ) {
      return { user_id : uid, conversation_id : this.id };
    };
    var memberData = userIds.map(mapFunc.bind(this));

    Members.forge(memberData).invokeThen('save', null, function() {
      //do something here
    });
  },

  addMessage : function( userId, message ) {

    var promise = Message.forge({
      conversation_id : this.id,
      user_id : userId,
      body : message,
      created_at : Date.now(),
      updated_at : Date.now()
    })
    .save();

    return promise;

  },

  members : function() {
    var self = this;
    var promise = this.belongsToMany(User)
      .through(Member, 'conversation_id', 'user_id')
      .fetch()
      .then(function( members ) {
        self.set('members', members.models);
      });

    return promise;
  },

  messages : function() {
    var self = this;
    var promise = this.hasMany(Message)
      .query(function( qb ) {
        qb
          .orderBy('created_at', 'desc')
          .limit(25);
      })
      .fetch()
      .then(function( messages ) {
        self.set('messages', messages.models);
      });

    return promise;
  },

  recipients : function( userId ) {
    var self = this;
    var promise = this.belongsToMany(User)
      .through(Member, 'conversation_id', 'user_id')
      .query('where', 'user_id', '!=', userId)
      .fetch()
      .then(function( members ) {
        self.set('recipients', members.models);
      });

    return promise;
  }

},{
// Class funcions here

});

