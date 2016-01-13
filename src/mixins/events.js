import events from 'events';

function eventsMixinFactory(dst = {}) {
  const emitter = new events.EventEmitter();

  return Object.assign(dst, {
    on(event, eventHandler) {
      emitter.on(event, eventHandler);
    },
    once(event, eventHandler) {
      function cb(data) {
        eventHandler(data);
        this.off(event, cb);
      }

      this.on(event, cb);
    },
    off(event, callback) {
      if (callback) {
        emitter.removeListener(event, callback);
      } else {
        emitter.removeAllListeners(event);
      }
    },
    trigger(event, data) {
      emitter.emit(event, data);
    }
  });
}

export default eventsMixinFactory;