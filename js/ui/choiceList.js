(function (G) {
  G.UI.ChoiceList = function (choices) {
    var box = document.createElement('div');
    box.className = 'choice-list';
    (choices || []).forEach(function (choice) {
      var btn = document.createElement('button');
      btn.className = 'choice-btn';
      btn.textContent = choice.label;
      btn.addEventListener('click', choice.onClick);
      box.appendChild(btn);
    });
    return box;
  };
})(window.TransmigratorGame);
