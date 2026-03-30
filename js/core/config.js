(function (G) {
  G.Core.Config = {
    STORAGE_KEY: 'transmigrator_wuxia_save_v130',
    ANNOUNCEMENT_SEEN_KEY: 'transmigrator_wuxia_announcements_seen_v130',
    GAME_WIDTH: 1280,
    GAME_HEIGHT: 760,
    DATA_FILES: {
      world: './assets/data/worlds/wuxia/world.json',
      maps: './assets/data/worlds/wuxia/maps.json',
      events: './assets/data/worlds/wuxia/events.json',
      npcs: './assets/data/worlds/wuxia/npcs.json',
      itemLibrary: './assets/data/worlds/wuxia/itemLibrary.json',
      equipmentLibrary: './assets/data/worlds/wuxia/equipmentLibrary.json',
      skills: './assets/data/worlds/wuxia/skills.json',
      enemies: './assets/data/worlds/wuxia/enemies.json',
      announcements: './assets/data/worlds/wuxia/announcements.json'
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
