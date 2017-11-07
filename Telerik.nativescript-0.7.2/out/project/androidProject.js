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
var AndroidProject = (function (_super) {
    __extends(AndroidProject, _super);
    function AndroidProject(appRoot, cli) {
        return _super.call(this, appRoot, cli) || this;
    }
    AndroidProject.prototype.platformName = function () {
        return "android";
    };
    AndroidProject.prototype.attach = function (tnsArgs) {
        var args = ["--start"];
        args = args.concat(tnsArgs);
        var debugProcess = _super.prototype.executeDebugCommand.call(this, args);
        var tnsOutputEventEmitter = new events_1.EventEmitter();
        this.configureReadyEvent(debugProcess.stdout, tnsOutputEventEmitter, true);
        return { tnsProcess: debugProcess, tnsOutputEventEmitter: tnsOutputEventEmitter };
    };
    AndroidProject.prototype.debug = function (options, tnsArgs) {
        var args = [];
        args.push(options.watch ? "--watch" : "--no-watch");
        if (options.stopOnEntry) {
            args.push("--debug-brk");
        }
        args = args.concat(tnsArgs);
        var debugProcess = _super.prototype.executeDebugCommand.call(this, args);
        var tnsOutputEventEmitter = new events_1.EventEmitter();
        this.configureReadyEvent(debugProcess.stdout, tnsOutputEventEmitter, false);
        return { tnsProcess: debugProcess, tnsOutputEventEmitter: tnsOutputEventEmitter };
    };
    AndroidProject.prototype.configureReadyEvent = function (readableStream, eventEmitter, attach) {
        var debugPort = null;
        new scanner.StringMatchingScanner(readableStream).onEveryMatch(new RegExp("device: .* debug port: [0-9]+"), function (match) {
            //device: {device-name} debug port: {debug-port}
            debugPort = parseInt(match.matches[0].match("(?:debug port: )([\\d]{5})")[1]);
            if (attach) {
                // wait a little before trying to connect, this gives a chance for adb to be able to connect to the debug socket
                setTimeout(function () { eventEmitter.emit('readyForConnection', debugPort); }, 500);
            }
        });
        if (!attach) {
            new scanner.StringMatchingScanner(readableStream).onEveryMatch('# NativeScript Debugger started #', function (match) {
                // wait a little before trying to connect, this gives a chance for adb to be able to connect to the debug socket
                setTimeout(function () { eventEmitter.emit('readyForConnection', debugPort); }, 500);
            });
        }
    };
    return AndroidProject;
}(project_1.Project));
exports.AndroidProject = AndroidProject;
//# sourceMappingURL=androidProject.js.map