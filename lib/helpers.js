exports.apiUrl = function( url ) {
  var apiPrefix = '/api/v1/';
  if ( url[0] === '/' ) {
    url = url.slice(1);
  }
  return apiPrefix + url;
};
