var rxAccountInfoPage = require('../rxAccountInfo.page.js').rxAccountInfo;
var expect = require('chai').use(require('chai-as-promised')).expect;

describe('rxAccountInfo', function () {
    var rxAccountInfo;

    before(function () {
        demoPage.go('#/component/rxAccountInfo');
        rxAccountInfo = rxAccountInfoPage.initialize($('#rxAccountInfo'));
    });

    it('should show element', function () {
        expect(rxAccountInfo.isDisplayed()).to.eventually.be.true;
    });
});
