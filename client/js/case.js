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
    .factory('Case', function ($http, $rootScope) {
        return {
            create: function(theCase) {
                //return $http.post($rootScope.server.url + '/cases/', theCase);
                return $http.post('https://www.salesforce.com/servlet/servlet.WebToCase?encoding=UTF-8', theCase);
            }
        };
    })

    //Controllers
    .controller('CaseCtrl', function ($scope, $window, $ionicPopup, Case, User) {

        $scope.case = {};

        $scope.submit = function () {
            //Case.create($scope.case).success(function() {
            Case.create($scope.case).success(function() {
                $ionicPopup.alert({title: 'Thank You', content: 'A customer representative will contact you shortly.'});
            });
        };

    });
