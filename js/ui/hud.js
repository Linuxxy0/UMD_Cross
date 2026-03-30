(function (G) {
  function pct(current, max) {
    if (!max || max <= 0) return 0;
    return Math.max(0, Math.min(100, Math.round(current / max * 100)));
  }

  G.UI.HUD = {
    buildTopBar: function () {
      var player = G.Managers.PlayerManager.getPlayer();
      var node = G.Managers.WorldManager.getCurrentNode();
      var top = document.createElement('div');
      top.className = 'panel top-hud';
      top.innerHTML = [
        '<div class="hud-primary">',
          '<strong>' + (player ? player.name : '未创建角色') + ' <span class="gold">Lv.' + (player ? player.level : 0) + '</span></strong>',
          '<div class="muted">当前世界：大晟江湖 · ' + (node ? node.name : '未进入江湖') + '</div>',
        '</div>',
        '<div class="stats">',
          '<div class="stat-pill">气血 ' + (player ? player.hp : 0) + '/' + (player ? (player.maxHpTotal || player.maxHp) : 0) + '</div>',
          '<div class="stat-pill">内力 ' + (player ? player.mp : 0) + '/' + (player ? (player.maxMpTotal || player.maxMp) : 0) + '</div>',
          '<div class="stat-pill">银两 ' + (player ? player.money : 0) + '</div>',
          '<div class="stat-pill">攻击 ' + (player ? player.attackPower : 0) + '</div>',
          '<div class="stat-pill">门派 ' + (player ? player.factionName : '无') + '</div>',
        '</div>'
      ].join('');
      return top;
    },
    buildStatBars: function (entity) {
      var wrap = document.createElement('div');
      wrap.className = 'stat-list';
      [
        { label: '气血', value: entity.hp, max: entity.maxHpTotal || entity.maxHp },
        { label: '内力', value: entity.mp, max: entity.maxMpTotal || entity.maxMp }
      ].forEach(function (item) {
        var row = document.createElement('div');
        row.className = 'stat-bar';
        row.innerHTML = [
          '<div class="panel-header"><span>' + item.label + '</span><span>' + item.value + '/' + item.max + '</span></div>',
          '<div class="bar-track"><div class="bar-fill" style="width:' + pct(item.value, item.max) + '%"></div></div>'
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
