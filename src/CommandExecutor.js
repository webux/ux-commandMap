/*global angular, rootScope, q*/
function CommandExecutor(commands, args) {
    this.commands = commands;
    this.args = args.splice(0);
}

CommandExecutor.counter = 0;

CommandExecutor.prototype.execute = function (completeCallback) {
    var scope = this, promise;
    if (this.commands.length) {
        promise = this.next(scope.commands.shift());
        promise.then(function () {
            scope.execute(completeCallback);
        });
    } else {
        completeCallback();
    }
};

CommandExecutor.prototype.next = function (command) {
    var deferred = q.defer(), commandComplete;
    deferred.__uid = CommandExecutor.counter += 1;

    if (typeof command === 'function') {
        command = new command();
    } else {
        command = angular.clone(command);
    }

    if (command.execute === undefined) {
        throw new Error('Command expects "execute" to be defined.');
    }

    if (typeof command.execute !== 'function') {
        throw new Error('Command expects "execute" to be of type function.');
    }

    if ('complete' in command) {
        commandComplete = command.complete;
        command.complete = function () {
            commandComplete.apply(command);
            if ('destruct' in command) {
                command.destruct();
            }
            deferred.resolve();

            if (!rootScope.$$phase) {
                rootScope.$apply();
            }
        };
    } else {
        command.complete = function () {
            if ('destruct' in command) {
                command.destruct();
            }
            deferred.resolve();
        };
    }

    if ('construct' in command) {
        command.construct.apply(command, this.args);
    }

    command.execute.apply(command, this.args);

    // if command did not provide its own complete()
    if (commandComplete === undefined) {
        command.complete();
    }

    return deferred.promise;
};