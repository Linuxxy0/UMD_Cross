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

  function normalizeQuality(quality) {
    return {
      white: 'common',
      common: 'common',
      green: 'uncommon',
      uncommon: 'uncommon',
      blue: 'rare',
      rare: 'rare',
      purple: 'epic',
      epic: 'epic',
      orange: 'legendary',
      legendary: 'legendary'
    }[quality] || 'common';
  }

  function qualityClass(item) {
    return 'quality-' + normalizeQuality((item && item.quality) || 'common');
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

  function itemGroupLabel(item) {
    if (!item) return '未知';
    if (item.type === 'equipment') return slotLabel(item.equipSlot || item.slot || item.subType);
    return {
      consumable: '消耗',
      material: '材料',
      quest: '任务'
    }[item.type] || '物品';
  }

  function itemGlyph(item) {
    if (!item) return '物';
    if (item.type === 'equipment') {
      return {
        weapon: '武',
        armor: '甲',
        accessory: '饰'
      }[item.equipSlot || item.slot || item.subType] || '装';
    }
    return {
      consumable: '药',
      material: '材',
      quest: '任'
    }[item.type] || '物';
  }

  function skillTypeLabel(skill) {
    if (!skill) return '武学';
    return skill.type === 'support' || skill.type === 'inner' ? '心法' : '招式';
  }

  function skillGlyph(skill) {
    return skillTypeLabel(skill) === '心法' ? '诀' : '技';
  }

  function tabButtonHtml(key, label, active, count) {
    return '<button class="window-tab' + (active ? ' is-active' : '') + '" data-tab="' + key + '">' + label + (typeof count === 'number' ? '<span>' + count + '</span>' : '') + '</button>';
  }

  function entryHtml(icon, main, meta, count, extraClass) {
    return [
      '<span class="entry-frame ' + (extraClass || '') + '"><span class="entry-icon">' + icon + '</span></span>',
      '<span class="entry-lines">',
        '<span class="entry-main">' + main + '</span>',
        '<span class="entry-meta">' + meta + '</span>',
      '</span>',
      '<span class="entry-count">' + count + '</span>'
    ].join('');
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
      '<div class="tag-list"><span class="tag">' + skillTypeLabel(skill) + '</span><span class="tag">内力消耗 ' + (skill.mpCost || 0) + '</span><span class="tag">倍率 ' + (skill.power || 1) + '</span></div>',
      '<p class="preview-desc">' + (skill.desc || '暂无说明') + '</p>',
      '<div class="preview-section"><div class="preview-title">战斗定位</div><div class="muted">' + (skillTypeLabel(skill) === '心法' ? '用于恢复、稳息或构筑持续作战节奏。' : '用于爆发、压制与连续进攻。') + '</div></div>'
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
    win.className = 'dnf-window dnf-window-hardline';

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

  function getPageMeta(list, pageIndex, pageSize) {
    var totalPages = Math.max(1, Math.ceil((list.length || 0) / pageSize));
    var clamped = Math.max(0, Math.min(pageIndex, totalPages - 1));
    return {
      pageIndex: clamped,
      totalPages: totalPages,
      items: list.slice(clamped * pageSize, clamped * pageSize + pageSize)
    };
  }

  function renderPager(root, meta, onChange) {
    if (!root) return;
    root.innerHTML = [
      '<button class="window-page-btn" data-act="prev" ' + (meta.pageIndex <= 0 ? 'disabled' : '') + '>◀ 上一页</button>',
      '<span class="window-page-readout">第 ' + (meta.pageIndex + 1) + ' / ' + meta.totalPages + ' 页</span>',
      '<button class="window-page-btn" data-act="next" ' + (meta.pageIndex >= meta.totalPages - 1 ? 'disabled' : '') + '>下一页 ▶</button>'
    ].join('');
    Array.prototype.slice.call(root.querySelectorAll('.window-page-btn')).forEach(function (btn) {
      btn.addEventListener('click', function () {
        var delta = btn.getAttribute('data-act') === 'next' ? 1 : -1;
        onChange(delta);
      });
    });
  }

  function setDragPayload(payload) {
    G.State.dragPayload = payload || null;
  }

  function getDragPayload() {
    return G.State.dragPayload || null;
  }

  function clearDragPayload() {
    G.State.dragPayload = null;
  }

  function makeDraggable(node, payload) {
    if (!node) return;
    node.setAttribute('draggable', 'true');
    node.addEventListener('dragstart', function (event) {
      setDragPayload(payload);
      node.classList.add('is-dragging');
      if (event.dataTransfer) {
        event.dataTransfer.effectAllowed = 'move';
        event.dataTransfer.setData('text/plain', payload.type || payload.kind || 'drag');
      }
    });
    node.addEventListener('dragend', function () {
      clearDragPayload();
      node.classList.remove('is-dragging');
      Array.prototype.slice.call(document.querySelectorAll('.is-drop-target')).forEach(function (target) {
        target.classList.remove('is-drop-target');
      });
    });
  }

  function makeDroppable(node, handler) {
    if (!node) return;
    node.addEventListener('dragenter', function (event) {
      event.preventDefault();
      node.classList.add('is-drop-target');
    });
    node.addEventListener('dragover', function (event) {
      event.preventDefault();
      if (event.dataTransfer) event.dataTransfer.dropEffect = 'move';
      node.classList.add('is-drop-target');
    });
    node.addEventListener('dragleave', function () {
      node.classList.remove('is-drop-target');
    });
    node.addEventListener('drop', function (event) {
      event.preventDefault();
      node.classList.remove('is-drop-target');
      var payload = getDragPayload();
      clearDragPayload();
      if (payload) handler(payload);
    });
  }

  function quickbarSlotLabel(skill) {
    return skill ? (skillTypeLabel(skill) === '心法' ? '诀' : '技') : '+';
  }

  function renderQuickbarBlock(root, options) {
    if (!root) return;
    var quickbar = G.Managers.PlayerManager.getQuickbar();
    root.innerHTML = quickbar.map(function (skillId, index) {
      var skill = skillId ? getSkill(skillId) : null;
      var qClass = skill ? (skillTypeLabel(skill) === '心法' ? 'quality-rare' : 'quality-uncommon') : 'quality-common';
      return [
        '<button class="skill-quick-slot ' + qClass + '" data-quick-slot="' + index + '">',
          '<span class="quick-slot-index">' + (index + 1) + '</span>',
          '<span class="quick-slot-glyph">' + quickbarSlotLabel(skill) + '</span>',
          '<span class="quick-slot-name">' + (skill ? skill.name : '拖拽技能到此') + '</span>',
        '</button>'
      ].join('');
    }).join('');
    Array.prototype.slice.call(root.querySelectorAll('.skill-quick-slot')).forEach(function (slotNode) {
      var slotIndex = Number(slotNode.getAttribute('data-quick-slot'));
      makeDroppable(slotNode, function (payload) {
        if (payload.type !== 'skill') return;
        if (G.Managers.PlayerManager.setQuickbarSkill(slotIndex, payload.skillId)) {
          G.Managers.SaveManager.save({ silent: true });
          G.UI.HUD.showToast('快捷栏已设置', 'success');
          if (options && typeof options.onChange === 'function') options.onChange();
          else refreshHub('skills');
        }
      });
      slotNode.addEventListener('contextmenu', function (event) {
        event.preventDefault();
        G.Managers.PlayerManager.clearQuickbarSlot(slotIndex);
        G.Managers.SaveManager.save({ silent: true });
        if (options && typeof options.onChange === 'function') options.onChange();
        else refreshHub('skills');
      });
      slotNode.addEventListener('click', function () {
        var skillId = G.Managers.PlayerManager.getQuickbar()[slotIndex];
        if (!skillId) return;
        if (options && typeof options.onSelect === 'function') options.onSelect(skillId, slotIndex);
      });
    });
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
      left.innerHTML = '<div class="window-toolbar"><div><div class="window-toolbar-title">仓库清单</div><div class="window-toolbar-sub">当前未持有任何物品</div></div></div><div class="empty-tip">你的背包暂时还是空的。</div>';
      right.innerHTML = itemPreviewHtml(null);
      content.appendChild(left);
      content.appendChild(right);
      return content;
    }

    var activeFilter = 'all';
    var pageState = { value: 0 };
    var pageSize = 12;
    left.innerHTML = [
      '<div class="window-toolbar storage-toolbar">',
        '<div><div class="window-toolbar-title">分页仓库</div><div class="window-toolbar-sub">更接近 DNF 的仓库浏览：分页、品质边框、装备可直接拖拽到人物槽位。</div></div>',
        '<div class="window-tabs">',
          tabButtonHtml('all', '全部', true, summary.length),
          tabButtonHtml('equipment', '装备', false, summary.filter(function (entry) { return entry.item.type === 'equipment'; }).length),
          tabButtonHtml('consumable', '消耗', false, summary.filter(function (entry) { return entry.item.type === 'consumable'; }).length),
          tabButtonHtml('other', '其他', false, summary.filter(function (entry) { return entry.item.type !== 'equipment' && entry.item.type !== 'consumable'; }).length),
        '</div>',
        '<div class="window-pager"></div>',
      '</div>',
      '<div class="list-stack inventory-stack paged-storage"></div>'
    ].join('');

    var stack = left.querySelector('.inventory-stack');
    var pager = left.querySelector('.window-pager');

    function matches(entry) {
      if (activeFilter === 'all') return true;
      if (activeFilter === 'equipment') return entry.item.type === 'equipment';
      if (activeFilter === 'consumable') return entry.item.type === 'consumable';
      return entry.item.type !== 'equipment' && entry.item.type !== 'consumable';
    }

    function renderPreview(entry) {
      right.innerHTML = itemPreviewHtml(entry);
      attachInventoryActions(right, entry, player);
    }

    function renderList() {
      var filtered = summary.filter(matches);
      var meta = getPageMeta(filtered, pageState.value, pageSize);
      pageState.value = meta.pageIndex;
      stack.innerHTML = '';
      if (!filtered.length) {
        stack.innerHTML = '<div class="empty-tip">该分类下暂无物品。</div>';
        right.innerHTML = itemPreviewHtml(null);
        renderPager(pager, meta, function () {});
        return;
      }
      meta.items.forEach(function (entry, index) {
        var row = document.createElement('button');
        row.className = 'list-entry item-entry ' + qualityClass(entry.item) + (index === 0 ? ' is-active' : '');
        row.setAttribute('data-preview-id', entry.id);
        row.innerHTML = entryHtml(
          itemGlyph(entry.item),
          entry.item.name + (entry.equipped ? ' · 已装备' : ''),
          itemGroupLabel(entry.item) + (entry.item.equipSlot || entry.item.slot ? ' · ' + slotLabel(entry.item.equipSlot || entry.item.slot) : ''),
          'x' + entry.count,
          qualityClass(entry.item)
        );
        row.addEventListener('click', function () {
          renderPreview(entry);
        });
        if (entry.item.type === 'equipment') {
          makeDraggable(row, { type: 'inventory-item', reference: entry.instanceId || entry.itemId, slot: entry.item.equipSlot || entry.item.slot, itemId: entry.item.id });
        }
        stack.appendChild(row);
      });
      renderPreview(meta.items[0]);
      bindHoverEntries(stack, right, function (id) {
        var found = meta.items.find(function (entry) { return entry.id === id; });
        return itemPreviewHtml(found);
      }, function (id) {
        var found = meta.items.find(function (entry) { return entry.id === id; });
        return itemTooltipHtml(found);
      });
      renderPager(pager, meta, function (delta) {
        pageState.value += delta;
        renderList();
      });
    }

    Array.prototype.slice.call(left.querySelectorAll('.window-tab')).forEach(function (btn) {
      btn.addEventListener('click', function () {
        activeFilter = btn.getAttribute('data-tab');
        pageState.value = 0;
        Array.prototype.slice.call(left.querySelectorAll('.window-tab')).forEach(function (node) { node.classList.remove('is-active'); });
        btn.classList.add('is-active');
        renderList();
      });
    });

    renderList();
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
      left.innerHTML = '<div class="window-toolbar"><div><div class="window-toolbar-title">商会货架</div><div class="window-toolbar-sub">当前地点暂无商人。</div></div></div><div class="empty-tip">当前地点没有商人。</div>';
      right.innerHTML = itemPreviewHtml(null);
      content.appendChild(left);
      content.appendChild(right);
      return content;
    }

    var summary = merchantPool.map(function (itemId) {
      return { id: itemId, itemId: itemId, item: getItem(itemId), count: 1, equipped: false };
    }).filter(function (entry) { return !!entry.item; });
    var activeFilter = 'all';
    var pageState = { value: 0 };
    var pageSize = 10;

    left.innerHTML = [
      '<div class="window-toolbar storage-toolbar">',
        '<div><div class="window-toolbar-title">商会货架</div><div class="window-toolbar-sub">分页货架与品质边框，让商店浏览更像传统页游客户端。</div></div>',
        '<div class="window-tabs">',
          tabButtonHtml('all', '全部', true, summary.length),
          tabButtonHtml('equipment', '装备', false, summary.filter(function (entry) { return entry.item.type === 'equipment'; }).length),
          tabButtonHtml('consumable', '药品', false, summary.filter(function (entry) { return entry.item.type === 'consumable'; }).length),
          tabButtonHtml('other', '其他', false, summary.filter(function (entry) { return entry.item.type !== 'equipment' && entry.item.type !== 'consumable'; }).length),
        '</div>',
        '<div class="window-pager"></div>',
      '</div>',
      '<div class="list-stack shop-stack paged-storage"></div>'
    ].join('');

    var stack = left.querySelector('.shop-stack');
    var pager = left.querySelector('.window-pager');

    function matches(entry) {
      if (activeFilter === 'all') return true;
      if (activeFilter === 'equipment') return entry.item.type === 'equipment';
      if (activeFilter === 'consumable') return entry.item.type === 'consumable';
      return entry.item.type !== 'equipment' && entry.item.type !== 'consumable';
    }

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

    function renderList() {
      var filtered = summary.filter(matches);
      var meta = getPageMeta(filtered, pageState.value, pageSize);
      pageState.value = meta.pageIndex;
      stack.innerHTML = '';
      if (!filtered.length) {
        stack.innerHTML = '<div class="empty-tip">该分类暂无可购买物品。</div>';
        right.innerHTML = itemPreviewHtml(null);
        renderPager(pager, meta, function () {});
        return;
      }
      meta.items.forEach(function (entry, index) {
        var row = document.createElement('button');
        row.className = 'list-entry ' + qualityClass(entry.item) + (index === 0 ? ' is-active' : '');
        row.setAttribute('data-preview-id', entry.id);
        row.innerHTML = entryHtml(
          itemGlyph(entry.item),
          entry.item.name,
          itemGroupLabel(entry.item),
          (entry.item.buyPrice || entry.item.price || 0) + ' 银',
          qualityClass(entry.item)
        );
        row.addEventListener('click', function () {
          renderShopPreview(right, entry);
        });
        stack.appendChild(row);
      });
      renderShopPreview(right, meta.items[0]);
      bindHoverEntries(stack, right, function (id) {
        var found = meta.items.find(function (entry) { return entry.id === id; });
        return itemPreviewHtml(found);
      }, function (id) {
        var found = meta.items.find(function (entry) { return entry.id === id; });
        return itemTooltipHtml(found);
      });
      renderPager(pager, meta, function (delta) {
        pageState.value += delta;
        renderList();
      });
    }

    Array.prototype.slice.call(left.querySelectorAll('.window-tab')).forEach(function (btn) {
      btn.addEventListener('click', function () {
        activeFilter = btn.getAttribute('data-tab');
        pageState.value = 0;
        Array.prototype.slice.call(left.querySelectorAll('.window-tab')).forEach(function (node) { node.classList.remove('is-active'); });
        btn.classList.add('is-active');
        renderList();
      });
    });

    renderList();
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
      left.innerHTML = '<div class="window-toolbar"><div><div class="window-toolbar-title">武学总览</div><div class="window-toolbar-sub">当前尚未习得任何武学。</div></div></div><div class="empty-tip">你还没有学会武学。</div>';
      right.innerHTML = skillPreviewHtml(null);
      content.appendChild(left);
      content.appendChild(right);
      return content;
    }

    var activeFilter = 'all';
    var pageState = { value: 0 };
    var pageSize = 10;
    left.innerHTML = [
      '<div class="window-toolbar">',
        '<div><div class="window-toolbar-title">武学总览</div><div class="window-toolbar-sub">支持拖拽武学到右侧快捷栏；右键快捷栏槽位可清空。</div></div>',
        '<div class="window-tabs">',
          tabButtonHtml('all', '全部', true, learned.length),
          tabButtonHtml('attack', '招式', false, learned.filter(function (skill) { return skillTypeLabel(skill) === '招式'; }).length),
          tabButtonHtml('support', '心法', false, learned.filter(function (skill) { return skillTypeLabel(skill) === '心法'; }).length),
        '</div>',
        '<div class="window-pager"></div>',
      '</div>',
      '<div class="list-stack skill-stack paged-storage"></div>'
    ].join('');

    var stack = left.querySelector('.skill-stack');
    var pager = left.querySelector('.window-pager');

    function matches(skill) {
      if (activeFilter === 'all') return true;
      if (activeFilter === 'attack') return skillTypeLabel(skill) === '招式';
      return skillTypeLabel(skill) === '心法';
    }

    function renderSkillPreview(skill) {
      right.innerHTML = [
        '<div class="preview-section"><div class="preview-title">技能快捷栏</div><div class="skill-quickbar-grid" id="skill-quickbar-grid"></div><div class="muted">拖拽左侧武学到槽位；右键槽位可清空。</div></div>',
        skillPreviewHtml(skill)
      ].join('');
      renderQuickbarBlock(right.querySelector('#skill-quickbar-grid'), {
        onChange: function () {
          renderSkillPreview(skill);
        },
        onSelect: function (skillId) {
          var selected = getSkill(skillId);
          if (selected) {
            var preview = right.querySelector('.window-kicker') ? right : null;
            renderSkillPreview(selected);
          }
        }
      });
    }

    function renderList() {
      var filtered = learned.filter(matches);
      var meta = getPageMeta(filtered, pageState.value, pageSize);
      pageState.value = meta.pageIndex;
      stack.innerHTML = '';
      if (!filtered.length) {
        stack.innerHTML = '<div class="empty-tip">该分类暂无武学。</div>';
        right.innerHTML = skillPreviewHtml(null);
        renderPager(pager, meta, function () {});
        return;
      }
      meta.items.forEach(function (skill, index) {
        var row = document.createElement('button');
        row.className = 'list-entry ' + (index === 0 ? ' is-active' : '');
        row.setAttribute('data-preview-id', skill.id);
        row.innerHTML = entryHtml(skillGlyph(skill), skill.name, skillTypeLabel(skill), 'MP ' + (skill.mpCost || 0), skillTypeLabel(skill) === '心法' ? 'quality-rare' : 'quality-uncommon');
        row.addEventListener('click', function () {
          renderSkillPreview(skill);
        });
        makeDraggable(row, { type: 'skill', skillId: skill.id });
        stack.appendChild(row);
      });
      renderSkillPreview(meta.items[0]);
      bindHoverEntries(stack, right, function (id) {
        return skillPreviewHtml(getSkill(id));
      }, function (id) {
        var skill = getSkill(id);
        return skill ? '<div class="tooltip-name">' + skill.name + '</div><div class="tooltip-type">' + skillTypeLabel(skill) + '</div><div class="tooltip-desc">' + (skill.desc || '') + '</div>' : '';
      });
      renderPager(pager, meta, function (delta) {
        pageState.value += delta;
        renderList();
      });
    }

    Array.prototype.slice.call(left.querySelectorAll('.window-tab')).forEach(function (btn) {
      btn.addEventListener('click', function () {
        activeFilter = btn.getAttribute('data-tab');
        pageState.value = 0;
        Array.prototype.slice.call(left.querySelectorAll('.window-tab')).forEach(function (node) { node.classList.remove('is-active'); });
        btn.classList.add('is-active');
        renderList();
      });
    });

    renderList();
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
      row.innerHTML = entryHtml('图', node.name, G.Worlds.WuxiaRules.getNodeThemeLabel(node), '危 ' + node.danger, unlocked ? 'quality-rare' : 'quality-common');
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
      '<div class="preview-section"><div class="preview-title">装备栏</div><div class="equipment-grid" id="profile-slot-stack"></div><div class="muted">可直接把背包中的装备拖拽到对应槽位。</div></div>',
      '<div class="preview-section"><div class="preview-title">基础属性</div>' + previewStatsHtml({ maxHp: breakdown.base.maxHp, maxMp: breakdown.base.maxMp, strength: breakdown.base.strength, agility: breakdown.base.agility, constitution: breakdown.base.constitution, insight: breakdown.base.insight }, null) + '</div>',
      '<div class="preview-section"><div class="preview-title">最终战斗属性</div>' + previewStatsHtml({ attack: breakdown.final.attack, defense: breakdown.final.defense, speed: breakdown.final.speed, crit: breakdown.final.crit }, null) + '</div>'
    ].join('');

    var stack = left.querySelector('#profile-slot-stack');

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

    ['weapon', 'armor', 'accessory'].forEach(function (slot, index) {
      var entry = equipment[slot];
      var row = document.createElement('button');
      row.className = 'equipment-slot-card ' + (entry ? ('filled ' + qualityClass(entry)) : 'empty quality-common') + (index === 0 ? ' is-active' : '');
      row.setAttribute('data-preview-id', slot);
      row.innerHTML = [
        '<span class="slot-corner">' + (slot === 'weapon' ? '武' : (slot === 'armor' ? '甲' : '饰')) + '</span>',
        '<span class="slot-label">' + slotLabel(slot) + '</span>',
        '<strong class="slot-item-name">' + (entry ? entry.name : '未装备') + '</strong>',
        '<span class="slot-tip">' + (entry ? '点击查看 / 拖拽可更换' : '拖拽装备到此') + '</span>'
      ].join('');
      row.addEventListener('click', function () {
        renderProfilePreview(slot, entry);
        Array.prototype.slice.call(stack.querySelectorAll('.equipment-slot-card')).forEach(function (node) { node.classList.remove('is-active'); });
        row.classList.add('is-active');
      });
      makeDroppable(row, function (payload) {
        if (payload.type !== 'inventory-item') return;
        var refEntry = G.Managers.PlayerManager.getInventoryEntry(payload.reference);
        var refItem = refEntry ? G.Managers.PlayerManager.getItemById(refEntry.itemId) : null;
        if (!refItem || refItem.type !== 'equipment') return;
        var targetSlot = refItem.equipSlot || refItem.slot;
        if (targetSlot !== slot) {
          G.UI.HUD.showToast('装备类型不匹配该槽位', 'warning');
          return;
        }
        if (G.Managers.PlayerManager.equipItem(payload.reference)) {
          G.Managers.SaveManager.save({ silent: true });
          G.UI.HUD.showToast('已装备：' + refItem.name, 'success');
          refreshHub('profile');
        }
      });
      stack.appendChild(row);
    });

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
      row.innerHTML = entryHtml('告', entry.version + ' · ' + entry.title, entry.date, entry.current ? '当前' : '历史', entry.current ? 'quality-legendary' : 'quality-common');
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
