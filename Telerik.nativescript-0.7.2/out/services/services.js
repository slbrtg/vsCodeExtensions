"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var logger_1 = require("../common/logger");
var nativeScriptCli_1 = require("../project/nativeScriptCli");
var Services = (function () {
    function Services() {
    }
    Object.defineProperty(Services.prototype, "cliPath", {
        get: function () { return this._cliPath; },
        set: function (cliPath) { this._cliPath = cliPath; },
        enumerable: true,
        configurable: true
    });
    Services.prototype.logger = function () {
        this._logger = this._logger || new logger_1.Logger();
        return this._logger;
    };
    Services.prototype.cli = function () {
        this._cli = this._cli || new nativeScriptCli_1.NativeScriptCli(this._cliPath, this.logger());
        return this._cli;
    };
    return Services;
}());
exports.Services = Services;
//# sourceMappingURL=services.js.map