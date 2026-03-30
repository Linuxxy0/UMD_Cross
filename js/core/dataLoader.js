(function (G) {
  G.Core.DataLoader = {
    loadAll: async function () {
      var files = G.Core.Config.DATA_FILES;
      var keys = Object.keys(files);
      var results = await Promise.all(keys.map(async function (key) {
        var response = await fetch(files[key], { cache: 'no-store' });
        if (!response.ok) {
          throw new Error('Failed to load ' + key + ': ' + response.status);
        }
        return response.json();
      }));
      keys.forEach(function (key, index) {
        G.Data[key] = results[index];
      });
      return G.Data;
    }
  };
})(window.TransmigratorGame);
