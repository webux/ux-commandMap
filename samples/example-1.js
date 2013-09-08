/*global angular, SyncCommand, AsyncCommand */
(function () {
    'use strict';

    function Example() {
        this.name = 'Example class';
    }

    var module = angular.module('app', ['ux']);

    module.value('name', 'WebUX CommandMap');

    module.controller('MainCtrl', function ($scope, commandMap) {
        // commands call in order they are mapped
        commandMap.map('events.test').toCommand(SyncCommand);
        commandMap.map('events.test').toCommand(AsyncCommand); // will cause delay before other commands called
        commandMap.map('events.test').toCommand(SyncCommand); // already mapped - Should it be called anyway?

        // invoke event and pass in params that can be consumed by commands
        $scope.$emit('events.test', { message: 'Hello, world!'}, 123, new Example());
    });

    angular.element(document).ready(function () {
        angular.bootstrap(document, ['app']);
    });
}());