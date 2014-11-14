;(function(html5Dash) {

    // The root object. In browsers, this will be the window object.
    var root = this;

    // NOTE: TAKEN FROM LODASH TO REMOVE DEPENDENCY


    /** `Object#toString` result shortcuts */
    var funcClass = '[object Function]',
        stringClass = '[object String]';


    /** Used to resolve the internal [[Class]] of values */
    var toString = Object.prototype.toString;

    var isFunction = function isFunction(value) {
        return typeof value === 'function';
    };
    // fallback for older versions of Chrome and Safari
    if (isFunction(/x/)) {
        isFunction = function(value) {
            return typeof value === 'function' && toString.call(value) === funcClass;
        };
    }

    var isString = function isString(value) {
        return typeof value === 'string' ||
            value && typeof value === 'object' && toString.call(value) === stringClass || false;
    };

    // NOTE: END OF LODASH-BASED CODE

    // The Library's Namespace.
    var xmlfun = root.xmlfun = {};

    // General Utility Functions
    function existy(x) { return x !== null; }

    // NOTE: This version of truthy allows more values to count
    // as "true" than standard JS Boolean operator comparisons.
    // Specifically, truthy() will return true for the values
    // 0, "", and NaN, whereas JS would treat these as "falsy" values.
    function truthy(x) { return (x !== false) && existy(x); }

    function preApplyArgsFn(fun /*, args */) {
        var preAppliedArgs = Array.prototype.slice.call(arguments, 1);
        return function() { return fun.apply(null, preAppliedArgs); };
    }

    // Higher-order XML functions

    // Takes function(s) as arguments
    var getAncestors = function(elem, shouldStopPred) {
        var ancestors = [];
        if (!isFunction(shouldStopPred)) { shouldStopPred = function() { return false; }; }
        (function getAncestorsRecurse(elem) {
            if (shouldStopPred(elem, ancestors)) { return; }
            if (existy(elem) && existy(elem.parentNode)) {
                ancestors.push(elem.parentNode);
                getAncestorsRecurse(elem.parentNode);
            }
            return;
        })(elem);
        return ancestors;
    };

    // Returns function
    var getNodeListByName = function(name) {
        return function(xmlObj) {
            return xmlObj.getElementsByTagName(name);
        };
    };

    // Returns function
    var hasMatchingAttribute = function(attrName, value) {
        if ((typeof attrName !== 'string') || attrName === '') { return undefined; }
        return function(elem) {
            if (!existy(elem) || !existy(elem.hasAttribute) || !existy(elem.getAttribute)) { return false; }
            if (!existy(value)) { return elem.hasAttribute(attrName); }
            return (elem.getAttribute(attrName) === value);
        };
    };

    // Returns function
    var getAttrFn = function(attrName) {
        if (!isString(attrName)) { return undefined; }
        return function(elem) {
            if (!existy(elem) || !isFunction(elem.getAttribute)) { return undefined; }
            return elem.getAttribute(attrName);
        };
    };

    // Returns function
    // TODO: Add shouldStopPred (should function similarly to shouldStopPred in getInheritableElement, below)
    var getInheritableAttribute = function(attrName) {
        if ((!isString(attrName)) || attrName === '') { return undefined; }
        return function recurseCheckAncestorAttr(elem) {
            if (!existy(elem) || !existy(elem.hasAttribute) || !existy(elem.getAttribute)) { return undefined; }
            if (elem.hasAttribute(attrName)) { return elem.getAttribute(attrName); }
            if (!existy(elem.parentNode)) { return undefined; }
            return recurseCheckAncestorAttr(elem.parentNode);
        };
    };

    // Takes function(s) as arguments; Returns function
    var getInheritableElement = function(nodeName, shouldStopPred) {
        if ((!isString(nodeName)) || nodeName === '') { return undefined; }
        if (!isFunction(shouldStopPred)) { shouldStopPred = function() { return false; }; }
        return function getInheritableElementRecurse(elem) {
            if (!existy(elem) || !existy(elem.getElementsByTagName)) { return undefined; }
            if (shouldStopPred(elem)) { return undefined; }
            var matchingElemList = elem.getElementsByTagName(nodeName);
            if (existy(matchingElemList) && matchingElemList.length > 0) { return matchingElemList[0]; }
            if (!existy(elem.parentNode)) { return undefined; }
            return getInheritableElementRecurse(elem.parentNode);
        };
    };

    // TODO: Implement me for BaseURL or use existing fn (See: mpd.js buildBaseUrl())
    var buildHierarchicallyStructuredValue = function(valueFn, buildFn, stopPred) {

    };

    // Publish External API:

    xmlfun.existy = existy;
    xmlfun.truthy = truthy;

    xmlfun.getNodeListByName = getNodeListByName;
    xmlfun.hasMatchingAttribute = hasMatchingAttribute;
    xmlfun.getInheritableAttribute = getInheritableAttribute;
    xmlfun.getAncestors = getAncestors;
    xmlfun.getAttrFn = getAttrFn;
    xmlfun.preApplyArgsFn = preApplyArgsFn;
    xmlfun.getInheritableElement = getInheritableElement;

    html5Dash = html5Dash || {};
    html5Dash.xmlfun = xmlfun;
    root.html5Dash = html5Dash;

}.call(this, this.html5Dash));