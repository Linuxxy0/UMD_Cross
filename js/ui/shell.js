(function (G) {
  function esc(value) {
    return String(value == null ? '' : value)
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#39;');
  }

  function pct(value, max) {
    if (!max || max <= 0) return 0;
    return Math.max(0, Math.min(100, Math.round(value / max * 100)));
  }

  function meterHtml(label, value, max, tone) {
    return [
      '<div class="meter-row ' + tone + '">',
        '<div class="meter-meta"><span>' + esc(label) + '</span><span class="mono">' + value + '/' + max + '</span></div>',
        '<div class="meter-track"><div class="meter-fill ' + tone + '" style="width:' + pct(value, max) + '%"></div></div>',
      '</div>'
    ].join('');
  }

  function getNodeName(nodeId) {
    var maps = (G.Data.maps && G.Data.maps.nodes) || [];
    var found = maps.find(function (item) { return item.id === nodeId; });
    return found ? found.name : (nodeId || '--');
  }

  function defaultCommandButtons() {
    return [
      { label: '档案', action: { type: 'window', key: 'profile' } },
      { label: '背包', action: { type: 'window', key: 'inventory' } },
      { label: '技能', action: { type: 'window', key: 'skills' } },
      { label: '地图', action: { type: 'window', key: 'map' } },
      { label: '商店', action: { type: 'window', key: 'shop' } },
      { label: '日志', action: { type: 'window', key: 'announcement' } },
      { label: '记录', action: { type: 'save' } }
    ];
  }

  function currentStatusHtml(options) {
    var player = options && options.player;
    var node = options && options.node;
    var statusTitle = (options && options.statusTitle) || (player ? player.name : '界门终端');
    var statusMeta = (options && options.statusMeta) || (player ? ((player.factionName || '江湖散人') + ' / Lv.' + player.level) : '未建立角色档案');
    var worldLine = (options && options.worldLine) || ('大晟江湖 / ' + (node ? node.name : '未进入江湖'));
    var timeLine = (options && options.timeLine) || '戌时 / 风雨 / 第一世界';

    return [
      '<div class="shell-status-bar">',
        '<div class="status-identity">',
          '<div class="status-avatar">' + (player ? esc(player.name.charAt(0)) : '界') + '</div>',
          '<div class="status-copy">',
            '<div class="status-name-line"><strong>' + esc(statusTitle) + '</strong><span>' + esc(statusMeta) + '</span></div>',
            '<div class="status-world-line">' + esc(worldLine) + ' / ' + esc(timeLine) + '</div>',
          '</div>',
        '</div>',
        '<div class="status-vitals">',
          (player ? meterHtml('HP', player.hp, player.maxHpTotal || player.maxHp || 0, 'hp') : meterHtml('HP', 0, 100, 'hp')),
          (player ? meterHtml('MP', player.mp, player.maxMpTotal || player.maxMp || 0, 'mp') : meterHtml('MP', 0, 100, 'mp')),
        '</div>',
        '<div class="status-side-meta">',
          '<div><span>地点</span><strong>' + esc(node ? node.name : '--') + '</strong></div>',
          '<div><span>银两</span><strong>' + esc(player ? player.money : 0) + '</strong></div>',
          '<div><span>档案版本</span><strong>v' + esc(G.version || '1.0.0') + '</strong></div>',
        '</div>',
      '</div>'
    ].join('');
  }

  function playerRailHtml(player, options) {
    if (!player) {
      return [
        '<section class="panel shell-panel rail-section">',
          '<div class="panel-header"><h2>角色状态</h2><span class="muted">未创建</span></div>',
          '<div class="panel-body">',
            '<div class="empty-tip">当前还没有角色档案。创建角色后，这里会显示头像、血蓝、属性与装备摘要。</div>',
          '</div>',
        '</section>'
      ].join('');
    }

    var breakdown = G.Managers.PlayerManager.getAttributeBreakdown() || { base: {}, equipment: {}, final: {} };
    var equipment = G.Managers.PlayerManager.getEquipmentDetail();
    var states = [];
    if (player.pendingBattle) states.push('临战');
    if (player.currentEventId) states.push('事件中');
    if (!states.length) states.push('稳定');

    function row(label, baseKey, finalKey) {
      var base = breakdown.base[baseKey] || 0;
      var extra = (breakdown.equipment[baseKey] || 0) + ((breakdown.final[finalKey] || breakdown.final[baseKey] || 0) - ((breakdown.base[finalKey] || breakdown.base[baseKey] || 0) + (breakdown.equipment[baseKey] || 0)));
      var total = breakdown.final[finalKey] || breakdown.final[baseKey] || 0;
      var sign = extra > 0 ? '+' + extra : String(extra || 0);
      return '<div class="rail-stat-row"><span>' + esc(label) + '</span><span class="mono">' + base + ' / ' + sign + ' / ' + total + '</span></div>';
    }

    return [
      '<section class="panel shell-panel rail-section identity-card">',
        '<div class="panel-body">',
          '<div class="identity-header">',
            '<div class="identity-avatar">' + esc(player.name.charAt(0)) + '</div>',
            '<div class="identity-meta">',
              '<strong>' + esc(player.name) + '</strong>',
              '<span>' + esc(player.factionName || '江湖散人') + ' / Lv.' + player.level + '</span>',
              '<span>' + esc(options && options.locationLabel ? options.locationLabel : getNodeName(player.currentNodeId)) + '</span>',
            '</div>',
          '</div>',
          '<div class="rail-meters">',
            meterHtml('气血', player.hp, player.maxHpTotal || player.maxHp || 0, 'hp'),
            meterHtml('内力', player.mp, player.maxMpTotal || player.maxMp || 0, 'mp'),
          '</div>',
        '</div>',
      '</section>',
      '<section class="panel shell-panel rail-section">',
        '<div class="panel-header"><h2>属性板</h2><span class="muted">基础 / 装备 / 最终</span></div>',
        '<div class="panel-body rail-stat-grid">',
          row('攻击', 'strength', 'attack'),
          row('防御', 'constitution', 'defense'),
          row('身法', 'agility', 'agility'),
          row('根骨', 'constitution', 'constitution'),
          row('悟性', 'insight', 'insight'),
          row('速度', 'agility', 'speed'),
          row('暴击', 'insight', 'crit'),
          row('气血', 'maxHp', 'maxHp'),
          row('内力', 'maxMp', 'maxMp'),
        '</div>',
      '</section>',
      '<section class="panel shell-panel rail-section">',
        '<div class="panel-header"><h2>当前装备</h2><span class="muted">已装配</span></div>',
        '<div class="panel-body equipment-summary">',
          '<div class="equipment-summary-row"><span>武器</span><strong>' + esc(equipment.weapon ? equipment.weapon.name : '未装备') + '</strong></div>',
          '<div class="equipment-summary-row"><span>护甲</span><strong>' + esc(equipment.armor ? equipment.armor.name : '未装备') + '</strong></div>',
          '<div class="equipment-summary-row"><span>饰品</span><strong>' + esc(equipment.accessory ? equipment.accessory.name : '未装备') + '</strong></div>',
        '</div>',
      '</section>',
      '<section class="panel shell-panel rail-section">',
        '<div class="panel-header"><h2>状态</h2><span class="muted">当前</span></div>',
        '<div class="panel-body state-list">',
          states.map(function (label) { return '<span class="state-chip">' + esc(label) + '</span>'; }).join(''),
        '</div>',
      '</section>'
    ].join('');
  }

  function mount(layer) {
    var root = document.getElementById('ui-root');
    if (root) {
      root.innerHTML = '';
      root.appendChild(layer);
    }
  }

  function bindCommandBar(root, buttons) {
    Array.prototype.slice.call(root.querySelectorAll('.command-btn')).forEach(function (btn, index) {
      var config = buttons[index];
      if (!config) return;
      btn.addEventListener('click', function () {
        var action = config.action || {};
        if (typeof config.onClick === 'function') {
          config.onClick();
          return;
        }
        if (action.type === 'window' && G.UI.GameWindows) {
          G.UI.GameWindows.open(action.key);
          return;
        }
        if (action.type === 'route') {
          G.Core.Router.go(action.scene, action.data || {});
          return;
        }
        if (action.type === 'save') {
          G.Managers.SaveManager.save();
          return;
        }
        if (action.type === 'custom' && typeof action.run === 'function') {
          action.run();
        }
      });
    });
  }

  function create(options) {
    options = options || {};
    var buttons = options.commandButtons || defaultCommandButtons();
    var layer = document.createElement('div');
    layer.className = 'ui-layer mud-shell ' + (options.sceneClass || '');

    var shell = document.createElement('div');
    shell.className = 'shell-root';
    shell.innerHTML = currentStatusHtml({
      player: options.player || null,
      node: options.node || null,
      statusTitle: options.statusTitle,
      statusMeta: options.statusMeta,
      worldLine: options.worldLine,
      timeLine: options.timeLine
    });

    var frame = document.createElement('div');
    frame.className = 'shell-frame';

    var left = document.createElement('aside');
    left.className = 'shell-col shell-left';
    var center = document.createElement('main');
    center.className = 'shell-col shell-center';
    var right = document.createElement('aside');
    right.className = 'shell-col shell-right';

    if (options.leftHTML) left.innerHTML = options.leftHTML;
    if (options.centerHTML) center.innerHTML = options.centerHTML;
    if (options.rightHTML) right.innerHTML = options.rightHTML;

    frame.appendChild(left);
    frame.appendChild(center);
    frame.appendChild(right);

    var bottom = document.createElement('div');
    bottom.className = 'shell-command-bar';
    bottom.innerHTML = buttons.map(function (button) {
      return '<button class="command-btn">' + esc(button.label) + '</button>';
    }).join('');
    bindCommandBar(bottom, buttons);

    shell.appendChild(frame);
    shell.appendChild(bottom);
    layer.appendChild(shell);

    if (options.drawers !== false && G.UI.GameWindows && typeof G.UI.GameWindows.buildSideDrawer === 'function') {
      layer.appendChild(G.UI.GameWindows.buildSideDrawer('left'));
      layer.appendChild(G.UI.GameWindows.buildSideDrawer('right'));
      var modalRoot = document.createElement('div');
      modalRoot.id = 'hub-modal-root';
      layer.appendChild(modalRoot);
    }

    return {
      layer: layer,
      shell: shell,
      left: left,
      center: center,
      right: right,
      bottom: bottom,
      mount: function () { mount(layer); }
    };
  }

  G.UI.Shell = {
    create: create,
    mount: mount,
    playerRailHtml: playerRailHtml,
    defaultCommandButtons: defaultCommandButtons
  };
})(window.TransmigratorGame);
