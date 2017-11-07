"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var https = require("https");
var version_1 = require("./version");
var utils = require("./utilities");
var ExtensionVersionService = (function () {
    function ExtensionVersionService(context) {
        this._memento = context;
    }
    ExtensionVersionService.getExtensionMetadataFromVSCodeMarketplace = function () {
        return new Promise(function (resolve, reject) {
            var postData = "{ filters: [{ criteria: [{ filterType: 4, value: \"" + ExtensionVersionService._extensionId + "\" }] }], flags: 262 }";
            var request = https.request({
                hostname: 'marketplace.visualstudio.com',
                path: '/_apis/public/gallery/extensionquery',
                method: 'POST',
                headers: {
                    'Accept': 'application/json;api-version=2.2-preview.1',
                    'Content-Type': 'application/json',
                    'Transfer-Encoding': 'chunked',
                    'Content-Length': Buffer.byteLength(postData)
                }
            }, function (response) {
                if (response.statusCode != 200) {
                    reject("Unable to download data from Visual Studio Marketplace. Status code: " + response.statusCode);
                    return;
                }
                var body = '';
                response.on('data', function (chunk) {
                    body += chunk;
                });
                response.on('end', function () {
                    var bodyObj = JSON.parse(body);
                    if (bodyObj.results[0].extensions[0].extensionId == ExtensionVersionService._extensionId) {
                        var latestPublishedVersion = bodyObj.results[0].extensions[0].versions[0].version;
                        resolve({ latestPublishedVersion: latestPublishedVersion, timestamp: Date.now() });
                    }
                });
            });
            request.on('error', function (e) {
                reject(e);
            });
            request.end(postData);
        });
    };
    Object.defineProperty(ExtensionVersionService.prototype, "latestPublishedVersion", {
        get: function () {
            var _this = this;
            if (ExtensionVersionService._getLatestPublishedVersionPromise) {
                return ExtensionVersionService._getLatestPublishedVersionPromise.then(function (result) { return version_1.Version.parse(result.latestPublishedVersion); });
            }
            // Check the cache for extension version information
            var cachedResult = this._memento.get('LatestPublishedExtensionVersion');
            if (cachedResult && cachedResult.timestamp > Date.now() - 24 * 60 * 60 * 1000) {
                ExtensionVersionService._getLatestPublishedVersionPromise = Promise.resolve(cachedResult);
            }
            else {
                ExtensionVersionService._getLatestPublishedVersionPromise = ExtensionVersionService.getExtensionMetadataFromVSCodeMarketplace().then(function (result) {
                    _this._memento.update('LatestPublishedExtensionVersion', result); // save in cache
                    return result;
                });
            }
            return ExtensionVersionService._getLatestPublishedVersionPromise.then(function (result) { return version_1.Version.parse(result.latestPublishedVersion); });
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(ExtensionVersionService.prototype, "isLatestInstalled", {
        get: function () {
            return this.latestPublishedVersion.then(function (latestVersion) {
                var extensionVersion = utils.getInstalledExtensionVersion();
                var isLatest = extensionVersion.compareBySubminorTo(latestVersion) >= 0;
                var error = isLatest ? null : "A new version of the NativeScript extension is available. Open \"Extensions\" panel to update to v" + latestVersion + ". Don't forget to regenerate your launch.json file after updating.";
                return { result: isLatest, error: error };
            });
        },
        enumerable: true,
        configurable: true
    });
    return ExtensionVersionService;
}());
ExtensionVersionService._extensionId = '8d837914-d8fa-45b5-965d-f76ebd6dbf5c';
ExtensionVersionService._getLatestPublishedVersionPromise = null;
exports.ExtensionVersionService = ExtensionVersionService;
//# sourceMappingURL=extensionVersionService.js.map