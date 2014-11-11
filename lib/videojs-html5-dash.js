/*! videojs-html5-dash - v0.0.0 - 2014-11-1
 * Copyright (c) 2014 Christian Pillsbury
 * Licensed under the Apache-2.0 license. */
;(function(html5Dash, videojs) {
    'use strict';

    // If the html5Dash namespace already exists, add to it. Otherwise, create a new Object instance
    html5Dash = html5Dash || {};

    var root = this,
        canHandleSource,
        handleSource;

    canHandleSource = function(source) {
        // Externalize if used elsewhere. Potentially use constant function.
        var doesntHandleSource = '',
            maybeHandleSource = 'maybe',
            defaultHandleSource = doesntHandleSource;

        // TODO: Use safer vjs check (e.g. handles IE conditions)?
        // Requires Media Source Extensions
        if (!root.MediaSource || !root.WebKitMediaSource) {
            return doesntHandleSource;
        }

        // Check if the type is supported
        if (/application\/dash\+xml/.test(source.type)) {
            console.log('matched type');
            return maybeHandleSource;
        }

        // Check if the file extension matches
        if (/\.mpd$/i.test(source.src)) {
            console.log('matched extension');
            return maybeHandleSource;
        }

        return defaultHandleSource;
    };

    handleSource = function(source, tech) {
        return new html5Dash.SourceHandler(source, tech);
    };

    // Register the source handler
    videojs.Html5.registerSourceHandler({
        canHandleSource: canHandleSource,
        handleSource: handleSource
    }, 0);
}.call(this, this.html5Dash, this.videojs));
