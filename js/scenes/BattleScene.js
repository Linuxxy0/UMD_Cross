(function (G) {
  function resolveBattleEnd() {
    var player = G.Managers.PlayerManager.getPlayer();
    var pending = player.pendingBattle || null;
    var result = player.pendingResult || null;
    if (!result) return;

    if (result.battleResult === 'win') {
      if (pending && pending.onWinEventId) {
        G.Managers.EventManager.setCurrentEvent(pending.onWinEventId);
        player.pendingBattle = null;
        player.pendingResult = null;
        G.Managers.BattleManager.clear();
        G.Managers.SaveManager.save({ silent: true });
        G.Core.Router.go(G.Core.Config.SCENES.EVENT);
        return;
      }
      player.pendingBattle = null;
      player.pendingResult = null;
      G.Managers.BattleManager.clear();
      G.Managers.SaveManager.save({ silent: true });
      G.Core.Router.go(G.Core.Config.SCENES.WORLD_MAP);
      return;
    }

    if (result.battleResult === 'lose') {
      player.pendingResult = { endingId: (pending && pending.onLoseEndingId) || 'ending_defeat' };
      G.Managers.BattleManager.clear();
      G.Core.Router.go(G.Core.Config.SCENES.ENDING);
    }
  }

  function makeUnitCard(root, title, name, barsNode, extraRows) {
    var card = document.createElement('section');
    card.className = 'combat-unit-panel line-card';
    card.innerHTML = [
      '<div class="window-kicker">' + title + '</div>',
      '<h3>' + name + '</h3>',
      '<div class="identity-line-list">' + extraRows + '</div>',
      '<div class="battle-bars-slot"></div>'
    ].join('');
    card.querySelector('.battle-bars-slot').appendChild(barsNode);
    root.appendChild(card);
  }

  function renderBattle() {
    var player = G.Managers.PlayerManager.getPlayer();
    var pending = player.pendingBattle;
    if (!pending) {
      G.Core.Router.go(G.Core.Config.SCENES.WORLD_MAP);
      return;
    }

    G.Managers.PlayerManager.applyDerivedStats();
    var battle = G.Managers.BattleManager.getBattle() || G.Managers.BattleManager.startBattle(pending.enemyId);
    var enemy = battle.enemy;

    var layer = document.createElement('div');
    layer.className = 'ui-layer scene-shell';

    var wrap = document.createElement('div');
    wrap.className = 'hub-layout umd-layout scene-layout';

    var left = document.createElement('aside');
    left.className = 'hud-column hud-column-left';
    left.appendChild(G.UI.HUD.buildTopBar());
    left.appendChild(G.UI.HUD.buildBaseStatsPanel());

    var battleStatePanel = G.UI.Panel({ title: '战斗资源', subtitle: '即时补给', className: 'sidebar-panel equipment-brief-panel' });
    battleStatePanel.body.innerHTML = [
      '<div class="identity-line-list">',
        '<div class="base-attr-item"><span>绷带</span><strong>' + G.Managers.PlayerManager.getItemCount('bandage') + '</strong></div>',
        '<div class="base-attr-item"><span>回气散</span><strong>' + G.Managers.PlayerManager.getItemCount('herbal_pill') + '</strong></div>',
        '<div class="base-attr-item"><span>当前战况</span><strong>' + (battle.finished ? (battle.result === 'win' ? '已胜' : '已败') : '交战中') + '</strong></div>',
      '</div>',
      '<div class="muted attr-footnote">战斗页也沿用 UMD 线条界面，左右侧三角菜单与人物窗口依然可用。</div>'
    ].join('');
    left.appendChild(battleStatePanel);

    var main = G.UI.Panel({ title: '交锋', subtitle: enemy.name + ' / 战斗界面', className: 'main-panel hub-main-panel', strong: true });
    main.body.innerHTML = [
      '<div class="scene-banner line-card battle-banner">',
        '<div class="scene-line-label">UMD 战斗界面</div>',
        '<h3>正面交锋：' + enemy.name + '</h3>',
        '<p>观察敌方属性、处理战斗日志，再选择普通攻击、武学、防守或使用道具。</p>',
        '<div class="tag-list">',
          '<span class="tag">敌型 ' + enemy.type + '</span>',
          '<span class="tag">攻击 ' + enemy.attack + '</span>',
          '<span class="tag">防御 ' + enemy.defense + '</span>',
        '</div>',
      '</div>',
      '<div class="battle-vs-grid" id="battle-vs-grid"></div>',
      '<div class="option-panel">',
        '<div class="panel-header slim"><h3>战斗日志</h3><span class="muted">回合记录</span></div>',
        '<div class="log-box battle-log-box" id="battle-log"></div>',
      '</div>',
      '<div class="option-panel">',
        '<div class="panel-header slim"><h3>战斗操作</h3><span class="muted">点击即时生效</span></div>',
        '<div class="battle-action-grid" id="battle-actions"></div>',
      '</div>'
    ].join('');

    var right = G.UI.Panel({ title: '战场情报', subtitle: '敌方信息 / 提示', className: 'sidebar-panel hub-side-panel' });
    right.body.innerHTML = [
      '<div class="quest-card line-card">',
        '<div class="window-kicker">敌方概要</div>',
        '<div class="identity-line-list">',
          '<div class="base-attr-item"><span>名称</span><strong>' + enemy.name + '</strong></div>',
          '<div class="base-attr-item"><span>奖励</span><strong>银两 ' + enemy.rewards.money + '</strong></div>',
          '<div class="base-attr-item"><span>经验</span><strong>' + enemy.rewards.exp + '</strong></div>',
        '</div>',
      '</div>',
      '<div class="feature-card compact line-card">',
        '<div class="feature-kicker">作战提示</div>',
        '<div class="bullet-list">',
          '<div>· 普攻更稳，适合试探敌方回合节奏。</div>',
          '<div>· 武学消耗内力，但能更快压低敌方血线。</div>',
          '<div>· 资源不足时，优先使用补给道具稳住局面。</div>',
        '</div>',
      '</div>',
      '<div class="feature-card compact line-card">',
        '<div class="feature-kicker">结果流向</div>',
        '<div class="bullet-list">',
          '<div>· 战斗胜利后可能返回地图，也可能直接进入后续事件。</div>',
          '<div>· 战斗失败会跳转至对应结局或败北分支。</div>',
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

    var uiRoot = document.getElementById('ui-root');
    uiRoot.innerHTML = '';
    uiRoot.appendChild(layer);

    var vsGrid = main.body.querySelector('#battle-vs-grid');
    makeUnitCard(
      vsGrid,
      '我方',
      player.name,
      G.UI.HUD.buildStatBars(player),
      '<div class="base-attr-item"><span>攻击</span><strong>' + (player.attackPower || 0) + '</strong></div>' +
      '<div class="base-attr-item"><span>防御</span><strong>' + (player.defensePower || 0) + '</strong></div>' +
      '<div class="base-attr-item"><span>速度</span><strong>' + (player.speedPower || 0) + '</strong></div>'
    );
    makeUnitCard(
      vsGrid,
      '敌方',
      enemy.name,
      G.UI.HUD.buildStatBars(enemy),
      '<div class="base-attr-item"><span>攻击</span><strong>' + enemy.attack + '</strong></div>' +
      '<div class="base-attr-item"><span>防御</span><strong>' + enemy.defense + '</strong></div>' +
      '<div class="base-attr-item"><span>类型</span><strong>' + enemy.type + '</strong></div>'
    );

    var logRoot = main.body.querySelector('#battle-log');
    logRoot.innerHTML = battle.logs.map(function (line) { return '<div>' + line + '</div>'; }).join('');
    logRoot.scrollTop = logRoot.scrollHeight;

    var actionRoot = main.body.querySelector('#battle-actions');
    [
      { label: '普通攻击', className: 'btn primary', handler: function () { G.Managers.BattleManager.playerAttack(); } },
      { label: '施展武学', className: 'btn', handler: function () { G.Managers.BattleManager.playerSkill(); } },
      { label: '防守', className: 'btn', handler: function () { G.Managers.BattleManager.playerDefend(); } },
      { label: '使用道具', className: 'btn', handler: function () { G.Managers.BattleManager.playerUseItem(); } }
    ].forEach(function (action) {
      var btn = document.createElement('button');
      btn.className = action.className;
      btn.textContent = action.label;
      btn.disabled = battle.finished;
      btn.addEventListener('click', function () {
        action.handler();
        G.Managers.SaveManager.save({ silent: true });
        if (G.Managers.BattleManager.getBattle().finished) {
          setTimeout(resolveBattleEnd, 300);
        }
        renderBattle();
      });
      actionRoot.appendChild(btn);
    });

    if (battle.finished) {
      var endBtn = document.createElement('button');
      endBtn.className = 'btn primary';
      endBtn.textContent = battle.result === 'win' ? '继续' : '接受结局';
      endBtn.addEventListener('click', resolveBattleEnd);
      actionRoot.appendChild(endBtn);
    }
  }

  G.Scenes.BattleScene = new Phaser.Class({
    Extends: Phaser.Scene,
    initialize: function BattleScene() {
      Phaser.Scene.call(this, { key: G.Core.Config.SCENES.BATTLE });
    },
    create: function () {
      this.cameras.main.setBackgroundColor('#0a0d14');
      this.add.rectangle(640, 380, 1280, 760, 0x0a0d14, 1);
      this.add.line(88, 122, 0, 0, 1112, 0, 0x8a4a56, 0.14).setOrigin(0, 0);
      this.add.line(88, 652, 0, 0, 1112, 0, 0x4f6b95, 0.10).setOrigin(0, 0);
      this.add.triangle(230, 690, 0, 760, 230, 250, 430, 760, 0x19131e, 1);
      this.add.triangle(620, 650, 330, 760, 620, 250, 900, 760, 0x211825, 1);
      this.add.triangle(1010, 700, 770, 760, 1010, 310, 1260, 760, 0x1a1520, 1);
      renderBattle();
    },
    shutdown: function () {
      G.Managers.BattleManager.clear();
    }
  });
})(window.TransmigratorGame);
