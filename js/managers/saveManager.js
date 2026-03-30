(function (G) {
  function snapshot() {
    return {
      player: G.Managers.PlayerManager.getPlayer(),
      world: G.State.world || null,
      version: G.version,
      savedAt: new Date().toISOString()
    };
  }

  G.Managers.SaveManager = {
    save: function (options) {
      var ok = G.Core.Storage.set(G.Core.Config.STORAGE_KEY, snapshot());
      if (ok && !(options && options.silent)) G.UI.HUD.showToast('存档成功', 'success');
      return ok;
    },
    load: function () {
      var data = G.Core.Storage.get(G.Core.Config.STORAGE_KEY);
      if (!data || !data.player) return null;
      G.Managers.PlayerManager.setPlayer(data.player);
      G.State.world = data.world || { worldId: 'wuxia', currentNodeId: data.player.currentNodeId };
      return data;
    },
    hasSave: function () {
      return !!G.Core.Storage.get(G.Core.Config.STORAGE_KEY);
    },
    reset: function () {
      G.Core.Storage.remove(G.Core.Config.STORAGE_KEY);
      G.UI.HUD.showToast('存档已删除', 'warning');
    },
    exportSave: function () {
      var data = snapshot();
      var blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
      var url = URL.createObjectURL(blob);
      var a = document.createElement('a');
      a.href = url;
      a.download = 'transmigrator-wuxia-save-' + G.version + '.json';
      a.click();
      setTimeout(function () { URL.revokeObjectURL(url); }, 500);
    },
    importSaveFile: async function (file) {
      var text = await file.text();
      var data = JSON.parse(text);
      if (!data.player) throw new Error('无效存档');
      G.Core.Storage.set(G.Core.Config.STORAGE_KEY, data);
      return data;
    }
  };
})(window.TransmigratorGame);
