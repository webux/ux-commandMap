/*
* uxCommandMap v.0.1.0
* (c) 2013, WebUX
* http://webux.github.io
* License: MIT
*/
(function(exports, global) {
    global["ux"] = exports;
    function CommandExecutor(commands, args) {
        this.commands = commands;
        this.args = args.splice(0);
    }
    CommandExecutor.counter = 0;
    CommandExecutor.prototype.execute = function(completeCallback) {
        var scope = this, promise;
        if (this.commands.length) {
            promise = this.next(scope.commands.shift());
            promise.then(function() {
                scope.execute(completeCallback);
            });
        } else {
            completeCallback();
        }
    };
    CommandExecutor.prototype.next = function(command) {
        var deferred = q.defer(), commandComplete;
        deferred.__uid = CommandExecutor.counter += 1;
        if (typeof command === "function") {
            command = new command();
        } else {
            command = angular.clone(command);
        }
        if (command.execute === undefined) {
            throw new Error('Command expects "execute" to be defined.');
        }
        if (typeof command.execute !== "function") {
            throw new Error('Command expects "execute" to be of type function.');
        }
        if ("complete" in command) {
            commandComplete = command.complete;
            command.complete = function() {
                commandComplete.apply(command);
                if ("destruct" in command) {
                    command.destruct();
                }
                deferred.resolve();
                if (!rootScope.$$phase) {
                    rootScope.$apply();
                }
            };
        } else {
            command.complete = function() {
                if ("destruct" in command) {
                    command.destruct();
                }
                deferred.resolve();
            };
        }
        if ("construct" in command) {
            command.construct.apply(command, this.args);
        }
        command.execute.apply(command, this.args);
        if (commandComplete === undefined) {
            command.complete();
        }
        return deferred.promise;
    };
    function CommandMap() {
        this._mappings = {};
    }
    CommandMap.prototype.map = function(event) {
        if (typeof event !== "string") {
            throw new Error("Event must of type string.");
        }
        if (!event.length) {
            throw new Error("Event string cannot be empty");
        }
        var scope = this;
        if (!this._mappings[event]) {
            this._mappings[event] = new CommandMapper();
            this._mappings[event].unsubscribe = rootScope.$on(event, function() {
                var args, commandMapper, commandExecutor, promise;
                args = Array.prototype.slice.call(arguments);
                args.shift();
                commandMapper = scope._mappings[event];
                if (!commandMapper.commandExecutor) {
                    commandMapper.commandExecutor = new CommandExecutor(commandMapper.getCommands(), args);
                    commandMapper.commandExecutor.execute(function() {
                        delete commandMapper.commandExecutor;
                        promise = null;
                    });
                }
            });
        }
        return this._mappings[event];
    };
    CommandMap.prototype.unmap = function(event, command) {
        if (this._mappings[event]) {
            this._mappings[event].fromCommand(command);
            if (this._mappings[event].isEmpty()) {
                this._mappings[event].unsubscribe();
                delete this._mappings[event];
            }
        }
    };
    CommandMap.prototype.umapAll = function() {
        this._mappings = {};
    };
    function CommandMapper() {
        this._commands = [];
    }
    CommandMapper.prototype.getCommands = function() {
        return this._commands.splice(0);
    };
    CommandMapper.prototype.isEmpty = function() {
        return this._commands.length === 0;
    };
    CommandMapper.prototype.hasCommand = function(command) {
        var len = this._commands.length;
        while (len--) {
            if (this._commands[len] === command) {
                return true;
            }
        }
        return false;
    };
    CommandMapper.prototype.toCommand = function(command) {
        if (!this.hasCommand(command)) {
            this._commands.push(command);
        }
    };
    CommandMapper.prototype.fromCommand = function(command) {
        var len = this._commands.length;
        while (len--) {
            if (this._commands[len] === command) {
                this._commands.splice(len, 1);
                break;
            }
        }
    };
    try {
        angular.module("ux");
    } catch (e) {
        angular.module("ux", []);
    }
    var rootScope, q;
    angular.module("ux").factory("commandMap", [ "$rootScope", "$q", function($rootScope, $q) {
        rootScope = $rootScope;
        q = $q;
        return new CommandMap();
    } ]);
})({}, function() {
    return this;
}());