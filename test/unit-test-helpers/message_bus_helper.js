(function (OO, _) {
  _.extend(OO.MessageBus.prototype, {
    published(event) {
      const matches = _.filter(this._messageHistory, msg => msg[0] === 'publish' && msg[1] === event);
      return _.rest(_.last(matches) || []);
    },

    countEvents(event) {
      const matches = _.filter(this._messageHistory, msg => msg[0] === 'publish' && msg[1] === event);
      return matches.length;
    },

    __end_marker: true,
  });
}(OO, OO._));
