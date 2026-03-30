(function (G) {
  function buildFactionCards() {
    return ((G.Data.world && G.Data.world.factions) || []).map(function (faction) {
      return [
        '<div class="feature-card faction-card">',
          '<div class="feature-kicker">势力</div>',
          '<h4>' + faction.name + '</h4>',
          '<p>' + faction.desc + '</p>',
        '</div>'
      ].join('');
    }).join('');
  }

  function renderMenu() {
    var layer = document.createElement('div');
    layer.className = 'ui-layer menu-screen';

    var hero = document.createElement('section');
    hero.className = 'panel panel-strong menu-hero';
    hero.innerHTML = [
      '<div class="hero-copy">',
        '<div class="feature-kicker">MAIN HUB / PAGE GAME UI</div>',
        '<h2>一念穿越：江湖初卷</h2>',
        '<p>第一世界已经开启。现代灵魂坠入大晟江湖，从主界面直接推进探索、补给、技能配置与地图移动，在统一弹窗系统中掌控整段穿越旅程。</p>',
        '<div class="tag-list">',
          '<span class="tag">剧情事件</span>',
          '<span class="tag">节点探索</span>',
          '<span class="tag">门派系统</span>',
          '<span class="tag">装备成长</span>',
          '<span class="tag">多结局</span>',
        '</div>',
        '<div class="btn-row" id="menu-actions"></div>',
      '</div>',
      '<div class="hero-art">',
        '<div class="moon"></div>',
        '<div class="mountains"></div>',
        '<div class="hero-quote">“在大晟江湖里，你留下的不只是存档，还有自己的名字。”</div>',
      '</div>'
    ].join('');

    var featureWrap = document.createElement('div');
    featureWrap.className = 'feature-grid';
    featureWrap.innerHTML = [
      '<div class="feature-card"><div class="feature-kicker">玩法</div><h4>完整首发闭环</h4><p>中央游戏区、右侧情报区和底部五按钮功能栏已经统一为正式主场景布局。</p></div>',
      '<div class="feature-card"><div class="feature-kicker">发布</div><h4>统一暗金属弹窗</h4><p>个人信息、背包、商城、技能与地图全部采用一致风格，并支持悬停预览信息面板。</p></div>',
      '<div class="feature-card"><div class="feature-kicker">扩展</div><h4>多世界结构预留</h4><p>武侠世界已配置化，后续继续追加仙侠、赛博或末世世界时无需推倒重来。</p></div>'
    ].join('') + buildFactionCards();

    var footer = document.createElement('div');
    footer.className = 'menu-footer';
    footer.innerHTML = '<span class="muted">版本 ' + G.version + '</span><span class="muted">仓库名建议：transmigrator-wuxia</span><span class="muted">首个穿越世界：武侠</span>';

    layer.appendChild(hero);
    layer.appendChild(featureWrap);
    layer.appendChild(footer);

    var uiRoot = document.getElementById('ui-root');
    uiRoot.innerHTML = '';
    uiRoot.appendChild(layer);

    var actionRoot = hero.querySelector('#menu-actions');

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

    var resetBtn = document.createElement('button');
    resetBtn.className = 'btn danger';
    resetBtn.textContent = '删除本地存档';
    resetBtn.addEventListener('click', function () {
      G.Managers.SaveManager.reset();
      setTimeout(function () { location.reload(); }, 500);
    });

    actionRoot.appendChild(startBtn);
    actionRoot.appendChild(continueBtn);
    actionRoot.appendChild(resetBtn);
  }

  G.Scenes.MainMenuScene = new Phaser.Class({
    Extends: Phaser.Scene,
    initialize: function MainMenuScene() {
      Phaser.Scene.call(this, { key: G.Core.Config.SCENES.MENU });
    },
    create: function () {
      this.cameras.main.setBackgroundColor('#07101c');
      this.add.rectangle(640, 380, 1280, 760, 0x07101c, 1);
      this.add.circle(1080, 140, 64, 0xf5d17e, 0.12);
      this.add.circle(1040, 180, 110, 0x6ad2ff, 0.05);
      this.add.triangle(280, 520, 80, 760, 280, 280, 480, 760, 0x0f1e30, 1);
      this.add.triangle(560, 560, 320, 760, 560, 250, 800, 760, 0x112339, 1);
      this.add.triangle(930, 590, 700, 760, 930, 300, 1160, 760, 0x10263a, 1);
      this.add.text(78, 88, '一念穿越', { fontSize: '66px', color: '#f7efd9', fontStyle: 'bold' });
      this.add.text(84, 160, '第一世界：武侠 · 统一物品库 / 系统三角菜单', { fontSize: '22px', color: '#f5d17e' });
      renderMenu();
    }
  });
})(window.TransmigratorGame);
