/* jshint node: true */
describe('rxApp', function () {
    var scope, scopeCustomNav, collapsibleScope, compile, rootScope, el, elCustom, elCollapsible,
        elCollapsibleVar, appRoutes, httpMock, cdnPath, cdnGet;
    var standardTemplate = '<rx-app></rx-app>';
    var collapsibleTemplate = '<rx-app collapsible-nav="true"></rx-app>';
    var collapsibleExternalVarTemplate = '<rx-app collapsible-nav="true" collapsed-nav="collapsed"></rx-app>';
    var customTemplate = '<rx-app site-title="My App" menu="customNav" new-instance="true"' +
        'hide-feedback="true"></rx-app>';

    // Fake default nav that gets passed as the mock cdn response
    var defaultNav = [{
        title: 'All Tools',
        children: [
            {
               'href': '/support',
               'linkText': 'Support Service',
               'key': 'supportService',
               'directive': 'rx-support-service-search'
           }
        ]
    }];

    var customNav = [{
        title: 'Example Menu',
        children: [
            {
                href: '/1',
                linkText: '1st Order Item'
            }
        ]
    }];

    var mockNotify = {
        add: sinon.stub()
    };

    beforeEach(function () {
        // load module
        module('encore.ui.rxApp');
        module('encore.ui.configs');
        module('encore.ui.rxNotify');

        // load templates
        module('templates/rxApp.html');
        module('templates/rxAppNav.html');
        module('templates/rxAppNavItem.html');
        module('templates/rxPage.html');
        module('templates/rxAppSearch.html');
        module('templates/rxAccountSearch.html');

        module(function ($provide) {
            $provide.value('rxNotify', mockNotify);
        });

        // Inject in angular constructs
        inject(function ($rootScope, $compile, encoreRoutes, $httpBackend, routesCdnPath) {
            rootScope = $rootScope;
            compile = $compile;
            appRoutes = encoreRoutes;
            httpMock = $httpBackend;
            cdnPath = routesCdnPath.staging;
        });

        cdnGet = httpMock.whenGET(cdnPath);
        cdnGet.respond(defaultNav);

        scope = rootScope.$new();

        collapsibleScope = rootScope.$new();
        collapsibleScope.collapsed = false;

        scopeCustomNav = rootScope.$new();
        scopeCustomNav.customNav = customNav;

        el = helpers.createDirective(standardTemplate, compile, scope);
        elCustom = helpers.createDirective(customTemplate, compile, scopeCustomNav);
        elCollapsible = helpers.createDirective(collapsibleTemplate, compile, collapsibleScope);
        elCollapsibleVar = helpers.createDirective(collapsibleExternalVarTemplate, compile, rootScope.$new());
    });

    describe('default menu', function () {
        it('should have a default title', function () {
            // get page title element
            var pageTitle = el[0].querySelector('.site-title');

            // validate it matches 'Encore'
            expect($(pageTitle).text()).to.equal('Encore');
        });

        it('should load data from the CDN', function () {
            // get the nav data from the mock CDN
            httpMock.flush();

            // get first nav section
            var navTitle = el[0].querySelector('.nav-section-title');

            // validate it matches 'Encore'
            expect($(navTitle).text()).to.equal(defaultNav[0].title);
        });

        it('should show error message if CDN failed to load', function () {
            // make CDN request fail.
            cdnGet.respond(404);

            // get the nav data from the mock CDN
            httpMock.flush();

            // expect rxNotify to be called with error
            expect(mockNotify.add).to.be.calledWith(sinon.match('Error'), sinon.match({ type: 'error' }));
        });

        it('should have a feedback link if not disabled', function () {
            var feedbackLink = el[0].querySelector('rx-feedback');

            // validate it matches 'Encore'
            expect(feedbackLink).to.exist;

            var notFeedbackLink = elCustom[0].querySelector('rx-feedback');

            expect(notFeedbackLink).to.not.exist;
        });

        it('should not show the collapsible toggle if collapsible is not true', function () {
            var collapsibleToggle = el[0].querySelector('.collapsible-toggle');

            expect(collapsibleToggle).to.be.null;
        });

        it('should allow you to set the menu as collapsible', function () {
            var collapsibleToggle = elCollapsible[0].querySelector('.collapsible-toggle');

            expect(collapsibleToggle).to.be.ok;
        });

        it('should apply the classes to the menu for collapsible status', function () {
            var collapsibleMenu = elCollapsible[0].querySelector('.collapsible');

            expect(collapsibleMenu).to.be.not.null;
        });

        it('should apply the classes to the menu for collapsed status', function () {
            var elScope = elCollapsible.isolateScope();
            var collapsibleMenu = elCollapsible[0].querySelector('.collapsed');

            expect(collapsibleMenu).to.be.null;
            elScope.collapsedNav = true;

            // We need to run the digest to update the classes
            collapsibleScope.$digest();
            collapsibleMenu = elCollapsible[0].querySelector('.collapsed');
            expect(collapsibleMenu).to.be.not.null;
        });
    });

    describe('custom menu', function () {
        it('should allow you to override the default title', function () {
            // get page title element
            var pageTitle = elCustom[0].querySelector('.site-title');

            // validate it matches custom app name
            expect(pageTitle.textContent).to.equal('My App');
        });

        it('should allow you to override the default nav', function () {
            // get first nav section
            var navTitle = elCustom[0].querySelector('.nav-section-title');

            // validate it matches custom nav title
            expect(navTitle.textContent).to.equal(customNav[0].title);
        });
    });
});

describe('rxAppNav', function () {
    var scope, compile, rootScope, el;
    var template = '<rx-app-nav items="menuItems" level="1"></rx-app-nav>';

    var menuItems = [{
        href: '/1',
        linkText: '1st Order Item'
    }];

    beforeEach(function () {
        // load module
        module('encore.ui.rxApp');

        // load templates
        module('templates/rxAppNav.html');
        module('templates/rxAppNavItem.html');

        // Inject in angular constructs
        inject(function ($rootScope, $compile) {
            rootScope = $rootScope;
            scope = $rootScope.$new();
            compile = $compile;
        });

        scope.menuItems = menuItems;

        el = helpers.createDirective(template, compile, scope);
    });

    it('should exist', function () {
        expect(el).to.have.length.of.at.least(1);
        expect(el.children()).to.have.length.of.at.least(1);
    });

    it('should add "level" class of appropriate level', function () {
        expect(el.hasClass('rx-app-nav-level-1')).to.be.true;
    });

//    TODO allow children to be dynamically injected
});

describe('rxAppNavItem', function () {
    var scope, compile, rootScope, el, location, someProp, rxvisibility;
    var template = '<rx-app-nav-item item="item"></rx-app-nav-item>';

    var menuItem = {
        href: { tld: 'example', path: 'myPath' },
        linkText: '1st',
        directive: 'fake-directive',
        visibility: function () {
            return true;
        },
        childHeader: 'some value',
        children: [
            {
                href: '/1-1',
                linkText: '1st-1st',
                childVisibility: [ 'falseChildVisibilty' ],
                children: [
                    {
                        href: '/1-1-1',
                        linkText: '1st-1st-1st'
                    }
                ]
            }, {
                href: '/1-2',
                visibility: '2 + 2 == 4',
                linkText: '1st-2nd'
            }, {
                linkText: '1st-3rd',
                visibility: function () {
                    return someProp;
                },
                children: [
                    {
                        href: '/1-3-1',
                        linkText: '1st-3rd-1st'
                    }
                ]
            }, {
                linkText: '1st-4th',
                visibility: [ 'somePropMethod', { arg1: 'arg1', arg2: 'arg2' } ],
                children: [
                    {
                        href: '/1-4-1',
                        linkText: '1st-4th-1st'
                    }
                ]
            }
        ]
    };

    beforeEach(function () {
        // load module
        module('encore.ui.rxApp');
        module('encore.ui.rxCompile');

        // load templates
        module('templates/rxAppNav.html');
        module('templates/rxAppNavItem.html');

        // Inject in angular constructs
        inject(function ($rootScope, $compile, $location, rxVisibility) {
            rootScope = $rootScope;
            scope = $rootScope.$new();
            compile = $compile;
            location = $location;
            rxvisibility = rxVisibility;
        });

        rxvisibility.addMethod(
            'somePropMethod',
            function (scope, locals) {
                /* should return false */
                return locals.arg1 === locals.arg2;
            }
        );

        rxvisibility.addMethod(
            'falseChildVisibilty',
            function () { return false; }
        );

        scope.item = _.clone(menuItem, true);

        el = helpers.createDirective(template, compile, scope);
    });

    afterEach(function () {
        el = null;
        scope = null;
    });

    it('should exist', function () {
        expect(el).to.have.length.of.at.least(1);
        expect(el.children()).to.have.length.of.at.least(2);
    });

    it('should hide if visibility property evaluates to false', function () {
        // check that first item is visible (since no 'visibility' property)
        expect(el.className).to.not.contain('ng-hide');

        // NOTE: this retreives *all* the child nav items, including the sub-child ones
        // This is why indexing is a little off
        var children = el[0].querySelectorAll('.item-children .rx-app-nav-item');

        // check that first level 2 item is visible (since 'visibility' function returns true)
        expect(children[0].className, 'first child, function').to.not.contain('ng-hide');

        // check that second level 2 item is visible (since 'visibility' expression == true)
        expect(children[2].className, 'middle child, expression').to.not.contain('ng-hide');

        // check that third level 2 item is not visible (since 'visibility' function currently returns false)
        expect(children[3].className, 'third child').to.contain('ng-hide');

        // check that third level 2 item is not visible (since 'somePropMethod' function currently returns false)
        expect(children[5].className, 'fourth child, linkText: 1st-4th').to.contain('ng-hide');

        // we need to set the property that the visibility function is checking to true
        someProp = true;
        scope.$digest();

        // now that visibility = true, el should not be hidden
        expect(children[3].className, 'last child, after someProp = true').to.not.contain('ng-hide');
    });

    it('should show/hide children based on childVisibility value', function () {
        // get children element
        var children = el[0].querySelectorAll('.item-children');

        expect(children[0].className, 'All Children').to.not.contain('ng-hide');
        expect(children[1].className, '1st Subnav Children').to.contain('ng-hide');
    });

    it('should build directive if available', function () {
        // get directive
        var directive = el[0].querySelector('.item-directive');

        expect(directive).to.exist;
        expect(directive.className).to.not.contain('.ng-hide');

        // sanity check that it correctly built directive HTML
        expect(directive.innerHTML).to.contain('<' + menuItem.directive);
        expect(directive.innerHTML).to.contain('</' + menuItem.directive + '>');
    });

    it('should increment the child nav level', function () {
        // get children element
        var children = el[0].querySelector('.item-children .rx-app-nav');
        children = angular.element(children);
        expect(children.hasClass('rx-app-nav-level-2')).to.be.true;
    });

    it('should show header for children if present', function () {
        // get child header element
        var childHeader = el[0].querySelector('.child-header');

        expect(childHeader.textContent).to.equal(menuItem.childHeader);
    });
});

describe('rxPage', function () {
    var scope, compile, rootScope, el, pageTitle;
    var template = '<rx-page title="myCustomTitle"></rx-page>';

    beforeEach(function () {
        // load module
        module('encore.ui.rxApp');
        module('encore.ui.rxPageTitle');

        // load templates
        module('templates/rxPage.html');

        // Inject in angular constructs
        inject(function ($rootScope, $compile) {
            rootScope = $rootScope;
            scope = $rootScope.$new();
            compile = $compile;
        });

        inject(function (rxPageTitle) {
            pageTitle = rxPageTitle;
        });

        scope.myCustomTitle = 'foobar';
        el = helpers.createDirective(template, compile, scope);
    });

    it('should exist', function () {
        expect(el).to.have.length.of.at.least(1);
        expect(el.children()).to.have.length.of.at.least(1);
    });

    it('should have foobar as a title', function () {
        expect(pageTitle.getTitle()).to.equal('foobar');
    });

    it('should update page title if title changes', function () {
        scope.myCustomTitle = 'abc';
        scope.$digest();
        expect(pageTitle.getTitle()).to.equal('abc');
    });
});

describe('rxVisibility', function () {
    var rxvisibility;

    beforeEach(function () {
        module('encore.ui.rxApp');

        inject(function (rxVisibility) {
            rxvisibility = rxVisibility;
        });
    });

    it('should have an added method', function () {
        var method = function () {};

        rxvisibility.addMethod('foo', method);
        expect(rxvisibility.hasMethod('foo'), 'hasMethod').to.be.true;
    });

    it('should have added a visibility object', function () {
        var obj = {
            name: 'someName',
            method: function () { return true; }
        };

        rxvisibility.addVisibilityObj(obj);
        expect(rxvisibility.hasMethod('someName'), 'hasMethod').to.be.true;
        expect(rxvisibility.getMethod('someName'), 'getMethod').to.equal(obj.method);
    });

    it('should return an added method', function () {
        var method = function () {};

        rxvisibility.addMethod('foo', method);
        expect(rxvisibility.getMethod('foo'), 'getMethod').to.equal(method);
        
    });

    it('should return undefined for an unknown method', function () {
        expect(rxvisibility.getMethod('foo'), 'getMethod').to.be.undefined;
    });
});

describe('rxVisibilityPathParams', function () {

    beforeEach(function () {
        // Necessary so `$routeProvider` is available
        module('ngRoute');

        module('encore.ui.rxApp');

    });

    it('should let me set location', function () {
        module(function ($routeProvider) {
            $routeProvider.when('/foo/:barId', {});
        });
        
        inject(function ($location, $route, $rootScope, $routeParams, rxVisibilityPathParams) {
            $location.path('/foo/someIdForBar');
            $rootScope.$digest();
            expect($routeParams).to.deep.equal({ barId: 'someIdForBar' });
            var scope = $rootScope.$new();
            var method = rxVisibilityPathParams.method;
            expect(method(scope, { param: 'barId' }), ':barId should be present').to.be.true;
            expect(method(scope, { param: 'abc' }), ':abc is not defined, should not be present').to.be.false;
        });

    });
});
