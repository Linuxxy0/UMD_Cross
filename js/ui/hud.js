(function (G) {
  function pct(current, max) {
    if (!max || max <= 0) return 0;
    return Math.max(0, Math.min(100, Math.round(current / max * 100)));
  }

  function buildBar(label, value, max, type) {
    return [
      '<div class="hud-bar-row ' + type + '">',
        '<div class="hud-bar-meta"><span>' + label + '</span><span>' + value + '/' + max + '</span></div>',
        '<div class="bar-track"><div class="bar-fill ' + type + '" style="width:' + pct(value, max) + '%"></div></div>',
      '</div>'
    ].join('');
  }

  function statItem(label, value) {
    return '<div class="base-attr-item"><span>' + label + '</span><strong>' + value + '</strong></div>';
  }

  G.UI.HUD = {
    buildTopBar: function () {
      var player = G.Managers.PlayerManager.getPlayer();
      var node = G.Managers.WorldManager.getCurrentNode();
      var top = document.createElement('div');
      top.className = 'panel panel-strong top-hud';
      top.innerHTML = [
        '<div class="hud-avatar">' + (player ? player.name.charAt(0) : '侠') + '</div>',
        '<div class="hud-main">',
          '<div class="hud-name-row"><strong>' + (player ? player.name : '未创建角色') + '</strong><span class="hud-level">Lv.' + (player ? player.level : 0) + '</span></div>',
          '<div class="hud-world-line">大晟江湖 · ' + (node ? node.name : '未进入江湖') + '</div>',
          '<div class="hud-bars">',
            buildBar('气血', player ? player.hp : 0, player ? (player.maxHpTotal || player.maxHp) : 0, 'hp'),
            buildBar('内力', player ? player.mp : 0, player ? (player.maxMpTotal || player.maxMp) : 0, 'mp'),
          '</div>',
        '</div>',
        '<div class="hud-quick-stats">',
          '<div class="hud-chip"><span>银两</span><strong>' + (player ? player.money : 0) + '</strong></div>',
          '<div class="hud-chip"><span>攻击</span><strong>' + (player ? player.attackPower : 0) + '</strong></div>',
          '<div class="hud-chip"><span>门派</span><strong>' + (player ? player.factionName : '无') + '</strong></div>',
        '</div>'
      ].join('');
      return top;
    },
    buildBaseStatsPanel: function () {
      var player = G.Managers.PlayerManager.getPlayer();
      var breakdown = G.Managers.PlayerManager.getAttributeBreakdown();
      var wrap = document.createElement('div');
      wrap.className = 'panel base-stat-panel';
      wrap.innerHTML = [
        '<div class="panel-header slim"><h3>基础属性</h3><span class="muted">人物底值 / 战斗面板</span></div>',
        '<div class="base-attr-list">',
          statItem('气血上限', breakdown ? breakdown.base.maxHp : 0),
          statItem('内力上限', breakdown ? breakdown.base.maxMp : 0),
          statItem('臂力', breakdown ? breakdown.base.strength : 0),
          statItem('身法', breakdown ? breakdown.base.agility : 0),
          statItem('根骨', breakdown ? breakdown.base.constitution : 0),
          statItem('悟性', breakdown ? breakdown.base.insight : 0),
          statItem('攻击', breakdown ? breakdown.final.attack : 0),
          statItem('防御', breakdown ? breakdown.final.defense : 0),
          statItem('速度', breakdown ? breakdown.final.speed : 0),
          statItem('暴击', breakdown ? breakdown.final.crit : 0),
        '</div>',
        '<div class="muted attr-footnote">装备穿脱会实时联动这些属性。</div>'
      ].join('');
      return wrap;
    },
    buildStatBars: function (entity) {
      var wrap = document.createElement('div');
      wrap.className = 'stat-list';
      [
        { label: '气血', value: entity.hp, max: entity.maxHpTotal || entity.maxHp, type: 'hp' },
        { label: '内力', value: entity.mp, max: entity.maxMpTotal || entity.maxMp, type: 'mp' }
      ].forEach(function (item) {
        var row = document.createElement('div');
        row.className = 'stat-bar ' + item.type;
        row.innerHTML = [
          '<div class="panel-header slim"><span>' + item.label + '</span><span>' + item.value + '/' + item.max + '</span></div>',
          '<div class="bar-track"><div class="bar-fill ' + item.type + '" style="width:' + pct(item.value, item.max) + '%"></div></div>'
        ].join('');
        wrap.appendChild(row);
      });
      return wrap;
    },
    showToast: function (text, type) {
      var root = document.getElementById('toast-root');
      if (!root) return;
      var toast = document.createElement('div');
      toast.className = 'toast ' + (type || 'success');
      toast.textContent = text;
      root.appendChild(toast);
      setTimeout(function () {
        toast.remove();
      }, 2600);
    }
  };
})(window.TransmigratorGame);
