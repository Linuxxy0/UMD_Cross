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
      return '<div class="rail-stat-row"><span>' + key + '</span><span class="mono">' + stats[key] + '</span></div>';
    }).join('');
  }

  function renderCreateRole() {
    var shell = G.UI.Shell.create({
      player: null,
      node: null,
      sceneClass: 'scene-create-shell',
      statusTitle: '穿越身份校准',
      statusMeta: '建立新的江湖档案',
      worldLine: '大晟江湖 / 青石镇前夜',
      timeLine: '创建角色 / 第一世界 / 待投入',
      commandButtons: [
        { label: '开始', onClick: function () { shell.center.querySelector('#start-adventure').click(); } },
        { label: '返回终端', action: { type: 'route', scene: G.Core.Config.SCENES.MENU } }
      ],
      leftHTML: [
        '<section class="panel shell-panel rail-section">',
          '<div class="panel-header"><h2>穿越档案</h2><span class="muted">角色预览</span></div>',
          '<div class="panel-body">',
            '<div class="story-block">当前世界已经待命。建立角色后，你会直接进入主游戏界面，不再经过展示首页。</div>',
          '</div>',
        '</section>',
        '<section class="panel shell-panel rail-section">',
          '<div class="panel-header"><h2>出身预览</h2><span class="muted">基础底值</span></div>',
          '<div class="panel-body" id="role-background-stats"></div>',
        '</section>',
        '<section class="panel shell-panel rail-section">',
          '<div class="panel-header"><h2>开局携带</h2><span class="muted">资源</span></div>',
          '<div class="panel-body">',
            '<div class="rail-stat-row"><span>初始物资</span><span id="role-starter-items">--</span></div>',
            '<div class="rail-stat-row"><span>天赋加成</span><span id="role-talent-bonus">--</span></div>',
            '<div class="empty-tip" id="role-talent-detail">选择天赋后，这里会显示穿越者的额外优势。</div>',
          '</div>',
        '</section>'
      ].join(''),
      centerHTML: [
        '<section class="panel shell-panel">',
          '<div class="panel-header"><h2>身份校准</h2><span class="muted">输入 / 选择 / 确认</span></div>',
          '<div class="panel-body shell-narrative">',
            '<div class="story-block">',
              '<div class="window-kicker">系统提示</div>',
              '<div class="narrative-title">建立后直接进入世界</div>',
              '<div class="narrative-copy">角色建立后会立刻进入大晟江湖。人物、背包、技能、地图与商店都以游戏内窗格打开，不再经过展示首页。</div>',
            '</div>',
            '<div class="role-create-grid">',
              '<label class="form-field"><span>角色名</span><input class="text-input" id="role-name" value="陆惊鸿" maxlength="12" /></label>',
              '<label class="form-field"><span>性别</span><select class="select-input" id="role-gender">', optionHtml([
                { value: 'male', label: '男' },
                { value: 'female', label: '女' },
                { value: 'unknown', label: '不设定' }
              ]), '</select></label>',
              '<label class="form-field"><span>出身</span><select class="select-input" id="role-background">', optionHtml([
                { value: 'scholar', label: '落魄书生' },
                { value: 'escort', label: '镖局杂役' },
                { value: 'wanderer', label: '逃亡旅人' }
              ]), '</select></label>',
              '<label class="form-field"><span>天赋</span><select class="select-input" id="role-talent">', optionHtml([
                { value: 'modern', label: '现代思维' },
                { value: 'meridian', label: '天生奇脉' },
                { value: 'memory', label: '过目不忘' },
                { value: 'streetwise', label: '街头智慧' },
                { value: 'anomaly', label: '命格异常' }
              ]), '</select></label>',
            '</div>',
            '<div class="story-block" id="role-summary-copy"></div>',
            '<div class="btn-row">',
              '<button class="btn primary" id="start-adventure">投入江湖</button>',
              '<button class="btn" id="back-menu">返回终端</button>',
            '</div>',
          '</div>',
        '</section>'
      ].join(''),
      rightHTML: [
        '<section class="panel shell-panel rail-section">',
          '<div class="panel-header"><h2>路线说明</h2><span class="muted">开局</span></div>',
          '<div class="panel-body bullet-list">',
            '<div>· 主界面为三栏终端布局：左角色，中叙事，右上下文。</div>',
            '<div>· 抽屉和底栏只做系统入口，不承担首页展示。</div>',
            '<div>· 事件、战斗、结局都沿用同一套直角线条界面。</div>',
          '</div>',
        '</section>',
        '<section class="panel shell-panel rail-section">',
          '<div class="panel-header"><h2>当前选择</h2><span class="muted">实时</span></div>',
          '<div class="panel-body">',
            '<div class="rail-stat-row"><span>出身</span><span id="role-right-background">落魄书生</span></div>',
            '<div class="rail-stat-row"><span>天赋</span><span id="role-right-talent">现代思维</span></div>',
            '<div class="story-block" id="role-background-detail">--</div>',
          '</div>',
        '</section>'
      ].join(''),
      drawers: false
    });

    shell.mount();

    var center = shell.center;
    var left = shell.left;
    var right = shell.right;

    var nameInput = center.querySelector('#role-name');
    var backgroundSelect = center.querySelector('#role-background');
    var talentSelect = center.querySelector('#role-talent');
    var genderSelect = center.querySelector('#role-gender');
    var backgroundStats = left.querySelector('#role-background-stats');
    var starterItems = left.querySelector('#role-starter-items');
    var talentBonus = left.querySelector('#role-talent-bonus');
    var talentDetail = left.querySelector('#role-talent-detail');
    var summaryCopy = center.querySelector('#role-summary-copy');
    var rightBackground = right.querySelector('#role-right-background');
    var rightTalent = right.querySelector('#role-right-talent');
    var rightDetail = right.querySelector('#role-background-detail');

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
      summaryCopy.innerHTML = name + '（' + genderText + '）将以<strong class="gold">' + bg.label + '</strong>的身份进入第一世界，并携带<strong class="gold">' + talent.label + '</strong>这一穿越优势。开局后会直接进入游戏主界面，并写入对应的属性、装备与剧情旗标。';
    }

    [nameInput, backgroundSelect, talentSelect, genderSelect].forEach(function (input) {
      input.addEventListener('input', refreshPreview);
      input.addEventListener('change', refreshPreview);
    });
    refreshPreview();

    center.querySelector('#start-adventure').addEventListener('click', function () {
      var payload = {
        name: nameInput.value.trim() || '无名客',
        gender: genderSelect.value,
        background: backgroundSelect.value,
        talent: talentSelect.value
      };
      G.Worlds.WuxiaController.startNewGame(payload);
      G.Core.Router.go(G.Core.Config.SCENES.EVENT);
    });

    center.querySelector('#back-menu').addEventListener('click', function () {
      G.Core.Router.go(G.Core.Config.SCENES.MENU);
    });
  }

  G.Scenes.CreateRoleScene = new Phaser.Class({
    Extends: Phaser.Scene,
    initialize: function CreateRoleScene() {
      Phaser.Scene.call(this, { key: G.Core.Config.SCENES.CREATE_ROLE });
    },
    create: function () {
      this.cameras.main.setBackgroundColor('#111315');
      this.add.rectangle(640, 380, 1280, 760, 0x111315, 1);
      renderCreateRole();
    }
  });
})(window.TransmigratorGame);
