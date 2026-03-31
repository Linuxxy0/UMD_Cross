(function (G) {
  function renderEvent() {
    var evt = G.Managers.EventManager.getCurrentEvent();
    var player = G.Managers.PlayerManager.getPlayer();
    if (!evt || !player) {
      G.Core.Router.go(G.Core.Config.SCENES.WORLD_MAP);
      return;
    }

    G.Managers.PlayerManager.applyDerivedStats();
    var currentNode = G.Managers.WorldManager.getCurrentNode() || { name: '未知地点', danger: 0 };
    var factionRep = player.factionReputation || {};
    var choices = G.Managers.EventManager.getAvailableChoices(evt);

    var shell = G.UI.Shell.create({
      player: player,
      node: currentNode,
      sceneClass: 'scene-event-shell',
      statusTitle: player.name,
      statusMeta: (player.factionName || '江湖散人') + ' / 事件进行中',
      worldLine: '大晟江湖 / ' + currentNode.name,
      timeLine: '事件 / ' + (evt.type || 'story') + ' / 危险度 ' + currentNode.danger,
      leftHTML: G.UI.Shell.playerRailHtml(player, { locationLabel: currentNode.name }),
      centerHTML: [
        '<section class="panel shell-panel">',
          '<div class="panel-header"><h2>事件叙事</h2><span class="muted">正在处理</span></div>',
          '<div class="panel-body shell-narrative">',
            '<div class="story-block">',
              '<div class="window-kicker">' + (evt.type || 'story') + '</div>',
              '<div class="narrative-title">' + evt.title + '</div>',
              '<div class="narrative-copy">' + evt.desc + '</div>',
            '</div>',
            '<section class="panel shell-panel">',
              '<div class="panel-header"><h2>可选回应</h2><span class="muted">命令列表</span></div>',
              '<div class="panel-body"><div id="choice-root" class="choice-list"></div></div>',
            '</section>',
          '</div>',
        '</section>'
      ].join(''),
      rightHTML: [
        '<section class="panel shell-panel rail-section">',
          '<div class="panel-header"><h2>现场上下文</h2><span class="muted">上下文</span></div>',
          '<div class="panel-body">',
            '<div class="rail-stat-row"><span>事件类型</span><span>' + (evt.type || 'story') + '</span></div>',
            '<div class="rail-stat-row"><span>当前地点</span><span>' + currentNode.name + '</span></div>',
            '<div class="rail-stat-row"><span>可选项数</span><span>' + choices.length + '</span></div>',
            '<div class="story-block">部分选择会导向战斗、后续事件，或直接改写你的结局条件。</div>',
          '</div>',
        '</section>',
        '<section class="panel shell-panel rail-section">',
          '<div class="panel-header"><h2>势力声望</h2><span class="muted">当前</span></div>',
          '<div class="panel-body">',
            '<div class="rail-stat-row"><span>天岳</span><span>' + (factionRep.tianyue || 0) + '</span></div>',
            '<div class="rail-stat-row"><span>玄衣</span><span>' + (factionRep.xuanyi || 0) + '</span></div>',
            '<div class="rail-stat-row"><span>药王</span><span>' + (factionRep.yaowang || 0) + '</span></div>',
          '</div>',
        '</section>'
      ].join('')
    });

    shell.mount();

    var choiceRoot = shell.center.querySelector('#choice-root');
    var choiceList = G.UI.ChoiceList(choices.map(function (choice) {
      return {
        label: choice.text,
        onClick: function () {
          var outcome = G.Managers.EventManager.applyChoice(choice);
          G.Managers.SaveManager.save({ silent: true });
          if (outcome.type === 'battle') G.Core.Router.go(G.Core.Config.SCENES.BATTLE);
          else if (outcome.type === 'ending') G.Core.Router.go(G.Core.Config.SCENES.ENDING);
          else if (outcome.type === 'event') renderEvent();
          else G.Core.Router.go(G.Core.Config.SCENES.WORLD_MAP);
        }
      };
    }));
    choiceRoot.appendChild(choiceList);
  }

  G.Scenes.EventScene = new Phaser.Class({
    Extends: Phaser.Scene,
    initialize: function EventScene() {
      Phaser.Scene.call(this, { key: G.Core.Config.SCENES.EVENT });
    },
    create: function () {
      this.cameras.main.setBackgroundColor('#111315');
      this.add.rectangle(640, 380, 1280, 760, 0x111315, 1);
      renderEvent();
    }
  });
})(window.TransmigratorGame);
