(function (G) {
  G.Core.Router = {
    game: null,
    setGame: function (game) {
      this.game = game;
    },
    go: function (sceneKey, data) {
      if (!this.game) return;
      this.clearUI();
      this.game.scene.start(sceneKey, data || {});
    },
    overlay: function (sceneKey, data) {
      if (!this.game) return;
      this.game.scene.launch(sceneKey, data || {});
    },
    clearUI: function () {
      var uiRoot = document.getElementById('ui-root');
      if (uiRoot) uiRoot.innerHTML = '';
    }
  };
})(window.TransmigratorGame);
