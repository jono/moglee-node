// App init

var app = {};
app.views = {};
app.jqt = new $.jQTouch({});

_.extend(app, Backbone.Events);

app.init = function() {

  app.conversations = new Conversations();

  app.views.login = new LoginPage({ el : $('#login') });
  app.views.conversations = new ConversationsPage({ el : $('#conversations') });

  $.ajax({
    type : 'get',
    url : '/session',
    success : function( data ) {
      app.user = JSON.parse( data );
      app.go('#conversations', function() {
        app.views.conversations.load();
        app.openStream();
      });
    },
    error : function() {
      app.go('#login');
    }
  });
};

app.go = function( view , callback) {
  window.location = view;
  if ( callback ) {
    callback.call();
  }
};

app.openStream = function() {

  this.stream = new EventSource('/stream/conversations');

  this.stream.addEventListener('message', _.bind(function( evt ) {
    var data = JSON.parse(evt.data);
    var conversation = app.conversations.get( data.conversation_id );
    conversation.messages.create( data );
  },this) );

  this.stream.addEventListener('error', _.bind(function( evt ) {

  },this) );

};


app.init();
