angular.module('nibs.wishlist', [])

    // Routes
    .config(function ($stateProvider) {

        $stateProvider

            .state('app.wishlist', {
                url: "/wishlist",
                views: {
                    'menuContent' :{
                        templateUrl: "templates/wishlist.html",
                        controller: "WishListCtrl"
                    }
                }
            })

    })

    // Services
    .factory('WishListItem', function ($http, $rootScope) {
        return {
            all: function(offset, limit) {
                return $http.get($rootScope.server.url + '/wishlist/' + offset + '/' + limit);
            },
            create: function(wishlistItem) {
                return $http.post($rootScope.server.url + '/wishlist', wishlistItem);
            },
            del: function(productId) {
                return $http.delete($rootScope.server.url + '/wishlist/' + productId);
            }
        };
    })

    // Controllers
    .controller('WishListCtrl', function ($scope, WishListItem) {
        const firstLoadOffset = 0
        const firstLoadLimit  = 10

        $scope.deleteItem = function(product) {
            WishListItem.del(product.id).success(function() {
                all();
            });
        };

        $scope.products = []
        $scope.noMoreItems = false;
        $scope.loadItem = function() {
            var offset = $scope.products.length == 0 ? firstLoadOffset : $scope.products.length
            var limit  = $scope.products.length == 0 ? firstLoadLimit : 5
            WishListItem.all(offset, limit).success(function(products) {
                if (products.length != 0) {
                    $scope.products = $scope.products.concat(products)
                } else {
                    $scope.noMoreItems = true;
                }
                $scope.$broadcast('scroll.infiniteScrollComplete')
            });
        }
    });