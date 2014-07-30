angular.module('encore.ui.rxModalAction', ['ui.bootstrap'])
.directive('rxModalForm', function ($timeout) {
    return {
        transclude: true,
        templateUrl: 'templates/rxModalActionForm.html',
        restrict: 'E',
        scope: {
            title: '@',
            subtitle: '@',
            isLoading: '=',
            submitText: '@',
            cancelText: '@'
        },
        link: function (scope, element) {
            // this function will focus on the first tabbable element inside the form
            var focusOnFirstTabbable = function () {
                var autofocusElements = '[autofocus]';
                var tabbableElements = 'input:not([type="hidden"]), textarea, select';
                var modalForm = element[0].querySelector('.modal-form');

                // first check for an element with an autofocus attribute
                var firstTabbable = modalForm.querySelector(autofocusElements);
                if (!firstTabbable) {
                    firstTabbable = modalForm.querySelector(tabbableElements);
                }

                // we need to wait for $modalWindow to run so it doesn't steal focus
                $timeout(function () {
                    firstTabbable.focus();
                }, 10);
            };

            focusOnFirstTabbable();

            // Remove the title attribute, as it will cause a popup to appear when hovering over page content
            // @see https://github.com/rackerlabs/encore-ui/issues/256
            element.removeAttr('title');
        }
    };
})
.controller('rxModalCtrl', function ($scope, $modalInstance, $rootScope) {
    // define a controller for the modal to use
    $scope.submit = function () {
        $modalInstance.close($scope);
    };

    $scope.cancel = $modalInstance.dismiss;

    // cancel out of the modal if the route is changed
    $rootScope.$on('$routeChangeSuccess', $modalInstance.dismiss);
})
.directive('rxModalAction', function ($modal) {
    var createModal = function (config, scope) {
        config = _.defaults(config, {
            templateUrl: config.templateUrl,
            controller: 'rxModalCtrl',
            scope: scope
        });

        config.windowClass = 'rxModal';

        var modal = $modal.open(config);

        return modal;
    };

    return {
        transclude: true,
        templateUrl: 'templates/rxModalAction.html',
        restrict: 'E',
        scope: true,
        link: function (scope, element, attrs) {
            // add any class passed in to scope
            scope.classes = attrs.classes;

            var focusLink = function () {
                element.find('a')[0].focus();
            };

            var handleSubmit = function () {
                focusLink();

                // Since we don't want to isolate the scope, we have to eval our attr instead of using `&`
                // The eval will execute function
                scope.$eval(attrs.postHook);
            };

            scope.showModal = function (evt) {
                evt.preventDefault();

                // Note: don't like having to create a 'fields' object in here,
                // but we need it so that the child input fields can bind to the modalScope
                scope.fields = {};

                // Since we don't want to isolate the scope, we have to eval our attr instead of using `&`
                // The eval will execute function (if it exists)
                scope.$eval(attrs.preHook);

                var modal = createModal(attrs, scope);

                modal.result.then(handleSubmit, focusLink);
            };
        }
    };
})

/**
 *
 * @ngdoc service
 * @name encore.ui.rxModalUtil
 * @description
 * Common functionality when defining a controller for a modal
 * var modal = rxModalUtil.createInstance($scope, defaultStackName, MESSAGES.downgrade, SupportResponseError);
 * 
 * var downgradeAccount = function () {
 *     $scope.downgradeResult = SupportAccount.downgradeService($routeParams.accountNumber,
 *                                                              $scope.fields.ticketNumber);
 *     $scope.downgradeResult.$promise.then(modal.successClose('page'), modal.fail());
 * 
 *     modal.processing($scope.downgradeResult.$promise);
 * };
 * 
 * modal.clear();
 * $scope.submit = downgradeAccount;
 * $scope.cancel = $scope.$dismiss;
 */
.factory('rxModalUtil', function (rxNotify) {
    var stacks = ['page'];
    var util = {};
    
    // Register stacks to be used when clearing them
    util.registerStacks = function () {
        stacks = stacks.concat(_.toArray(arguments));
        return stacks;
    };

    // Clear notifications that have been used by the controller
    util.clearNotifications = function () {
        _.each(stacks, rxNotify.clear, rxNotify);
        return stacks;
    };

    // Promise resolved callback for adding a notification
    util.success = function (message, stack) {
        return function () {
            return rxNotify.add(message, {
                stack: stack,
                type: 'success'
            });
        };
    };

    // Promise resolved callback for adding a notification and closing the modal
    util.successClose = function (scope, message, stack) {
        var success = util.success(message, stack);
        return function (data) {
            scope.$close(data);
            return success(data);
        };
    };

    // Promise reject callback for adding a notification
    util.fail = function (errorParser, message, stack) {
        return function (data) {
            if (_.isFunction(errorParser)) {
                var responseMsg = errorParser(data);

                if (!_.isEmpty(responseMsg)) {
                    message += ': (' + responseMsg + ')';
                }
            }
            
            return rxNotify.add(message, {
                stack: stack,
                type: 'error'
            });
        };
    };

    // Promise reject callback for adding a notification and dismissing the modal
    util.failDismiss = function (scope, errorParser, message, stack) {
        var fail = util.fail(errorParser, message, stack);
        return function (data) {
            scope.$dismiss(data);
            return fail(data);
        };
    };

    // Promise loading notification & postHook
    util.processing = function (scope, message, defaultStack) {
        return function (promise, stack) {
            util.clearNotifications();
            
            // Capture the instance of the loading notification in order to dismiss it once done processing
            var loading = rxNotify.add(message, {
                stack: stack || defaultStack,
                loading: true
            });

            promise.finally(function () {
                rxNotify.dismiss(loading);
            });

            // Call the postHook (if) defined on succesful resolution
            if (scope.postHook) {
                promise.then(scope.postHook);
            }

            return promise;
        };
    };

    // Create a modal controller instance for behavior of modal within a modal controller
    util.getModal = function (scope, defaultStack, messages, errorParser) {
        if (!(this instanceof util.getModal)) {
            return new util.getModal(scope, defaultStack, messages, errorParser);
        }
        messages = _.defaults(messages, {
            success: null,
            error: null,
            loading: null
        });
        util.registerStacks(defaultStack);
        this.processing = util.processing(scope, messages.loading, defaultStack);

        this.getStack = function (stack) {
            return stack || defaultStack;
        };
        this.success = function (stack) {
            return util.success(messages.success, this.getStack(stack));
        };
        this.successClose = function (stack) {
            return util.successClose(scope, messages.success, this.getStack(stack));
        };
        this.fail = function (stack) {
            return util.fail(errorParser, messages.error, this.getStack(stack));
        };
        this.failDismiss = function (stack) {
            return util.failDismiss(scope, errorParser, messages.error, this.getStack(stack));
        };
        this.clear = function () {
            return util.clearNotifications();
        };
    };

    return util;
});