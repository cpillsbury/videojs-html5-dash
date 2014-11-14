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
            console.log('Loaded manifest!');
            console.log('manifestXml = ' + data.manifestXml);
            load(data.manifestXml, tech);
        });
    };

    // TODO: Move this elsewhere (Where?)
    getSourceBufferTypeFromRepresentation = function(representationXml) {
        if (!representationXml) { return null; }
        var codecStr = representationXml.getAttribute('codecs');
        var typeStr = html5Dash.xmlfun.getInheritableAttribute('mimeType')(representationXml);

        //NOTE: LEADING ZEROS IN CODEC TYPE/SUBTYPE ARE TECHNICALLY NOT SPEC COMPLIANT, BUT GPAC & OTHER
        // DASH MPD GENERATORS PRODUCE THESE NON-COMPLIANT VALUES. HANDLING HERE FOR NOW.
        // See: RFC 6381 Sec. 3.4 (https://tools.ietf.org/html/rfc6381#section-3.4)
        var parsedCodec = codecStr.split('.').map(function(str) {
            return str.replace(/^0+(?!\.|$)/, '');
        });
        var processedCodecStr = parsedCodec.join('.');

        return (typeStr + ';codecs="' + processedCodecStr + '"');
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

        // TODO: Abstract away differences between webkit impl and std impl of MediaSource
        mediaSource.addEventListener('webkitsourceopen', openListener, false);
        mediaSource.addEventListener('sourceopen', openListener, false);

        // TODO: Handle close.
        //mediaSource.addEventListener('webkitsourceclose', closed, false);
        //mediaSource.addEventListener('sourceclose', closed, false);

        tech.setSrc(root.URL.createObjectURL(mediaSource));
    }

    function kickoffSegmentLoading(segmentListType, manifestXml, mediaSource) {
        var adaptationSet = html5Dash.getMpd(manifestXml).getPeriods()[0].getAdaptationSetByType(segmentListType),
            segmentLoader = new html5Dash.SegmentLoader(adaptationSet),
            mimeType = getSourceBufferTypeFromRepresentation(segmentLoader.getCurrentRepresentation().xml),
            sourceBuffer = mediaSource.addSourceBuffer(mimeType),
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
        videojs.on(segmentLoader, segmentLoader.eventList.SEGMENT_LOADED, function segmentLoadedHandler(event) {
            sourceBufferDataQueue.addToQueue(event.data);
            var loading = segmentLoader.loadNextSegment();
            if (!loading) {
                videojs.off(segmentLoader, segmentLoader.eventList.SEGMENT_LOADED, segmentLoadedHandler);
            }
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