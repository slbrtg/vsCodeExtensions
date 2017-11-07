"use strict";
var __extends = (this && this.__extends) || (function () {
    var extendStatics = Object.setPrototypeOf ||
        ({ __proto__: [] } instanceof Array && function (d, b) { d.__proto__ = b; }) ||
        function (d, b) { for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p]; };
    return function (d, b) {
        extendStatics(d, b);
        function __() { this.constructor = d; }
        d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
var vscode_debugadapter_1 = require("vscode-debugadapter");
var webKitDebugAdapter_1 = require("./webKitDebugAdapter");
var logger_1 = require("../common/logger");
var debugAdapterServices_1 = require("../services/debugAdapterServices");
var adapterProxy_1 = require("./adapter/adapterProxy");
var lineNumberTransformer_1 = require("./adapter/lineNumberTransformer");
var pathTransformer_1 = require("./adapter/pathTransformer");
var sourceMapTransformer_1 = require("./adapter/sourceMaps/sourceMapTransformer");
var WebKitDebugSession = (function (_super) {
    __extends(WebKitDebugSession, _super);
    function WebKitDebugSession(targetLinesStartAt1, isServer) {
        if (isServer === void 0) { isServer = false; }
        var _this = _super.call(this, targetLinesStartAt1, isServer) || this;
        // Logging on the std streams is only allowed when running in server mode, because otherwise it goes through
        // the same channel that Code uses to communicate with the adapter, which can cause communication issues.
        if (isServer) {
            debugAdapterServices_1.Services.logger().addHandler(logger_1.Handlers.stdStreamsHandler);
        }
        process.removeAllListeners('unhandledRejection');
        process.addListener('unhandledRejection', function (reason) {
            debugAdapterServices_1.Services.logger().log("******** ERROR! Unhandled promise rejection: " + reason);
        });
        _this._adapterProxy = new adapterProxy_1.AdapterProxy([
            new lineNumberTransformer_1.LineNumberTransformer(targetLinesStartAt1),
            new sourceMapTransformer_1.SourceMapTransformer(),
            new pathTransformer_1.PathTransformer()
        ], new webKitDebugAdapter_1.WebKitDebugAdapter(), function (event) { return _this.sendEvent(event); });
        return _this;
    }
    /**
     * Overload sendEvent to log
     */
    WebKitDebugSession.prototype.sendEvent = function (event) {
        if (event.event !== 'output') {
            // Don't create an infinite loop...
            debugAdapterServices_1.Services.logger().log("To client: " + JSON.stringify(event));
        }
        _super.prototype.sendEvent.call(this, event);
    };
    /**
     * Overload sendResponse to log
     */
    WebKitDebugSession.prototype.sendResponse = function (response) {
        debugAdapterServices_1.Services.logger().log("To client: " + JSON.stringify(response));
        _super.prototype.sendResponse.call(this, response);
    };
    /**
     * Takes a response and a promise to the response body. If the promise is successful, assigns the response body and sends the response.
     * If the promise fails, sets the appropriate response parameters and sends the response.
     */
    WebKitDebugSession.prototype.sendResponseAsync = function (request, response, responseP) {
        var _this = this;
        responseP.then(function (body) {
            response.body = body;
            _this.sendResponse(response);
        }, function (e) {
            var eStr = e ? e.message : 'Unknown error';
            if (typeof e === "string" || e instanceof String) {
                eStr = e;
            }
            if (eStr === 'Error: unknowncommand') {
                _this.sendErrorResponse(response, 1014, '[NSDebugAdapter] Unrecognized request: ' + request.command, null, vscode_debugadapter_1.ErrorDestination.Telemetry);
                return;
            }
            if (request.command === 'evaluate') {
                // Errors from evaluate show up in the console or watches pane. Doesn't seem right
                // as it's not really a failed request. So it doesn't need the tag and worth special casing.
                response.message = eStr;
            }
            else {
                // These errors show up in the message bar at the top (or nowhere), sometimes not obvious that they
                // come from the adapter
                response.message = '[NSDebugAdapter] ' + eStr;
                debugAdapterServices_1.Services.logger().error('Error: ' + eStr, logger_1.Tags.FrontendMessage);
            }
            response.success = false;
            _this.sendResponse(response);
        });
    };
    /**
     * Overload dispatchRequest to dispatch to the adapter proxy instead of debugSession's methods for each request.
     */
    WebKitDebugSession.prototype.dispatchRequest = function (request) {
        var response = { seq: 0, type: 'response', request_seq: request.seq, command: request.command, success: true };
        try {
            debugAdapterServices_1.Services.logger().log("From client: " + request.command + "(" + JSON.stringify(request.arguments) + ")");
            this.sendResponseAsync(request, response, this._adapterProxy.dispatchRequest(request));
        }
        catch (e) {
            this.sendErrorResponse(response, 1104, 'Exception while processing request (exception: {_exception})', { _exception: e.message }, vscode_debugadapter_1.ErrorDestination.Telemetry);
        }
    };
    return WebKitDebugSession;
}(vscode_debugadapter_1.DebugSession));
exports.WebKitDebugSession = WebKitDebugSession;
//# sourceMappingURL=webKitDebugSession.js.map