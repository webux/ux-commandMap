/**/
function CommandMapper() {
    this._commands = [];
}

CommandMapper.prototype.getCommands = function () {
    return this._commands.splice(0);
};

CommandMapper.prototype.isEmpty = function () {
    return this._commands.length === 0;
};

CommandMapper.prototype.hasCommand = function (command) {
    var len = this._commands.length;
    while (len--) {
        if (this._commands[len] === command) {
            return true;
        }
    }
    return false;
};

CommandMapper.prototype.toCommand = function (command) {
    if (!this.hasCommand(command)) {
        this._commands.push(command);
    }
};

CommandMapper.prototype.fromCommand = function (command) {
    var len = this._commands.length;
    while (len--) {
        if (this._commands[len] === command) {
            this._commands.splice(len, 1);
            break;
        }
    }
};