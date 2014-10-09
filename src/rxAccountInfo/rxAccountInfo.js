angular.module('encore.ui.rxAccountInfo', ['encore.ui.rxInfoPanel'])
.directive('rxAccountInfo', function () {
    return {
        templateUrl: 'templates/rxAccountInfo.html',
        restrict: 'E',
        scope: {}
    };
});
