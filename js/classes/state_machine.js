(function (OO, _) {
  OO.StateMachine = {

    // Based on https://github.com/jakesgordon/javascript-state-machine
    create(_cfg) {
      // validate parameters
      let cfg = OO.HM.safeObject('statemachine.create.cfg', _cfg);
      let initial = OO.HM.safeDomId('statemachine.create.cfg.initial', cfg.initial);
      let fsm = OO.HM.safeObject('statemachine.create.cfg.target', cfg.target, {});
      let events = OO.HM.safeArrayOfElements('statemachine.create.cfg.events', cfg.events, element => OO.HM.safeObject('statemachine.create.cfg.events[]', element), []);
      let moduleName = OO.HM.safeString('statemachine.create.cfg.moduleName', cfg.moduleName, '');
      let mb = OO.HM.safeObject('statemachine.create.cfg.messageBus', cfg.messageBus);

      let map = {};
      let n;

      fsm.debugTransitions = false;
      let lastEvent = '';

      OO.StateMachine.addToActiveList(cfg.moduleName, fsm);

      const doCallback = function (name) {
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
            const result = f.apply(fsm, arguments);
            return (result !== false ? 'ok' : 'fail');
          } catch (e) {
            OO.log(e);
            if (OO.TEST_TEST_TEST) {
              throw e; // rethrow in test environment
            }
            return 'fail';
          }
        }

        // callback not found
        return 'not_found';
      };

      const add = function (e) {
        const from = (e.from instanceof Array) ? e.from : (e.from ? [e.from] : ['*']); // allow 'wildcard' transition if 'from' is not specified
        let n;
        map[e.name] = map[e.name] || {};
        for (n = 0; n < from.length; n++) {
          map[e.name][from[n]] = e.to || from[n]; // allow no-op transition if 'to' is not specified
        }
      };

      fsm.removeEvent = function (eventname) {
        if (map[eventname]) map[eventname] = null;
      };

      fsm.destroyFsm = function () {
        OO.StateMachine.removeFromActiveList(this.moduleName, this);
        for (n in map) {
          mb.unsubscribe(n.toString(), moduleName, fsm.receive);
        }
        cfg = null;
        initial = null;
        fsm = null;
        events = null;
        moduleName = null;
        mb = null;
        map = {};
      };

      const updateState = function (fsm, state) {
        if (!fsm || state === '*') { return; } // no op  for * state
        if (fsm.debugTransitions) {
          OO.log(`Transition ${moduleName || ''
          }\n  OldState: ${fsm.currentState ? fsm.currentState : ''
          }\n  NewState: ${state || ''
          }\n  CausedBy: ${lastEvent || ''}`);
        }
        fsm.currentState = state;
      };

      fsm.canReceive = function (event) { return map[event] && (map[event].hasOwnProperty(fsm.currentState) || map[event].hasOwnProperty('*')); };

      fsm.receive = function (event/* ....arguments */) {
        // drop events not valid in current state
        if (!fsm) {
          return;
        }
        if (!fsm.canReceive(event)) {
          // using arguments[0] instead of event because safari and iOS don't display this nicely in the console.
          OO.log(`dropped event '${arguments[0]}' for '${moduleName}' while in state '${fsm.currentState}' with map:`, map);
          return;
        }

        lastEvent = arguments[0];

        const from = fsm.currentState;
        const to = map[event][from] || map[event]['*'] || from;
        let n;

        // handle transition to same state
        if (from === to) {
          doCallback.apply(fsm, arguments);
          return;
        }

        updateState(fsm, to);

        let callbackResult = 'not_found';
        if (to !== '*') { callbackResult = doCallback.apply(fsm, _.union([to], _.rest(arguments))); }
        if (callbackResult === 'not_found') { callbackResult = doCallback.apply(fsm, arguments); }

        switch (callbackResult) {
          case 'not_found':
            OO.log(`Module '${moduleName}' does not handle state '${to}' or event '${arguments[0]}'`);
            updateState(fsm, from);
            break;
          case 'fail':
            updateState(fsm, from);
            break;
          case 'ok':
            break;
        }
      };

      for (n = 0; n < events.length; n++) {
        if (typeof (events[n]) === 'object') {
          add(events[n]);
        }
      }

      updateState(fsm, initial);
      if (mb !== undefined) {
        for (n in map) {
          mb.subscribe(n.toString(), moduleName, fsm.receive);
        }
      }

      return fsm;
    },

    activeStateMachines: {},

    /**
     * Adds a StateMachine to the list of currently active state machines.
     * @public
     * @method StateMachine#addToActiveList
     */
    addToActiveList(smName, sm) {
      if (!this.activeStateMachines[smName]) {
        this.activeStateMachines[smName] = [];
      }

      this.activeStateMachines[smName].push(sm);
    },

    /**
     * Remove the StateMachine from the list of curently active state machines.
     * @public
     * @method StateMachine#removeFromActiveList
     */
    removeFromActiveList(smName, sm) {
      const list = this.activeStateMachines[smName];
      if (!list) {
        return;
      }

      for (let index = 0; index < list.length; index++) {
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
     * @public
     * @method StateMachine#startDebugTransitionsFor
     * @returns string Message stating whether debugging was succesfully started
     *           (Mostly for debugging in the console)
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
    * Disable debugging state transitions for a particular state machine. If
    * multiple of the same state machine are active, all of them have debugging
    * disabled.
     * @public
     * @method StateMachine#stopDebugTransitionsFor
     * @returns string Message stating whether debugging was succesfully stopped
     *           (Mostly for debugging in the console)
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
     * @private
     * @method StateMachine#debugTransitionsHelper
     * @param string smName - name of the statemachine you want to debug
     * @param boolean enable - whether to turn debugging on or off.
     * @returns boolean True if successfully at least 1 state machine found to enable/disable
     */
    debugTransitionsHelper(smName, enable) {
      const list = this.activeStateMachines[smName];
      if (!list) {
        return false;
      }

      for (const sm in list) {
        list[sm].debugTransitions = enable;
      }

      return true;
    },

    /**
     * Returns a list of active state machines by name along with a count of
     * how many instances are each state machine are active.
     * @public
     * @method StateMachine#getActiveList
     * @returns object An object who's keys are the names of the statemachines and
     *           the value is the number of active instances of that statemachine.
     */
    getActiveList() {
      const list = {};
      for (const smName in this.activeStateMachines) {
        list[smName] = this.activeStateMachines[smName].length;
      }
      return list;
    },

    __end_marker: true,

  };
}(OO, OO._));
