(function (G) {
  function renderEvent() {
    var evt = G.Managers.EventManager.getCurrentEvent();
    var player = G.Managers.PlayerManager.getPlayer();
    if (!evt) {
      G.Core.Router.go(G.Core.Config.SCENES.WORLD_MAP);
      return;
    }

    var layer = document.createElement('div');
    layer.className = 'ui-layer';
    layer.appendChild(G.UI.HUD.buildTopBar());

    var wrap = document.createElement('div');
    wrap.className = 'page-grid';

    var left = G.UI.Panel({ title: evt.title, subtitle: evt.type, className: 'main-panel', strong: true });
    left.body.innerHTML = [
      '<div class="story-block">' + evt.desc + '</div>',
      evt.rewardsHint ? '<div class="tag-list"><span class="tag">可能收益：' + evt.rewardsHint + '</span></div>' : '',
      '<div id="choice-root"></div>'
    ].join('');

    var factionRep = player.factionReputation || {};
    var right = G.UI.Panel({ title: '状态速览', className: 'sidebar-panel' });
    right.body.innerHTML = [
      '<div class="kv-grid">',
        '<div class="kv-item"><strong>角色</strong><div class="muted">' + player.name + '</div></div>',
        '<div class="kv-item"><strong>当前地点</strong><div class="muted">' + (G.Managers.WorldManager.getCurrentNode() || {name:'未知'}).name + '</div></div>',
        '<div class="kv-item"><strong>门派</strong><div class="muted">' + player.factionName + '</div></div>',
        '<div class="kv-item"><strong>银两</strong><div class="muted">' + player.money + '</div></div>',
      '</div>',
      '<div class="feature-card compact">',
        '<div class="feature-kicker">势力声望</div>',
        '<p>天岳 ' + (factionRep.tianyue || 0) + ' · 玄衣 ' + (factionRep.xuanyi || 0) + ' · 药王 ' + (factionRep.yaowang || 0) + '</p>',
      '</div>'
    ].join('');
    right.body.appendChild(G.UI.HUD.buildStatBars(player));

    wrap.appendChild(left);
    wrap.appendChild(right);
    layer.appendChild(wrap);

    var uiRoot = document.getElementById('ui-root');
    uiRoot.innerHTML = '';
    uiRoot.appendChild(layer);

    var choiceRoot = left.body.querySelector('#choice-root');
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
    choiceRoot.appendChild(G.UI.ChoiceList(choices));
  }

  G.Scenes.EventScene = new Phaser.Class({
    Extends: Phaser.Scene,
    initialize: function EventScene() {
      Phaser.Scene.call(this, { key: G.Core.Config.SCENES.EVENT });
    },
    create: function () {
      this.cameras.main.setBackgroundColor('#0b1220');
      renderEvent();
    }
  });
})(window.TransmigratorGame);
