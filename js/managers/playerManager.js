(function (G) {
  var baseTemplates = {
    scholar: { label: '落魄书生', strength: 5, agility: 6, constitution: 6, insight: 9, hp: 72, mp: 42, money: 18, starterItems: ['cloth_robe'] },
    escort: { label: '镖局杂役', strength: 8, agility: 7, constitution: 8, insight: 5, hp: 92, mp: 24, money: 12, starterItems: ['steel_sword'] },
    wanderer: { label: '逃亡旅人', strength: 6, agility: 9, constitution: 6, insight: 7, hp: 78, mp: 30, money: 15, starterItems: ['traveler_boots'] }
  };

  var talentModifiers = {
    meridian: { label: '天生奇脉', maxMp: 20, mp: 20, insight: 1 },
    memory: { label: '过目不忘', insight: 2, agility: 1 },
    streetwise: { label: '街头智慧', money: 18, reputation: 2 },
    anomaly: { label: '命格异常', fate: 3 },
    modern: { label: '现代思维', insight: 1, reputation: 1, maxHp: 6 }
  };

  function getItem(itemId) {
    return G.Managers.LibraryManager.getItemById(itemId);
  }

  function createFactionRep() {
    var reps = {};
    ((G.Data.world && G.Data.world.factions) || []).forEach(function (faction) {
      reps[faction.id] = 0;
    });
    return reps;
  }

  function ensureFactionRep(player) {
    player.factionReputation = player.factionReputation || createFactionRep();
    ((G.Data.world && G.Data.world.factions) || []).forEach(function (faction) {
      if (typeof player.factionReputation[faction.id] !== 'number') player.factionReputation[faction.id] = 0;
    });
  }

  function ensureBaseStats(player) {
    player.baseStats = player.baseStats || {
      maxHp: player.maxHp,
      maxMp: player.maxMp,
      strength: player.strength,
      agility: player.agility,
      constitution: player.constitution,
      insight: player.insight
    };
    player.maxHp = player.baseStats.maxHp;
    player.maxMp = player.baseStats.maxMp;
    player.strength = player.baseStats.strength;
    player.agility = player.baseStats.agility;
    player.constitution = player.baseStats.constitution;
    player.insight = player.baseStats.insight;
  }

  function ensureEquipmentSlots(player) {
    player.equipment = player.equipment || { weapon: null, armor: null, accessory: null };
    ['weapon', 'armor', 'accessory'].forEach(function (slot) {
      if (!Object.prototype.hasOwnProperty.call(player.equipment, slot)) player.equipment[slot] = null;
    });
  }

  function nextInstanceId(player) {
    player.nextInstanceSeq = Math.max(player.nextInstanceSeq || 1, 1);
    var id = 'eq_' + String(player.nextInstanceSeq).padStart(4, '0');
    player.nextInstanceSeq += 1;
    return id;
  }

  function normalizeEntry(entry, player) {
    if (!entry) return null;
    if (typeof entry === 'string') {
      var item = getItem(entry);
      if (!item) return null;
      if (item.stackable) return { itemId: entry, count: 1 };
      return { itemId: entry, count: 1, instanceId: nextInstanceId(player) };
    }
    if (entry.itemId) {
      var def = getItem(entry.itemId);
      if (!def) return null;
      if (def.stackable) return { itemId: entry.itemId, count: Math.max(1, entry.count || 1) };
      return { itemId: entry.itemId, count: 1, instanceId: entry.instanceId || nextInstanceId(player) };
    }
    return null;
  }

  function normalizeInventory(player) {
    player.inventory = player.inventory || [];
    var normalized = [];
    player.inventory.forEach(function (entry) {
      var norm = normalizeEntry(entry, player);
      if (norm) normalized.push(norm);
    });
    player.inventory = normalized;
  }

  function getInventoryEntries(player) {
    return (player && player.inventory) || [];
  }

  function findEntryByInstanceId(player, instanceId) {
    return getInventoryEntries(player).find(function (entry) { return entry.instanceId === instanceId; }) || null;
  }

  function findFirstEntryByItemId(player, itemId) {
    return getInventoryEntries(player).find(function (entry) { return entry.itemId === itemId; }) || null;
  }

  function isInstanceEquipped(player, instanceId) {
    return !!Object.keys(player.equipment || {}).find(function (slot) {
      return player.equipment[slot] === instanceId;
    });
  }

  function slotForItem(item) {
    if (!item) return null;
    return item.equipSlot || item.slot || item.subType || null;
  }

  function migrateEquipmentRefs(player) {
    ensureEquipmentSlots(player);
    Object.keys(player.equipment).forEach(function (slot) {
      var value = player.equipment[slot];
      if (!value) return;
      if (String(value).indexOf('eq_') === 0) return;
      var entry = findFirstEntryByItemId(player, value);
      player.equipment[slot] = entry ? entry.instanceId : null;
    });
  }

  function calculateEquipmentBonus(player) {
    var total = { attack: 0, defense: 0, agility: 0, maxHp: 0, maxMp: 0, insight: 0 };
    Object.keys(player.equipment || {}).forEach(function (slot) {
      var entry = findEntryByInstanceId(player, player.equipment[slot]);
      var item = entry ? getItem(entry.itemId) : null;
      var stats = (item && (item.baseStats || item.stats)) || {};
      Object.keys(stats).forEach(function (key) {
        total[key] = (total[key] || 0) + stats[key];
      });
    });
    return total;
  }

  function summaryRows(player) {
    var rows = [];
    var grouped = {};
    getInventoryEntries(player).forEach(function (entry) {
      var item = getItem(entry.itemId);
      if (!item) return;
      if (item.stackable) {
        if (!grouped[entry.itemId]) {
          grouped[entry.itemId] = {
            id: entry.itemId,
            item: item,
            itemId: entry.itemId,
            count: 0,
            stackable: true,
            equipped: false
          };
          rows.push(grouped[entry.itemId]);
        }
        grouped[entry.itemId].count += entry.count || 1;
      } else {
        rows.push({
          id: entry.instanceId,
          instanceId: entry.instanceId,
          itemId: entry.itemId,
          item: item,
          count: 1,
          stackable: false,
          equipped: isInstanceEquipped(player, entry.instanceId)
        });
      }
    });
    rows.sort(function (a, b) {
      var typeA = (a.item && a.item.type) || '';
      var typeB = (b.item && b.item.type) || '';
      var subA = (a.item && (a.item.subType || a.item.slot || '')) || '';
      var subB = (b.item && (b.item.subType || b.item.slot || '')) || '';
      return typeA.localeCompare(typeB) || subA.localeCompare(subB) || ((a.item && a.item.name) || a.id).localeCompare((b.item && b.item.name) || b.id);
    });
    return rows;
  }

  function itemCount(player, itemId) {
    return getInventoryEntries(player).reduce(function (total, entry) {
      return total + (entry.itemId === itemId ? (entry.count || 1) : 0);
    }, 0);
  }

  G.Managers.PlayerManager = {
    createPlayer: function (payload) {
      var base = Object.assign({}, baseTemplates[payload.background] || baseTemplates.scholar);
      var talent = talentModifiers[payload.talent] || {};
      var hp = base.hp + (talent.maxHp || 0);
      var mp = base.mp + (talent.maxMp || 0);
      var player = {
        name: payload.name || '无名客',
        gender: payload.gender || 'unknown',
        background: payload.background || 'scholar',
        backgroundLabel: base.label,
        talent: payload.talent || 'modern',
        talentLabel: talent.label || '现代思维',
        level: 1,
        exp: 0,
        hp: hp,
        maxHp: hp,
        mp: mp,
        maxMp: mp,
        strength: base.strength + (talent.strength || 0),
        agility: base.agility + (talent.agility || 0),
        constitution: base.constitution + (talent.constitution || 0),
        insight: base.insight + (talent.insight || 0),
        fate: talent.fate || 0,
        reputation: talent.reputation || 0,
        money: base.money + (talent.money || 0),
        inventory: [],
        equipment: { weapon: null, armor: null, accessory: null },
        nextInstanceSeq: 1,
        learnedSkills: ['punch', 'swift_slash'],
        flags: {},
        relationships: {},
        visitedNodes: ['qingshi_town'],
        currentNodeId: 'qingshi_town',
        currentWorldId: 'wuxia',
        currentEventId: 'evt_intro_awake',
        pendingBattle: null,
        pendingResult: null,
        endingsUnlocked: [],
        factionId: null,
        factionName: '江湖散人',
        factionReputation: createFactionRep(),
        baseStats: {
          maxHp: hp,
          maxMp: mp,
          strength: base.strength + (talent.strength || 0),
          agility: base.agility + (talent.agility || 0),
          constitution: base.constitution + (talent.constitution || 0),
          insight: base.insight + (talent.insight || 0)
        }
      };
      G.State.player = player;
      ['bandage'].concat(base.starterItems || []).forEach(function (itemId) {
        var result = G.Managers.PlayerManager.addItem(itemId);
        if (result && result.item && result.item.type === 'equipment') {
          var slot = slotForItem(result.item);
          if (slot && !player.equipment[slot]) {
            G.Managers.PlayerManager.equipItem(result.instanceId || itemId);
          }
        }
      });
      this.applyDerivedStats();
      return player;
    },
    setPlayer: function (player) {
      G.State.player = player;
      if (player) {
        ensureBaseStats(player);
        ensureFactionRep(player);
        normalizeInventory(player);
        ensureEquipmentSlots(player);
        migrateEquipmentRefs(player);
        this.applyDerivedStats();
      }
      return player;
    },
    getPlayer: function () {
      return G.State.player || null;
    },
    getItemById: getItem,
    getInventoryEntries: function () {
      return getInventoryEntries(this.getPlayer());
    },
    getInventoryEntry: function (reference) {
      var player = this.getPlayer();
      if (!player || !reference) return null;
      return findEntryByInstanceId(player, reference) || findFirstEntryByItemId(player, reference);
    },
    getFactionById: function (factionId) {
      return ((G.Data.world && G.Data.world.factions) || []).find(function (f) { return f.id === factionId; }) || null;
    },
    patch: function (partial) {
      if (!G.State.player) return null;
      Object.assign(G.State.player, partial || {});
      ensureBaseStats(G.State.player);
      this.applyDerivedStats();
      return G.State.player;
    },
    applyDerivedStats: function () {
      var p = this.getPlayer();
      if (!p) return;
      ensureBaseStats(p);
      ensureFactionRep(p);
      normalizeInventory(p);
      ensureEquipmentSlots(p);
      migrateEquipmentRefs(p);
      var equipmentBonus = calculateEquipmentBonus(p);
      p.equipmentStats = equipmentBonus;
      p.finalStats = {
        maxHp: p.baseStats.maxHp + (equipmentBonus.maxHp || 0),
        maxMp: p.baseStats.maxMp + (equipmentBonus.maxMp || 0),
        strength: p.baseStats.strength,
        agility: p.baseStats.agility + (equipmentBonus.agility || 0),
        constitution: p.baseStats.constitution,
        insight: p.baseStats.insight + (equipmentBonus.insight || 0),
        attack: p.baseStats.strength * 2 + (equipmentBonus.attack || 0) + p.level,
        defense: p.baseStats.constitution + (equipmentBonus.defense || 0) + Math.floor(p.level * 0.5),
        speed: p.baseStats.agility + (equipmentBonus.agility || 0),
        crit: Math.max(1, Math.floor((p.baseStats.insight + (equipmentBonus.insight || 0)) * 0.4))
      };
      p.attackPower = p.finalStats.attack;
      p.defensePower = p.finalStats.defense;
      p.speedPower = p.finalStats.speed;
      p.maxHpTotal = p.finalStats.maxHp;
      p.maxMpTotal = p.finalStats.maxMp;
      p.hp = Math.min(typeof p.hp === 'number' ? p.hp : p.maxHpTotal, p.maxHpTotal);
      p.mp = Math.min(typeof p.mp === 'number' ? p.mp : p.maxMpTotal, p.maxMpTotal);
    },
    getAttributeBreakdown: function () {
      var p = this.getPlayer();
      if (!p) return null;
      this.applyDerivedStats();
      return {
        base: Object.assign({}, p.baseStats),
        equipment: Object.assign({}, p.equipmentStats || {}),
        final: Object.assign({}, p.finalStats || {})
      };
    },
    ensureVitals: function () {
      var p = this.getPlayer();
      if (!p) return;
      this.applyDerivedStats();
      p.hp = Math.max(0, Math.min(p.hp, p.maxHpTotal || p.maxHp));
      p.mp = Math.max(0, Math.min(p.mp, p.maxMpTotal || p.maxMp));
    },
    getEquipmentBonus: function () {
      var p = this.getPlayer();
      return p ? calculateEquipmentBonus(p) : { attack: 0, defense: 0, agility: 0, maxHp: 0, maxMp: 0, insight: 0 };
    },
    getEquipmentDetail: function () {
      var p = this.getPlayer();
      var result = {};
      if (!p || !p.equipment) return result;
      Object.keys(p.equipment).forEach(function (slot) {
        var entry = findEntryByInstanceId(p, p.equipment[slot]);
        var item = entry ? getItem(entry.itemId) : null;
        result[slot] = item ? Object.assign({ instanceId: entry.instanceId, itemId: entry.itemId }, item) : null;
      });
      return result;
    },
    getInventorySummary: function () {
      var p = this.getPlayer();
      if (!p) return [];
      return summaryRows(p);
    },
    getItemCount: function (itemId) {
      var p = this.getPlayer();
      return p ? itemCount(p, itemId) : 0;
    },
    heal: function (hp, mp) {
      var p = this.getPlayer();
      if (!p) return;
      this.applyDerivedStats();
      p.hp = Math.min(p.maxHpTotal || p.maxHp, p.hp + (hp || 0));
      p.mp = Math.min(p.maxMpTotal || p.maxMp, p.mp + (mp || 0));
    },
    takeDamage: function (value) {
      var p = this.getPlayer();
      if (!p) return;
      p.hp = Math.max(0, p.hp - value);
    },
    gainMoney: function (value) {
      var p = this.getPlayer();
      if (!p) return;
      p.money = Math.max(0, p.money + value);
    },
    gainReputation: function (value) {
      var p = this.getPlayer();
      if (!p) return;
      p.reputation += value;
    },
    gainFactionRep: function (factionId, value) {
      var p = this.getPlayer();
      if (!p || !factionId) return;
      ensureFactionRep(p);
      p.factionReputation[factionId] = (p.factionReputation[factionId] || 0) + value;
    },
    joinFaction: function (factionId) {
      var p = this.getPlayer();
      var faction = this.getFactionById(factionId);
      if (!p || !faction) return false;
      p.factionId = faction.id;
      p.factionName = faction.name;
      this.gainFactionRep(faction.id, 5);
      return true;
    },
    gainExp: function (value) {
      var p = this.getPlayer();
      if (!p) return;
      p.exp += value;
      while (p.exp >= p.level * 20) {
        p.exp -= p.level * 20;
        p.level += 1;
        p.baseStats.maxHp += 10;
        p.baseStats.maxMp += 6;
        p.hp = p.baseStats.maxHp;
        p.mp = p.baseStats.maxMp;
        p.baseStats.strength += 1;
        p.baseStats.agility += 1;
        p.baseStats.constitution += 1;
        p.baseStats.insight += 1;
        this.applyDerivedStats();
        G.UI.HUD.showToast('你突破到了 ' + p.level + ' 级', 'success');
      }
      this.applyDerivedStats();
    },
    hasSkill: function (skillId) {
      var p = this.getPlayer();
      return !!(p && p.learnedSkills.indexOf(skillId) >= 0);
    },
    learnSkill: function (skillId) {
      var p = this.getPlayer();
      if (!p || this.hasSkill(skillId)) return;
      p.learnedSkills.push(skillId);
      var skill = ((G.Data.skills && G.Data.skills.skills) || []).find(function (s) { return s.id === skillId; });
      if (skill) G.UI.HUD.showToast('习得武学：' + skill.name, 'success');
    },
    addItem: function (itemId, count) {
      var p = this.getPlayer();
      var item = getItem(itemId);
      var amount = Math.max(1, count || 1);
      if (!p || !item) return null;
      if (item.stackable) {
        var entry = findFirstEntryByItemId(p, itemId);
        if (entry) {
          entry.count += amount;
          return { item: item, itemId: itemId, count: entry.count };
        }
        entry = { itemId: itemId, count: amount };
        p.inventory.push(entry);
        return { item: item, itemId: itemId, count: amount };
      }
      var created = null;
      while (amount > 0) {
        created = { itemId: itemId, count: 1, instanceId: nextInstanceId(p) };
        p.inventory.push(created);
        amount -= 1;
      }
      return { item: item, itemId: itemId, instanceId: created.instanceId, count: 1 };
    },
    hasItem: function (itemId, count) {
      var p = this.getPlayer();
      return !!(p && itemCount(p, itemId) >= Math.max(1, count || 1));
    },
    useItem: function (itemId) {
      var p = this.getPlayer();
      if (!p) return false;
      var item = getItem(itemId);
      if (!item) return false;
      if (item.stackable) {
        var stack = findFirstEntryByItemId(p, itemId);
        if (!stack || stack.count <= 0) return false;
        stack.count -= 1;
        if (stack.count <= 0) {
          p.inventory = p.inventory.filter(function (entry) { return entry !== stack; });
        }
        return true;
      }
      var entry = findFirstEntryByItemId(p, itemId);
      if (!entry || isInstanceEquipped(p, entry.instanceId)) return false;
      p.inventory = p.inventory.filter(function (row) { return row !== entry; });
      return true;
    },
    canEquip: function (reference) {
      var p = this.getPlayer();
      var entry = this.getInventoryEntry(reference);
      var item = entry ? getItem(entry.itemId) : null;
      if (!p || !entry || !item || item.type !== 'equipment') return false;
      var req = item.requirements || {};
      if (req.level && p.level < req.level) return false;
      if (req.faction && p.factionId !== req.faction) return false;
      return true;
    },
    equipItem: function (reference) {
      var p = this.getPlayer();
      var entry = this.getInventoryEntry(reference);
      var item = entry ? getItem(entry.itemId) : null;
      var slot = slotForItem(item);
      if (!p || !entry || !item || item.type !== 'equipment' || !slot || !this.canEquip(reference)) return false;
      p.equipment[slot] = entry.instanceId;
      this.applyDerivedStats();
      return true;
    },
    unequipSlot: function (slot) {
      var p = this.getPlayer();
      if (!p || !p.equipment || !p.equipment[slot]) return false;
      p.equipment[slot] = null;
      this.applyDerivedStats();
      return true;
    },
    buyItem: function (itemId) {
      var item = getItem(itemId);
      var p = this.getPlayer();
      var price = item ? (item.buyPrice || item.price || 0) : 0;
      if (!item || !p) return { ok: false, message: '物品不存在。' };
      if (price <= 0) return { ok: false, message: '该物品不可购买。' };
      if (p.money < price) return { ok: false, message: '银两不足。' };
      p.money -= price;
      var result = this.addItem(itemId);
      return { ok: true, item: item, result: result };
    }
  };
})(window.TransmigratorGame);
