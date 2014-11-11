;(function(html5Dash, videojs){

    html5Dash = html5Dash || {};

    var root = this,
        getBaseUrl,
        getRelativeInitializationUrlForRepresentation,
        getRelativeSegmentUrlForRepresentation,
        getInitializationUrl,
        getSegmentUrl,
        loadInitialization,
        loadSegmentByIndex,
        computeTotalSegmentCount;

    getBaseUrl = function(representationXml) {
        // TODO: Check for BaseURL nodes before defaulting to mpd hosting url.
        return html5Dash.util.parseRootUrl(representationXml.baseURI);
    };

    getRelativeInitializationUrlForRepresentation = function(representationXml, segmentTemplateXml) {
        if (!representationXml || !segmentTemplateXml) { return ''; }

        var initializationTemplateStr = segmentTemplateXml.getAttribute('initialization'),
            representationIdStr = representationXml.getAttribute('id');

        return html5Dash.segmentTemplate.replaceIDForTemplate(initializationTemplateStr, representationIdStr);
    };

    getRelativeSegmentUrlForRepresentation = function(index, representationXml, segmentTemplateXml) {
        if (!representationXml || !segmentTemplateXml) { return ''; }

        var mediaTemplateStr = segmentTemplateXml.getAttribute('media'),
            representationIdStr = representationXml.getAttribute('id'),
            idReplacedTemplateStr = html5Dash.segmentTemplate.replaceIDForTemplate(mediaTemplateStr, representationIdStr);

        return html5Dash.segmentTemplate.replaceTokenForTemplate(idReplacedTemplateStr, 'Number', index);
    };

    getInitializationUrl = function(representationXml, segmentTemplateXml) {
        return getBaseUrl(representationXml) + getRelativeInitializationUrlForRepresentation(representationXml, segmentTemplateXml);
    };

    getSegmentUrl = function(index, representationXml, segmentTemplateXml) {
        return getBaseUrl(representationXml) + getRelativeSegmentUrlForRepresentation(index, representationXml, segmentTemplateXml);
    };

    // TODO: Duplicate code. Refactor loadInitialization & loadSegmentByIndex into single fn
    loadInitialization = function(representationXml, segmentTemplateXml, callbackFn) {
        var url = getInitializationUrl(representationXml, segmentTemplateXml);
        var request = new XMLHttpRequest();
        request.open('GET', url, true);
        request.responseType = 'arraybuffer';
        request.onload = function() {
            if (typeof callbackFn === 'function') { callbackFn(request.response); }
        };

        request.send();
    };

    // TODO: Duplicate code. Refactor loadInitialization & loadSegmentByIndex into single fn
    loadSegmentByIndex = function(index, representationXml, segmentTemplateXml, callbackFn) {
        var url = getSegmentUrl(index, representationXml, segmentTemplateXml);
        var request = new XMLHttpRequest();
        request.open('GET', url, true);
        request.responseType = 'arraybuffer';
        // TODO: Handle error
        request.onload = function() {
            if (typeof callbackFn === 'function') { callbackFn(request.response); }
        };

        request.send();
    };

    computeTotalSegmentCount = function(representation, segmentTemplate) {
        // Representation -> AdaptationSet -> Period -> MPD
        var mpdXml = representation.parentNode.parentNode.parentNode,
            duration = html5Dash.util.parseMediaPresentationDuration(mpdXml.getAttribute('mediaPresentationDuration')),
            templateDuration = Number(segmentTemplate.getAttribute('duration')),
            templateTimescale = Number(segmentTemplate.getAttribute('timescale')),
            segmentDuration = templateDuration / templateTimescale,
            totalSegmentCount = Math.floor(duration / segmentDuration);

        return totalSegmentCount;
    };

    function SegmentLoader(representation) {
        this.__representation = representation;
        this.__segmentTemplate = representation.parentNode.getElementsByTagName('SegmentTemplate')[0];

        // TODO: Though for most use cases this will be 0, should determine index from MPD
        this.__currentIndex = 0;
        this.__totalSegmentCount = computeTotalSegmentCount(this.__representation, this.__segmentTemplate);
    }

    // TODO: Add as "class" properties?
    SegmentLoader.prototype.eventList = {
        INITIALIZATION_LOADED: 'initializationLoaded',
        SEGMENT_LOADED: 'segmentLoaded'
    };

    SegmentLoader.prototype.getCurrentIndex = function() { return this.__currentIndex; };

    SegmentLoader.prototype.getTotalSegmentCount = function() { return this.__totalSegmentCount; };

    SegmentLoader.prototype.loadInitialization = function() {
        var self = this;

        loadInitialization.call(this, this.__representation, this.__segmentTemplate, function(response) {
            var initSegment = new Uint8Array(response);
            videojs.trigger(self, { type:self.eventList.INITIALIZATION_LOADED, target:self, data:initSegment});
        });
    };

    SegmentLoader.prototype.loadNextSegment = function() {
        var self = this;
        if (this.__currentIndex >= this.__totalSegmentCount) { return false; }
        loadSegmentByIndex.call(this, this.__currentIndex, this.__representation, this.__segmentTemplate, function(response) {
            self.__currentIndex++;
            var segment = new Uint8Array(response);
            videojs.trigger(self, { type:self.eventList.SEGMENT_LOADED, target:self, data:segment});
        });

        return true;
    };

    html5Dash.SegmentLoader = SegmentLoader;
    root.html5Dash = html5Dash;

}.call(this, this.html5Dash, this.videojs));