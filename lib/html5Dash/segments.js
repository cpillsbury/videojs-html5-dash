;(function(html5Dash) {
    var root = this,
        getSegmentListForRepresentation,
        createSegmentListFromTemplate,
        getTotalDurationFromTemplate,
        getSegmentDurationFromTemplate,
        getTotalSegmentCountFromTemplate,
        getStartNumberFromTemplate,
        getEndNumberFromTemplate;

    html5Dash = html5Dash || {};

    getTotalDurationFromTemplate = function(representation) {
        var mediaPresentationDuration = representation.getMpd().getMediaPresentationDuration(),
            parsedMediaPresentationDuration = Number(html5Dash.util.parseMediaPresentationDuration(mediaPresentationDuration)),
            presentationTimeOffset = Number(representation.getSegmentTemplate().getPresentationTimeOffset());
        return parsedMediaPresentationDuration - presentationTimeOffset;
    };

    getSegmentDurationFromTemplate = function(representation) {
        var segmentTemplate = representation.getSegmentTemplate();
        return Number(segmentTemplate.getDuration()) / Number(segmentTemplate.getTimescale());
    };

    getTotalSegmentCountFromTemplate = function(representation) {
        return Math.floor(getTotalDurationFromTemplate(representation) / getSegmentDurationFromTemplate(representation));
    };

    getStartNumberFromTemplate = function(representation) {
        return Number(representation.getSegmentTemplate().getStartNumber());
    };

    getEndNumberFromTemplate = function(representation) {
        return getTotalSegmentCountFromTemplate(representation) + getStartNumberFromTemplate(representation) - 1;
    };

    createSegmentListFromTemplate = function(representation) {
        return {
            getTotalDuration: html5Dash.xmlfun.preApplyArgsFn(getTotalDurationFromTemplate, representation),
            getSegmentDuration: html5Dash.xmlfun.preApplyArgsFn(getSegmentDurationFromTemplate, representation),
            getTotalSegmentCount: html5Dash.xmlfun.preApplyArgsFn(getTotalSegmentCountFromTemplate, representation),
            getStartNumber: html5Dash.xmlfun.preApplyArgsFn(getStartNumberFromTemplate, representation),
            getEndNumber: html5Dash.xmlfun.preApplyArgsFn(getEndNumberFromTemplate, representation),
            // TODO: Externalize
            getInitialization: function() {
                var initialization = {};
                initialization.getUrl = function() {
                    var baseUrl = representation.getBaseUrl(),
                        representationId = representation.getId(),
                        initializationRelativeUrlTemplate = representation.getSegmentTemplate().getInitialization(),
                        initializationRelativeUrl = html5Dash.segmentTemplate.replaceIDForTemplate(initializationRelativeUrlTemplate, representationId);
                    return baseUrl + initializationRelativeUrl;
                };
                return initialization;
            },
            getSegmentByNumber: function(number) {
                var segment = {};
                segment.getUrl = function() {
                    var baseUrl = representation.getBaseUrl(),
                        segmentRelativeUrlTemplate = representation.getSegmentTemplate().getMedia(),
                        replacedIdUrl = html5Dash.segmentTemplate.replaceIDForTemplate(segmentRelativeUrlTemplate, representation.getId()),
                        // TODO: Since $Time$-templated segment URLs should only exist in conjunction w/a <SegmentTimeline>,
                        // TODO: can currently assume a $Number$-based templated url.
                        // TODO: Enforce min/max number range (based on segmentList startNumber & endNumber)
                        replacedNumberUrl = html5Dash.segmentTemplate.replaceTokenForTemplate(replacedIdUrl, 'Number', number);
                    return baseUrl + replacedNumberUrl;
                };
                segment.getStartTime = function() {
                    return number * getSegmentDurationFromTemplate(representation);
                };
                segment.getDuration = function() {
                    // TODO: Handle last segment (likely < segment duration)
                    return getSegmentDurationFromTemplate(representation);
                };
                segment.getNumber = function() { return number; };
                return segment;
            },
            getSegmentByMediaPresentationTime: function() { return {}; }
        };
    };

    getSegmentListForRepresentation = function(representation) {
        if (!representation) { return undefined; }
        // TODO: Switch statement?
        if (representation.getSegmentTemplate()) { return createSegmentListFromTemplate(representation); }
        return undefined;
    };

    html5Dash.getSegmentListForRepresentation = getSegmentListForRepresentation;

    root.html5Dash = html5Dash;

}.call(this, this.html5Dash));