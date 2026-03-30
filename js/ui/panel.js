(function (G) {
  G.UI.Panel = function createPanel(options) {
    var panel = document.createElement('section');
    panel.className = 'panel ' + (options && options.strong ? 'panel-strong' : '');
    if (options && options.className) panel.className += ' ' + options.className;

    if (options && options.title) {
      var header = document.createElement('div');
      header.className = 'panel-header';
      var title = document.createElement('h2');
      title.textContent = options.title;
      header.appendChild(title);
      if (options.subtitle) {
        var subtitle = document.createElement('span');
        subtitle.className = 'muted';
        subtitle.textContent = options.subtitle;
        header.appendChild(subtitle);
      }
      panel.appendChild(header);
    }

    var body = document.createElement('div');
    body.className = 'panel-body';
    panel.appendChild(body);
    panel.body = body;
    return panel;
  };
})(window.TransmigratorGame);
