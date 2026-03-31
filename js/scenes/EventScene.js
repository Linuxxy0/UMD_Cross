(function (G) {
  function renderEvent() {
    var evt = G.Managers.EventManager.getCurrentEvent();
    var player = G.Managers.PlayerManager.getPlayer();
    if (!evt) {
      G.Core.Router.go(G.Core.Config.SCENES.WORLD_MAP);
      return;
    }

    G.Managers.PlayerManager.applyDerivedStats();
    var currentNode = G.Managers.WorldManager.getCurrentNode() || { name: '未知地点', danger: 0 };
    var factionRep = player.factionReputation || {};

    var layer = document.createElement('div');
    layer.className = 'ui-layer scene-shell';

    var wrap = document.createElement('div');
    wrap.className = 'hub-layout umd-layout scene-layout';

    var left = document.createElement('aside');
    left.className = 'hud-column hud-column-left';
    left.appendChild(G.UI.HUD.buildTopBar());
    left.appendChild(G.UI.HUD.buildBaseStatsPanel());

    var tracker = G.UI.Panel({ title: '事件定位', subtitle: '当前推进', className: 'sidebar-panel equipment-brief-panel' });
    tracker.body.innerHTML = [
      '<div class="identity-line-list">',
        '<div class="base-attr-item"><span>事件类型</span><strong>' + (evt.type || 'story') + '</strong></div>',
        '<div class="base-attr-item"><span>当前地点</span><strong>' + currentNode.name + '</strong></div>',
        '<div class="base-attr-item"><span>危险等级</span><strong>' + currentNode.danger + '</strong></div>',
      '</div>',
      '<div class="muted attr-footnote">事件页已经统一切到 UMD 线条界面，关闭窗口或返回主界面后仍然保留当前剧情状态。</div>'
    ].join('');
    left.appendChild(tracker);

    var main = G.UI.Panel({ title: evt.title, subtitle: '事件界面 / 剧情推进', className: 'main-panel hub-main-panel', strong: true });
    main.body.innerHTML = [
      '<div class="scene-banner line-card">',
        '<div class="scene-line-label">UMD 事件界面</div>',
        '<h3>' + evt.title + '</h3>',
        '<p>' + (evt.type === 'battle' ? '谨慎选择，这一步可能直接导向战斗。' : '阅读当前剧情，再决定如何推进。') + '</p>',
        '<div class="tag-list">',
          '<span class="tag">地点 ' + currentNode.name + '</span>',
          '<span class="tag">类别 ' + (evt.type || 'story') + '</span>',
          (evt.rewardsHint ? '<span class="tag">收益 ' + evt.rewardsHint + '</span>' : ''),
        '</div>',
      '</div>',
      '<div class="story-block event-story-block">' + evt.desc + '</div>',
      '<div class="option-panel">',
        '<div class="panel-header slim"><h3>可执行选项</h3><span class="muted">点击后立即结算</span></div>',
        '<div id="choice-root" class="event-choice-root"></div>',
      '</div>'
    ].join('');

    var right = G.UI.Panel({ title: '现场情报', subtitle: '状态 / 声望 / 提示', className: 'sidebar-panel hub-side-panel' });
    right.body.innerHTML = [
      '<div class="quest-card line-card">',
        '<div class="window-kicker">角色状态</div>',
        '<div class="identity-line-list">',
          '<div class="base-attr-item"><span>角色</span><strong>' + player.name + '</strong></div>',
          '<div class="base-attr-item"><span>门派</span><strong>' + player.factionName + '</strong></div>',
          '<div class="base-attr-item"><span>银两</span><strong>' + player.money + '</strong></div>',
        '</div>',
      '</div>',
      '<div class="feature-card compact line-card">',
        '<div class="feature-kicker">势力声望</div>',
        '<div class="intel-list">',
          '<div><span>天岳剑宗</span><strong>' + (factionRep.tianyue || 0) + '</strong></div>',
          '<div><span>玄衣楼</span><strong>' + (factionRep.xuanyi || 0) + '</strong></div>',
          '<div><span>药王谷</span><strong>' + (factionRep.yaowang || 0) + '</strong></div>',
        '</div>',
      '</div>',
      '<div class="feature-card compact line-card">',
        '<div class="feature-kicker">事件说明</div>',
        '<div class="bullet-list">',
          '<div>· 事件结果可能改变当前存档状态、路线与门派关系。</div>',
          '<div>· 若选项导向战斗，将无缝切换到统一风格的战斗页。</div>',
          '<div>· 侧边小三角仍可打开人物、背包、技能、地图与商场窗口。</div>',
        '</div>',
      '</div>'
    ].join('');
    right.body.appendChild(G.UI.HUD.buildStatBars(player));

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

    var choiceRoot = main.body.querySelector('#choice-root');
    var choices = G.Managers.EventManager.getAvailableChoices(evt).map(function (choice) {
      return {
        label: choice.text,
        onClick: function () {
          var outcome = G.Managers.EventManager.applyChoice(choice);
          G.Managers.SaveManager.save({ silent: true });
          if (outcome.type === 'battle') {
            G.Core.Router.go(G.Core.Config.SCENES.BATTLE);
          } else if (outcome.type === 'ending') {
            G.Core.Router.go(G.Core.Config.SCENES.ENDING);
          } else if (outcome.type === 'event') {
            renderEvent();
          } else {
            G.Core.Router.go(G.Core.Config.SCENES.WORLD_MAP);
          }
        }
      };
    });
    var choiceList = G.UI.ChoiceList(choices);
    choiceList.classList.add('event-choice-list');
    choiceRoot.appendChild(choiceList);
  }

  G.Scenes.EventScene = new Phaser.Class({
    Extends: Phaser.Scene,
    initialize: function EventScene() {
      Phaser.Scene.call(this, { key: G.Core.Config.SCENES.EVENT });
    },
    create: function () {
      this.cameras.main.setBackgroundColor('#07101a');
      this.add.rectangle(640, 380, 1280, 760, 0x07101a, 1);
      this.add.line(90, 120, 0, 0, 1100, 0, 0x4f6b95, 0.18).setOrigin(0, 0);
      this.add.line(90, 650, 0, 0, 1100, 0, 0x4f6b95, 0.12).setOrigin(0, 0);
      this.add.triangle(210, 680, 0, 760, 210, 240, 420, 760, 0x0c1727, 1);
      this.add.triangle(580, 640, 310, 760, 580, 250, 860, 760, 0x101c2d, 1);
      this.add.triangle(980, 690, 760, 760, 980, 300, 1230, 760, 0x132237, 1);
      renderEvent();
    }
  });
})(window.TransmigratorGame);
