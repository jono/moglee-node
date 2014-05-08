var bcrypt = require('bcrypt');

var password = process.argv.pop()

console.log( password );


var salt    = "$2a$10$s2wJkSWspaFBx0GUjFWNLu";
var pwhash  = "$2a$10$s2wJkSWspaFBx0GUjFWNLuPSSBJ6UY.BiBz6gXYPBogKGCsPJAi0G";

var hash = bcrypt.hashSync(password, salt);


if ( pwhash === hash ) {
  console.log("Passwords match");
} else {
  console.log("Passwords dont match");
}
