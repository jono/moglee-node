var request = require('request');

var pw = 'balls55';
var emails = [
  'jono.oshea@gmail.com',
  'joshea@liveperson.com',
  'andrew@balls.com',
  'max@balls.com',
  'angelina@balls.com'
];



emails.forEach(function( email ) {

  request.post('http://localhost:3000/register', { email : email, password : pw }, function( err, resp, body ) {

    if ( err ) {
      console.log( err );
    } else {
      console.log( body );
    }

  });

});

