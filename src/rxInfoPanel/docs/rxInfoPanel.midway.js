var rxInfoPanelPage = require('../rxInfoPanel.page.js').rxInfoPanel;
var expect = require('chai').use(require('chai-as-promised')).expect;

describe('rxInfoPanel', function () {
    var rxInfoPanel;

    before(function () {
        demoPage.go('#/component/rxInfoPanel');
        rxInfoPanel = rxInfoPanelPage.initialize($('.info-panel'));
    });

    it('should show element', function () {
        expect(rxInfoPanel.isDisplayed()).to.eventually.be.true;
    });

    it('should populate the title', function () {
        expect(rxInfoPanel.title).to.eventually.equal('A Custom Title');
    });
});
