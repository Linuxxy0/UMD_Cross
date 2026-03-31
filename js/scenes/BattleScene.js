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

  function unitCard(title, name, statsHtml, barsNode) {
    var card = document.createElement('section');
    card.className = 'panel shell-panel';
    card.innerHTML = [
      '<div class="panel-header"><h2>' + title + '</h2><span class="muted">' + name + '</span></div>',
      '<div class="panel-body">',
        '<div class="identity-line-list">' + statsHtml + '</div>',
        '<div class="battle-bars-slot"></div>',
      '</div>'
    ].join('');
    card.querySelector('.battle-bars-slot').appendChild(barsNode);
    return card;
  }

  function renderBattle() {
    var player = G.Managers.PlayerManager.getPlayer();
    var pending = player && player.pendingBattle;
    if (!player || !pending) {
      G.Core.Router.go(G.Core.Config.SCENES.WORLD_MAP);
      return;
    }

    G.Managers.PlayerManager.applyDerivedStats();
    var battle = G.Managers.BattleManager.getBattle() || G.Managers.BattleManager.startBattle(pending.enemyId);
    var enemy = battle.enemy;
    var node = G.Managers.WorldManager.getCurrentNode() || { name: '未知地点' };

    var shell = G.UI.Shell.create({
      player: player,
      node: node,
      sceneClass: 'scene-battle-shell',
      statusMeta: (player.factionName || '江湖散人') + ' / 战斗中',
      worldLine: '大晟江湖 / ' + node.name,
      timeLine: '战斗 / ' + enemy.name + ' / ' + (battle.finished ? '已结束' : '进行中'),
      leftHTML: G.UI.Shell.playerRailHtml(player, { locationLabel: node.name }),
      centerHTML: [
        '<section class="panel shell-panel">',
          '<div class="panel-header"><h2>战斗终端</h2><span class="muted">' + enemy.name + '</span></div>',
          '<div class="panel-body shell-narrative">',
            '<div class="story-block">',
              '<div class="window-kicker">战斗状态</div>',
              '<div class="narrative-title">目标：' + enemy.name + '</div>',
              '<div class="narrative-copy">先观察双方状态与战斗记录，再决定攻击、施展武学、防守或使用道具。</div>',
            '</div>',
            '<div class="battle-vs-grid" id="battle-vs-grid"></div>',
            '<section class="panel shell-panel">',
              '<div class="panel-header"><h2>战斗记录</h2><span class="muted">回合记录</span></div>',
              '<div class="panel-body"><div class="log-box" id="battle-log"></div></div>',
            '</section>',
            '<section class="panel shell-panel">',
              '<div class="panel-header"><h2>战斗命令</h2><span class="muted">本回合</span></div>',
              '<div class="panel-body"><div class="btn-row" id="battle-actions"></div></div>',
            '</section>',
          '</div>',
        '</section>'
      ].join(''),
      rightHTML: [
        '<section class="panel shell-panel rail-section">',
          '<div class="panel-header"><h2>敌方档案</h2><span class="muted">即时</span></div>',
          '<div class="panel-body">',
            '<div class="rail-stat-row"><span>名称</span><span>' + enemy.name + '</span></div>',
            '<div class="rail-stat-row"><span>类型</span><span>' + enemy.type + '</span></div>',
            '<div class="rail-stat-row"><span>经验</span><span>' + enemy.rewards.exp + '</span></div>',
            '<div class="rail-stat-row"><span>银两</span><span>' + enemy.rewards.money + '</span></div>',
          '</div>',
        '</section>',
        '<section class="panel shell-panel rail-section">',
          '<div class="panel-header"><h2>行动建议</h2><span class="muted">建议</span></div>',
          '<div class="panel-body bullet-list">',
            '<div>· 先用普通攻击试探，再决定是否交内力。</div>',
            '<div>· 对高攻敌人，防守能显著降低风险。</div>',
            '<div>· 败北会直接导向败北结局或失败分支。</div>',
          '</div>',
        '</section>'
      ].join('')
    });

    shell.mount();

    var vsGrid = shell.center.querySelector('#battle-vs-grid');
    vsGrid.appendChild(unitCard('我方', player.name,
      '<div class="base-attr-item"><span>攻击</span><strong>' + (player.attackPower || 0) + '</strong></div>' +
      '<div class="base-attr-item"><span>防御</span><strong>' + (player.defensePower || 0) + '</strong></div>' +
      '<div class="base-attr-item"><span>速度</span><strong>' + (player.speedPower || 0) + '</strong></div>',
      G.UI.HUD.buildStatBars(player)
    ));
    vsGrid.appendChild(unitCard('敌方', enemy.name,
      '<div class="base-attr-item"><span>攻击</span><strong>' + enemy.attack + '</strong></div>' +
      '<div class="base-attr-item"><span>防御</span><strong>' + enemy.defense + '</strong></div>' +
      '<div class="base-attr-item"><span>等级</span><strong>' + enemy.level + '</strong></div>',
      G.UI.HUD.buildStatBars(enemy)
    ));

    var logRoot = shell.center.querySelector('#battle-log');
    logRoot.innerHTML = battle.logs.map(function (line) { return '<div>' + line + '</div>'; }).join('');
    logRoot.scrollTop = logRoot.scrollHeight;

    var actionRoot = shell.center.querySelector('#battle-actions');
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
        if (G.Managers.BattleManager.getBattle().finished) setTimeout(resolveBattleEnd, 300);
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
      this.cameras.main.setBackgroundColor('#111315');
      this.add.rectangle(640, 380, 1280, 760, 0x111315, 1);
      renderBattle();
    },
    shutdown: function () {
      G.Managers.BattleManager.clear();
    }
  });
})(window.TransmigratorGame);
