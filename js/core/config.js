(function (G) {
  G.Core.Config = {
    STORAGE_KEY: 'transmigrator_wuxia_save_v120',
    GAME_WIDTH: 1280,
    GAME_HEIGHT: 760,
    DATA_FILES: {
      world: './assets/data/worlds/wuxia/world.json',
      maps: './assets/data/worlds/wuxia/maps.json',
      events: './assets/data/worlds/wuxia/events.json',
      npcs: './assets/data/worlds/wuxia/npcs.json',
      items: './assets/data/worlds/wuxia/items.json',
      skills: './assets/data/worlds/wuxia/skills.json',
      enemies: './assets/data/worlds/wuxia/enemies.json'
    },
    SCENES: {
      BOOT: 'BootScene',
      PRELOAD: 'PreloadScene',
      MENU: 'MainMenuScene',
      CREATE_ROLE: 'CreateRoleScene',
      WORLD_MAP: 'WorldMapScene',
      EVENT: 'EventScene',
      BATTLE: 'BattleScene',
      TOWN: 'TownScene',
      ENDING: 'EndingScene'
    }
  };
})(window.TransmigratorGame);
