"use strict";
/*---------------------------------------------------------
 * Copyright (C) Microsoft Corporation. All rights reserved.
 *--------------------------------------------------------*/
Object.defineProperty(exports, "__esModule", { value: true });
// TODO: Some functions can be moved to common.
var http = require("http");
var os = require("os");
var fs = require("fs");
var url = require("url");
var path = require("path");
var version_1 = require("./version");
var Platform;
(function (Platform) {
    Platform[Platform["Windows"] = 0] = "Windows";
    Platform[Platform["OSX"] = 1] = "OSX";
    Platform[Platform["Linux"] = 2] = "Linux";
})(Platform = exports.Platform || (exports.Platform = {}));
function getPlatform() {
    var platform = os.platform();
    return platform === 'darwin' ? 1 /* OSX */ :
        platform === 'win32' ? 0 /* Windows */ :
            2 /* Linux */;
}
exports.getPlatform = getPlatform;
/**
 * Node's fs.existsSync is deprecated, implement it in terms of statSync
 */
function existsSync(path) {
    try {
        fs.statSync(path);
        return true;
    }
    catch (e) {
        // doesn't exist
        return false;
    }
}
exports.existsSync = existsSync;
/**
 * Returns a reversed version of arr. Doesn't modify the input.
 */
function reversedArr(arr) {
    return arr.reduce(function (reversed, x) {
        reversed.unshift(x);
        return reversed;
    }, []);
}
exports.reversedArr = reversedArr;
function promiseTimeout(p, timeoutMs, timeoutMsg) {
    if (timeoutMs === void 0) { timeoutMs = 1000; }
    if (timeoutMsg === undefined) {
        timeoutMsg = "Promise timed out after " + timeoutMs + "ms";
    }
    return new Promise(function (resolve, reject) {
        if (p) {
            p.then(resolve, reject);
        }
        setTimeout(function () {
            if (p) {
                reject(timeoutMsg);
            }
            else {
                resolve();
            }
        }, timeoutMs);
    });
}
exports.promiseTimeout = promiseTimeout;
function retryAsync(fn, timeoutMs) {
    var startTime = Date.now();
    function tryUntilTimeout() {
        return fn().catch(function (e) {
            if (Date.now() - startTime < timeoutMs) {
                return tryUntilTimeout();
            }
            else {
                return errP(e);
            }
        });
    }
    return tryUntilTimeout();
}
exports.retryAsync = retryAsync;
function tryFindSourcePathInNSProject(nsProjectPath, additionalFileExtension, resorcePath) {
    var guess = "";
    var pathParts = resorcePath.split(path.sep);
    var appIndex = pathParts.indexOf("app");
    var isTnsModule = appIndex >= 0 && pathParts.length > appIndex + 1 && pathParts[appIndex + 1] === "tns_modules";
    //let isTnsModule: boolean = (pathParts.length >= 3 && pathParts[0] == '' && pathParts[1] == 'app' && pathParts[2] == 'tns_modules');
    if (isTnsModule) {
        // the file is part of a module, so we search it in '{ns-app}/node_modules/'
        var nsNodeModulesPath = path.join(nsProjectPath, 'node_modules');
        var modulePath = path.join.apply(path, pathParts.slice(appIndex + 2));
        guess = path.join(nsNodeModulesPath, modulePath);
    }
    else {
        guess = path.join(nsProjectPath, resorcePath);
    }
    if (existsSync(guess)) {
        return canonicalizeUrl(guess);
    }
    var extension = path.extname(guess);
    var platformSpecificPath = guess.substr(0, guess.length - extension.length) + '.' + additionalFileExtension + extension;
    if (existsSync(platformSpecificPath)) {
        return canonicalizeUrl(platformSpecificPath);
    }
    return null;
}
/**
 * Maps a url from webkit to an absolute local path.
 * If not given an absolute path (with file: prefix), searches the current working directory for a matching file.
 * http://localhost/scripts/code.js => d:/app/scripts/code.js
 * file:///d:/scripts/code.js => d:/scripts/code.js
 */
function webkitUrlToClientPath(webRoot, additionalFileExtension, aUrl) {
    if (!aUrl) {
        return '';
    }
    // If we don't have the client workingDirectory for some reason, don't try to map the url to a client path
    if (!webRoot) {
        return '';
    }
    aUrl = decodeURI(aUrl);
    // Search the filesystem under the webRoot for the file that best matches the given url
    var pathName = url.parse(canonicalizeUrl(aUrl)).pathname;
    if (!pathName || pathName === '/') {
        return '';
    }
    // Dealing with the path portion of either a url or an absolute path to remote file.
    // Need to force path.sep separator
    pathName = pathName.replace(/\//g, path.sep);
    var nsProjectFile = tryFindSourcePathInNSProject(webRoot, additionalFileExtension, pathName);
    if (nsProjectFile) {
        return nsProjectFile;
    }
    var pathParts = pathName.split(path.sep);
    while (pathParts.length > 0) {
        var clientPath = path.join(webRoot, pathParts.join(path.sep));
        if (existsSync(clientPath)) {
            return canonicalizeUrl(clientPath);
        }
        pathParts.shift();
    }
    //check for {N} android internal files
    pathParts = pathName.split(path.sep);
    while (pathParts.length > 0) {
        var clientPath = path.join(webRoot, "platforms/android/src/main/assets", pathParts.join(path.sep));
        if (existsSync(clientPath)) {
            return canonicalizeUrl(clientPath);
        }
        pathParts.shift();
    }
    return '';
}
exports.webkitUrlToClientPath = webkitUrlToClientPath;
/**
 * Infers the device root of a given path.
 * The device root is the parent directory of all {N} source files
 * This implementation assumes that all files are all under one common root on the device
 * Returns all the device parent directories of a source file until the file is found on the client by client path
 */
function inferDeviceRoot(projectRoot, additionalFileExtension, aUrl) {
    if (!aUrl) {
        return null;
    }
    // If we don't have the projectRoot for some reason, don't try to map the url to a client path
    if (!projectRoot) {
        return null;
    }
    aUrl = decodeURI(aUrl);
    // Search the filesystem under the webRoot for the file that best matches the given url
    var pathName = url.parse(canonicalizeUrl(aUrl)).pathname;
    if (!pathName || pathName === '/') {
        return null;
    }
    // Dealing with the path portion of either a url or an absolute path to remote file.
    // Need to force path.sep separator
    pathName = pathName.replace(/\//g, path.sep);
    var shiftedParts = [];
    var pathParts = pathName.split(path.sep);
    while (pathParts.length > 0) {
        var clientPath = path.join(projectRoot, pathParts.join(path.sep));
        if (existsSync(clientPath)) {
            //return canonicalizeUrl(clientPath);
            return shiftedParts.join(path.sep).replace(/\\/g, "/");
        }
        var shifted = pathParts.shift();
        shiftedParts.push(shifted);
    }
    //check for {N} android internal files
    shiftedParts = [];
    pathParts = pathName.split(path.sep);
    while (pathParts.length > 0) {
        var clientPath = path.join(projectRoot, "platforms/android/src/main/assets", pathParts.join(path.sep));
        if (existsSync(clientPath)) {
            //return canonicalizeUrl(clientPath);
            return shiftedParts.join(path.sep).replace(/\\/g, "/");
        }
        var shifted = pathParts.shift();
        shiftedParts.push(shifted);
    }
    return null;
}
exports.inferDeviceRoot = inferDeviceRoot;
/**
 * Modify a url either from the client or the webkit target to a common format for comparing.
 * The client can handle urls in this format too.
 * file:///D:\\scripts\\code.js => d:/scripts/code.js
 * file:///Users/me/project/code.js => /Users/me/project/code.js
 * c:\\scripts\\code.js => c:/scripts/code.js
 * http://site.com/scripts/code.js => (no change)
 * http://site.com/ => http://site.com
 */
function canonicalizeUrl(aUrl) {
    aUrl = aUrl.replace('file:///', '');
    aUrl = stripTrailingSlash(aUrl);
    aUrl = fixDriveLetterAndSlashes(aUrl);
    if (aUrl[0] !== '/' && aUrl.indexOf(':') < 0 && getPlatform() === 1 /* OSX */) {
        // Ensure osx path starts with /, it can be removed when file:/// was stripped.
        // Don't add if the url still has a protocol
        aUrl = '/' + aUrl;
    }
    return aUrl;
}
exports.canonicalizeUrl = canonicalizeUrl;
/**
 * Ensure lower case drive letter and \ on Windows
 */
function fixDriveLetterAndSlashes(aPath) {
    if (getPlatform() === 0 /* Windows */) {
        if (aPath.match(/file:\/\/\/[A-Za-z]:/)) {
            var prefixLen = 'file:///'.length;
            aPath =
                'file:///' +
                    aPath[prefixLen].toLowerCase() +
                    aPath.substr(prefixLen + 1).replace(/\//g, path.sep);
        }
        else if (aPath.match(/^[A-Za-z]:/)) {
            // If this is Windows and the path starts with a drive letter, ensure lowercase. VS Code uses a lowercase drive letter
            aPath = aPath[0].toLowerCase() + aPath.substr(1);
            aPath = aPath.replace(/\//g, path.sep);
        }
    }
    return aPath;
}
exports.fixDriveLetterAndSlashes = fixDriveLetterAndSlashes;
/**
 * Remove a slash of any flavor from the end of the path
 */
function stripTrailingSlash(aPath) {
    return aPath
        .replace(/\/$/, '')
        .replace(/\\$/, '');
}
exports.stripTrailingSlash = stripTrailingSlash;
function remoteObjectToValue(object, stringify) {
    if (stringify === void 0) { stringify = true; }
    var value = '';
    var variableHandleRef;
    if (object) {
        if (object && object.type === 'object') {
            if (object.subtype === 'null') {
                value = 'null';
            }
            else {
                // If it's a non-null object, create a variable reference so the client can ask for its props
                variableHandleRef = object.objectId;
                value = object.description;
            }
        }
        else if (object && object.type === 'undefined') {
            value = 'undefined';
        }
        else if (object.type === 'function') {
            var firstBraceIdx = object.description.indexOf('{');
            if (firstBraceIdx >= 0) {
                value = object.description.substring(0, firstBraceIdx) + '{ … }';
            }
            else {
                var firstArrowIdx = object.description.indexOf('=>');
                value = firstArrowIdx >= 0 ?
                    object.description.substring(0, firstArrowIdx + 2) + ' …' :
                    object.description;
            }
        }
        else {
            // The value is a primitive value, or something that has a description (not object, primitive, or undefined). And force to be string
            if (typeof object.value === 'undefined') {
                value = object.description;
            }
            else {
                value = stringify ? JSON.stringify(object.value) : object.value;
            }
        }
    }
    return { value: value, variableHandleRef: variableHandleRef };
}
exports.remoteObjectToValue = remoteObjectToValue;
/**
 * A helper for returning a rejected promise with an Error object. Avoids double-wrapping an Error, which could happen
 * when passing on a failure from a Promise error handler.
 * @param msg - Should be either a string or an Error
 */
function errP(msg) {
    var e;
    if (!msg) {
        e = new Error('Unknown error');
    }
    else if (msg.message) {
        // msg is already an Error object
        e = msg;
    }
    else {
        e = new Error(msg);
    }
    return Promise.reject(e);
}
exports.errP = errP;
/**
 * Helper function to GET the contents of a url
 */
function getURL(aUrl) {
    return new Promise(function (resolve, reject) {
        http.get(aUrl, function (response) {
            var responseData = '';
            response.on('data', function (chunk) { return responseData += chunk; });
            response.on('end', function () {
                // Sometimes the 'error' event is not fired. Double check here.
                if (response.statusCode === 200) {
                    resolve(responseData);
                }
                else {
                    reject(responseData);
                }
            });
        }).on('error', function (e) {
            reject(e);
        });
    });
}
exports.getURL = getURL;
/**
 * Returns true if urlOrPath is like "http://localhost" and not like "c:/code/file.js" or "/code/file.js"
 */
function isURL(urlOrPath) {
    return urlOrPath && !path.isAbsolute(urlOrPath) && !!url.parse(urlOrPath).protocol;
}
exports.isURL = isURL;
/**
 * Strip a string from the left side of a string
 */
function lstrip(s, lStr) {
    return s.startsWith(lStr) ?
        s.substr(lStr.length) :
        s;
}
exports.lstrip = lstrip;
function getInstalledExtensionVersion() {
    return version_1.Version.parse(require('../../package.json').version);
}
exports.getInstalledExtensionVersion = getInstalledExtensionVersion;
function getMinSupportedCliVersion() {
    return version_1.Version.parse(require('../../package.json').minNativescriptCliVersion);
}
exports.getMinSupportedCliVersion = getMinSupportedCliVersion;
//# sourceMappingURL=utilities.js.map