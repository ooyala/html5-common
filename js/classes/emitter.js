(function (OO, _) {
  OO.Emitter = function (messageBus) {
    this.mb = messageBus;
    this._subscribers = {};
  };

  _.extend(OO.Emitter.prototype, {
    on(eventName, subscriber, callback) {
      this._subscribers[eventName] = this._subscribers[eventName] || [];
      this._subscribers[eventName].push({ callback, subscriber });
    },

    off(eventName, subscriber, callback) {
      this._subscribers[eventName] = _.reject(
        this._subscribers[eventName] || [],
        elem => (elem.callback === callback || callback === undefined) && elem.subscriber === subscriber,
      );
    },

    trigger(eventName /* , args... */) {
      _.each(this._subscribers[eventName] || [], _.bind(this._triggerSubscriber, this, eventName, arguments));
      _.each(this._subscribers['*'] || [], _.bind(this._triggerSubscriber, this, eventName, arguments));
    },

    _triggerSubscriber(eventName, params, subscriber) {
      try {
        subscriber.callback.apply(this, params);
      } catch (e) {
        const stack = e.stack || 'unavailable';
        OO.log('Uncaught exception', e, 'Stack', stack, 'triggering subscriber', subscriber,
          'with event', eventName, 'Parameters: ', params);
      }
    },

    __placeholder: true,
  });
}(OO, OO._));
