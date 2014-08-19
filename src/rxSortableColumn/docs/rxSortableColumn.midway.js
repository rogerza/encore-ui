var demoPage = require('../../../utils/demo.page.js');
var rxSortableColumn = require('../rxSortableColumn.page.js').rxSortableColumn;

// Add midway tests to run
describe('rxSortableColumn', function () {
    var nameColumn = null;
    var roleColumn = null;

    before(function () {
        demoPage.go('#/component/rxSortableColumn');
        var nameSelector = $('rx-sortable-column[sort-property="name"]');
        var roleSelector = $('rx-sortable-column[sort-property="jobTitle"]');
        nameColumn = rxSortableColumn.initialize(nameSelector);
        roleColumn = rxSortableColumn.initialize(roleSelector);
    });

    it('should display some sortable columns', function () {
        expect(nameColumn.rootElement.isDisplayed()).to.eventually.eq.true;
        expect(roleColumn.rootElement.isDisplayed()).to.eventually.eq.true;
    });

    it('should have a descending sort shown by default for the name column', function () {
        expect(nameColumn.getCurrentSortDirection()).to.eventually.eq(0);
    });

    it('should have no sort shown by default for the job title column', function () {
        expect(roleColumn.getCurrentSortDirection()).to.eventually.eq(-1);
    });

    it('should support sorting columns ascending', function () {
        var isAscending = true;
        nameColumn.sort(isAscending);
        expect(nameColumn.getCurrentSortDirection()).to.eventually.eq(1);
    });

    it('should support sorting columns descending', function () {
        var isAscending = false;
        nameColumn.sort(isAscending);
        expect(nameColumn.getCurrentSortDirection()).to.eventually.eq(0);
    });

    it('should remove all other sorts when sorting an unsorted column', function () {
        roleColumn.sort();
        expect(nameColumn.getCurrentSortDirection()).to.eventually.eq(-1);
    });

    it('should have a name', function () {
        expect(nameColumn.name()).to.eventually.eq('Name');
        expect(roleColumn.name()).to.eventually.eq('Occupation');
    });

});
