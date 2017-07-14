angular.module('openline', [])
	.factory('OpenLINE', function ($rootScope, $q, $window, $http) {
		const LINE_LOGIN_URL = 'https://access.line.me/dialog/oauth/weblogin'
		const LINE_CHANNEL_ID = '1524762961'
		const CALLBACK_URL = 'https://demo-nibs-myapp-k.herokuapp.com/oauthcallback.html'
		var state = 'randomState'

		var deferredLogin
		var tokenStore = window.sessionStorage

		function init(store) {
            //fbAppId = appId;
            if (store) tokenStore = store;
        }

		function login(lineScope) {
			var loginWindow

			function loginWindowLoadStart(event) {
                var url = event.url;
                if (url.indexOf("access_token=") > 0 || url.indexOf("error=") > 0) {
                    var timeout = 600 - (new Date().getTime() - startTime);
                    setTimeout(function() {
                        loginWindow.close();
                    }, timeout>0 ? timeout : 0);
                    oauthCallback(url);
                }
            }
            deferredLogin = $q.defer();

            loginWindow = $window.open(LINE_LOGIN_URL + '?client_id=' + LINE_CHANNEL_ID + '&redirect_uri=' + CALLBACK_URL + '&state=' + state +
                '&response_type=token&display=popup&scope=' + lineScope, '_blank', 'location=no');

            loginWindow.addEventListener('loadstart', loginWindowLoadStart);
            //loginWindow.addEventListener('exit', loginWindowExit);

            return deferredLogin.promise;
		}

		function oauthCallback(url) {

            var queryString, obj;

            loginProcessed = true;
            if (url.indexOf("access_token=") > 0) {
                queryString = url.substr(url.indexOf('#') + 1);
                obj = parseQueryString(queryString);
                tokenStore['linetoken'] = obj['access_token'];
                deferredLogin.resolve();
            } else if (url.indexOf("error=") > 0) {
                queryString = url.substring(url.indexOf('?') + 1, url.indexOf('#'));
                obj = parseQueryString(queryString);
                deferredLogin.reject(obj);
            } else {
                deferredLogin.reject();
            }
        }
	})

// Global function called back by the OAuth login dialog
function oauthCallback(url) {
    var injector = angular.element(document.getElementById('main')).injector();
    injector.invoke(function (OpenLINE) {
        OpenLINE.oauthCallback(url);
    });
}