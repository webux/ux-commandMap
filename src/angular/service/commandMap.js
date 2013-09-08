var rootScope, q;

angular.module('ux').factory('commandMap', ['$rootScope', '$q', function ($rootScope, $q) {
    rootScope = $rootScope;
    q = $q;
    return new CommandMap();
}]);