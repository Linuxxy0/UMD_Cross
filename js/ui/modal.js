(function (G) {
  G.UI.Modal = {
    mount: function (contentNode) {
      var uiRoot = document.getElementById('ui-root');
      var wrap = document.createElement('div');
      wrap.className = 'ui-layer';
      wrap.appendChild(contentNode);
      uiRoot.innerHTML = '';
      uiRoot.appendChild(wrap);
      return wrap;
    }
  };
})(window.TransmigratorGame);
