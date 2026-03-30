(function (G) {
  var listeners = {};
  G.Core.EventBus = {
    on: function (eventName, handler) {
      listeners[eventName] = listeners[eventName] || [];
      listeners[eventName].push(handler);
    },
    off: function (eventName, handler) {
      if (!listeners[eventName]) return;
      listeners[eventName] = listeners[eventName].filter(function (fn) { return fn !== handler; });
    },
    emit: function (eventName, payload) {
      (listeners[eventName] || []).forEach(function (fn) {
        try { fn(payload); } catch (err) { console.error(err); }
      });
    }
  };
})(window.TransmigratorGame);
