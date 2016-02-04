  (function(OO,_) {
	/**
	 * @classdesc Represents the Ooyala V3 Player Message Bus. Use message bus events to subscribe to or publish player events from video to ad playback.
	 * <p>When you create an {@link OO.Player} object (for example, <code>myplayer = OO.Player.create(...)</code> ), that object contains a Message Bus object named <code>mb</code>.
	 * For example, you would access the <code><a href="#publish">publish()</a></code> method by calling <code>myplayer.mb.publish(...)</code>.</p>
	 * @class
	 */
    OO.MessageBus = function() {
      this._emitter = new OO.Emitter(this);
      this._dependentEmitter = new OO.Emitter(this);
      this._interceptEmitter = new OO.Emitter(this);
      this._interceptArgs = {};
      this._dependentList = {};
      this._blockList = {};
      this._readyEventList = {};
      this._dispatching = false;   // whether message bus is currently dispatching published events
      this._publishingQueue = [];
      this.blockedEvent = {};
      this.blockedParams = {};

      // public properties
      this._messageHistory = [];
      this._tracer = _.bind(this._internalTracer, this);   // default internal tracer

      // add a random ID for debug
      this.MbId = OO.getRandomString();

      this.debug = false;
    };

    _.extend(OO.MessageBus.prototype,  {
      // Adds a tracer function, which will be fired for each published/executed event
      addTracer: function(newTracer) {
        if(newTracer && _.isFunction(newTracer)) {
          if(this._tracer) {
            this._tracer = _.wrap(this._tracer, function(f) { newTracer.apply(this, _.rest(arguments)); });
          } else {
            this._tracer = newTracer;
          }
        }
      },

      _internalTracer: function() {
        this._messageHistory.push(_.toArray(arguments));
      },

      messageTraceSnapshot: function() {
        return _.toArray(this._messageHistory);
      },

      /*
       * addDependent blocks eventName until dependentEvent fires, at which point onMergeParams will be
       * called.  This means that eventName MUST be fired before dependentEvent.
       */
      /**
       * Enables you to send a publish or subscribe message that is dependent on a condition or event.
       * For example, you might want to change the UI based on the location or time of day.
       * This method blocks the event (<code>eventName</code>) until the dependent event (<code>dependentEvent</code>) fires.
       * For more information and examples of usage, see
       * <a href="http://support.ooyala.com/developers/documentation/reference/player_v3_dev_listenevent.html" target="target">Listening to a Message Bus Event</a>.
       *
       * @method addDependent
       * @memberOf OO.MessageBus.prototype
       * @param {String} eventName The name of the event.
       * @param {String} dependentEvent The name of the event that triggers the specified event name.
       * @param {String} subscriber The name of the subscriber to which the message bus will publish the event.
       * @param {function} onMergeParams (Optional) A function used to pass data to the handler for the dependent event.
       * This function is only necessary if need to complete a computation before passing data to the dependent event handler.
       * This function can take up to four arguments and returns an array of arguments to be passed into the dependent event listener.
       * @example
       * 		//  This blocks the PAUSED event from firing until
       * 	    // the 'user_allowed_pause' event has fired
       * 		player.mb.addDependent(
       * 		  OO.EVENTS.PAUSED,
       * 		  'user_allowed_pause',
       * 		  'example',
       * 		  function(){}
       * 		);
       */
      addDependent: function(eventName, dependentEvent, subscriber, onMergeParams){
        // TODO, add a circular detectecion here.
        if (!eventName || eventName == "" || !dependentEvent || dependentEvent == "") {
          console.error("MB: addDependent called on message bus from subscriber " + subscriber + " with no event name given.");
          return;
        }

        if (this.debug) {
          OO.log("MB DEBUG: \'" + eventName + "\' depends on \'" + dependentEvent + "\'. Added by \'" + subscriber + "\'");
        }

        this._dependentList[eventName] = this._dependentList[eventName] || [];
        this._dependentList[eventName].push(dependentEvent);
        this._blockList[dependentEvent] = this._blockList[dependentEvent] || [];
        this._blockList[dependentEvent].push(eventName);
        this.blockedParams[eventName] = [];

        var onSourceReady = OO._.bind(function(e) {
          if (this.blockedEvent[e] != 1) {
            return;
          }

          var args = OO.safeClone(_.flatten(arguments));
          var origParams = OO.safeClone(this.blockedParams[eventName]);
          args.shift(); origParams.shift();

          var newArgs = onMergeParams && onMergeParams.apply(this, [eventName, dependentEvent, origParams, args]) || origParams;
          newArgs = [e].concat(newArgs);
          delete this.blockedEvent[e];
          this.blockedParams[e] = [];

          if (this.debug) {
            OO.log("MB DEBUG: unblocking \'" + e + "\' because of \'" + dependentEvent + "\' with args ", newArgs);
          }

          this._publish.apply(this, newArgs);

        }, this);

        this._dependentEmitter.on(eventName, subscriber, onSourceReady);
      },

      /**
       * Removes all dependencies on event 'source' by event 'target'
       * @memberOf OO.MessageBus.prototype
       * @param {string} source The depending event that is blocked
       * @param {string} target The dependent event that is blocking
       */
      removeDependent: function(source, target) {
        if (!source || source == "" || !target || target == "") {
          console.warn("MB: removeDependent called on message bus with no event name given.");
          return;
        }

        if (this.debug) {
          OO.log("MB DEBUG: \'" + source + "\' no longer depends on \'" + target + "\'");
        }

        this._clearDependent(source, target);
      },

      /**
       * Enables you to publish events to the message bus.<br/>
       *
       * @method publish
       * @memberOf OO.MessageBus.prototype
       * @param {String} eventName The name of the event. Comma-separated arguments for the event may follow the event name as needed.
       * @example myplayer.mb.publish(OO.EVENTS.PLAY);
       * @example myplayer.mb.publish(OO.EVENTS.WILL_CHANGE_FULLSCREEN,true);
       */
      publish: function() {
        if (!arguments || !arguments[0] || arguments[0] == "") {
          console.error("MB: publish called on message bus with no event name given.");
          return;
        }

        var args = OO.safeClone(_.flatten(arguments));
        this._publishingQueue.push(args);

        if (this.debug) {
          OO.log("MB DEBUG: queueing \'" + arguments[0] + "\' w\/ args", args);
        }

        if(!this._dispatching) {
          this._dispatching = true;
          var ev = this._publishingQueue.shift();
          while(ev) {
            this._publish.apply(this, ev);
            ev = this._publishingQueue.shift();
          }
          this._dispatching = false;
        }
      },


      _publish: function(eventName) {
        // queue event here untill all dependency is cleared.
        // also trigger queued event if there are blocked by this event.
        this._readyEventList[eventName] = 1;
        var args = OO.safeClone(_.flatten(arguments));

        this._interceptEmitter.trigger.apply(this._interceptEmitter, args);
        if (this._interceptArgs[eventName] === false) { this._interceptArgs[eventName] = true; return; }
        if (this._interceptArgs[eventName]) {
          args = _.flatten([eventName, this._interceptArgs[eventName]]);
        }

        if(this._tracer && _.isFunction(this._tracer)) {
          var params = _.flatten(['publish'].concat(args));
          this._tracer.apply(this._tracer, params);
        }

        if (this._noDependency(eventName)) {
          if (this.debug) {
            OO.log("MB DEBUG: publishing \'" + eventName + "\' w\/ args ", args);
          }

          this._emitter.trigger.apply(this._emitter, args);
          _.each(this._blockList[eventName], function(e) {
            this._clearDependent(e, eventName);
            args[0] = e;
            this._dependentEmitter.trigger.apply(this._dependentEmitter, args);
          }, this);
          delete this._blockList[eventName];
        } else {
          if (this.debug) {
            OO.log("MB DEBUG: blocking \'" + eventName + "\' because of \'" + this._dependentList ? this._dependentList[eventName] : "[null]"  + "\'");
          }
          this.blockedEvent[eventName] = 1;
          this.blockedParams[eventName] = args;
        }
      },

      /*
       * eventName is the event to intercept
       * subscriber is the subscriber
       * callback returns a list of arguments, not including the eventName
       */
      /**
       * Enables you to subscribe to events to the message bus using a callback function that
       * allows you to manipulate the event payload and name. The returned list of arguments
       * from the callback can be used in subsequent event triggers. For more information and examples of usage, see
       * <a href="http://support.ooyala.com/developers/documentation/reference/player_v3_dev_listenevent.html" target="target">Listening to a Message Bus Event</a>.<br/>
       *
       * @method intercept
       * @memberOf OO.MessageBus.prototype
       * @param {String} eventName The name of the event to intercept.
       * @param {String} subscriber The name of the subscriber to which the message bus will publish the event.
       * @param {function} callback A function that returns a list of arguments used in subsequent event triggers.
       * This allows you to manipulate the event payload and name. To cancel propagation of an event using an intercepter,
       * return <code>false</code> instead of an array.
       * @example In the following example we subscribe to the published message bus PLAY event,
       * specify 'test-plugin' as the subscriber and specify a payload of 'hello'.
       *
       * We also include an intercept that swaps the string 'goodbye' into the payload
       * so that when the message bus publishes the PLAY event, the console outputs 'goodbye' instead of 'hello':
       *
       * mb.subscribe(OO.EVENTS.PLAY, "test-plugin", function(eventName, payload) {
       *    console.log(eventName+": "+payload);
       * });
       *
       * mb.publish(OO.EVENTS.PLAY, "hello");
       *
       * // Console displays "play: hello"
       *
       * mb.intercept(OO.EVENTS.PLAY, "test-plugin", function(eventName, payload) {
       *     return ["goodbye"];
       * });
       *
       * //   Console displays "play: goodbye"
       */
      intercept: function(eventName, subscriber, callback) {
        this._interceptEmitter.on(eventName, subscriber, _.bind(function(e) {
          if (!eventName || eventName == "") {
            console.error("MB: intercept called on message bus from subscriber " + subscriber + " with no event name given.");
            return;
          }
          var args = OO.safeClone(_.flatten(arguments));
          if (this._interceptArgs[eventName] != false) {
            this._interceptArgs[eventName] = callback.apply(this, args);
          }
        }, this));
        this._interceptArgs[eventName] = [eventName];
      },

      /**
       * Subscribe to an event published to the message bus.
       *
       * @method subscribe
       * @memberOf OO.MessageBus.prototype
       * @param {String} eventName The name of the event.
       * @param {String} subscriber The name of the subscriber to which the message bus will publish the event.
       * @param {Function} callback The function that will execute when the subscriber receives the event notification.
       * @example myplayer.mb.subscribe(OO.EVENTS.METADATA_FETCHED, 'example', function(eventName) {});
       * @example // Subscribes to all events published by the Message Bus
       * messageBus.subscribe("*", 'example', function(eventName) {});
       */
      subscribe: function(eventName, subscriber, callback) {
        // TODO check if it is on the dependent queue, should not allow this action if a event is blocking
        // other event.
        if (!eventName || eventName == "") {
          console.error("MB: subscribe called on message bus from subscriber " + subscriber + " with no event name given.");
          return;
        }
        this._emitter.on(eventName, subscriber, callback);
      },

      /**
       * Unsubscribes from an event published to the message bus.
       *
       * @method unsubscribe
       * @memberOf OO.MessageBus.prototype
       * @param {String} eventName The name of the event.
       * @param {String} subscriber The name of the subscriber to which the message bus will unsubscribe from the event.
       * @param {Function} callback The function that normally executes when the subscriber receives the event notification.
       * @example messageBus.unsubscribe(OO.EVENTS.METADATA_FETCHED, 'example', function(eventName) {});
       * @example // Unsubscribes from all events published by the Message Bus
       * messageBus.unsubscribe("*", 'example', function(eventName) {});
       */
      unsubscribe: function(eventName, subscriber, callback) {
        if (!eventName || eventName == "") {
          console.error("MB: unsubscribe called on message bus from subscriber " + subscriber + " with no event name given.");
          return;
        }
        this._emitter.off(eventName, subscriber, callback);
      },

      // Start of the private member function, all internal used func will prefix with _

      _noDependency: function(eventName) {
        if (!this._dependentList[eventName]) { return true; }
        return (this._dependentList[eventName].length === 0);
      },

      _clearDependent: function(source, target) {
        var depEvents = this._dependentList[source];
        this._dependentList[source] = OO._.filter(depEvents, function(e){ return e !== target; }, this);
      },

      /////////////////////
      //// DEBUG TOOLS ////
      /////////////////////

      /**
       * Start debugging the message bus messages. It will display when dependents are added,
       * when they are removed, when messages get blocked, when messages are queued
       * and when they actually get published.
       *
       * This is mainly intended to be used in the console when debugging.
       * @private
       * @return {string} Message that states debugging has started. (Mostly for console output)
       */
      startDebug: function() {
        this.debug = true;
        return "MB DEBUGGING STARTED";
      },

      /**
       * Stop debugging the message bus messages.
       *
       * This is mainly intended to be used in the console when debugging.
       * @private
       * @return {string} Message that states debugging has stopped. (Mostly for console output)
       */
      stopDebug: function() {
        this.debug = false;
        return "MB DEBUGGING STOPPED";
      },

      /**
       * Return a test formatted string of the dependent messages and which ones are
       * currently blocked.
       * @private
       * @return {string} Formatted string of dependent messages and which ones are blocked.
       */
      listDependencies: function() {
        var output = "------------------------------------\n" +
                     "[blocked] Message --> Dependency\n" +
                     "------------------------------------\n"
        var index;
        if (this._dependentList) {
          for (var eventName in this._dependentList) {
            if (this._dependentList[eventName]) {
              for (index = 0; index < this._dependentList[eventName].length; index++) {
                if (this.blockedEvent[eventName] == 1) {
                  output += "[blocked]";
                }

                output += eventName + " --> " + this._dependentList[eventName] + "\n";
              }
            }
          }
        }

        output += "------------------------------------";
        return output;
      }

    });

  }(OO,OO._));
