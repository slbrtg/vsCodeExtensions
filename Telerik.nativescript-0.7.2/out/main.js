"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var vscode = require("vscode");
var extensionHostServices_1 = require("./services/extensionHostServices");
var iosProject_1 = require("./project/iosProject");
var androidProject_1 = require("./project/androidProject");
// this method is called when the extension is activated
function activate(context) {
    extensionHostServices_1.Services.globalState = context.globalState;
    extensionHostServices_1.Services.cliPath = extensionHostServices_1.Services.workspaceConfigService().tnsPath || extensionHostServices_1.Services.cliPath;
    extensionHostServices_1.Services.extensionServer().start();
    // Check for newer extension version
    extensionHostServices_1.Services.extensionVersionService().isLatestInstalled.then(function (result) {
        if (!result.result) {
            vscode.window.showWarningMessage(result.error);
        }
    });
    // Check if NativeScript CLI is installed globally and if it is compatible with the extension version
    var cliVersion = extensionHostServices_1.Services.cli().version;
    if (!cliVersion.isCompatible) {
        vscode.window.showErrorMessage(cliVersion.errorMessage);
    }
    var runCommand = function (project) {
        if (vscode.workspace.rootPath === undefined) {
            vscode.window.showErrorMessage('No workspace opened.');
            return;
        }
        // Show output channel
        var runChannel = vscode.window.createOutputChannel("Run on " + project.platformName());
        runChannel.clear();
        runChannel.show(vscode.ViewColumn.Two);
        extensionHostServices_1.Services.analyticsService().runRunCommand(project.platformName());
        var tnsProcess = project.run();
        tnsProcess.on('error', function (err) {
            vscode.window.showErrorMessage('Unexpected error executing NativeScript Run command.');
        });
        tnsProcess.stderr.on('data', function (data) {
            runChannel.append(data.toString());
        });
        tnsProcess.stdout.on('data', function (data) {
            runChannel.append(data.toString());
        });
        tnsProcess.on('exit', function (exitCode) {
            tnsProcess.stdout.removeAllListeners('data');
            tnsProcess.stderr.removeAllListeners('data');
        });
        tnsProcess.on('close', function (exitCode) {
            runChannel.hide();
        });
    };
    var runIosCommand = vscode.commands.registerCommand('nativescript.runIos', function () {
        return runCommand(new iosProject_1.IosProject(vscode.workspace.rootPath, extensionHostServices_1.Services.cli()));
    });
    var runAndroidCommand = vscode.commands.registerCommand('nativescript.runAndroid', function () {
        return runCommand(new androidProject_1.AndroidProject(vscode.workspace.rootPath, extensionHostServices_1.Services.cli()));
    });
    context.subscriptions.push(runIosCommand);
    context.subscriptions.push(runAndroidCommand);
}
exports.activate = activate;
function deactivate() {
    extensionHostServices_1.Services.extensionServer().stop();
}
exports.deactivate = deactivate;
//# sourceMappingURL=main.js.map