// Some Globals

var glyphPrefix = 'https://s3.amazonaws.com/moglee/glyphs/';

// Page View 

var Page = Backbone.View.extend({

});

// End Page View

// Login Page View

var LoginPage = Page.extend({

  events : {
    'click #signin' : 'doLogin'
  },

  initialize : function() {

  },

  doLogin : function() {
    var email = this.$('.email-field').val();
    var pw = this.$('.password-field').val();
    $.post('/login', { email : email, password : pw }, function() {
      window.location.reload();
      // app.go('#conversations', function() {
      //   app.views.conversations.load();
      // });
    });
  }

});

// End Login Page View

// Conversations

var ConversationsPage = Page.extend({

  template : _.template( $('#conversations-templ').html() ),

  events : {
    'click .conversation' : 'goToConversation'
  },

  initialize : function() {

    this.listenTo(app, 'message.added' , _.bind(function( model ) {
      this.render();
    },this));

  },

  load : function() {
    $.get('/conversations', _.bind(function( data, status ) {
      app.conversations.add( JSON.parse(data) );
      this.render();
    }, this));
  },

  render : function() {
    this.$el.html( this.template({
      conversations : app.conversations
    }) );
    return this;
  },

  goToConversation : function( e ) {
    var convId = $(e.target).data('id') || $(e.target).parent('.conversation').data('id');
    app.go('#conversation', function() {
      var model = app.conversations.get(convId);
      new ConversationPage({
        model : model,
        el : $('#conversation') 
      }).render();
    });
  }

});

// End of Conversations

var ConversationPage = Page.extend({

  template : _.template( $('#conversation-templ').html() ),

  events : {
    'click .send' : 'sendMessage',
    'keyup .send-message-field' : 'searchForGlyphMatch',
    'click .glyph-match' : 'selectGlyph'
  },

  initialize : function() {
    this.model.messages.on('add', function( message ) {
      this.addMessageToView( message );
    }, this);

    window.addEventListener('resize', _.bind(this.resize, this), false);

  },

  render : function() {
    this.$el.html( this.template({
      conversation : this.model,
      recipient : this.model.recipient
    }) );
    this.renderMessages();
    this.resize();
    _.delay(_.bind(this.resize, this), 1000);
    return this;
  },

  renderMessages : function() {
    this.model.messages.each( _.bind(function( message ) {
      this.addMessageToView( message );
    },this) );
    return this;
  },

  addMessageToView : function( message ) {
    var messageView = new MessageView({ model : message });
    this.$('.messages').append( messageView.render().$el );
  },

  sendMessage : function() {
    var messageText = this.$('.send-message-field').val();
    if ( messageText.length ) {
      this.$('.send-message-field').val('');
      $.post('/conversations/' + this.model.id + '/message', { message : messageText }, function() {

      });
    }
  },

  resize : function() {
    var height = window.innerHeight - ( 100 );
    var lastMessageHeight = this.$('.message-wrapper').last().height() || 56;


    this.$('.messages-wrapper')
      .css('height', height + 'px');

    this.$('.messages-wrapper').get(0).scrollTop = this.$('.messages').height();

    this.$('.spacer').css('height', ( height - lastMessageHeight ) + 'px' );
  },

  searchForGlyphMatch : function() {
    var word;
    var messageText = this.$('.send-message-field').val();

    if ( messageText.search(' ') === -1 ) {
      word = messageText;
    } else {
      word = messageText.split(' ').pop();
    }


    if ( word.length > 2 ) {
      var keys = Object.keys(GLYPHS);
      var matches = [];

      keys.forEach(function( key ) {
        if ( key.search(word) > -1 ) {
          matches.push(key);
        }
      });

      if ( matches.length ) {
        this.showMatchBar( matches );
      }

    } else {
      this.$('.match-bar').empty();
    }
  },

  showMatchBar : function( matches ) {
    var $mb = this.$('.match-bar');

    $mb
      .show()
      .empty();

    matches.forEach(function( key ) {
      var $img = $('<img>');
      $img
        .addClass('glyph-match')
        .attr('src', glyphPrefix + GLYPHS[key])
        .attr('data-key', key);

      $mb.append( $img );
    });
  },

  selectGlyph : function( e ) {
    var text;
    var messageText = this.$('.send-message-field').val();
    var key = $(e.target).data('key');
    console.log(key);
    var glyph = '(icon:'+key+')';


    if ( messageText.search(' ') === -1 ) {
      text = glyph;
    } else {
      text = messageText.split(' ');
      text[text.length-1] = glyph;
      text = text.join(' ');
    }

    this.$('.send-message-field').val(text).focus();
  }

});

var MessageView = Backbone.View.extend({

  className : 'message-wrapper',

  template : _.template( $('#message-templ').html() ),

  initialize : function() {
    var body = this.model.get('body');
    body = body.replace( /\(icon:\w*\)/g, function( match ) {
      var m = match.replace(/\(|\)/g, '').split(':')[1];
      return '<img src="'+ glyphPrefix + GLYPHS[m] +'" />';
    });
    this.model.set('body', body);
  },

  render : function() {
    this.$el.html( this.template( { model : this.model }) );
    if ( this.model.get('user_id') === app.user.id ) {
      this.$el.addClass('me');
    }
    return this;
  }

});
