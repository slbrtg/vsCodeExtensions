"use strict";
/*---------------------------------------------------------
 * Copyright (C) Microsoft Corporation. All rights reserved.
 *--------------------------------------------------------*/
Object.defineProperty(exports, "__esModule", { value: true });
/* tslint:disable */
var Path = require("path");
var URL = require("url");
var debugAdapterServices_1 = require("../../../services/debugAdapterServices");
var utils = require("../../../common/utilities");
function getPathRoot(p) {
    if (p) {
        if (p.length >= 3 && p[1] === ':' && p[2] === '\\' && ((p[0] >= 'a' && p[0] <= 'z') || (p[0] >= 'A' && p[0] <= 'Z'))) {
            return p.substr(0, 3);
        }
        if (p.length > 0 && p[0] === '/') {
            return '/';
        }
    }
    return null;
}
exports.getPathRoot = getPathRoot;
function makePathAbsolute(absPath, relPath) {
    return Path.resolve(Path.dirname(absPath), relPath);
}
exports.makePathAbsolute = makePathAbsolute;
function removeFirstSegment(path) {
    var segments = path.split(Path.sep);
    segments.shift();
    if (segments.length > 0) {
        return segments.join(Path.sep);
    }
    return null;
}
exports.removeFirstSegment = removeFirstSegment;
function makeRelative(target, path) {
    var t = target.split(Path.sep);
    var p = path.split(Path.sep);
    var i = 0;
    for (; i < Math.min(t.length, p.length) && t[i] === p[i]; i++) {
    }
    var result = '';
    for (; i < p.length; i++) {
        result = Path.join(result, p[i]);
    }
    return result;
}
exports.makeRelative = makeRelative;
function canonicalizeUrl(url) {
    var u = URL.parse(url);
    var p = u.pathname;
    if (p.length >= 4 && p[0] === '/' && p[2] === ':' && p[3] === '/' && ((p[1] >= 'a' && p[1] <= 'z') || (p[1] >= 'A' && p[1] <= 'Z'))) {
        return p.substr(1);
    }
    return p;
}
exports.canonicalizeUrl = canonicalizeUrl;
/**
 * Determine the absolute path to the sourceRoot.
 */
function getAbsSourceRoot(sourceRoot, webRoot, generatedPath) {
    var absSourceRoot;
    if (sourceRoot) {
        if (sourceRoot.startsWith('file:///')) {
            // sourceRoot points to a local path like "file:///c:/project/src"
            absSourceRoot = canonicalizeUrl(sourceRoot);
        }
        else if (Path.isAbsolute(sourceRoot)) {
            // sourceRoot is like "/src", would be like http://localhost/src, resolve to a local path under webRoot
            // note that C:/src (or /src as an absolute local path) is not a valid sourceroot
            absSourceRoot = Path.join(webRoot, sourceRoot);
        }
        else {
            // sourceRoot is like "src" or "../src", relative to the script
            if (Path.isAbsolute(generatedPath)) {
                absSourceRoot = makePathAbsolute(generatedPath, sourceRoot);
            }
            else {
                // generatedPath is a URL so runtime script is not on disk, resolve the sourceRoot location on disk
                var genDirname = Path.dirname(URL.parse(generatedPath).pathname);
                absSourceRoot = Path.join(webRoot, genDirname, sourceRoot);
            }
        }
        debugAdapterServices_1.Services.logger().log("SourceMap: resolved sourceRoot " + sourceRoot + " -> " + absSourceRoot);
    }
    else {
        if (Path.isAbsolute(generatedPath)) {
            absSourceRoot = Path.dirname(generatedPath);
            debugAdapterServices_1.Services.logger().log("SourceMap: no sourceRoot specified, using script dirname: " + absSourceRoot);
        }
        else {
            // runtime script is not on disk, resolve the sourceRoot location on disk
            var scriptPathDirname = Path.dirname(URL.parse(generatedPath).pathname);
            absSourceRoot = Path.join(webRoot, scriptPathDirname);
            debugAdapterServices_1.Services.logger().log("SourceMap: no sourceRoot specified, using webRoot + script path dirname: " + absSourceRoot);
        }
    }
    absSourceRoot = utils.stripTrailingSlash(absSourceRoot);
    absSourceRoot = utils.fixDriveLetterAndSlashes(absSourceRoot);
    return absSourceRoot;
}
exports.getAbsSourceRoot = getAbsSourceRoot;
//# sourceMappingURL=pathUtilities.js.map