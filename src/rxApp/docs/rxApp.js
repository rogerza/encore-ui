/*jshint unused:false*/
function rxAppCtrl ($scope, $location, $rootScope, $window, rxAppRoutes) {
    $scope.subtitle = 'With a subtitle';

    $scope.changeSubtitle = function () {
        $scope.subtitle = 'With a new subtitle at ' + Date.now();
    };

    $scope.changeRoutes = function () {
        var newRoute = {
            linkText: 'Updated Route',
            childVisibility: 'true',
            children: [
                {
                    linkText: 'New child route'
                }
            ]
        };

        rxAppRoutes.setRouteByKey('acctLvlTools', newRoute);
    };

    // Fake navigation
    var customApp = document.getElementById('custom-rxApp');
    customApp.addEventListener('click', function (ev) {
        var target = ev.target;

        if (target.className.indexOf('item-link') > -1) {
            // prevent the default jump to top
            ev.preventDefault();

            var href = target.getAttribute('href');

            // update angular location (if href has a value)
            if (!_.isEmpty(href)) {
                // we need to prevent the window from scrolling (the demo does this)
                // so we get the current scrollTop position
                // and set it after the demo page has run '$routeChangeSuccess'
                var currentScollTop = document.body.scrollTop;

                $location.hash(href);

                $rootScope.$apply();

                $window.scrollTo(0, currentScollTop);
            }
        }
    });

    var searchDirective = 'rx-app-search placeholder="Enter User" model="$root.user"';

    $scope.customMenu = [{
        title: 'Example Menu',
        children: [
            {
                href: 'Lvl1-1',
                linkText: '1st Order Item'
            },
            {
                linkText: '1st Order Item (w/o href) w/ Children',
                childVisibility: function isUserDefined () {
                    return !_.isEmpty($rootScope.user);
                },
                childHeader: '<strong class="current-search">Current User:</strong>' +
                             '<span class="current-result">{{$root.user}}</span>',
                directive: searchDirective,
                children: [
                    {
                        href: 'Lvl1-2-Lvl2-1',
                        linkText: '2nd Order Item w/ Children',
                        children: [{
                            href: 'Lvl1-2-Lvl2-1-Lvl3-1',
                            linkText: '3rd Order Item'
                        }]
                    },
                    {
                        href: 'Lvl1-2-Lvl2-2',
                        linkText: '2nd Order Item w/ Children',
                        children: [
                            {
                                href: 'Lvl1-2-Lvl2-2-Lvl3-1',
                                linkText: '3rd Order Item'
                            },
                            {
                                href: 'Lvl1-2-Lvl2-2-Lvl3-2',
                                linkText: '3rd Order Item'
                            },
                            {
                                href: 'Lvl1-2-Lvl2-2-Lvl3-3',
                                linkText: '3rd Order Item'
                            },
                            {
                                href: 'Lvl1-2-Lvl2-2-Lvl3-4',
                                linkText: '3rd Order Item'
                            }
                        ]
                    },
                    {
                        href: 'Lvl1-2-Lvl2-3',
                        linkText: '2nd Order Item'
                    }
                ]
            },
            {
                href: 'Lvl1-3',
                linkText: '1st Order Item w/ Children',
                children: [
                    {
                        href: 'Lvl1-3-Lvl2-1',
                        linkText: '2nd Order Item'
                    }
                ]
            }
        ]
    }];
}