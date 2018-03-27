var request = require('request');

module.exports = function(verificationcode , mobile) {
    var API_CODE = "6A7743547175714A30476B576E34696A41586C694C513D3D";
    request.post({
        url: 'https://api.kavenegar.com/v1/' + API_CODE + '/verify/lookup.json',
        form: {
            'receptor': mobile,
            'token': verificationcode,
            'template': 'smsVerify',
        }
    }, function(error, response, body) {
        console.log(body);
    });
}