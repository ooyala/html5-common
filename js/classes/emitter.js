(function (OO, _) {
  OO.Emitter = function (messageBus) {
    this.mb = messageBus;
    this._subscribers = {};
  };

  _.extend(OO.Emitter.prototype, {
    /**
     * on
     * @param {string} eventName The name of event.
     * @param {*} subscriber The subscriber
     * @param {function} callback The callback.
     */
    on(eventName, subscriber, callback) {
      this._subscribers[eventName] = this._subscribers[eventName] || [];
      this._subscribers[eventName].push({ callback, subscriber });
    },

    /**
     * off
     * @param {string} eventName The name of event.
     * @param {*} subscriber The subscriber
     * @param {function} callback The callback.
     */
    off(eventName, subscriber, callback) {
      this._subscribers[eventName] = _.reject(
        this._subscribers[eventName] || [],
        elem => (elem.callback === callback || callback === undefined) && elem.subscriber === subscriber,
      );
    },

    /**
     * trigger.
     * @param {array} args The array of arguments.
     */
    trigger(...args) {
      const [eventName] = args;
      _.each(this._subscribers[eventName] || [], _.bind(this._triggerSubscriber, this, eventName, args));
      _.each(this._subscribers['*'] || [], _.bind(this._triggerSubscriber, this, eventName, args));
    },

    /**
     * trigger subscriber.
     * @param {string} eventName The name of event.
     * @param {array} params The array of parameters.
     * @param {*} subscriber The subscriber
     * @private
     */
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
