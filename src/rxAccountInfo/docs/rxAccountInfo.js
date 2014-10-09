/*jshint unused:false*/

// This file is used to help build the 'demo' documentation page and should be updated with example code
function rxAccountInfoCtrl ($scope) {

}

angular.module('encore.ui.rxAccountInfo')
.factory('SupportAccount', function ($q) {
    return {
        getBadges: function (config, success, failure) {
            var deferred = $q.defer();
            var result = null;

            deferred.resolve([
                {
                    url: 'http://mirrors.creativecommons.org/presskit/icons/cc.large.png',
                    name: 'CC'
                }, {
                    url: 'http://mirrors.creativecommons.org/presskit/icons/by.large.png',
                    name: 'BY'
                }, {
                    url: 'http://mirrors.creativecommons.org/presskit/icons/nc.large.png',
                    name: 'NC',
                }, {
                    url: 'http://mirrors.creativecommons.org/presskit/icons/zero.large.png',
                    name: 'ZERO',
                },
            ]);

            deferred.promise.then(success, failure);

            return deferred.promise;
        }
    };
})
.factory('Encore', function ($q) {
    return {
        getAccount: function (config, success, failure) {
            var deferred = $q.defer();

            deferred.resolve({ name: 'Mosso' });

            deferred.promise.then(success, failure);

            return deferred.promise;
        }
    };
});
