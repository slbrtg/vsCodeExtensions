"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var path = require("path");
var os = require("os");
var fs = require("fs");
var crypto = require("crypto");
var vscode = require("vscode");
var extensionHostServices_1 = require("../services/extensionHostServices");
var ipc = require('node-ipc');
var ExtensionServer = (function () {
    function ExtensionServer() {
        this._isRunning = false;
    }
    ExtensionServer.getTempFilePathForDirectory = function (directoryPath) {
        var fileName = 'vsc-ns-ext-' + crypto.createHash('md5').update(directoryPath).digest("hex") + '.sock';
        return path.join(os.tmpdir(), fileName);
    };
    ExtensionServer.prototype.getPipeHandlePath = function () {
        return vscode.workspace.rootPath ?
            ExtensionServer.getTempFilePathForDirectory(vscode.workspace.rootPath) :
            null;
    };
    ExtensionServer.prototype.start = function () {
        var _this = this;
        if (!this._isRunning) {
            var pipeHandlePath = this.getPipeHandlePath();
            if (pipeHandlePath) {
                ipc.serve(pipeHandlePath, function () {
                    ipc.server.on('extension-protocol-message', function (data, socket) {
                        return _this[data.method].call(_this, data.args).then(function (result) {
                            var response = { requestId: data.id, result: result };
                            return ipc.server.emit(socket, 'extension-protocol-message', response);
                        });
                    });
                });
                ipc.server.start();
                this._isRunning = true;
            }
        }
        return this._isRunning;
    };
    ExtensionServer.prototype.stop = function () {
        if (this._isRunning) {
            ipc.server.stop();
            this._isRunning = false;
        }
    };
    ExtensionServer.prototype.isRunning = function () {
        return this._isRunning;
    };
    ExtensionServer.prototype.getInitSettings = function () {
        var tnsPath = extensionHostServices_1.Services.workspaceConfigService().tnsPath;
        return Promise.resolve({ tnsPath: tnsPath });
    };
    ExtensionServer.prototype.analyticsLaunchDebugger = function (args) {
        return extensionHostServices_1.Services.analyticsService().launchDebugger(args.request, args.platform);
    };
    ExtensionServer.prototype.runRunCommand = function (args) {
        return extensionHostServices_1.Services.analyticsService().runRunCommand(args.platform);
    };
    ExtensionServer.prototype.selectTeam = function () {
        var _this = this;
        return new Promise(function (resolve, reject) {
            var developmentTeams = _this.getDevelopmentTeams();
            if (developmentTeams.length > 1) {
                var quickPickItems = developmentTeams.map(function (team) {
                    return {
                        label: team.name,
                        description: team.id
                    };
                });
                vscode.window.showQuickPick(quickPickItems)
                    .then(function (val) { return resolve({
                    id: val.description,
                    label: val.label
                }); });
            }
            else {
                resolve();
            }
        });
    };
    ExtensionServer.prototype.getDevelopmentTeams = function () {
        try {
            var dir = path.join(process.env.HOME, "Library/MobileDevice/Provisioning Profiles/");
            var files = fs.readdirSync(dir);
            var teamIds = {};
            for (var _i = 0, files_1 = files; _i < files_1.length; _i++) {
                var file = files_1[_i];
                var filePath = path.join(dir, file);
                var data = fs.readFileSync(filePath, { encoding: "utf8" });
                var teamId = this.getProvisioningProfileValue("TeamIdentifier", data);
                var teamName = this.getProvisioningProfileValue("TeamName", data);
                if (teamId) {
                    teamIds[teamId] = teamName;
                }
            }
            var teamIdsArray = new Array();
            for (var teamId in teamIds) {
                teamIdsArray.push({ id: teamId, name: teamIds[teamId] });
            }
            return teamIdsArray;
        }
        catch (e) {
            // no matter what happens, don't break
            return new Array();
        }
    };
    ExtensionServer.prototype.getProvisioningProfileValue = function (name, text) {
        var findStr = "<key>" + name + "</key>";
        var index = text.indexOf(findStr);
        if (index > 0) {
            index = text.indexOf("<string>", index + findStr.length);
            if (index > 0) {
                index += "<string>".length;
                var endIndex = text.indexOf("</string>", index);
                var result = text.substring(index, endIndex);
                return result;
            }
        }
        return null;
    };
    return ExtensionServer;
}());
exports.ExtensionServer = ExtensionServer;
//# sourceMappingURL=extensionServer.js.map