angular.module('encore.ui.rxAppRoutes', [])
.service('urlUtils', function ($location, rxEnvironmentUrlFilter, $interpolate, $route) {
    var utils = {};

    // remove any preceding # and / from the URL for cleaner comparison
    utils.stripLeadingChars = function (url) {
        // http://regexr.com/39coc
        var leadingChars = /^((?:\/|#)+)/;

        return url.replace(leadingChars, '');
    };

    // remove any trailing /'s from the URL
    utils.stripTrailingSlash = function (url) {
        // Match a forward slash / at the end of the string ($)
        var trailingSlash = /\/$/;

        return url.replace(trailingSlash, '');
    };

    // Given a URL, split it on '/' and return all the non-empty components
    utils.getChunks = function (url) {
        if (!_.isString(url)) {
            return [''];
        }
        return _.filter(url.split('/'), function (chunk) {
            return chunk !== '';
        });
    };

    // get the current path, adding the <base> path if neeeded
    //
    // @example
    // if the current page url is 'http://localhost:9000/encore-ui/#/overviewPage#bookmark?book=harry%20potter'
    // and the page contains a <base href="encore-ui"> tag
    // getCurrentPath() would return '/encore-ui/overviewPage'
    utils.getCurrentPathChunks = function () {
        var fullPath;
        var base = document.getElementsByTagName('base');
        var basePath = '';

        if (base.length > 0) {
            basePath = base[0].getAttribute('href');

            // remove trailing '/' if present
            basePath = utils.stripTrailingSlash(basePath);
        }

        fullPath = basePath + $location.path();
        fullPath = utils.stripLeadingChars(fullPath);

        return utils.getChunks(fullPath);
    };

    // get the url defined in the route by removing the hash tag, leading slashes and query string
    // e.g. '/#/my/url?param=1' -> 'my/url'
    utils.getItemUrl = function (item) {
        if (!_.isString(item.url)) {
            return undefined;
        }

        // remove query string
        var itemUrl = item.url.split('?')[0];
        itemUrl = utils.stripLeadingChars(itemUrl);

        return itemUrl;
    };

    // For a given route item, grab its defined URL, and see
    // if it matches the currentPathChunks
    utils.isActive = function (item, currentPathChunks) {
        var itemUrlChunks = utils.getChunks(utils.getItemUrl(item));
        var numChunks = itemUrlChunks.length;

        // check against the path and the hash
        // (in case the difference is the 'hash' like on the encore-ui demo page)
        var pathMatches = utils.matchesSubChunks(currentPathChunks, itemUrlChunks, numChunks);
        if (!pathMatches) {
            utils.matchesSubChunks(utils.getChunks($location.hash()), itemUrlChunks, numChunks);
        }

        // if current item not active, check if any children are active
        // This requires that `isActive` was called on all the children beforehand
        if (!pathMatches && item.children) {
            pathMatches = _.any(item.children, 'active');
        }

        return pathMatches;
    };

    utils.buildUrl = function (url) {
        // sometimes links don't have URLs defined, so we need to exit before $interpolate throws an error
        if (_.isUndefined(url)) {
            return url;
        }

        // run the href through rxEnvironmentUrl in case it's defined as such
        url = rxEnvironmentUrlFilter(url);

        if ($route.current) {
            // convert any nested expressions to defined route params
            url = $interpolate(url)($route.current.pathParams);
        }

        return url;
    };

    // Given two sets of chunks, check if the first `numChunks` of `firstChunks`
    // matches `subChunks`
    utils.matchesSubChunks = function (firstChunks, subChunks, numChunks) {
        return _.isEqual(firstChunks.slice(0, numChunks), subChunks);
    };

    return utils;
})
/**
* @ngdoc interface
* @name encore.ui.rxApp:AppRoutes
* @description
* Manages page routes, building urls and marking them as active on route change
*/
.factory('rxAppRoutes', function ($rootScope, $log, urlUtils) {
    var AppRoutes = function (routes) {
        routes = routes || [];
        var currentPathChunks;

        // we need to get the current path on page load
        currentPathChunks = urlUtils.getCurrentPathChunks();

        var setDynamicProperties = function (routes) {
            _.each(routes, function (route) {
                // build out url for current route
                route.url = urlUtils.buildUrl(route.href);

                // check if any children exist, if so, build their URLs as well
                if (route.children) {
                    route.children = setDynamicProperties(route.children);
                }

                // set active state (this needs to go after the recursion,
                // so that the URL is built for all the children)
                route.active = urlUtils.isActive(route, currentPathChunks);
            });

            return routes;
        };

        var getRouteIndex = function (key, routes) {
            var routeIndex;
            var routeAlreadyFound = false;

            _.forEach(routes, function (route, index) {
                var foundThisTime = false;
                if (route.key === key) {
                    routeIndex = [index];
                    foundThisTime = true;
                } else if ('children' in route) {
                    // if there are children in the route, we need to search through them as well
                    var childIndex = getRouteIndex(key, route.children);
                    if (childIndex) {
                        routeIndex = [index].concat(childIndex);
                        foundThisTime = true;
                    }
                }
                if (foundThisTime) {
                    if (routeAlreadyFound) {
                        $log.warn('Duplicate routes found for key: ' + key);
                    } else {
                        routeAlreadyFound = true;
                    }
                }
            });

            return routeIndex;
        };

        var updateRouteByIndex = function (indexes, routeInfo, routes, level) {
            var route = routes[indexes[0]];

            if (level < indexes.length - 1) {
                // if there's more than one index, we need to recurse down a level
                route.children = updateRouteByIndex(indexes.slice(1), routeInfo, route.children, level + 1);
            } else {
                _.assign(route, routeInfo);
            }

            return routes;
        };

        $rootScope.$on('$locationChangeSuccess', function () {
            // NOTE: currentPath MUST be updated before routes
            currentPathChunks = urlUtils.getCurrentPathChunks();

            routes = setDynamicProperties(routes);
        });

        return {
            /**
             * Finds the indexes/path to a route. Will return last match if duplicate keys exist
             * @see setRouteByKey for actual use
             * @param  {string} key Route Key
             * @example
             *     var myRouteIndex = rxAppRoutes.getIndexByKey('myKey'); // [0, 2, 0]
             * @return {array|undefined} array of indexes describing path to route (or undefined if not found)
             */
            getIndexByKey: function (key) {
                var routeIndex = getRouteIndex(key, routes);

                if (_.isUndefined(routeIndex)) {
                    $log.debug('Could not find route by key: ', key);
                }

                return routeIndex;
            },
            /**
             * functionality to update routes based on their key
             * @param {string} key Route key used to identify it in navigation
             * @param {object} routeInfo Information used to overwrite original properties
             * @return {boolean} true if successfully updated, false if key not found
             */
            setRouteByKey: function (key, routeInfo) {
                var routeIndex = this.getIndexByKey(key);

                // make sure the key was found
                if (routeIndex) {
                    routes = updateRouteByIndex(routeIndex, routeInfo, routes, 0);

                    // now that we've updated the route info, we need to reset the dynamic properties
                    routes = setDynamicProperties(routes);

                    return true;
                } else {
                    return false;
                }
            },
            getAll: function () {
                return routes;
            },
            setAll: function (newRoutes) {
                routes = setDynamicProperties(newRoutes);
            }
        };
    };

    return AppRoutes;
});