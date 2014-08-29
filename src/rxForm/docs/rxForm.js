function rxFormDemoCtrl ($scope) {
    $scope.types = [
        {
            'value': 'SATA',
            'label': 'SATA'
        },
        {
            'value': 'SSD',
            'label': 'SSD'
        }
    ];

    $scope.volume = {
        isNameRequired: true,
        type: _.first($scope.types).value, // select the first type by default
        checked: [true, 'unchecked'] //example with first checkbox automatically checked
    };

    $scope.yesOptionDescription = '<b>This</b> is HTML that included in the JS';

    $scope.optionTableData = [
        {
            'name': 'Option #1',
            'value': 0,
            'obj': {
                'name': 'Nested Name 1'
            }
        }, {
            'name': 'Option #2',
            'value': 1,
            'obj': {
                'name': 'Nested Name 2'
            }
        }, {
            'name': 'Option #3',
            'value': 2,
            'obj': {
                'name': 'Nested Name 3'
            }
        }
    ];

    $scope.optionTableColumns = [{
        'label': 'Name',
        'key': 'name',
        'selectedLabel': '(Already saved data)'
    }, {
        'label': 'Static Content',
        'key': 'Some <strong>Text &</strong> HTML'
    }, {
        'label': 'Expression 2',
        'key': '{{ value * 100 | number:2 }}'
    }, {
        'label': 'Expression 3',
        'key': '{{ obj.name | uppercase }}'
    }, {
        'label': 'Expression 4',
        'key': '{{ value | currency }}'
    }];

    $scope.optionTableCheckboxData = [{
        'name': 'Item 1'
    }, {
        'name': 'Item 2',
        'value': 'checked',
        'falseValue': 'unchecked'
    }];

    $scope.optionTableEmptyData = [];

    $scope.compressedLayout = { value: false };
}
