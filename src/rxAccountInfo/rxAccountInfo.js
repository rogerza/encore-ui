angular.module('encore.ui.rxAccountInfo', [])
.directive('rxAccountInfo', function (SupportAccount, Encore) {
    return {
        templateUrl: 'templates/rxAccountInfo.html',
        restrict: 'E',
        scope: {
            accountNumber: '@'
        },
        link: function (scope) {
            var success = function (badges) {
                scope.badges = [_.cloneDeep(badges[0]), _.cloneDeep(badges[0]), _.cloneDeep(badges[0])];
            };
            var success2 = function (data) {
                scope.accountName = data.name;
            };
            SupportAccount.getBadges({ accountNumber: scope.accountNumber }, success);

            Encore.getAccount({ id: scope.accountNumber }, success2);
            
        }
    };
});
