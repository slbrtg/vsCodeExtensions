"use strict";
/*---------------------------------------------------------
 * Copyright (C) Microsoft Corporation. All rights reserved.
 *--------------------------------------------------------*/
Object.defineProperty(exports, "__esModule", { value: true });
var utils = require("../../common/utilities");
var debugAdapterServices_1 = require("../../services/debugAdapterServices");
/**
 * Converts a local path from Code to a path on the target.
 */
var PathTransformer = (function () {
    function PathTransformer() {
        this._clientPathToWebkitUrl = new Map();
        this._webkitUrlToClientPath = new Map();
        this._pendingBreakpointsByPath = new Map();
        this.inferedDeviceRoot = null;
    }
    PathTransformer.prototype.launch = function (args) {
        this._appRoot = args.appRoot;
        this._platform = args.platform;
        this.inferedDeviceRoot = (this._platform === 'ios') ? 'file://' : this.inferedDeviceRoot;
    };
    PathTransformer.prototype.attach = function (args) {
        this._appRoot = args.appRoot;
        this._platform = args.platform;
    };
    PathTransformer.prototype.setBreakpoints = function (args) {
        var _this = this;
        return new Promise(function (resolve, reject) {
            if (!args.source.path) {
                resolve();
                return;
            }
            if (utils.isURL(args.source.path)) {
                // already a url, use as-is
                debugAdapterServices_1.Services.logger().log("Paths.setBP: " + args.source.path + " is already a URL");
                resolve();
                return;
            }
            var url = utils.canonicalizeUrl(args.source.path);
            if (_this._clientPathToWebkitUrl.has(url)) {
                args.source.path = _this._clientPathToWebkitUrl.get(url);
                debugAdapterServices_1.Services.logger().log("Paths.setBP: Resolved " + url + " to " + args.source.path);
                resolve();
            }
            else if (_this.inferedDeviceRoot) {
                var inferedUrl = url.replace(_this._appRoot, _this.inferedDeviceRoot).replace(/\\/g, "/");
                inferedUrl = inferedUrl.replace("/node_modules/", "/app/tns_modules/");
                //change platform specific paths
                inferedUrl = inferedUrl.replace("." + _this._platform + ".", '.');
                args.source.path = inferedUrl;
                debugAdapterServices_1.Services.logger().log("Paths.setBP: Resolved (by infering) " + url + " to " + args.source.path);
                resolve();
            }
            else {
                debugAdapterServices_1.Services.logger().log("Paths.setBP: No target url cached for client path: " + url + ", waiting for target script to be loaded.");
                args.source.path = url;
                _this._pendingBreakpointsByPath.set(args.source.path, { resolve: resolve, reject: reject, args: args });
            }
        });
    };
    PathTransformer.prototype.clearClientContext = function () {
        this._pendingBreakpointsByPath = new Map();
    };
    PathTransformer.prototype.clearTargetContext = function () {
        this._clientPathToWebkitUrl = new Map();
        this._webkitUrlToClientPath = new Map();
    };
    PathTransformer.prototype.scriptParsed = function (event) {
        var webkitUrl = event.body.scriptUrl;
        if (!this.inferedDeviceRoot && this._platform === "android") {
            this.inferedDeviceRoot = utils.inferDeviceRoot(this._appRoot, this._platform, webkitUrl);
            if (this.inferedDeviceRoot) {
                debugAdapterServices_1.Services.logger().log("\n\n\n ***Inferred device root: " + this.inferedDeviceRoot + "\n\n\n");
                if (this.inferedDeviceRoot.indexOf("/data/user/0/") != -1) {
                    this.inferedDeviceRoot = this.inferedDeviceRoot.replace("/data/user/0/", "/data/data/");
                }
            }
        }
        var clientPath = utils.webkitUrlToClientPath(this._appRoot, this._platform, webkitUrl);
        if (!clientPath) {
            debugAdapterServices_1.Services.logger().log("Paths.scriptParsed: could not resolve " + webkitUrl + " to a file in the workspace. webRoot: " + this._appRoot);
        }
        else {
            debugAdapterServices_1.Services.logger().log("Paths.scriptParsed: resolved " + webkitUrl + " to " + clientPath + ". webRoot: " + this._appRoot);
            this._clientPathToWebkitUrl.set(clientPath, webkitUrl);
            this._webkitUrlToClientPath.set(webkitUrl, clientPath);
            event.body.scriptUrl = clientPath;
        }
        if (this._pendingBreakpointsByPath.has(event.body.scriptUrl)) {
            debugAdapterServices_1.Services.logger().log("Paths.scriptParsed: Resolving pending breakpoints for " + event.body.scriptUrl);
            var pendingBreakpoint = this._pendingBreakpointsByPath.get(event.body.scriptUrl);
            this._pendingBreakpointsByPath.delete(event.body.scriptUrl);
            this.setBreakpoints(pendingBreakpoint.args).then(pendingBreakpoint.resolve, pendingBreakpoint.reject);
        }
    };
    PathTransformer.prototype.stackTraceResponse = function (response) {
        var _this = this;
        response.stackFrames.forEach(function (frame) {
            // Try to resolve the url to a path in the workspace. If it's not in the workspace,
            // just use the script.url as-is. It will be resolved or cleared by the SourceMapTransformer.
            if (frame.source && frame.source.path) {
                var clientPath = _this._webkitUrlToClientPath.has(frame.source.path) ?
                    _this._webkitUrlToClientPath.get(frame.source.path) :
                    utils.webkitUrlToClientPath(_this._appRoot, _this._platform, frame.source.path);
                // Incoming stackFrames have sourceReference and path set. If the path was resolved to a file in the workspace,
                // clear the sourceReference since it's not needed.
                if (clientPath) {
                    frame.source.path = clientPath;
                    frame.source.sourceReference = 0;
                }
            }
        });
    };
    return PathTransformer;
}());
exports.PathTransformer = PathTransformer;
//# sourceMappingURL=pathTransformer.js.map