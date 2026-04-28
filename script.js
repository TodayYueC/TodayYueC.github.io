const state = {
  lang: localStorage.getItem("portfolioLang") || "zh",
  filter: "all",
  expandedNoteId: null
};

const i18n = {
  zh: {
    documentTitle: "YueC | UE5 玩法工程师",
    metaDescription: "YueC 的 UE5 玩法工程作品集，包含 C++、GAS、节奏射击、近战系统和 Unreal Engine 学习笔记。",
    navAbout: "关于",
    navSkills: "技能",
    navProjects: "项目",
    navNotes: "笔记",
    navContact: "联系",
    langButton: "EN",
    brandSlogan: "二次元死宅，也想用双手创造一点“世界”",
    heroEyebrow: "UE5 玩法工程师 / C++ / Gameplay",
    heroTitle: "我在 Engine 里搭玩法骨架，也给奇怪想法找一条能跑起来的路。",
    heroDescription: "我想做的，是把脑子里那些乱七八糟但很想实现的东西，一点点变成能玩的世界。",
    ctaGithub: "GitHub",
    ctaVideo: "Bilibili",
    heroLocation: "China",
    heroFocus: "Gameplay systems",
    factEngine: "近期项目引擎版本",
    factCpp: "主要开发语言",
    factRepos: "非 fork 公开仓库",
    factGameDev: "玩法系统开发",
    aboutEyebrow: "个人方向",
    aboutTitle: "我的终极目标，是创造一个能把内心想法全盘托出的世界。",
    aboutBody: "目前主要围绕 UE5 玩法工程积累：角色控制、Enhanced Input、GAS、动画蒙太奇、行为树、UMG、DataAsset 配置和多人同步基础。我的项目不追求一次性把内容堆满，而是先把输入、状态、数值、表现之间的关系梳理干净。",
    aboutBody2: "这里尽量只放我愿意被继续追问实现细节的内容：项目怎么拆、问题怎么修、下一步还可以怎么扩展。",
    skillsEyebrow: "技术栈",
    skillsTitle: "能直接落到项目里的能力",
    skillsIntro: "下面按“能解决什么问题”来组织，不按工具名堆列表。",
    projectsEyebrow: "项目",
    projectsTitle: "主要项目",
    projectsIntro: "两个 UE5 项目分别记录了我处理玩法工程的两类问题：PurgeHour 侧重战斗框架、能力归属和装备数据，Cyber2026 侧重节奏判定、事件分发，以及 Game Jam 结束后的工程化整理。",
    projectsVideoLink: "先看作品集视频",
    vibeEyebrow: "Vibecoding",
    vibeTitle: "把小念头做出来",
    vibeIntro: "这里放一些开发来玩的项目，会分成更靠近 gameplay 系统的练习，和其他类型的小东西。",
    vibeGameplayTitle: "Gameplay 相关",
    vibeGameplayIntro: "这一组更偏插件、系统和引擎工具，所以版面也稍微放大一点。",
    vibeOtherTitle: "其他",
    vibeOtherIntro: "不直接落在游戏引擎里，但一样是拿来试想法的小项目。",
    notesEyebrow: "笔记",
    notesTitle: "UE 与 GAS 学习记录",
    notesIntro: "这是我学习 UE 和 GAS 过程中整理出来的笔记，有些内容会和 AI 一起梳理，再改成自己能复盘的版本。点击卡片可以展开正文。",
    filterAll: "全部",
    filterUE: "UE 基础",
    filterGAS: "GAS 系统",
    expandNote: "展开正文",
    collapseNote: "收起正文",
    noNoteContent: "这篇笔记还没有可展示的正文。",
    contactEyebrow: "联系",
    contactTitle: "可以从代码，也可以从视频认识我。",
    contactBody: "我现在最在意的事很简单：把脑内那些热血又麻烦的玩法，拆到 UE5 里还能继续生长。PurgeHour 和 Cyber2026 都是这条路上的存档点。",
    footerNote: "UE5 玩法工程作品集"
  },
  en: {
    documentTitle: "YueC | UE5 Gameplay Engineer",
    metaDescription: "YueC's UE5 gameplay engineering portfolio, including C++, GAS, rhythm shooting, melee systems, and Unreal Engine notes.",
    navAbout: "About",
    navSkills: "Skills",
    navProjects: "Projects",
    navNotes: "Notes",
    navContact: "Contact",
    langButton: "中",
    brandSlogan: "An anime shut-in trying to build small worlds by hand.",
    heroEyebrow: "UE5 Gameplay Engineer / C++ / Gameplay",
    heroTitle: "I build gameplay skeletons in-engine and give odd ideas a way to move.",
    heroDescription: "I want to turn the messy ideas I cannot stop thinking about into worlds people can actually play.",
    ctaGithub: "GitHub",
    ctaVideo: "Bilibili",
    heroLocation: "China",
    heroFocus: "Gameplay systems",
    factEngine: "Recent engine version",
    factCpp: "Main language",
    factRepos: "Non-fork public repos",
    factGameDev: "Gameplay systems",
    aboutEyebrow: "Direction",
    aboutTitle: "My end goal is to create a world where I can pour out everything I have been carrying inside.",
    aboutBody: "My current UE5 work centers on character control, Enhanced Input, GAS, animation montages, behavior trees, UMG, DataAsset configuration, and multiplayer fundamentals. The goal is not to pack in one-off features, but to clarify how input, state, numbers, and presentation talk to each other.",
    aboutBody2: "I try to keep the site focused on work I am willing to be asked about in detail: how it was split, what broke, and where it can go next.",
    skillsEyebrow: "Stack",
    skillsTitle: "Skills that map to real project problems",
    skillsIntro: "The list is organized by the problem each skill helps solve, not by tool names alone.",
    projectsEyebrow: "Projects",
    projectsTitle: "Main projects",
    projectsIntro: "These two UE5 projects record two kinds of gameplay engineering problems I have worked through: PurgeHour focuses on combat structure, ability ownership, and equipment data; Cyber2026 focuses on rhythm judgment, event dispatching, and post-jam engineering cleanup.",
    projectsVideoLink: "Watch portfolio video",
    vibeEyebrow: "Vibecoding",
    vibeTitle: "Small ideas made real",
    vibeIntro: "This is where I keep playful side projects, split between experiments closer to gameplay systems and everything else.",
    vibeGameplayTitle: "Gameplay related",
    vibeGameplayIntro: "This group leans more toward plugins, systems, and engine tools, so it gets a little more room.",
    vibeOtherTitle: "Other",
    vibeOtherIntro: "Smaller ideas that do not sit inside a game engine, but still came from the same urge to make something quickly.",
    notesEyebrow: "Notes",
    notesTitle: "UE and GAS learning notes",
    notesIntro: "These are notes from studying UE and GAS. Some entries were organized together with AI, then rewritten into a version I can actually review later. Click a card to expand.",
    filterAll: "All",
    filterUE: "UE basics",
    filterGAS: "GAS systems",
    expandNote: "Read note",
    collapseNote: "Close note",
    noNoteContent: "This note does not have displayable content yet.",
    contactEyebrow: "Contact",
    contactTitle: "Start with the code, or with the video.",
    contactBody: "What I care about right now is simple: taking the loud, troublesome gameplay ideas in my head and breaking them into UE5 systems that can keep growing. PurgeHour and Cyber2026 are save points on that road.",
    footerNote: "UE5 gameplay engineering portfolio"
  }
};

const skillItems = {
  zh: [
    { title: "玩法系统", body: "角色控制、输入映射、战斗状态、命中检测和反馈链路，重点是让系统边界清楚。", tags: ["UE5", "Enhanced Input", "Combat"] },
    { title: "GAS 架构", body: "围绕 ASC、AttributeSet、GameplayEffect、GameplayAbility 与 GameplayTag 做技能和属性流程。", tags: ["ASC", "GE/GA", "GameplayTags"] },
    { title: "AI 与行为树", body: "行为树任务、感知、巡逻、追击和攻击流程，配合 GAS 或普通伤害系统使用。", tags: ["Behavior Tree", "Perception", "BTTask"] },
    { title: "UI 与事件同步", body: "用委托、子系统和 UMG 组织 UI 刷新，避免界面层直接绑定太多游戏对象。", tags: ["UMG", "Delegates", "Subsystem"] },
    { title: "数据驱动", body: "用 DataAsset 和蓝图资产承载可调配置，让武器、技能、动画和数值更容易扩展。", tags: ["DataAsset", "Blueprint", "TSubclassOf"] },
    { title: "工程基础", body: "C++、对象生命周期、内存与网络基础。写玩法时会同时考虑调试和维护成本。", tags: ["C++", "Lifecycle", "Networking"] }
  ],
  en: [
    { title: "Gameplay systems", body: "Character control, input mapping, combat states, hit detection, and feedback chains with clear boundaries.", tags: ["UE5", "Enhanced Input", "Combat"] },
    { title: "GAS architecture", body: "Ability and attribute pipelines built around ASC, AttributeSet, GameplayEffect, GameplayAbility, and GameplayTag.", tags: ["ASC", "GE/GA", "GameplayTags"] },
    { title: "AI and behavior trees", body: "Behavior tree tasks, perception, patrol, pursuit, and attack flows that can work with GAS or standard damage systems.", tags: ["Behavior Tree", "Perception", "BTTask"] },
    { title: "UI and event sync", body: "Delegates, subsystems, and UMG for UI updates without over-coupling widgets to gameplay actors.", tags: ["UMG", "Delegates", "Subsystem"] },
    { title: "Data-driven workflows", body: "DataAssets and Blueprint assets for weapons, abilities, animations, and tunable values.", tags: ["DataAsset", "Blueprint", "TSubclassOf"] },
    { title: "Engineering fundamentals", body: "C++, object lifecycle, memory, and networking basics with debugging and maintenance in mind.", tags: ["C++", "Lifecycle", "Networking"] }
  ]
};

const projectItems = {
  zh: [
    {
      title: "PurgeHour_UE5.7",
      subtitle: "第三人称混合战斗框架",
      body: "PurgeHour 是我用来沉淀 UE5 玩法工程的主项目。它不是单纯把射击和近战放在一个角色上，而是围绕 GAS 先把所有权、属性、输入、装备和敌人行为拆清楚：PlayerState 持有 ASC，Character 只负责表现和输入承接，武器与技能通过数据资产配置，避免后期每加一种武器都改核心代码。",
      placeholder: "PurgeHour",
      meta: ["C++", "Unreal Engine 5.7", "GAS", "TPS + ACT"],
      points: ["PlayerState 作为 Owner，Character 作为 Avatar，重生后重新 InitAbilityActorInfo，不把冷却、Buff 和属性状态绑死在可销毁角色上。", "射击与近战都走 GAS 能力链路，GameplayTag 管输入、状态和互斥关系，降低蓝图里临时布尔值造成的状态残留。", "枪械、剑、动画和数值配置尽量外移到 DataAsset/蓝图资产，C++ 保留底层规则和扩展接口。", "敌人侧接入 AIController、Behavior Tree 与 GAS，能继续扩展巡逻、索敌、攻击任务和命中反馈。"],
      links: [{ label: "打开仓库", href: "https://github.com/TodayYueC/PurgeHour_UE5.7" }]
    },
    {
      title: "Cyber2026_UE5.7",
      subtitle: "节奏射击与 ARPG 融合",
      body: "Cyber2026 是 Global Game Jam 里的合作项目，核心是把第三人称射击和节奏判定绑在一起：玩家需要跟着节拍开火，并在不同面具/状态之间切换节奏。活动结束后，我又和 Claude 重新整理过代码框架，把 Jam 期间堆在一起的逻辑拆回角色、节奏判定、战斗、事件和 UI 几层。",
      placeholder: "Cyber2026",
      meta: ["C++", "Unreal Engine 5.7", "Game Jam", "Event Bus"],
      points: ["节奏系统区分 Early Hit、Late Hit 和 Miss，避免所有输入都被粗暴地塞进一个命中窗口。", "面具切换和射击反馈通过事件分发给 UI，减少 Widget 直接读取角色变量的情况。", "战斗和死亡连锁加了重复触发保护，避免 Jam 原型里常见的边界抖动。", "活动结束后和 Claude 重新整理过目录与职责，让原型逻辑能继续维护，而不是只停留在 48 小时能跑的状态。"],
      links: [{ label: "打开仓库", href: "https://github.com/TodayYueC/Cyber2026_UE5.7" }]
    }
  ],
  en: [
    {
      title: "PurgeHour_UE5.7",
      subtitle: "Third-person hybrid combat framework",
      body: "PurgeHour is the main project I use to shape UE5 gameplay engineering habits. It is not just a character with both shooting and melee actions; the work is in separating GAS ownership, attributes, input, equipment, and enemy behavior so new weapons and abilities can be added without rewriting the center of the project.",
      placeholder: "PurgeHour",
      meta: ["C++", "Unreal Engine 5.7", "GAS", "TPS + ACT"],
      points: ["PlayerState owns the ASC while Character works as Avatar, so respawn can re-run InitAbilityActorInfo without throwing away cooldowns, buffs, and attributes.", "Shooting and melee use GAS ability flows, with GameplayTags handling input, state, and mutual exclusion instead of scattered Blueprint booleans.", "Weapon, sword, animation, and numeric configuration live in DataAssets or Blueprint assets where possible; C++ keeps the rules and extension points.", "Enemy behavior connects AIController, Behavior Tree, and GAS, leaving space for patrol, targeting, attack tasks, and hit feedback."],
      links: [{ label: "Open repository", href: "https://github.com/TodayYueC/PurgeHour_UE5.7" }]
    },
    {
      title: "Cyber2026_UE5.7",
      subtitle: "Rhythm shooter with ARPG elements",
      body: "Cyber2026 was a Global Game Jam collaboration built around third-person shooting and rhythm judgment: the player fires on beat and switches between masks or states. After the event, I reorganized the code framework with Claude, pulling jam-time logic back into character, rhythm judgment, combat, event, and UI layers.",
      placeholder: "Cyber2026",
      meta: ["C++", "Unreal Engine 5.7", "Game Jam", "Event Bus"],
      points: ["The rhythm system distinguishes Early Hit, Late Hit, and Miss instead of flattening all input into one timing window.", "Mask switching and shooting feedback are sent to UI through events, reducing direct reads from widgets into character state.", "Combat and chain-death logic include duplicate-trigger guards for the fragile edge cases common in jam prototypes.", "After the event, Claude and I reorganized folders and responsibilities so the prototype was not stuck as a 48-hour tangle."],
      links: [{ label: "Open repository", href: "https://github.com/TodayYueC/Cyber2026_UE5.7" }]
    }
  ]
};

const vibeProjectItems = {
  zh: {
    gameplay: [
      {
        title: "ChronicleEngine",
        label: "UE5 叙事插件",
        body: "一个面向 UE5 的 JRPG 对话与叙事插件项目，覆盖 Dialogue Runner、变量与回滚、Trigger、UMG 表现层以及原生图编辑器等模块。我把它当作一次系统化整理，去验证一套叙事工具链能否从编辑器工作流一路落到运行时接入。",
        meta: ["UE5 Plugin", "Dialogue", "Slate Editor", "MIT"],
        links: [{ label: "打开仓库", href: "https://github.com/TodayYueC/ChronicleEngine" }]
      },
      {
        title: "Novella",
        label: "Godot 叙事插件",
        body: "一个基于 Godot 4 的 visual novel / GalGame 插件项目，包含脚本解析、运行时 VM、存档回滚、编辑器 dock 与打包脚本。我把它当作同类叙事系统在另一套引擎中的实现与对照，用来继续打磨工具链和运行时结构。",
        meta: ["Godot 4", "GDScript", "Visual Novel", "Addon"],
        links: [{ label: "打开仓库", href: "https://github.com/TodayYueC/Novella" }]
      }
    ],
    other: [
      {
        title: "BodyTrack",
        label: "应用小项目",
        body: "一个 Kotlin + Jetpack Compose 的身体数据记录小工具，用来记体重、体脂、围度、BMI 和趋势。比起主线项目，它更像我拿来快速验证一个日常小需求的随手实现。",
        meta: ["Kotlin", "Compose", "Local-first"],
        links: [{ label: "打开仓库", href: "https://github.com/TodayYueC/BodyTrack" }]
      }
    ]
  },
  en: {
    gameplay: [
      {
        title: "ChronicleEngine",
        label: "UE5 narrative plugin",
        body: "A UE5 plugin project focused on JRPG-style dialogue and narrative flow, covering a dialogue runner, variables and rollback, triggers, a UMG-facing presentation layer, and a native graph editor. I use it to test whether a narrative toolchain can stay coherent from editor workflow through runtime integration.",
        meta: ["UE5 Plugin", "Dialogue", "Slate Editor", "MIT"],
        links: [{ label: "Open repository", href: "https://github.com/TodayYueC/ChronicleEngine" }]
      },
      {
        title: "Novella",
        label: "Godot narrative plugin",
        body: "A Godot 4 visual novel / GalGame plugin project with its own script parsing, runtime VM, save and rollback flow, editor dock, and packaging scripts. I treat it as a parallel implementation of the same narrative-system problem in another engine, with more attention on toolchain structure and runtime flow.",
        meta: ["Godot 4", "GDScript", "Visual Novel", "Addon"],
        links: [{ label: "Open repository", href: "https://github.com/TodayYueC/Novella" }]
      }
    ],
    other: [
      {
        title: "BodyTrack",
        label: "app side project",
        body: "A Kotlin + Jetpack Compose utility for tracking weight, body fat, measurements, BMI, and trends. Compared with the game-facing work, this one is more of a quick everyday need turned into a usable little app.",
        meta: ["Kotlin", "Compose", "Local-first"],
        links: [{ label: "Open repository", href: "https://github.com/TodayYueC/BodyTrack" }]
      }
    ]
  }
};

const noteItems = {
  zh: [
    { id: "ue_001", category: "ue", number: "001", title: "碰撞与重叠系统", summary: "Trigger、Block、Overlap、Hit 和碰撞配置。", tags: ["Collision", "Overlap", "Hit"] },
    { id: "ue_002", category: "ue", number: "002", title: "委托与事件", summary: "动态多播委托、广播、绑定和解耦通信。", tags: ["Delegates", "Events", "Blueprint"] },
    { id: "ue_003", category: "ue", number: "003", title: "组件生命周期", summary: "组件初始化、Tick、销毁和通信边界。", tags: ["Components", "Lifecycle"] },
    { id: "ue_004", category: "ue", number: "004", title: "逻辑优化与交互", summary: "交互逻辑、调试路径和性能注意点。", tags: ["Optimization", "Debug"] },
    { id: "ue_005", category: "ue", number: "005", title: "角色控制与增强输入", summary: "Enhanced Input、移动参数和角色控制链路。", tags: ["Input", "Character"] },
    { id: "ue_006", category: "ue", number: "006", title: "控制器架构", summary: "PlayerController、AIController 和输入职责划分。", tags: ["Controller", "Input"] },
    { id: "ue_007", category: "ue", number: "007", title: "战斗与伤害框架", summary: "伤害责任链、命中检测和战斗系统边界。", tags: ["Combat", "Damage"] },
    { id: "ue_008", category: "ue", number: "008", title: "射线检测与空间数学", summary: "Line Trace、Shape Trace 和瞄准视差修正。", tags: ["Trace", "Math"] },
    { id: "ue_009", category: "ue", number: "009", title: "通用交互与调试", summary: "交互组件、调试显示和可复用接口。", tags: ["Interaction", "Debug"] },
    { id: "ue_010", category: "ue", number: "010", title: "属性组件与 UI", summary: "属性组件、事件通知和 UI 同步。", tags: ["Attributes", "UMG"] },
    { id: "ue_011", category: "ue", number: "011", title: "动画系统架构", summary: "AnimBP、Montage、状态机和 IK 重定向。", tags: ["Animation", "Montage"] },
    { id: "ue_012", category: "ue", number: "012", title: "行为树基础", summary: "NavMesh、Blackboard、BTTask 和 AI 控制器。", tags: ["Behavior Tree", "AI"] },
    { id: "ue_013", category: "ue", number: "013", title: "感知与动态决策", summary: "AI Perception、目标检测和追击恢复。", tags: ["Perception", "Decision"] },
    { id: "ue_014", category: "ue", number: "014", title: "战斗执行与数据驱动", summary: "AI 攻击任务、命中去重和 DataAsset 入门。", tags: ["Combat", "DataAsset"] },
    { id: "ue_015", category: "ue", number: "015", title: "数据驱动背包", summary: "拾取物、物品配置和背包 UI 数据流。", tags: ["Inventory", "Data"] },
    { id: "ue_016", category: "ue", number: "016", title: "游戏循环与规则", summary: "Tick、规则更新和游戏循环结构。", tags: ["Game Loop", "Rules"] },
    { id: "gas_shoot_1", category: "gas", number: "GAS 01", title: "射击系统：所有权与属性集", summary: "ASC 所有权、PlayerState、Avatar 和 AttributeSet 初始化。", tags: ["ASC", "AttributeSet"] },
    { id: "gas_shoot_2", category: "gas", number: "GAS 02", title: "射击系统：输入与能力", summary: "输入绑定、技能激活和射击链路。", tags: ["Ability", "Input"] },
    { id: "gas_shoot_3", category: "gas", number: "GAS 03", title: "射击系统：命中与反馈", summary: "命中检测、伤害效果和 GameplayCue。", tags: ["GameplayCue", "Damage"] },
    { id: "gas_shoot_4", category: "gas", number: "GAS 04", title: "射击系统：网络与扩展", summary: "复制、预测和武器配置扩展。", tags: ["Replication", "Weapon"] },
    { id: "gas_melee_1", category: "gas", number: "GAS 05", title: "近战系统：基础链路", summary: "近战能力、命中窗口和动画触发。", tags: ["Melee", "Montage"] },
    { id: "gas_melee_2", category: "gas", number: "GAS 06", title: "近战系统：连招与事件", summary: "连招输入缓存、Wait Gameplay Event 和 AbilityTask。", tags: ["Combo", "Event"] },
    { id: "gas_melee_3", category: "gas", number: "GAS 07", title: "近战系统：索敌与收尾", summary: "Motion Warping、索敌筛选和收尾优化。", tags: ["Motion Warping", "Targeting"] }
  ],
  en: [
    { id: "ue_001", category: "ue", number: "001", title: "Collision and overlap", summary: "Trigger, Block, Overlap, Hit, and collision configuration.", tags: ["Collision", "Overlap", "Hit"] },
    { id: "ue_002", category: "ue", number: "002", title: "Delegates and events", summary: "Dynamic multicast delegates, broadcast, binding, and decoupled communication.", tags: ["Delegates", "Events", "Blueprint"] },
    { id: "ue_003", category: "ue", number: "003", title: "Component lifecycle", summary: "Component initialization, ticking, destruction, and communication boundaries.", tags: ["Components", "Lifecycle"] },
    { id: "ue_004", category: "ue", number: "004", title: "Logic optimization", summary: "Interaction logic, debugging paths, and performance notes.", tags: ["Optimization", "Debug"] },
    { id: "ue_005", category: "ue", number: "005", title: "Character control and Enhanced Input", summary: "Enhanced Input, movement parameters, and character control flow.", tags: ["Input", "Character"] },
    { id: "ue_006", category: "ue", number: "006", title: "Controller architecture", summary: "PlayerController, AIController, and input responsibility boundaries.", tags: ["Controller", "Input"] },
    { id: "ue_007", category: "ue", number: "007", title: "Combat and damage framework", summary: "Damage responsibility chains, hit detection, and combat boundaries.", tags: ["Combat", "Damage"] },
    { id: "ue_008", category: "ue", number: "008", title: "Trace and spatial math", summary: "Line Trace, Shape Trace, and third-person aiming correction.", tags: ["Trace", "Math"] },
    { id: "ue_009", category: "ue", number: "009", title: "Interaction and debugging", summary: "Interaction components, debug display, and reusable interfaces.", tags: ["Interaction", "Debug"] },
    { id: "ue_010", category: "ue", number: "010", title: "Attribute component and UI", summary: "Attribute components, event notifications, and UI sync.", tags: ["Attributes", "UMG"] },
    { id: "ue_011", category: "ue", number: "011", title: "Animation architecture", summary: "AnimBP, Montage, state machines, and IK retargeting.", tags: ["Animation", "Montage"] },
    { id: "ue_012", category: "ue", number: "012", title: "Behavior tree basics", summary: "NavMesh, Blackboard, BTTask, and AI controllers.", tags: ["Behavior Tree", "AI"] },
    { id: "ue_013", category: "ue", number: "013", title: "Perception and decision making", summary: "AI Perception, target detection, pursuit, and recovery.", tags: ["Perception", "Decision"] },
    { id: "ue_014", category: "ue", number: "014", title: "Combat execution and data assets", summary: "AI attack tasks, hit de-duplication, and DataAsset basics.", tags: ["Combat", "DataAsset"] },
    { id: "ue_015", category: "ue", number: "015", title: "Data-driven inventory", summary: "Pickup actors, item configuration, and inventory UI data flow.", tags: ["Inventory", "Data"] },
    { id: "ue_016", category: "ue", number: "016", title: "Game loop and rules", summary: "Tick, rule updates, and game loop structure.", tags: ["Game Loop", "Rules"] },
    { id: "gas_shoot_1", category: "gas", number: "GAS 01", title: "Shooting: ownership and attributes", summary: "ASC ownership, PlayerState, Avatar, and AttributeSet initialization.", tags: ["ASC", "AttributeSet"] },
    { id: "gas_shoot_2", category: "gas", number: "GAS 02", title: "Shooting: input and abilities", summary: "Input binding, ability activation, and shooting flow.", tags: ["Ability", "Input"] },
    { id: "gas_shoot_3", category: "gas", number: "GAS 03", title: "Shooting: hit and feedback", summary: "Hit detection, damage effects, and GameplayCue.", tags: ["GameplayCue", "Damage"] },
    { id: "gas_shoot_4", category: "gas", number: "GAS 04", title: "Shooting: networking and extension", summary: "Replication, prediction, and weapon configuration extension.", tags: ["Replication", "Weapon"] },
    { id: "gas_melee_1", category: "gas", number: "GAS 05", title: "Melee: base flow", summary: "Melee abilities, hit windows, and animation triggers.", tags: ["Melee", "Montage"] },
    { id: "gas_melee_2", category: "gas", number: "GAS 06", title: "Melee: combo and events", summary: "Combo input buffering, Wait Gameplay Event, and AbilityTask.", tags: ["Combo", "Event"] },
    { id: "gas_melee_3", category: "gas", number: "GAS 07", title: "Melee: targeting and polish", summary: "Motion Warping, target filtering, and final integration.", tags: ["Motion Warping", "Targeting"] }
  ]
};

const navToggle = document.querySelector(".nav-toggle");
const navPanel = document.querySelector(".nav-panel");

function t(key) {
  return i18n[state.lang][key] || i18n.zh[key] || key;
}

function escapeHtml(value) {
  return String(value)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

function cleanMarkdown(markdown) {
  if (!markdown) return "";
  return markdown
    .replace(/📂|🔥|✅|❌/g, "")
    .replace(/\*\*\[END OF ARCHIVE[^\n]*\*\*/g, "")
    .trim();
}

function fallbackMarkdown(markdown) {
  return escapeHtml(markdown)
    .replace(/^### (.*)$/gm, "<h3>$1</h3>")
    .replace(/^## (.*)$/gm, "<h2>$1</h2>")
    .replace(/^# (.*)$/gm, "<h1>$1</h1>")
    .replace(/`([^`]+)`/g, "<code>$1</code>")
    .replace(/\n{2,}/g, "</p><p>")
    .replace(/\n/g, "<br>");
}

function renderMarkdown(markdown) {
  const cleaned = cleanMarkdown(markdown);
  if (!cleaned) return `<p>${escapeHtml(t("noNoteContent"))}</p>`;
  if (window.marked?.parse) return window.marked.parse(cleaned);
  return `<p>${fallbackMarkdown(cleaned)}</p>`;
}

function updateStaticText() {
  document.documentElement.lang = state.lang === "zh" ? "zh-CN" : "en";
  document.title = t("documentTitle");

  const description = document.querySelector('meta[name="description"]');
  if (description) description.setAttribute("content", t("metaDescription"));

  document.querySelectorAll("[data-i18n]").forEach((element) => {
    element.textContent = t(element.dataset.i18n);
  });
}

function tagList(tags) {
  return tags.map((tag) => `<span class="tag">${escapeHtml(tag)}</span>`).join("");
}

function renderSkills() {
  const grid = document.querySelector("#skills-grid");
  if (!grid) return;

  grid.innerHTML = skillItems[state.lang].map((item) => `
    <article class="info-card">
      <h3>${escapeHtml(item.title)}</h3>
      <p>${escapeHtml(item.body)}</p>
      <div class="tag-list">${tagList(item.tags)}</div>
    </article>
  `).join("");
}

function renderProjects() {
  const list = document.querySelector("#projects-list");
  if (!list) return;

  list.innerHTML = projectItems[state.lang].map((project) => `
    <article class="project-card">
      <div class="project-media placeholder-media" aria-hidden="true">
        <span>${escapeHtml(project.placeholder)}</span>
      </div>
      <div class="project-body">
        <div>
          <p class="eyebrow">${escapeHtml(project.subtitle)}</p>
          <h3>${escapeHtml(project.title)}</h3>
        </div>
        <p>${escapeHtml(project.body)}</p>
        <div class="project-meta">
          ${project.meta.map((meta) => `<span>${escapeHtml(meta)}</span>`).join("")}
        </div>
        <ul class="project-points">
          ${project.points.map((point) => `<li>${escapeHtml(point)}</li>`).join("")}
        </ul>
        <div class="project-links">
          ${project.links.map((link) => `<a class="text-link" href="${escapeHtml(link.href)}" target="_blank" rel="noopener noreferrer">${escapeHtml(link.label)}</a>`).join("")}
        </div>
      </div>
    </article>
  `).join("");
}

function renderVibeProjects() {
  const gameplayList = document.querySelector("#vibe-gameplay-list");
  const otherList = document.querySelector("#vibe-other-list");
  if (!gameplayList || !otherList) return;

  const renderVibeCards = (projects) => projects.map((project) => `
    <article class="vibe-card">
      <div>
        <p class="vibe-label">${escapeHtml(project.label)}</p>
        <h4>${escapeHtml(project.title)}</h4>
      </div>
      <p>${escapeHtml(project.body)}</p>
      <div class="project-meta">
        ${project.meta.map((meta) => `<span>${escapeHtml(meta)}</span>`).join("")}
      </div>
      <div class="project-links">
        ${project.links.map((link) => `<a class="text-link" href="${escapeHtml(link.href)}" target="_blank" rel="noopener noreferrer">${escapeHtml(link.label)}</a>`).join("")}
      </div>
    </article>
  `).join("");

  gameplayList.innerHTML = renderVibeCards(vibeProjectItems[state.lang].gameplay);
  otherList.innerHTML = renderVibeCards(vibeProjectItems[state.lang].other);
}

function filteredNotes() {
  return noteItems[state.lang].filter((note) => state.filter === "all" || note.category === state.filter);
}

function renderNotes() {
  const grid = document.querySelector("#notes-grid");
  if (!grid) return;

  grid.innerHTML = filteredNotes().map((note) => {
    const isExpanded = state.expandedNoteId === note.id;
    const markdown = isExpanded ? renderMarkdown(window.notesData?.[note.id]) : "";
    return `
      <article class="note-card ${isExpanded ? "expanded" : ""}" tabindex="0" role="button" aria-expanded="${isExpanded}" data-note-id="${escapeHtml(note.id)}">
        <div class="note-topline">
          <span class="note-number">${escapeHtml(note.number)}</span>
          <span class="note-category">${note.category === "ue" ? escapeHtml(t("filterUE")) : escapeHtml(t("filterGAS"))}</span>
        </div>
        <h3>${escapeHtml(note.title)}</h3>
        <p class="note-summary">${escapeHtml(note.summary)}</p>
        <div class="note-tags">${tagList(note.tags)}</div>
        <div class="note-expand-text">${escapeHtml(isExpanded ? t("collapseNote") : t("expandNote"))}</div>
        <div class="note-markdown">${markdown}</div>
      </article>
    `;
  }).join("");
}

function toggleLanguage() {
  state.lang = state.lang === "zh" ? "en" : "zh";
  localStorage.setItem("portfolioLang", state.lang);
  renderPage();
}

function setFilter(filter) {
  state.filter = filter;
  state.expandedNoteId = null;
  renderNotes();
  document.querySelectorAll(".filter-btn").forEach((button) => {
    button.classList.toggle("active", button.dataset.filter === filter);
  });
}

function handleNoteClick(card) {
  const noteId = card.dataset.noteId;
  state.expandedNoteId = state.expandedNoteId === noteId ? null : noteId;
  renderNotes();
  if (state.expandedNoteId) {
    requestAnimationFrame(() => {
      const safeNoteId = window.CSS?.escape ? CSS.escape(noteId) : noteId.replace(/"/g, '\\"');
      document.querySelector(`[data-note-id="${safeNoteId}"]`)?.scrollIntoView({
        behavior: "smooth",
        block: "start"
      });
    });
  }
}

function setupEvents() {
  document.querySelector(".lang-toggle")?.addEventListener("click", toggleLanguage);

  navToggle?.addEventListener("click", () => {
    const expanded = navToggle.getAttribute("aria-expanded") === "true";
    navToggle.setAttribute("aria-expanded", String(!expanded));
    navPanel?.classList.toggle("active", !expanded);
    document.body.classList.toggle("nav-open", !expanded);
  });

  document.querySelectorAll(".nav-link").forEach((link) => {
    link.addEventListener("click", () => {
      navToggle?.setAttribute("aria-expanded", "false");
      navPanel?.classList.remove("active");
      document.body.classList.remove("nav-open");
    });
  });

  document.querySelectorAll(".filter-btn").forEach((button) => {
    button.addEventListener("click", () => setFilter(button.dataset.filter));
  });

  document.querySelector("#notes-grid")?.addEventListener("click", (event) => {
    const card = event.target.closest(".note-card");
    if (card) handleNoteClick(card);
  });

  document.querySelector("#notes-grid")?.addEventListener("keydown", (event) => {
    if (event.key !== "Enter" && event.key !== " ") return;
    const card = event.target.closest(".note-card");
    if (!card) return;
    event.preventDefault();
    handleNoteClick(card);
  });

  document.addEventListener("keydown", (event) => {
    if (event.key === "Escape" && state.expandedNoteId) {
      state.expandedNoteId = null;
      renderNotes();
    }
  });
}

function renderPage() {
  updateStaticText();
  renderSkills();
  renderProjects();
  renderVibeProjects();
  renderNotes();
  document.querySelectorAll(".filter-btn").forEach((button) => {
    button.classList.toggle("active", button.dataset.filter === state.filter);
  });
}

document.addEventListener("DOMContentLoaded", () => {
  setupEvents();
  renderPage();
});
