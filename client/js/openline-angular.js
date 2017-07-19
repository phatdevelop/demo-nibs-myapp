angular.module('openline', [])

    .factory('OpenLINE', function ($rootScope, $q, $window, $http) {
        var channelId,
            channelSecret,
            loginURL,
            getTokenURL,
            getUserURL,
            callbackURL,
            authorizationCode,
        // Because the OAuth login spans multiple processes, we need to keep the success/error handlers as variables
        // inside the module instead of keeping them local within the login function.
            deferredLogin,

        // Used in the exit event handler to identify if the login has already been processed elsewhere (in the oauthCallback function)
            loginSucceeded;

        function init(configChannelId, configChannelSecret, configLoginURL, configGetTokenURL, configGetUserURL, configCallbackURL) {
            channelId = configChannelId;
            channelSecret = configChannelSecret;
            loginURL = configLoginURL;
            getTokenURL = configGetTokenURL;
            getUserURL = configGetUserURL;
            callbackURL = configCallbackURL;
        }

        function login() {
            var loginWindow;

            function loginWindowLoadStart(event) {
                var url = event.url;
                window.open(url, '_blank');
                if (url.indexOf("code=") > 0 || url.indexOf("error=") > 0) {
                    loginWindow.close();
                    oauthCallback(url);
                }
            }

            function loginWindowExit() {
                console.log('exit and remove listeners');
                // Handle the situation where the user closes the login window manually before completing the login process
                deferredLogin.reject({error: 'user_cancelled', error_description: 'User cancelled login process', error_reason: "user_cancelled"});
                loginWindow.removeEventListener('loadstop', loginWindowLoadStart);
                loginWindow.removeEventListener('exit', loginWindowExit);
                loginWindow = null;
            }

            if (!channelId) {
                return error({error: 'Line App Id not set.'});
            }

            deferredLogin = $q.defer();

            loginSucceeded = false;
            loginWindow = $window.open(loginURL + '?client_id=' + channelId + '&redirect_uri=' + callbackURL + '&state=123abc' +
                '&response_type=code&display=popup', '_blank', 'location=no');

            // If the app is running in Cordova, listen to URL changes in the InAppBrowser until we get a URL with an access_token or an error
            //if (runningInCordova) {
            loginWindow.addEventListener('loadstart', loginWindowLoadStart);
            loginWindow.addEventListener('exit', loginWindowExit);
            //}
            // Note: if the app is running in the browser the loginWindow dialog will call back by invoking the
            // oauthCallback() function. See oauthcallback.html for details.

            return deferredLogin.promise;
        }

        /**
         * Logout to Facebook using OAuth. If running in a Browser, the OAuth workflow happens in a a popup window.
         * If running in Cordova container, it happens using the In-App Browser. Don't forget to install the In-App Browser
         * plugin in your Cordova project: cordova plugins add org.apache.cordova.inappbrowser.
         * @param fbScope - The set of Facebook permissions requested
         */
        // function logout() {

        //     var logoutWindow = window.open(FB_LOGOUT_URL + '?access_token=' + tokenStore['fbtoken'] + '&next=' + 'http://sfdbc.heroku.com/' +
        //         '&display=popup', '_blank', 'location=no');

        //     setTimeout(function() {
        //         logoutWindow.close();
        //     }, 700);

        // }

        /**
         * Called either by oauthcallback.html (when the app is running the browser) or by the loginWindow loadstart event
         * handler defined in the login() function (when the app is running in the Cordova/PhoneGap container).
         * @param url - The oautchRedictURL called by Facebook with the access_token in the querystring at the ned of the
         * OAuth workflow.
         */
        function oauthCallback(url) {

            // Parse the OAuth data received from Facebook
            var queryString, obj;

            loginSucceeded = true;
            if (url.indexOf("code=") > 0) {
                queryString = url.substr(url.indexOf('?') + 1);
                obj = parseQueryString(queryString);
                authorizationCode = obj['code'];
                deferredLogin.resolve();
            } else if (url.indexOf("error=") > 0) {
                queryString = url.substring(url.indexOf('?') + 1, url.indexOf('#'));
                obj = parseQueryString(queryString);
                deferredLogin.reject(obj);
            } else {
                deferredLogin.reject();
            }
        }

        /**
         * Application-level logout: we simply discard the token.
         */
//        function logout() {
//            tokenStore.clear();
//        }

        // function isLoggedIn() {
        //     return tokenStore['linetoken'] != null;
        // }

        // /**
        //  * Helper function to de-authorize the app
        //  * @param success
        //  * @param error
        //  * @returns {*}
        //  */
        // function revokePermissions() {
        //     return api({method: 'DELETE', path: '/me/permissions'})
        //         .success(function () {
        //             console.log('Permissions revoked');
        //         });
        // }

        function getAccessToken() {
            // return $http({
            //     method: 'POST',
            //     url: getTokenURL,
            //     headers: {
            //         "Content-Type": "application/x-www-form-urlencoded"
            //     },
            //     params: {
            //         grant_type: 'authorization_code',
            //         client_id: channelId,
            //         client_secret: channelSecret,
            //         code: authorizationCode,
            //         redirect_uri: callbackURL
            //     }
            // });

            return $.ajax({
                type: "POST",
                dataType: 'jsonp',
                crossDomain: true,
                headers: {
                    //"Content-Type": "application/x-www-form-urlencoded"
                    "Content-Type": "text/html"
                },
                data: {
                    grant_type: 'authorization_code',
                    client_id: channelId,
                    client_secret: channelSecret,
                    code: authorizationCode,
                    redirect_uri: callbackURL
                },
                success: function(data) {
                    alert("success: " + data);
                  },
                  error: function(err) {
                    console.log(JSON.stringify(err));
                  }
            });

            // var url = 'https://api.line.me/v2/oauth/accessToken';

            //   var xhr = createCORSRequest('POST', url);
            //   if (!xhr) {
            //     alert('CORS not supported');
            //     return;
            //   }
            //   xhr.onreadystatechange = function() {
            //       if (xhr.readyState == 4) {
            //         // JSON.parse does not evaluate the attacker's scripts.
            //         console.log('xhr.responseText: ' + xhr.responseText);
            //         var resp = JSON.parse(xhr.responseText);
            //         console.log('resp' + resp);
            //       }
            //     }
            //   // Response handlers.
            //   xhr.onload = function() {
            //     alert('onload')
            //     var text = xhr.responseText;
            //     var title = getTitle(text);
            //     alert('Response from CORS request to ' + url + ': ' + title);
            //   };

            //   xhr.onerror = function() {
            //     alert('Woops, there was an error making the request.');
            //   };
            //   xhr.setRequestHeader('Content-Type', 'application/x-www-form-urlencoded');
            //   var params = 'grant_type=authorization_code&client_id=' + channelId + '&client_secret=' + channelSecret + '&code=' + authorizationCode + '&redirect_uri=' + callbackURL;
            //   xhr.send(params);
        }

        function getUserProfile(data) {
            //var scope = data.scope;
            var access_token = data.access_token;
            //var token_type = data.token_type;
            //var expires_in = data.expires_in;
            //var refresh_token = data.refresh_token;
            $window.sessionStorage.token = access_token;
            
            return $http({
                method: 'GET',
                url: getUserURL, 
                headers: {'Authorization': 'Bearer ' + access_token}
            })
            // .error(function(data, status, headers, config) {
            //     if (data.error && data.error.type === 'OAuthException') {
            //         $rootScope.$emit('OAuthException');
            //     }
            // });
        }

        function parseQueryString(queryString) {
            var qs = decodeURIComponent(queryString),
                obj = {},
                params = qs.split('&');
            params.forEach(function (param) {
                var splitter = param.split('=');
                obj[splitter[0]] = splitter[1];
            });
            return obj;
        }

        // Create the XHR object.
        function createCORSRequest(method, url) {
          var xhr = new XMLHttpRequest();
          if ("withCredentials" in xhr) {
            // XHR for Chrome/Firefox/Opera/Safari.
            xhr.open(method, url, true);
          } else if (typeof XDomainRequest != "undefined") {
            // XDomainRequest for IE.
            xhr = new XDomainRequest();
            xhr.open(method, url);
          } else {
            // CORS not supported.
            xhr = null;
          }
          return xhr;
        }

        // Helper method to parse the title tag from the response.
        function getTitle(text) {
          return text.match('<title>(.*)?</title>')[1];
        }

        return {
            init: init,
            login: login,
            // logout: logout,
            // revokePermissions: revokePermissions,
            getAccessToken: getAccessToken,
            getUserProfile,
            // isLoggedIn: isLoggedIn,
            oauthCallback: oauthCallback
        }

    });

function oauthCallback(url) {
    var injector = angular.element(document.getElementById('main')).injector();
    injector.invoke(function (OpenLINE) {
        OpenLINE.oauthCallback(url);
    });
}