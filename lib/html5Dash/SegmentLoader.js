;(function(html5Dash, videojs){

    html5Dash = html5Dash || {};

    var root = this,
        loadSegment,
        loadSegmentByIndex;

    loadSegment = function(segment, callbackFn) {
        var request = new XMLHttpRequest();
        request.open('GET', segment.getUrl(), true);
        request.responseType = 'arraybuffer';
        // TODO: Handle error and other result states.
        request.onload = function() {
            if (typeof callbackFn === 'function') { callbackFn(request.response); }
        };

        request.send();
    };

    function SegmentLoader(adaptationSet, currentSegmentNumber) {
        this.__adaptationSet = adaptationSet;
        // Initialize to 0th representation.
        this.__currentRepresentation = adaptationSet.getRepresentations()[0];
        this.__currentSegmentNumber = currentSegmentNumber || html5Dash.getSegmentListForRepresentation(this.__currentRepresentation).getStartNumber();
    }

    // TODO: Add as "class" properties?
    SegmentLoader.prototype.eventList = {
        INITIALIZATION_LOADED: 'initializationLoaded',
        SEGMENT_LOADED: 'segmentLoaded'
    };

    SegmentLoader.prototype.getCurrentRepresentation = function() { return this.__currentRepresentation; };

    SegmentLoader.prototype.setCurrentRepresentation = function(representation) { this.__currentRepresentation = representation; };

    SegmentLoader.prototype.setCurrentRepresentationByIndex = function(index) {
        var representations = this.__adaptationSet.getRepresentations();
        if (index < 0 || index >= representations.length) {
            throw new Error('index out of bounds');
        }
        this.__currentRepresentation = representations[index];
    };

    SegmentLoader.prototype.getCurrentSegmentNumber = function() { return this.__currentSegmentNumber; };

    SegmentLoader.prototype.getStartSegmentNumber = function() {
        return html5Dash.getSegmentListForRepresentation(this.__currentRepresentation).getStartNumber();
    };

    SegmentLoader.prototype.getEndSegmentNumber = function() {
        return html5Dash.getSegmentListForRepresentation(this.__currentRepresentation).getEndNumber();
    };

    SegmentLoader.prototype.loadInitialization = function() {
        var self = this,
            segmentList = html5Dash.getSegmentListForRepresentation(this.__currentRepresentation),
            initialization = segmentList.getInitialization();

        if (!initialization) { return false; }

        loadSegment.call(this, initialization, function(response) {
            var initSegment = new Uint8Array(response);
            videojs.trigger(self, { type:self.eventList.INITIALIZATION_LOADED, target:self, data:initSegment});
        });

        return true;
    };

    // TODO: Determine how to parameterize by representation variants (bandwidth/bitrate? representation object? index?)
    SegmentLoader.prototype.loadNextSegment = function() {
        var self = this,
            segmentList = html5Dash.getSegmentListForRepresentation(this.__currentRepresentation);

        if (this.__currentSegmentNumber > segmentList.getEndNumber()) { return false; }

        var segment = segmentList.getSegmentByNumber(this.__currentSegmentNumber);

        loadSegment.call(this, segment, function(response) {
            self.__currentSegmentNumber++;
            var initSegment = new Uint8Array(response);
            videojs.trigger(self, { type:self.eventList.SEGMENT_LOADED, target:self, data:initSegment});
        });

        return true;
    };

    // TODO: Implement me!
    SegmentLoader.prototype.loadSegmentAtTime = function(presentationTime) {

    };

    html5Dash.SegmentLoader = SegmentLoader;
    root.html5Dash = html5Dash;

}.call(this, this.html5Dash, this.videojs));