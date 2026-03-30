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

  function getAllItems() {
    return (G.Data.items && G.Data.items.items) || [];
  }

  function getItem(itemId) {
    return getAllItems().find(function (item) { return item.id === itemId; }) || null;
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

  function countItems(inventory) {
    var map = {};
    (inventory || []).forEach(function (id) {
      map[id] = (map[id] || 0) + 1;
    });
    return map;
  }

  G.Managers.PlayerManager = {
    createPlayer: function (payload) {
      var base = Object.assign({}, baseTemplates[payload.background] || baseTemplates.scholar);
      var talent = talentModifiers[payload.talent] || {};
      var hp = base.hp + (talent.maxHp || 0);
      var mp = base.mp + (talent.maxMp || 0);
      var starterItems = ['bandage'].concat(base.starterItems || []);
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
        inventory: starterItems,
        equipment: { weapon: null, armor: null, accessory: null },
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
        factionReputation: createFactionRep()
      };
      G.State.player = player;
      starterItems.forEach(function (itemId) {
        var item = getItem(itemId);
        if (item && item.type === 'equipment' && !player.equipment[item.slot]) {
          player.equipment[item.slot] = itemId;
        }
      });
      this.applyDerivedStats();
      return player;
    },
    setPlayer: function (player) {
      G.State.player = player;
      if (player) {
        player.equipment = player.equipment || { weapon: null, armor: null, accessory: null };
        ensureFactionRep(player);
        this.applyDerivedStats();
      }
      return player;
    },
    getPlayer: function () {
      return G.State.player || null;
    },
    getItemById: getItem,
    getFactionById: function (factionId) {
      return ((G.Data.world && G.Data.world.factions) || []).find(function (f) { return f.id === factionId; }) || null;
    },
    patch: function (partial) {
      if (!G.State.player) return null;
      Object.assign(G.State.player, partial || {});
      this.applyDerivedStats();
      return G.State.player;
    },
    applyDerivedStats: function () {
      var p = this.getPlayer();
      if (!p) return;
      p.baseStats = p.baseStats || {
        maxHp: p.maxHp,
        maxMp: p.maxMp,
        strength: p.strength,
        agility: p.agility,
        constitution: p.constitution,
        insight: p.insight
      };
      ensureFactionRep(p);
      var equipmentBonus = this.getEquipmentBonus();
      p.attackPower = p.strength + (equipmentBonus.attack || 0) + Math.floor(p.level * 0.5);
      p.defensePower = Math.floor(p.constitution * 0.5) + (equipmentBonus.defense || 0);
      p.speedPower = p.agility + (equipmentBonus.agility || 0);
      p.maxHpTotal = p.maxHp + (equipmentBonus.maxHp || 0);
      p.maxMpTotal = p.maxMp + (equipmentBonus.maxMp || 0);
      p.hp = Math.min(typeof p.hp === 'number' ? p.hp : p.maxHpTotal, p.maxHpTotal);
      p.mp = Math.min(typeof p.mp === 'number' ? p.mp : p.maxMpTotal, p.maxMpTotal);
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
      var total = { attack: 0, defense: 0, agility: 0, maxHp: 0, maxMp: 0, insight: 0 };
      if (!p || !p.equipment) return total;
      Object.keys(p.equipment).forEach(function (slot) {
        var item = getItem(p.equipment[slot]);
        var stats = item && item.stats ? item.stats : {};
        Object.keys(stats).forEach(function (key) {
          total[key] = (total[key] || 0) + stats[key];
        });
      });
      return total;
    },
    getEquipmentDetail: function () {
      var p = this.getPlayer();
      var result = {};
      if (!p || !p.equipment) return result;
      Object.keys(p.equipment).forEach(function (slot) {
        result[slot] = getItem(p.equipment[slot]);
      });
      return result;
    },
    getInventorySummary: function () {
      var counts = countItems((this.getPlayer() || {}).inventory || []);
      return Object.keys(counts).map(function (id) {
        return { id: id, count: counts[id], item: getItem(id) };
      }).sort(function (a, b) {
        var typeA = (a.item && a.item.type) || '';
        var typeB = (b.item && b.item.type) || '';
        return typeA.localeCompare(typeB) || ((a.item && a.item.name) || a.id).localeCompare((b.item && b.item.name) || b.id);
      });
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
        p.maxHp += 10;
        p.maxMp += 6;
        p.hp = p.maxHp;
        p.mp = p.maxMp;
        p.strength += 1;
        p.agility += 1;
        p.constitution += 1;
        p.insight += 1;
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
    addItem: function (itemId) {
      var p = this.getPlayer();
      if (!p || !itemId) return;
      p.inventory.push(itemId);
    },
    hasItem: function (itemId) {
      var p = this.getPlayer();
      return !!(p && p.inventory.indexOf(itemId) >= 0);
    },
    useItem: function (itemId) {
      var p = this.getPlayer();
      if (!p) return false;
      var idx = p.inventory.indexOf(itemId);
      if (idx < 0) return false;
      p.inventory.splice(idx, 1);
      return true;
    },
    canEquip: function (itemId) {
      var item = getItem(itemId);
      return !!(item && item.type === 'equipment' && this.hasItem(itemId));
    },
    equipItem: function (itemId) {
      var p = this.getPlayer();
      var item = getItem(itemId);
      if (!p || !item || item.type !== 'equipment' || !this.hasItem(itemId)) return false;
      p.equipment[item.slot] = itemId;
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
      if (!item || !p) return { ok: false, message: '物品不存在。' };
      if ((item.price || 0) <= 0) return { ok: false, message: '该物品不可购买。' };
      if (p.money < item.price) return { ok: false, message: '银两不足。' };
      p.money -= item.price;
      p.inventory.push(itemId);
      return { ok: true, item: item };
    }
  };
})(window.TransmigratorGame);
