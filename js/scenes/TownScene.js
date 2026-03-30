(function (G) {
  function itemLabel(itemId) {
    var item = G.Managers.PlayerManager.getItemById(itemId);
    return item ? item.name : itemId;
  }

  function renderInventory(root, player) {
    root.innerHTML = '';
    var summary = G.Managers.PlayerManager.getInventorySummary();
    if (!summary.length) {
      root.innerHTML = '<div class="empty-tip">背包空空如也。</div>';
      return;
    }
    summary.forEach(function (entry) {
      var card = document.createElement('div');
      card.className = 'node-card';
      var item = entry.item || { name: entry.id, type: 'unknown', desc: '' };
      card.innerHTML = [
        '<h4>' + item.name + ' x' + entry.count + '</h4>',
        '<p class="muted">' + item.desc + '</p>',
        '<div class="tag-list"><span class="tag">' + item.type + '</span>' + (item.slot ? '<span class="tag">' + item.slot + '</span>' : '') + '</div>'
      ].join('');
      if (item.type === 'equipment') {
        var equipBtn = document.createElement('button');
        equipBtn.className = 'btn';
        equipBtn.textContent = '装备';
        equipBtn.addEventListener('click', function () {
          if (G.Managers.PlayerManager.equipItem(item.id)) {
            G.UI.HUD.showToast('已装备：' + item.name, 'success');
            G.Managers.SaveManager.save({ silent: true });
            renderTown();
          }
        });
        card.appendChild(equipBtn);
      }
      root.appendChild(card);
    });
  }

  function renderMerchant(root, merchantPool) {
    root.innerHTML = '';
    if (!merchantPool.length) {
      root.innerHTML = '<div class="empty-tip">此地没有固定商贩。</div>';
      return;
    }
    merchantPool.forEach(function (itemId) {
      var item = G.Managers.PlayerManager.getItemById(itemId);
      if (!item) return;
      var card = document.createElement('div');
      card.className = 'node-card';
      card.innerHTML = [
        '<h4>' + item.name + '</h4>',
        '<p class="muted">' + item.desc + '</p>',
        '<div class="tag-list"><span class="tag">' + item.type + '</span><span class="tag">' + item.price + ' 银两</span></div>'
      ].join('');
      var buyBtn = document.createElement('button');
      buyBtn.className = 'btn';
      buyBtn.textContent = '购买';
      buyBtn.addEventListener('click', function () {
        var result = G.Managers.PlayerManager.buyItem(item.id);
        if (!result.ok) {
          G.UI.HUD.showToast(result.message, 'warning');
          return;
        }
        G.UI.HUD.showToast('购入：' + item.name, 'success');
        G.Managers.SaveManager.save({ silent: true });
        renderTown();
      });
      card.appendChild(buyBtn);
      root.appendChild(card);
    });
  }

  function renderTown() {
    var player = G.Managers.PlayerManager.getPlayer();
    G.Managers.PlayerManager.applyDerivedStats();
    var node = G.Managers.WorldManager.getCurrentNode();
    var settlementEvent = G.Managers.WorldManager.getSettlementEventForCurrentNode();
    var merchantPool = G.Managers.WorldManager.getMerchantPoolForCurrentNode();

    var layer = document.createElement('div');
    layer.className = 'ui-layer';
    layer.appendChild(G.UI.HUD.buildTopBar());

    var wrap = document.createElement('div');
    wrap.className = 'page-grid';

    var left = G.UI.Panel({ title: node.name + ' · ' + G.Worlds.WuxiaRules.getNodeThemeLabel(node), className: 'main-panel', strong: true });
    left.body.innerHTML = [
      '<p>' + node.desc + '</p>',
      '<div class="btn-row">',
        '<button class="btn primary" id="inn-rest">修整（6 银两）</button>',
        '<button class="btn" id="rumor">打听消息</button>',
        (settlementEvent ? '<button class="btn" id="settlement-story">接触此地势力</button>' : ''),
        '<button class="btn" id="leave-town">返回地图</button>',
      '</div>',
      '<div class="log-box" id="town-log">这里是你暂时能停下脚步的地方。整理行囊、补充药物、接触势力，往往都能决定下一段江湖路。</div>',
      '<div class="split">',
        '<div><div class="panel-header"><h3>本地商贩</h3><span class="muted">购买装备与补给</span></div><div id="merchant-list"></div></div>',
        '<div><div class="panel-header"><h3>我的背包</h3><span class="muted">点击可装备</span></div><div id="inventory-list"></div></div>',
      '</div>'
    ].join('');

    var equip = G.Managers.PlayerManager.getEquipmentDetail();
    var right = G.UI.Panel({ title: '驻留状态', className: 'sidebar-panel' });
    right.body.innerHTML = [
      '<div class="kv-grid">',
        '<div class="kv-item"><strong>银两</strong><div class="muted">' + player.money + '</div></div>',
        '<div class="kv-item"><strong>门派</strong><div class="muted">' + player.factionName + '</div></div>',
        '<div class="kv-item"><strong>武器</strong><div class="muted">' + (equip.weapon ? equip.weapon.name : '未装备') + '</div></div>',
        '<div class="kv-item"><strong>护甲</strong><div class="muted">' + (equip.armor ? equip.armor.name : '未装备') + '</div></div>',
      '</div>',
      '<div class="feature-card compact">',
        '<div class="feature-kicker">属性总览</div>',
        '<p>攻击 ' + player.attackPower + ' · 防御 ' + player.defensePower + ' · 身法 ' + player.speedPower + '</p>',
      '</div>',
      '<div class="feature-card compact">',
        '<div class="feature-kicker">饰品</div>',
        '<p>' + (equip.accessory ? equip.accessory.name : '未装备') + '</p>',
      '</div>'
    ].join('');
    right.body.appendChild(G.UI.HUD.buildStatBars(player));

    wrap.appendChild(left);
    wrap.appendChild(right);
    layer.appendChild(wrap);

    var uiRoot = document.getElementById('ui-root');
    uiRoot.innerHTML = '';
    uiRoot.appendChild(layer);

    renderMerchant(left.body.querySelector('#merchant-list'), merchantPool || []);
    renderInventory(left.body.querySelector('#inventory-list'), player);

    var log = left.body.querySelector('#town-log');
    left.body.querySelector('#inn-rest').addEventListener('click', function () {
      if (player.money < 6) {
        log.innerHTML = '你摸了摸钱袋，囊中羞涩，连一夜安稳都买不起。';
        return;
      }
      player.money -= 6;
      G.Managers.PlayerManager.heal(999, 999);
      log.innerHTML = '你在此地修整了一番，伤势尽复，内息平稳。';
      G.Managers.SaveManager.save({ silent: true });
      renderTown();
    });
    left.body.querySelector('#rumor').addEventListener('click', function () {
      var rumors = [
        '有人说破庙夜里会响起不似人间的蜂鸣。',
        '玄衣楼最近在找一个从门外来的人。',
        '药王谷收治了几名碰过异物后经脉紊乱的人。',
        '天岳山门最近严查所有靠近破庙之人。'
      ];
      log.innerHTML = rumors[Math.floor(Math.random() * rumors.length)];
    });
    if (settlementEvent) {
      left.body.querySelector('#settlement-story').addEventListener('click', function () {
        G.Managers.EventManager.setCurrentEvent(settlementEvent.id);
        G.Core.Router.go(G.Core.Config.SCENES.EVENT);
      });
    }
    left.body.querySelector('#leave-town').addEventListener('click', function () {
      G.Core.Router.go(G.Core.Config.SCENES.WORLD_MAP);
    });
  }

  G.Scenes.TownScene = new Phaser.Class({
    Extends: Phaser.Scene,
    initialize: function TownScene() {
      Phaser.Scene.call(this, { key: G.Core.Config.SCENES.TOWN });
    },
    create: function () {
      this.cameras.main.setBackgroundColor('#10192a');
      renderTown();
    }
  });
})(window.TransmigratorGame);
