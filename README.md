# Video.js Html5 Dash

VideoJS source handler for the MPEG-DASH Adaptive Dynamic Streaming Standard in HTML5

## Getting Started

Once you've added the plugin script to your page, you can use it with any video:

```html
<script src="video.js"></script>
<script src="videojs-html5-dash.js"></script>
<script>
  videojs(document.querySelector('video')).html5Dash();
</script>
```

There's also a [working example](example.html) of the plugin you can check out if you're having trouble.

## Documentation
### Plugin Options

You may pass in an options object to the plugin upon initialization. This
object may contain any of the following properties:

#### option
Type: `boolean`
Default: true

An example boolean option that has no effect.

## Release History

 - 0.1.0: Initial release