"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var os = require("os");
var guaService_1 = require("./guaService");
var telerikAnalyticsService_1 = require("./telerikAnalyticsService");
var analyticsBaseInfo_1 = require("./analyticsBaseInfo");
var extensionHostServices_1 = require("../services/extensionHostServices");
var utils = require("../common/utilities");
var AnalyticsService = (function () {
    function AnalyticsService() {
        this._analyticsEnabled = extensionHostServices_1.Services.workspaceConfigService().isAnalyticsEnabled;
        var operatingSystem = analyticsBaseInfo_1.OperatingSystem.Other;
        switch (process.platform) {
            case 'win32': {
                operatingSystem = analyticsBaseInfo_1.OperatingSystem.Windows;
                break;
            }
            case 'darwin': {
                operatingSystem = analyticsBaseInfo_1.OperatingSystem.OSX;
                break;
            }
            case 'linux':
            case 'freebsd': {
                operatingSystem = analyticsBaseInfo_1.OperatingSystem.Linux;
                break;
            }
        }
        ;
        this._baseInfo = {
            cliVersion: extensionHostServices_1.Services.cli().version.toString(),
            extensionVersion: utils.getInstalledExtensionVersion().toString(),
            operatingSystem: operatingSystem,
            userId: AnalyticsService.generateMachineId()
        };
        if (this._analyticsEnabled) {
            this._gua = new guaService_1.GUAService('UA-111455-29', this._baseInfo);
            this._ta = new telerikAnalyticsService_1.TelerikAnalyticsService('b8b2e51f188f43e9b0dfb899f7b71cc6', this._baseInfo);
        }
    }
    AnalyticsService.generateMachineId = function () {
        var machineId = '';
        try {
            var netInterfaces_1 = os.networkInterfaces();
            Object.keys(netInterfaces_1).forEach(function (interfName) {
                netInterfaces_1[interfName].forEach(function (interf) {
                    if (!interf.internal) {
                        machineId += interf.mac + "-";
                    }
                });
            });
        }
        catch (e) { }
        return machineId;
    };
    AnalyticsService.prototype.launchDebugger = function (request, platform) {
        if (this._analyticsEnabled) {
            try {
                return Promise.all([
                    this._gua.launchDebugger(request, platform),
                    this._ta.launchDebugger(request, platform)
                ]);
            }
            catch (e) { }
        }
        return Promise.resolve();
    };
    AnalyticsService.prototype.runRunCommand = function (platform) {
        if (this._analyticsEnabled) {
            try {
                return Promise.all([
                    this._gua.runRunCommand(platform),
                    this._ta.runRunCommand(platform)
                ]);
            }
            catch (e) { }
        }
        return Promise.resolve();
    };
    return AnalyticsService;
}());
exports.AnalyticsService = AnalyticsService;
//# sourceMappingURL=analyticsService.js.map