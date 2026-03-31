(function (G) {
  function renderEnding() {
    var player = G.Managers.PlayerManager.getPlayer();
    var pending = player && player.pendingResult || {};
    if (!player) {
      G.Core.Router.go(G.Core.Config.SCENES.MENU);
      return;
    }
    var endingId = pending.endingId || 'ending_return';
    var ending = (G.Data.world.endings || []).find(function (item) { return item.id === endingId; }) || {
      id: 'ending_return',
      title: '前路未尽',
      desc: '故事暂告一段落，但穿越之路尚未结束。'
    };
    if (player.endingsUnlocked.indexOf(ending.id) < 0) player.endingsUnlocked.push(ending.id);
    G.Managers.PlayerManager.applyDerivedStats();

    var shell = G.UI.Shell.create({
      player: player,
      node: G.Managers.WorldManager.getCurrentNode() || null,
      sceneClass: 'scene-ending-shell',
      statusMeta: (player.factionName || '江湖散人') + ' / 结局归档',
      worldLine: '大晟江湖 / 结局记录',
      timeLine: '通关 / 存档保留 / 终端归档',
      leftHTML: G.UI.Shell.playerRailHtml(player, { locationLabel: '结局记录' }),
      centerHTML: [
        '<section class="panel shell-panel">',
          '<div class="panel-header"><h2>结局归档</h2><span class="muted">本轮记录</span></div>',
          '<div class="panel-body shell-narrative">',
            '<div class="story-block">',
              '<div class="window-kicker">当前结局</div>',
              '<div class="narrative-title">' + ending.title + '</div>',
              '<div class="narrative-copy">' + ending.desc + '</div>',
            '</div>',
            '<section class="panel shell-panel">',
              '<div class="panel-header"><h2>角色总结</h2><span class="muted">本轮终点</span></div>',
              '<div class="panel-body">',
                '<div class="rail-stat-row"><span>角色</span><span>' + player.name + '</span></div>',
                '<div class="rail-stat-row"><span>出身</span><span>' + player.backgroundLabel + '</span></div>',
                '<div class="rail-stat-row"><span>天赋</span><span>' + player.talentLabel + '</span></div>',
                '<div class="rail-stat-row"><span>等级</span><span>Lv.' + player.level + '</span></div>',
                '<div class="rail-stat-row"><span>已解锁结局</span><span>' + player.endingsUnlocked.length + '</span></div>',
              '</div>',
            '</section>',
            '<div class="btn-row">',
              '<button class="btn primary" id="restart-run">返回终端</button>',
              '<button class="btn" id="back-map">回到地图</button>',
            '</div>',
          '</div>',
        '</section>'
      ].join(''),
      rightHTML: [
        '<section class="panel shell-panel rail-section">',
          '<div class="panel-header"><h2>后续建议</h2><span class="muted">多周目</span></div>',
          '<div class="panel-body bullet-list">',
            '<div>· 更换出身与天赋，观察开局资源和事件路线的变化。</div>',
            '<div>· 继续保留当前角色，回到地图补齐隐藏事件与门派路线。</div>',
            '<div>· 在公告窗格中查看版本追加内容与系统改造记录。</div>',
          '</div>',
        '</section>',
        '<section class="panel shell-panel rail-section">',
          '<div class="panel-header"><h2>本轮记录</h2><span class="muted">摘要</span></div>',
          '<div class="panel-body">',
            '<div class="rail-stat-row"><span>当前门派</span><span>' + (player.factionName || '无') + '</span></div>',
            '<div class="rail-stat-row"><span>已学武学</span><span>' + ((player.learnedSkills || []).length) + '</span></div>',
            '<div class="rail-stat-row"><span>银两</span><span>' + player.money + '</span></div>',
          '</div>',
        '</section>'
      ].join('')
    });

    shell.mount();
    shell.center.querySelector('#restart-run').addEventListener('click', function () {
      player.pendingResult = null;
      G.Managers.SaveManager.save({ silent: true });
      G.Core.Router.go(G.Core.Config.SCENES.MENU);
    });
    shell.center.querySelector('#back-map').addEventListener('click', function () {
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
      this.cameras.main.setBackgroundColor('#111315');
      this.add.rectangle(640, 380, 1280, 760, 0x111315, 1);
      renderEnding();
    }
  });
})(window.TransmigratorGame);
