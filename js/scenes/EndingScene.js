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
    G.Managers.PlayerManager.applyDerivedStats();

    var layer = document.createElement('div');
    layer.className = 'ui-layer scene-shell';

    var wrap = document.createElement('div');
    wrap.className = 'hub-layout umd-layout scene-layout';

    var left = document.createElement('aside');
    left.className = 'hud-column hud-column-left';
    left.appendChild(G.UI.HUD.buildTopBar());
    left.appendChild(G.UI.HUD.buildBaseStatsPanel());

    var archivePanel = G.UI.Panel({ title: '结局档案', subtitle: '本轮记录', className: 'sidebar-panel equipment-brief-panel' });
    archivePanel.body.innerHTML = [
      '<div class="identity-line-list">',
        '<div class="base-attr-item"><span>当前结局</span><strong>' + ending.title + '</strong></div>',
        '<div class="base-attr-item"><span>已解锁</span><strong>' + player.endingsUnlocked.length + '</strong></div>',
        '<div class="base-attr-item"><span>当前门派</span><strong>' + (player.factionName || '无') + '</strong></div>',
        '<div class="base-attr-item"><span>角色等级</span><strong>Lv.' + player.level + '</strong></div>',
      '</div>',
      '<div class="muted attr-footnote">结局页也采用与主界面一致的三列式 UMD 线条布局，左右小三角和游戏内窗口依旧可用。</div>'
    ].join('');
    left.appendChild(archivePanel);

    var main = G.UI.Panel({ title: '结局', subtitle: 'UMD 线条界面 / 通关结算', className: 'main-panel hub-main-panel', strong: true });
    main.body.innerHTML = [
      '<div class="scene-banner line-card ending-banner">',
        '<div class="scene-line-label">诸天裂隙记录</div>',
        '<h3>' + ending.title + '</h3>',
        '<p>' + ending.desc + '</p>',
        '<div class="tag-list">',
          '<span class="tag">角色 ' + player.name + '</span>',
          '<span class="tag">等级 Lv.' + player.level + '</span>',
          '<span class="tag">门派 ' + (player.factionName || '无') + '</span>',
          '<span class="tag">已解锁结局 ' + player.endingsUnlocked.length + '</span>',
        '</div>',
      '</div>',
      '<div class="ending-summary-grid">',
        '<div class="route-card line-card"><div class="route-card-top"><strong>角色档案</strong><span class="gold">本轮总结</span></div><p>姓名：' + player.name + '　出身：' + player.backgroundLabel + '　天赋：' + player.talentLabel + '</p><p>银两：' + player.money + '　攻击：' + (player.attackPower || 0) + '　防御：' + (player.defensePower || 0) + '</p></div>',
        '<div class="route-card line-card"><div class="route-card-top"><strong>旅程进度</strong><span class="gold">界门</span></div><p>当前世界仍为大晟江湖。你已经在这个世界里留下了属于自己的结局记录，可返回主菜单开启新周目，也可回到地图继续扩展支线。</p></div>',
      '</div>',
      '<div class="option-panel line-card">',
        '<div class="panel-header slim"><h3>后续选择</h3><span class="muted">保留当前存档</span></div>',
        '<div class="bullet-list">',
          '<div>· 返回主菜单：带着当前结局记录回到界门入口。</div>',
          '<div>· 回到地图：继续用当前角色探索支线、门派和其它结局。</div>',
          '<div>· 游戏内公告会保留所有版本更新记录，结局页也可通过右侧抽屉打开。</div>',
        '</div>',
        '<div class="btn-row">',
          '<button class="btn primary" id="restart-run">返回主菜单</button>',
          '<button class="btn" id="back-map">回到地图</button>',
        '</div>',
      '</div>'
    ].join('');

    var right = G.UI.Panel({ title: '通关情报', subtitle: '结局说明 / 后续建议', className: 'sidebar-panel hub-side-panel' });
    right.body.innerHTML = [
      '<div class="quest-card line-card">',
        '<div class="window-kicker">结局说明</div>',
        '<h3>' + ending.title + '</h3>',
        '<p>' + ending.desc + '</p>',
      '</div>',
      '<div class="feature-card compact line-card">',
        '<div class="feature-kicker">推荐后续</div>',
        '<div class="bullet-list">',
          '<div>· 若想换出身和天赋组合，返回主菜单重新建档即可。</div>',
          '<div>· 若想补齐结局，回到地图继续推进隐藏事件和门派路线。</div>',
          '<div>· 公告中会记录每个版本的系统改动和内容新增。</div>',
        '</div>',
      '</div>',
      '<div class="feature-card compact line-card">',
        '<div class="feature-kicker">当前记录</div>',
        '<div class="identity-line-list">',
          '<div class="base-attr-item"><span>当前地点</span><strong>' + (player.currentNodeId || '--') + '</strong></div>',
          '<div class="base-attr-item"><span>已学武学</span><strong>' + ((player.learnedSkills || []).length) + '</strong></div>',
          '<div class="base-attr-item"><span>装备栏</span><strong>' + Object.keys(player.equipment || {}).length + ' 槽</strong></div>',
        '</div>',
      '</div>'
    ].join('');

    wrap.appendChild(left);
    wrap.appendChild(main);
    wrap.appendChild(right);
    layer.appendChild(wrap);
    layer.appendChild(G.UI.GameWindows.buildSideDrawer('left'));
    layer.appendChild(G.UI.GameWindows.buildSideDrawer('right'));

    var modalRoot = document.createElement('div');
    modalRoot.id = 'hub-modal-root';
    layer.appendChild(modalRoot);

    var layerRoot = document.getElementById('ui-root');
    layerRoot.innerHTML = '';
    layerRoot.appendChild(layer);

    main.body.querySelector('#restart-run').addEventListener('click', function () {
      player.pendingResult = null;
      G.Managers.SaveManager.save({ silent: true });
      G.Core.Router.go(G.Core.Config.SCENES.MENU);
    });
    main.body.querySelector('#back-map').addEventListener('click', function () {
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
      this.cameras.main.setBackgroundColor('#070d16');
      this.add.rectangle(640, 380, 1280, 760, 0x070d16, 1);
      this.add.line(88, 120, 0, 0, 1112, 0, 0x4f6b95, 0.16).setOrigin(0, 0);
      this.add.line(88, 652, 0, 0, 1112, 0, 0x4f6b95, 0.10).setOrigin(0, 0);
      this.add.triangle(220, 690, 0, 760, 220, 240, 430, 760, 0x111723, 1);
      this.add.triangle(610, 646, 340, 760, 610, 240, 900, 760, 0x151d2a, 1);
      this.add.triangle(1000, 700, 760, 760, 1000, 310, 1250, 760, 0x182332, 1);
      renderEnding();
    }
  });
})(window.TransmigratorGame);
