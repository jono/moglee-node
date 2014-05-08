Backbone.sync = function() {};

var Conversation = Backbone.Model.extend({

  initialize : function() {
    var messages = new Messages( this.get('messages') );
    this.messages = new Messages( messages.sortBy(function( message ) {
      return message.get('created_at');
    }) );
    this.recipient = new Recipient( this.get('recipients')[0] );

  },

  getLastMessageText : function() {
    console.log( this.messages);
    if ( this.messages.last() ) {
      return this.messages.last().get('body');
    }
    return '';
  }

});

var Conversations = Backbone.Collection.extend({

  model : Conversation

});


var Message = Backbone.Model.extend({

  initialize : function() {

  }

});

var Messages = Backbone.Collection.extend({

  model : Message,

  initialize : function() {
    this.on('add', function( model ) {
      console.log('addeed');
      app.trigger('message.added', model);
    });
  }

});


var Recipient = Backbone.Model.extend({

  initialize : function() {

  }

});

