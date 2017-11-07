"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var path = require("path");
var os = require("os");
var crypto = require("crypto");
var ipc = require('node-ipc');
var ExtensionClient = (function () {
    function ExtensionClient(appRoot) {
        var _this = this;
        this._idCounter = 0;
        this._appRoot = appRoot;
        this._idCounter = 0;
        this._pendingRequests = {};
        ipc.config.id = 'debug-adpater-' + process.pid;
        ipc.config.retry = 1500;
        this._ipcClientInitialized = new Promise(function (res, rej) {
            ipc.connectTo('extHost', ExtensionClient.getTempFilePathForDirectory(_this._appRoot), function () {
                ipc.of.extHost.on('connect', function () {
                    res();
                });
                ipc.of.extHost.on('extension-protocol-message', function (response) {
                    _this._pendingRequests[response.requestId](response.result);
                });
            });
        });
    }
    ExtensionClient.getTempFilePathForDirectory = function (directoryPath) {
        var fileName = 'vsc-ns-ext-' + crypto.createHash('md5').update(directoryPath).digest("hex") + '.sock';
        return path.join(os.tmpdir(), fileName);
    };
    ExtensionClient.prototype.callRemoteMethod = function (method, args) {
        var _this = this;
        var request = { id: 'req' + (++this._idCounter), method: method, args: args };
        return new Promise(function (res, rej) {
            _this._pendingRequests[request.id] = res;
            ipc.of.extHost.emit('extension-protocol-message', request);
        });
    };
    ExtensionClient.prototype.getInitSettings = function () {
        return this.callRemoteMethod('getInitSettings');
    };
    ExtensionClient.prototype.analyticsLaunchDebugger = function (args) {
        return this.callRemoteMethod('analyticsLaunchDebugger', args);
    };
    ExtensionClient.prototype.runRunCommand = function (args) {
        return this.callRemoteMethod('runRunCommand', args);
    };
    ExtensionClient.prototype.selectTeam = function () {
        return this.callRemoteMethod('selectTeam');
    };
    return ExtensionClient;
}());
exports.ExtensionClient = ExtensionClient;
//# sourceMappingURL=extensionClient.js.map