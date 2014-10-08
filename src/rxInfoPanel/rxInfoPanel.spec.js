/* jshint node: true */

describe('rxInfoPanel', function () {
    var scope, compile, rootScope, el;
    var validTemplate = '<rx-info-panel></rx-info-panel>';

    beforeEach(function () {
        // load module
        module('encore.ui.rxInfoPanel');

        // load templates
        module('templates/rxInfoPanel.html');

        // Inject in angular constructs
        inject(function ($location, $rootScope, $compile) {
            rootScope = $rootScope;
            scope = $rootScope.$new();
            compile = $compile;
        });

        el = helpers.createDirective(validTemplate, compile, scope);
    });

    it('shall not pass', function () {
        // Fail initial test to keep people honest
        expect(true).to.be.false;
    });
});