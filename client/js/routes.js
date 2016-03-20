
angular.module('takeout').config(function ($urlRouterProvider, $stateProvider, $locationProvider) {
    $locationProvider.html5Mode(true);

    $stateProvider
        .state('home', {
            url: "/",
            views: {
                'nav': { template: '<navbar></navbar>' },
                'main': { template: '<home></home>' }
            }
        })
        .state('signup', {
            url: "/signup",
            views: {
                'nav': { template: '<navbar2></navbar2>' },
                'main': { template: '<signup></signup>' }
            }
        })
        .state('logout', {
            url: '/logout',
            resolve: {
                "logout": function ($meteor, $state) {
                    return $meteor.logout().then(function () {
                        $state.go('signup');
                    }, function (err) {
                        console.log('logout error - ', err);
                    });
                }
            }
        })
        .state('profile', {
            url: "/profile",
            views: {
                'nav': { template: '<navbar2></navbar2>' },
                'main': { template: '<profile></profile>' }
            }
        })
        .state('itemslist', {
            url: "/itemslist",
            views: {
                'nav': { template: '<navbar2></navbar2>' },
                'main': { template: '<itemslist></itemslist>' }
            }
        })
        .state('additem', {
            url: "/addItem",
            views: {
                'nav': { template: '<navbar2></navbar2>' },
                'main': { template: '<addnewitem></addnewitem>' }
            }
        })
        .state('itemDetails', {
            url: "/item/:itemId",
            views: {
                'nav': { template: '<navbar2></navbar2>' },
                'main': { template: '<itemdetails></itemdetails>' }
            }
        });


    $urlRouterProvider.otherwise("/");      // have a 404 page
});
