(function (G) {
  G.Worlds.WuxiaController = {
    startNewGame: function (payload) {
      G.Managers.PlayerManager.createPlayer(payload);
      G.Managers.WorldManager.init();
      G.Managers.EventManager.setCurrentEvent('evt_intro_awake');
      G.Managers.SaveManager.save();
    },
    continueGame: function () {
      var data = G.Managers.SaveManager.load();
      if (data) {
        G.Managers.WorldManager.init();
      }
      return data;
    }
  };
})(window.TransmigratorGame);
