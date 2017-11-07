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
var events_1 = require("events");
var project_1 = require("./project");
var scanner = require("./streamScanner");
var IosProject = (function (_super) {
    __extends(IosProject, _super);
    function IosProject(appRoot, cli) {
        var _this = _super.call(this, appRoot, cli) || this;
        if (!_this.isPlatformOSX()) {
            throw new Error('iOS platform is supported only on OS X.');
        }
        return _this;
    }
    IosProject.prototype.platformName = function () {
        return "ios";
    };
    IosProject.prototype.attach = function (tnsArgs) {
        var args = ["--start"];
        args = args.concat(tnsArgs);
        var debugProcess = _super.prototype.executeDebugCommand.call(this, args);
        var tnsOutputEventEmitter = new events_1.EventEmitter();
        this.configureReadyEvent(debugProcess.stdout, tnsOutputEventEmitter);
        return { tnsProcess: debugProcess, tnsOutputEventEmitter: tnsOutputEventEmitter };
    };
    IosProject.prototype.debug = function (options, tnsArgs) {
        var args = [];
        args.push(options.watch ? "--watch" : "--no-watch");
        if (options.stopOnEntry) {
            args.push("--debug-brk");
        }
        args = args.concat(tnsArgs);
        var debugProcess = _super.prototype.executeDebugCommand.call(this, args);
        var tnsOutputEventEmitter = new events_1.EventEmitter();
        this.configureReadyEvent(debugProcess.stdout, tnsOutputEventEmitter);
        return { tnsProcess: debugProcess, tnsOutputEventEmitter: tnsOutputEventEmitter };
    };
    IosProject.prototype.configureReadyEvent = function (readableStream, eventEmitter) {
        var socketPathPrefix = 'socket-file-location: ';
        var streamScanner = new scanner.StringMatchingScanner(readableStream);
        streamScanner.onEveryMatch(new RegExp(socketPathPrefix + '.*\.sock'), function (match) {
            var socketPath = match.matches[0].substr(socketPathPrefix.length);
            eventEmitter.emit('readyForConnection', socketPath);
        });
    };
    IosProject.prototype.isPlatformOSX = function () {
        return /^darwin/.test(process.platform);
    };
    return IosProject;
}(project_1.Project));
exports.IosProject = IosProject;
//# sourceMappingURL=iosProject.js.map