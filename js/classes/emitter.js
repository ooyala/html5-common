  (function(OO,_) {

    OO.Emitter  = function(messageBus){
      this.mb = messageBus;
      this._subscribers = {};
    };

    _.extend(OO.Emitter.prototype,  {
      on  : function(eventName, subscriber, callback){
        this._subscribers[eventName] = this._subscribers[eventName]  || [];
        this._subscribers[eventName].push({callback: callback, subscriber: subscriber});
      },

      off  : function(eventName, subscriber, callback){
        this._subscribers[eventName] = _.reject(this._subscribers[eventName] || [], function(elem) {
          return (elem.callback == callback || callback === undefined) && elem.subscriber === subscriber;
        });
      },

      trigger  : function(eventName /* , args... */){
        _.each(this._subscribers[eventName] || [], _.bind(this._triggerSubscriber, this, eventName, arguments));
        _.each(this._subscribers['*'] || [], _.bind(this._triggerSubscriber, this, eventName, arguments));
      },

      _triggerSubscriber : function(eventName, params, subscriber) {
        try {
          subscriber.callback.apply(this,params);
        } catch (e) {
          var stack = e.stack || "unavailable";
          OO.log('Uncaught exception', e, 'Stack', stack,'triggering subscriber', subscriber,
            'with event',eventName, 'Parameters: ', params);
        }
      },

      __placeholder:true
    });

  }(OO, OO._));
