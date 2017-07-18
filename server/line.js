var winston = require("winston"),
    Q = require('q'),
    auth = require('./auth'),
    db = require('./pghelper'),
    config = require('./config'),
    https = require('https');

function login(req, res, next) {
	console.log('Vao day ne');
	winston.info('Vao day ne');
	var user = req.body.user;
	var userId = user.userId;
    var token = req.body.token;

    function createAndSendToken(user) {
        console.log('send token for user:' + JSON.stringify(user));
        auth.createAccessToken(user)
            .then(function(token) {
                var response = {'user':{'email': user.email, 'firstName': user.firstname, 'lastName': user.lastname}, 'token': token};
                winston.info(JSON.stringify(response));
                return res.send(response);
            })
            .catch(next);
    }

    // Check if Line token is valid and matches the Line User id provided.
    validateLINEToken(token, userId)
        .then(function () {
            // The Line token is valid
            db.query('SELECT id, firstName, lastName, email, loyaltyid__c as externalUserId FROM salesforce.contact WHERE lineUserId__c=$1', [userId], true)
                .then(function (user) {
                    if (user) {
                        // The Line user is known
                        // Create a token and send it to the client.
                        winston.info('Known Line user');
                        return createAndSendToken(user);
                    } else {
                        db.query('SELECT id, firstName, lastName, email FROM salesforce.contact WHERE email=$1', [userId], true)
                            .then(function (user) {
                                if (user) {
                                    // We already have a user with that email address
                                    // Add Line id to user record
                                    winston.info('We already have a user with that email address.');
                                    //updateUser(user, user.id).then(createAndSendToken).catch(next);
                                } else {
                                    // First time this Line user logs in (and we don't have a user with that email address)
                                    // Create a user
                                    winston.info('First time this Line user logs in');
                                    //createUser(user).then(createAndSendToken).catch(next);
                                }
                            })
                            .catch(next);
                    }
                })
                .catch(next);
        })
        .catch(next);
}

function validateLINEToken(token, userId) {

    winston.info("Validating Line token: " + token + " userId: " + userId);

    var deferred = Q.defer();

    https.post({
    	method: 'POST',
        url: 'https://api.line.me/v2/oauth/verify',
        headers: {
            "Content-Type": "application/x-www-form-urlencoded"
        },
        params: {
            access_token: token
        }
    },function(res) {
    	var body = '';

    	res.on('end', function() {
    		var data = JSON.parse(body);
            winston.info("Line response: " + body);
            if (data && data.id && data.id === userId) {
                winston.info("Line token validated");
                deferred.resolve();
            } else {
                winston.error("Error validating Line Token: " + body);
                deferred.reject();
            }
    	});
    })
    .on('error', function (e) {
            winston.error("System error validating Line Token: " + e);
            deferred.reject(e);
        });

    return deferred.promise;
}

exports.login = login;