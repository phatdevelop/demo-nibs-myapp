angular.module('nibs.case', [])

    // Routes
    .config(function ($stateProvider) {

        $stateProvider

            .state('app.help', {
                url: "/help",
                views: {
                    'menuContent' :{
                        templateUrl: "templates/case.html",
                        controller: "CaseCtrl"
                    }
                }
            })

    })

    // Services
    .factory('Case', function ($http, $rootScope, $ionicPopup) {
        return {
            create: function(theCase) {
                //return $http.post($rootScope.server.url + '/cases/', theCase);
                $ionicPopup.alert({title: 'theCase', content: theCase});
                var conf = {
                    headers: {
                        "Content-type": "text/html"
                    },
                    transformRequest: null
                };
                var fd = new FormData();
                fd.append('captcha_settings', theCase.captcha_settings);
                fd.append('orgid', theCase.orgid);
                fd.append('retURL', theCase.retURL);
                fd.append('name', theCase.name);
                fd.append('email', theCase.email);
                fd.append('phone', theCase.phone);
                fd.append('subject', theCase.subject);
                fd.append('description', theCase.description);
                $ionicPopup.alert({title: 'fd', content: fd});
                return $http.post('https://www.salesforce.com/servlet/servlet.WebToCase?encoding=UTF-8', fd, conf);
            }
        };
    })

    //Controllers
    .controller('CaseCtrl', function ($scope, $window, $ionicPopup, Case, User) {

        $scope.case = {};

        $scope.submit = function () {
            Case.create($scope.case).success(function() {
                $ionicPopup.alert({title: 'Thank You', content: 'A customer representative will contact you shortly.'});
            });
        };

    });
