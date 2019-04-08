(function (OO, _) {
  OO.StateMachine = {
    /**
     * Based on https://github.com/jakesgordon/javascript-state-machine
     * @param {object} _cfg The config object.
     * @returns {object} fsm
     */
    create(_cfg) {
      // validate parameters
      let cfg = OO.HM.safeObject('statemachine.create.cfg', _cfg);
      let initial = OO.HM.safeDomId('statemachine.create.cfg.initial', cfg.initial);
      let fsm = OO.HM.safeObject('statemachine.create.cfg.target', cfg.target, {});
      let events = OO.HM.safeArrayOfElements(
        'statemachine.create.cfg.events',
        cfg.events,
        element => OO.HM.safeObject('statemachine.create.cfg.events[]', element),
        [],
      );
      let moduleName = OO.HM.safeString('statemachine.create.cfg.moduleName', cfg.moduleName, '');
      let mb = OO.HM.safeObject('statemachine.create.cfg.messageBus', cfg.messageBus);

      let map = {};
      let n;

      fsm.debugTransitions = false;
      let lastEvent = '';

      OO.StateMachine.addToActiveList(cfg.moduleName, fsm);

      /**
       * Do Callback.
       * @param {array} args The array of arguments.
       * @returns {string} callback not found.
       */
      const doCallback = function (...args) {
        const [name] = args;
        let f = null;
        const shortEventName = name.replace(/[^\/]*\//, '').match(/^(.)(.*)/); // transform xxx/abc into ['abc','a','bc']
        const shortMethodName = `on${shortEventName[1].toUpperCase()}${shortEventName[2]}`;
        if (fsm[shortMethodName]) {
          f = fsm[shortMethodName];
        } else {
          const fullEventName = name.replace(/\/.*/, '').match(/^(.)(.*)/); // transform xyz/abc into ['xyz','x','yz']
          const fullMethodName = `on${fullEventName[1].toUpperCase()}${fullEventName[2]}${shortEventName[1].toUpperCase()}${shortEventName[2]}`;
          if (fsm[fullMethodName]) {
            f = fsm[fullMethodName];
          }
        }

        if (f) {
          try {
            const result = f.apply(fsm, args);
            return (result !== false ? 'ok' : 'fail');
          } catch (e) {
            OO.log(e);
            if (OO.TEST_TEST_TEST) {
              throw e; // rethrow in test environment
            }
            return 'fail';
          }
        }

        return 'not_found';
      };

      /**
       * Add
       * @param {object} e The e object.
       */
      const add = function (e) {
        const from = e.from instanceof Array ? e.from : [e.from || '*']; // allow 'wildcard' transition if 'from' is not specified
        let i = 0;
        const ln = from.length;
        map[e.name] = map[e.name] || {};
        for (; i < ln; i++) {
          map[e.name][from[i]] = e.to || from[i]; // allow no-op transition if 'to' is not specified
        }
      };

      fsm.removeEvent = function (eventName) {
        if (map[eventName]) map[eventName] = null;
      };

      fsm.destroyFsm = function () {
        OO.StateMachine.removeFromActiveList(this.moduleName, this);
        for (n in map) {
          if (Object.prototype.hasOwnProperty.call(map, n)) {
            mb.unsubscribe(n.toString(), moduleName, fsm.receive);
          }
        }
        cfg = null;
        initial = null;
        fsm = null;
        events = null;
        moduleName = null;
        mb = null;
        map = {};
      };

      /**
       * Update State.
       * @param {object} fsmObj The fsm object
       * @param {string} state The fsm state
       */
      const updateState = function (fsmObj, state) {
        if (!fsmObj || state === '*') {
          return;
        } // no op  for * state
        if (fsmObj.debugTransitions) {
          OO.log(`Transition ${moduleName || ''
          }\n  OldState: ${fsmObj.currentState ? fsmObj.currentState : ''
          }\n  NewState: ${state || ''
          }\n  CausedBy: ${lastEvent || ''}`);
        }
        fsmObj.currentState = state;
      };

      fsm.canReceive = function (event) {
        return map[event] && (
          Object.prototype.hasOwnProperty.call(map[event], fsm.currentState)
          || Object.prototype.hasOwnProperty.call(map[event], '*')
        );
      };

      fsm.receive = function (...args) {
        const [event] = args;
        // drop events not valid in current state
        if (!fsm) {
          return;
        }
        if (!fsm.canReceive(event)) {
          // using arguments[0] instead of event because safari and iOS don't display this nicely in the console.
          OO.log(`dropped event '${event}' for '${moduleName}' while in state '${fsm.currentState}' with map:`, map);
          return;
        }

        lastEvent = event;

        const from = fsm.currentState;
        const to = map[event][from] || map[event]['*'] || from;

        // handle transition to same state
        if (from === to) {
          doCallback.apply(fsm, args);
          return;
        }

        updateState(fsm, to);

        let callbackResult = 'not_found';
        if (to !== '*') {
          callbackResult = doCallback.apply(fsm, _.union([to], _.rest(args)));
        }
        if (callbackResult === 'not_found') {
          callbackResult = doCallback.apply(fsm, args);
        }

        switch (callbackResult) {
          case 'not_found':
            OO.log(`Module '${moduleName}' does not handle state '${to}' or event '${event}'`);
            updateState(fsm, from);
            break;
          case 'fail':
            updateState(fsm, from);
            break;
          case 'ok':
            break;
          default:
          // do nothing
        }
      };

      const ln = events.length;
      for (n = 0; n < ln; n++) {
        if (typeof (events[n]) === 'object') {
          add(events[n]);
        }
      }

      updateState(fsm, initial);
      if (mb !== undefined) {
        for (n in map) {
          if (Object.prototype.hasOwnProperty.call(map, n)) {
            mb.subscribe(n.toString(), moduleName, fsm.receive);
          }
        }
      }

      return fsm;
    },

    activeStateMachines: {},

    /**
     * Adds a StateMachine to the list of currently active state machines.
     * @param {string} smName The name of the statemachine.
     * @param {object} sm The sm object.
     * @method StateMachine#addToActiveList
     * @public
     */
    addToActiveList(smName, sm) {
      if (!this.activeStateMachines[smName]) {
        this.activeStateMachines[smName] = [];
      }

      this.activeStateMachines[smName].push(sm);
    },

    /**
     * Remove the StateMachine from the list of currently active state machines.
     * @param {string} smName The name of the statemachine.
     * @param {object} sm The sm object.
     * @method StateMachine#removeFromActiveList
     * @public
     */
    removeFromActiveList(smName, sm) {
      const list = this.activeStateMachines[smName];
      if (!list) {
        return;
      }
      let index = 0;
      const ln = list.length;
      for (; index < ln; index++) {
        if (list[index] === sm) {
          list.splice(index, 1);
          break;
        }
      }
    },

    /**
     * Enable debugging state transitions for a particular state machine. If
     * multiple of the same state machine are active, all of them have debugging
     * enabled.
     * @param {string} smName The name of the statemachine.
     * @method StateMachine#startDebugTransitionsFor
     * @public
     * @returns {string} Message stating whether debugging was successfully started
     * (Mostly for debugging in the console)
     */
    startDebugTransitionsFor(smName) {
      const result = this.debugTransitionsHelper(smName, true);
      let msg;
      if (result) {
        msg = `STATEMACHINE \'${smName}\' DEBUGGING STARTED`;
      } else {
        msg = `Couldn't find \'${smName}\'`;
      }

      return msg;
    },

    /**
     * Disable debugging state transitions for a particular state machine.
     * If multiple of the same state machine are active, all of them have debugging disabled.
     * @public
     * @method StateMachine#stopDebugTransitionsFor
     * @param {string} smName The name of the statemachine.
     * @returns {string} Message stating whether debugging was successfully stopped
     * (Mostly for debugging in the console)
     */
    stopDebugTransitionsFor(smName) {
      const result = this.debugTransitionsHelper(smName, false);
      let msg;
      if (result) {
        msg = `STATEMACHINE \'${smName}\' DEBUGGING STOPPED`;
      } else {
        msg = `Couldn't find \'${smName}\'`;
      }

      return msg;
    },

    /**
     * Helper function to enable/disable all statemachines with the specified name.
     * @method StateMachine#debugTransitionsHelper
     * @param {string} smName The name of the statemachine you want to debug.
     * @param {boolean} enable The whether to turn debugging on or off.
     * @returns {boolean} True if successfully at least 1 state machine found to enable/disable.
     */
    debugTransitionsHelper(smName, enable) {
      const list = this.activeStateMachines[smName];
      if (!list) {
        return false;
      }

      for (const sm in list) {
        if (Object.prototype.hasOwnProperty.call(list, sm)) {
          list[sm].debugTransitions = enable;
        }
      }

      return true;
    },

    /**
     * Returns a list of active state machines by name along with a count of
     * how many instances are each state machine are active.
     * @public
     * @method StateMachine#getActiveList
     * @returns {object} An object who's keys are the names of the statemachines and
     * the value is the number of active instances of that statemachine.
     */
    getActiveList() {
      const list = {};
      for (const smName in this.activeStateMachines) {
        if (Object.prototype.hasOwnProperty.call(this.activeStateMachines, smName)) {
          list[smName] = this.activeStateMachines[smName].length;
        }
      }
      return list;
    },

    __end_marker: true,

  };
}(OO, OO._));
