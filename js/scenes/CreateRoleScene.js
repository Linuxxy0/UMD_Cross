(function (G) {
  var backgrounds = {
    scholar: {
      label: '落魄书生',
      detail: '擅长思考和内修，开局拥有更好的悟性与内力根基。',
      stats: { 气血: 72, 内力: 42, 臂力: 5, 身法: 6, 根骨: 6, 悟性: 9 },
      starter: '布袍、绷带'
    },
    escort: {
      label: '镖局杂役',
      detail: '更熟悉兵器与奔走，适合先走战斗与门派路线。',
      stats: { 气血: 92, 内力: 24, 臂力: 8, 身法: 7, 根骨: 8, 悟性: 5 },
      starter: '精钢长剑、绷带'
    },
    wanderer: {
      label: '逃亡旅人',
      detail: '生存本能很强，探索与转场更灵活，适合奇遇路线。',
      stats: { 气血: 78, 内力: 30, 臂力: 6, 身法: 9, 根骨: 6, 悟性: 7 },
      starter: '行旅靴、绷带'
    }
  };

  var talents = {
    modern: { label: '现代思维', detail: '更容易看懂事件破局点，初始悟性与生存略有提升。', bonus: '悟性 +1 · 气血上限 +6' },
    meridian: { label: '天生奇脉', detail: '内力回路更通畅，适合优先修习内功与门派心法。', bonus: '内力上限 +20 · 悟性 +1' },
    memory: { label: '过目不忘', detail: '更容易记下招式和线索，适合走武学与主线推进。', bonus: '悟性 +2 · 身法 +1' },
    streetwise: { label: '街头智慧', detail: '更懂江湖买卖和人情交换，适合资源与黑市路线。', bonus: '银两 +18 · 声望 +2' },
    anomaly: { label: '命格异常', detail: '与穿越异象更接近，容易触发隐藏分支和异常反应。', bonus: '命格 +3 · 隐藏奇遇提高' }
  };

  function optionHtml(options) {
    return options.map(function (item) {
      return '<option value="' + item.value + '">' + item.label + '</option>';
    }).join('');
  }

  function lineItems(stats) {
    return Object.keys(stats).map(function (key) {
      return '<div class="base-attr-item"><span>' + key + '</span><strong>' + stats[key] + '</strong></div>';
    }).join('');
  }

  G.Scenes.CreateRoleScene = new Phaser.Class({
    Extends: Phaser.Scene,
    initialize: function CreateRoleScene() {
      Phaser.Scene.call(this, { key: G.Core.Config.SCENES.CREATE_ROLE });
    },
    create: function () {
      this.cameras.main.setBackgroundColor('#070f18');
      this.add.rectangle(640, 380, 1280, 760, 0x07101a, 1);
      this.add.line(100, 110, 0, 0, 1080, 0, 0x49648f, 0.22).setOrigin(0, 0);
      this.add.line(100, 660, 0, 0, 1080, 0, 0x49648f, 0.12).setOrigin(0, 0);
      this.add.triangle(190, 670, 0, 760, 190, 210, 370, 760, 0x0c1826, 1);
      this.add.triangle(520, 620, 280, 760, 520, 240, 760, 760, 0x0f1b2b, 1);
      this.add.triangle(970, 670, 720, 760, 970, 260, 1220, 760, 0x132136, 1);

      var layer = document.createElement('div');
      layer.className = 'ui-layer scene-shell';

      var wrap = document.createElement('div');
      wrap.className = 'hub-layout umd-layout scene-layout';

      var left = document.createElement('aside');
      left.className = 'hud-column hud-column-left';
      left.innerHTML = [
        '<section class="panel panel-strong base-stat-panel role-identity-panel">',
          '<div class="panel-header slim"><h3>穿越者档案</h3><span class="muted">角色创建</span></div>',
          '<div class="identity-portrait">侠</div>',
          '<div class="identity-line-list">',
            '<div class="base-attr-item"><span>当前世界</span><strong>大晟江湖</strong></div>',
            '<div class="base-attr-item"><span>初始地点</span><strong>青石镇</strong></div>',
            '<div class="base-attr-item"><span>界门阶段</span><strong>第一世界</strong></div>',
          '</div>',
          '<div class="muted attr-footnote">你将以统一 UMD 线条界面进入主游戏场景，后续事件、战斗与地图界面都沿用这套结构。</div>',
        '</section>',
        '<section class="panel base-stat-panel">',
          '<div class="panel-header slim"><h3>出身预览</h3><span class="muted" id="role-left-kicker">基础底值</span></div>',
          '<div class="base-attr-list" id="role-background-stats"></div>',
        '</section>',
        '<section class="panel equipment-brief-panel">',
          '<div class="panel-header slim"><h3>开局携带</h3><span class="muted">出身绑定</span></div>',
          '<div class="identity-line-list">',
            '<div class="base-attr-item"><span>初始物资</span><strong id="role-starter-items">--</strong></div>',
            '<div class="base-attr-item"><span>天赋加成</span><strong id="role-talent-bonus">--</strong></div>',
          '</div>',
          '<div class="muted attr-footnote" id="role-talent-detail">选择天赋后，这里会显示穿越者的额外优势。</div>',
        '</section>'
      ].join('');

      var main = G.UI.Panel({ title: '创建角色', subtitle: 'UMD 线条界面 / 开局建档', className: 'main-panel hub-main-panel', strong: true });
      main.body.innerHTML = [
        '<div class="scene-banner line-card">',
          '<div class="scene-line-label">角色创建界面</div>',
          '<h3>界门开启前的最后确认</h3>',
          '<p>输入角色名，选择出身与天赋。完成后会立即进入纯游戏主界面，并以当前选择写入初始属性、装备和后续分支。</p>',
        '</div>',
        '<div class="role-create-grid">',
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
        '<div class="story-block role-scene-note" id="role-summary-copy"></div>',
        '<div class="btn-row">',
          '<button class="btn primary" id="start-adventure">进入江湖</button>',
          '<button class="btn" id="back-menu">返回主菜单</button>',
        '</div>'
      ].join('');

      var right = G.UI.Panel({ title: '初始路线', subtitle: '开局说明 / 界面提示', className: 'sidebar-panel hub-side-panel' });
      right.body.innerHTML = [
        '<div class="quest-card line-card">',
          '<div class="window-kicker">开局目标</div>',
          '<h3>先在青石镇立足</h3>',
          '<p>进入江湖后，你会先以主游戏界面停留在当前地点，再通过左右两侧小三角抽屉打开个人信息、背包、技能、地图和商场。</p>',
        '</div>',
        '<div class="feature-card compact line-card">',
          '<div class="feature-kicker">路线说明</div>',
          '<div class="bullet-list">',
            '<div>· 主界面：左属性列 / 中央场景区 / 右情报列。</div>',
            '<div>· 事件页：延续相同布局，选项在中央主面板展开。</div>',
            '<div>· 战斗页：延续相同布局，战斗日志和操作集中显示。</div>',
          '</div>',
        '</div>',
        '<div class="feature-card compact line-card">',
          '<div class="feature-kicker">当前选择</div>',
          '<div class="identity-line-list">',
            '<div class="base-attr-item"><span>出身</span><strong id="role-right-background">落魄书生</strong></div>',
            '<div class="base-attr-item"><span>天赋</span><strong id="role-right-talent">现代思维</strong></div>',
          '</div>',
          '<p class="muted" id="role-background-detail">--</p>',
        '</div>'
      ].join('');

      wrap.appendChild(left);
      wrap.appendChild(main);
      wrap.appendChild(right);
      layer.appendChild(wrap);

      var uiRoot = document.getElementById('ui-root');
      uiRoot.innerHTML = '';
      uiRoot.appendChild(layer);

      var nameInput = main.body.querySelector('#role-name');
      var backgroundSelect = main.body.querySelector('#role-background');
      var talentSelect = main.body.querySelector('#role-talent');
      var genderSelect = main.body.querySelector('#role-gender');
      var backgroundStats = left.querySelector('#role-background-stats');
      var starterItems = left.querySelector('#role-starter-items');
      var talentBonus = left.querySelector('#role-talent-bonus');
      var talentDetail = left.querySelector('#role-talent-detail');
      var summaryCopy = main.body.querySelector('#role-summary-copy');
      var rightBackground = right.body.querySelector('#role-right-background');
      var rightTalent = right.body.querySelector('#role-right-talent');
      var rightDetail = right.body.querySelector('#role-background-detail');

      function refreshPreview() {
        var bg = backgrounds[backgroundSelect.value] || backgrounds.scholar;
        var talent = talents[talentSelect.value] || talents.modern;
        var name = nameInput.value.trim() || '无名客';
        var genderText = genderSelect.options[genderSelect.selectedIndex].text;
        backgroundStats.innerHTML = lineItems(bg.stats);
        starterItems.textContent = bg.starter;
        talentBonus.textContent = talent.bonus;
        talentDetail.textContent = talent.detail;
        rightBackground.textContent = bg.label;
        rightTalent.textContent = talent.label;
        rightDetail.textContent = bg.detail;
        summaryCopy.innerHTML = name + '（' + genderText + '）将以<strong class="gold">' + bg.label + '</strong>的身份坠入第一世界，并携带<strong class="gold">' + talent.label + '</strong>这一穿越优势。开局后系统会自动附带对应装备与基础资源，并把该选择写入人物属性、装备联动和后续门派路线。';
      }

      [nameInput, backgroundSelect, talentSelect, genderSelect].forEach(function (input) {
        input.addEventListener('input', refreshPreview);
        input.addEventListener('change', refreshPreview);
      });
      refreshPreview();

      main.body.querySelector('#start-adventure').addEventListener('click', function () {
        var payload = {
          name: nameInput.value.trim() || '无名客',
          gender: genderSelect.value,
          background: backgroundSelect.value,
          talent: talentSelect.value
        };
        G.Worlds.WuxiaController.startNewGame(payload);
        G.Core.Router.go(G.Core.Config.SCENES.EVENT);
      });

      main.body.querySelector('#back-menu').addEventListener('click', function () {
        G.Core.Router.go(G.Core.Config.SCENES.MENU);
      });
    }
  });
})(window.TransmigratorGame);
