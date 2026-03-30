(function (G) {
  function getEventById(id) {
    return (G.Data.events && G.Data.events.events || []).find(function (evt) { return evt.id === id; }) || null;
  }

  function randomFrom(arr) {
    return arr[Math.floor(Math.random() * arr.length)];
  }

  function meetsCondition(cond, player) {
    if (!cond) return true;
    if (cond.type === 'reputation_gte') return player.reputation >= cond.value;
    if (cond.type === 'money_gte') return player.money >= cond.value;
    if (cond.type === 'has_item') return G.Managers.PlayerManager.hasItem(cond.value);
    if (cond.type === 'not_has_item') return !G.Managers.PlayerManager.hasItem(cond.value);
    if (cond.type === 'flag') return !!player.flags[cond.value];
    if (cond.type === 'not_flag') return !player.flags[cond.value];
    if (cond.type === 'level_gte') return player.level >= cond.value;
    if (cond.type === 'faction_none') return !player.factionId;
    if (cond.type === 'not_faction_none') return !!player.factionId;
    if (cond.type === 'faction_is') return player.factionId === cond.value;
    if (cond.type === 'faction_rep_gte') return (player.factionReputation && player.factionReputation[cond.factionId]) >= cond.value;
    return true;
  }

  function meetsConditions(choice, player) {
    if (!choice.conditions || !choice.conditions.length) return true;
    return choice.conditions.every(function (cond) {
      return meetsCondition(cond, player);
    });
  }

  function hasChoices(evt) {
    if (!evt) return false;
    return G.Managers.EventManager.getAvailableChoices(evt).length > 0;
  }

  G.Managers.EventManager = {
    getEventById: getEventById,
    getCurrentEvent: function () {
      var player = G.Managers.PlayerManager.getPlayer();
      if (!player || !player.currentEventId) return null;
      return getEventById(player.currentEventId);
    },
    setCurrentEvent: function (eventId) {
      var player = G.Managers.PlayerManager.getPlayer();
      if (player) player.currentEventId = eventId;
      return getEventById(eventId);
    },
    getExploreEventForNode: function (nodeId) {
      var node = G.Managers.WorldManager.getNodeById(nodeId);
      if (!node || !node.eventPool || !node.eventPool.length) return null;
      var candidates = node.eventPool.map(getEventById).filter(function (evt) { return evt && hasChoices(evt); });
      if (!candidates.length) return null;
      return randomFrom(candidates);
    },
    getAvailableChoices: function (evt) {
      var player = G.Managers.PlayerManager.getPlayer();
      return (evt.choices || []).filter(function (choice) {
        return meetsConditions(choice, player);
      });
    },
    applyChoice: function (choice) {
      var player = G.Managers.PlayerManager.getPlayer();
      if (!player) return { type: 'none' };
      var outcome = { type: 'map' };
      (choice.effects || []).forEach(function (effect) {
        if (effect.type === 'gain_money') G.Managers.PlayerManager.gainMoney(effect.value);
        if (effect.type === 'spend_money') G.Managers.PlayerManager.gainMoney(-Math.abs(effect.value));
        if (effect.type === 'gain_reputation') G.Managers.PlayerManager.gainReputation(effect.value);
        if (effect.type === 'gain_faction_rep') G.Managers.PlayerManager.gainFactionRep(effect.factionId, effect.value);
        if (effect.type === 'join_faction') G.Managers.PlayerManager.joinFaction(effect.factionId);
        if (effect.type === 'gain_exp') G.Managers.PlayerManager.gainExp(effect.value);
        if (effect.type === 'heal') G.Managers.PlayerManager.heal(effect.hp || 0, effect.mp || 0);
        if (effect.type === 'damage') G.Managers.PlayerManager.takeDamage(effect.value);
        if (effect.type === 'flag') player.flags[effect.key] = effect.value;
        if (effect.type === 'learn_skill') G.Managers.PlayerManager.learnSkill(effect.skillId);
        if (effect.type === 'add_item') G.Managers.PlayerManager.addItem(effect.itemId);
        if (effect.type === 'travel') G.Managers.WorldManager.travelTo(effect.nodeId);
        if (effect.type === 'battle') {
          player.pendingBattle = {
            enemyId: effect.enemyId,
            sourceEventId: player.currentEventId,
            onWinEventId: effect.onWinEventId || choice.next || null,
            onLoseEndingId: effect.onLoseEndingId || 'ending_defeat'
          };
          outcome.type = 'battle';
        }
        if (effect.type === 'ending') {
          player.pendingResult = { endingId: effect.endingId };
          outcome.type = 'ending';
        }
      });

      G.Managers.PlayerManager.ensureVitals();

      if (outcome.type === 'battle') return outcome;
      if (outcome.type === 'ending') return outcome;
      if (choice.next) {
        this.setCurrentEvent(choice.next);
        outcome.type = 'event';
        outcome.eventId = choice.next;
        return outcome;
      }
      player.currentEventId = null;
      return outcome;
    }
  };
})(window.TransmigratorGame);
