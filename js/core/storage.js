(function (G) {
  G.Core.Storage = {
    get: function (key) {
      try {
        var raw = localStorage.getItem(key);
        return raw ? JSON.parse(raw) : null;
      } catch (err) {
        console.warn('Storage get failed', err);
        return null;
      }
    },
    set: function (key, value) {
      try {
        localStorage.setItem(key, JSON.stringify(value));
        return true;
      } catch (err) {
        console.warn('Storage set failed', err);
        return false;
      }
    },
    remove: function (key) {
      try {
        localStorage.removeItem(key);
      } catch (err) {
        console.warn('Storage remove failed', err);
      }
    }
  };
})(window.TransmigratorGame);
