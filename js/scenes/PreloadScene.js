(function (G) {
  G.Scenes.PreloadScene = new Phaser.Class({
    Extends: Phaser.Scene,
    initialize: function PreloadScene() {
      Phaser.Scene.call(this, { key: G.Core.Config.SCENES.PRELOAD });
    },
    create: async function () {
      this.cameras.main.setBackgroundColor('#081321');
      this.add.text(60, 60, '正在载入武侠世界数据...', { fontSize: '28px', color: '#f5e9c9' });
      try {
        await G.Core.DataLoader.loadAll();
        this.scene.start(G.Core.Config.SCENES.MENU);
      } catch (err) {
        console.error(err);
        this.add.text(60, 120, '数据加载失败，请检查本地服务器或资源路径。', { fontSize: '20px', color: '#ffb4b4' });
      }
    }
  });
})(window.TransmigratorGame);
