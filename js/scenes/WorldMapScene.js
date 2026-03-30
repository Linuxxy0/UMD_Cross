(function (G) {
  function quickRumor(node) {
    var rumors = {
      qingshi_town: '青石镇的说书人反复提到“门外来客”。客栈、茶摊与旧镖局都可能藏着新的线索。',
      blackwind_hill: '黑风山的风声里混着兵刃摩擦声，盗匪与异物碎片都在盯着闯入者。',
      luochuan_road: '洛川古道上消息最杂，既有正派弟子，也有夜行者与黑市商贩。',
      night_market: '夜市渡口灯影摇晃，越是低声说话的人，越可能知道穿越者的秘密。',
      tianyue_gate: '天岳山门讲究规矩，你若表现得太像“异乡人”，反而更容易被注意。',
      yaowang_outer: '药王谷外谷最关注经脉异状，或许能从这里查到界门的影响。',
      broken_temple: '破庙是所有线索的起点，也是穿越异象最浓的地方，回去之前请先做好准备。'
    };
    return rumors[node.id] || '江湖风声未定，或许下一次探索就会引出真正的线索。';
  }

  function renderHub() {
    var player = G.Managers.PlayerManager.getPlayer();
    if (!player) {
      G.Core.Router.go(G.Core.Config.SCENES.MENU);
      return;
    }
    G.Managers.PlayerManager.applyDerivedStats();

    var current = G.Managers.WorldManager.getCurrentNode();
    var destinations = G.Managers.WorldManager.getAvailableDestinations();
    var merchantPool = G.Managers.WorldManager.getMerchantPoolForCurrentNode();
    var settlementEvent = G.Managers.WorldManager.getSettlementEventForCurrentNode();
    var equipment = G.Managers.PlayerManager.getEquipmentDetail();
    var breakdown = G.Managers.PlayerManager.getAttributeBreakdown();

    var layer = document.createElement('div');
    layer.className = 'ui-layer hub-screen';
    var topBar = G.UI.HUD.buildTopBar();
    topBar.id = 'hub-top-bar';
    layer.appendChild(topBar);
    layer.appendChild(G.UI.GameWindows.buildSystemCorner());

    var wrap = document.createElement('div');
    wrap.className = 'hub-layout';

    var main = G.UI.Panel({ title: current.name, subtitle: '武侠世界 · ' + G.Worlds.WuxiaRules.getNodeThemeLabel(current), className: 'main-panel hub-main-panel', strong: true });
    main.body.innerHTML = [
      '<div class="hub-viewport scene-' + current.type + '">',
        '<div class="hub-viewport-content">',
          '<div class="window-kicker">当前主场景</div>',
          '<h3>' + current.name + '</h3>',
          '<p>' + current.desc + '</p>',
          '<div class="tag-list">',
            '<span class="tag">危险 ' + current.danger + '</span>',
            '<span class="tag">可达地点 ' + destinations.length + '</span>',
            '<span class="tag">已探索 ' + (player.visitedNodes || []).length + '</span>',
          '</div>',
        '</div>',
      '</div>',
      '<div class="hub-action-row">',
        '<button class="btn primary" id="hub-explore-btn">探索当前区域</button>',
        '<button class="btn" id="hub-shop-btn">打开商城</button>',
        '<button class="btn" id="hub-story-btn">接触此地势力</button>',
        '<button class="btn" id="hub-rest-btn">就地调息</button>',
        '<button class="btn" id="hub-save-btn">保存进度</button>',
      '</div>',
      '<div class="route-panel">',
        '<div class="panel-header slim"><h3>附近可达地点</h3><span class="muted">点击前往或在地图窗查看详情</span></div>',
        '<div class="route-grid" id="route-grid"></div>',
      '</div>'
    ].join('');

    var side = G.UI.Panel({ title: '江湖情报', subtitle: '任务 / 属性 / 装备', className: 'sidebar-panel hub-side-panel' });
    var rep = player.factionReputation || {};
    side.body.innerHTML = [
      '<div class="quest-card">',
        '<div class="window-kicker">当前目标</div>',
        '<h3>追索界门</h3>',
        '<p>沿着破庙、夜市与门派情报继续推进，找出这次穿越的真正源头。</p>',
      '</div>',
      '<div class="feature-card compact">',
        '<div class="feature-kicker">风闻</div>',
        '<p>' + quickRumor(current) + '</p>',
      '</div>',
      '<div class="kv-grid compact-grid">',
        '<div class="kv-item"><strong>攻击</strong><div class="muted">' + breakdown.final.attack + '</div></div>',
        '<div class="kv-item"><strong>防御</strong><div class="muted">' + breakdown.final.defense + '</div></div>',
        '<div class="kv-item"><strong>武器</strong><div class="muted">' + (equipment.weapon ? equipment.weapon.name : '未装备') + '</div></div>',
        '<div class="kv-item"><strong>饰品</strong><div class="muted">' + (equipment.accessory ? equipment.accessory.name : '未装备') + '</div></div>',
      '</div>',
      '<div class="feature-card compact">',
        '<div class="feature-kicker">势力声望</div>',
        '<p>天岳 ' + (rep.tianyue || 0) + ' · 玄衣 ' + (rep.xuanyi || 0) + ' · 药王 ' + (rep.yaowang || 0) + '</p>',
      '</div>',
      '<div class="feature-card compact">',
        '<div class="feature-kicker">已学武学</div>',
        '<div class="tag-list">' + (player.learnedSkills || []).map(function (id) {
          var skill = ((G.Data.skills && G.Data.skills.skills) || []).find(function (entry) { return entry.id === id; });
          return '<span class="tag">' + (skill ? skill.name : id) + '</span>';
        }).join('') + '</div>',
      '</div>'
    ].join('');
    side.body.appendChild(G.UI.HUD.buildStatBars(player));

    wrap.appendChild(main);
    wrap.appendChild(side);
    layer.appendChild(wrap);

    var toolbar = G.UI.GameWindows.buildToolbar();
    layer.appendChild(toolbar);

    var modalRoot = document.createElement('div');
    modalRoot.id = 'hub-modal-root';
    layer.appendChild(modalRoot);

    var uiRoot = document.getElementById('ui-root');
    uiRoot.innerHTML = '';
    uiRoot.appendChild(layer);

    G.State.renderHub = renderHub;

    var routeGrid = main.body.querySelector('#route-grid');
    destinations.forEach(function (node) {
      var card = document.createElement('div');
      card.className = 'route-card';
      card.innerHTML = [
        '<div class="route-card-top">',
          '<strong>' + node.name + '</strong>',
          '<span class="tag">危 ' + node.danger + '</span>',
        '</div>',
        '<p>' + node.desc + '</p>',
        '<div class="tag-list"><span class="tag">' + G.Worlds.WuxiaRules.getNodeThemeLabel(node) + '</span></div>'
      ].join('');
      var goBtn = document.createElement('button');
      goBtn.className = 'btn';
      goBtn.textContent = '前往';
      goBtn.addEventListener('click', function () {
        G.Managers.WorldManager.travelTo(node.id);
        G.Managers.SaveManager.save({ silent: true });
        G.UI.HUD.showToast('已前往：' + node.name, 'success');
        renderHub();
      });
      card.appendChild(goBtn);
      routeGrid.appendChild(card);
    });

    main.body.querySelector('#hub-explore-btn').addEventListener('click', function () {
      var evt = G.Managers.EventManager.getExploreEventForNode(player.currentNodeId);
      if (!evt) {
        G.UI.HUD.showToast('这里暂时没有新的故事。', 'warning');
        return;
      }
      G.Managers.EventManager.setCurrentEvent(evt.id);
      G.Core.Router.go(G.Core.Config.SCENES.EVENT);
    });

    var shopBtn = main.body.querySelector('#hub-shop-btn');
    shopBtn.disabled = !merchantPool.length;
    shopBtn.addEventListener('click', function () {
      if (!merchantPool.length) {
        G.UI.HUD.showToast('此地没有固定商人。', 'warning');
        return;
      }
      G.UI.GameWindows.open('shop');
    });

    var storyBtn = main.body.querySelector('#hub-story-btn');
    storyBtn.disabled = !settlementEvent;
    storyBtn.addEventListener('click', function () {
      if (!settlementEvent) {
        G.UI.HUD.showToast('此地暂时没有可接触的势力剧情。', 'warning');
        return;
      }
      G.Managers.EventManager.setCurrentEvent(settlementEvent.id);
      G.Core.Router.go(G.Core.Config.SCENES.EVENT);
    });

    main.body.querySelector('#hub-rest-btn').addEventListener('click', function () {
      var canRest = G.Worlds.WuxiaRules.canEnterSettlement(current);
      if (!canRest) {
        G.UI.HUD.showToast('野外只能短暂调息，无法完全修整。', 'warning');
        G.Managers.PlayerManager.heal(10, 8);
      } else {
        if (player.money >= 6) player.money -= 6;
        G.Managers.PlayerManager.heal(999, 999);
      }
      G.Managers.SaveManager.save({ silent: true });
      G.UI.HUD.showToast(canRest ? '你整理行囊，恢复了状态。' : '你勉强稳住内息。', 'success');
      renderHub();
    });

    main.body.querySelector('#hub-save-btn').addEventListener('click', function () {
      G.Managers.SaveManager.save();
    });
  }

  G.Scenes.WorldMapScene = new Phaser.Class({
    Extends: Phaser.Scene,
    initialize: function WorldMapScene() {
      Phaser.Scene.call(this, { key: G.Core.Config.SCENES.WORLD_MAP });
    },
    create: function () {
      this.cameras.main.setBackgroundColor('#07101a');
      this.add.rectangle(640, 380, 1280, 760, 0x08101a, 1);
      this.add.circle(1130, 126, 76, 0xf5d17e, 0.08);
      this.add.triangle(240, 600, 40, 760, 240, 260, 450, 760, 0x101f31, 1);
      this.add.triangle(600, 640, 320, 760, 600, 210, 860, 760, 0x0c1a2a, 1);
      this.add.triangle(980, 620, 740, 760, 980, 280, 1220, 760, 0x13273c, 1);
      renderHub();
    }
  });
})(window.TransmigratorGame);
