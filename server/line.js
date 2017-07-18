var winston = require("winston"),
    Q = require('q'),
    auth = require('./auth'),
    db = require('./pghelper'),
    config = require('./config'),
    https = require('https');

function login(req, res, next) {
	console.log('Vao day ne');
	winston.info('Vao day ne');
	var lineUser = req.params.lineUser;
    var lineToken = req.params.token;

    // function createAndSendToken(user) {
    //     console.log('send token for user:' + JSON.stringify(user));
    //     auth.createAccessToken(user)
    //         .then(function(token) {
    //             var response = {'user':{'email': user.email, 'firstName': user.firstname, 'lastName': user.lastname}, 'token': token};
    //             winston.info(JSON.stringify(response));
    //             return res.send(response);
    //         })
    //         .catch(next);
    // }

    // Check if Line token is valid and matches the Line User id provided.
    // validateLINEToken(lineToken, lineUser.userId)
    //     .then(function () {
    //         // The Line token is valid
    //         db.query('SELECT id, firstName, lastName, email, loyaltyid__c as externalUserId FROM salesforce.contact WHERE lineUserId__c=$1', [lineUser.id], true)
    //             .then(function (user) {
    //                 if (user) {
    //                     // The Line user is known
    //                     // Create a token and send it to the client.
    //                     winston.info('Known Line user');
    //                     return createAndSendToken(user);
    //                 } else {
    //                     db.query('SELECT id, firstName, lastName, email FROM salesforce.contact WHERE email=$1', [lineUser.email], true)
    //                         .then(function (user) {
    //                             if (user) {
    //                                 // We already have a user with that email address
    //                                 // Add Line id to user record
    //                                 winston.info('We already have a user with that email address.');
    //                                 //updateUser(user, lineUser.id).then(createAndSendToken).catch(next);
    //                             } else {
    //                                 // First time this Line user logs in (and we don't have a user with that email address)
    //                                 // Create a user
    //                                 winston.info('First time this Line user logs in');
    //                                 //createUser(lineUser).then(createAndSendToken).catch(next);
    //                             }
    //                         })
    //                         .catch(next);
    //                 }
    //             })
    //             .catch(next);
    //     })
    //     .catch(next);

    db.query('SELECT id, firstName, lastName, email, loyaltyid__c as externalUserId FROM salesforce.contact WHERE lineUserId__c=$1', [lineUser.userId], true)
        .then(function (user) {
            if (user) {
                // The Line user is known
                // Create a token and send it to the client.
                winston.info('Known Line user');
                return createAndSendToken(user);
            } else {
                db.query('SELECT id, firstName, lastName, email FROM salesforce.contact WHERE email=$1', [lineUser.email], true)
                    .then(function (user) {
                        if (user) {
                            // We already have a user with that email address
                            // Add Line id to user record
                            winston.info('We already have a user with that email address.');
                            //updateUser(user, lineUser.id).then(createAndSendToken).catch(next);
                        } else {
                            // First time this Line user logs in (and we don't have a user with that email address)
                            // Create a user
                            winston.info('First time this Line user logs in');
                            //createUser(lineUser).then(createAndSendToken).catch(next);
                        }
                    })
                    .catch(next);
            }
        })
        .catch(next);
}

// function validateLINEToken(lineToken, lineUserId) {

//     winston.info("Validating Line token: " + lineToken + " userId: " + lineUserId);

//     var deferred = Q.defer();

    // https.post({
    // 	method: 'POST',
    //     url: 'https://api.line.me/v2/oauth/verify',
    //     headers: {
    //         "Content-Type": "application/x-www-form-urlencoded"
    //     },
    //     params: {
    //         access_token: lineToken
    //     }
    // }
    // , function(res) {
    // 	var body = '';

    // 	res.on('end', function() {
    // 		var data = JSON.parse(body);
    //         winston.info("Line response: " + body);
    //         if (data && data.id && data.id === lineUserId) {
    //             winston.info("Line token validated");
    //             deferred.resolve();
    //         } else {
    //             winston.error("Error validating Line Token: " + body);
    //             deferred.reject();
    //         }
    // 	});
    // }
    //)

    // .on('error', function(e) {
    // 	winston.error("System error validating Line Token: " + e);
    // 	deferred.reject(e);
    // });
    // https.get(url,function (res) {

    //     var body = '';

    //     res.on('data', function (chunk) {
    //         body += chunk;
    //     });

    //     res.on('end', function () {
    //         var data = JSON.parse(body);
    //         winston.info("Facebook response: " + body);
    //         if (data && data.id && data.id === fbUserId) {
    //             winston.info("Facebook token validated");
    //             deferred.resolve();
    //         } else {
    //             winston.error("Error validating Facebook Token: " + body);
    //             deferred.reject();
    //         }
    //     });

    // }).on('error', function (e) {
    //         winston.error("System error validating Facebook Token: " + e);
    //         deferred.reject(e);
    //     });

//     return deferred.promise;
// }

exports.login = login;