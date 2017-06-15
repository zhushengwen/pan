'use strict';

var http = require('http');
var https = require('https');
var httpProxy = require('http-proxy');
var url = require('url');

var PROXY_PORT = 3000;
var proxy, server;

// Create a proxy server with custom application logic
proxy = httpProxy.createProxy({});
function start_caddy(callback){
    var cmd=process.platform=='win32'?'tasklist':'ps acx';
    var exec = require('child_process').exec;
    var qqname='caddy';
    exec(cmd, function(err, stdout, stderr) {
        if(err){ return console.log(err); }
        var ps = stdout.split('\n').filter(function(line){
            var p=line.trim().split(/\s+/),pname=p[4],pid=p[0];
            if(pname && pname.toLowerCase().indexOf(qqname)>=0 && parseInt(pid)){
                console.log(pname,pid);
              return true;
            }
          return false;
        });
      if(ps.length == 0)
      {
        console.log('Start...');
        exec('./caddy',function(e, s, se) {
          console.log('ReStart...');
          start_caddy();
        });
      }
      if(callback)callback();
    });
}
proxy.on('error', function (err) {
    console.log('ERROR');
    start_caddy();
});

server = http.createServer(function (req, res) {
    //var finalUrl = req.url,
    var finalUrl = 'http://localhost:9000';
    var finalAgent = null;
    var parsedUrl = url.parse(finalUrl);

    if (parsedUrl.protocol === 'https:') {
        finalAgent = https.globalAgent;
    } else {
        finalAgent = http.globalAgent;
    }
   console.log(123456);
    start_caddy(function(){
          proxy.web(req, res, {
            target: finalUrl,
            agent: finalAgent,
            headers: { host: parsedUrl.hostname },
            prependPath: false,
            xfwd : true,
            hostRewrite: finalUrl.host,
            protocolRewrite: parsedUrl.protocol
        });
    });
});

console.log('listening on port ' + PROXY_PORT);
server.listen(PROXY_PORT);


/*
var http = require('http');
var setup = require('proxy');
 
var server = setup(http.createServer());
server.listen(process.env.PORT, function () {
  var port = server.address().port;
  console.log('HTTP(s) proxy server listening on port %d', port);
});
*/