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

  function renderBattle() {
    var player = G.Managers.PlayerManager.getPlayer();
    var pending = player.pendingBattle;
    if (!pending) {
      G.Core.Router.go(G.Core.Config.SCENES.WORLD_MAP);
      return;
    }
    var battle = G.Managers.BattleManager.getBattle() || G.Managers.BattleManager.startBattle(pending.enemyId);
    var enemy = battle.enemy;

    var layer = document.createElement('div');
    layer.className = 'ui-layer';
    layer.appendChild(G.UI.HUD.buildTopBar());

    var wrap = document.createElement('div');
    wrap.className = 'page-grid';

    var left = G.UI.Panel({ title: '交锋', subtitle: enemy.name, className: 'main-panel', strong: true });
    left.body.innerHTML = [
      '<div class="split">',
        '<div class="node-card"><h3>我方</h3><p class="muted">' + player.name + '</p><div id="player-bars"></div></div>',
        '<div class="node-card"><h3>敌方</h3><p class="muted">' + enemy.name + '</p><div id="enemy-bars"></div></div>',
      '</div>',
      '<div class="log-box" id="battle-log"></div>',
      '<div class="action-list" id="battle-actions"></div>'
    ].join('');

    var right = G.UI.Panel({ title: '战场情报', className: 'sidebar-panel' });
    right.body.innerHTML = [
      '<div class="kv-grid">',
        '<div class="kv-item"><strong>敌人类型</strong><div class="muted">' + enemy.type + '</div></div>',
        '<div class="kv-item"><strong>攻击</strong><div class="muted">' + enemy.attack + '</div></div>',
        '<div class="kv-item"><strong>防御</strong><div class="muted">' + enemy.defense + '</div></div>',
        '<div class="kv-item"><strong>奖励</strong><div class="muted">银两 ' + enemy.rewards.money + ' / 经验 ' + enemy.rewards.exp + '</div></div>',
      '</div>',
      '<div class="feature-card compact"><div class="feature-kicker">恢复道具</div><p>绷带 x ' + ((player.inventory || []).filter(function (id) { return id === 'bandage'; }).length) + ' · 回气散 x ' + ((player.inventory || []).filter(function (id) { return id === 'herbal_pill'; }).length) + '</p></div>'
    ].join('');

    wrap.appendChild(left);
    wrap.appendChild(right);
    layer.appendChild(wrap);

    var uiRoot = document.getElementById('ui-root');
    uiRoot.innerHTML = '';
    uiRoot.appendChild(layer);

    left.body.querySelector('#player-bars').appendChild(G.UI.HUD.buildStatBars(player));
    left.body.querySelector('#enemy-bars').appendChild(G.UI.HUD.buildStatBars(enemy));

    var logRoot = left.body.querySelector('#battle-log');
    logRoot.innerHTML = battle.logs.map(function (line) { return '<div>' + line + '</div>'; }).join('');
    logRoot.scrollTop = logRoot.scrollHeight;

    var actionRoot = left.body.querySelector('#battle-actions');
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
      this.cameras.main.setBackgroundColor('#120b12');
      renderBattle();
    },
    shutdown: function () {
      G.Managers.BattleManager.clear();
    }
  });
})(window.TransmigratorGame);
