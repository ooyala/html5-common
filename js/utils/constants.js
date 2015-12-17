  /**
   * @namespace OO
   */
  (function(OO,_){

    // External States
	/**
	 * @description The Ooyala Player run-time states apply to an Ooyala player while it is running. These states apply equally to both HTML5 and Flash players.
	 * State changes occur either through user interaction (for example, the user clickes the PLAY button), or programmatically via API calls. For more information,
	 * see <a href="http://support.ooyala.com/developers/documentation/api/player_v3_api_events.html" target="target">Player Message Bus Events</a>.
	 * @summary Represents the Ooyala Player run-time states.
	 * @namespace OO.STATE
	 */
    OO.STATE = {
      /** The embed code has been set. The movie and its metadata is currently being loaded into the player. */
      LOADING : 'loading',
      /**
       * One of the following applies:
       * <ul>
       *   <li>All of the necessary data is loaded in the player. Playback of the movie can begin.</li>
       *   <li>Playback of the asset has finished and is ready to restart from the beginning.</li>
       * </ul>
       */
      READY : 'ready',
      /** The player is currently playing video content. */
      PLAYING : 'playing',
      /** The player has currently paused after playback had begun. */
      PAUSED : 'paused',

      /** Playback has currently stopped because it doesn't have enough movie data to continue and is downloading more. */
      BUFFERING : 'buffering',
      /** The player has encountered an error that prevents playback of the asset. The error could be due to many reasons,
       * such as video format, syndication rules, or the asset being disabled. Refer to the list of errors for details.
       * The error code for the root cause of the error is available from the [OO.Player.getErrorCode()]{@link OO.Player#getErrorCode} method.
       */
      ERROR : 'error',
      /** The player has been destroyed via its [OO.Player.destroy(<i>callback</i>)]{@link OO.Player#destroy} method. */
      DESTROYED : 'destroyed',

      __end_marker : true
    };

    // All Events Constants
    /**
     * @description The Ooyala Player events are default events that are published by the event bus.Your modules can subscribe to any and all of these events.
     * Use message bus events to subscribe to or publish player events from video to ad playback. For more information,
     * see <a href="http://support.ooyala.com/developers/documentation/api/player_v3_api_events.html" target="target">Player Message Bus Events</a>.
     * @summary Represents the Ooyala Player events.
     * @namespace OO.EVENTS
     */
    OO.EVENTS = {

     /**
      * A player was created. This is the first event that is sent after player creation.
      * This event provides the opportunity for any other modules to perform their own initialization.
      * The handler is called with the query string parameters.
      * The DOM has been created at this point, and plugins may make changes or additions to the DOM.<br/><br/>
      *
      * <h5>Compatibility: </h5>
      * <p style="text-indent: 1em;">HTML5, Flash</p>
      *
      * @event OO.EVENTS#PLAYER_CREATED
      */
      PLAYER_CREATED : 'playerCreated',

      PLAYER_EMBEDDED: 'playerEmbedded',

      /**
       * An attempt has been made to set the embed code.
       * If you are developing a plugin, reset the internal state since the player is switching to a new asset.
       * Depending on the context, the handler is called with:
       *   <ul>
       *     <li>The ID (embed code) of the asset.</li>
       *     <li>The ID (embed code) of the asset, with options.</li>
       *   </ul>
       *
       * <h5>Compatibility: </h5>
       * <p style="text-indent: 1em;">HTML5, Flash</p>
       *
       * @event OO.EVENTS#SET_EMBED_CODE
       */
      SET_EMBED_CODE : 'setEmbedCode',

      /**
       * The player's embed code has changed. The handler is called with two parameters:
       * <ul>
       *    <li>The ID (embed code) of the asset.</li>
       *    <li>The options JSON object.</li>
       * </ul>
       *
       * <h5>Compatibility: </h5>
       * <p style="text-indent: 1em;">HTML5, Flash</p>
       *
       * @event OO.EVENTS#EMBED_CODE_CHANGED
       */
      EMBED_CODE_CHANGED : 'embedCodeChanged',

      /**
       * An <code>AUTH_TOKEN_CHANGED</code> event is triggered when an authorization token is issued by the
       * <a href="http://support.ooyala.com/developers/documentation/concepts/player_v3_authorization_api.html" target="target">Player Authorization API</a>.<br/>
       * For example, in device registration, an authorization token is issued, as described in
       * <a href="http://support.ooyala.com/developers/documentation/concepts/device_registration.html" target="target">Device Registration</a>.
       * The handler is called with a new value for the authorization token.<br/><br/>
       *
       * <h5>Compatibility: </h5>
       * <p style="text-indent: 1em;">Flash</p>
       *
       * @event OO.EVENTS#AUTH_TOKEN_CHANGED
       */
      AUTH_TOKEN_CHANGED: "authTokenChanged",

      /**
       * The GUID has been set. The handler is called with the GUID.
       * <p>This event notifies plugin or page developers that a unique ID has been either generated or loaded for the current user's browser.
       * This is useful for analytics.</p>
       * <p>In HTML5, Flash, and Chromecast environments, a unique user is identified by local storage or a cookie. </p>
       * <p>To generate the GUID, Flash players use the timestamp indicating when the GUID is generated, and append random data to it.
       * The string is then converted to base64.</p>
       * <p>To generate the GUID, HTML5 players use the current time, browser
       * information, and random data and hash it and convert it to base64.</p>
       * <p>Within the same browser on the desktop, once a GUID is set by one platform
       * it is used for both platforms for the user. If a user clears their browser cache, that user's (device's) ID will be regenerated the next time
       * they watch video. Incognito modes will track a user for a single session, but once the browser is closed the GUID is erased.</p>
       * <p>For more information, see <b>unique user</b> <a href="http://support.ooyala.com/users/users/documentation/reference/glossary.html" target="target">Glossary</a>.</p>
       *
       * <h5>Compatibility: </h5>
       * <p style="text-indent: 1em;">HTML5</p>
       *
       * @event OO.EVENTS#GUID_SET
       */
      GUID_SET : 'guidSet',

      WILL_FETCH_PLAYER_XML: 'willFetchPlayerXml',
      PLAYER_XML_FETCHED: 'playerXmlFetched',
      WILL_FETCH_CONTENT_TREE: 'willFetchContentTree',

      /**
       * A content tree was fetched. The handler is called with a JSON object that represents the content data for the current asset.<br/><br/>
       *
       * <h5>Compatibility: </h5>
       * <p style="text-indent: 1em;">HTML5, Flash</p>
       *
       * <h5>Analytics:</h5>
       * <p style="text-indent: 1em;">Records a <code>display</code> event. For more information see
       * <a href="http://support.ooyala.com/developers/documentation/concepts/analytics_plays-and-displays.html" target="target">Displays, Plays, and Play Starts</a>.</p>
       *
       * @event OO.EVENTS#CONTENT_TREE_FETCHED
       */
      CONTENT_TREE_FETCHED: 'contentTreeFetched',

      WILL_FETCH_METADATA: 'willFetchMetadata',

      /**
       * The metadata, which is typically set in Backlot, has been retrieved.
       * The handler is called with the JSON object containing all metadata associated with the current asset.
       * The metadata includes page-level, asset-level, player-level, and account-level metadata, in addition to
       * metadata specific to 3rd party plugins. This is typically used for ad and anlytics plugins, but can be used
       * wherever you need specific logic based on the asset type.<br/><br/>
       *
       * <h5>Compatibility: </h5>
       * <p style="text-indent: 1em;">HTML5, Flash</p>
       *
       * @event OO.EVENTS#METADATA_FETCHED
       */
      METADATA_FETCHED: 'metadataFetched',

      WILL_FETCH_AUTHORIZATION: 'willFetchAuthorization',

      /**
       * Playback was authorized. The handler is called with an object containing the entire SAS response, and includes the value of <code>video_bitrate</code>.
       * <p>For more information see
       * <a href="http://support.ooyala.com/developers/documentation/concepts/encodingsettings_videobitrate.html" target="target">Video Bit Rate</a>.</p>
       *
       * <h5>Compatibility: </h5>
       * <p style="text-indent: 1em;">HTML5</p>
       *
       * @event OO.EVENTS#AUTHORIZATION_FETCHED
       */
      AUTHORIZATION_FETCHED: 'authorizationFetched',

      WILL_FETCH_AD_AUTHORIZATION: 'willFetchAdAuthorization',
      AD_AUTHORIZATION_FETCHED: 'adAuthorizationFetched',

      CAN_SEEK: 'canSeek',
      WILL_RESUME_MAIN_VIDEO: 'willResumeMainVideo',

      /**
       * The player has indicated that it is in a playback-ready state.
       * All preparations are complete, and the player is ready to receive playback commands
       * such as play, seek, and so on. The default UI shows the <b>Play</b> button,
       * displaying the non-clickable spinner before this point. <br/><br/>
       *
       * <h5>Compatibility: </h5>
       * <p style="text-indent: 1em;">HTML5, Flash</p>
       *
       * @event OO.EVENTS#PLAYBACK_READY
       */
      PLAYBACK_READY: 'playbackReady',

      /**
       * Play has been called for the first time. <br/><br/>
       *
       * <h5>Compatibility: </h5>
       * <p style="text-indent: 1em;">HTML5</p>
       *
       * @event OO.EVENTS#INITIAL_PLAY
       */
      INITIAL_PLAY: "initialPlay", // when play is called for the very first time ( in start screen )

      WILL_PLAY : 'willPlay',


      /** The user has restarted the playback after the playback finished */
      REPLAY : 'replay',

      /**
       * The playhead time changed. The handler is called with the following arguments:
       * <ul>
       *   <li>The current time.</li>
       *   <li>The duration.</li>
       *   <li>The name of the buffer.</li>
       *   <li>The seek range.</li>
       *   <li>The id of the video (as defined by the module that controls it).</li>
       * </ul>
       *
       * <h5>Compatibility: </h5>
       * <p style="text-indent: 1em;">HTML5, Flash</p>
       *
       * <h5>Analytics:</h5>
       * <p style="text-indent: 1em;">The first event is <code>video start</code>. Other instances of the event feed the <code>% completed data points</code>.</p>
       * <p style="text-indent: 1em;">For more information, see <a href="http://support.ooyala.com/developers/documentation/concepts/analytics_plays-and-displays.html">Displays, Plays, and Play Starts</a>.</p>
       *
       * @event OO.EVENTS#PLAYHEAD_TIME_CHANGED
       */
      PLAYHEAD_TIME_CHANGED: 'playheadTimeChanged',

      /**
       * The player is buffering the data stream.
       * The handler is called with the following arguments:
       * <ul>
       *   <li>The url of the video that is buffering.</li>
       *   <li>The id of the video that is buffering (as defined by the module that controls it).</li>
       * </ul><br/><br/>
       *
       * <h5>Compatibility: </h5>
       * <p style="text-indent: 1em;">HTML5, Flash</p>
       *
       * @event OO.EVENTS#BUFFERING
       */
      BUFFERING: 'buffering', // playing stops because player is buffering

      /**
       * Play resumes because the player has completed buffering. The handler is called with the URL of the stream.
       * The handler is called with the following arguments:
       * <ul>
       *   <li>The url of the video that has buffered.</li>
       *   <li>The id of the video that has buffered (as defined by the module that controls it).</li>
       * </ul><br/><br/>
       *
       * <h5>Compatibility: </h5>
       * <p style="text-indent: 1em;">HTML5</p>
       *
       * @event OO.EVENTS#BUFFERED
       */
      BUFFERED: 'buffered',

      /**
       * The player is downloading content (it can play while downloading).
       * The handler is called with the following arguments:
       * <ul>
       *   <li>The current time.</li>
       *   <li>The duration.</li>
       *   <li>The name of the buffer.</li>
       *   <li>The seek range.</li>
       *   <li>The id of the video (as defined by the module that controls it).</li>
       * </ul>
       * <br/><br/>
       *
       * <h5>Compatibility: </h5>
       * <p style="text-indent: 1em;">HTML5</p>
       *
       * @event OO.EVENTS#DOWNLOADING
       */
      DOWNLOADING:  'downloading', // player is downloading content (could be playing while downloading)

      /**
       * Lists the available bitrate information. The handler is called with an object containing the entire SAS response, and includes:
       *   <ul>
       *     <li>The bitrate qualities.</li>
       *     <li>The bitrates.</li>
       *     <li>The target bitrate's quality.</li>
       *     <li>The target bitrate.</li>
       *   </ul>
       * <p>For more information see
       * <a href="http://support.ooyala.com/developers/documentation/concepts/encodingsettings_videobitrate.html" target="target">Video Bit Rate</a>.</p>
       * <h5>Compatibility: </h5>
       * <p style="text-indent: 1em;">Flash</p>
       *
       * @event OO.EVENTS#BITRATE_INFO_AVAILABLE
       */
      BITRATE_INFO_AVAILABLE: 'bitrateInfoAvailable',
      SET_TARGET_BITRATE: 'setTargetBitrate',
      SET_TARGET_BITRATE_QUALITY: 'setTargetBitrateQuality',

      /**
       * The currently playing bitrate has changed. The handler is called with the video bitrate.
       * <p>For more information see
       * <a href="http://support.ooyala.com/developers/documentation/concepts/encodingsettings_videobitrate.html" target="target">Video Bit Rate</a>.</p>
       *
       * <h5>Compatibility: </h5>
       * <p style="text-indent: 1em;">Flash</p>
       *
       * @event OO.EVENTS#BITRATE_CHANGED
       */
      BITRATE_CHANGED: 'bitrateChanged',

      CLOSED_CAPTIONS_INFO_AVAILABLE: 'closedCaptionsInfoAvailable',
      SET_CLOSED_CAPTIONS_LANGUAGE: 'setClosedCaptionsLanguage',
      CLOSED_CAPTION_CUE_CHANGED: 'closedCaptionCueChanged',

      SCRUBBING: 'scrubbing',
      SCRUBBED: 'scrubbed',

      /**
       * A request to perform a seek has occurred. The playhead is requested to move to
       * a specific location, specified in milliseconds. The handler is called with the position to which to seek.<br/><br/>
       *
       * <h5>Compatibility: </h5>
       * <p style="text-indent: 1em;">HTML5</p>
       *
       * @event OO.EVENTS#SEEK
       */
      SEEK: 'seek',

      /**
       * The player has finished seeking the main video to the requested position.
       *
       * <h5>Compatibility: </h5>
       * <p style="text-indent: 1em;">HTML5</p>
       *
       * @event OO.EVENTS#SEEKED
       */
      SEEKED: 'seeked',

      /**
       * A playback request has been made. <br/><br/>
       *
       * <h5>Compatibility: </h5>
       * <p style="text-indent: 1em;">HTML5, Flash</p>
       *
       * @event OO.EVENTS#PLAY
       */
      PLAY: 'play',

      PLAYING: 'playing',
      PLAY_FAILED: 'playFailed',

      /**
       * A player pause has been requested. <br/><br/>
       *
       * <h5>Compatibility: </h5>
       * <p style="text-indent: 1em;">HTML5, Flash</p>
       *
       * @event OO.EVENTS#PAUSE
       */
      PAUSE: 'pause',

      /**
       * The player was paused. <br/><br/>
       *
       * <h5>Compatibility: </h5>
       * <p style="text-indent: 1em;">HTML5, Flash</p>
       *
       * @event OO.EVENTS#PAUSED
       */
      PAUSED: 'paused',

      /**
       * The video and asset were played. The handler is called with the arguments that were passed.<br/><br/>
       *
       * <h5>Compatibility: </h5>
       * <p style="text-indent: 1em;">Flash</p>
       *
       * @event OO.EVENTS#PLAYED
       */
      PLAYED: 'played',

      TOGGLE_SHARE_PANEL: 'toggleSharePanel',
      SHARE_PANEL_CLICKED: 'sharePanelClicked',
      TOGGLE_INFO_PANEL: 'toggleInfoPanel',
      INFO_PANEL_CLICKED: 'infoPanelClicked',

      DISPLAY_CUE_POINTS: 'displayCuePoints',
      INSERT_CUE_POINT: 'insertCuePoint',
      RESET_CUE_POINTS: 'resetCuePoints',

      /**
       * This event is triggered before a change is made to the full screen setting of the player.
       * The handler is called with <code>true</code> if the full screen setting will be enabled,
       * and is called with <code>false</code> if the full screen setting will be disabled.
       *
       * <h5>Compatibility: </h5>
       * <p style="text-indent: 1em;">HTML5</p>
       *
       * @event OO.EVENTS#WILL_CHANGE_FULLSCREEN
       */
      WILL_CHANGE_FULLSCREEN: 'willChangeFullscreen',

      /**
       * The fullscreen state has changed. Depending on the context, the handler is called with:
       * <ul>
       *   <li><code>isFullscreen</code> and <code>paused</code>:</li>
       *     <ul>
       *       <li><code>isFullscreen</code> is set to <code>true</code> or <code>false</code>.</li>
       *       <li><code>isFullscreen</code> and <code>paused</code> are each set to <code>true</code> or <code>false</code>.</li>
       *     </ul>
       *   </li>
       *   <li>The id of the video that has entered fullscreen (as defined by the module that controls it).
       * </ul>
       *
       * <h5>Compatibility: </h5>
       * <p style="text-indent: 1em;">HTML5, Flash</p>
       *
       * @event OO.EVENTS#FULLSCREEN_CHANGED
       */
      FULLSCREEN_CHANGED: 'fullscreenChanged',

      /**
       * The screen size has changed. This event can also be triggered by a screen orientation change for handheld devices.
       * Depending on the context, the handler is called with:
       *   <ul>
       *     <li>The width of the player.</li>
       *     <li>The height of the player.</li>
       *   </ul>
       *
       * <h5>Compatibility: </h5>
       * <p style="text-indent: 1em;">HTML5</p>
       *
       * @event OO.EVENTS#SIZE_CHANGED
       */
      SIZE_CHANGED: 'sizeChanged',

      /**
       * A request to change volume has been made.
       * The handler is called with the following arguments:
       * <ul>
       *   <li>The desired volume of the video element.</li>
       *   <li>The id of the video on which to change the volume (as defined by the module that controls it).
       *        If null or undefined, all video elements volume will be changed</li>
       * </ul>
       *
       * <h5>Compatibility: </h5>
       * <p style="text-indent: 1em;">HTML5, Flash</p>
       *
       * @event OO.EVENTS#CHANGE_VOLUME
       */
      CHANGE_VOLUME: 'changeVolume',

      /**
       * The volume has changed. The handler is called with the current volume, which has a value between 0 and 1, inclusive.<br/><br/>
       *
       * <h5>Compatibility: </h5>
       * <p style="text-indent: 1em;">HTML5, Flash</p>
       *
       * @event OO.EVENTS#VOLUME_CHANGED
       */
      VOLUME_CHANGED: 'volumeChanged',

      /**
       * Controls are shown.<br/><br/>
       *
       * <h5>Compatibility: </h5>
       * <p style="text-indent: 1em;">HTML5</p>
       *
       * @event OO.EVENTS#CONTROLS_SHOWN
       */
      CONTROLS_SHOWN: 'controlsShown',

      /**
       * Controls are hidden.<br/><br/>
       *
       * <h5>Compatibility: </h5>
       * <p style="text-indent: 1em;">HTML5</p>
       *
       * @event OO.EVENTS#CONTROLS_HIDDEN
       */
      CONTROLS_HIDDEN: 'controlsHidden',
      END_SCREEN_SHOWN: 'endScreenShown',

      PLAYER_CLICKED: 'playerClicked',

      /**
       * An error has occurred. The handler is called with a JSON object that always includes an error code field,
       * and may also include other error-specific fields.<br/><br/>
       *
       * <h5>Compatibility: </h5>
       * <p style="text-indent: 1em;">HTML5, Flash</p>
       *
       * @event OO.EVENTS#ERROR
       */
      ERROR: 'error',

      /**
       * The player is currently being destroyed, and anything created by your module must also be deleted.
       * After the destruction is complete, there is nothing left to send an event.
       * Any plugin that creates or has initialized any long-living logic should listen to this event and clean up that logic.
       * <br/><br/>
       *
       * <h5>Compatibility: </h5>
       * <p style="text-indent: 1em;">HTML5, Flash</p>
       *
       * @event OO.EVENTS#DESTROY
       */
      DESTROY: 'destroy',

      WILL_PLAY_FROM_BEGINNING: 'willPlayFromBeginning',

      DISABLE_PLAYBACK_CONTROLS: 'disablePlaybackControls',
      ENABLE_PLAYBACK_CONTROLS: 'enablePlaybackControls',


      // Video Controller action events

      /**
       * Commands the video controller to create a video element.
       * It should be given the following arguments:
       * <ul>
       *   <li>videoId (string)
       *   </li>
       *   <li>object of streams denoted by encoding type (object)
       *   </li>
       *   <li>parentContainer of the element. This is a jquery element. (object)
       *   </li>
       *   <li>optional params object (object) containing:
       *     <ul>
       *       <li>closedCaptions: The possible closed captions available on this video. (object)</li>
       *       <li>crossorigin: The crossorigin attribute value to set on the video. (string)</li>
       *     </ul>
       *   </li>
       * </ul>
       * @event OO.EVENTS#VC_CREATE_VIDEO_ELEMENT
       */
      VC_CREATE_VIDEO_ELEMENT: 'videoControllerCreateVideoElement',

      /**
       * The Video Controller has created the desired video element, as denoted by id (string).
       * The handler is called with the following arguments:
       * <ul>
       *   <li>Object containing:
       *     <ul>
       *       <li>videoId: The id of the video as defined by the module that controls it.</li>
       *       <li>encodings: The encoding types supported by the new video element.</li>
       *       <li>parent: The parent element of the video element.</li>
       *       <li>domId: The DOM id of the video element.</li>
       *       <li>videoElement: The video element or its wrapper as created by the video plugin.</li>
       *     </ul>
       *   </li>
       * </ul>
       * @event OO.EVENTS#VC_VIDEO_ELEMENT_CREATED
       */
      VC_VIDEO_ELEMENT_CREATED: 'videoControllerVideoElementCreated',

      /**
       * Commands the Video Controller to bring a video element into the visible range given the video element id (string).
       * The handler is called with the following arguments:
       * <ul>
       *   <li>The id of the video to focus (as defined by the module that controls it).</li>
       * </ul>
       * @event OO.EVENTS#VC_FOCUS_VIDEO_ELEMENT
       */
      VC_FOCUS_VIDEO_ELEMENT: 'videoControllerFocusVideoElement',

      /**
       * The Video Controller has moved a video element (string) into focus.
       * The handler is called with the following arguments:
       * <ul>
       *   <li>The id of the video that is in focus (as defined by the module that controls it).</li>
       * </ul>
       * @event OO.EVENTS#VC_VIDEO_ELEMENT_IN_FOCUS
       */
      VC_VIDEO_ELEMENT_IN_FOCUS: 'videoControllerVideoElementInFocus',

      /**
       * The Video Controller has removed a video element (string) from focus.
       * The handler is called with the following arguments:
       * <ul>
       *   <li>The id of the video that lost focus (as defined by the module that controls it).</li>
       * </ul>
       * @event OO.EVENTS#VC_VIDEO_ELEMENT_LOST_FOCUS
       */
      VC_VIDEO_ELEMENT_LOST_FOCUS: 'videoControllerVideoElementLostFocus',

      /**
       * Commands the Video Controller to dispose a video element given the video element id (string).
       * @event OO.EVENTS#VC_DISPOSE_VIDEO_ELEMENT
       */
      VC_DISPOSE_VIDEO_ELEMENT: 'videoControllerDisposeVideoElement',

      /**
       * The Video Controller has disposed the denoted video element (string).
       * The handler is called with the following arguments:
       * <ul>
       *   <li>The id of the video that was disposed (as defined by the module that controls it).</li>
       * </ul>
       * @event OO.EVENTS#VC_VIDEO_ELEMENT_DISPOSED
       */
      VC_VIDEO_ELEMENT_DISPOSED: 'videoControllerVideoElementDisposed',

      /**
       * Commands the video controller to set the stream for a video element.
       * It should be given the video element name (string) and an object of streams denoted by encoding type (object).
       * @event OO.EVENTS#VC_SET_VIDEO_STREAMS
       */
      VC_SET_VIDEO_STREAMS: 'videoControllerSetVideoStreams',

      /**
       * The Video Controller has encountered an error attempting to configure video elements.
       * The handler is called with the following arguments:
       * <ul>
       *   <li>The id of the video that encountered the error (as defined by the module that controls it).</li>
       *   <li>The error details (object) containing an error code.</li>
       * @event OO.EVENTS#VC_ERROR
       */
      VC_ERROR: 'videoControllerError',


      // Video Player action events

      /**
       * Sets the video element's initial playback time.
       * @event OO.EVENTS#VC_SET_INITIAL_TIME
       */
      VC_SET_INITIAL_TIME: 'videoSetInitialTime',

      /**
       * Commands the video element to play.
       * The handler is called with the following arguments:
       * <ul>
       *   <li>The id of the video to play (as defined by the module that controls it).</li>
       * </ul>
       * @event OO.EVENTS#VC_PLAY
       */
      VC_PLAY: 'videoPlay',

      /**
       * The video element has detected a command to play and will begin playback.
       * The handler is called with the following arguments:
       * <ul>
       *   <li>The id of the video to seek (as defined by the module that controls it).</li>
       *   <li>The url of the video that will play.</li>
       * </ul>
       * @event OO.EVENTS#VC_WILL_PLAY
       */
      VC_WILL_PLAY: 'videoWillPlay',

      /**
       * The video element has detected playback in progress.
       * The handler is called with the following arguments:
       * <ul>
       *   <li>The id of the video that is playing (as defined by the module that controls it).</li>
       * </ul>
       * @event OO.EVENTS#VC_PLAYING
       */
      VC_PLAYING: 'videoPlaying',

      /**
       * The video element has detected playback completion.
       * The handler is called with the following arguments:
       * <ul>
       *   <li>The id of the video that has played (as defined by the module that controls it).</li>
       * </ul>
       * @event OO.EVENTS#VC_PLAYED
       */
      VC_PLAYED: 'videoPlayed',

      /**
       * The video element has detected playback failure.
       * The handler is called with the following arguments:
       * <ul>
       *   <li>The id of the video that has played (as defined by the module that controls it).</li>
       *   <li>The error code of the failure (string).</li>
       * </ul>
       * @event OO.EVENTS#VC_PLAY_FAILED
       */
      VC_PLAY_FAILED: 'videoPlayFailed',

      /**
       * Commands the video element to pause.
       * The handler is called with the following arguments:
       * <ul>
       *   <li>The id of the video to pause (as defined by the module that controls it).</li>
       * </ul>
       * @event OO.EVENTS#VC_PAUSE
       */
      VC_PAUSE: 'videoPause',

      /**
       * The video element has detected video state change to paused.
       * The handler is called with the following arguments:
       * <ul>
       *   <li>The id of the video that has paused (as defined by the module that controls it).</li>
       * </ul>
       * @event OO.EVENTS#VC_PAUSED
       */
      VC_PAUSED: 'videoPaused',

      /**
       * Commands the video element to seek.
       * The handler is called with the following arguments:
       * <ul>
       *   <li>The id of the video to seek (as defined by the module that controls it).</li>
       *   <li>The time position to seek to (in seconds).</li>
       * </ul>
       * @event OO.EVENTS#VC_SEEK
       */
      VC_SEEK: 'videoSeek',

      /**
       * The video element has detected seeking.
       * The handler is called with the following arguments:
       * <ul>
       *   <li>The id of the video that is seeking (as defined by the module that controls it).</li>
       * </ul>
       * @event OO.EVENTS#VC_SEEKING
       */
      VC_SEEKING: 'videoSeeking',

      /**
       * The video element has detected seeked.
       * The handler is called with the following arguments:
       * <ul>
       *   <li>The id of the video that has seeked (as defined by the module that controls it).</li>
       * </ul>
       * @event OO.EVENTS#VC_SEEKED
       */
      VC_SEEKED: 'videoSeeked',

      /**
       * Commands the video element to preload.
       * @event OO.EVENTS#VC_PRELOAD
       */
      VC_PRELOAD: 'videoPreload',

      /**
       * Commands the video element to reload.
       * @event OO.EVENTS#VC_RELOAD
       */
      VC_RELOAD: 'videoReload',


      WILL_FETCH_ADS: 'willFetchAds',
      DISABLE_SEEKING: 'disableSeeking',
      ENABLE_SEEKING: 'enableSeeking',

      /**
       * This event is triggered before an ad is played. Depending on the context, the handler is called with:
       *   <ul>
       *     <li>The duration of the ad.</li>
       *     <li>The ID of the ad.</li>
       *   </ul>
       *
       * <h5>Compatibility: </h5>
       * <p style="text-indent: 1em;">HTML5, Flash</p>
       *
       * <h5>Analytics:</h5>
       * <p style="text-indent: 1em;"Triggers an <b>Ad Analytics</b> <code>AD_IMPRESSION</code> event.</p>
       *
       * @event OO.EVENTS#WILL_PLAY_ADS
       */
      WILL_PLAY_ADS: 'willPlayAds',
      WILL_PLAY_SINGLE_AD: 'willPlaySingleAd',
      WILL_PAUSE_ADS: 'willPauseAds',
      WILL_RESUME_ADS: 'willResumeAds',

      /**
       * A set of ads have been played. Depending on the context, the handler is called with:
       *   <ul>
       *     <li>The duration of the ad.</li>
       *     <li>The ID of the item to play.</li>
       *   </ul>
       *
       * <h5>Compatibility: </h5>
       * <p style="text-indent: 1em;">Flash</p>
       *
       * @event OO.EVENTS#ADS_PLAYED
       */
      ADS_PLAYED: 'adsPlayed',

      SINGLE_AD_PLAYED: 'singleAdPlayed',

      /**
       * This event is triggered when an error has occurred with an ad. <br/><br/>
       *
       * <h5>Compatibility: </h5>
       * <p style="text-indent: 1em;">HTML5</p>
       *
       * @event OO.EVENTS#ADS_ERROR
       */
      ADS_ERROR: 'adsError',

      /**
       * This event is triggered when an ad has been clicked. <br/><br/>
       *
       * <h5>Compatibility: </h5>
       * <p style="text-indent: 1em;">HTML5</p>
       *
       * @event OO.EVENTS#ADS_CLICKED
       */
      ADS_CLICKED: 'adsClicked',

      FIRST_AD_FETCHED: "firstAdFetched",
      AD_CONFIG_READY: "adConfigReady",

      /**
       * This event is triggered before the companion ads are shown.
       * Companion ads are displayed on a customer page and are not displayed in the player.
       * This event notifies the page handler to display the specified ad, and is the only means by which companion ads can appear.
       * If the page does not handle this event, companion ads will not appear.
       * Depending on the context, the handler is called with:
       *   <ul>
       *     <li>The ID of all companion ads.</li>
       *     <li>The ID of a single companion ad.</li>
       *   </ul>
       *
       * <h5>Compatibility: </h5>
       * <p style="text-indent: 1em;">HTML5</p>
       *
       * <h5>Analytics:</h5>
       * <p style="text-indent: 1em;"Triggers an <b>Ad Analytics</b> <code>AD_IMPRESSION</code> event.</p>
       *
       * @event OO.EVENTS#WILL_SHOW_COMPANION_ADS
       */
      WILL_SHOW_COMPANION_ADS: "willShowCompanionAds",
      AD_FETCH_FAILED: "adFetchFailed",

      MIDROLL_PLAY_FAILED: "midrollPlayFailed",
      SKIP_AD: "skipAd",
      UPDATE_AD_COUNTDOWN: "updateAdCountdown",

      // this player is part of these experimental variations
      REPORT_EXPERIMENT_VARIATIONS: "reportExperimentVariations",

      FETCH_STYLE: "fetchStyle",
      STYLE_FETCHED: "styleFetched",
      SET_STYLE: "setStyle",

      USE_SERVER_SIDE_HLS_ADS: "useServerSideHlsAds",

      LOAD_ALL_VAST_ADS: "loadAllVastAds",
      ADS_FILTERED: "adsFiltered",
      ADS_MANAGER_HANDLING_ADS: "adsManagerHandlingAds",
      ADS_MANAGER_FINISHED_ADS: "adsManagerFinishedAds",

      // This event contains the information AMC need to know to place the overlay in the correct position.
      OVERLAY_RENDERING: "overlayRendering",

      // Window published beforeUnload event. It's still user cancellable.
      /**
       * The window, document, and associated resources are being unloaded.
       * The handler is called with <code>true</code> if a page unload has been requested, <code>false</code> otherwise.
       * This event may be required since some browsers perform asynchronous page loading while the current page is still active,
       * meaning that the end user loads a page with the Ooyala player, plays an asset, then redirects the page to a new URL they have specified.
       * Some browsers will start loading the new data while still displaying the player, which will result in an error since the networking has already been reset.
       * To prevent such false errors, listen to this event and ignore any errors raised after such actions have occurred.
       * <br/><br/>
       *
       * <h5>Compatibility: </h5>
       * <p style="text-indent: 1em;">HTML5</p>
       *
       * @event OO.EVENTS#PAGE_UNLOAD_REQUESTED
       */
      PAGE_UNLOAD_REQUESTED: "pageUnloadRequested",
      // Either 1) The page is refreshing (almost certain) or 2) The user tried to refresh
      // the page, the embedding page had an "Are you sure?" prompt, the user clicked
      // on "stay", and a real error was produced due to another reason during the
      // following few seconds. The real error, if any, will be received in some seconds.
      // If we are certain it has unloaded, it's too late to be useful.
      PAGE_PROBABLY_UNLOADING: "pageProbablyUnloading",

      // DiscoveryApi publishes these, OoyalaAnalytics listens for them and propagates to reporter.js
      REPORT_DISCOVERY_IMPRESSION: "reportDiscoveryImpression",
      REPORT_DISCOVERY_CLICK: "reportDiscoveryClick",

      __end_marker : true
    };

    /**
	* @description Represents the Ooyala V3 Player Errors. Use message bus events to handle errors by subscribing to or intercepting the <code>OO.EVENTS.ERROR</code> event.
	* For more information, see <a href="http://support.ooyala.com/developers/documentation/concepts/errors_overview.html" target="target">Errors and Error Handling Overview</a>.
	* @summary Represents the Ooyala V3 Player Errors.
	* @namespace OO.ERROR
	*/
    OO.ERROR = {
     /**
      * @description Represents the <code>OO.ERROR.API</code> Ooyala V3 Player Errors. Use message bus events to handle errors by subscribing to or intercepting the <code>OO.EVENTS.ERROR</code> event.
	  * For more information, see <a href="http://support.ooyala.com/developers/documentation/concepts/errors_overview.html" target="target">Errors and Error Handling Overview</a>.
  	  * @summary Represents the <code>OO.ERROR.API</code> Ooyala V3 Player Errors.
      * @namespace OO.ERROR.API
      */
      API: {
       /**
        * @description <code>OO.ERROR.API.NETWORK ('network')</code>: Cannot contact the server.
    	* @constant OO.ERROR.API.NETWORK
    	* @type {string}
    	*/
        NETWORK:'network',
        /**
         * @description Represents the <code>OO.ERROR.API.SAS</code> Ooyala V3 Player Errors for the Stream Authorization Server.
         * Use message bus events to handle errors by subscribing to or intercepting the <code>OO.EVENTS.ERROR</code> event.
	     * For more information, see <a href="http://support.ooyala.com/developers/documentation/concepts/errors_overview.html" target="target">Errors and Error Handling Overview</a>.
	     * @summary Represents the <code>OO.ERROR.API.SAS</code> Ooyala V3 Player Errors.
         * @namespace OO.ERROR.API.SAS
         */
        SAS: {
         /**
          * @description <code>OO.ERROR.API.SAS.GENERIC ('sas')</code>: Invalid authorization response.
          * @constant OO.ERROR.API.SAS.GENERIC
          * @type {string}
          */
          GENERIC:'sas',
          /**
           * @description <code>OO.ERROR.API.SAS.GEO ('geo')</code>: This video is not authorized for your location.
           * @constant OO.ERROR.API.SAS.GEO
           * @type {string}
           */
          GEO:'geo',
          /**
           * @description <code>OO.ERROR.API.SAS.DOMAIN ('domain')</code>: This video is not authorized for your domain.
           * @constant OO.ERROR.API.SAS.DOMAIN
           * @type {string}
           */
          DOMAIN:'domain',
          /**
           * @description <code>OO.ERROR.API.SAS.FUTURE ('future')</code>: This video will be available soon.
           * @constant OO.ERROR.API.SAS.FUTURE
           * @type {string}
           */
          FUTURE:'future',
          /**
           * @description <code>OO.ERROR.API.SAS.PAST ('past')</code>: This video is no longer available.
           * @constant OO.ERROR.API.SAS.PAST
           * @type {string}
           */
          PAST:'past',
          /**
           * @description <code>OO.ERROR.API.SAS.DEVICE ('device')</code>: This video is not authorized for playback on this device.
           * @constant OO.ERROR.API.SAS.DEVICE
           * @type {string}
           */
          DEVICE:'device',
          /**
           * @description <code>OO.ERROR.API.SAS.PROXY ('proxy')</code>: An anonymous proxy was detected. Please disable the proxy and retry.
           * @constant OO.ERROR.API.SAS.PROXY
           * @type {string}
           */
          PROXY:'proxy',
          /**
           * @description <code>OO.ERROR.API.SAS.CONCURRENT_STREAM ('concurrent_streams')S</code>: You have exceeded the maximum number of concurrent streams.
           * @constant OO.ERROR.API.SAS.CONCURRENT_STREAMS
           * @type {string}
           */
          CONCURRENT_STREAMS:'concurrent_streams',
          /**
           * @description <code>OO.ERROR.API.SAS.INVALID_HEARTBEAT ('invalid_heartbeat')</code>: Invalid heartbeat response.
           * @constant OO.ERROR.API.SAS.INVALID_HEARTBEAT
           * @type {string}
           */
          INVALID_HEARTBEAT:'invalid_heartbeat',
          /**
           * @description <code>OO.ERROR.API.SAS.ERROR_DEVICE_INVALID_AUTH_TOKEN ('device_invalid_auth_token')</code>: Invalid Ooyala Player token.
           * @constant OO.ERROR.API.SAS.ERROR_DEVICE_INVALID_AUTH_TOKEN
           * @type {string}
           */
          ERROR_DEVICE_INVALID_AUTH_TOKEN:'device_invalid_auth_token',
          /**
           * @description <code>OO.ERROR.API.SAS.ERROR_DEVICE_LIMIT_REACHED ('device_limit_reached')</code>: The device limit has been reached.
           * The device limit is the maximum number of devices that can be registered with the viewer.
           * When the number of registered devices exceeds the device limit for the account or provider, this error is displayed.
           * @constant OO.ERROR.API.SAS.ERROR_DEVICE_LIMIT_REACHED
           * @type {string}
           */
          ERROR_DEVICE_LIMIT_REACHED:'device_limit_reached',
          /**
           * @description <code>OO.ERROR.API.SAS.ERROR_DEVICE_BINDING_FAILED ('device_binding_failed')</code>: Device binding failed.
           * If the number of devices registered is already equal to the number of devices that may be bound for the account,
           * attempting to register a new device will result in this error.
           * @constant OO.ERROR.API.SAS.ERROR_DEVICE_BINDING_FAILED
           * @type {string}
           */
          ERROR_DEVICE_BINDING_FAILED:'device_binding_failed',
          /**
           * @description <code>OO.ERROR.API.SAS.ERROR_DEVICE_ID_TOO_LONG ('device_id_too_long')</code>: The device ID is too long.
           * The length limit for the device ID is 1000 characters.
           * @constant OO.ERROR.API.SAS.ERROR_DEVICE_ID_TOO_LONG
           * @type {string}
           */
          ERROR_DEVICE_ID_TOO_LONG:'device_id_too_long',
          /**
           * @description <code>OO.ERROR.API.SAS.ERROR_DRM_RIGHTS_SERVER_ERROR ('drm_server_error')</code>: DRM server error.
           * @constant OO.ERROR.API.SAS.ERROR_DRM_RIGHTS_SERVER_ERROR
           * @type {string}
           */
          ERROR_DRM_RIGHTS_SERVER_ERROR:'drm_server_error',
          /**
           * @description <code>OO.ERROR.API.SAS.ERROR_DRM_GENERAL_FAILURE ('drm_general_failure')</code>: General error with acquiring license.
           * @constant OO.ERROR.API.SAS.ERROR_DRM_GENERAL_FAILURE
           * @type {string}
           */
          ERROR_DRM_GENERAL_FAILURE:'drm_general_failure',

          /**
           * @description <code>OO.ERROR.API.SAS.ERROR_INVALID_ENTITLEMENTS ('invalid_entitlements')</code>: User Entitlement Terminated - Stream No Longer Active for the User.
           * @constant OO.ERROR.API.SAS.ERROR_INVALID_ENTITLEMENTS
           * @type {string}
           */
          ERROR_INVALID_ENTITLEMENTS:'invalid_entitlements'
        },
       /**
        * @description <code>OO.ERROR.API.CONTENT_TREE ('content_tree')</code>: Invalid Content.
     	* @constant OO.ERROR.API.CONTENT_TREE
     	* @type {string}
     	*/
        CONTENT_TREE:'content_tree',
       /**
        * @description <code>OO.ERROR.API.METADATA ('metadata')</code>: Invalid Metadata.
      	* @constant OO.ERROR.API.METADATA
      	* @type {string}
      	*/
        METADATA:'metadata'
      },
     /**
      * @description Represents the <code>OO.ERROR.PLAYBACK</code> Ooyala V3 Player Errors. Use message bus events to handle errors by subscribing to or intercepting the <code>OO.EVENTS.ERROR</code> event.
 	  * For more information, see <a href="http://support.ooyala.com/developers/documentation/concepts/errors_overview.html" target="target">Errors and Error Handling Overview</a>.
   	  * @summary Represents the <code>OO.ERROR.PLAYBACK</code> Ooyala V3 Player Errors.
      * @namespace OO.ERROR.PLAYBACK
      */
      PLAYBACK: {
       /**
        * @description <code>OO.ERROR.PLAYBACK.GENERIC ('playback')</code>: Could not play the content.
        * @constant OO.ERROR.PLAYBACK.GENERIC
        * @type {string}
        */
        GENERIC:'playback',
        /**
         * @description <code>OO.ERROR.PLAYBACK.STREAM ('stream')</code>: This video is not encoded for your device.
         * @constant OO.ERROR.PLAYBACK.STREAM
         * @type {string}
         */
        STREAM:'stream',
        /**
         * @description <code>OO.ERROR.PLAYBACK.LIVESTREAM ('livestream')</code>: Live stream is off air.
         * @constant OO.ERROR.PLAYBACK.LIVESTREAM
         * @type {string}
         */
        LIVESTREAM:'livestream',
        /**
         * @description <code>OO.ERROR.PLAYBACK.NETWORK ('network_error')</code>: The network connection was temporarily lost.
         * @constant OO.ERROR.PLAYBACK.NETWORK
         * @type {string}
         */
        NETWORK: 'network_error'
      },
      CHROMECAST: {
        MANIFEST:'chromecast_manifest',
        MEDIAKEYS:'chromecast_mediakeys',
        NETWORK:'chromecast_network',
        PLAYBACK:'chromecast_playback'
      },
     /**
      * @description <code>OO.ERROR.UNPLAYABLE_CONTENT ('unplayable_content')</code>: This video is not playable on this player.
   	  * @constant OO.ERROR.UNPLAYABLE_CONTENT
   	  * @type {string}
   	  */
      UNPLAYABLE_CONTENT:'unplayable_content',
     /**
      * @description <code>OO.ERROR.INVALID_EXTERNAL_ID ('invalid_external_id')</code>: Invalid External ID.
      * @constant OO.ERROR.INVALID_EXTERNAL_ID
      * @type {string}
      */
      INVALID_EXTERNAL_ID:'invalid_external_id',
      /**
       * @description <code>OO.ERROR.EMPTY_CHANNEL ('empty_channel')</code>: This channel is empty.
       * @constant OO.ERROR.EMPTY_CHANNEL
       * @type {string}
       */
      EMPTY_CHANNEL:'empty_channel',
      /**
       * @description <code>OO.ERROR.EMPTY_CHANNEL_SET ('empty_channel_set')</code>: This channel set is empty.
       * @constant OO.ERROR.EMPTY_CHANNEL_SET
       * @type {string}
       */
      EMPTY_CHANNEL_SET:'empty_channel_set',
      /**
       * @description <code>OO.ERROR.CHANNEL_CONTENT ('channel_content')</code>: This channel is not playable at this time.
       * @constant OO.ERROR.CHANNEL_CONTENT
       * @type {string}
       */
      CHANNEL_CONTENT:'channel_content',
      /**
       * @description Represents the <code>OO.ERROR.VC</code> Ooyala V4 Player Errors for the Video Technology stack.
       * Use message bus events to handle errors by subscribing to or intercepting the <code>OO.EVENTS.ERROR</code> event.
           * For more information, see <a href="http://support.ooyala.com/developers/documentation/concepts/errors_overview.html" target="target">Errors and Error Handling Overview</a>.
           * @summary Represents the <code>OO.ERROR.VC</code> Ooyala V4 Player Errors.
       * @namespace OO.ERROR.VC
       */
      VC: {
        /**
        * @description <code>OO.ERROR.VC.UNSUPPORTED_ENCODING ('unsupported_encoding')</code>:
        *    This device does not have an available decoder for this stream type.
        * @constant OO.ERROR.VC.UNSUPPORTED_ENCODING
        * @type {string}
        */
        UNSUPPORTED_ENCODING:'unsupported_encoding',

        /**
        * @description <code>OO.ERROR.VC.UNABLE_TO_CREATE_VIDEO_ELEMENT ('unable_to_create_video_element')</code>:
        *    A video element to play the given stream could not be created
        * @constant OO.ERROR.VC.UNABLE_TO_CREATE_VIDEO_ELEMENT
        * @type {string}
        */
        UNABLE_TO_CREATE_VIDEO_ELEMENT:'unable_to_create_video_element',
      }
    };

    // All Server-side URLS
    OO.URLS = {
      VAST_PROXY: _.template('http://player.ooyala.com/nuplayer/mobile_vast_ads_proxy?callback=<%=cb%>&embed_code=<%=embedCode%>&expires=<%=expires%>&tag_url=<%=tagUrl%>'),
      EXTERNAL_ID: _.template('<%=server%>/player_api/v1/content_tree/external_id/<%=pcode%>/<%=externalId%>'),
      CONTENT_TREE: _.template('<%=server%>/player_api/v1/content_tree/embed_code/<%=pcode%>/<%=embedCode%>'),
      METADATA: _.template('<%=server%>/player_api/v1/metadata/embed_code/<%=playerBrandingId%>/<%=embedCode%>?videoPcode=<%=pcode%>'),
      SAS: _.template('<%=server%>/player_api/v1/authorization/embed_code/<%=pcode%>/<%=embedCode%>'),
      ANALYTICS: _.template('<%=server%>/reporter.js'),
      __end_marker : true
    };

    OO.VIDEO = {
      MAIN: "main",
      ADS: "ads",

      /**
       * @description Represents the <code>OO.VIDEO.ENCODING</code> encoding types. Used to denote video
       *              encoding types associated with a video stream url.
       * @summary Represents the <code>OO.VIDEO.ENCODING</code> encoding types.
       * @namespace OO.VIDEO.ENCODING
       */
      ENCODING: {
        /**
         * @description <code>OO.VIDEO.ENCODING.AUDIO ('audio')</code>:
         *   An encoding type for non-drm audio streams.
         * @constant OO.VIDEO.ENCODING.AUDIO
         * @type {string}
         */
        AUDIO: "audio",

        /**
         * @description <code>OO.VIDEO.ENCODING.DASH ('dash')</code>:
         *   An encoding type for non-drm dash streams (mpd extension).
         * @constant OO.VIDEO.ENCODING.DASH
         * @type {string}
         */
        DASH: "dash",

        /**
         * @description <code>OO.VIDEO.ENCODING.HDS ('hds')</code>:
         *   An encoding type for non-drm hds streams (hds extension).
         * @constant OO.VIDEO.ENCODING.HDS
         * @type {string}
         */
        HDS: "hds",

        /**
         * @description <code>OO.VIDEO.ENCODING.HLS ('hls')</code>:
         *   An encoding type for non-drm HLS streams (m3u8 extension).
         * @constant OO.VIDEO.ENCODING.HLS
         * @type {string}
         */
        HLS: "hls",

        /**
         * @description <code>OO.VIDEO.ENCODING.IMA ('ima')</code>:
         *   A string that repsents a video stream that is controlled and configured directly by IMA.
         * @constant OO.VIDEO.ENCODING.IMA
         * @type {string}
         */
        IMA: "ima",

        /**
         * @description <code>OO.VIDEO.ENCODING.MP4 ('mp4')</code>:
         *   An encoding type for non-drm mp4 streams (mp4 extension).
         * @constant OO.VIDEO.ENCODING.MP4
         * @type {string}
         */
        MP4: "mp4",

        /**
         * @description <code>OO.VIDEO.ENCODING.RTMP ('rtmp')</code>:
         *   An encoding type for non-drm rtmp streams.
         * @constant OO.VIDEO.ENCODING.RTMP
         * @type {string}
         */
        RTMP: "rtmp",

        /**
         * @description <code>OO.VIDEO.ENCODING.SMOOTH ('smooth')</code>:
         *   An encoding type for non-drm smooth streams.
         * @constant OO.VIDEO.ENCODING.SMOOTH
         * @type {string}
         */
        SMOOTH: "smooth",

        /**
         * @description <code>OO.VIDEO.ENCODING.WEBM ('webm')</code>:
         *   An encoding type for non-drm webm streams (webm extension).
         * @constant OO.VIDEO.ENCODING.WEBM
         * @type {string}
         */
        WEBM: "webm",

        /**
         * @description <code>OO.VIDEO.ENCODING.AKAMAI_HD_VOD ('akamai_hd_vod')</code>:
         *   An encoding type for akamai hd vod streams.
         * @constant OO.VIDEO.ENCODING.AKAMAI_HD_VOD
         * @type {string}
         */
        AKAMAI_HD_VOD: "akamai_hd_vod",

        /**
         * @description <code>OO.VIDEO.ENCODING.AKAMAI_HD2_VOD_HLS ('akamai_hd2_vod_hls')</code>:
         *   An encoding type for akamai hd2 vod hls streams.
         * @constant OO.VIDEO.ENCODING.AKAMAI_HD2_VOD_HLS
         * @type {string}
         */
        AKAMAI_HD2_VOD_HLS: "akamai_hd2_vod_hls",

        /**
         * @description <code>OO.VIDEO.ENCODING.AKAMAI_HD2_VOD_HDS ('akamai_hd2_vod_hds')</code>:
         *   An encoding type for akamai hd2 vod hds streams.
         * @constant OO.VIDEO.ENCODING.AKAMAI_HD2_VOD_HDS
         * @type {string}
         */
        AKAMAI_HD2_VOD_HDS: "akamai_hd2_vod_hds",

        /**
         * @description <code>OO.VIDEO.ENCODING.FAXS_HLS ('faxs_hls')</code>:
         *   An encoding type for adobe faxs streams.
         * @constant OO.VIDEO.ENCODING.FAXS_HLS
         * @type {string}
         */
        FAXS_HLS: "faxs_hls",

        /**
         * @description <code>OO.VIDEO.ENCODING.WIDEVINE_HLS ('wv_hls')</code>:
         *   An encoding type for widevine hls streams.
         * @constant OO.VIDEO.ENCODING.WIDEVINE_HLS
         * @type {string}
         */
        WIDEVINE_HLS: "wv_hls",

        /**
         * @description <code>OO.VIDEO.ENCODING.WIDEVINE_MP4 ('wv_mp4')</code>:
         *   An encoding type for widevine mp4 streams.
         * @constant OO.VIDEO.ENCODING.WIDEVINE_MP4
         * @type {string}
         */
        WIDEVINE_MP4: "wv_mp4",

        /**
         * @description <code>OO.VIDEO.ENCODING.WIDEVINE_WVM ('wv_wvm')</code>:
         *   An encoding type for widevine wvm streams.
         * @constant OO.VIDEO.ENCODING.WIDEVINE_WVM
         * @type {string}
         */
        WIDEVINE_WVM: "wv_wvm",
      },

      /**
       * @description Represents the <code>OO.VIDEO.FEATURE</code> feature list. Used to denote which
       * features are supported by a video player.
       * @summary Represents the <code>OO.VIDEO.FEATURE</code> feature list.
       * @namespace OO.VIDEO.FEATURE
       */
      FEATURE: {
        /**
         * @description <code>OO.VIDEO.FEATURE.CLOSED_CAPTIONS ('closedCaptions')</code>:
         *   Closed captions parsed by the video element and sent to the player.
         * @constant OO.VIDEO.FEATURE.CLOSED_CAPTIONS
         * @type {string}
         */
        CLOSED_CAPTIONS: "closedCaptions",

        /**
         * @description <code>OO.VIDEO.FEATURE.VIDEO_OBJECT_OPEN ('videoObjectOpen')</code>:
         *   The video object is accessible and can be found by the player via the DOM element id.
         * @constant OO.VIDEO.FEATURE.VIDEO_OBJECT_OPEN
         * @type {string}
         */
        VIDEO_OBJECT_OPEN: "videoObjectOpen"
      },

      /**
       * @description Represents the <code>OO.VIDEO.TECHNOLOGY</code> core video technology.
       * @summary Represents the <code>OO.VIDEO.TECHNOLOGY</code> core technology of the video element.
       * @namespace OO.VIDEO.TECHNOLOGY
       */
      TECHNOLOGY: {
        /**
         * @description <code>OO.VIDEO.TECHNOLOGY.FLASH ('flash')</code>:
         *   The core video technology is based on Adobe Flash.
         * @constant OO.VIDEO.TECHNOLOGY.FLASH
         * @type {string}
         */
        FLASH: "flash",

        /**
         * @description <code>OO.VIDEO.TECHNOLOGY.HTML5 ('html5')</code>:
         *   The core video technology is based on the native html5 'video' tag.
         * @constant OO.VIDEO.TECHNOLOGY.HTML5
         * @type {string}
         */
        HTML5: "html5",

        /**
         * @description <code>OO.VIDEO.TECHNOLOGY.MIXED ('mixed')</code>:
         *   The core video technology used may be based on any one of multiple core technologies.
         * @constant OO.VIDEO.TECHNOLOGY.MIXED
         * @type {string}
         */
        MIXED: "mixed",

        /**
         * @description <code>OO.VIDEO.TECHNOLOGY.OTHER ('other')</code>:
         *   The core video technology is based on a unique core video technology.
         * @constant OO.VIDEO.TECHNOLOGY.OTHER
         * @type {string}
         */
        OTHER: "other"
      }

    };

    OO.CSS = {
      VISIBLE_POSITION : "0px",
      INVISIBLE_POSITION : "-100000px",
      VIDEO_Z_INDEX: 10000,
      SUPER_Z_INDEX: 20000,
      ALICE_SKIN_Z_INDEX: 11000,
      OVERLAY_Z_INDEX: 10500,
      TRANSPARENT_COLOR : "rgba(255, 255, 255, 0)",

      __end_marker : true
    };

    OO.TEMPLATES = {
      RANDOM_PLACE_HOLDER: ['[place_random_number_here]', '<now>', '[timestamp]', '<rand-num>', '[cache_buster]', '[random]'],
      REFERAK_PLACE_HOLDER: ['[referrer_url]', '[LR_URL]'],
      EMBED_CODE_PLACE_HOLDER: ['[oo_embedcode]'],
      MESSAGE : '\
                  <table width="100%" height="100%" bgcolor="black" style="padding-left:55px; padding-right:55px; \
                  background-color:black; color: white;">\
                  <tbody>\
                  <tr valign="middle">\
                  <td align="right"><span style="font-family:Arial; font-size:20px">\
                  <%= message %>\
                  </span></td></tr></tbody></table>\
                  ',
      __end_marker : true
    };

    OO.CONSTANTS = {
      // Ad frequency constants
      AD_PLAY_COUNT_KEY: "oo_ad_play_count",
      AD_ID_TO_PLAY_COUNT_DIVIDER: ":",
      AD_PLAY_COUNT_DIVIDER: "|",
      MAX_AD_PLAY_COUNT_HISTORY_LENGTH: 20,

      CONTROLS_BOTTOM_PADDING: 10,

      SEEK_TO_END_LIMIT: 4,

      __end_marker : true
    };

  }(OO,OO._));
