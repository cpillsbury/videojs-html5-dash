;(function(html5Dash, videojs) {
    'use strict';

    // If the html5Dash namespace already exists, add to it. Otherwise, create a new Object instance
    html5Dash = html5Dash || {};

    var root = this,
        parseRootUrl,
    // TODO: Should presentationDuration parsing be in util or somewhere else?
        parseMediaPresentationDuration,
        SECONDS_IN_YEAR = 365 * 24 * 60 * 60,
        SECONDS_IN_MONTH = 30 * 24 * 60 * 60, // not precise!
        SECONDS_IN_DAY = 24 * 60 * 60,
        SECONDS_IN_HOUR = 60 * 60,
        SECONDS_IN_MIN = 60,
        MINUTES_IN_HOUR = 60,
        MILLISECONDS_IN_SECONDS = 1000,
        durationRegex = /^P(([\d.]*)Y)?(([\d.]*)M)?(([\d.]*)D)?T?(([\d.]*)H)?(([\d.]*)M)?(([\d.]*)S)?/;

    parseRootUrl = function(url) {
        if (typeof url !== 'string') {
            return '';
        }

        if (url.indexOf('/') === -1) {
            return '';
        }

        if (url.indexOf('?') !== -1) {
            url = url.substring(0, url.indexOf('?'));
        }

        return url.substring(0, url.lastIndexOf('/') + 1);
    };

    // TODO: Should presentationDuration parsing be in util or somewhere else?
    parseMediaPresentationDuration = function (str) {
        //str = "P10Y10M10DT10H10M10.1S";
        var match = durationRegex.exec(str);
        return (parseFloat(match[2] || 0) * SECONDS_IN_YEAR +
            parseFloat(match[4] || 0) * SECONDS_IN_MONTH +
            parseFloat(match[6] || 0) * SECONDS_IN_DAY +
            parseFloat(match[8] || 0) * SECONDS_IN_HOUR +
            parseFloat(match[10] || 0) * SECONDS_IN_MIN +
            parseFloat(match[12] || 0));
    };

    // Add definitions to html5Dash namespace & add namespace to root (i.e. window)
    html5Dash.util = {
        parseRootUrl: parseRootUrl,
        parseMediaPresentationDuration: parseMediaPresentationDuration
    };

    root.html5Dash = html5Dash;

}.call(this, this.html5Dash, this.videojs));
