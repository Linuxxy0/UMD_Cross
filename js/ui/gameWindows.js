(function (G) {
  var currentWindowKey = null;

  function getPlayer() {
    return G.Managers.PlayerManager.getPlayer();
  }

  function getItem(itemId) {
    return G.Managers.LibraryManager.getItemById(itemId);
  }

  function getSkill(skillId) {
    return ((G.Data.skills && G.Data.skills.skills) || []).find(function (skill) { return skill.id === skillId; }) || null;
  }

  function getModalRoot() {
    return document.getElementById('hub-modal-root');
  }

  function qualityClass(item) {
    return 'quality-' + ((item && item.quality) || 'common');
  }

  function slotLabel(slot) {
    return {
      weapon: '武器',
      armor: '护甲',
      accessory: '饰品'
    }[slot] || slot || '未知';
  }

  function statLabel(key) {
    return {
      attack: '攻击',
      defense: '防御',
      agility: '身法',
      maxHp: '气血',
      maxMp: '内力',
      insight: '悟性',
      speed: '速度',
      crit: '暴击'
    }[key] || key;
  }

  function getTooltip() {
    return document.getElementById('floating-tooltip');
  }

  function showTooltip(html, event) {
    var tooltip = getTooltip();
    if (!tooltip) return;
    tooltip.innerHTML = html;
    tooltip.classList.remove('hidden');
    moveTooltip(event);
  }

  function moveTooltip(event) {
    var tooltip = getTooltip();
    if (!tooltip || tooltip.classList.contains('hidden') || !event) return;
    var x = event.clientX + 18;
    var y = event.clientY + 18;
    tooltip.style.left = x + 'px';
    tooltip.style.top = y + 'px';
  }

  function hideTooltip() {
    var tooltip = getTooltip();
    if (!tooltip) return;
    tooltip.classList.add('hidden');
  }

  function previewStatsHtml(stats, compareStats) {
    var keys = Object.keys(stats || {});
    if (!keys.length) return '<div class="empty-tip">暂无属性加成。</div>';
    return '<div class="preview-stats">' + keys.map(function (key) {
      var diff = compareStats && typeof compareStats[key] === 'number' ? compareStats[key] : 0;
      return '<div class="preview-stat"><span>' + statLabel(key) + '</span><strong>+' + stats[key] + '</strong>' + (diff ? '<span class="stat-diff ' + (diff > 0 ? 'up' : 'down') + '">' + (diff > 0 ? '+' : '') + diff + '</span>' : '') + '</div>';
    }).join('') + '</div>';
  }

  function compareItemToCurrent(item) {
    var player = getPlayer();
    if (!player || !item || item.type !== 'equipment') return {};
    var current = G.Managers.PlayerManager.getEquipmentDetail()[item.equipSlot || item.slot];
    var currentStats = (current && (current.baseStats || current.stats)) || {};
    var nextStats = item.baseStats || item.stats || {};
    var diff = {};
    Object.keys(nextStats).concat(Object.keys(currentStats)).forEach(function (key) {
      if (Object.prototype.hasOwnProperty.call(diff, key)) return;
      var value = (nextStats[key] || 0) - (currentStats[key] || 0);
      if (value) diff[key] = value;
    });
    return diff;
  }

  function itemPreviewHtml(entry) {
    if (!entry || !entry.item) {
      return '<div class="window-kicker">信息面板</div><h3>悬停条目以预览</h3><div class="empty-tip">将鼠标移动到左侧物品或装备上，可查看详细属性、穿戴变化与用途说明。</div>';
    }
    var item = entry.item;
    var tags = [
      '<span class="tag ' + qualityClass(item) + '">' + G.Managers.LibraryManager.getQualityLabel(item.quality) + '</span>',
      '<span class="tag">' + G.Managers.LibraryManager.getItemTypeLabel(item) + '</span>'
    ];
    if (entry.count > 1) tags.push('<span class="tag">数量 x' + entry.count + '</span>');
    if (entry.equipped) tags.push('<span class="tag tag-gold">已装备</span>');
    if (item.buyPrice || item.price) tags.push('<span class="tag">购入 ' + (item.buyPrice || item.price) + '</span>');
    if (item.sellPrice) tags.push('<span class="tag">出售 ' + item.sellPrice + '</span>');

    var compareHtml = '';
    if (item.type === 'equipment') {
      compareHtml = [
        '<div class="preview-section">',
          '<div class="preview-title">穿戴变化</div>',
          previewStatsHtml(item.baseStats || item.stats || {}, compareItemToCurrent(item)),
        '</div>'
      ].join('');
    }
    if (item.type === 'consumable' && item.useEffects) {
      compareHtml = '<div class="preview-section"><div class="preview-title">使用效果</div><div class="muted">' + item.useEffects.map(function (effect) { return effect.target + ' +' + effect.value; }).join(' · ') + '</div></div>';
    }
    return [
      '<div class="window-kicker">' + G.Managers.LibraryManager.getItemTypeLabel(item) + '</div>',
      '<h3 class="' + qualityClass(item) + '">' + item.name + '</h3>',
      '<div class="tag-list">' + tags.join('') + '</div>',
      '<p class="preview-desc">' + (item.desc || '暂无说明') + '</p>',
      item.requirements && item.requirements.level ? '<div class="preview-section"><div class="preview-title">穿戴条件</div><div class="muted">需要等级 ' + item.requirements.level + (item.requirements.faction ? ' · 门派 ' + item.requirements.faction : '') + '</div></div>' : '',
      compareHtml
    ].join('');
  }

  function itemTooltipHtml(entry) {
    if (!entry || !entry.item) return '';
    var item = entry.item;
    return [
      '<div class="tooltip-name ' + qualityClass(item) + '">' + item.name + '</div>',
      '<div class="tooltip-type">' + G.Managers.LibraryManager.getItemTypeLabel(item) + '</div>',
      (item.baseStats || item.stats) ? '<div class="tooltip-stats">' + Object.keys(item.baseStats || item.stats).map(function (key) { return '<div>' + statLabel(key) + ' +' + (item.baseStats || item.stats)[key] + '</div>'; }).join('') + '</div>' : '',
      '<div class="tooltip-desc">' + (item.desc || '暂无说明') + '</div>'
    ].join('');
  }

  function skillPreviewHtml(skill) {
    if (!skill) {
      return '<div class="window-kicker">武学预览</div><h3>悬停武学</h3><div class="empty-tip">将鼠标移动到武学条目上，可查看耗蓝、倍率与定位。</div>';
    }
    return [
      '<div class="window-kicker">武学信息</div>',
      '<h3>' + skill.name + '</h3>',
      '<div class="tag-list"><span class="tag">' + (skill.type === 'support' ? '心法' : '招式') + '</span><span class="tag">内力消耗 ' + (skill.mpCost || 0) + '</span><span class="tag">倍率 ' + (skill.power || 1) + '</span></div>',
      '<p class="preview-desc">' + (skill.desc || '暂无说明') + '</p>',
      '<div class="preview-section"><div class="preview-title">战斗定位</div><div class="muted">' + (skill.type === 'support' ? '用于恢复、稳息或自我强化。' : '用于快速压制敌人、形成连击突破口。') + '</div></div>'
    ].join('');
  }

  function mapPreviewHtml(node, isCurrent) {
    if (!node) {
      return '<div class="window-kicker">地图预览</div><h3>悬停地点</h3><div class="empty-tip">将鼠标移动到地点条目上，可查看区域说明、危险等级与连接路线。</div>';
    }
    return [
      '<div class="window-kicker">地图节点</div>',
      '<h3>' + node.name + '</h3>',
      '<div class="tag-list"><span class="tag">危险 ' + node.danger + '</span><span class="tag">' + G.Worlds.WuxiaRules.getNodeThemeLabel(node) + '</span>' + (isCurrent ? '<span class="tag tag-gold">当前位置</span>' : '') + '</div>',
      '<p class="preview-desc">' + node.desc + '</p>',
      '<div class="preview-section"><div class="preview-title">区域信息</div><div class="muted">可触发事件 ' + ((node.eventPool || []).length) + ' 条 · 可前往 ' + ((node.links || []).length) + ' 个地点</div></div>'
    ].join('');
  }

  function announcementPreviewHtml(entry) {
    if (!entry) {
      return '<div class="window-kicker">公告</div><h3>暂无公告</h3>';
    }
    return [
      '<div class="window-kicker">版本公告</div>',
      '<h3>版本 ' + entry.version + ' · ' + entry.title + '</h3>',
      '<div class="tag-list"><span class="tag">发布时间 ' + entry.date + '</span>' + (entry.current ? '<span class="tag tag-gold">当前版本</span>' : '') + '</div>',
      '<p class="preview-desc">' + (entry.summary || '') + '</p>',
      '<div class="preview-section"><div class="preview-title">更新内容</div><div class="bullet-list">' + entry.notes.map(function (note) { return '<div>· ' + note + '</div>'; }).join('') + '</div></div>'
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

  function bindHoverEntries(root, previewRoot, renderer, tooltipRenderer) {
    Array.prototype.slice.call(root.querySelectorAll('[data-preview-id]')).forEach(function (entry) {
      function activate(event) {
        var rendered = renderer(this.getAttribute('data-preview-id'));
        if (typeof rendered === 'string') previewRoot.innerHTML = rendered;
        Array.prototype.slice.call(root.querySelectorAll('.list-entry')).forEach(function (node) {
          node.classList.remove('is-active');
        });
        this.classList.add('is-active');
        if (tooltipRenderer) showTooltip(tooltipRenderer(this.getAttribute('data-preview-id')), event);
      }
      entry.addEventListener('mouseenter', activate);
      entry.addEventListener('mousemove', function (event) {
        if (tooltipRenderer) moveTooltip(event);
      });
      entry.addEventListener('mouseleave', hideTooltip);
      entry.addEventListener('focus', function () {
        var rendered = renderer(this.getAttribute('data-preview-id'));
        if (typeof rendered === 'string') previewRoot.innerHTML = rendered;
      });
    });
  }

  function attachInventoryActions(previewRoot, entry, player) {
    var item = entry.item;
    var actionRow = document.createElement('div');
    actionRow.className = 'preview-actions';

    if (item.type === 'equipment') {
      var equippedInSlot = player.equipment && player.equipment[item.equipSlot || item.slot] === entry.instanceId;
      var equipBtn = document.createElement('button');
      equipBtn.className = 'btn primary';
      equipBtn.textContent = equippedInSlot ? '卸下' : '装备';
      equipBtn.addEventListener('click', function () {
        var ok = equippedInSlot ? G.Managers.PlayerManager.unequipSlot(item.equipSlot || item.slot) : G.Managers.PlayerManager.equipItem(entry.instanceId || entry.itemId);
        if (ok) {
          G.Managers.SaveManager.save({ silent: true });
          G.UI.HUD.showToast((equippedInSlot ? '已卸下：' : '已装备：') + item.name, 'success');
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
        var useEffects = item.useEffects || [];
        var hp = 0;
        var mp = 0;
        useEffects.forEach(function (effect) {
          if (effect.type === 'recover' && effect.target === 'hp') hp += effect.value;
          if (effect.type === 'recover' && effect.target === 'mp') mp += effect.value;
        });
        if (G.Managers.PlayerManager.useItem(item.id)) {
          G.Managers.PlayerManager.heal(hp, mp);
          G.Managers.SaveManager.save({ silent: true });
          G.UI.HUD.showToast(item.name + ' 已使用', 'success');
          refreshHub('inventory');
        }
      });
      actionRow.appendChild(useBtn);
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
      right.innerHTML = itemPreviewHtml(null);
      content.appendChild(left);
      content.appendChild(right);
      return content;
    }

    left.innerHTML = '<div class="list-stack"></div>';
    var stack = left.querySelector('.list-stack');
    summary.forEach(function (entry, index) {
      var row = document.createElement('button');
      row.className = 'list-entry item-entry ' + qualityClass(entry.item) + (index === 0 ? ' is-active' : '');
      row.setAttribute('data-preview-id', entry.id);
      row.innerHTML = [
        '<span class="entry-main">' + entry.item.name + (entry.equipped ? ' · 已装备' : '') + '</span>',
        '<span class="entry-meta">' + G.Managers.LibraryManager.getItemTypeLabel(entry.item) + (entry.item.equipSlot || entry.item.slot ? ' · ' + slotLabel(entry.item.equipSlot || entry.item.slot) : '') + '</span>',
        '<span class="entry-count">x' + entry.count + '</span>'
      ].join('');
      row.addEventListener('click', function () {
        right.innerHTML = itemPreviewHtml(entry);
        attachInventoryActions(right, entry, player);
      });
      stack.appendChild(row);
    });

    right.innerHTML = itemPreviewHtml(summary[0]);
    attachInventoryActions(right, summary[0], player);
    bindHoverEntries(stack, right, function (id) {
      var found = summary.find(function (entry) { return entry.id === id; });
      return itemPreviewHtml(found);
    }, function (id) {
      var found = summary.find(function (entry) { return entry.id === id; });
      return itemTooltipHtml(found);
    });

    content.appendChild(left);
    content.appendChild(right);
    return content;
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
      left.innerHTML = '<div class="empty-tip">当前地点没有商人。</div>';
      right.innerHTML = itemPreviewHtml(null);
      content.appendChild(left);
      content.appendChild(right);
      return content;
    }

    var summary = merchantPool.map(function (itemId) {
      return { id: itemId, itemId: itemId, item: getItem(itemId), count: 1, equipped: false };
    }).filter(function (entry) { return !!entry.item; });

    left.innerHTML = '<div class="list-stack"></div>';
    var stack = left.querySelector('.list-stack');
    summary.forEach(function (entry, index) {
      var row = document.createElement('button');
      row.className = 'list-entry ' + qualityClass(entry.item) + (index === 0 ? ' is-active' : '');
      row.setAttribute('data-preview-id', entry.id);
      row.innerHTML = [
        '<span class="entry-main">' + entry.item.name + '</span>',
        '<span class="entry-meta">' + G.Managers.LibraryManager.getItemTypeLabel(entry.item) + '</span>',
        '<span class="entry-count">' + (entry.item.buyPrice || entry.item.price || 0) + ' 银</span>'
      ].join('');
      row.addEventListener('click', function () {
        renderShopPreview(right, entry);
      });
      stack.appendChild(row);
    });

    function renderShopPreview(root, entry) {
      root.innerHTML = itemPreviewHtml(entry);
      var buyBtn = document.createElement('button');
      buyBtn.className = 'btn primary';
      buyBtn.textContent = '购买';
      buyBtn.addEventListener('click', function () {
        var result = G.Managers.PlayerManager.buyItem(entry.item.id);
        if (!result.ok) {
          G.UI.HUD.showToast(result.message, 'warning');
          return;
        }
        G.Managers.SaveManager.save({ silent: true });
        G.UI.HUD.showToast('购入：' + entry.item.name, 'success');
        refreshHub('shop');
      });
      root.appendChild(buyBtn);
    }

    renderShopPreview(right, summary[0]);
    bindHoverEntries(stack, right, function (id) {
      var found = summary.find(function (entry) { return entry.id === id; });
      return itemPreviewHtml(found);
    }, function (id) {
      var found = summary.find(function (entry) { return entry.id === id; });
      return itemTooltipHtml(found);
    });

    content.appendChild(left);
    content.appendChild(right);
    return content;
  }

  function buildSkillsWindow() {
    var player = getPlayer();
    var learned = (player.learnedSkills || []).map(function (id) { return getSkill(id); }).filter(Boolean);
    var content = document.createElement('div');
    content.className = 'window-layout';
    var left = document.createElement('div');
    left.className = 'window-list';
    var right = document.createElement('aside');
    right.className = 'window-preview';

    if (!learned.length) {
      left.innerHTML = '<div class="empty-tip">你还没有学会武学。</div>';
      right.innerHTML = skillPreviewHtml(null);
      content.appendChild(left);
      content.appendChild(right);
      return content;
    }

    left.innerHTML = '<div class="list-stack"></div>';
    var stack = left.querySelector('.list-stack');
    learned.forEach(function (skill, index) {
      var row = document.createElement('button');
      row.className = 'list-entry ' + (index === 0 ? ' is-active' : '');
      row.setAttribute('data-preview-id', skill.id);
      row.innerHTML = '<span class="entry-main">' + skill.name + '</span><span class="entry-meta">' + (skill.type === 'support' ? '心法' : '招式') + '</span><span class="entry-count">MP ' + (skill.mpCost || 0) + '</span>';
      row.addEventListener('click', function () {
        right.innerHTML = skillPreviewHtml(skill);
      });
      stack.appendChild(row);
    });

    right.innerHTML = skillPreviewHtml(learned[0]);
    bindHoverEntries(stack, right, function (id) {
      return skillPreviewHtml(getSkill(id));
    }, function (id) {
      var skill = getSkill(id);
      return skill ? '<div class="tooltip-name">' + skill.name + '</div><div class="tooltip-type">' + (skill.type === 'support' ? '心法' : '招式') + '</div><div class="tooltip-desc">' + (skill.desc || '') + '</div>' : '';
    });

    content.appendChild(left);
    content.appendChild(right);
    return content;
  }

  function buildMapWindow() {
    var player = getPlayer();
    var nodes = (G.Data.maps && G.Data.maps.nodes) || [];
    var currentNodeId = player.currentNodeId;
    var content = document.createElement('div');
    content.className = 'window-layout';
    var left = document.createElement('div');
    left.className = 'window-list';
    var right = document.createElement('aside');
    right.className = 'window-preview';
    left.innerHTML = '<div class="list-stack"></div>';
    var stack = left.querySelector('.list-stack');

    nodes.forEach(function (node, index) {
      var unlocked = (player.visitedNodes || []).indexOf(node.id) >= 0 || node.id === currentNodeId || (G.Managers.WorldManager.getCurrentNode().links || []).indexOf(node.id) >= 0;
      var row = document.createElement('button');
      row.className = 'list-entry ' + (index === 0 ? ' is-active' : '');
      row.setAttribute('data-preview-id', node.id);
      row.disabled = !unlocked;
      row.innerHTML = '<span class="entry-main">' + node.name + '</span><span class="entry-meta">' + G.Worlds.WuxiaRules.getNodeThemeLabel(node) + '</span><span class="entry-count">危 ' + node.danger + '</span>';
      row.addEventListener('click', function () {
        renderMapPreview(node);
      });
      stack.appendChild(row);
    });

    function renderMapPreview(node) {
      var isCurrent = node.id === currentNodeId;
      right.innerHTML = mapPreviewHtml(node, isCurrent);
      if (!isCurrent) {
        var goBtn = document.createElement('button');
        goBtn.className = 'btn primary';
        goBtn.textContent = '前往此地';
        goBtn.addEventListener('click', function () {
          G.Managers.WorldManager.travelTo(node.id);
          G.Managers.SaveManager.save({ silent: true });
          G.UI.HUD.showToast('已前往：' + node.name, 'success');
          G.UI.GameWindows.close();
          refreshHub();
        });
        right.appendChild(goBtn);
      }
    }

    renderMapPreview(nodes.find(function (node) { return node.id === currentNodeId; }) || nodes[0]);
    bindHoverEntries(stack, right, function (id) {
      var node = nodes.find(function (entry) { return entry.id === id; });
      return mapPreviewHtml(node, id === currentNodeId);
    }, function (id) {
      var node = nodes.find(function (entry) { return entry.id === id; });
      return node ? '<div class="tooltip-name">' + node.name + '</div><div class="tooltip-type">危险 ' + node.danger + '</div><div class="tooltip-desc">' + node.desc + '</div>' : '';
    });

    content.appendChild(left);
    content.appendChild(right);
    return content;
  }

  function buildProfileWindow() {
    var player = getPlayer();
    if (!player) {
      var emptyContent = document.createElement('div');
      emptyContent.className = 'window-layout';
      var emptyLeft = document.createElement('div');
      emptyLeft.className = 'profile-card';
      emptyLeft.innerHTML = '<div class="window-kicker">角色信息</div><h3>尚未创建角色</h3><p class="preview-desc">先从主菜单或创建角色页进入江湖，再使用个人信息窗口查看装备栏和属性。</p>';
      var emptyRight = document.createElement('aside');
      emptyRight.className = 'window-preview';
      emptyRight.innerHTML = '<div class="window-kicker">提示</div><h3>暂无角色数据</h3><div class="empty-tip">当前存档里没有可展示的角色。新建角色后，这里会显示装备栏、基础属性和最终战斗属性。</div>';
      emptyContent.appendChild(emptyLeft);
      emptyContent.appendChild(emptyRight);
      return emptyContent;
    }
    var equipment = G.Managers.PlayerManager.getEquipmentDetail();
    var breakdown = G.Managers.PlayerManager.getAttributeBreakdown();
    var content = document.createElement('div');
    content.className = 'window-layout';
    var left = document.createElement('div');
    left.className = 'profile-card';
    var right = document.createElement('aside');
    right.className = 'window-preview';

    left.innerHTML = [
      '<div class="window-kicker">角色信息</div>',
      '<h3>' + player.name + ' · Lv.' + player.level + '</h3>',
      '<div class="tag-list"><span class="tag">' + player.backgroundLabel + '</span><span class="tag">' + player.talentLabel + '</span><span class="tag">' + player.factionName + '</span></div>',
      '<div class="preview-section"><div class="preview-title">装备栏</div><div class="slot-stack" id="profile-slot-stack"></div></div>',
      '<div class="preview-section"><div class="preview-title">基础属性</div>' + previewStatsHtml({ maxHp: breakdown.base.maxHp, maxMp: breakdown.base.maxMp, strength: breakdown.base.strength, agility: breakdown.base.agility, constitution: breakdown.base.constitution, insight: breakdown.base.insight }, null) + '</div>',
      '<div class="preview-section"><div class="preview-title">最终战斗属性</div>' + previewStatsHtml({ attack: breakdown.final.attack, defense: breakdown.final.defense, speed: breakdown.final.speed, crit: breakdown.final.crit }, null) + '</div>'
    ].join('');

    var stack = left.querySelector('#profile-slot-stack');
    ['weapon', 'armor', 'accessory'].forEach(function (slot, index) {
      var entry = equipment[slot];
      var row = document.createElement('button');
      row.className = 'list-entry ' + (index === 0 ? ' is-active' : '');
      row.setAttribute('data-preview-id', slot);
      row.innerHTML = '<span class="entry-main">' + slotLabel(slot) + '</span><span class="entry-meta">' + (entry ? entry.name : '未装备') + '</span><span class="entry-count">' + (entry ? '已穿戴' : '--') + '</span>';
      row.addEventListener('click', function () {
        renderProfilePreview(slot, entry);
      });
      stack.appendChild(row);
    });

    function renderProfilePreview(slot, entry) {
      if (!entry) {
        right.innerHTML = '<div class="window-kicker">装备预览</div><h3>' + slotLabel(slot) + '</h3><div class="empty-tip">当前槽位未装备物品。</div>';
        return;
      }
      right.innerHTML = itemPreviewHtml({ item: entry, count: 1, equipped: true, instanceId: entry.instanceId, itemId: entry.itemId });
      var unequipBtn = document.createElement('button');
      unequipBtn.className = 'btn primary';
      unequipBtn.textContent = '卸下装备';
      unequipBtn.addEventListener('click', function () {
        if (G.Managers.PlayerManager.unequipSlot(slot)) {
          G.Managers.SaveManager.save({ silent: true });
          G.UI.HUD.showToast('已卸下：' + entry.name, 'success');
          refreshHub('profile');
        }
      });
      right.appendChild(unequipBtn);
    }

    renderProfilePreview('weapon', equipment.weapon || null);
    bindHoverEntries(stack, right, function (slot) {
      var item = equipment[slot] || null;
      return item ? itemPreviewHtml({ item: item, count: 1, equipped: true, instanceId: item.instanceId, itemId: item.itemId }) : '<div class="window-kicker">装备预览</div><h3>' + slotLabel(slot) + '</h3><div class="empty-tip">当前槽位未装备物品。</div>';
    }, function (slot) {
      var item = equipment[slot] || null;
      return item ? itemTooltipHtml({ item: item, count: 1 }) : '<div class="tooltip-name">' + slotLabel(slot) + '</div><div class="tooltip-desc">当前槽位未装备物品。</div>';
    });

    content.appendChild(left);
    content.appendChild(right);
    return content;
  }

  function buildAnnouncementWindow() {
    var announcements = G.Managers.AnnouncementManager.getAll().map(function (entry) {
      return Object.assign({ current: entry.version === G.version }, entry);
    });
    var content = document.createElement('div');
    content.className = 'window-layout';
    var left = document.createElement('div');
    left.className = 'window-list';
    var right = document.createElement('aside');
    right.className = 'window-preview';

    left.innerHTML = '<div class="list-stack"></div>';
    var stack = left.querySelector('.list-stack');
    announcements.forEach(function (entry, index) {
      var row = document.createElement('button');
      row.className = 'list-entry ' + (index === 0 ? ' is-active' : '');
      row.setAttribute('data-preview-id', entry.version);
      row.innerHTML = '<span class="entry-main">' + entry.version + ' · ' + entry.title + '</span><span class="entry-meta">' + entry.date + '</span><span class="entry-count">' + (entry.current ? '当前' : '历史') + '</span>';
      row.addEventListener('click', function () {
        right.innerHTML = announcementPreviewHtml(entry);
      });
      stack.appendChild(row);
    });

    if (announcements.length) {
      right.innerHTML = announcementPreviewHtml(announcements[0]);
    } else {
      right.innerHTML = announcementPreviewHtml(null);
    }
    bindHoverEntries(stack, right, function (version) {
      var entry = announcements.find(function (row) { return row.version === version; });
      return announcementPreviewHtml(entry);
    }, function (version) {
      var entry = announcements.find(function (row) { return row.version === version; });
      return entry ? '<div class="tooltip-name">版本 ' + entry.version + '</div><div class="tooltip-type">' + entry.date + '</div><div class="tooltip-desc">' + (entry.summary || '') + '</div>' : '';
    });

    G.Managers.AnnouncementManager.markCurrentSeen();
    content.appendChild(left);
    content.appendChild(right);
    return content;
  }

  function buildAdminWindow() {
    var content = document.createElement('div');
    content.className = 'window-layout';
    var left = document.createElement('div');
    left.className = 'profile-card';
    var right = document.createElement('aside');
    right.className = 'window-preview';
    var player = getPlayer();
    if (!player) {
      left.innerHTML = '<div class="window-kicker">后台 / 管理</div><h3>尚未进入江湖</h3><p class="preview-desc">主菜单阶段可先查看公告；进入游戏后，这里会开放本地存档调试与导入导出操作。</p>';
      right.innerHTML = '<div class="window-kicker">当前状态</div><h3>无可用角色</h3><div class="empty-tip">创建角色后可在这里恢复状态、增加银两、发放物品，以及导入导出存档。</div>';
      content.appendChild(left);
      content.appendChild(right);
      return content;
    }

    left.innerHTML = [
      '<div class="window-kicker">后台 / 管理</div>',
      '<h3>游戏内管理面板</h3>',
      '<p class="preview-desc">用于测试、调试和维护当前本地存档。纯前端版本下，这里就是你的游戏内后台入口。</p>',
      '<div class="preview-actions admin-actions">',
        '<button class="btn primary" id="admin-heal">恢复满状态</button>',
        '<button class="btn" id="admin-money">银两 + 50</button>',
        '<button class="btn" id="admin-bandage">发放绷带</button>',
        '<button class="btn" id="admin-export">导出存档</button>',
        '<button class="btn" id="admin-import">导入存档</button>',
      '</div>'
    ].join('');

    function refreshAdminInfo() {
      var current = getPlayer();
      right.innerHTML = [
        '<div class="window-kicker">当前存档</div>',
        '<h3>' + current.name + ' · Lv.' + current.level + '</h3>',
        '<div class="tag-list"><span class="tag">银两 ' + current.money + '</span><span class="tag">绷带 ' + G.Managers.PlayerManager.getItemCount('bandage') + '</span><span class="tag">地点 ' + current.currentNodeId + '</span></div>',
        '<div class="preview-section"><div class="preview-title">管理说明</div><div class="bullet-list"><div>· 导出/导入走本地文件，不依赖服务器。</div><div>· 所有调试变更会写入本地存档。</div><div>· 公告窗口会展示每个版本的更新记录。</div></div></div>'
      ].join('');
    }

    left.querySelector('#admin-heal').addEventListener('click', function () {
      G.Managers.PlayerManager.heal(999, 999);
      G.Managers.SaveManager.save({ silent: true });
      G.UI.HUD.showToast('已恢复满状态', 'success');
      refreshHub('admin');
    });
    left.querySelector('#admin-money').addEventListener('click', function () {
      G.Managers.PlayerManager.gainMoney(50);
      G.Managers.SaveManager.save({ silent: true });
      G.UI.HUD.showToast('银两 +50', 'success');
      refreshHub('admin');
    });
    left.querySelector('#admin-bandage').addEventListener('click', function () {
      G.Managers.PlayerManager.addItem('bandage');
      G.Managers.SaveManager.save({ silent: true });
      G.UI.HUD.showToast('发放绷带 x1', 'success');
      refreshHub('admin');
    });
    left.querySelector('#admin-export').addEventListener('click', function () {
      G.Managers.SaveManager.exportSave();
    });
    left.querySelector('#admin-import').addEventListener('click', function () {
      if (typeof G.State.requestSaveImport === 'function') G.State.requestSaveImport();
    });

    refreshAdminInfo();
    content.appendChild(left);
    content.appendChild(right);
    return content;
  }

  function createWindow(key) {
    if (key === 'profile') return modalShell('个人信息', '角色 / 穿戴 / 属性', buildProfileWindow());
    if (key === 'inventory') return modalShell('背包', '统一物品存储', buildInventoryWindow());
    if (key === 'shop') return modalShell('商城', '当前地点商人', buildShopWindow());
    if (key === 'skills') return modalShell('技能', '已学武学', buildSkillsWindow());
    if (key === 'map') return modalShell('地图', '节点探索', buildMapWindow());
    if (key === 'announcement') return modalShell('公告', '版本更新记录', buildAnnouncementWindow());
    if (key === 'admin') return modalShell('后台', '游戏内管理面板', buildAdminWindow());
    return null;
  }

  G.UI.GameWindows = {
    open: function (key) {
      var root = getModalRoot();
      if (!root) return;
      currentWindowKey = key;
      root.innerHTML = '';
      var win = createWindow(key);
      if (win) root.appendChild(win);
      hideTooltip();
      G.State.leftDrawerOpen = false;
      G.State.rightDrawerOpen = false;
      G.State.systemDrawerOpen = false;
    },
    close: function () {
      var root = getModalRoot();
      if (root) root.innerHTML = '';
      currentWindowKey = null;
      hideTooltip();
    },
    buildSideDrawer: function (side) {
      var isLeft = side === 'left';
      var stateKey = isLeft ? 'leftDrawerOpen' : 'rightDrawerOpen';
      var wrap = document.createElement('div');
      wrap.className = 'side-drawer-wrap ' + (isLeft ? 'left-side-drawer' : 'right-side-drawer') + (G.State[stateKey] ? ' is-open' : '');
      var unread = (!isLeft && G.Managers.AnnouncementManager.hasUnreadCurrent()) ? '<span class="corner-dot"></span>' : '';
      var primary = [
        '<button class="drawer-btn" data-window="profile">个人信息</button>',
        '<button class="drawer-btn" data-window="inventory">背包</button>',
        '<button class="drawer-btn" data-window="skills">技能</button>',
        '<button class="drawer-btn" data-window="map">地图</button>',
        '<button class="drawer-btn" data-window="shop">商场</button>'
      ].join('');
      var secondary = isLeft ? '' : [
        '<div class="drawer-separator"></div>',
        '<button class="drawer-btn drawer-btn-small" data-window="announcement">公告' + unread + '</button>',
        '<button class="drawer-btn drawer-btn-small" data-window="admin">后台</button>'
      ].join('');
      wrap.innerHTML = [
        '<button class="side-triangle-btn" aria-label="侧边菜单">' + (isLeft ? '◁' : '▷') + '</button>',
        '<div class="side-drawer-panel">',
          primary,
          secondary,
        '</div>'
      ].join('');
      wrap.querySelector('.side-triangle-btn').addEventListener('click', function () {
        G.State[stateKey] = !G.State[stateKey];
        wrap.classList.toggle('is-open', G.State[stateKey]);
      });
      Array.prototype.slice.call(wrap.querySelectorAll('.drawer-btn')).forEach(function (btn) {
        btn.addEventListener('click', function () {
          G.State.leftDrawerOpen = false;
          G.State.rightDrawerOpen = false;
          G.UI.GameWindows.open(btn.getAttribute('data-window'));
        });
      });
      return wrap;
    }
  };
})(window.TransmigratorGame);
