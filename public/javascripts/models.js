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
    var last = this.messages.last();
    if ( last ) {
      var body = last.get('body');
      body = body.replace( /\(icon:\w*\)/g, function( match ) {
        var m = match.replace(/\(|\)/g, '').split(':')[1];
        return '<div class="icon" style="-webkit-mask-image: url('+ glyphPrefix + GLYPHS[m] +');"></div>';
      });
      return body;
    }
    return '';
  },

  getLastMessageTimestamp : function() {
    if ( this.messages.last() ) {
      return moment( this.messages.last().get('created_at') ).startOf('minute').fromNow();
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

