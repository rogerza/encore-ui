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

    beforeEach(function () {
        // load module
        module('encore.ui.rxApp');
        module('encore.ui.rxEnvironment');

        // Provide any mocks needed
        module(function ($provide) {
            $provide.value('$route', route);
        });

        // Inject in angular constructs
        inject(function (rxAppRoutes, Environment, $location, $rootScope, $log) {
            appRoutes = rxAppRoutes;
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

        appRoutes.setAll(fakeRoutes);
        generatedRoutes = appRoutes.getAll();
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

        it('should match with a base HTML tag', function () {
            var routeParts = fakeRoutes[1].href.split('/');
            var basePath = routeParts[1];
            var subPath = routeParts[2];

            // add a base tag to the page
            $(document.head).append($('<base href="/' + basePath + '/">'));

            // we have to mock out location.path because Angular doesn't pick up on the basePath update
            sinon.stub(location, 'path').returns('/' + subPath);

            location.path(generatedRoutes[1].url);
            rootScope.$apply();

            expect(generatedRoutes[1].active, 'route should be active').to.be.true;

            // restore test state
            location.path.restore();
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

        expect(appRoutes.getAll()[0].url).to.equal(newRoutes[0].href);
    });

    it('should allow getting route index by key', function () {
        var rootRouteIndex = appRoutes.getIndexByKey('root');

        expect(rootRouteIndex, 'root round index').to.eql([0]);
        expect(generatedRoutes[rootRouteIndex[0]].url).to.equal('example/myPath');

        // check recusive functionality
        var childIndex = appRoutes.getIndexByKey('firstChild');
        expect(childIndex, 'child route index').to.eql([0, 0]);

        var childChildIndex = appRoutes.getIndexByKey('firstChildChild');
        expect(childChildIndex, 'child child route index').to.eql([0, 0, 0]);

        var secondChildIndex = appRoutes.getIndexByKey('secondChild');
        expect(secondChildIndex, 'second child index').to.eql([0, 1]);
    });

    it('should warn if duplicate keys found', function () {
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

        appRoutes.setAll(duplicateKeyRoutes);

        // shouldn't warn when searching non-dupe keys
        appRoutes.getIndexByKey('nonDupeKey');
        expect(log.warn.logs.length).to.equal(0);

        // find index w/duplicate key
        var index = appRoutes.getIndexByKey('dupeKey');

        // should return last match
        expect(index).to.eql([1, 0]);

        // should log a message about duplicate keys
        expect(log.warn.logs.length).to.equal(1);
    });

    describe('setRouteByKey', function () {
        it('should allow updating a nav item by key', function () {
            var newRouteData = {
                href: { tld: 'example', path: 'myOtherPath' }
            };

            // try updating the root element
            appRoutes.setRouteByKey('root', newRouteData);

            var root = appRoutes.getAll()[0];

            // check that it was updated
            expect(root.href).to.equal(newRouteData.href);
            expect(root.url).to.equal('example/myOtherPath');

            // check the first child wasn't modified
            expect(root.children[0].href).to.equal('/{{user}}/1-1');
            expect(root.children[0].url).to.equal('/me/1-1');
        });

        it('should allow updating a child item by key', function () {
            // try updating a child item
            var updatedFirstChild = {
                href: 'anotherRoute'
            };
            appRoutes.setRouteByKey('firstChild', updatedFirstChild);

            var root = appRoutes.getAll()[0];

            // check that parent wasn't modified
            expect(root.href).to.equal(fakeRoutes[0].href);
            expect(root.url).to.equal('example/myOtherPath');

            var firstChild = root.children[0];
            // check that the first child was updated
            expect(firstChild.href).to.equal(updatedFirstChild.href);
            expect(firstChild.url).to.equal(updatedFirstChild.href);

            // check that the first child's children are still around
            var originalNestedChild = fakeRoutes[0].children[0].children[0];
            expect(firstChild.children[0].linkText).to.equal(originalNestedChild.linkText);
        });

        it('should allow updating the children property', function () {
            // try adding children to an item
            var updatedSecondChild = {
                href: 'someOtherRoute',
                children: [{
                    href: 'yetAnotherRoute'
                }]
            };
            appRoutes.setRouteByKey('secondChild', updatedSecondChild);

            // check that the second child was updated
            expect(appRoutes.getAll()[0].children[1].href).to.equal(updatedSecondChild.href);

            // check that the second child now has children
            var newChild = appRoutes.getAll()[0].children[1].children[0];
            expect(newChild.href).to.equal(updatedSecondChild.children[0].href);
            expect(newChild.url).to.equal(updatedSecondChild.children[0].href);
        });
    });
});