(function (G) {
  function optionHtml(options) {
    return options.map(function (item) {
      return '<option value="' + item.value + '">' + item.label + '</option>';
    }).join('');
  }

  G.Scenes.CreateRoleScene = new Phaser.Class({
    Extends: Phaser.Scene,
    initialize: function CreateRoleScene() {
      Phaser.Scene.call(this, { key: G.Core.Config.SCENES.CREATE_ROLE });
    },
    create: function () {
      this.cameras.main.setBackgroundColor('#0d1627');
      this.add.text(70, 60, '创建角色', { fontSize: '42px', color: '#f7efd9' });
      this.add.text(70, 110, '选择你的身份、天赋与初始优势，踏入风云初起的大晟江湖。', { fontSize: '18px', color: '#afbaa7' });

      var layer = document.createElement('div');
      layer.className = 'ui-layer';

      var wrap = document.createElement('div');
      wrap.className = 'page-grid';

      var left = G.UI.Panel({ title: '角色信息', className: 'main-panel' });
      left.body.innerHTML = [
        '<div class="form-grid">',
          '<label class="form-field"><span>角色名</span><input class="text-input" id="role-name" value="陆惊鸿" maxlength="12" /></label>',
          '<label class="form-field"><span>性别</span><select class="select-input" id="role-gender">', optionHtml([
            { value: 'male', label: '男' },
            { value: 'female', label: '女' },
            { value: 'unknown', label: '不设定' }
          ]), '</select></label>',
          '<label class="form-field"><span>出身</span><select class="select-input" id="role-background">', optionHtml([
            { value: 'scholar', label: '落魄书生（偏内力与悟性）' },
            { value: 'escort', label: '镖局杂役（偏体魄与兵器）' },
            { value: 'wanderer', label: '逃亡旅人（偏敏捷与探索）' }
          ]), '</select></label>',
          '<label class="form-field"><span>天赋</span><select class="select-input" id="role-talent">', optionHtml([
            { value: 'modern', label: '现代思维' },
            { value: 'meridian', label: '天生奇脉' },
            { value: 'memory', label: '过目不忘' },
            { value: 'streetwise', label: '街头智慧' },
            { value: 'anomaly', label: '命格异常' }
          ]), '</select></label>',
        '</div>',
        '<div class="btn-row">',
          '<button class="btn primary" id="start-adventure">进入江湖</button>',
          '<button class="btn" id="back-menu">返回主菜单</button>',
        '</div>'
      ].join('');

      var right = G.UI.Panel({ title: '首发内容', className: 'sidebar-panel' });
      right.body.innerHTML = [
        '<div class="kv-grid">',
          '<div class="kv-item"><strong>主线目标</strong><div class="muted">追索界门，决定去留</div></div>',
          '<div class="kv-item"><strong>门派路线</strong><div class="muted">天岳 / 玄衣 / 药王</div></div>',
          '<div class="kv-item"><strong>装备系统</strong><div class="muted">武器 / 护甲 / 饰品</div></div>',
          '<div class="kv-item"><strong>开局奖励</strong><div class="muted">根据出身自动附带初始装备</div></div>',
        '</div>',
        '<div class="empty-tip">建议第一次先体验任意门派线和至少一个终局，再根据方向扩展第二世界。</div>'
      ].join('');

      wrap.appendChild(left);
      wrap.appendChild(right);
      layer.appendChild(wrap);

      var uiRoot = document.getElementById('ui-root');
      uiRoot.innerHTML = '';
      uiRoot.appendChild(layer);

      left.body.querySelector('#start-adventure').addEventListener('click', function () {
        var payload = {
          name: left.body.querySelector('#role-name').value.trim() || '无名客',
          gender: left.body.querySelector('#role-gender').value,
          background: left.body.querySelector('#role-background').value,
          talent: left.body.querySelector('#role-talent').value
        };
        G.Worlds.WuxiaController.startNewGame(payload);
        G.Core.Router.go(G.Core.Config.SCENES.EVENT);
      });

      left.body.querySelector('#back-menu').addEventListener('click', function () {
        G.Core.Router.go(G.Core.Config.SCENES.MENU);
      });
    }
  });
})(window.TransmigratorGame);
