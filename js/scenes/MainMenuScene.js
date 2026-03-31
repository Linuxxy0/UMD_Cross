(function (G) {
  function getSavePreview() {
    var data = G.Core.Storage.get(G.Core.Config.STORAGE_KEY);
    return data && data.player ? data.player : null;
  }

  function announcementList() {
    return G.Managers.AnnouncementManager.getAll().slice(0, 3).map(function (entry) {
      return '<div class="rail-stat-row"><span>v' + entry.version + '</span><span>' + entry.title + '</span></div>';
    }).join('');
  }

  function renderMenu() {
    var savePlayer = getSavePreview();
    var shell = G.UI.Shell.create({
      player: savePlayer,
      node: null,
      sceneClass: 'scene-menu-shell',
      statusTitle: savePlayer ? savePlayer.name : '穿越终端',
      statusMeta: savePlayer ? ((savePlayer.factionName || '江湖散人') + ' / Lv.' + savePlayer.level) : '未检测到运行存档',
      worldLine: savePlayer ? ('大晟江湖 / ' + (savePlayer.currentNodeId || '未知地点')) : '大晟江湖 / 待进入',
      timeLine: '穿越终端 / 主菜单 / 静态待命',
      commandButtons: [
        { label: '新建角色', action: { type: 'route', scene: G.Core.Config.SCENES.CREATE_ROLE } },
        { label: '继续进程', onClick: function () {
          var data = G.Worlds.WuxiaController.continueGame();
          if (!data || !data.player) {
            G.UI.HUD.showToast('没有可继续的存档', 'warning');
            return;
          }
          if (data.player.currentEventId) G.Core.Router.go(G.Core.Config.SCENES.EVENT);
          else G.Core.Router.go(G.Core.Config.SCENES.WORLD_MAP);
        } },
        { label: '公告', action: { type: 'window', key: 'announcement' } },
        { label: '清空存档', onClick: function () { G.Managers.SaveManager.reset(); setTimeout(function () { renderMenu(); }, 160); } }
      ],
      leftHTML: [
        '<section class="panel shell-panel rail-section">',
          '<div class="panel-header"><h2>运行状态</h2><span class="muted">终端</span></div>',
          '<div class="panel-body">',
            '<div class="rail-stat-row"><span>世界</span><span>大晟江湖</span></div>',
            '<div class="rail-stat-row"><span>版本</span><span>v' + G.version + '</span></div>',
            '<div class="rail-stat-row"><span>入口</span><span>直接进入游戏</span></div>',
            '<div class="empty-tip">此页只保留存档恢复、建档与版本入口，正常访问会直接进入游戏主壳体。</div>',
          '</div>',
        '</section>'
      ].join(''),
      centerHTML: [
        '<section class="panel shell-panel">',
          '<div class="panel-header"><h2>穿越终端</h2><span class="muted">恢复存档或建立新档案</span></div>',
          '<div class="panel-body shell-narrative">',
            '<div class="story-block">',
              '<div class="window-kicker">系统状态</div>',
              '<div class="narrative-title">世界已经待命</div>',
              '<div class="narrative-copy">如果已有本地档，如果本地已有进度，系统会直接恢复到当前地点。本页仅作为回退终端，用来新建角色、查看版本与管理本地档案。</div>',
            '</div>',
            '<div class="route-grid">',
              '<button class="route-link" id="menu-new-run">建立新的穿越档案</button>',
              '<button class="route-link" id="menu-continue-run">恢复上次江湖进程</button>',
              '<button class="route-link" id="menu-open-announcement">查看版本记录</button>',
            '</div>',
          '</div>',
        '</section>'
      ].join(''),
      rightHTML: [
        '<section class="panel shell-panel rail-section">',
          '<div class="panel-header"><h2>存档概览</h2><span class="muted">本地</span></div>',
          '<div class="panel-body">',
            '<div class="rail-stat-row"><span>角色</span><span>' + (savePlayer ? savePlayer.name : '--') + '</span></div>',
            '<div class="rail-stat-row"><span>等级</span><span>' + (savePlayer ? ('Lv.' + savePlayer.level) : '--') + '</span></div>',
            '<div class="rail-stat-row"><span>地点</span><span>' + (savePlayer ? savePlayer.currentNodeId : '--') + '</span></div>',
          '</div>',
        '</section>',
        '<section class="panel shell-panel rail-section">',
          '<div class="panel-header"><h2>更新记录</h2><span class="muted">最近 3 条</span></div>',
          '<div class="panel-body">' + announcementList() + '</div>',
        '</section>'
      ].join('')
    });

    shell.mount();
    var center = shell.center;
    center.querySelector('#menu-new-run').addEventListener('click', function () {
      G.Core.Router.go(G.Core.Config.SCENES.CREATE_ROLE);
    });
    center.querySelector('#menu-continue-run').addEventListener('click', function () {
      var data = G.Worlds.WuxiaController.continueGame();
      if (!data || !data.player) {
        G.UI.HUD.showToast('没有可继续的存档', 'warning');
        return;
      }
      if (data.player.currentEventId) G.Core.Router.go(G.Core.Config.SCENES.EVENT);
      else G.Core.Router.go(G.Core.Config.SCENES.WORLD_MAP);
    });
    center.querySelector('#menu-open-announcement').addEventListener('click', function () {
      G.UI.GameWindows && G.UI.GameWindows.open('announcement');
    });
  }

  G.Scenes.MainMenuScene = new Phaser.Class({
    Extends: Phaser.Scene,
    initialize: function MainMenuScene() {
      Phaser.Scene.call(this, { key: G.Core.Config.SCENES.MENU });
    },
    create: function () {
      this.cameras.main.setBackgroundColor('#111315');
      this.add.rectangle(640, 380, 1280, 760, 0x111315, 1);
      renderMenu();
    }
  });
})(window.TransmigratorGame);
