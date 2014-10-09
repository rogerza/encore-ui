angular.module('encore.ui.rxAccountInfo', [])
.directive('rxAccountInfo', function (SupportAccount, Encore) {
    return {
        templateUrl: 'templates/rxAccountInfo.html',
        restrict: 'E',
        scope: {
            accountNumber: '@'
        },
        link: function (scope) {
            var badgeSuccess = function (badges) {
                scope.badges = badges;
            };
            SupportAccount.getBadges({ accountNumber: scope.accountNumber }, badgeSuccess);

            var accountSuccess = function (account) {
                scope.accountName = account.name;
            };
            Encore.getAccount({ id: scope.accountNumber }, accountSuccess);
            
        }
    };
});
