(function (G) {
  function getSavePreview() {
    var data = G.Core.Storage.get(G.Core.Config.STORAGE_KEY);
    if (!data || !data.player) return null;
    return data.player;
  }

  function buildFactionRows() {
    return ((G.Data.world && G.Data.world.factions) || []).map(function (faction) {
      return [
        '<div class="base-attr-item">',
          '<span>' + faction.name + '</span>',
          '<strong>' + faction.desc + '</strong>',
        '</div>'
      ].join('');
    }).join('');
  }

  function buildAnnouncementCards() {
    var entries = G.Managers.AnnouncementManager.getAll().slice(0, 2);
    return entries.map(function (entry, index) {
      return [
        '<div class="feature-card compact line-card">',
          '<div class="feature-kicker">', index === 0 ? '当前公告' : '历史版本', '</div>',
          '<h4>v', entry.version, ' · ', entry.title, '</h4>',
          '<p>', entry.summary || '', '</p>',
        '</div>'
      ].join('');
    }).join('');
  }

  function renderMenu() {
    var savePlayer = getSavePreview();
    var layer = document.createElement('div');
    layer.className = 'ui-layer scene-shell';

    var wrap = document.createElement('div');
    wrap.className = 'hub-layout umd-layout scene-layout';

    var left = document.createElement('aside');
    left.className = 'hud-column hud-column-left';
    left.innerHTML = [
      '<section class="panel panel-strong base-stat-panel role-identity-panel">',
        '<div class="panel-header slim"><h3>界门终端</h3><span class="muted">主菜单</span></div>',
        '<div class="identity-portrait">门</div>',
        '<div class="identity-line-list">',
          '<div class="base-attr-item"><span>当前世界</span><strong>大晟江湖</strong></div>',
          '<div class="base-attr-item"><span>版本号</span><strong>v' + G.version + '</strong></div>',
          '<div class="base-attr-item"><span>发布方式</span><strong>GitHub Pages</strong></div>',
        '</div>',
        '<div class="muted attr-footnote">主菜单、创建角色、事件、战斗与结局页现在统一为同一套 UMD 线条界面，不再切回展示页风格。</div>',
      '</section>',
      '<section class="panel base-stat-panel">',
        '<div class="panel-header slim"><h3>存档概览</h3><span class="muted">本地进度</span></div>',
        '<div class="base-attr-list">',
          '<div class="base-attr-item"><span>角色</span><strong>' + (savePlayer ? savePlayer.name : '暂无存档') + '</strong></div>',
          '<div class="base-attr-item"><span>等级</span><strong>' + (savePlayer ? ('Lv.' + savePlayer.level) : '--') + '</strong></div>',
          '<div class="base-attr-item"><span>地点</span><strong>' + (savePlayer ? savePlayer.currentNodeId : '--') + '</strong></div>',
          '<div class="base-attr-item"><span>门派</span><strong>' + (savePlayer ? savePlayer.factionName : '--') + '</strong></div>',
        '</div>',
        '<div class="muted attr-footnote">继续游戏会直接读入本地档；没有存档时只能新建角色进入江湖。</div>',
      '</section>',
      '<section class="panel equipment-brief-panel">',
        '<div class="panel-header slim"><h3>启动须知</h3><span class="muted">界面结构</span></div>',
        '<div class="bullet-list">',
          '<div>· 左列：头像、血蓝条、基础属性和即时资源。</div>',
          '<div>· 中列：主场景、剧情推进、战斗日志与互动按钮。</div>',
          '<div>· 右列：任务、势力、公告和战场情报。</div>',
          '<div>· 左右小三角：拉出个人信息、背包、技能、地图、商场等窗口。</div>',
        '</div>',
      '</section>'
    ].join('');

    var main = G.UI.Panel({ title: '主菜单', subtitle: 'UMD 线条界面 / 江湖入口', className: 'main-panel hub-main-panel', strong: true });
    main.body.innerHTML = [
      '<div class="scene-banner line-card menu-banner">',
        '<div class="scene-line-label">界门待命</div>',
        '<h3>一念穿越：江湖初卷</h3>',
        '<p>你即将以纯游戏界面进入大晟江湖。现在可以新建角色，或从本地存档继续推进当前穿越流程。</p>',
        '<div class="tag-list">',
          '<span class="tag">UMD</span>',
          '<span class="tag">武侠穿越</span>',
          '<span class="tag">统一物品库</span>',
          '<span class="tag">侧拉窗口</span>',
          '<span class="tag">多结局</span>',
        '</div>',
        '<div class="btn-row" id="menu-actions"></div>',
      '</div>',
      '<div class="route-panel">',
        '<div class="panel-header slim"><h3>首发内容</h3><span class="muted">开局后直接可玩</span></div>',
        '<div class="menu-card-grid">',
          '<div class="route-card line-card"><div class="route-card-top"><strong>主线目标</strong><span class="gold">界门</span></div><p>追索界门线索，决定留在武林、返回现代，还是触碰更深层的诸天秘密。</p></div>',
          '<div class="route-card line-card"><div class="route-card-top"><strong>五大窗口</strong><span class="gold">侧拉</span></div><p>个人信息、背包、技能、地图与商场全部以游戏内窗口打开，不跳离主场景。</p></div>',
          '<div class="route-card line-card"><div class="route-card-top"><strong>统一物品库</strong><span class="gold">实例化</span></div><p>装备与道具分离为定义库与背包实例，穿戴和属性联动同步结算。</p></div>',
          '<div class="route-card line-card"><div class="route-card-top"><strong>战斗与事件</strong><span class="gold">方角线条</span></div><p>事件页、战斗页和结局页全部沿用同一套 UMD 线条风格，不再切换成官网式页面。</p></div>',
        '</div>',
      '</div>',
      '<div class="route-panel">',
        '<div class="panel-header slim"><h3>势力起点</h3><span class="muted">首个世界可选路线</span></div>',
        '<div class="base-attr-list menu-faction-list">' + buildFactionRows() + '</div>',
      '</div>'
    ].join('');

    var right = G.UI.Panel({ title: '首发情报', subtitle: '公告 / 世界概览', className: 'sidebar-panel hub-side-panel' });
    right.body.innerHTML = [
      '<div class="quest-card line-card">',
        '<div class="window-kicker">世界概览</div>',
        '<h3>大晟江湖</h3>',
        '<p>' + ((G.Data.world && G.Data.world.intro) || '第一世界已经开启。') + '</p>',
      '</div>',
      buildAnnouncementCards(),
      '<div class="feature-card compact line-card">',
        '<div class="feature-kicker">启动建议</div>',
        '<div class="bullet-list">',
          '<div>· 第一次进入建议先新建角色，体验完整主场景和门派路线。</div>',
          '<div>· 已有本地档时，可直接从继续游戏回到当前事件或世界地图。</div>',
          '<div>· 删除本地存档会清空当前版本的浏览器进度。</div>',
        '</div>',
      '</div>'
    ].join('');

    wrap.appendChild(left);
    wrap.appendChild(main);
    wrap.appendChild(right);
    layer.appendChild(wrap);

    var uiRoot = document.getElementById('ui-root');
    uiRoot.innerHTML = '';
    uiRoot.appendChild(layer);

    var actionRoot = main.body.querySelector('#menu-actions');

    var startBtn = document.createElement('button');
    startBtn.className = 'btn primary';
    startBtn.textContent = '开始新游戏';
    startBtn.addEventListener('click', function () {
      G.Core.Router.go(G.Core.Config.SCENES.CREATE_ROLE);
    });

    var continueBtn = document.createElement('button');
    continueBtn.className = 'btn';
    continueBtn.textContent = '继续游戏';
    continueBtn.disabled = !G.Managers.SaveManager.hasSave();
    continueBtn.addEventListener('click', function () {
      var data = G.Worlds.WuxiaController.continueGame();
      if (!data) {
        G.UI.HUD.showToast('没有可用存档', 'warning');
        return;
      }
      if (data.player.currentEventId) {
        G.Core.Router.go(G.Core.Config.SCENES.EVENT);
      } else {
        G.Core.Router.go(G.Core.Config.SCENES.WORLD_MAP);
      }
    });

    var announcementBtn = document.createElement('button');
    announcementBtn.className = 'btn';
    announcementBtn.textContent = '查看版本公告';
    announcementBtn.addEventListener('click', function () {
      var first = G.Managers.AnnouncementManager.getAll()[0];
      var text = first && first.notes ? first.notes.join(' / ') : '暂无公告';
      G.UI.HUD.showToast('当前版本：' + text, 'success');
    });

    var resetBtn = document.createElement('button');
    resetBtn.className = 'btn danger';
    resetBtn.textContent = '删除本地存档';
    resetBtn.addEventListener('click', function () {
      G.Managers.SaveManager.reset();
      setTimeout(function () { location.reload(); }, 500);
    });

    actionRoot.appendChild(startBtn);
    actionRoot.appendChild(continueBtn);
    actionRoot.appendChild(announcementBtn);
    actionRoot.appendChild(resetBtn);
  }

  G.Scenes.MainMenuScene = new Phaser.Class({
    Extends: Phaser.Scene,
    initialize: function MainMenuScene() {
      Phaser.Scene.call(this, { key: G.Core.Config.SCENES.MENU });
    },
    create: function () {
      this.cameras.main.setBackgroundColor('#07101a');
      this.add.rectangle(640, 380, 1280, 760, 0x07101a, 1);
      this.add.line(90, 118, 0, 0, 1100, 0, 0x4f6b95, 0.18).setOrigin(0, 0);
      this.add.line(90, 652, 0, 0, 1100, 0, 0x4f6b95, 0.12).setOrigin(0, 0);
      this.add.triangle(180, 682, 0, 760, 180, 240, 370, 760, 0x0c1727, 1);
      this.add.triangle(560, 638, 300, 760, 560, 226, 820, 760, 0x101c2d, 1);
      this.add.triangle(980, 690, 760, 760, 980, 282, 1220, 760, 0x132237, 1);
      renderMenu();
    }
  });
})(window.TransmigratorGame);
