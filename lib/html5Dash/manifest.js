;(function(html5Dash, videojs) {
    'use strict';

    // If the html5Dash namespace already exists, add to it. Otherwise, create a new Object instance
    html5Dash = html5Dash || {};

    var root = this,
        manifest = html5Dash.manifest || {},
        loadManifest;

    loadManifest = function(url, callback) {
        var actualUrl = html5Dash.util.parseRootUrl(url),
            request = new XMLHttpRequest(),
            onload;

        onload = function () {
            if (request.status < 200 || request.status > 299) { return; }

            if (typeof callback === 'function') { callback({manifestXml: request.responseXML }); }
        };

        try {
            //this.debug.log('Start loading manifest: ' + url);
            request.onload = onload;
            request.open('GET', url, true);
            request.send();
        } catch(e) {
            request.onerror();
        }
    };

    // Add definitions to html5Dash namespace & add namespace to root (i.e. window)
    manifest.loadManifest = loadManifest;
    html5Dash.manifest = manifest;

    root.html5Dash = html5Dash;

}.call(this, this.html5Dash, this.videojs));