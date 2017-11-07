"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var child_process_1 = require("child_process");
var version_1 = require("../common/version");
var logger_1 = require("../common/logger");
var utils = require("../common/utilities");
var CliVersionState;
(function (CliVersionState) {
    CliVersionState[CliVersionState["NotExisting"] = 0] = "NotExisting";
    CliVersionState[CliVersionState["OlderThanSupported"] = 1] = "OlderThanSupported";
    CliVersionState[CliVersionState["Compatible"] = 2] = "Compatible";
})(CliVersionState = exports.CliVersionState || (exports.CliVersionState = {}));
var CliVersion = (function () {
    function CliVersion(cliVersion, minExpectedCliVersion) {
        this._cliVersion = undefined;
        this._minExpectedCliVersion = undefined;
        this._cliVersion = cliVersion;
        this._minExpectedCliVersion = minExpectedCliVersion;
        // Calculate CLI version state and CLI version error message
        this._cliVersionState = CliVersionState.Compatible;
        if (minExpectedCliVersion) {
            if (this._cliVersion === null) {
                this._cliVersionState = CliVersionState.NotExisting;
                this._cliVersionErrorMessage = "NativeScript CLI not found, please run 'npm -g install nativescript' to install it.";
            }
            else if (this._cliVersion.compareBySubminorTo(minExpectedCliVersion) < 0) {
                this._cliVersionState = CliVersionState.OlderThanSupported;
                this._cliVersionErrorMessage = "The existing NativeScript extension is compatible with NativeScript CLI v" + this._minExpectedCliVersion + " or greater. The currently installed NativeScript CLI is v" + this._cliVersion + ". You can update the NativeScript CLI by executing 'npm install -g nativescript'.";
            }
        }
    }
    Object.defineProperty(CliVersion.prototype, "version", {
        get: function () { return this._cliVersion; },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(CliVersion.prototype, "state", {
        get: function () { return this._cliVersionState; },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(CliVersion.prototype, "isCompatible", {
        get: function () { return this._cliVersionState == CliVersionState.Compatible; },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(CliVersion.prototype, "errorMessage", {
        get: function () { return this._cliVersionErrorMessage; },
        enumerable: true,
        configurable: true
    });
    return CliVersion;
}());
exports.CliVersion = CliVersion;
var NativeScriptCli = (function () {
    function NativeScriptCli(cliPath, logger) {
        this._path = cliPath;
        this._logger = logger;
        this._shellPath = process.env.SHELL;
        // always default to cmd on Windows
        // workaround for issue #121 https://github.com/NativeScript/nativescript-vscode-extension/issues/121
        if (utils.getPlatform() === 0 /* Windows */) {
            this._shellPath = "cmd.exe";
        }
        var versionStr = null;
        try {
            versionStr = this.executeSync(["--version"], undefined);
        }
        catch (e) {
            this._logger.log(e, logger_1.Tags.FrontendMessage);
            throw new Error("NativeScript CLI not found. Use 'nativescript.tnsPath' workspace setting to explicitly set the absolute path to the NativeScript CLI.");
        }
        var cliVersion = versionStr ? version_1.Version.parse(versionStr) : null;
        this._cliVersion = new CliVersion(cliVersion, utils.getMinSupportedCliVersion());
        if (!this._cliVersion.isCompatible) {
            throw new Error(this._cliVersion.errorMessage);
        }
    }
    Object.defineProperty(NativeScriptCli.prototype, "path", {
        get: function () { return this._path; },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(NativeScriptCli.prototype, "version", {
        get: function () {
            return this._cliVersion;
        },
        enumerable: true,
        configurable: true
    });
    NativeScriptCli.prototype.executeSync = function (args, cwd) {
        args.unshift("--analyticsClient", "VSCode");
        var command = this._path + " " + args.join(' ');
        this._logger.log("[NativeScriptCli] execute: " + command, logger_1.Tags.FrontendMessage);
        return child_process_1.execSync(command, { encoding: "utf8", cwd: cwd, shell: this._shellPath }).toString().trim();
    };
    NativeScriptCli.prototype.execute = function (args, cwd) {
        args.unshift("--analyticsClient", "VSCode");
        var command = this._path + " " + args.join(' ');
        this._logger.log("[NativeScriptCli] execute: " + command, logger_1.Tags.FrontendMessage);
        var options = { cwd: cwd, shell: this._shellPath };
        var child = child_process_1.spawn(this._path, args, options);
        child.stdout.setEncoding('utf8');
        child.stderr.setEncoding('utf8');
        return child;
    };
    return NativeScriptCli;
}());
exports.NativeScriptCli = NativeScriptCli;
//# sourceMappingURL=nativeScriptCli.js.map