;(function(html5Dash) {
    'use strict';

    // If the html5Dash namespace already exists, add to it. Otherwise, create a new Object instance
    html5Dash = html5Dash || {};

    var root = this,
        createMpdObject,
        createPeriodObject,
        createAdaptationSetObject,
        createRepresentationObject,
        createSegmentTemplate,
        getMpd,
        getAdaptationSetByType,
        getDescendantObjectsArrayByName,
        getAncestorObjectByName;

    // TODO: Should this exist on mpd dataview or at a higher level?
    // TODO: Refactor. Could be more efficient (Recursive fn? Use element.getElementsByName('BaseUrl')[0]?).
    // TODO: Currently assuming *EITHER* <BaseURL> nodes will provide an absolute base url (ie resolve to 'http://' etc)
    // TODO: *OR* we should use the base url of the host of the MPD manifest.
    var buildBaseUrl = function(xmlNode) {
        //var elemHierarchy = [elem];
        //Array.prototype.push.apply(elemHierarchy, xmlfun.getAncestors(elem));
        var elemHierarchy = [xmlNode].concat(html5Dash.xmlfun.getAncestors(xmlNode)),
            foundLocalBaseUrl = false;
        //var baseUrls = _.map(elemHierarchy, function(elem) {
        var baseUrls = elemHierarchy.map(function(elem) {
            if (foundLocalBaseUrl) { return ''; }
            if (!elem.hasChildNodes()) { return ''; }
            var child;
            for (var i=0; i<elem.childNodes.length; i++) {
                child = elem.childNodes.item(i);
                if (child.nodeName === 'BaseURL') {
                    var textElem = child.childNodes.item(0);
                    var textValue = textElem.wholeText.trim();
                    if (textValue.indexOf('http://') === 0) { foundLocalBaseUrl = true; }
                    return textElem.wholeText.trim();
                }
            }

            return '';
        });

        var baseUrl = baseUrls.reverse().join('');
        if (!baseUrl) { return html5Dash.util.parseRootUrl(xmlNode.baseURI); }
        return baseUrl;
    };

    var elemsWithCommonProperties = [
        'AdaptationSet',
        'Representation',
        'SubRepresentation'
    ];

    var hasCommonProperties = function(elem) {
        return elemsWithCommonProperties.indexOf(elem.nodeName) >= 0;
    };

    var doesntHaveCommonProperties = function(elem) {
        return !hasCommonProperties(elem);
    };

    var getWidth = html5Dash.xmlfun.getInheritableAttribute('width'),
        getHeight = html5Dash.xmlfun.getInheritableAttribute('height'),
        getFrameRate = html5Dash.xmlfun.getInheritableAttribute('frameRate'),
        getMimeType = html5Dash.xmlfun.getInheritableAttribute('mimeType'),
        getCodecs = html5Dash.xmlfun.getInheritableAttribute('codecs');

    var getSegmentTemplateXml = html5Dash.xmlfun.getInheritableElement('SegmentTemplate', doesntHaveCommonProperties);

    // MPD Attr fns
    var getMediaPresentationDuration = html5Dash.xmlfun.getAttrFn('mediaPresentationDuration');

    // Representation Attr fns
    var getId = html5Dash.xmlfun.getAttrFn('id'),
        getBandwidth = html5Dash.xmlfun.getAttrFn('bandwidth');

    // SegmentTemplate Attr fns
    var getInitialization = html5Dash.xmlfun.getAttrFn('initialization'),
        getMedia = html5Dash.xmlfun.getAttrFn('media'),
        getDuration = html5Dash.xmlfun.getAttrFn('duration'),
        getTimescale = html5Dash.xmlfun.getAttrFn('timescale'),
        getPresentationTimeOffset = html5Dash.xmlfun.getAttrFn('presentationTimeOffset'),
        getStartNumber = html5Dash.xmlfun.getAttrFn('startNumber');

    // TODO: Repeat code. Abstract away (Prototypal Inheritance/OO Model? Object composer fn?)
    createMpdObject = function(xmlNode) {
        return {
            xml: xmlNode,
            // Descendants, Ancestors, & Siblings
            getPeriods: html5Dash.xmlfun.preApplyArgsFn(getDescendantObjectsArrayByName, xmlNode, 'Period', createPeriodObject),
            getMediaPresentationDuration: html5Dash.xmlfun.preApplyArgsFn(getMediaPresentationDuration, xmlNode)
        };
    };

    createPeriodObject = function(xmlNode) {
        return {
            xml: xmlNode,
            // Descendants, Ancestors, & Siblings
            getAdaptationSets: html5Dash.xmlfun.preApplyArgsFn(getDescendantObjectsArrayByName, xmlNode, 'AdaptationSet', createAdaptationSetObject),
            getAdaptationSetByType: function(type) {
                return getAdaptationSetByType(type, xmlNode);
            },
            getMpd: html5Dash.xmlfun.preApplyArgsFn(getAncestorObjectByName, xmlNode, 'MPD', createMpdObject)
        };
    };

    createAdaptationSetObject = function(xmlNode) {
        return {
            xml: xmlNode,
            // Descendants, Ancestors, & Siblings
            getRepresentations: html5Dash.xmlfun.preApplyArgsFn(getDescendantObjectsArrayByName, xmlNode, 'Representation', createRepresentationObject),
            getSegmentTemplate: function() {
                return createSegmentTemplate(getSegmentTemplateXml(xmlNode));
            },
            getPeriod: html5Dash.xmlfun.preApplyArgsFn(getAncestorObjectByName, xmlNode, 'Period', createPeriodObject),
            getMpd: html5Dash.xmlfun.preApplyArgsFn(getAncestorObjectByName, xmlNode, 'MPD', createMpdObject),
            // Attrs
            getMimeType: html5Dash.xmlfun.preApplyArgsFn(getMimeType, xmlNode)
        };
    };

    createRepresentationObject = function(xmlNode) {
        return {
            xml: xmlNode,
            // Descendants, Ancestors, & Siblings
            getSegmentTemplate: function() {
                return createSegmentTemplate(getSegmentTemplateXml(xmlNode));
            },
            getAdaptationSet: html5Dash.xmlfun.preApplyArgsFn(getAncestorObjectByName, xmlNode, 'AdaptationSet', createAdaptationSetObject),
            getPeriod: html5Dash.xmlfun.preApplyArgsFn(getAncestorObjectByName, xmlNode, 'Period', createPeriodObject),
            getMpd: html5Dash.xmlfun.preApplyArgsFn(getAncestorObjectByName, xmlNode, 'MPD', createMpdObject),
            // Attrs
            getId: html5Dash.xmlfun.preApplyArgsFn(getId, xmlNode),
            getWidth: html5Dash.xmlfun.preApplyArgsFn(getWidth, xmlNode),
            getHeight: html5Dash.xmlfun.preApplyArgsFn(getHeight, xmlNode),
            getFrameRate: html5Dash.xmlfun.preApplyArgsFn(getFrameRate, xmlNode),
            getBandwidth: html5Dash.xmlfun.preApplyArgsFn(getBandwidth, xmlNode),
            getCodecs: html5Dash.xmlfun.preApplyArgsFn(getCodecs, xmlNode),
            getBaseUrl: html5Dash.xmlfun.preApplyArgsFn(buildBaseUrl, xmlNode),
            getMimeType: html5Dash.xmlfun.preApplyArgsFn(getMimeType, xmlNode)
        };
    };

    createSegmentTemplate = function(xmlNode) {
        return {
            xml: xmlNode,
            // Descendants, Ancestors, & Siblings
            getAdaptationSet: html5Dash.xmlfun.preApplyArgsFn(getAncestorObjectByName, xmlNode, 'AdaptationSet', createAdaptationSetObject),
            getPeriod: html5Dash.xmlfun.preApplyArgsFn(getAncestorObjectByName, xmlNode, 'Period', createPeriodObject),
            getMpd: html5Dash.xmlfun.preApplyArgsFn(getAncestorObjectByName, xmlNode, 'MPD', createMpdObject),
            // Attrs
            getInitialization: html5Dash.xmlfun.preApplyArgsFn(getInitialization, xmlNode),
            getMedia: html5Dash.xmlfun.preApplyArgsFn(getMedia, xmlNode),
            getDuration: html5Dash.xmlfun.preApplyArgsFn(getDuration, xmlNode),
            getTimescale: html5Dash.xmlfun.preApplyArgsFn(getTimescale, xmlNode),
            getPresentationTimeOffset: html5Dash.xmlfun.preApplyArgsFn(getPresentationTimeOffset, xmlNode),
            getStartNumber: html5Dash.xmlfun.preApplyArgsFn(getStartNumber, xmlNode)
        };
    };

    getAdaptationSetByType = function(type, periodXml) {
        var adaptationSets = periodXml.getElementsByTagName('AdaptationSet'),
            adaptationSet,
            representation,
            mimeType;

        for (var i=0; i<adaptationSets.length; i++) {
            adaptationSet = adaptationSets.item(i);
            // Safe to assume that type (i.e. 'video' vs. 'audio' vs. 'text') won't differ between representations,
            // so just grab the first one.
            representation = adaptationSet.getElementsByTagName('Representation')[0];
            // Need to check the representation instead of the adaptation set, since the mimeType may not be specified
            // on the adaptation set at all and may be specified for each of the representations instead.
            mimeType = getMimeType(representation);
            if (!!mimeType && mimeType.indexOf(type) >= 0) { return createAdaptationSetObject(adaptationSet); }
        }

        return null;
    };

    getMpd = function(manifestXml) {
        return getDescendantObjectsArrayByName(manifestXml, 'MPD', createMpdObject)[0];
    };

    getDescendantObjectsArrayByName = function(parentXml, tagName, mapFn) {
        var descendantsXmlArray = Array.prototype.slice.call(parentXml.getElementsByTagName(tagName));
        /*if (typeof mapFn === 'function') { return descendantsXmlArray.map(mapFn); }*/
        if (typeof mapFn === 'function') {
            var mappedElem = descendantsXmlArray.map(mapFn);
            return  mappedElem;
        }
        return descendantsXmlArray;
    };

    getAncestorObjectByName = function(xmlNode, tagName, mapFn) {
        if (!tagName || !xmlNode || !xmlNode.parentNode) { return null; }
        if (!xmlNode.parentNode.hasOwnProperty('nodeName')) { return null; }

        if (xmlNode.parentNode.nodeName === tagName) {
            return (typeof mapFn === 'function') ? mapFn(xmlNode.parentNode) : xmlNode.parentNode;
        }
        return getAncestorObjectByName(xmlNode.parentNode, tagName, mapFn);
    };

    html5Dash.getMpd = getMpd;

    root.html5Dash = html5Dash;

}.call(this, this.html5Dash));