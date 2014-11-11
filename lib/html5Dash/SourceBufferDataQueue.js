;(function(html5Dash, videojs) {
    'use strict';

    html5Dash = html5Dash || {};

    var root = this,
        appendBytes;

    // TODO: Stateless method. Add to SourceBufferDataQue.prototype or not?
    appendBytes = function appendBytes(buffer, bytes) {
        if ('append' in buffer) {
            buffer.append(bytes);
        } else if ('appendBuffer' in buffer) {
            buffer.appendBuffer(bytes);
        }
    };

    function SourceBufferDataQueue(sourceBuffer) {
        // TODO: Check type?
        if (!sourceBuffer) { throw new Error( 'The sourceBuffer constructor argument cannot be null.' ); }

        var dataQueue = [];
        // TODO: figure out how we want to respond to other event states (updateend? error? abort?) (retry? remove?)
        sourceBuffer.addEventListener('update', function(e) {
            // The SourceBuffer instance's updating property should always be false if this event was dispatched,
            // but just in case...
            if (e.target.updating) { return; }
            if (dataQueue.length <= 0) { return; }
            appendBytes(e.target, dataQueue.shift());
        });

        this.__dataQueue = dataQueue;
        this.__sourceBuffer = sourceBuffer;
    }

    // TODO: Figure out api to add to queue at specific positions. Currently only supports linear adding.
    SourceBufferDataQueue.prototype.addToQueue = function(data) {
        // TODO: Check for existence/type? Convert to Uint8Array externally or internally? (Currently assuming external)
        // If nothing is in the queue, go ahead and immediately append the segment data to the source buffer.
        if ((this.__dataQueue.length === 0) && (!this.__sourceBuffer.updating)) { appendBytes(this.__sourceBuffer, data); }
        // Otherwise, push onto queue and wait for the next update event before appending segment data to source buffer.
        else { this.__dataQueue.push(data); }
    };

    html5Dash.SourceBufferDataQueue = SourceBufferDataQueue;
    root.html5Dash = html5Dash;

}.call(this, this.html5Dash, this.videojs));