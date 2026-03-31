(function (G) {
  G.Scenes.PreloadScene = new Phaser.Class({
    Extends: Phaser.Scene,
    initialize: function PreloadScene() {
      Phaser.Scene.call(this, { key: G.Core.Config.SCENES.PRELOAD });
    },
    create: async function () {
      this.cameras.main.setBackgroundColor('#111315');
      this.add.text(48, 46, '正在接入大晟江湖终端...', { fontSize: '18px', color: '#e6e0d5' });
      this.add.text(48, 76, '载入世界、地图、事件与人物档案。', { fontSize: '13px', color: '#8f989f' });
      try {
        await G.Core.DataLoader.loadAll();
        if (G.Managers.SaveManager.hasSave()) {
          var data = G.Worlds.WuxiaController.continueGame();
          if (data && data.player) {
            if (data.player.currentEventId) {
              this.scene.start(G.Core.Config.SCENES.EVENT);
            } else {
              this.scene.start(G.Core.Config.SCENES.WORLD_MAP);
            }
            return;
          }
        }
        this.scene.start(G.Core.Config.SCENES.CREATE_ROLE);
      } catch (err) {
        console.error(err);
        this.add.text(48, 116, '数据加载失败，请检查本地服务器或资源路径。', { fontSize: '14px', color: '#d2a3a3' });
      }
    }
  });
})(window.TransmigratorGame);
