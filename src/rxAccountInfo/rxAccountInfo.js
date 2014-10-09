angular.module('encore.ui.rxAccountInfo', [])
.directive('rxAccountInfo', function (SupportAccount, Encore) {
    return {
        templateUrl: 'templates/rxAccountInfo.html',
        restrict: 'E',
        scope: {
            accountNumber: '@'
        },
        link: function (scope) {
            SupportAccount.getBadges({ accountNumber: scope.accountNumber }, function (badges) {
                scope.badges = badges;
            });

            Encore.getAccount({ id: scope.accountNumber }, function (account) {
                scope.accountName = account.name;
            });
            
        }
    };
});
