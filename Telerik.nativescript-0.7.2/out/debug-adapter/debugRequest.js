"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var iosProject_1 = require("../project/iosProject");
var androidProject_1 = require("../project/androidProject");
var DebugRequest = (function () {
    function DebugRequest(requestArgs, cli) {
        this._requestArgs = requestArgs;
        this._project = this.isIos ? new iosProject_1.IosProject(this.args.appRoot, cli) : new androidProject_1.AndroidProject(this.args.appRoot, cli);
    }
    Object.defineProperty(DebugRequest.prototype, "isLaunch", {
        get: function () {
            return this.args.request === "launch";
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(DebugRequest.prototype, "isAttach", {
        get: function () {
            return this.args.request === "attach";
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(DebugRequest.prototype, "isAndroid", {
        get: function () {
            return this.args.platform == "android";
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(DebugRequest.prototype, "isIos", {
        get: function () {
            return this.args.platform == "ios";
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(DebugRequest.prototype, "args", {
        get: function () {
            return this._requestArgs;
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(DebugRequest.prototype, "launchArgs", {
        get: function () {
            return this.isLaunch ? this.args : null;
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(DebugRequest.prototype, "attachArgs", {
        get: function () {
            return this.isAttach ? this.args : null;
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(DebugRequest.prototype, "project", {
        get: function () {
            return this._project;
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(DebugRequest.prototype, "iosProject", {
        get: function () {
            return this.isIos ? this.project : null;
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(DebugRequest.prototype, "androidProject", {
        get: function () {
            return this.isAndroid ? this.project : null;
        },
        enumerable: true,
        configurable: true
    });
    return DebugRequest;
}());
exports.DebugRequest = DebugRequest;
//# sourceMappingURL=debugRequest.js.map