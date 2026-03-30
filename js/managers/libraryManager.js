(function (G) {
  function buildCache() {
    var cache = {};
    var items = (G.Data.itemLibrary && G.Data.itemLibrary.items) || [];
    var equipment = (G.Data.equipmentLibrary && G.Data.equipmentLibrary.equipment) || [];
    items.concat(equipment).forEach(function (entry) {
      cache[entry.id] = entry;
    });
    return cache;
  }

  function allItems() {
    return Object.values(buildCache());
  }

  G.Managers.LibraryManager = {
    getCache: buildCache,
    getItemById: function (itemId) {
      return buildCache()[itemId] || null;
    },
    getAllItems: function () {
      return (G.Data.itemLibrary && G.Data.itemLibrary.items) || [];
    },
    getAllEquipment: function () {
      return (G.Data.equipmentLibrary && G.Data.equipmentLibrary.equipment) || [];
    },
    getAllDefinitions: allItems,
    isEquipment: function (itemId) {
      var item = this.getItemById(itemId);
      return !!(item && item.type === 'equipment');
    },
    getItemTypeLabel: function (item) {
      if (!item) return '未知';
      var type = item.type;
      var subType = item.subType;
      if (type === 'equipment') {
        return {
          weapon: '武器',
          armor: '护甲',
          accessory: '饰品'
        }[subType || item.slot] || '装备';
      }
      return {
        consumable: '消耗品',
        material: '材料',
        quest: '任务物品'
      }[type] || type;
    },
    getQualityLabel: function (quality) {
      return {
        common: '普通',
        uncommon: '精良',
        rare: '稀有',
        epic: '史诗'
      }[quality] || '普通';
    }
  };
})(window.TransmigratorGame);
