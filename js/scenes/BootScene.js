(function (G) {
  G.Scenes.BootScene = new Phaser.Class({
    Extends: Phaser.Scene,
    initialize: function BootScene() {
      Phaser.Scene.call(this, { key: G.Core.Config.SCENES.BOOT });
    },
    create: function () {
      G.Core.Router.setGame(this.game);
      this.scene.start(G.Core.Config.SCENES.PRELOAD);
    }
  });
})(window.TransmigratorGame);
