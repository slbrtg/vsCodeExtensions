"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var debugAdapterServices_1 = require("../../services/debugAdapterServices");
var vscode_chrome_debug_core_1 = require("vscode-chrome-debug-core");
var AndroidConnection = (function () {
    function AndroidConnection() {
        this._chromeConnection = new vscode_chrome_debug_core_1.ChromeConnection(function (address, port, targetFilter, targetUrl) { return Promise.resolve("ws://" + address + ":" + port); });
    }
    Object.defineProperty(AndroidConnection.prototype, "api", {
        get: function () {
            return this._chromeConnection.api;
        },
        enumerable: true,
        configurable: true
    });
    AndroidConnection.prototype.on = function (eventName, handler) {
        var domainMethodPair = eventName.split(".");
        if (domainMethodPair.length == 2) {
            var domain = domainMethodPair[0];
            var method = domainMethodPair[1];
            method = "on" + method.charAt(0).toUpperCase() + method.slice(1);
            this.api[domain][method](handler);
        }
        else {
            (this._chromeConnection)._socket.on(eventName, handler);
        }
    };
    AndroidConnection.prototype.attach = function (port, url) {
        debugAdapterServices_1.Services.logger().log('Attempting to attach on port ' + port);
        return this._chromeConnection.attach(url, port);
    };
    AndroidConnection.prototype.enable = function () {
        return this.api.Debugger.enable();
    };
    AndroidConnection.prototype.close = function () {
        this._chromeConnection.close();
    };
    AndroidConnection.prototype.debugger_setBreakpointByUrl = function (url, lineNumber, columnNumber, condition, ignoreCount) {
        return this.api.Debugger.setBreakpointByUrl({ urlRegex: url, lineNumber: lineNumber, columnNumber: columnNumber, condition: condition })
            .then(function (response) {
            return {
                result: {
                    breakpointId: response.breakpointId.toString(),
                    locations: response.locations
                },
            };
        });
    };
    AndroidConnection.prototype.debugger_removeBreakpoint = function (breakpointId) {
        return this.api.Debugger.removeBreakpoint({ breakpointId: breakpointId }).then(function (response) {
            return {};
        });
    };
    AndroidConnection.prototype.debugger_stepOver = function () {
        return this.api.Debugger.stepOver().then(function (reponse) {
            return {};
        });
    };
    AndroidConnection.prototype.debugger_stepIn = function () {
        return this.api.Debugger.stepInto().then(function (reponse) {
            return {};
        });
    };
    AndroidConnection.prototype.debugger_stepOut = function () {
        return this.api.Debugger.stepOut().then(function (reponse) {
            return {};
        });
    };
    AndroidConnection.prototype.debugger_resume = function () {
        return this.api.Debugger.resume().then(function (reponse) {
            return {};
        });
    };
    AndroidConnection.prototype.debugger_pause = function () {
        return this.api.Debugger.pause().then(function (reponse) {
            return {};
        });
    };
    AndroidConnection.prototype.debugger_evaluateOnCallFrame = function (callFrameId, expression, objectGroup, returnByValue) {
        if (objectGroup === void 0) { objectGroup = 'dummyObjectGroup'; }
        return this.api.Debugger.evaluateOnCallFrame({ callFrameId: callFrameId, expression: expression, silent: true, generatePreview: true }).then(function (response) {
            return {
                result: {
                    result: response.result,
                    wasThrown: false
                }
            };
        });
    };
    AndroidConnection.prototype.debugger_setPauseOnExceptions = function (args) {
        var state;
        if (args.indexOf('all') >= 0) {
            state = 'all';
        }
        else if (args.indexOf('uncaught') >= 0) {
            state = 'uncaught';
        }
        else {
            state = 'none';
        }
        return this.api.Debugger.setPauseOnExceptions({ state: state })
            .then(function (reponse) {
            return {};
        });
    };
    AndroidConnection.prototype.debugger_getScriptSource = function (scriptId) {
        return this.api.Debugger.getScriptSource({ scriptId: scriptId }).then(function (response) {
            return {
                result: {
                    scriptSource: response.scriptSource
                }
            };
        });
    };
    AndroidConnection.prototype.runtime_getProperties = function (objectId, ownProperties, accessorPropertiesOnly) {
        return this.api.Runtime.getProperties({ objectId: objectId, ownProperties: ownProperties, accessorPropertiesOnly: accessorPropertiesOnly, generatePreview: true }).then(function (response) {
            return {
                result: {
                    result: response.result
                }
            };
        });
    };
    AndroidConnection.prototype.runtime_evaluate = function (expression, objectGroup, contextId, returnByValue) {
        if (objectGroup === void 0) { objectGroup = 'dummyObjectGroup'; }
        if (returnByValue === void 0) { returnByValue = false; }
        return this.api.Runtime.evaluate({ expression: expression, objectGroup: objectGroup, contextId: contextId, returnByValue: returnByValue }).then(function (response) {
            return {
                result: {
                    result: response.result
                }
            };
        });
    };
    return AndroidConnection;
}());
exports.AndroidConnection = AndroidConnection;
//# sourceMappingURL=androidConnection.js.map