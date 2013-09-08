/*global CommandExecutor, CommandMapper, rootScope*/
function CommandMap() {
    this._mappings = {};
}

CommandMap.prototype.map = function (event) {
    if (typeof event !== 'string') {
        throw new Error('Event must of type string.');
    }

    if (!event.length) {
        throw new Error('Event string cannot be empty');
    }
    var scope = this;

    if (!this._mappings[event]) {
        this._mappings[event] = new CommandMapper();
        this._mappings[event].unsubscribe = rootScope.$on(event, function () {
            var args, commandMapper, commandExecutor, promise;
            args = Array.prototype.slice.call(arguments);
            args.shift(); // remove event
            commandMapper = scope._mappings[event];
            if (!commandMapper.commandExecutor) { // semaphore
                commandMapper.commandExecutor = new CommandExecutor(commandMapper.getCommands(), args);
                commandMapper.commandExecutor.execute(function () {
                    // console.log('Done - cleanup');
                    delete commandMapper.commandExecutor;
                    promise = null;
                });
            }
        });
    }
    return this._mappings[event];
};

CommandMap.prototype.unmap = function (event, command) {
    if (this._mappings[event]) {
        this._mappings[event].fromCommand(command);
        if (this._mappings[event].isEmpty()) {
            this._mappings[event].unsubscribe();
            delete this._mappings[event];
        }
    }
};

CommandMap.prototype.umapAll = function () {
    this._mappings = {};
};