angular.module('encore.ui.rxApp', ['encore.ui.rxEnvironment', 'ngSanitize', 'ngRoute', 'cfp.hotkeys'])
// This service creates an instance of AppRoutes that is used for the Encore App nav
.service('encoreRoutes', function (rxAppRoutes, routesCdnPath, rxNotify, $q, $http) {
    var encoreRoutes = new rxAppRoutes();

    var setFailureMessage = function () {
        rxNotify.add('Error loading site navigation', {
            type: 'error'
        });
    };

    encoreRoutes.fetchRoutes = function () {
        return $http.get(routesCdnPath)
            .success(encoreRoutes.setAll)
            .error(setFailureMessage);
    };

    return encoreRoutes;
})
/**
* @ngdoc directive
* @name encore.ui.rxApp:rxApp
* @restrict E
* @scope
* @description
* Responsible for creating the HTML necessary for a common Encore layout.
*
* @param {string} [siteTitle] Title of site to use in upper right hand corner
* @param {array} [menu] Menu items used for left-hand navigation
* @param {string} [collapsibleNav] Set to 'true' if the navigation menu should be collapsible
* @param {string} [collapsedNav] Binding for the collapsed state of the menu.
* @param {boolean} [newInstance] Whether the menu items should be a new instance of rxAppRoutes
* @param {boolean} [hideFeeback] Whether to hide the 'feedback' link or not (defaults to show it)
* @param {string} [logoutUrl] URL to pass to rx-logout
*
* @example
* <pre>
*     <rx-app site-title="Custom Title"></rx-app>
* </pre>
*/
.directive('rxApp', function (encoreRoutes, rxAppRoutes, hotkeys, Environment) {
    return {
        restrict: 'E',
        transclude: true,
        templateUrl: 'templates/rxApp.html',
        scope: {
            siteTitle: '@?',
            menu: '=?',
            collapsibleNav: '@',
            collapsedNav: '=?',
            newInstance: '@?',
            hideFeedback: '@?',
            logoutUrl: '@?'
        },
        link: function (scope) {
            scope.isPreProd = Environment.isPreProd();

            // default hideFeedback to false
            var appRoutes = scope.newInstance ? new rxAppRoutes() : encoreRoutes;

            // we only want to set new menu data if a new instance of rxAppRoutes was created
            // or if scope.menu was defined
            if (scope.newInstance || scope.menu) {
                appRoutes.setAll(scope.menu);
            } else {
                // if the default menu is needed, load it from the CDN
                appRoutes.fetchRoutes();
            }

            appRoutes.getAll().then(function (routes) {
                scope.routes = routes;
            });

            // default hideFeedback to false
            scope.hideFeedback = scope.hideFeedback ? true : false;

            if (scope.collapsibleNav) {
                hotkeys.add({
                    combo: 'h',
                    description: 'Show/hide the main menu',
                    callback: function () {
                        scope.collapsedNav = !scope.collapsedNav;
                    }
                });
            }
        }
    };
})
/**
* @ngdoc directive
* @name encore.ui.rxApp:rxPage
* @restrict E
* @scope
* @description
* Responsible for creating the HTML necessary for a page (including breadcrumbs and page title)
*
* @param {expression} [title] Title of page
* @param {expression} [subtitle] Subtitle of page
*
* @example
* <pre>
*     <rx-page title="'Page Title'"></rx-page>
* </pre>
*/
.directive('rxPage', function () {
    return {
        restrict: 'E',
        transclude: true,
        templateUrl: 'templates/rxPage.html',
        scope: {
            title: '=',
            subtitle: '=',
        },
        link: function (scope, element) {
            // Remove the title attribute, as it will cause a popup to appear when hovering over page content
            // @see https://github.com/rackerlabs/encore-ui/issues/251
            element.removeAttr('title');
        },
        controller: function ($scope, rxPageTitle) {
            $scope.$watch('title', function () {
                rxPageTitle.setTitle($scope.title);
            });
        }
    };
})
/**
* @ngdoc directive
* @name encore.ui.rxApp:rxAppNav
* @restrict E
* @scope
* @description
* Creates a menu based on items passed in.
*
* @param {object} items Menu items to display. See encoreNav for object definition
* @param {string} level Level in heirarchy in page. Higher number is deeper nested
*
* @example
* <pre>
*     <rx-app-nav level="1" items="menuItems"></rx-app-nav>
* </pre>
*/
.directive('rxAppNav', function () {
    return {
        restrict: 'E',
        replace: true,
        templateUrl: 'templates/rxAppNav.html',
        scope: {
            items: '=',
            level: '='
        }
    };
})
/**
* @ngdoc directive
* @name encore.ui.rxApp:rxAppNavItem
* @restrict E
* @description
* Creates a menu item. Recursively creates rx-app-nav if 'children' present.
* 'Item' must be avialable via scope
*
* @example
* <pre>
*     <rx-app-nav-item ng-repeat="item in items"></rx-app-nav-item>
* </pre>
*/
.directive('rxAppNavItem', function ($compile, $location, $route) {
    var linker = function (scope, element) {
        var injectContent = function (selector, content) {
            var el = element[0].querySelector(selector);
            el = angular.element(el);

            $compile(content)(scope, function (compiledHtml) {
                el.append(compiledHtml);
            });
        };

        var directiveHtml = '<directive></directive>';
        // add navDirective if defined
        if (angular.isString(scope.item.directive)) {
            // convert directive string to HTML
            // e.g. my-directive -> <my-directive></my-directive>
            directiveHtml = directiveHtml.replace('directive', scope.item.directive);

            injectContent('.item-directive', directiveHtml);
        }

        // increment nesting level for child items
        var childLevel = scope.$parent.level + 1;
        // safety check that child level is a number
        if (isNaN(childLevel)) {
            childLevel = 2;
        }
        // add children if present
        // Note: this can't be added in the HTML due to angular recursion issues
        var rxNavTemplate = '<rx-app-nav items="item.children" level="' + childLevel + '">' +
            '</rx-app-nav>';
        if (angular.isArray(scope.item.children)) {
            injectContent('.item-children', rxNavTemplate);
        }
    };

    return {
        restrict: 'E',
        replace: true,
        templateUrl: 'templates/rxAppNavItem.html',
        link: linker,
        scope: {
            item: '='
        },
        controller: function ($scope, $location) {
            // provide `route` as a scope property so that links can tie into them
            $scope.route = $route;

            $scope.isVisible = function (visibility) {
                if (_.isUndefined(visibility)) {
                    // if undefined, default to true
                    return true;
                }

                return $scope.$eval(visibility, {
                    location: $location
                });
            };

            $scope.toggleNav = function (ev, href) {
                // if no href present, simply toggle active state
                if (_.isEmpty(href)) {
                    ev.preventDefault();
                    $scope.item.active = !$scope.item.active;
                }
                // otherwise, let the default nav do it's thing
            };
        }
    };
})
/**
* @ngdoc directive
* @name encore.ui.rxApp:rxAppSearch
* @restrict E
* @scope
* @description
* Creates a search input form for navigation
*
* @param {string} [placeholder] Title of page
* @param {*} [model] Model to tie input form to (via ng-model)
* @param {function} [submit] Function to run on submit (model is passed as only argument to function)
*
*/
.directive('rxAppSearch', function () {
    return {
        restrict: 'E',
        replace: true,
        templateUrl: 'templates/rxAppSearch.html',
        scope: {
            placeholder: '@?',
            model: '=?',
            submit: '=?',
            pattern: '@?'
        }
    };
})
/**
* @ngdoc directive
* @name encore.ui.rxApp:rxAtlasSearch
* @restrict E
* @description
* Used to search accounts for Cloud Atlas
*/
.directive('rxAtlasSearch', function ($window) {
    return {
        template: '<rx-app-search placeholder="Search by username..." submit="searchAccounts"></rx-app-search>',
        restrict: 'E',
        link: function (scope) {
            scope.searchAccounts = function (searchValue) {
                if (!_.isEmpty(searchValue)) {
                    $window.location = '/cloud/' + searchValue + '/servers/';
                }
            };
        }
    };
})
.directive('rxAccountSearch', function ($window) {
    return {
        templateUrl: 'templates/rxAccountSearch.html',
        restrict: 'E',
        link: function (scope) {
            scope.fetchAccount = function (searchValue) {
                if (!_.isEmpty(searchValue)) {
                    $window.location = '/search?term=' + searchValue;
                }
            };
        }
    };
})
.directive('rxBillingSearch', function ($window) {
    return {
        template: '<rx-app-search placeholder="Fetch account by transaction or auth ID..." submit="fetchAccounts">' +
            '</rx-app-search>',
        restrict: 'E',
        link: function (scope) {
            scope.fetchAccounts = function (searchValue) {
                if (!_.isEmpty(searchValue)) {
                    $window.location = '/billing/search/' + searchValue;
                }
            };
        }
    };
})

/**
* @ngdoc directive
* @name encore.ui.rxApp:rxTicketSearch
* @restrict E
* @description
* Used to search tickets for Ticket Queues
*/
.directive('rxTicketSearch', function () {
    return {
        template: '<rx-app-search placeholder="Search for a Ticket..." submit="searchTickets"></rx-app-search>',
        restrict: 'E',
        link: function (scope) {
            // TQTicketSelection.loadTicket.bind(TQTicketSelection)
            scope.searchTickets = function () {
                // TODO do something here
            };
        }
    };
});
