window.TransmigratorGame = window.TransmigratorGame || {};
(function (G) {
  G.version = '1.8.0';
  G.Core = G.Core || {};
  G.Managers = G.Managers || {};
  G.Scenes = G.Scenes || {};
  G.UI = G.UI || {};
  G.Worlds = G.Worlds || {};
  G.State = G.State || {
    game: null,
    currentScene: null,
    leftDrawerOpen: false,
    rightDrawerOpen: false,
    systemDrawerOpen: false,
    dragPayload: null
  };
  G.Data = G.Data || {};
})(window.TransmigratorGame);
