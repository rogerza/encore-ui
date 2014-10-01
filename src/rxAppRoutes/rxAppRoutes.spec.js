/* jshint node: true */
describe('rxAppRoutes', function () {
    var appRoutes, envSvc, generatedRoutes, location, rootScope, log;

    var fakeRoutes = [{
        href: { tld: 'example', path: 'myPath' },
        key: 'root',
        children: [
            {
                href: '/{{user}}/1-1',
                key: 'firstChild',
                children: [
                    {
                        linkText: '1st-1st-1st',
                        key: 'firstChildChild',
                    }
                ]
            },
            {
                href: '/1-2',
                key: 'secondChild',
            }
        ]
    }, {
        href: '/base/path'
    }];

    // mock out route to have param which will replace '{{user}}'
    var route = {
        current: {
            pathParams: {
                user: 'me'
            }
        }
    };

    var duplicateKeyRoutes = [{
        href: '/r/BrokenGifs',
        key: 'dupeKey'
    }, {
        href: '/r/wheredidthesodago',
        key: 'nonDupeKey',
        children: [{
            href: '/r/funny',
            key: 'dupeKey'
        }, {
            href: '/r/noKey'
        }]
    }, {
        href: '/r/rogecoin',
        key: 'suchDupes'
    }];

    beforeEach(function (done) {
        // load module
        module('encore.ui.rxAppRoutes');
        module('encore.ui.rxEnvironment');
        module('encore.ui.rxNotify');

        // Provide any mocks needed
        module(function ($provide) {
            $provide.value('$route', route);
        });

        // Inject in angular constructs
        inject(function (rxAppRoutes, Environment, $location, $rootScope, $log) {
            appRoutes = new rxAppRoutes();
            envSvc = Environment;
            location = $location;
            rootScope = $rootScope;
            log = $log;
        });

        // set environment to build from
        sinon.stub(envSvc, 'get').returns({
            name: 'staging',
            pattern: /\/\/staging\.(?:.*\.)?com/,
            url: '{{tld}}/{{path}}'
        });

        appRoutes.getAll().then(function (routes) {
            generatedRoutes = routes;

            done();
        });

        appRoutes.setAll(fakeRoutes);

        // we have to digest to let all the promises resolve
        rootScope.$digest();
    });

    afterEach(function () {
        log.reset();
    });

    it('should build url property from rxEnvironmentUrl', function () {
        // first item should have generated URL based on staging href
        expect(generatedRoutes[0].url).to.equal('example/myPath');

        // child item should have default href, since it's just a string
        expect(generatedRoutes[0].children[1].url).to.equal(fakeRoutes[0].children[1].href);
    });

    it('should build urls from route path params', function () {
        // child item should have 'me' in place of '{{user}}'
        expect(generatedRoutes[0].children[0].url).to.equal('/me/1-1');
    });

    it('should ignore links that are not defined', function () {
        expect(generatedRoutes[0].children[0].children[0].url).to.be.undefined;
    });

    describe('active state', function () {
        it('should match based on URL', function () {
            expect(generatedRoutes[0].active, 'route should not be active by default').to.be.false;

            // update location
            location.path(generatedRoutes[0].url);
            rootScope.$apply();

            // sanity check that location actually changed
            expect(location.path()).to.equal('/' + generatedRoutes[0].url);

            expect(generatedRoutes[0].active, 'route should be active when path changes').to.be.true;

            // update location again to somewhere else
            location.path('somewhereElse');
            rootScope.$apply();

            expect(generatedRoutes[0].active, 'route should no longer be active').to.be.false;
        });

        it('should match with a base HTML tag', function (done) {
            var routeParts = fakeRoutes[1].href.split('/');
            var basePath = routeParts[1];
            var subPath = routeParts[2];

            // add a base tag to the page
            $(document.head).append($('<base href="/' + basePath + '/">'));

            // we have to mock out location.path because Angular doesn't pick up on the basePath update
            location.path(generatedRoutes[1].url);

            sinon.stub(location, 'path').returns('/' + subPath);

            rootScope.$apply();

            appRoutes.getAll().then(function (routes) {
                expect(routes[1].active, 'route should be active').to.be.true;

                done();
            });

            rootScope.$apply();

            location.path.restore();
            // restore test state
            $('base').remove();
        });

        it('should match if child element is active', function () {
            expect(generatedRoutes[0].active, 'route should not be active by default').to.be.false;

            // update location
            location.path(generatedRoutes[0].children[0].url);
            rootScope.$apply();

            expect(generatedRoutes[0].active, 'route should be active when child activated').to.be.true;

            // update location again to somewhere else
            location.path('somewhereElse');
            rootScope.$apply();

            expect(generatedRoutes[0].active, 'route should no longer be active').to.be.false;
        });

        it('should match when we navigate to subpaths of a child', function () {
            expect(generatedRoutes[0].active, 'route should not be active by default').to.be.false;

            // update location
            location.path(generatedRoutes[0].children[0].url + '/some/details/view/');
            rootScope.$apply();

            expect(generatedRoutes[0].active, 'route should be active when child activated').to.be.true;

            // update location again to somewhere else
            location.path('somewhereElse');
            rootScope.$apply();

            expect(generatedRoutes[0].active, 'route should no longer be active').to.be.false;

        });
    });

    it('should allow overwritting all the nav items', function () {
        var newRoutes = [{
            href: '/r/BrokenGifs'
        }];

        appRoutes.setAll(newRoutes);

        return appRoutes.getAll().then(function (routes) {
            expect(routes[0].url).to.equal(newRoutes[0].href);
        });
    });

    it('should allow getting route index by key', function () {
        var rootRouteIndex = appRoutes.getIndexByKey('root');
        expect(rootRouteIndex, 'root round index').to.eventually.eql([0]);

        return rootRouteIndex.then(function (index) {
            expect(generatedRoutes[index[0]].url).to.equal('example/myPath');
        });
    });

    it('should allow getting nested route index by key', function () {
        var firstChild = appRoutes.getIndexByKey('firstChild');
        expect(firstChild, 'child route index').to.eventually.eql([0, 0]);

        var firstChildChild = appRoutes.getIndexByKey('firstChildChild');
        expect(firstChildChild, 'child child route index').to.eventually.eql([0, 0, 0]);

        var secondChild = appRoutes.getIndexByKey('secondChild');
        expect(secondChild, 'child route index').to.eventually.eql([0, 1]);
    });

    it('should not warn if no duplicate keys found', function () {
        appRoutes.setAll(duplicateKeyRoutes);

        // shouldn't warn when searching non-dupe keys
        return appRoutes.getIndexByKey('nonDupeKey').then(function () {
            expect(log.warn.logs.length).to.equal(0);
        });
    });

    it('should warn if duplicate keys found', function () {
        appRoutes.setAll(duplicateKeyRoutes);

        // find index w/duplicate key
        var index = appRoutes.getIndexByKey('dupeKey');

        // should return last match
        expect(index).to.eventually.eql([1, 0]);

        // should log a message about duplicate keys
        return index.then(function () {
            expect(log.warn.logs.length).to.equal(1);
        });
    });

    describe('setRouteByKey', function () {
        it('should allow updating a nav item by key', function (done) {
            var newRouteData = {
                href: { tld: 'example', path: 'myOtherPath' }
            };

            // try updating the root element
            appRoutes.setRouteByKey('root', newRouteData).then(function () {
                appRoutes.getAll().then(function (routes) {
                    // get the root route
                    var root = routes[0];

                    // check that it was updated
                    expect(root.href).to.equal(newRouteData.href);
                    expect(root.url).to.equal('example/myOtherPath');

                    // check the first child wasn't modified
                    expect(root.children[0].href).to.equal('/{{user}}/1-1');
                    expect(root.children[0].url).to.equal('/me/1-1');

                    done();
                });
            });

            rootScope.$digest();
        });

        it('should allow updating a child item by key', function (done) {
            // try updating a child item
            var updatedFirstChild = {
                href: 'anotherRoute'
            };

            appRoutes.setRouteByKey('firstChild', updatedFirstChild).then(function () {
                appRoutes.getAll().then(function (routes) {
                    var root = routes[0];

                    // check that parent wasn't modified
                    expect(root.href).to.eql(fakeRoutes[0].href);
                    expect(root.url).to.equal('example/myPath');

                    var firstChild = root.children[0];
                    // check that the first child was updated
                    expect(firstChild.href).to.eql(updatedFirstChild.href);
                    expect(firstChild.url).to.equal(updatedFirstChild.href);

                    // check that the first child's children are still around
                    var originalNestedChild = fakeRoutes[0].children[0].children[0];
                    expect(firstChild.children[0].linkText).to.equal(originalNestedChild.linkText);

                    done();
                });
            });

            rootScope.$digest();
        });

        it('should allow updating the children property', function (done) {
            // try adding children to an item
            var updatedSecondChild = {
                href: 'someOtherRoute',
                children: [{
                    href: 'yetAnotherRoute'
                }]
            };
            appRoutes.setRouteByKey('secondChild', updatedSecondChild).then(function () {
                appRoutes.getAll().then(function (routes) {
                    // check that the second child was updated
                    expect(routes[0].children[1].href).to.equal(updatedSecondChild.href);

                    // check that the second child now has children
                    var newChild = routes[0].children[1].children[0];
                    expect(newChild.href).to.equal(updatedSecondChild.children[0].href);
                    expect(newChild.url).to.equal(updatedSecondChild.children[0].href);

                    done();
                });
            });

            rootScope.$digest();
        });
    });
});

describe('urlUtils', function () {
    var urlutils;
    var route = {
        current: {
            pathParams: {
                user: 'me'
            }
        }
    };

    beforeEach(function () {
        module('encore.ui.rxAppRoutes');
        module('encore.ui.rxEnvironment');
        // Provide any mocks needed
        module(function ($provide) {
            $provide.value('$route', route);
        });

        inject(function (urlUtils) {
            urlutils = urlUtils;
        });
    });

    describe('stripLeadingChars', function () {
        it('should strip leading # and /', function () {
            expect(urlutils.stripLeadingChars('##foo'), '##foo').to.equal('foo');
            expect(urlutils.stripLeadingChars('//##bar'), '//##bar').to.equal('bar');
            expect(urlutils.stripLeadingChars('//bar'), '//bar').to.equal('bar');
            expect(urlutils.stripLeadingChars('//##bar'), '//##bar').to.equal('bar');
            expect(urlutils.stripLeadingChars('##//bar'), '##//bar').to.equal('bar');
        });

        it('should not strip inside # or /', function () {
            expect(urlutils.stripLeadingChars('foo#bar')).to.equal('foo#bar');
            expect(urlutils.stripLeadingChars('foo/bar')).to.equal('foo/bar');
        });

    });

    describe('stripTrailingSlash', function () {
        it('should remove trailing slash',  function () {
            expect(urlutils.stripTrailingSlash('foo/')).to.equal('foo');
        });

        it('should not remove inside /', function () {
            expect(urlutils.stripTrailingSlash('foo/bar')).to.equal('foo/bar');
        });
    });

    describe('getChunks', function () {
        it('should return non-empty chunks', function () {
            var url = '//abc/def//ghi';
            expect(urlutils.getChunks(url)).to.deep.equal([ 'abc', 'def', 'ghi' ]);
        });

        it('should return an empty string in an array on non-string entry', function () {
            expect(urlutils.getChunks(undefined)).to.deep.equal(['']);
        });
    });

    describe('getFullPath', function () {
        // Provide any mocks needed
        var route;
        module(function ($provide) {
            $provide.value('$document', route);
        });
        
    });

    describe('getCurrentPathChunks', function () {
        var originalGetFullPath;
        before(function () {
            originalGetFullPath = urlutils.getFullPath;
        });

        after(function () {
            urlutils.getFullPath = originalGetFullPath;
        });

        it('should have correct chunks with no base', function () {
            var url = '/encore-ui/#/overviewPage';
            urlutils.getFullPath = function () { return url; };

            expect(urlutils.getCurrentPathChunks()).to.deep.equal(['encore-ui', '#', 'overviewPage']);
                
        });

    });

    describe('getItemUrl', function () {
        it('should remove leading slashes, hash tags and query string', function () {
            var item = { url: '/#/my/url?param=1' };
            expect(urlutils.getItemUrl(item)).to.equal('my/url');
        });

        it('should return undefined if `url` is not present on item', function () {
            expect(urlutils.getItemUrl({})).to.equal(undefined);
        });
        
    });

    describe('isActive', function () {
        it('should be active on an exact match', function () {
            var item = { url: '/foo/bar' };
            var currentPathChunks = [ 'foo', 'bar' ];
            expect(urlutils.isActive(item, currentPathChunks), 'item: /foo/bar').to.be.true;
        });

        it('should not be active if the item url is longer than the current url', function () {
            var item = { url: '/foo/bar/blah' };
            var currentPathChunks = [ 'foo', 'bar' ];
            expect(urlutils.isActive(item, currentPathChunks), 'item: /foo/bar/blah').to.be.false;
        });
        
        it('should not be active if the item has no url', function () {
            var item = {};
            var currentPathChunks = [ 'foo', 'bar' ];
            expect(urlutils.isActive(item, currentPathChunks), 'item: /foo').to.be.false;
        });

        it('should be active if the item has no url but a child item is active', function () {
            var item = {
                children: [
                    { url: '/foo/bar/blah' }
                ]
            };
            var currentPathChunks = [ 'foo', 'bar', 'blah' ];
            expect(urlutils.isActive(item, currentPathChunks), 'false before checking children').to.be.false;
            expect(urlutils.isActive(item.children[0], currentPathChunks), 'child is active').to.be.true;
            item.children[0].active = true;
            expect(urlutils.isActive(item, currentPathChunks), 'active now that child is active').to.be.true;
        });

    });

    describe('mathesSubChunks', function () {
        it('should match if the first n chunks match', function () {
            var first = ['a', 'b', 'c', 'd'];
            var second = ['a', 'b'];
            expect(urlutils.matchesSubChunks(first, second, 2)).to.be.true;
        });

        it('should not match if the first elements are different', function () {
            expect(urlutils.matchesSubChunks(['a'], ['b'], 1)).to.be.false;
        });

        it('should not match if the first n-1 match but the nth does not', function () {
            var first = ['a', 'b', 'c', 'd'];
            var second = ['a', 'b', 'c', 'XYZ'];
            expect(urlutils.matchesSubChunks(first, second, 4)).to.be.false;
        });

        it('should not match if numChunks is shorter than the length of subChunks', function () {
            var first = ['a', 'b', 'c', 'd'];
            var second = ['a', 'b', 'c', 'd'];
            expect(urlutils.matchesSubChunks(first, second, second.length - 1)).to.be.false;
        });
    });
    
});
