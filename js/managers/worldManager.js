(function (G) {
  G.Managers.WorldManager = {
    init: function () {
      G.State.world = {
        worldId: 'wuxia',
        currentNodeId: (G.Managers.PlayerManager.getPlayer() || {}).currentNodeId || 'qingshi_town'
      };
    },
    getWorld: function () {
      return G.Data.world || null;
    },
    getMap: function () {
      return G.Data.maps || { nodes: [] };
    },
    getNodeById: function (nodeId) {
      return (this.getMap().nodes || []).find(function (node) { return node.id === nodeId; }) || null;
    },
    getCurrentNode: function () {
      var player = G.Managers.PlayerManager.getPlayer();
      return player ? this.getNodeById(player.currentNodeId) : null;
    },
    travelTo: function (nodeId) {
      var player = G.Managers.PlayerManager.getPlayer();
      var node = this.getNodeById(nodeId);
      if (!player || !node) return false;
      player.currentNodeId = nodeId;
      if (player.visitedNodes.indexOf(nodeId) < 0) {
        player.visitedNodes.push(nodeId);
      }
      G.State.world.currentNodeId = nodeId;
      return true;
    },
    getAvailableDestinations: function () {
      var current = this.getCurrentNode();
      if (!current) return [];
      var self = this;
      return (current.links || []).map(function (id) { return self.getNodeById(id); }).filter(Boolean);
    },
    getSettlementEventForCurrentNode: function () {
      var node = this.getCurrentNode();
      return node && node.settlementEventId ? G.Managers.EventManager.getEventById(node.settlementEventId) : null;
    },
    getMerchantPoolForCurrentNode: function () {
      var node = this.getCurrentNode();
      return node && node.merchantPool ? node.merchantPool : [];
    }
  };
})(window.TransmigratorGame);
