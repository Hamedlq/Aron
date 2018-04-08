var https = require('https');

module.exports = function(playId,title ,message) {
var headers = {
    "Content-Type": "application/json; charset=utf-8",
    "Authorization": "Basic ZjAxOWU5M2EtY2U1My00Y2M3LTgwNzUtOTM4NzYzZWE1YmYy"
  };
  
  var options = {
    host: "onesignal.com",
    port: 443,
    path: "/api/v1/notifications",
    method: "POST",
    headers: headers
  };
  
var data = { 
    app_id : "6a50e7cc-aaf0-4175-aa67-ee59524c838d",
    contents : {en: message },
    headings : {en : title },
  include_player_ids: [playId]
};
  
  
  var req = https.request(options, function(res) {  
    res.on('data', function(data) {
      console.log("Response:");
      console.log(JSON.parse(data));
    });
  });
  
  req.on('error', function(e) {
    console.log("ERROR:");
    console.log(e);
  });
  
  req.write(JSON.stringify(data));
  req.end();
};
