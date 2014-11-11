;(function(html5Dash, videojs) {
    'use strict';

    // If the html5Dash namespace already exists, add to it. Otherwise, create a new Object instance
    html5Dash = html5Dash || {};

    var root = this,
        loadManifest,
    // TODO: Externalize these
        getSourceBufferTypeFromRepresentation,
        getAdaptationSetByType,
        getRepresentationFromAdaptationSetByIndex;

    loadManifest = function(manifestUrl, tech) {
        html5Dash.manifest.loadManifest(manifestUrl, function(data) {
            load(data.manifestXml, tech);
            console.log('Loaded manifest!');
            console.log('manifestXml = ' + data.manifestXml);
        });
    };

    getSourceBufferTypeFromRepresentation = function(representationXml) {
        if (!representationXml) { return null; }
        var codecStr = representationXml.getAttribute('codecs');
        var typeStr = representationXml.parentNode.getAttribute('mimeType');

        return (typeStr + ';codecs="' + codecStr + '"');
    };

    getAdaptationSetByType = function(type, manifestXml) {
        if (!manifestXml) { return null; }
        var adaptationSets = manifestXml.getElementsByTagName('AdaptationSet'),
            adaptationSet,
            mimeType;

        for (var i=0; i<adaptationSets.length; i++) {
            adaptationSet = adaptationSets.item(i);
            mimeType = adaptationSet.getAttribute('mimeType');
            if (!!mimeType && mimeType.indexOf(type) >= 0) { return adaptationSet; }
        }

        return null;
    };

    getRepresentationFromAdaptationSetByIndex = function(index, adaptationSetXml) {
        if (!adaptationSetXml || typeof index !== 'number' || index < 0) { return null; }
        var representations = adaptationSetXml.getElementsByTagName('Representation');
        if (!representations || representations.length < index) { return null; }
        return representations.item(index);
    };

    function load(manifestXml, tech) {
        console.log('START');

        // TODO: Abstract away differences between webkit impl and std impl of MediaSource
        root.MediaSource = root.MediaSource || root.WebKitMediaSource;
        var mediaSource = new root.MediaSource(),
            openListener = function(event) {
                kickoffSegmentLoading('video', manifestXml, mediaSource);
                kickoffSegmentLoading('audio', manifestXml, mediaSource);
            };

        tech.setSrc(root.URL.createObjectURL(mediaSource));

        // TODO: Abstract away differences between webkit impl and std impl of MediaSource
        mediaSource.addEventListener('webkitsourceopen', openListener, false);
        mediaSource.addEventListener('sourceopen', openListener, false);

        // TODO: Handle close.
        //mediaSource.addEventListener('webkitsourceclose', closed, false);
        //mediaSource.addEventListener('sourceclose', closed, false);
    }

    function kickoffSegmentLoading(segmentListType, manifestXml, mediaSource) {
        var adaptationSet = getAdaptationSetByType(segmentListType, manifestXml),
            representation = getRepresentationFromAdaptationSetByIndex(0, adaptationSet),
            mimeType = getSourceBufferTypeFromRepresentation(representation),
            sourceBuffer = mediaSource.addSourceBuffer(mimeType),
            segmentLoader = new html5Dash.SegmentLoader(representation),
            sourceBufferDataQueue = new html5Dash.SourceBufferDataQueue(sourceBuffer);
        loadInitialization(segmentLoader, sourceBufferDataQueue);
    }

    function loadInitialization(segmentLoader, sourceBufferDataQueue) {
        videojs.one(segmentLoader, segmentLoader.eventList.INITIALIZATION_LOADED, function(event) {
            sourceBufferDataQueue.addToQueue(event.data);
            loadSegments(segmentLoader, sourceBufferDataQueue);
        });
        segmentLoader.loadInitialization();
    }

    function loadSegments(segmentLoader, sourceBufferDataQueue) {
        videojs.on(segmentLoader, segmentLoader.eventList.SEGMENT_LOADED, function(event) {
            sourceBufferDataQueue.addToQueue(event.data);
            if (segmentLoader.getCurrentIndex() < segmentLoader.getTotalSegmentCount() - 1) { segmentLoader.loadNextSegment(); }
            // TODO: REMOVE EVENT LISTENER ON ELSE
        });

        segmentLoader.loadNextSegment();
    }

    function SourceHandler(source, tech) {
        console.log('Loaded Source Handler!');
        loadManifest(source.src, tech);
    }

    // Add definitions to html5Dash namespace & add namespace to root (i.e. window)
    html5Dash.SourceHandler = SourceHandler;

    root.html5Dash = html5Dash;

}.call(this, this.html5Dash, this.videojs));