var redis = require('redis');
var publisherClient = redis.createClient();

module.exports = function(app) {

  //var apiUrl = require('../lib/helpers').apiUrl;

  app.get('/conversations', function( req, res, currentUser ) {
    var user = req.user;

    if ( !user ) {
      return res.send('Not authorized\n', 401);
    }

    user.fetchConversations( true )
      .then(function( collection ) {
        var models = [];
        if ( collection ) {
          models = collection.models;
        }
        res.send( models );
      })
      .catch(function() {
        console.log( arguments );
        res.send('Something went wrong', 500);
      });
  });

  app.post('/conversations', function( req, res ) {
    var errors = [];
    var user = req.user;

    if ( !user ) {
      return res.send('Not authorized\n', 401);
    }

    // TODO: validate email
    if ( req.param('recipient') ) {
      user.startConversationWith( req.param('recipient') )
        .then(
          function(model) {
            res.send(model, 200);
          },
          function(reason) {
            res.send(reason, 400);
          }
        )
        .catch(function() {
          res.send('Sorry, something went wrong', 500);
        });
    }

  });

  app.get('/conversations/:id', function( req, res ) {
    var errors = [];
    var user = req.user;

    if ( !user ) {
      return res.send('Not authorized\n', 401);
    }

    if ( req.params.id ) {

      user.fetchConversation(req.params.id)
        .then(function( conversation ) {
          if ( !conversation ) {
            res.send(404);
          } else {
            res.send( conversation );
          }
        });

    } else {
      res.send('Bad request\n')
    }
  });

  app.get('/stream/conversations', function( req, res ) {
    var user = req.user;

    if ( !user ) {
      console.log('asd');
      return res.send('Not authorized\n', 401);
    }

    req.socket.setTimeout(Infinity);
    console.log('Setting socket timeout to infinity...');

    var id = 0;
    var subscriber = redis.createClient();

    // Subscribe to all conversations
    // Is this bad?
    // Maybe subscr to user id instead
    user.fetchConversations()
      .then(function( collection ) {
        collection.each(function( model ) {
          subscriber.subscribe('conv:'+model.id+':messages');
        });
      })
      .catch(function() {
        // TODO: Close socket if error
      });

    subscriber.on('message', function( channel, message ) {
      id++;
      res.write('id: ' + id + '\n');
      res.write('data: ' + message + '\n\n');
    });

    subscriber.on('error', function(err ) {
      console.log('error', err );
    });

    res.writeHead(200, {
      'Content-Type' : 'text/event-stream',
      'Cache-Control': 'no-cache',
      'Connection' : 'keep-alive'
    });
    res.write('\n');

    req.on('close', function() {
      subscriber.unsubscribe();
      subscriber.quit();
    });

  });


  app.post('/conversations/:id/message', function( req, res ) {
    var errors = [];
    var user = req.user;

    if ( !user ) {
      return res.send('Not authorized\n', 401);
    }

    if ( req.params.id && req.body.message) {

      var payload = JSON.stringify({
        body : req.body.message,
        user_id : user.id,
        conversation_id : req.params.id,
        sent_at : Date.now()
      });

      user.saveMessageForConversation(req.params.id, req.body.message)
        .then(function( message ) {
          publisherClient.publish('conv:' + req.params.id + ':messages', JSON.stringify(message));
          res.send(200);
        });

    } else {
      res.send('Bad request\n')
    }
  });

};
