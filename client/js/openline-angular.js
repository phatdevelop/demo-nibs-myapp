angular.module('openline', [])

    .factory('OpenLINE', function ($rootScope, $q, $window, $http) {

        var LOGIN_URL = 'https://access.line.me/dialog/oauth/weblogin',

            CALLBACK_URL = 'https://demo-nibs-myapp-k.herokuapp.com/oauthcallback.html',

        // By default we store fbtoken in sessionStorage. This can be overriden in init()
            tokenStore = window.sessionStorage,

            lineAppId,
            oauthRedirectURL,

        // Because the OAuth login spans multiple processes, we need to keep the success/error handlers as variables
        // inside the module instead of keeping them local within the login function.
            deferredLogin,

        // Indicates if the app is running inside Cordova
            runningInCordova,

        // Used in the exit event handler to identify if the login has already been processed elsewhere (in the oauthCallback function)
            loginSucceeded;

        // document.addEventListener("deviceready", function () {
        //     runningInCordova = true;
        //     oauthRedirectURL = 'https://www.facebook.com/connect/login_success.html';
        // }, false);

        function init(appId, store) {
            lineAppId = appId;
            if (store) tokenStore = store;
        }

        function login() {

            var loginWindow;

            //var startTime = new Date().getTime();
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

            // if (!lineAppId) {
            //     return error({error: 'Line App Id not set.'});
            // }

            //lineScope = lineScope || '';

            deferredLogin = $q.defer();

            loginSucceeded = false;

            // if (runningInCordova) {
            //     oauthRedirectURL =  'https://www.facebook.com/connect/login_success.html';
            // } else {
            //     var context = window.location.pathname.substring(0, window.location.pathname.indexOf("/",2)),
            //         baseURL = location.protocol + '//' + location.hostname + (location.port ? ':' + location.port : '') + context;
            //     oauthRedirectURL = baseURL + '/oauthcallback.html';
            // }
            
            loginWindow = $window.open(LOGIN_URL + '?client_id=' + lineAppId + '&redirect_uri=' + CALLBACK_URL + '&state=123abc' +
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
                queryString = url.substr(url.indexOf('#') + 1);
                obj = parseQueryString(queryString);
                tokenStore['linetoken'] = obj['code'];
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

        // /**
        //  * Lets you make any Facebook Graph API request.
        //  * @param obj - Request configuration object. Can include:
        //  *  method:  HTTP method: GET, POST, etc. Optional - Default is 'GET'
        //  *  path:    path in the Facebook graph: /me, /me.friends, etc. - Required
        //  *  params:  queryString parameters as a map - Optional
        //  */
        function api(obj) {

            var method = obj.method || 'GET',
                params = obj.params || {};

            params['code'] = tokenStore['linetoken'];

            return $http({
                            method: method, 
                            url: 'https://api.line.me/v2/profile' + obj.path, 
                            headers: 'Authorization: Bearer ' + params['code'],
                            params: params})
                .error(function(data, status, headers, config) {
                    if (data.error && data.error.type === 'OAuthException') {
                        $rootScope.$emit('OAuthException');
                    }
                });
        }

        // /**
        //  * Helper function for a POST call into the Graph API
        //  * @param path
        //  * @param params
        //  * @returns {*}
        //  */
        // function post(path, params) {
        //     return api({method: 'POST', path: path, params: params});
        // }

        // /**
        //  * Helper function for a GET call into the Graph API
        //  * @param path
        //  * @param params
        //  * @returns {*}
        //  */
        function get(path, params) {
            return api({method: 'GET', path: path, params: params});
        }

        function getAccessToken(code) {
            return $http({
                method: 'POST',
                url: 'https://api.line.me/v2/oauth/accessToken',
                headers: {ContentType: 'application/x-www-form-urlencoded'},
                params: {
                    grant_type: 'authorization_code',
                    client_id: lineAppId,
                    client_secret: '59887b50400fcd8bd40359b9045ce39b',
                    code: code,
                    redirect_uri: CALLBACK_URL
                }
            })
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

        return {
            init: init,
            login: login,
            // logout: logout,
            // revokePermissions: revokePermissions,
            api: api,
            // post: post,
            get: get,
            getAccessToken: getAccessToken,
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