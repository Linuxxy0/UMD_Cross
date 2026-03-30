(function (G) {
  G.Worlds.WuxiaRules = {
    getDangerLabel: function (danger) {
      if (danger <= 1) return '平稳';
      if (danger <= 2) return '谨慎';
      if (danger <= 3) return '凶险';
      return '绝境';
    },
    canEnterSettlement: function (node) {
      return node && ['town', 'market', 'sect'].indexOf(node.type) >= 0;
    },
    getNodeThemeLabel: function (node) {
      if (!node) return '未知';
      if (node.type === 'town') return '城镇驻留';
      if (node.type === 'market') return '夜市交易';
      if (node.type === 'sect') return '门派据点';
      if (node.type === 'ruin') return '遗迹探索';
      return '野外探索';
    }
  };
})(window.TransmigratorGame);
