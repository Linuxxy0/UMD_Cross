(function (G) {
  var currentWindowKey = null;

  function getPlayer() {
    return G.Managers.PlayerManager.getPlayer();
  }

  function getItem(itemId) {
    return G.Managers.PlayerManager.getItemById(itemId);
  }

  function getSkill(skillId) {
    return ((G.Data.skills && G.Data.skills.skills) || []).find(function (skill) { return skill.id === skillId; }) || null;
  }

  function getModalRoot() {
    return document.getElementById('hub-modal-root');
  }

  function slotLabel(slot) {
    return {
      weapon: '武器',
      armor: '护甲',
      accessory: '饰品'
    }[slot] || slot || '未知';
  }

  function itemTypeLabel(type) {
    return {
      equipment: '装备',
      consumable: '消耗品',
      quest: '任务物品'
    }[type] || type || '未知';
  }

  function skillTypeLabel(type) {
    return {
      attack: '招式',
      support: '心法'
    }[type] || type || '武学';
  }

  function statLabel(key) {
    return {
      attack: '攻击',
      defense: '防御',
      agility: '身法',
      maxHp: '气血',
      maxMp: '内力',
      insight: '悟性'
    }[key] || key;
  }

  function formatStatBlocks(stats, diffStats) {
    var keys = Object.keys(stats || {});
    if (!keys.length) return '<div class="empty-tip">暂无属性加成。</div>';
    return keys.map(function (key) {
      var diff = diffStats && typeof diffStats[key] === 'number' ? diffStats[key] : null;
      var diffHtml = '';
      if (diff !== null && diff !== 0) {
        diffHtml = '<span class="stat-diff ' + (diff > 0 ? 'up' : 'down') + '">' + (diff > 0 ? '+' : '') + diff + '</span>';
      }
      return '<div class="preview-stat"><span>' + statLabel(key) + '</span><strong>+' + stats[key] + '</strong>' + diffHtml + '</div>';
    }).join('');
  }

  function calcDiff(item) {
    var player = getPlayer();
    if (!player || !item || item.type !== 'equipment') return null;
    var equipped = player.equipment && item.slot ? getItem(player.equipment[item.slot]) : null;
    var currentStats = (equipped && equipped.stats) || {};
    var nextStats = item.stats || {};
    var keys = ['attack', 'defense', 'agility', 'maxHp', 'maxMp', 'insight'];
    var diff = {};
    var hasDiff = false;
    keys.forEach(function (key) {
      var value = (nextStats[key] || 0) - (currentStats[key] || 0);
      if (value !== 0) {
        diff[key] = value;
        hasDiff = true;
      }
    });
    return hasDiff ? diff : {};
  }

  function previewItemHtml(item, extra) {
    if (!item) {
      return [
        '<div class="window-kicker">信息面板</div>',
        '<h3>请选择物品</h3>',
        '<div class="empty-tip">将鼠标移到左侧装备或物品上，可在这里查看详细预览。</div>'
      ].join('');
    }
    var player = getPlayer() || {};
    var equippedId = item.slot && player.equipment ? player.equipment[item.slot] : null;
    var equipped = equippedId ? getItem(equippedId) : null;
    var countHtml = extra && extra.count ? '<span class="tag">数量 x' + extra.count + '</span>' : '';
    var priceHtml = typeof item.price === 'number' ? '<span class="tag">价格 ' + item.price + ' 银两</span>' : '';
    var equippedHtml = equippedId === item.id ? '<span class="tag tag-gold">已装备</span>' : '';
    var compareHtml = '';
    if (item.type === 'equipment') {
      compareHtml = [
        '<div class="preview-section">',
          '<div class="preview-title">当前槽位</div>',
          '<div class="muted">' + (equipped ? equipped.name : '未装备') + '</div>',
        '</div>',
        '<div class="preview-section">',
          '<div class="preview-title">属性加成</div>',
          '<div class="preview-stats">' + formatStatBlocks(item.stats || {}, calcDiff(item)) + '</div>',
        '</div>'
      ].join('');
    }
    return [
      '<div class="window-kicker">' + itemTypeLabel(item.type) + '</div>',
      '<h3>' + item.name + '</h3>',
      '<div class="tag-list">',
        '<span class="tag">' + itemTypeLabel(item.type) + '</span>',
        item.slot ? '<span class="tag">' + slotLabel(item.slot) + '</span>' : '',
        priceHtml,
        countHtml,
        equippedHtml,
      '</div>',
      '<p class="preview-desc">' + (item.desc || '暂无说明') + '</p>',
      compareHtml,
      '<div class="preview-section">',
        '<div class="preview-title">操作建议</div>',
        '<div class="muted">' + (item.type === 'equipment' ? '可直接装备到对应槽位；若已穿戴同槽装备，会以该件替换显示。' : item.type === 'consumable' ? '恢复类道具会立即生效并从背包扣除。' : '任务物品通常用于推动剧情或门派线。') + '</div>',
      '</div>'
    ].join('');
  }

  function previewSkillHtml(skill) {
    if (!skill) {
      return '<div class="window-kicker">信息面板</div><h3>请选择武学</h3><div class="empty-tip">将鼠标移到左侧武学条目上查看效果、耗蓝与定位。</div>';
    }
    return [
      '<div class="window-kicker">' + skillTypeLabel(skill.type) + '</div>',
      '<h3>' + skill.name + '</h3>',
      '<div class="tag-list">',
        '<span class="tag">' + skillTypeLabel(skill.type) + '</span>',
        '<span class="tag">内力消耗 ' + (skill.mpCost || 0) + '</span>',
        '<span class="tag">倍率 ' + (skill.power || 1) + '</span>',
      '</div>',
      '<p class="preview-desc">' + (skill.desc || '暂无说明') + '</p>',
      '<div class="preview-section">',
        '<div class="preview-title">战斗定位</div>',
        '<div class="muted">' + (skill.type === 'support' ? '偏向恢复、稳息或强化自身。' : '主要用于在战斗中压制敌人或快速收割。') + '</div>',
      '</div>'
    ].join('');
  }

  function previewNodeHtml(node, currentNodeId) {
    if (!node) {
      return '<div class="window-kicker">信息面板</div><h3>请选择地点</h3><div class="empty-tip">将鼠标移到左侧地图节点上，可查看危险等级、区域说明与行动建议。</div>';
    }
    return [
      '<div class="window-kicker">地图节点</div>',
      '<h3>' + node.name + '</h3>',
      '<div class="tag-list">',
        '<span class="tag">' + G.Worlds.WuxiaRules.getNodeThemeLabel(node) + '</span>',
        '<span class="tag">危险 ' + node.danger + '</span>',
        node.id === currentNodeId ? '<span class="tag tag-gold">当前位置</span>' : '',
      '</div>',
      '<p class="preview-desc">' + node.desc + '</p>',
      '<div class="preview-section">',
        '<div class="preview-title">可触发内容</div>',
        '<div class="muted">事件池 ' + ((node.eventPool || []).length) + ' 条，连接 ' + ((node.links || []).length) + ' 个地点。</div>',
      '</div>'
    ].join('');
  }

  function modalShell(title, subtitle, contentNode) {
    var mask = document.createElement('div');
    mask.className = 'dnf-modal-mask';

    var win = document.createElement('section');
    win.className = 'dnf-window';

    var header = document.createElement('header');
    header.className = 'dnf-window-header';
    header.innerHTML = '<div><div class="window-kicker">' + (subtitle || '江湖系统') + '</div><h2>' + title + '</h2></div>';

    var close = document.createElement('button');
    close.className = 'dnf-close-btn';
    close.textContent = '×';
    close.addEventListener('click', function () {
      G.UI.GameWindows.close();
    });
    header.appendChild(close);

    var body = document.createElement('div');
    body.className = 'dnf-window-body';
    body.appendChild(contentNode);

    win.appendChild(header);
    win.appendChild(body);
    mask.appendChild(win);
    mask.addEventListener('click', function (event) {
      if (event.target === mask) G.UI.GameWindows.close();
    });
    return mask;
  }

  function refreshHub(windowKey) {
    if (typeof G.State.renderHub === 'function') {
      G.State.renderHub();
      if (windowKey) G.UI.GameWindows.open(windowKey);
    }
  }

  function bindHoverEntries(root, previewRoot, renderer) {
    Array.prototype.slice.call(root.querySelectorAll('[data-preview-id]')).forEach(function (entry) {
      entry.addEventListener('mouseenter', function () {
        var rendered = renderer(this.getAttribute('data-preview-id'));
        if (typeof rendered === 'string') previewRoot.innerHTML = rendered;
        Array.prototype.slice.call(root.querySelectorAll('.list-entry')).forEach(function (node) {
          node.classList.remove('is-active');
        });
        this.classList.add('is-active');
      });
      entry.addEventListener('focus', function () {
        var rendered = renderer(this.getAttribute('data-preview-id'));
        if (typeof rendered === 'string') previewRoot.innerHTML = rendered;
      });
    });
  }

  function attachInventoryActions(previewRoot, item, player) {
    var actionRow = document.createElement('div');
    actionRow.className = 'preview-actions';

    if (item.type === 'equipment') {
      var equipBtn = document.createElement('button');
      equipBtn.className = 'btn primary';
      equipBtn.textContent = player.equipment && player.equipment[item.slot] === item.id ? '已装备' : '装备';
      equipBtn.disabled = player.equipment && player.equipment[item.slot] === item.id;
      equipBtn.addEventListener('click', function () {
        if (G.Managers.PlayerManager.equipItem(item.id)) {
          G.Managers.SaveManager.save({ silent: true });
          G.UI.HUD.showToast('已装备：' + item.name, 'success');
          refreshHub('inventory');
        }
      });
      actionRow.appendChild(equipBtn);
    }

    if (item.type === 'consumable') {
      var useBtn = document.createElement('button');
      useBtn.className = 'btn primary';
      useBtn.textContent = '使用';
      useBtn.addEventListener('click', function () {
        var effect = {
          bandage: { hp: 35, mp: 0, message: '绷带止住了流血。' },
          herbal_pill: { hp: 24, mp: 18, message: '药气化开，气血与内力都恢复了一些。' },
          smoke_pellet: { hp: 0, mp: 8, message: '烟雾丸在非战斗中只能让你稍微定神。' }
        }[item.id] || { hp: 0, mp: 0, message: '你整理了一下道具。' };
        if (G.Managers.PlayerManager.useItem(item.id)) {
          G.Managers.PlayerManager.heal(effect.hp, effect.mp);
          G.Managers.SaveManager.save({ silent: true });
          G.UI.HUD.showToast(effect.message, 'success');
          refreshHub('inventory');
        }
      });
      actionRow.appendChild(useBtn);
    }

    if (item.type === 'quest') {
      var questTip = document.createElement('div');
      questTip.className = 'muted';
      questTip.textContent = '该物品用于剧情推进，暂时不可主动使用。';
      actionRow.appendChild(questTip);
    }

    previewRoot.appendChild(actionRow);
  }

  function buildInventoryWindow() {
    var player = getPlayer();
    var summary = G.Managers.PlayerManager.getInventorySummary();
    var content = document.createElement('div');
    content.className = 'window-layout';

    var left = document.createElement('div');
    left.className = 'window-list';
    var right = document.createElement('aside');
    right.className = 'window-preview';

    if (!summary.length) {
      left.innerHTML = '<div class="empty-tip">你的背包暂时还是空的。</div>';
      right.innerHTML = previewItemHtml(null);
      content.appendChild(left);
      content.appendChild(right);
      return content;
    }

    var defaultEntry = summary[0];
    left.innerHTML = '<div class="list-stack"></div>';
    var stack = left.querySelector('.list-stack');

    summary.forEach(function (entry, index) {
      if (!entry.item) return;
      var row = document.createElement('button');
      row.className = 'list-entry item-entry' + (index === 0 ? ' is-active' : '');
      row.setAttribute('data-preview-id', entry.id);
      row.innerHTML = [
        '<span class="entry-main">' + entry.item.name + '</span>',
        '<span class="entry-meta">' + itemTypeLabel(entry.item.type) + (entry.item.slot ? ' · ' + slotLabel(entry.item.slot) : '') + '</span>',
        '<span class="entry-count">x' + entry.count + '</span>'
      ].join('');
      row.addEventListener('click', function () {
        right.innerHTML = previewItemHtml(entry.item, { count: entry.count });
        attachInventoryActions(right, entry.item, player);
      });
      stack.appendChild(row);
    });

    right.innerHTML = previewItemHtml(defaultEntry.item, { count: defaultEntry.count });
    attachInventoryActions(right, defaultEntry.item, player);
    bindHoverEntries(stack, right, function (itemId) {
      var found = summary.find(function (entry) { return entry.id === itemId; });
      if (!found || !found.item) return previewItemHtml(null);
      setTimeout(function () { attachInventoryActions(right, found.item, player); }, 0);
      return previewItemHtml(found.item, { count: found.count });
    });

    content.appendChild(left);
    content.appendChild(right);
    return content;
  }

  function attachShopActions(previewRoot, item) {
    var actionRow = document.createElement('div');
    actionRow.className = 'preview-actions';
    var buyBtn = document.createElement('button');
    buyBtn.className = 'btn primary';
    buyBtn.textContent = '购买';
    buyBtn.addEventListener('click', function () {
      var result = G.Managers.PlayerManager.buyItem(item.id);
      if (!result.ok) {
        G.UI.HUD.showToast(result.message, 'warning');
        return;
      }
      G.Managers.SaveManager.save({ silent: true });
      G.UI.HUD.showToast('购入：' + item.name, 'success');
      refreshHub('shop');
    });
    actionRow.appendChild(buyBtn);
    previewRoot.appendChild(actionRow);
  }

  function buildShopWindow() {
    var merchantPool = G.Managers.WorldManager.getMerchantPoolForCurrentNode() || [];
    var content = document.createElement('div');
    content.className = 'window-layout';
    var left = document.createElement('div');
    left.className = 'window-list';
    var right = document.createElement('aside');
    right.className = 'window-preview';

    if (!merchantPool.length) {
      left.innerHTML = '<div class="empty-tip">此地没有固定商人。你可以前往青石镇、夜市渡口或门派据点补给。</div>';
      right.innerHTML = previewItemHtml(null);
      content.appendChild(left);
      content.appendChild(right);
      return content;
    }

    var firstItem = getItem(merchantPool[0]);
    left.innerHTML = '<div class="list-stack"></div>';
    var stack = left.querySelector('.list-stack');

    merchantPool.forEach(function (itemId, index) {
      var item = getItem(itemId);
      if (!item) return;
      var row = document.createElement('button');
      row.className = 'list-entry item-entry' + (index === 0 ? ' is-active' : '');
      row.setAttribute('data-preview-id', item.id);
      row.innerHTML = [
        '<span class="entry-main">' + item.name + '</span>',
        '<span class="entry-meta">' + itemTypeLabel(item.type) + (item.slot ? ' · ' + slotLabel(item.slot) : '') + '</span>',
        '<span class="entry-count">' + item.price + ' 银</span>'
      ].join('');
      row.addEventListener('click', function () {
        right.innerHTML = previewItemHtml(item);
        attachShopActions(right, item);
      });
      stack.appendChild(row);
    });

    right.innerHTML = previewItemHtml(firstItem);
    attachShopActions(right, firstItem);
    bindHoverEntries(stack, right, function (itemId) {
      var item = getItem(itemId);
      setTimeout(function () { attachShopActions(right, item); }, 0);
      return previewItemHtml(item);
    });

    content.appendChild(left);
    content.appendChild(right);
    return content;
  }

  function buildSkillWindow() {
    var player = getPlayer();
    var skills = (player.learnedSkills || []).map(getSkill).filter(Boolean);
    var content = document.createElement('div');
    content.className = 'window-layout';
    var left = document.createElement('div');
    left.className = 'window-list';
    var right = document.createElement('aside');
    right.className = 'window-preview';

    if (!skills.length) {
      left.innerHTML = '<div class="empty-tip">你尚未习得新的武学。</div>';
      right.innerHTML = previewSkillHtml(null);
      content.appendChild(left);
      content.appendChild(right);
      return content;
    }

    left.innerHTML = '<div class="list-stack"></div>';
    var stack = left.querySelector('.list-stack');
    skills.forEach(function (skill, index) {
      var row = document.createElement('button');
      row.className = 'list-entry skill-entry' + (index === 0 ? ' is-active' : '');
      row.setAttribute('data-preview-id', skill.id);
      row.innerHTML = [
        '<span class="entry-main">' + skill.name + '</span>',
        '<span class="entry-meta">' + skillTypeLabel(skill.type) + '</span>',
        '<span class="entry-count">耗 ' + (skill.mpCost || 0) + '</span>'
      ].join('');
      row.addEventListener('click', function () {
        right.innerHTML = previewSkillHtml(skill);
      });
      stack.appendChild(row);
    });

    right.innerHTML = previewSkillHtml(skills[0]);
    bindHoverEntries(stack, right, function (skillId) {
      return previewSkillHtml(getSkill(skillId));
    });

    content.appendChild(left);
    content.appendChild(right);
    return content;
  }

  function attachMapActions(previewRoot, node, currentNodeId) {
    var actionRow = document.createElement('div');
    actionRow.className = 'preview-actions';
    var goBtn = document.createElement('button');
    goBtn.className = 'btn primary';
    goBtn.textContent = node.id === currentNodeId ? '当前位置' : '前往此地';
    goBtn.disabled = node.id === currentNodeId;
    goBtn.addEventListener('click', function () {
      if (G.Managers.WorldManager.travelTo(node.id)) {
        G.Managers.SaveManager.save({ silent: true });
        G.UI.HUD.showToast('已前往：' + node.name, 'success');
        refreshHub('map');
      }
    });
    actionRow.appendChild(goBtn);
    previewRoot.appendChild(actionRow);
  }

  function buildMapWindow() {
    var currentNode = G.Managers.WorldManager.getCurrentNode();
    var nodes = [currentNode].concat(G.Managers.WorldManager.getAvailableDestinations()).filter(Boolean);
    var content = document.createElement('div');
    content.className = 'window-layout';
    var left = document.createElement('div');
    left.className = 'window-list';
    var right = document.createElement('aside');
    right.className = 'window-preview';

    left.innerHTML = '<div class="list-stack"></div>';
    var stack = left.querySelector('.list-stack');
    nodes.forEach(function (node, index) {
      var row = document.createElement('button');
      row.className = 'list-entry map-entry' + (index === 0 ? ' is-active' : '');
      row.setAttribute('data-preview-id', node.id);
      row.innerHTML = [
        '<span class="entry-main">' + node.name + '</span>',
        '<span class="entry-meta">' + G.Worlds.WuxiaRules.getNodeThemeLabel(node) + '</span>',
        '<span class="entry-count">危 ' + node.danger + '</span>'
      ].join('');
      row.addEventListener('click', function () {
        right.innerHTML = previewNodeHtml(node, currentNode.id);
        attachMapActions(right, node, currentNode.id);
      });
      stack.appendChild(row);
    });

    right.innerHTML = previewNodeHtml(nodes[0], currentNode.id);
    attachMapActions(right, nodes[0], currentNode.id);
    bindHoverEntries(stack, right, function (nodeId) {
      var node = G.Managers.WorldManager.getNodeById(nodeId);
      setTimeout(function () { attachMapActions(right, node, currentNode.id); }, 0);
      return previewNodeHtml(node, currentNode.id);
    });

    content.appendChild(left);
    content.appendChild(right);
    return content;
  }

  function renderCharacterPreview(previewRoot, slot, item) {
    previewRoot.innerHTML = item ? previewItemHtml(item) : [
      '<div class="window-kicker">' + slotLabel(slot) + '</div>',
      '<h3>未装备</h3>',
      '<div class="empty-tip">该栏位当前没有装备。你可以从背包中穿戴新的 ' + slotLabel(slot) + '。</div>'
    ].join('');
    if (item) {
      var row = document.createElement('div');
      row.className = 'preview-actions';
      var unequipBtn = document.createElement('button');
      unequipBtn.className = 'btn';
      unequipBtn.textContent = '卸下';
      unequipBtn.addEventListener('click', function () {
        if (G.Managers.PlayerManager.unequipSlot(slot)) {
          G.Managers.SaveManager.save({ silent: true });
          G.UI.HUD.showToast('已卸下：' + item.name, 'success');
          refreshHub('character');
        }
      });
      row.appendChild(unequipBtn);
      previewRoot.appendChild(row);
    }
  }

  function buildCharacterWindow() {
    var player = getPlayer();
    var equipment = G.Managers.PlayerManager.getEquipmentDetail();
    var content = document.createElement('div');
    content.className = 'window-layout';
    var left = document.createElement('div');
    left.className = 'window-list';
    var right = document.createElement('aside');
    right.className = 'window-preview';

    left.innerHTML = [
      '<div class="profile-card">',
        '<div class="window-kicker">个人信息</div>',
        '<h3>' + player.name + '</h3>',
        '<div class="tag-list">',
          '<span class="tag">Lv.' + player.level + '</span>',
          '<span class="tag">' + player.backgroundLabel + '</span>',
          '<span class="tag">' + player.talentLabel + '</span>',
          '<span class="tag tag-gold">' + player.factionName + '</span>',
        '</div>',
        '<div class="kv-grid compact-grid">',
          '<div class="kv-item"><strong>攻击</strong><div class="muted">' + player.attackPower + '</div></div>',
          '<div class="kv-item"><strong>防御</strong><div class="muted">' + player.defensePower + '</div></div>',
          '<div class="kv-item"><strong>身法</strong><div class="muted">' + player.speedPower + '</div></div>',
          '<div class="kv-item"><strong>声望</strong><div class="muted">' + player.reputation + '</div></div>',
        '</div>',
        '<div class="panel-header slim"><h3>装备栏</h3><span class="muted">鼠标悬停查看预览</span></div>',
        '<div class="slot-stack" id="character-slot-stack"></div>',
      '</div>'
    ].join('');

    var slotStack = left.querySelector('#character-slot-stack');
    ['weapon', 'armor', 'accessory'].forEach(function (slot, index) {
      var item = equipment[slot] || null;
      var row = document.createElement('button');
      row.className = 'list-entry slot-entry' + (index === 0 ? ' is-active' : '');
      row.setAttribute('data-preview-id', slot);
      row.innerHTML = [
        '<span class="entry-main">' + slotLabel(slot) + '</span>',
        '<span class="entry-meta">' + (item ? item.name : '未装备') + '</span>',
        '<span class="entry-count">' + (item ? '已穿戴' : '--') + '</span>'
      ].join('');
      row.addEventListener('click', function () {
        renderCharacterPreview(right, slot, item);
      });
      slotStack.appendChild(row);
    });

    renderCharacterPreview(right, 'weapon', equipment.weapon || null);
    bindHoverEntries(slotStack, right, function (slot) {
      renderCharacterPreview(right, slot, equipment[slot] || null);
      return null;
    });

    content.appendChild(left);
    content.appendChild(right);
    return content;
  }

  G.UI.GameWindows = {
    open: function (key) {
      currentWindowKey = key;
      var root = getModalRoot();
      if (!root) return;
      root.innerHTML = '';
      var node;
      if (key === 'character') {
        node = modalShell('个人信息', '角色面板', buildCharacterWindow());
      } else if (key === 'inventory') {
        node = modalShell('背包', '仓库与装备', buildInventoryWindow());
      } else if (key === 'shop') {
        node = modalShell('商城', '当前地点补给', buildShopWindow());
      } else if (key === 'skills') {
        node = modalShell('技能', '武学预览', buildSkillWindow());
      } else if (key === 'map') {
        node = modalShell('地图', '节点移动', buildMapWindow());
      }
      if (node) root.appendChild(node);
    },
    close: function () {
      currentWindowKey = null;
      var root = getModalRoot();
      if (root) root.innerHTML = '';
    },
    getCurrentWindowKey: function () {
      return currentWindowKey;
    },
    buildToolbar: function () {
      var bar = document.createElement('div');
      bar.className = 'panel toolbar-panel';
      bar.innerHTML = [
        '<button class="toolbar-btn" data-window="character">个人信息</button>',
        '<button class="toolbar-btn" data-window="inventory">背包</button>',
        '<button class="toolbar-btn" data-window="shop">商城</button>',
        '<button class="toolbar-btn" data-window="skills">技能</button>',
        '<button class="toolbar-btn" data-window="map">地图</button>'
      ].join('');
      Array.prototype.slice.call(bar.querySelectorAll('[data-window]')).forEach(function (btn) {
        btn.addEventListener('click', function () {
          G.UI.GameWindows.open(btn.getAttribute('data-window'));
        });
      });
      return bar;
    }
  };
})(window.TransmigratorGame);
