(function (G) {
  function quickRumor(node) {
    var rumors = {
      qingshi_town: '茶摊上又有人提到黑风山夜里发光，掌柜似乎知道得更多。',
      heifeng_outskirts: '山道上新添了脚印，像是有外来势力先你一步进山。',
      luochuan_city: '黑市里有人在收残图，洛川的水比表面更深。',
      tianyue_gate: '山门今日戒备森严，像是在等某个会带来异变的人。',
      yaowang_outer: '谷中怪病并非寻常毒伤，药王门人正悄悄寻找源头。'
    };
    return rumors[node.id] || '江湖风声未定，下一次探索也许会带来更接近界门的线索。';
  }

  function quickbarHtml(player) {
    var quickbar = G.Managers.PlayerManager.getQuickbar().map(function (id, index) {
      var skill = id ? ((G.Data.skills && G.Data.skills.skills) || []).find(function (entry) { return entry.id === id; }) : null;
      return [
        '<button class="quickbar-slot ' + (skill ? (skill.type === 'inner' ? 'quality-rare' : 'quality-uncommon') : 'quality-common') + '">',
          '<span class="quickbar-index">' + (index + 1) + '</span>',
          '<span class="quickbar-name">' + (skill ? skill.name : '空槽') + '</span>',
        '</button>'
      ].join('');
    }).join('');
    return '<div class="skill-quickbar-grid">' + quickbar + '</div>';
  }

  function renderHub() {
    var player = G.Managers.PlayerManager.getPlayer();
    if (!player) {
      G.Core.Router.go(G.Core.Config.SCENES.CREATE_ROLE);
      return;
    }
    G.Managers.PlayerManager.applyDerivedStats();

    var current = G.Managers.WorldManager.getCurrentNode();
    var destinations = G.Managers.WorldManager.getAvailableDestinations();
    var merchantPool = G.Managers.WorldManager.getMerchantPoolForCurrentNode();
    var settlementEvent = G.Managers.WorldManager.getSettlementEventForCurrentNode();
    var rep = player.factionReputation || {};

    var shell = G.UI.Shell.create({
      player: player,
      node: current,
      sceneClass: 'scene-hub-shell',
      statusMeta: (player.factionName || '江湖散人') + ' / Lv.' + player.level,
      worldLine: '大晟江湖 / ' + current.name,
      timeLine: '主场景 / ' + G.Worlds.WuxiaRules.getNodeThemeLabel(current) + ' / 危险 ' + current.danger,
      leftHTML: G.UI.Shell.playerRailHtml(player, { locationLabel: current.name }),
      centerHTML: [
        '<section class="panel shell-panel">',
          '<div class="panel-header"><h2>地点叙事</h2><span class="muted">当前正在发生</span></div>',
          '<div class="panel-body shell-narrative">',
            '<div class="story-block">',
              '<div class="window-kicker">' + G.Worlds.WuxiaRules.getNodeThemeLabel(current) + '</div>',
              '<div class="narrative-title">' + current.name + '</div>',
              '<div class="narrative-copy">' + current.desc + '</div>',
            '</div>',
            '<section class="panel shell-panel">',
              '<div class="panel-header"><h2>可执行命令</h2><span class="muted">命令列表</span></div>',
              '<div class="panel-body">',
                '<div class="choice-list">',
                  '<button class="choice-btn primary" id="hub-explore-btn">[1] 探索当前区域</button>',
                  '<button class="choice-btn" id="hub-story-btn">[2] 接触此地势力</button>',
                  '<button class="choice-btn" id="hub-shop-btn">[3] 打开当地商店</button>',
                  '<button class="choice-btn" id="hub-rest-btn">[4] 原地调息</button>',
                  '<button class="choice-btn" id="hub-save-btn">[5] 记录当前进度</button>',
                '</div>',
              '</div>',
            '</section>',
            '<section class="panel shell-panel">',
              '<div class="panel-header"><h2>路径与去向</h2><span class="muted">已解锁</span></div>',
              '<div class="panel-body"><div class="route-grid" id="route-grid"></div></div>',
            '</section>',
            '<section class="panel shell-panel">',
              '<div class="panel-header"><h2>已挂载技能</h2><span class="muted">战斗命令栏</span></div>',
              '<div class="panel-body">' + quickbarHtml(player) + '</div>',
            '</section>',
          '</div>',
        '</section>'
      ].join(''),
      rightHTML: [
        '<section class="panel shell-panel rail-section">',
          '<div class="panel-header"><h2>主线任务</h2><span class="muted">界门</span></div>',
          '<div class="panel-body">',
            '<div class="story-block">追索破庙、黑风山与洛川城之间的残片线索，确认这次穿越的真正起点。</div>',
          '</div>',
        '</section>',
        '<section class="panel shell-panel rail-section">',
          '<div class="panel-header"><h2>风闻 / 线索</h2><span class="muted">本地消息</span></div>',
          '<div class="panel-body">',
            '<div class="story-block">' + quickRumor(current) + '</div>',
            '<div class="rail-stat-row"><span>可去地点</span><span>' + destinations.length + '</span></div>',
            '<div class="rail-stat-row"><span>探索进度</span><span>' + (player.visitedNodes || []).length + '</span></div>',
          '</div>',
        '</section>',
        '<section class="panel shell-panel rail-section">',
          '<div class="panel-header"><h2>关系 / 印象值</h2><span class="muted">印象值</span></div>',
          '<div class="panel-body">',
            '<div class="rail-stat-row"><span>天岳</span><span>' + (rep.tianyue || 0) + '</span></div>',
            '<div class="rail-stat-row"><span>玄衣</span><span>' + (rep.xuanyi || 0) + '</span></div>',
            '<div class="rail-stat-row"><span>药王</span><span>' + (rep.yaowang || 0) + '</span></div>',
          '</div>',
        '</section>'
      ].join('')
    });

    shell.mount();
    G.State.renderHub = renderHub;

    var routeGrid = shell.center.querySelector('#route-grid');
    destinations.forEach(function (node) {
      var button = document.createElement('button');
      button.className = 'route-link';
      button.innerHTML = '<strong>' + node.name + '</strong><br><span class="muted">' + G.Worlds.WuxiaRules.getNodeThemeLabel(node) + ' / 危险 ' + node.danger + '</span>';
      button.addEventListener('click', function () {
        G.Managers.WorldManager.travelTo(node.id);
        G.Managers.SaveManager.save({ silent: true });
        G.UI.HUD.showToast('已前往：' + node.name, 'success');
        renderHub();
      });
      routeGrid.appendChild(button);
    });

    shell.center.querySelector('#hub-explore-btn').addEventListener('click', function () {
      var evt = G.Managers.EventManager.getExploreEventForNode(player.currentNodeId);
      if (!evt) {
        G.UI.HUD.showToast('这里暂时没有新的故事。', 'warning');
        return;
      }
      G.Managers.EventManager.setCurrentEvent(evt.id);
      G.Core.Router.go(G.Core.Config.SCENES.EVENT);
    });

    shell.center.querySelector('#hub-shop-btn').addEventListener('click', function () {
      if (!merchantPool.length) {
        G.UI.HUD.showToast('此地没有固定商人。', 'warning');
        return;
      }
      G.UI.GameWindows.open('shop');
    });

    shell.center.querySelector('#hub-story-btn').addEventListener('click', function () {
      if (!settlementEvent) {
        G.UI.HUD.showToast('此地暂时没有可接触的势力剧情。', 'warning');
        return;
      }
      G.Managers.EventManager.setCurrentEvent(settlementEvent.id);
      G.Core.Router.go(G.Core.Config.SCENES.EVENT);
    });

    shell.center.querySelector('#hub-rest-btn').addEventListener('click', function () {
      var canRest = G.Worlds.WuxiaRules.canEnterSettlement(current);
      if (!canRest) G.Managers.PlayerManager.heal(10, 8);
      else {
        if (player.money >= 6) player.money -= 6;
        G.Managers.PlayerManager.heal(999, 999);
      }
      G.Managers.SaveManager.save({ silent: true });
      G.UI.HUD.showToast(canRest ? '你整理行囊，恢复了状态。' : '你勉强稳住内息。', 'success');
      renderHub();
    });

    shell.center.querySelector('#hub-save-btn').addEventListener('click', function () {
      G.Managers.SaveManager.save();
    });
  }

  G.Scenes.WorldMapScene = new Phaser.Class({
    Extends: Phaser.Scene,
    initialize: function WorldMapScene() {
      Phaser.Scene.call(this, { key: G.Core.Config.SCENES.WORLD_MAP });
    },
    create: function () {
      this.cameras.main.setBackgroundColor('#111315');
      this.add.rectangle(640, 380, 1280, 760, 0x111315, 1);
      renderHub();
    }
  });
})(window.TransmigratorGame);
