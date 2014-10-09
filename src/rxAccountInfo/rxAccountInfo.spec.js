/* jshint node: true */

describe('rxAccountInfo', function () {
    var scope, compile, rootScope, el;
    var validTemplate = '<rx-account-info></rx-account-info>';

    beforeEach(function () {
        // load module
        module('encore.ui.rxAccountInfo');

        // load templates
        module('templates/rxAccountInfo.html');

        // Inject in angular constructs
        inject(function ($location, $rootScope, $compile) {
            rootScope = $rootScope;
            scope = $rootScope.$new();
            compile = $compile;
        });

        el = helpers.createDirective(validTemplate, compile, scope);
    });

});
