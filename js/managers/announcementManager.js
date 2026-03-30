(function (G) {
  function getAll() {
    return (G.Data.announcements && G.Data.announcements.announcements) || [];
  }

  function getSeenMap() {
    return G.Core.Storage.get(G.Core.Config.ANNOUNCEMENT_SEEN_KEY) || {};
  }

  G.Managers.AnnouncementManager = {
    getAll: function () {
      return getAll();
    },
    getCurrentVersionAnnouncement: function () {
      return getAll().find(function (entry) { return entry.version === G.version; }) || null;
    },
    hasUnreadCurrent: function () {
      var current = this.getCurrentVersionAnnouncement();
      if (!current) return false;
      var seen = getSeenMap();
      return !seen[current.version];
    },
    markVersionSeen: function (version) {
      var seen = getSeenMap();
      seen[version] = true;
      G.Core.Storage.set(G.Core.Config.ANNOUNCEMENT_SEEN_KEY, seen);
    },
    markCurrentSeen: function () {
      var current = this.getCurrentVersionAnnouncement();
      if (current) this.markVersionSeen(current.version);
    }
  };
})(window.TransmigratorGame);
