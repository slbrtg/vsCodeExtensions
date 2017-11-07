"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var Project = (function () {
    function Project(appRoot, cli) {
        this._appRoot = appRoot;
        this._cli = cli;
    }
    Object.defineProperty(Project.prototype, "appRoot", {
        get: function () { return this._appRoot; },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(Project.prototype, "cli", {
        get: function () { return this._cli; },
        enumerable: true,
        configurable: true
    });
    Project.prototype.run = function (tnsArgs) {
        return this.executeRunCommand(tnsArgs);
    };
    Project.prototype.executeRunCommand = function (args) {
        return this.cli.execute(["run", this.platformName()].concat(args), this._appRoot);
    };
    Project.prototype.executeDebugCommand = function (args) {
        return this.cli.execute(["debug", this.platformName(), "--no-client"].concat(args), this._appRoot);
    };
    return Project;
}());
exports.Project = Project;
//# sourceMappingURL=project.js.map