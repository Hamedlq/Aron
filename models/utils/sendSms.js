var request = require('request');

module.exports = function(verificationcode , mobile) {
    var API_CODE = "57615066645161576D6247336F6C6B573544616258384831312B6D7661464C71";
    request.post({
        url: 'https://api.kavenegar.com/v1/' + API_CODE + '/verify/lookup.json',
        form: {
            'receptor': mobile,
            'token': verificationcode,
            'template': 'Verify',
        }
    }, function(error, response, body) {
        console.log(body);
    });
}