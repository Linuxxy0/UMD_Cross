(function (G) {
  function renderEnding() {
    var player = G.Managers.PlayerManager.getPlayer();
    var pending = player.pendingResult || {};
    var endingId = pending.endingId || 'ending_return';
    var ending = (G.Data.world.endings || []).find(function (item) { return item.id === endingId; }) || {
      id: 'ending_return',
      title: '前路未尽',
      desc: '故事暂告一段落，但穿越之路尚未结束。'
    };
    if (player.endingsUnlocked.indexOf(ending.id) < 0) player.endingsUnlocked.push(ending.id);

    var layer = document.createElement('div');
    layer.className = 'ui-layer';

    var panel = G.UI.Panel({ title: ending.title, subtitle: '结局', className: 'main-panel page-single', strong: true });
    panel.body.innerHTML = [
      '<div class="story-block">' + ending.desc + '</div>',
      '<div class="kv-grid">',
        '<div class="kv-item"><strong>角色</strong><div class="muted">' + player.name + '</div></div>',
        '<div class="kv-item"><strong>等级</strong><div class="muted">' + player.level + '</div></div>',
        '<div class="kv-item"><strong>门派</strong><div class="muted">' + player.factionName + '</div></div>',
        '<div class="kv-item"><strong>已解锁结局</strong><div class="muted">' + player.endingsUnlocked.length + '</div></div>',
      '</div>',
      '<div class="btn-row">',
        '<button class="btn primary" id="restart-run">返回主菜单</button>',
        '<button class="btn" id="back-map">回到地图</button>',
      '</div>'
    ].join('');

    var layerRoot = document.getElementById('ui-root');
    layerRoot.innerHTML = '';
    layerRoot.appendChild(layer);
    layer.appendChild(panel);

    panel.body.querySelector('#restart-run').addEventListener('click', function () {
      player.pendingResult = null;
      G.Managers.SaveManager.save({ silent: true });
      G.Core.Router.go(G.Core.Config.SCENES.MENU);
    });
    panel.body.querySelector('#back-map').addEventListener('click', function () {
      player.pendingResult = null;
      G.Managers.SaveManager.save({ silent: true });
      G.Core.Router.go(G.Core.Config.SCENES.WORLD_MAP);
    });
  }

  G.Scenes.EndingScene = new Phaser.Class({
    Extends: Phaser.Scene,
    initialize: function EndingScene() {
      Phaser.Scene.call(this, { key: G.Core.Config.SCENES.ENDING });
    },
    create: function () {
      this.cameras.main.setBackgroundColor('#05080d');
      renderEnding();
    }
  });
})(window.TransmigratorGame);
