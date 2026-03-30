(function (G) {
  function clone(obj) {
    return JSON.parse(JSON.stringify(obj));
  }

  function getEnemy(enemyId) {
    return (G.Data.enemies && G.Data.enemies.enemies || []).find(function (enemy) { return enemy.id === enemyId; }) || null;
  }

  function getSkill(skillId) {
    return (G.Data.skills && G.Data.skills.skills || []).find(function (skill) { return skill.id === skillId; }) || null;
  }

  function getBestUsableSkill(player) {
    return (player.learnedSkills || [])
      .map(getSkill)
      .filter(function (skill) { return skill && skill.type === 'attack' && player.mp >= (skill.mpCost || 0); })
      .sort(function (a, b) { return (b.power || 0) - (a.power || 0); })[0] || null;
  }

  G.Managers.BattleManager = {
    startBattle: function (enemyId) {
      var player = G.Managers.PlayerManager.getPlayer();
      var enemy = clone(getEnemy(enemyId));
      if (!player || !enemy) return null;
      G.Managers.PlayerManager.applyDerivedStats();
      G.State.battle = {
        turn: 1,
        enemy: enemy,
        logs: ['你遭遇了 ' + enemy.name + '。'],
        finished: false,
        result: null
      };
      return G.State.battle;
    },
    getBattle: function () {
      return G.State.battle || null;
    },
    addLog: function (text) {
      var battle = this.getBattle();
      if (!battle) return;
      battle.logs.push(text);
    },
    calculatePlayerAttack: function () {
      var player = G.Managers.PlayerManager.getPlayer();
      G.Managers.PlayerManager.applyDerivedStats();
      return Math.max(1, Math.floor((player.attackPower || player.strength) * 1.5 + player.level * 2 + Math.random() * 5));
    },
    calculateEnemyAttack: function () {
      var battle = this.getBattle();
      return Math.max(1, Math.floor(battle.enemy.attack + Math.random() * 4));
    },
    playerAttack: function () {
      var battle = this.getBattle();
      if (!battle || battle.finished) return battle;
      var damage = Math.max(1, this.calculatePlayerAttack() - battle.enemy.defense);
      battle.enemy.hp = Math.max(0, battle.enemy.hp - damage);
      this.addLog('你发动普通攻击，造成 ' + damage + ' 点伤害。');
      return this.afterPlayerAction();
    },
    playerSkill: function () {
      var battle = this.getBattle();
      var player = G.Managers.PlayerManager.getPlayer();
      if (!battle || battle.finished) return battle;
      var skill = getBestUsableSkill(player) || getSkill('punch') || { name: '拳击', mpCost: 0, power: 1.2 };
      if (player.mp < (skill.mpCost || 0)) {
        this.addLog('你的内力不足，无法施展 ' + skill.name + '。');
        return this.enemyTurn();
      }
      player.mp -= (skill.mpCost || 0);
      var base = this.calculatePlayerAttack();
      var damage = Math.max(1, Math.floor(base * (skill.power || 1.2)) - battle.enemy.defense);
      battle.enemy.hp = Math.max(0, battle.enemy.hp - damage);
      this.addLog('你施展『' + skill.name + '』，造成 ' + damage + ' 点伤害。');
      return this.afterPlayerAction();
    },
    playerDefend: function () {
      var battle = this.getBattle();
      if (!battle || battle.finished) return battle;
      battle.defending = true;
      this.addLog('你摆开架势，准备防守。');
      return this.enemyTurn();
    },
    playerUseItem: function () {
      var battle = this.getBattle();
      if (!battle || battle.finished) return battle;
      if (G.Managers.PlayerManager.useItem('herbal_pill')) {
        G.Managers.PlayerManager.heal(20, 16);
        this.addLog('你服下回气散，恢复了气血与内力。');
        return this.enemyTurn();
      }
      if (G.Managers.PlayerManager.useItem('bandage')) {
        G.Managers.PlayerManager.heal(24, 0);
        this.addLog('你使用了绷带，恢复了 24 点气血。');
        return this.enemyTurn();
      }
      this.addLog('你身上没有可用的恢复道具。');
      return this.enemyTurn();
    },
    afterPlayerAction: function () {
      var battle = this.getBattle();
      if (battle.enemy.hp <= 0) {
        return this.finishBattle('win');
      }
      return this.enemyTurn();
    },
    enemyTurn: function () {
      var battle = this.getBattle();
      var player = G.Managers.PlayerManager.getPlayer();
      if (!battle || battle.finished) return battle;
      G.Managers.PlayerManager.applyDerivedStats();
      var damage = Math.max(1, this.calculateEnemyAttack() - Math.floor((player.defensePower || 0) * 0.6));
      if (battle.defending) {
        damage = Math.max(1, Math.floor(damage * 0.45));
        battle.defending = false;
      }
      G.Managers.PlayerManager.takeDamage(damage);
      this.addLog(battle.enemy.name + ' 反击，造成 ' + damage + ' 点伤害。');
      if (G.Managers.PlayerManager.getPlayer().hp <= 0) {
        return this.finishBattle('lose');
      }
      battle.turn += 1;
      return battle;
    },
    finishBattle: function (result) {
      var battle = this.getBattle();
      var player = G.Managers.PlayerManager.getPlayer();
      battle.finished = true;
      battle.result = result;
      if (result === 'win') {
        var rewardMoney = battle.enemy.rewards.money || 0;
        var rewardExp = battle.enemy.rewards.exp || 0;
        G.Managers.PlayerManager.gainMoney(rewardMoney);
        G.Managers.PlayerManager.gainExp(rewardExp);
        this.addLog('战斗胜利！获得 ' + rewardMoney + ' 银两，' + rewardExp + ' 经验。');
        player.pendingResult = { battleResult: 'win' };
      } else {
        this.addLog('你败下阵来，意识逐渐模糊……');
        player.pendingResult = { battleResult: 'lose' };
      }
      return battle;
    },
    clear: function () {
      G.State.battle = null;
    }
  };
})(window.TransmigratorGame);
