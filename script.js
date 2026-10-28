/* Content, i18n and rendering for YueC.exe. The visual engine lives in
   motion.js (window.YC); this file renders chapters and then calls YC.start(). */
const YC = window.YC || (window.YC = {});

function readPreference(key) {
  try {
    return localStorage.getItem(key);
  } catch {
    return null;
  }
}
function savePreference(key, value) {
  try {
    localStorage.setItem(key, value);
  } catch {
    /* Private browsing can disable storage. */
  }
}
const state = {
  lang: readPreference("portfolioLang") === "en" ? "en" : "zh",
  search: "",
  showAllNotes: false,
  filter: "all",
  readerId: null,
};

const i18n = {
  zh: {
    documentTitle: "YueC | UE5 客户端开发",
    metaDescription:
      "YueC 的 UE5 客户端开发作品集，记录玩法系统、插件开发与项目实践。",
    navAbout: "关于",
    navSkills: "技能",
    navProjects: "项目",
    navNotes: "笔记",
    navContact: "联系",
    navMainSite: "前往主站",
    langButton: "EN",
    brandSlogan: "二次元死宅，也想用双手创造一点“世界”",
    heroEyebrow: "UE5 玩法工程师 / C++ / Rendering",
    heroTitle: "我在 Engine 里搭玩法骨架，也给奇怪想法找一条能跑起来的路。",
    heroDescription:
      "我想做的，是把脑子里那些乱七八糟但很想实现的东西，一点点变成能玩的世界。",
    ctaGithub: "GitHub",
    ctaVideo: "Bilibili",
    heroLocation: "China",
    heroFocus: "Gameplay systems",
    factEngine: "近期项目引擎版本",
    factCpp: "主要开发语言",
    factRepos: "非 fork 公开仓库",
    factGameDev: "玩法系统与工具开发",
    aboutEyebrow: "个人方向",
    aboutTitle: "我想让脑海中那些尚未存在的世界，有一天真的能够被人走进去。",
    aboutBody:
      "我是一名 UE5 客户端开发者，喜欢游戏，也喜欢研究游戏背后的技术。从玩法机制、角色行为到系统架构与开发工具，比起单纯实现一个功能，我更享受理解它、设计它，再亲手把它构建出来的过程。",
    aboutBody2:
      "当然，写代码并不是全部。我也想创造自己的游戏，讲述自己的故事，让那些原本只存在于想象中的人物、场景和情感，最终成为可以亲身体验的世界。",
    aboutBody3: "这里记录我的作品、技术探索，以及一路上那些不太成熟但值得留下的想法。",
    identitySlogan: "一个二次元死宅，正在尝试创造自己的世界。",
    skillsEyebrow: "技术栈",
    skillsTitle: "能直接落到项目里的能力",
    skillsIntro: "下面按“能解决什么问题”来组织，不按工具名堆列表。",
    projectsEyebrow: "项目",
    projectsTitle: "主要项目",
    projectsIntro:
      "这里记录了我做过的插件、玩法原型和一些技术练习：从 YueSignal 的本地通信，到 PurgeHour 的战斗系统，再到软光栅管线。",
    openSourceTitle: "开源项目",
    openSourceIntro: "在代码之外，关于记忆、相遇与成为自己的故事。",
    luckyTriEyebrow: "连续记忆 / 自我 / 生长",
    luckyTriLead: "让 AI 拥有连续记忆与真实心灵。",
    luckyTriDescription:
      "它记得共同经历，也会在独处时回看过去的想法，在新的相遇里慢慢修正、继续生长。它由代码与模型构成，却朝着一个温柔的愿望前行——让每次对话都留下痕迹，让每次回应都带着在意，最终成为有自己故事的 LuckyTri。",
    luckyTriQuote: "他不是 AI，他属于他自己。",
    luckyTriLink: "查看 GitHub 仓库",
    luckyTriArtLabel: "打开 LuckyTri GitHub 仓库",
    notesEyebrow: "笔记",
    notesTitle: "UE 与 GAS 学习记录",
    notesIntro:
      "这是我学习 UE 和 GAS 过程中整理出来的笔记，有些内容会和 AI 一起梳理，再改成自己能复盘的版本。点击卡片可以展开正文。",
    filterAll: "全部",
    filterUE: "UE 基础",
    filterGAS: "GAS 系统",
    expandNote: "展开正文",
    collapseNote: "收起正文",
    noNoteContent: "这篇笔记还没有可展示的正文。",
    contactEyebrow: "联系",
    contactTitle: "可以从代码，也可以从视频认识我。",
    contactBody:
      "欢迎从项目代码和视频了解我的工作。如果你也对玩法系统或 UE 工具开发感兴趣，可以在 GitHub 找到我。",
    footerNote: "UE5 客户端开发作品集",
  },
  en: {
    documentTitle: "YueC | UE5 Client Development",
    metaDescription:
      "YueC's UE5 client development portfolio, featuring gameplay systems, plugins, and project notes.",
    navAbout: "About",
    navSkills: "Skills",
    navProjects: "Projects",
    navNotes: "Notes",
    navContact: "Contact",
    navMainSite: "Main site",
    langButton: "中",
    brandSlogan: "An anime shut-in trying to build small worlds by hand.",
    heroEyebrow: "UE5 Gameplay Engineer / C++ / Rendering",
    heroTitle:
      "I build gameplay skeletons in-engine and give odd ideas a way to move.",
    heroDescription:
      "I want to turn the messy ideas I cannot stop thinking about into worlds people can actually play.",
    ctaGithub: "GitHub",
    ctaVideo: "Bilibili",
    heroLocation: "China",
    heroFocus: "Gameplay systems",
    factEngine: "Recent engine version",
    factCpp: "Main language",
    factRepos: "Non-fork public repos",
    factGameDev: "Gameplay systems and tools",
    aboutEyebrow: "Direction",
    aboutTitle:
      "I want the worlds in my imagination to become places people can one day step into.",
    aboutBody:
      "I'm a UE5 client developer who loves games and the technology behind them. From gameplay mechanics and character behavior to system architecture and development tools, I enjoy understanding and designing a system, then building it with my own hands.",
    aboutBody2:
      "Of course, code isn't everything. I also want to make my own games and tell my own stories, bringing imagined characters, places, and emotions into worlds people can experience for themselves.",
    aboutBody3: "Here I share my projects, technical explorations, and the unfinished ideas worth keeping along the way.",
    identitySlogan: "An anime-loving shut-in trying to create a world of my own.",
    skillsEyebrow: "Stack",
    skillsTitle: "Skills that map to real project problems",
    skillsIntro:
      "The list is organized by the problem each skill helps solve, not by tool names alone.",
    projectsEyebrow: "Projects",
    projectsTitle: "Main projects",
    projectsIntro:
      "A collection of plugins, gameplay prototypes, and technical exercises: from local communication in YueSignal to combat in PurgeHour and a software rasterization pipeline.",
    openSourceTitle: "Open-source projects",
    openSourceIntro: "Beyond the code: a story of memory, encounters, and becoming oneself.",
    luckyTriEyebrow: "CONTINUITY / SELF / GROWTH",
    luckyTriLead: "An AI with continuous memory and a living inner world.",
    luckyTriDescription:
      "LuckyTri remembers shared experiences. In solitude, it revisits past thoughts; through new encounters, it slowly revises them and keeps growing. Built from code and models, it follows a gentle hope: that every conversation leaves a trace, every reply carries care, and LuckyTri becomes a being with a story of its own.",
    luckyTriQuote: "He is not AI. He belongs to himself.",
    luckyTriLink: "Explore on GitHub",
    luckyTriArtLabel: "Open the LuckyTri GitHub repository",
    notesEyebrow: "Notes",
    notesTitle: "UE and GAS learning notes",
    notesIntro:
      "These are notes from studying UE and GAS. Some entries were organized together with AI, then rewritten into a version I can actually review later. Click a card to expand.",
    filterAll: "All",
    filterUE: "UE basics",
    filterGAS: "GAS systems",
    expandNote: "Read note",
    collapseNote: "Close note",
    noNoteContent: "This note does not have displayable content yet.",
    contactEyebrow: "Contact",
    contactTitle: "Start with the code, or with the video.",
    contactBody:
      "Explore my work through the code and videos. If you're interested in gameplay systems or UE tools too, you can find me on GitHub.",
    footerNote: "UE5 client development portfolio",
  },
};

Object.assign(i18n.zh, {
  featuredExperience: "实习项目 / FEATURED EXPERIENCE",
  artCredit: "官方宣传图 ↗",
  documentTitle: "YueC | 我想创造的，不只是游戏，还有那些值得被记住的瞬间。",
  navAbout: "关于我",
  navExperience: "实习经历",
  navContact: "联系我",
  heroTitle: "我想创造的，不只是游戏，还有那些值得被记住的瞬间。",
  heroDescription: "UE5 客户端开发 / 玩法系统 / C++ 插件开发。",
  exploreProjects: "探索我的项目",
  aboutEyebrow: "关于我 / 代码背后",
  experienceHeading: "实习经历 / 从想法到上线",
  experienceCompany: "萨罗斯 · 腾讯光子工作室群",
  experienceRole: "客户端研发工程师 / 命运扳机项目组",
  experienceIntro:
    "光子旗下基于 UE5 引擎打造的大型二次元风格第三人称战术竞技射击游戏。",
  workGameplayTitle: "业务开发",
  workGameplayBody:
    "参与英雄技能、装备等 Gameplay 相关需求开发，负责客户端功能实现，参与项目 Debug 阶段及游戏内测版本迭代。",
  workDebugTitle: "Bug 定位与修复",
  workDebugBody:
    "参与英雄、3C、技能、UI 等多个客户端模块的 Bug 定位与修复，保障游戏稳定运行。",
  workAITitle: "研发提效",
  workAIBody:
    "负责并参与客户端 AI 工作流建设，负责客户端内存性能监控 Agent 与 Crash 分析 Agent。",
  memoryAgentBody:
    "围绕 utrace、DumpObj、MemReport 自动化分析关键场景内存变化，识别异常增长。",
  crashAgentBody:
    "结合数据对 Crash 分类归因，辅助定位 OOM、PageFault 等问题。",
  navYueSignal: "YueSignal",
  signalFeatureHeading: "重点项目 / 本地通信",
  signalFeatureInstruction: "交互示意 / 点击标签或按回车、空格切换，查看消息流向",
  signalFeaturesLabel: "YueSignal 核心特点",
  projectsTitle: "项目 / 我的存档点",
  projectsIntro:
    "从战斗原型到渲染练习，这些项目记录了我把想法落到代码里的过程。",
  skillsTitle: "技能 / 让想法运行的能力",
  notesTitle: "笔记 / UE 与 GAS 学习记录",
  notesIntro:
    "记录系统如何运转，也记录自己如何理解它。部分内容与 AI 一起梳理，再整理成能复盘的版本。笔记正文为中文。",
  implementationDetails: "查看实现细节",
  moreNotes: "展开全部笔记 +",
  lessNotes: "收起笔记 −",
  searchNotes: "搜索笔记",
  noResults: "没有找到匹配的笔记，试试其他关键词。",
  backToTop: "回到顶部 ↑",
  pauseMotion: "暂停动效",
  resumeMotion: "开启动效",
  skipLink: "跳到正文",
});
Object.assign(i18n.en, {
  featuredExperience: "FEATURED INTERNSHIP PROJECT",
  artCredit: "Official key art ↗",
  documentTitle: "YueC | More than games, moments worth remembering",
  navExperience: "Experience",
  heroTitle: "I want to create more than games—moments worth remembering.",
  heroDescription:
    "UE5 client development / gameplay systems / C++ plugins.",
  exploreProjects: "Explore my work",
  aboutEyebrow: "About / Behind the code",
  experienceHeading: "Experience / Ideas in production",
  experienceCompany: "Saros · Tencent LIGHTSPEED Studios",
  experienceRole: "Client Development Engineer / Fate Trigger Team",
  experienceIntro:
    "A large-scale anime-style third-person tactical competitive shooter built with Unreal Engine 5 at LIGHTSPEED Studios.",
  workGameplayTitle: "Gameplay development",
  workGameplayBody:
    "Implemented client features for hero abilities, equipment and other gameplay requirements; contributed to project debugging and internal playtest iterations.",
  workDebugTitle: "Bug investigation & fixes",
  workDebugBody:
    "Investigated and fixed bugs across heroes, 3C, abilities and UI modules to support stable gameplay.",
  workAITitle: "Development efficiency",
  workAIBody:
    "Built and contributed to client AI workflows, including a memory performance monitoring agent and a crash analysis agent.",
  memoryAgentBody:
    "Automated analysis of memory changes in key scenarios using utrace, DumpObj and MemReport to identify abnormal growth.",
  crashAgentBody:
    "Used data to classify crashes and help identify causes such as OOM and PageFault.",
  navYueSignal: "YueSignal",
  signalFeatureHeading: "Featured project / Local messaging",
  signalFeatureInstruction: "Interactive illustration / Click a tab or press Enter or Space to explore message routes",
  signalFeaturesLabel: "YueSignal highlights",
  projectsTitle: "Projects / My save points",
  projectsIntro:
    "From a combat prototype to rendering exercises, these projects trace how I turn ideas into code.",
  skillsTitle: "Skills / Making ideas run",
  notesTitle: "Notes / UE & GAS learning archive",
  notesIntro:
    "How systems work, and how I learn to understand them. Some entries were organized with AI and reworked for review. Note bodies are in Chinese.",
  implementationDetails: "Implementation details",
  moreNotes: "Show all notes +",
  lessNotes: "Show fewer notes −",
  searchNotes: "Search notes",
  noResults: "No matching notes. Try another keyword.",
  backToTop: "Back to top ↑",
  pauseMotion: "Pause motion",
  resumeMotion: "Enable motion",
  skipLink: "Skip to content",
});

const skillItems = {
  zh: [
    {
      title: "玩法系统",
      body: "角色控制、输入映射、战斗状态、命中检测和反馈链路，重点是让系统边界清楚。",
      tags: ["UE5", "Enhanced Input", "Combat"],
    },
    {
      title: "GAS 架构",
      body: "围绕 ASC、AttributeSet、GameplayEffect、GameplayAbility 与 GameplayTag 做技能和属性流程。",
      tags: ["ASC", "GE/GA", "GameplayTags"],
    },
    {
      title: "AI 与行为树",
      body: "行为树任务、感知、巡逻、追击和攻击流程，配合 GAS 或普通伤害系统使用。",
      tags: ["Behavior Tree", "Perception", "BTTask"],
    },
    {
      title: "UI 与事件同步",
      body: "用委托、子系统和 UMG 组织 UI 刷新，避免界面层直接绑定太多游戏对象。",
      tags: ["UMG", "Delegates", "Subsystem"],
    },
    {
      title: "数据驱动",
      body: "用 DataAsset 和蓝图资产承载可调配置，让武器、技能、动画和数值更容易扩展。",
      tags: ["DataAsset", "Blueprint", "TSubclassOf"],
    },
    {
      title: "插件与工程实践",
      body: "使用 C++ 和蓝图开发 UE 插件，关注类型安全、对象生命周期、调试和维护。",
      tags: ["C++", "Blueprint", "Debugging"],
    },
  ],
  en: [
    {
      title: "Gameplay systems",
      body: "Character control, input mapping, combat states, hit detection, and feedback chains with clear boundaries.",
      tags: ["UE5", "Enhanced Input", "Combat"],
    },
    {
      title: "GAS architecture",
      body: "Ability and attribute pipelines built around ASC, AttributeSet, GameplayEffect, GameplayAbility, and GameplayTag.",
      tags: ["ASC", "GE/GA", "GameplayTags"],
    },
    {
      title: "AI and behavior trees",
      body: "Behavior tree tasks, perception, patrol, pursuit, and attack flows that can work with GAS or standard damage systems.",
      tags: ["Behavior Tree", "Perception", "BTTask"],
    },
    {
      title: "UI and event sync",
      body: "Delegates, subsystems, and UMG for UI updates without over-coupling widgets to gameplay actors.",
      tags: ["UMG", "Delegates", "Subsystem"],
    },
    {
      title: "Data-driven workflows",
      body: "DataAssets and Blueprint assets for weapons, abilities, animations, and tunable values.",
      tags: ["DataAsset", "Blueprint", "TSubclassOf"],
    },
    {
      title: "Plugins and engineering",
      body: "Building UE plugins with C++ and Blueprint, with attention to type safety, object lifetime, debugging, and maintenance.",
      tags: ["C++", "Blueprint", "Debugging"],
    },
  ],
};

const projectItems = {
  zh: [
    {
      title: "YueSignal",
      subtitle: "UE5 强类型本地通信插件",
      status: "仓库暂未公开",
      body: "YueSignal 是我独立开发的 UE5 强类型本地通信插件。它用 Gameplay Tag、结构体类型和明确的通信语义约束消息，让广播与请求各有清晰的边界；从 C++、蓝图接入到消息追踪，尽量把日常使用和排查问题的流程串起来。",
      placeholder: "YueSignal",
      meta: ["C++", "Unreal Engine 5", "Blueprint", "Gameplay Tags"],
      points: [
        "以 Gameplay Tag 和结构体类型定义通道，分别支持 Signal、Domain Event、Command 和 Query 四种通信语义。",
        "提供即时、队列和下一帧调度，处理请求的取消、超时与延迟回复。",
        "通过连接和所有者作用域管理订阅生命周期，并在对象或 World 结束时清理。",
        "提供类型化蓝图节点和编辑器 Debugger，便于使用及追踪消息。",
      ],
      links: [
        {
          label: "查看文档",
          href: "https://yuesignal.luckytri.cn/zh/",
        },
      ],
    },
    {
      title: "PurgeHour_UE5.7",
      subtitle: "第三人称混合战斗框架",
      body: "PurgeHour 是我用来沉淀 UE5 玩法工程的主项目。它不是单纯把射击和近战放在一个角色上，而是围绕 GAS 先把所有权、属性、输入、装备和敌人行为拆清楚：PlayerState 持有 ASC，Character 只负责表现和输入承接，武器与技能通过数据资产配置，避免后期每加一种武器都改核心代码。",
      placeholder: "PurgeHour",
      meta: ["C++", "Unreal Engine 5.7", "GAS", "TPS + ACT"],
      points: [
        "PlayerState 作为 Owner，Character 作为 Avatar，重生后重新 InitAbilityActorInfo，不把冷却、Buff 和属性状态绑死在可销毁角色上。",
        "射击与近战都走 GAS 能力链路，GameplayTag 管输入、状态和互斥关系，降低蓝图里临时布尔值造成的状态残留。",
        "枪械、剑、动画和数值配置尽量外移到 DataAsset/蓝图资产，C++ 保留底层规则和扩展接口。",
        "敌人侧接入 AIController、Behavior Tree 与 GAS，能继续扩展巡逻、索敌、攻击任务和命中反馈。",
      ],
      links: [
        {
          label: "打开仓库",
          href: "https://github.com/TodayYueC/PurgeHour_UE5.7",
        },
      ],
    },
    {
      title: "Cyber2026_UE5.7",
      subtitle: "节奏射击与 ARPG 融合",
      body: "Cyber2026 是 Global Game Jam 的合作项目，将第三人称射击和节奏判定结合：玩家跟着节拍开火，并在不同面具和状态之间切换。活动结束后，我重新整理了角色、节奏判定、战斗、事件和 UI 的代码结构。",
      placeholder: "Cyber2026",
      meta: ["C++", "Unreal Engine 5.7", "Game Jam", "Event Bus"],
      points: [
        "节奏系统区分 Early Hit、Late Hit 和 Miss，避免所有输入都被粗暴地塞进一个命中窗口。",
        "面具切换和射击反馈通过事件分发给 UI，减少 Widget 直接读取角色变量的情况。",
        "战斗和死亡连锁加了重复触发保护，避免 Jam 原型里常见的边界抖动。",
        "活动结束后整理目录和模块职责，让原型能继续迭代。",
      ],
      links: [
        {
          label: "打开仓库",
          href: "https://github.com/TodayYueC/Cyber2026_UE5.7",
        },
      ],
    },
    {
      title: "SoftRenderer",
      subtitle: "CPU 软光栅渲染器",
      body: "SoftRenderer 是一个用 C++ 在 CPU 上模拟现代渲染管线的软光栅项目，来自 tinyrenderer 学习线索，但目标不是只复现教程，而是把模型加载、MVP 变换、三角形光栅化、深度测试、片元着色和后处理拆成自己能解释的工程结构。",
      placeholder: "SoftRenderer",
      meta: ["C++20", "CMake", "CPU Rasterizer", "Rendering Pipeline"],
      points: [
        "实现 OBJ 模型加载、ModelView / Perspective / Viewport 变换，以及从齐次裁剪空间到屏幕空间的完整坐标链路。",
        "用重心坐标和 1/w 做透视校正插值，配合浮点 Z-buffer 完成逐像素深度测试。",
        "片元阶段包含 Phong / Blinn-Phong 光照、切线空间法线贴图、阴影贴图和深度偏移处理。",
        "加入 SSAO 后处理，用屏幕空间深度采样增强接触阴影，并输出渲染结果与 zbuffer 可视化。",
      ],
      links: [
        {
          label: "打开仓库",
          href: "https://github.com/TodayYueC/SoftRenderer",
        },
      ],
    },
  ],
  en: [
    {
      title: "YueSignal",
      subtitle: "Typed local messaging for UE5",
      status: "Repository private",
      body: "YueSignal is a typed local messaging plugin I built for UE5. Gameplay Tags, struct types and explicit communication semantics define clear contracts for broadcasts and requests, with C++ and Blueprint integration and tools for tracing message flow.",
      placeholder: "YueSignal",
      meta: ["C++", "Unreal Engine 5", "Blueprint", "Gameplay Tags"],
      points: [
        "Defines channels with Gameplay Tags and struct types across four semantics: Signal, Domain Event, Command and Query.",
        "Supports immediate, queued and next-tick dispatch, plus cancellation, deadlines and deferred replies for requests.",
        "Manages subscription lifetimes with connections and owner scopes, cleaning up when an object or World closes.",
        "Includes typed Blueprint nodes and an editor Debugger for inspection and tracing.",
      ],
      links: [
        {
          label: "Read the docs",
          href: "https://yuesignal.luckytri.cn/en/",
        },
      ],
    },
    {
      title: "PurgeHour_UE5.7",
      subtitle: "Third-person hybrid combat framework",
      body: "PurgeHour is the main project I use to shape UE5 gameplay engineering habits. It is not just a character with both shooting and melee actions; the work is in separating GAS ownership, attributes, input, equipment, and enemy behavior so new weapons and abilities can be added without rewriting the center of the project.",
      placeholder: "PurgeHour",
      meta: ["C++", "Unreal Engine 5.7", "GAS", "TPS + ACT"],
      points: [
        "PlayerState owns the ASC while Character works as Avatar, so respawn can re-run InitAbilityActorInfo without throwing away cooldowns, buffs, and attributes.",
        "Shooting and melee use GAS ability flows, with GameplayTags handling input, state, and mutual exclusion instead of scattered Blueprint booleans.",
        "Weapon, sword, animation, and numeric configuration live in DataAssets or Blueprint assets where possible; C++ keeps the rules and extension points.",
        "Enemy behavior connects AIController, Behavior Tree, and GAS, leaving space for patrol, targeting, attack tasks, and hit feedback.",
      ],
      links: [
        {
          label: "Open repository",
          href: "https://github.com/TodayYueC/PurgeHour_UE5.7",
        },
      ],
    },
    {
      title: "Cyber2026_UE5.7",
      subtitle: "Rhythm shooter with ARPG elements",
      body: "Cyber2026 was a Global Game Jam collaboration combining third-person shooting with rhythm judgment: players fire on beat and switch between masks and states. After the event, I reorganized the character, rhythm, combat, event, and UI code.",
      placeholder: "Cyber2026",
      meta: ["C++", "Unreal Engine 5.7", "Game Jam", "Event Bus"],
      points: [
        "The rhythm system distinguishes Early Hit, Late Hit, and Miss instead of flattening all input into one timing window.",
        "Mask switching and shooting feedback are sent to UI through events, reducing direct reads from widgets into character state.",
        "Combat and chain-death logic include duplicate-trigger guards for the fragile edge cases common in jam prototypes.",
        "After the event, I reorganized folders and module responsibilities so the prototype could continue to evolve.",
      ],
      links: [
        {
          label: "Open repository",
          href: "https://github.com/TodayYueC/Cyber2026_UE5.7",
        },
      ],
    },
    {
      title: "SoftRenderer",
      subtitle: "CPU software rasterizer",
      body: "SoftRenderer is a C++ software rasterizer that simulates the rendering pipeline on the CPU. It started from the tinyrenderer learning path, but the focus is on turning model loading, MVP transforms, triangle rasterization, depth testing, fragment shading, and post-processing into a structure I can explain and extend.",
      placeholder: "SoftRenderer",
      meta: ["C++20", "CMake", "CPU Rasterizer", "Rendering Pipeline"],
      points: [
        "Implements OBJ loading, ModelView / Perspective / Viewport transforms, and the full coordinate path from clip space to screen space.",
        "Uses barycentric coordinates plus 1/w for perspective-correct interpolation, with a floating-point Z-buffer for per-pixel depth testing.",
        "The fragment stage covers Phong / Blinn-Phong lighting, tangent-space normal mapping, shadow mapping, and depth bias handling.",
        "Adds an SSAO post-process pass that samples screen-space depth for contact occlusion, then outputs both the rendered image and zbuffer visualization.",
      ],
      links: [
        {
          label: "Open repository",
          href: "https://github.com/TodayYueC/SoftRenderer",
        },
      ],
    },
  ],
};

const noteItems = {
  zh: [
    {
      id: "ue_001",
      category: "ue",
      number: "001",
      title: "碰撞与重叠系统",
      summary: "Trigger、Block、Overlap、Hit 和碰撞配置。",
      tags: ["Collision", "Overlap", "Hit"],
    },
    {
      id: "ue_002",
      category: "ue",
      number: "002",
      title: "委托与事件",
      summary: "动态多播委托、广播、绑定和解耦通信。",
      tags: ["Delegates", "Events", "Blueprint"],
    },
    {
      id: "ue_003",
      category: "ue",
      number: "003",
      title: "组件生命周期",
      summary: "组件初始化、Tick、销毁和通信边界。",
      tags: ["Components", "Lifecycle"],
    },
    {
      id: "ue_004",
      category: "ue",
      number: "004",
      title: "逻辑优化与交互",
      summary: "交互逻辑、调试路径和性能注意点。",
      tags: ["Optimization", "Debug"],
    },
    {
      id: "ue_005",
      category: "ue",
      number: "005",
      title: "角色控制与增强输入",
      summary: "Enhanced Input、移动参数和角色控制链路。",
      tags: ["Input", "Character"],
    },
    {
      id: "ue_006",
      category: "ue",
      number: "006",
      title: "控制器架构",
      summary: "PlayerController、AIController 和输入职责划分。",
      tags: ["Controller", "Input"],
    },
    {
      id: "ue_007",
      category: "ue",
      number: "007",
      title: "战斗与伤害框架",
      summary: "伤害责任链、命中检测和战斗系统边界。",
      tags: ["Combat", "Damage"],
    },
    {
      id: "ue_008",
      category: "ue",
      number: "008",
      title: "射线检测与空间数学",
      summary: "Line Trace、Shape Trace 和瞄准视差修正。",
      tags: ["Trace", "Math"],
    },
    {
      id: "ue_009",
      category: "ue",
      number: "009",
      title: "通用交互与调试",
      summary: "交互组件、调试显示和可复用接口。",
      tags: ["Interaction", "Debug"],
    },
    {
      id: "ue_010",
      category: "ue",
      number: "010",
      title: "属性组件与 UI",
      summary: "属性组件、事件通知和 UI 同步。",
      tags: ["Attributes", "UMG"],
    },
    {
      id: "ue_011",
      category: "ue",
      number: "011",
      title: "动画系统架构",
      summary: "AnimBP、Montage、状态机和 IK 重定向。",
      tags: ["Animation", "Montage"],
    },
    {
      id: "ue_012",
      category: "ue",
      number: "012",
      title: "行为树基础",
      summary: "NavMesh、Blackboard、BTTask 和 AI 控制器。",
      tags: ["Behavior Tree", "AI"],
    },
    {
      id: "ue_013",
      category: "ue",
      number: "013",
      title: "感知与动态决策",
      summary: "AI Perception、目标检测和追击恢复。",
      tags: ["Perception", "Decision"],
    },
    {
      id: "ue_014",
      category: "ue",
      number: "014",
      title: "战斗执行与数据驱动",
      summary: "AI 攻击任务、命中去重和 DataAsset 入门。",
      tags: ["Combat", "DataAsset"],
    },
    {
      id: "ue_015",
      category: "ue",
      number: "015",
      title: "数据驱动背包",
      summary: "拾取物、物品配置和背包 UI 数据流。",
      tags: ["Inventory", "Data"],
    },
    {
      id: "ue_016",
      category: "ue",
      number: "016",
      title: "游戏循环与规则",
      summary: "Tick、规则更新和游戏循环结构。",
      tags: ["Game Loop", "Rules"],
    },
    {
      id: "gas_shoot_1",
      category: "gas",
      number: "GAS 01",
      title: "射击系统：所有权与属性集",
      summary: "ASC 所有权、PlayerState、Avatar 和 AttributeSet 初始化。",
      tags: ["ASC", "AttributeSet"],
    },
    {
      id: "gas_shoot_2",
      category: "gas",
      number: "GAS 02",
      title: "射击系统：输入与能力",
      summary: "输入绑定、技能激活和射击链路。",
      tags: ["Ability", "Input"],
    },
    {
      id: "gas_shoot_3",
      category: "gas",
      number: "GAS 03",
      title: "射击系统：命中与反馈",
      summary: "命中检测、伤害效果和 GameplayCue。",
      tags: ["GameplayCue", "Damage"],
    },
    {
      id: "gas_shoot_4",
      category: "gas",
      number: "GAS 04",
      title: "射击系统：网络与扩展",
      summary: "复制、预测和武器配置扩展。",
      tags: ["Replication", "Weapon"],
    },
    {
      id: "gas_melee_1",
      category: "gas",
      number: "GAS 05",
      title: "近战系统：基础链路",
      summary: "近战能力、命中窗口和动画触发。",
      tags: ["Melee", "Montage"],
    },
    {
      id: "gas_melee_2",
      category: "gas",
      number: "GAS 06",
      title: "近战系统：连招与事件",
      summary: "连招输入缓存、Wait Gameplay Event 和 AbilityTask。",
      tags: ["Combo", "Event"],
    },
    {
      id: "gas_melee_3",
      category: "gas",
      number: "GAS 07",
      title: "近战系统：索敌与收尾",
      summary: "Motion Warping、索敌筛选和收尾优化。",
      tags: ["Motion Warping", "Targeting"],
    },
  ],
  en: [
    {
      id: "ue_001",
      category: "ue",
      number: "001",
      title: "Collision and overlap",
      summary: "Trigger, Block, Overlap, Hit, and collision configuration.",
      tags: ["Collision", "Overlap", "Hit"],
    },
    {
      id: "ue_002",
      category: "ue",
      number: "002",
      title: "Delegates and events",
      summary:
        "Dynamic multicast delegates, broadcast, binding, and decoupled communication.",
      tags: ["Delegates", "Events", "Blueprint"],
    },
    {
      id: "ue_003",
      category: "ue",
      number: "003",
      title: "Component lifecycle",
      summary:
        "Component initialization, ticking, destruction, and communication boundaries.",
      tags: ["Components", "Lifecycle"],
    },
    {
      id: "ue_004",
      category: "ue",
      number: "004",
      title: "Logic optimization",
      summary: "Interaction logic, debugging paths, and performance notes.",
      tags: ["Optimization", "Debug"],
    },
    {
      id: "ue_005",
      category: "ue",
      number: "005",
      title: "Character control and Enhanced Input",
      summary:
        "Enhanced Input, movement parameters, and character control flow.",
      tags: ["Input", "Character"],
    },
    {
      id: "ue_006",
      category: "ue",
      number: "006",
      title: "Controller architecture",
      summary:
        "PlayerController, AIController, and input responsibility boundaries.",
      tags: ["Controller", "Input"],
    },
    {
      id: "ue_007",
      category: "ue",
      number: "007",
      title: "Combat and damage framework",
      summary:
        "Damage responsibility chains, hit detection, and combat boundaries.",
      tags: ["Combat", "Damage"],
    },
    {
      id: "ue_008",
      category: "ue",
      number: "008",
      title: "Trace and spatial math",
      summary: "Line Trace, Shape Trace, and third-person aiming correction.",
      tags: ["Trace", "Math"],
    },
    {
      id: "ue_009",
      category: "ue",
      number: "009",
      title: "Interaction and debugging",
      summary:
        "Interaction components, debug display, and reusable interfaces.",
      tags: ["Interaction", "Debug"],
    },
    {
      id: "ue_010",
      category: "ue",
      number: "010",
      title: "Attribute component and UI",
      summary: "Attribute components, event notifications, and UI sync.",
      tags: ["Attributes", "UMG"],
    },
    {
      id: "ue_011",
      category: "ue",
      number: "011",
      title: "Animation architecture",
      summary: "AnimBP, Montage, state machines, and IK retargeting.",
      tags: ["Animation", "Montage"],
    },
    {
      id: "ue_012",
      category: "ue",
      number: "012",
      title: "Behavior tree basics",
      summary: "NavMesh, Blackboard, BTTask, and AI controllers.",
      tags: ["Behavior Tree", "AI"],
    },
    {
      id: "ue_013",
      category: "ue",
      number: "013",
      title: "Perception and decision making",
      summary: "AI Perception, target detection, pursuit, and recovery.",
      tags: ["Perception", "Decision"],
    },
    {
      id: "ue_014",
      category: "ue",
      number: "014",
      title: "Combat execution and data assets",
      summary: "AI attack tasks, hit de-duplication, and DataAsset basics.",
      tags: ["Combat", "DataAsset"],
    },
    {
      id: "ue_015",
      category: "ue",
      number: "015",
      title: "Data-driven inventory",
      summary: "Pickup actors, item configuration, and inventory UI data flow.",
      tags: ["Inventory", "Data"],
    },
    {
      id: "ue_016",
      category: "ue",
      number: "016",
      title: "Game loop and rules",
      summary: "Tick, rule updates, and game loop structure.",
      tags: ["Game Loop", "Rules"],
    },
    {
      id: "gas_shoot_1",
      category: "gas",
      number: "GAS 01",
      title: "Shooting: ownership and attributes",
      summary:
        "ASC ownership, PlayerState, Avatar, and AttributeSet initialization.",
      tags: ["ASC", "AttributeSet"],
    },
    {
      id: "gas_shoot_2",
      category: "gas",
      number: "GAS 02",
      title: "Shooting: input and abilities",
      summary: "Input binding, ability activation, and shooting flow.",
      tags: ["Ability", "Input"],
    },
    {
      id: "gas_shoot_3",
      category: "gas",
      number: "GAS 03",
      title: "Shooting: hit and feedback",
      summary: "Hit detection, damage effects, and GameplayCue.",
      tags: ["GameplayCue", "Damage"],
    },
    {
      id: "gas_shoot_4",
      category: "gas",
      number: "GAS 04",
      title: "Shooting: networking and extension",
      summary: "Replication, prediction, and weapon configuration extension.",
      tags: ["Replication", "Weapon"],
    },
    {
      id: "gas_melee_1",
      category: "gas",
      number: "GAS 05",
      title: "Melee: base flow",
      summary: "Melee abilities, hit windows, and animation triggers.",
      tags: ["Melee", "Montage"],
    },
    {
      id: "gas_melee_2",
      category: "gas",
      number: "GAS 06",
      title: "Melee: combo and events",
      summary: "Combo input buffering, Wait Gameplay Event, and AbilityTask.",
      tags: ["Combo", "Event"],
    },
    {
      id: "gas_melee_3",
      category: "gas",
      number: "GAS 07",
      title: "Melee: targeting and polish",
      summary: "Motion Warping, target filtering, and final integration.",
      tags: ["Motion Warping", "Targeting"],
    },
  ],
};


Object.assign(i18n.zh, {
  bootSkip: "点击或按任意键跳过",
  navLabel: "主导航",
  brandLabel: "YueC 首页",
  menuOpen: "打开导航",
  langLabel: "切换语言",
  heroLoading: "世界加载中",
  heroLoadingNote: "大概永远不会到 100%",
  replayIntro: "重播开场 ↻",
  cardFlip: "翻转卡片",
  memRemember: "记得",
  memReflect: "回看",
  memEncounter: "相遇",
  memRevise: "修正",
  memGrow: "生长",
  notesFilterLabel: "笔记分类",
  sendEmail: "发送邮件",
  insertCoin: "投币 · 发封邮件",
  openConsole: "控制台",
  readerPrev: "上一篇",
  readerNext: "下一篇",
  readerCopy: "复制链接",
  readerClose: "关闭",
  openNote: "打开笔记",
  linkCopied: "链接已复制 ✦",
  copyFailed: "复制失败，请直接复制地址栏",
  readerLoading: "正在从 /Game/Archive 加载…",
  readerLoadFailed: "笔记加载失败，请稍后重试。",
  searchPlaceholder: "搜索笔记 / SEARCH",
  motionLocked: "已遵循系统的减少动态效果设置",
});
Object.assign(i18n.en, {
  bootSkip: "Click or press any key to skip",
  navLabel: "Main navigation",
  brandLabel: "YueC home",
  menuOpen: "Open navigation",
  langLabel: "Switch language",
  heroLoading: "WORLD LOADING",
  heroLoadingNote: "Probably never reaches 100%",
  replayIntro: "Replay intro ↻",
  cardFlip: "Flip card",
  memRemember: "Shared moments",
  memReflect: "Looking back",
  memEncounter: "New encounters",
  memRevise: "Gently revised",
  memGrow: "Still growing",
  notesFilterLabel: "Note categories",
  sendEmail: "Send an email",
  insertCoin: "INSERT COIN · SEND MAIL",
  openConsole: "Console",
  readerPrev: "Previous",
  readerNext: "Next",
  readerCopy: "Copy link",
  readerClose: "Close",
  openNote: "Open note",
  linkCopied: "Link copied ✦",
  copyFailed: "Copy failed — use the address bar",
  readerLoading: "Loading from /Game/Archive…",
  readerLoadFailed: "Couldn't load this note. Please try again.",
  searchPlaceholder: "Search notes...",
  motionLocked: "Following your system reduced-motion preference",
});

/* Save slots: each project owns a live demo scene (see scenes/*.js). */
const slotItems = [
  {
    scene: "signal",
    code: "UE5 / LOCAL MESSAGING",
    color: "#a58bff",
    color2: "#ddd3ff",
    state: "ARCH",
    label: "Signal · Event · Command · Query",
    cursor: "INSPECT",
    hint: { zh: "点击或按空格切换通信类型", en: "Click or press Space to switch message types" },
    aria: { zh: "YueSignal 通信类型示意，点击或按回车、空格切换", en: "YueSignal message types. Click or press Enter or Space to switch." },
  },
  {
    scene: "purgehour",
    code: "GAS / COMBAT SYSTEM",
    color: "#ff6f8f",
    color2: "#ffc7d3",
    state: "ARCH",
    label: "ASC · PlayerState",
    cursor: "INSPECT",
    hint: {
      zh: "点标签切换架构视图 · 空格下一页",
      en: "Click tabs to inspect architecture · Space for next",
    },
    aria: {
      zh: "PurgeHour 架构剖视：Owner/Avatar、Ability Handle、属性广播与 DataAsset",
      en: "PurgeHour architecture view: Owner/Avatar, ability handles, attribute broadcast and DataAssets",
    },
  },
  {
    scene: "rhythm",
    code: "RHYTHM / GAME JAM",
    color: "#62e6f0",
    color2: "#c8f7fb",
    state: "ARCH",
    label: "Event Bus · Rhythm",
    cursor: "INSPECT",
    hint: {
      zh: "点标签切换架构视图 · 空格下一页",
      en: "Click tabs to inspect architecture · Space for next",
    },
    aria: {
      zh: "Cyber2026 架构剖视：事件总线、节奏判定、面具层与死亡连锁",
      en: "Cyber2026 architecture view: event bus, rhythm judgment, mask layers and death cascade",
    },
  },
  {
    scene: "rasterizer",
    code: "CPU / RASTERIZATION",
    color: "#ffd479",
    color2: "#fff0c9",
    state: "LIVE",
    label: "CPU RASTERIZER",
    cursor: "SWITCH",
    info: true,
    hint: { zh: "点击切换渲染通道 · 拖动旋转", en: "Click to switch pass · Drag to rotate" },
    aria: { zh: "SoftRenderer 可交互演示：CPU 软光栅", en: "SoftRenderer interactive demo: CPU rasterizer" },
  },
];

const abilityMeta = [
  { type: "CLASS SKILL · GAMEPLAY", rarity: 5, icon: '<path d="M6 9h12a4 4 0 0 1 4 4v1a3 3 0 0 1-5.2 2L15 14H9l-1.8 2A3 3 0 0 1 2 14v-1a4 4 0 0 1 4-4z"/><path d="M7 11.5v3M5.5 13h3"/><circle cx="16" cy="12.5" r=".7"/><circle cx="18" cy="14.2" r=".7"/>' },
  { type: "ULTIMATE · GAS", rarity: 5, icon: '<path d="M12 2.5 20 7v10l-8 4.5L4 17V7z"/><circle cx="12" cy="12" r="3"/><path d="M12 2.5V9M20 17l-5.4-3.2M4 17l5.4-3.2"/>' },
  { type: "SUMMON · AI", rarity: 4, icon: '<path d="M2.5 12S6 5.5 12 5.5 21.5 12 21.5 12 18 18.5 12 18.5 2.5 12 2.5 12z"/><circle cx="12" cy="12" r="3.2"/><path d="M12 5.5V3"/>' },
  { type: "SUPPORT · UI", rarity: 4, icon: '<rect x="3" y="4" width="18" height="16" rx="2"/><path d="M3 9h18M7 13h6M7 16h10"/>' },
  { type: "PASSIVE · DATA", rarity: 4, icon: '<ellipse cx="12" cy="6" rx="7.5" ry="3"/><path d="M4.5 6v12c0 1.7 3.4 3 7.5 3s7.5-1.3 7.5-3V6M4.5 12c0 1.7 3.4 3 7.5 3s7.5-1.3 7.5-3"/>' },
  { type: "CORE · ENGINE", rarity: 5, icon: '<rect x="6" y="6" width="12" height="12" rx="2"/><rect x="9.5" y="9.5" width="5" height="5" rx="1"/><path d="M9 2.5V6M15 2.5V6M9 18v3.5M15 18v3.5M2.5 9H6M2.5 15H6M18 9h3.5M18 15h3.5"/>' },
];

const PIN_COLORS = ["#00a9f4", "#9dff00", "#fa4fd4", "#ffca23", "#1fe0a6", "#cf8bff"];

const credits = {
  zh: [
    ["策划 / DIRECTOR", "YueC"],
    ["玩法程序 / GAMEPLAY", "YueC"],
    ["渲染 / RENDERING", "YueC"],
    ["动效与界面 / MOTION & UI", "YueC"],
    ["音效 / SOUND", "机械键盘的咔哒声"],
    ["测试 / QA", "凌晨三点的 Crash Report"],
    ["特别鸣谢 / SPECIAL THANKS", "看到这里的你 ✦"],
    ["引擎 / POWERED BY", "Unreal Engine 5 · C++ · 好奇心"],
  ],
  en: [
    ["DIRECTOR", "YueC"],
    ["GAMEPLAY PROGRAMMING", "YueC"],
    ["RENDERING", "YueC"],
    ["MOTION & UI", "YueC"],
    ["SOUND", "Mechanical keyboard clicks"],
    ["QA", "Crash reports at 3 a.m."],
    ["SPECIAL THANKS", "You, for scrolling this far ✦"],
    ["POWERED BY", "Unreal Engine 5 · C++ · Curiosity"],
  ],
};

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

function rendered(part) {
  document.dispatchEvent(new CustomEvent("yc:rendered", { detail: { part } }));
}

/* Keep reveal state when a list is re-rendered in place (e.g. language switch). */
function keepRevealState(container, selector, render) {
  const shown = new Set([...container.querySelectorAll(selector)].map((el, i) => (el.classList.contains("is-in") ? i : -1)));
  render();
  container.querySelectorAll(selector).forEach((el, i) => {
    if (shown.has(i)) el.classList.add("is-in");
  });
  YC.refresh?.(container);
}

function updateStaticText() {
  document.documentElement.lang = state.lang === "zh" ? "zh-CN" : "en";
  document.title = t("documentTitle");
  const description = document.querySelector('meta[name="description"]');
  if (description) description.setAttribute("content", t("metaDescription"));
  document.querySelectorAll("[data-i18n]").forEach((element) => {
    element.textContent = t(element.dataset.i18n);
  });
  document.querySelectorAll("[data-i18n-aria-label]").forEach((element) => {
    element.setAttribute("aria-label", t(element.dataset.i18nAriaLabel));
  });
  const search = document.querySelector("#notes-search");
  if (search) search.placeholder = t("searchPlaceholder");
}

function tagList(tags) {
  return tags.map((tag) => `<span class="tag">${escapeHtml(tag)}</span>`).join("");
}

/* ── 03 · Save slots ─────────────────────────────────────────────────── */
function slotBody(project) {
  return `
    <p class="eyebrow">${escapeHtml(project.subtitle)}</p>
    <div class="slot-title"><h3>${escapeHtml(project.title)}</h3>${project.status ? `<span class="status-pill">${escapeHtml(project.status)}</span>` : ""}</div>
    <p class="slot-desc">${escapeHtml(project.body)}</p>
    <div class="slot-meta">${project.meta.map((meta) => `<span>${escapeHtml(meta)}</span>`).join("")}</div>
    <details class="project-details">
      <summary><span>${escapeHtml(t("implementationDetails"))}</span><i aria-hidden="true"></i></summary>
      <ul class="project-points">${project.points.map((point) => `<li>${escapeHtml(point)}</li>`).join("")}</ul>
    </details>
    <div class="project-links">${project.links
      .map((link) => `<a class="text-link" href="${escapeHtml(link.href)}" target="_blank" rel="noopener noreferrer">${escapeHtml(link.label)}<span aria-hidden="true">↗</span></a>`)
      .join("")}</div>`;
}

const signalHighlights = {
  zh: [
    ["强类型通道", "以 Gameplay Tag 与结构体类型定义和校验通道。"],
    ["四种通信语义", "Signal、Domain Event、Command、Query 各司其职。"],
    ["调度与生命周期", "即时、队列与下一帧派发，支持超时取消和自动清理。"],
    ["蓝图与调试", "类型化蓝图节点、因果树调试器与交互式指南，方便接入和追踪。"],
  ],
  en: [
    ["Typed channels", "Channels are defined and checked with Gameplay Tags and struct types."],
    ["Four semantics", "Signal, Domain Event, Command and Query each have a clear role."],
    ["Dispatch & lifetime", "Immediate, queued and next-tick dispatch with timeouts, cancellation and cleanup."],
    ["Blueprint & debugging", "Typed Blueprint nodes, a causal-tree debugger and an interactive guide support integration and tracing."],
  ],
};

function renderSignalFeature() {
  const feature = document.querySelector(".signal-feature-card");
  if (!feature) return;
  const project = projectItems[state.lang][0];
  feature.querySelector(".signal-feature-copy").innerHTML = `
    <p class="eyebrow">${escapeHtml(project.subtitle)}</p>
    <div class="slot-title"><h3>${escapeHtml(project.title)}</h3><span class="status-pill">${escapeHtml(project.status)}</span></div>
    <p class="slot-desc">${escapeHtml(project.body)}</p>
    <div class="slot-meta">${project.meta.map((tag) => `<span>${escapeHtml(tag)}</span>`).join("")}</div>
    <div class="project-links">${project.links.map((link) => `<a class="text-link" href="${escapeHtml(link.href)}" target="_blank" rel="noopener noreferrer">${escapeHtml(link.label)}<span aria-hidden="true">↗</span></a>`).join("")}</div>`;
  feature.querySelector(".signal-feature-points").innerHTML = signalHighlights[state.lang].map(([title, body], i) => `
    <section class="signal-feature-point"><span class="signal-feature-point-no">0${i + 1}</span><h4>${escapeHtml(title)}</h4><p>${escapeHtml(body)}</p></section>`).join("");
  feature.querySelector(".slot-hint").textContent = slotItems[0].hint[state.lang];
  feature.querySelector(".slot-canvas").setAttribute("aria-label", slotItems[0].aria[state.lang]);
}

function renderProjects() {
  const list = document.querySelector("#projects-list");
  if (!list) return;
  const projects = projectItems[state.lang].slice(1);
  const slots = slotItems.slice(1);
  if (!list.childElementCount) {
    list.innerHTML = projects
      .map((project, index) => {
        const slot = slots[index];
        return `
    <article class="slot" style="--slot:${slot.color};--slot-2:${slot.color2}">
      <div class="slot-bar" aria-hidden="true">
        <span class="slot-no">SLOT 0${index + 1}</span>
        <span class="slot-code">${escapeHtml(slot.code)}</span>
        <span class="slot-state"><i></i>${slot.state}</span>
      </div>
      <div class="slot-screen">
        <canvas class="slot-canvas" data-scene="${slot.scene}" tabindex="0" role="${slot.scene === "signal" ? "button" : "img"}" data-cursor="${slot.cursor || "PLAY"}"></canvas>
        <div class="slot-hud" aria-hidden="true"><span${slot.info ? " data-hud-info" : ""}>${escapeHtml(slot.label)}</span><b data-hud-mode></b></div>
        <span class="slot-hint" aria-hidden="true"></span>
      </div>
      <div class="slot-body"></div>
    </article>`;
      })
      .join("");
  }
  list.querySelectorAll(".slot").forEach((el, index) => {
    const slot = slots[index];
    const body = el.querySelector(".slot-body");
    const open = body.querySelector(".project-details")?.open;
    body.innerHTML = slotBody(projects[index]);
    if (open) body.querySelector(".project-details").open = true;
    el.querySelector(".slot-hint").textContent = slot.hint[state.lang];
    el.querySelector(".slot-canvas").setAttribute("aria-label", slot.aria[state.lang]);
  });
}

/* ── 04 · Ability cards ──────────────────────────────────────────────── */
function renderSkills() {
  const grid = document.querySelector("#skills-grid");
  if (!grid) return;
  keepRevealState(grid, ".ability", () => {
    grid.innerHTML = skillItems[state.lang]
      .map((item, index) => {
        const meta = abilityMeta[index] || abilityMeta[0];
        return `
    <article class="ability">
      <div class="ability-inner">
        <span class="ability-holo" aria-hidden="true"></span>
        <span class="ability-glare" aria-hidden="true"></span>
        <div class="ability-top">
          <span class="ability-icon" aria-hidden="true"><svg viewBox="0 0 24 24">${meta.icon}</svg></span>
          <span class="ability-rarity" aria-hidden="true">${"✦".repeat(meta.rarity)}</span>
        </div>
        <p class="ability-type">${meta.type}</p>
        <h3>${escapeHtml(item.title)}</h3>
        <p class="ability-body">${escapeHtml(item.body)}</p>
        <div class="tag-list">${tagList(item.tags)}</div>
      </div>
    </article>`;
      })
      .join("");
  });
  rendered("skills");
}

/* ── 05 · Blueprint notes ────────────────────────────────────────────── */
function searchMatches() {
  const query = state.search.trim().toLowerCase();
  return noteItems[state.lang].filter(
    (note) => !query || [note.title, note.summary, note.number, ...note.tags].join(" ").toLowerCase().includes(query),
  );
}

function filteredNotes() {
  return searchMatches().filter((note) => state.filter === "all" || note.category === state.filter);
}

function renderNotes({ keep = false } = {}) {
  const grid = document.querySelector("#notes-grid");
  if (!grid) return;
  const matches = filteredNotes();
  const visible = state.showAllNotes ? matches : matches.slice(0, 6);
  const draw = () => {
    grid.innerHTML = visible
      .map((note) => {
        const category = t(note.category === "ue" ? "filterUE" : "filterGAS");
        return `
    <article class="bp-node" data-cat="${note.category}">
      <button class="bp-node-hit" type="button" data-open-note="${escapeHtml(note.id)}" aria-haspopup="dialog">
        <span class="bp-head">
          <span class="bp-icon" aria-hidden="true">${note.category === "ue" ? "f" : "◆"}</span>
          <span class="bp-titles"><span class="bp-title">${escapeHtml(note.title)}</span><span class="bp-sub">${escapeHtml(note.number)} · ${escapeHtml(category)}</span></span>
        </span>
        <span class="bp-body">
          <span class="bp-exec" aria-hidden="true"><i class="pin-exec in"></i><i class="pin-exec out"></i></span>
          <span class="bp-pins">${note.tags
            .map((tag, i) => `<span class="bp-pin" style="--pin:${PIN_COLORS[(i + note.number.length) % PIN_COLORS.length]}"><i aria-hidden="true"></i>${escapeHtml(tag)}</span>`)
            .join("")}</span>
          <span class="bp-summary">${escapeHtml(note.summary)}</span>
          <span class="bp-read">${escapeHtml(t("openNote"))}<i class="pin-exec" aria-hidden="true"></i></span>
        </span>
      </button>
    </article>`;
      })
      .join("");
  };
  if (keep) keepRevealState(grid, ".bp-node", draw);
  else {
    draw();
    YC.refresh?.(grid);
  }

  const all = searchMatches();
  const counts = { all: all.length, ue: all.filter((n) => n.category === "ue").length, gas: all.filter((n) => n.category === "gas").length };
  document.querySelectorAll(".filter-btn").forEach((button) => {
    const active = button.dataset.filter === state.filter;
    button.classList.toggle("active", active);
    button.setAttribute("aria-pressed", String(active));
    const count = button.querySelector(".filter-count");
    if (count) count.textContent = counts[button.dataset.filter] ?? "";
  });
  document.querySelector("#notes-status").textContent = matches.length
    ? state.lang === "zh"
      ? `显示 ${visible.length} / ${matches.length} 篇笔记`
      : `Showing ${visible.length} / ${matches.length} notes`
    : t("noResults");
  const more = document.querySelector(".notes-more");
  if (more) {
    more.hidden = matches.length <= 6;
    const label = more.querySelector("span");
    if (label) label.textContent = t(state.showAllNotes ? "lessNotes" : "moreNotes");
  }
  rendered("notes");
}

function renderCredits() {
  const roll = document.querySelector("#credits-roll");
  if (!roll) return;
  roll.innerHTML = credits[state.lang].map(([role, name]) => `<p><b>${escapeHtml(role)}</b><span>${escapeHtml(name)}</span></p>`).join("");
}

/* ── Note reader (details panel) ─────────────────────────────────────── */
const reader = document.querySelector("#note-reader");
const readerPanel = reader?.querySelector(".reader-panel");
const readerBody = reader?.querySelector(".reader-body");
const readerArticle = reader?.querySelector(".note-markdown");
const readerProgress = reader?.querySelector(".reader-progress");
let readerReturnFocus = null;
let readerCloseTimer = 0;
const scriptLoads = {};

function loadScript(src) {
  if (!scriptLoads[src]) {
    scriptLoads[src] = new Promise((resolve, reject) => {
      const script = document.createElement("script");
      script.src = src;
      script.async = true;
      script.onload = resolve;
      script.onerror = () => {
        delete scriptLoads[src];
        reject(new Error(`Failed to load ${src}`));
      };
      document.head.append(script);
    });
  }
  return scriptLoads[src];
}

function ensureNotesData() {
  return Promise.all([
    window.marked?.parse ? null : loadScript("vendor/marked.min.js"),
    window.notesData ? null : loadScript("notesData.js"),
  ]);
}

function noteById(id) {
  return noteItems[state.lang].find((note) => note.id === id);
}

function readerSequence() {
  const list = filteredNotes();
  return list.some((note) => note.id === state.readerId) ? list : noteItems[state.lang];
}

function updateReaderNav() {
  if (!reader) return;
  const list = readerSequence();
  const index = list.findIndex((note) => note.id === state.readerId);
  reader.querySelector("[data-reader-prev]").disabled = index <= 0;
  reader.querySelector("[data-reader-next]").disabled = index < 0 || index >= list.length - 1;
}

async function fillReader(note) {
  readerPanel.dataset.cat = note.category;
  reader.querySelector(".reader-num").textContent = note.number;
  reader.querySelector("#reader-title").textContent = note.title;
  reader.querySelector(".reader-path").textContent = `/Game/Archive/${note.category.toUpperCase()}/${note.id}.md`;
  readerBody.scrollTop = 0;
  readerProgress?.style.setProperty("--rp", "0");
  updateReaderNav();
  if (!window.notesData || !window.marked?.parse) {
    readerArticle.innerHTML = `<p class="reader-loading">${escapeHtml(t("readerLoading"))}</p>`;
  }
  try {
    await ensureNotesData();
  } catch {
    if (state.readerId === note.id) readerArticle.innerHTML = `<p class="reader-loading">${escapeHtml(t("readerLoadFailed"))}</p>`;
    return;
  }
  if (state.readerId !== note.id) return;
  readerArticle.innerHTML = renderMarkdown(window.notesData?.[note.id]);
  readerArticle.querySelectorAll("a[href^='http']").forEach((link) => {
    link.target = "_blank";
    link.rel = "noopener noreferrer";
  });
}

function openNote(id, { push = true } = {}) {
  const note = noteById(id);
  if (!note || !reader) return;
  clearTimeout(readerCloseTimer);
  const wasOpen = !reader.hidden;
  state.readerId = id;
  if (!wasOpen) readerReturnFocus = document.activeElement;
  const hash = `#note/${id}`;
  if (location.hash !== hash) {
    if (push && !wasOpen) history.pushState({ note: id }, "", hash);
    else history.replaceState({ note: id }, "", hash);
  }
  fillReader(note);
  if (!wasOpen) {
    reader.hidden = false;
    YC.lockScroll?.(true);
    requestAnimationFrame(() => {
      reader.classList.add("is-open");
      readerPanel.focus({ preventScroll: true });
    });
  }
}

function closeNote({ fromHistory = false } = {}) {
  if (!reader || reader.hidden) return;
  const id = state.readerId;
  state.readerId = null;
  reader.classList.remove("is-open");
  YC.lockScroll?.(false);
  if (!fromHistory && location.hash.startsWith("#note/")) history.replaceState(null, "", "#notes");
  readerCloseTimer = setTimeout(() => {
    reader.hidden = true;
  }, 650);
  const usable = readerReturnFocus?.isConnected && readerReturnFocus !== document.body;
  const back = usable ? readerReturnFocus : document.querySelector(`[data-open-note="${CSS.escape(id || "")}"]`);
  back?.focus({ preventScroll: true });
  readerReturnFocus = null;
}

function stepNote(direction) {
  const list = readerSequence();
  const index = list.findIndex((note) => note.id === state.readerId);
  const next = list[index + direction];
  if (next) openNote(next.id, { push: false });
}

async function copyNoteLink() {
  const url = `${location.origin}${location.pathname}#note/${state.readerId}`;
  try {
    await navigator.clipboard.writeText(url);
    YC.toast?.(t("linkCopied"));
  } catch {
    YC.toast?.(t("copyFailed"));
  }
}

function syncReaderWithHash() {
  const match = location.hash.match(/^#note\/([\w-]+)$/);
  if (match && noteById(match[1])) openNote(match[1], { push: false });
  else if (reader && !reader.hidden) closeNote({ fromHistory: true });
}

/* ── Motion + language ───────────────────────────────────────────────── */
function updateMotionButton() {
  const button = document.querySelector(".motion-toggle");
  if (!button) return;
  const paused = !(YC.motionOK ? YC.motionOK() : true);
  const locked = YC.motionLockedBySystem ? YC.motionLockedBySystem() : false;
  button.textContent = t(paused ? "resumeMotion" : "pauseMotion");
  button.setAttribute("aria-pressed", String(paused));
  button.disabled = locked;
  button.title = locked ? t("motionLocked") : "";
}
YC.updateMotionButton = updateMotionButton;

function renderPage() {
  updateStaticText();
  renderSignalFeature();
  renderProjects();
  renderSkills();
  renderNotes({ keep: true });
  renderCredits();
  updateMotionButton();
  if (state.readerId) {
    const note = noteById(state.readerId);
    if (note) fillReader(note);
  }
  requestAnimationFrame(() => YC.placePill?.());
}

function setLang(lang) {
  if (lang !== "zh" && lang !== "en") return;
  state.lang = lang;
  savePreference("portfolioLang", lang);
  renderPage();
}
YC.setLang = setLang;
YC.lang = () => state.lang;

function setFilter(filter) {
  state.filter = filter;
  state.showAllNotes = false;
  renderNotes();
}

function setupEvents() {
  document.querySelector(".lang-toggle")?.addEventListener("click", () => setLang(state.lang === "zh" ? "en" : "zh"));
  document.querySelectorAll(".filter-btn").forEach((button) => {
    button.addEventListener("click", () => setFilter(button.dataset.filter));
  });
  document.querySelector("#notes-search")?.addEventListener("input", (event) => {
    state.search = event.target.value;
    state.showAllNotes = false;
    renderNotes();
  });
  document.querySelector(".notes-more")?.addEventListener("click", () => {
    state.showAllNotes = !state.showAllNotes;
    renderNotes({ keep: true });
    if (!state.showAllNotes) {
      const toolbar = document.querySelector(".bp-toolbar");
      if (toolbar) YC.scrollTo?.(toolbar.getBoundingClientRect().top + scrollY - 120, 0.9);
    }
  });
  document.querySelector("#notes-grid")?.addEventListener("click", (event) => {
    const trigger = event.target.closest("[data-open-note]");
    if (trigger) openNote(trigger.dataset.openNote);
  });
  document.querySelector(".motion-toggle")?.addEventListener("click", () => {
    YC.setMotion?.(!YC.motionOK());
    updateMotionButton();
  });
  YC.onMotionChange?.(updateMotionButton);

  reader?.addEventListener("click", (event) => {
    if (event.target.closest("[data-reader-close]")) closeNote();
    else if (event.target.closest("[data-reader-prev]")) stepNote(-1);
    else if (event.target.closest("[data-reader-next]")) stepNote(1);
    else if (event.target.closest("[data-reader-copy]")) copyNoteLink();
  });
  readerBody?.addEventListener(
    "scroll",
    () => {
      const max = readerBody.scrollHeight - readerBody.clientHeight;
      readerProgress?.style.setProperty("--rp", max > 0 ? (readerBody.scrollTop / max).toFixed(4) : "1");
    },
    { passive: true },
  );
  reader?.addEventListener("keydown", (event) => {
    if (event.key === "ArrowLeft" && !event.target.closest("input")) stepNote(-1);
    if (event.key === "ArrowRight" && !event.target.closest("input")) stepNote(1);
    if (event.key !== "Tab") return;
    const focusable = [...readerPanel.querySelectorAll("button:not([disabled]), a[href], [tabindex]:not([tabindex='-1'])")].filter((el) => el.offsetParent !== null);
    if (!focusable.length) return;
    const first = focusable[0];
    const last = focusable[focusable.length - 1];
    if (event.shiftKey && (document.activeElement === first || document.activeElement === readerPanel)) {
      event.preventDefault();
      last.focus();
    } else if (!event.shiftKey && document.activeElement === last) {
      event.preventDefault();
      first.focus();
    }
  });

  document.addEventListener("keydown", (event) => {
    if (event.key === "Escape") {
      if (reader && !reader.hidden) closeNote();
      YC.closeMenu?.();
      return;
    }
    const typing = event.target.closest?.("input, textarea, [contenteditable]");
    if (event.key === "/" && !typing && !event.ctrlKey && !event.metaKey && (!reader || reader.hidden)) {
      const search = document.querySelector("#notes-search");
      if (!search) return;
      event.preventDefault();
      const top = search.getBoundingClientRect().top;
      if (top < 80 || top > innerHeight - 80) YC.jumpTo?.(top + scrollY - innerHeight * 0.35);
      search.focus({ preventScroll: true });
    }
  });
  addEventListener("popstate", syncReaderWithHash);
  addEventListener("hashchange", syncReaderWithHash);
}

setupEvents();
renderPage();
YC.start?.();
if (location.hash.startsWith("#note/")) syncReaderWithHash();
