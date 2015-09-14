var express        = require('express');
var app            = express();
var bodyParser     = require('body-parser');
var methodOverride = require('method-override');
var server         = require('http').Server(app);

// set up server environment
var pub = __dirname + '/public';
app.use(express.static(pub));
app.use(bodyParser.json());
app.use(methodOverride());

var routes = {};

routes.getFoo = function(req, res) {
  res.status(200).send("Hello all");
}

routes.getSingleFoo = function(req, res) {
  console.log(req);
  res.status(200).send("Hello " + req.params.id);
}

// receive notifications of ingests from Once
routes.handleNotification = function(req, res) {
  console.log(req.body.notification + " notification received!");

  // only really care about publish notifications
  if (req.body.notification === 'publish') {
    var uri = 'http://onceux.unicornmedia.com/now/ads/vmap/od/auto';
    uri += '/' + config.once_domain_guid;
    uri += '/' + config.once_application_guid;
    uri += '/' + req.body.mediaItem.foreignKey;
    uri += '/content.once';
    Asset.updateAsync(req.body.mediaItem.foreignKey, 
                      {
                        state: 'published', 
                        once_published_response: req.body,
                        metadataUri: uri 
                      }).then(function(asset) {
      // tell the clients
      io.emit('video_published', asset);
      res.status(200).send('Thanks guys!');
    }).catch(function(e) {
      console.error(e, e.stack);
      res.status(500).send('Something broke, blame Once');
    });
  }
  
  // otherwise, we're happy with just logging for now, so let Once know we're happy
  else
    res.status(200).send('Thanks guys!');
};

app.get('/foo', routes.getFoo);
app.get('/foo/:id', routes.getSingleFoo);
app.post('/notifications', routes.handleNotification);

// Start this party
server.listen(5000, function() {
  console.log('Listening on port %d', server.address().port);
});