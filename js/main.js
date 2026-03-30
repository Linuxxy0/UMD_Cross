(function (G) {
  function bindSaveActions() {
    var exportBtn = document.getElementById('btn-export-save');
    var importBtn = document.getElementById('btn-import-save');
    var importInput = document.getElementById('import-save-input');

    exportBtn.addEventListener('click', function () {
      if (!G.Managers.SaveManager.hasSave()) {
        G.UI.HUD.showToast('当前没有可导出的存档。', 'warning');
        return;
      }
      G.Managers.SaveManager.exportSave();
    });

    importBtn.addEventListener('click', function () {
      importInput.click();
    });

    importInput.addEventListener('change', async function (event) {
      var file = event.target.files && event.target.files[0];
      if (!file) return;
      try {
        await G.Managers.SaveManager.importSaveFile(file);
        G.UI.HUD.showToast('存档导入成功，正在刷新。', 'success');
        setTimeout(function () { location.reload(); }, 500);
      } catch (err) {
        console.error(err);
        G.UI.HUD.showToast('存档导入失败：' + err.message, 'error');
      } finally {
        importInput.value = '';
      }
    });
  }

  window.addEventListener('DOMContentLoaded', function () {
    bindSaveActions();

    var game = new Phaser.Game({
      type: Phaser.AUTO,
      width: G.Core.Config.GAME_WIDTH,
      height: G.Core.Config.GAME_HEIGHT,
      parent: 'game-container',
      backgroundColor: '#000000',
      scene: [
        G.Scenes.BootScene,
        G.Scenes.PreloadScene,
        G.Scenes.MainMenuScene,
        G.Scenes.CreateRoleScene,
        G.Scenes.WorldMapScene,
        G.Scenes.EventScene,
        G.Scenes.BattleScene,
        G.Scenes.TownScene,
        G.Scenes.EndingScene
      ],
      scale: {
        mode: Phaser.Scale.FIT,
        autoCenter: Phaser.Scale.CENTER_BOTH
      }
    });

    G.State.game = game;
  });
})(window.TransmigratorGame);
