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
  expandedNoteId: null,
};

const i18n = {
  zh: {
    documentTitle: "YueC | UE5 玩法工程师 / C++ 渲染",
    metaDescription:
      "YueC 的 UE5 玩法工程与 C++ 渲染作品集，包含 GAS、节奏射击、软光栅渲染器、OpenGL 和 Unreal Engine 学习笔记。",
    navAbout: "关于",
    navSkills: "技能",
    navProjects: "项目",
    navNotes: "笔记",
    navContact: "联系",
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
    factGameDev: "玩法系统与渲染管线",
    aboutEyebrow: "个人方向",
    aboutTitle: "我的终极目标，是创造一个能把内心想法全盘托出的世界。",
    aboutBody:
      "目前主要围绕 UE5 玩法工程和 C++ 渲染基础积累：角色控制、Enhanced Input、GAS、动画蒙太奇、行为树、UMG、DataAsset 配置，以及从软光栅到 OpenGL 的渲染管线拆解。我的项目不追求一次性把内容堆满，而是先把输入、状态、数值、表现之间的关系梳理干净。",
    aboutBody2:
      "这里尽量只放我愿意被继续追问实现细节的内容：项目怎么拆、问题怎么修、下一步还可以怎么扩展。",
    skillsEyebrow: "技术栈",
    skillsTitle: "能直接落到项目里的能力",
    skillsIntro: "下面按“能解决什么问题”来组织，不按工具名堆列表。",
    projectsEyebrow: "项目",
    projectsTitle: "主要项目",
    projectsIntro:
      "主要项目现在分成两条线：UE5 玩法工程和 C++ 渲染基础。PurgeHour 与 Cyber2026 记录战斗、GAS、节奏判定和事件分发；SoftRenderer 记录软光栅管线；PBRDeferredRenderer 作为 OpenGL PBR 延迟渲染器正在开发中。",
    projectsVideoLink: "先看作品集视频",
    vibeEyebrow: "Vibecoding",
    vibeTitle: "把小念头做出来",
    vibeIntro:
      "这里放一些开发来玩的项目，会分成更靠近 gameplay 系统的练习，和其他类型的小东西。",
    vibeGameplayTitle: "Gameplay 相关",
    vibeGameplayIntro:
      "这一组更偏插件、系统和引擎工具，所以版面也稍微放大一点。",
    vibeOtherTitle: "其他",
    vibeOtherIntro: "不直接落在游戏引擎里，但一样是拿来试想法的小项目。",
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
      "我现在最在意的事很简单：把脑内那些热血又麻烦的玩法，拆到 UE5 里还能继续生长；也把渲染管线拆到自己能解释、能实现的程度。PurgeHour、Cyber2026 和 SoftRenderer 都是这条路上的存档点。",
    footerNote: "UE5 玩法工程与 C++ 渲染作品集",
  },
  en: {
    documentTitle: "YueC | UE5 Gameplay & C++ Rendering",
    metaDescription:
      "YueC's UE5 gameplay engineering and C++ rendering portfolio, including GAS, rhythm shooting, software rasterization, OpenGL, and Unreal Engine notes.",
    navAbout: "About",
    navSkills: "Skills",
    navProjects: "Projects",
    navNotes: "Notes",
    navContact: "Contact",
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
    factGameDev: "Gameplay and rendering",
    aboutEyebrow: "Direction",
    aboutTitle:
      "My end goal is to create a world where I can pour out everything I have been carrying inside.",
    aboutBody:
      "My current work centers on UE5 gameplay engineering and C++ rendering fundamentals: character control, Enhanced Input, GAS, animation montages, behavior trees, UMG, DataAsset configuration, and rendering-pipeline study from software rasterization to OpenGL. The goal is not to pack in one-off features, but to clarify how input, state, numbers, and presentation talk to each other.",
    aboutBody2:
      "I try to keep the site focused on work I am willing to be asked about in detail: how it was split, what broke, and where it can go next.",
    skillsEyebrow: "Stack",
    skillsTitle: "Skills that map to real project problems",
    skillsIntro:
      "The list is organized by the problem each skill helps solve, not by tool names alone.",
    projectsEyebrow: "Projects",
    projectsTitle: "Main projects",
    projectsIntro:
      "The main projects now split across two tracks: UE5 gameplay engineering and C++ rendering fundamentals. PurgeHour and Cyber2026 cover combat, GAS, rhythm judgment, and event dispatching; SoftRenderer records the software rasterization pipeline; PBRDeferredRenderer is an in-development OpenGL PBR deferred renderer.",
    projectsVideoLink: "Watch portfolio video",
    vibeEyebrow: "Vibecoding",
    vibeTitle: "Small ideas made real",
    vibeIntro:
      "This is where I keep playful side projects, split between experiments closer to gameplay systems and everything else.",
    vibeGameplayTitle: "Gameplay related",
    vibeGameplayIntro:
      "This group leans more toward plugins, systems, and engine tools, so it gets a little more room.",
    vibeOtherTitle: "Other",
    vibeOtherIntro:
      "Smaller ideas that do not sit inside a game engine, but still came from the same urge to make something quickly.",
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
      "What I care about right now is simple: taking the loud, troublesome gameplay ideas in my head and breaking them into UE5 systems that can keep growing, while also understanding rendering pipelines deeply enough to explain and implement them. PurgeHour, Cyber2026, and SoftRenderer are save points on that road.",
    footerNote: "UE5 gameplay and C++ rendering portfolio",
  },
};

Object.assign(i18n.zh, {
  documentTitle: "YueC | 把想象写成可玩的世界",
  navAbout: "关于我",
  navExperience: "实习经历",
  navContact: "联系我",
  heroTitle: "把想象，写成可玩的世界。",
  heroDescription: "UE5 玩法工程 / C++ 渲染 / 一个想创造世界的二次元玩家。",
  exploreProjects: "探索我的项目",
  aboutEyebrow: "关于我 / 代码背后",
  experienceHeading: "实习经历 / 从想法到上线",
  experienceDate: "实习时间待补充",
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
    "结合数据对 Crash 分类归因，识别 OOM、PageFault 等高置信度问题，并自动解决 Bug。",
  projectsTitle: "项目 / 我的存档点",
  projectsIntro:
    "从 UE5 玩法系统到 C++ 渲染管线。每个项目，都是把一个想法变成现实的存档点。",
  projectsVideoLink: "观看作品集视频",
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
  documentTitle: "YueC | Imagine. Build. Play.",
  navExperience: "Experience",
  heroTitle: "Turning imagination into playable worlds.",
  heroDescription:
    "UE5 gameplay / C++ rendering / An anime fan building worlds through code.",
  exploreProjects: "Explore my work",
  aboutEyebrow: "About / Behind the code",
  experienceHeading: "Experience / Ideas in production",
  experienceDate: "Internship dates to be added",
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
    "Used data to classify crashes and identify high-confidence causes such as OOM and PageFault, with automated bug resolution.",
  projectsTitle: "Projects / My save points",
  projectsIntro:
    "From UE5 gameplay systems to C++ rendering pipelines. Each project is a save point on the way from imagination to implementation.",
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
      title: "工程与渲染基础",
      body: "C++、对象生命周期、内存、网络和渲染管线基础。写玩法或渲染代码时都会同时考虑调试和维护成本。",
      tags: ["C++", "Rendering", "Debugging"],
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
      title: "Engineering and rendering fundamentals",
      body: "C++, object lifecycle, memory, networking, and rendering-pipeline basics with debugging and maintenance in mind.",
      tags: ["C++", "Rendering", "Debugging"],
    },
  ],
};

const projectItems = {
  zh: [
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
      body: "Cyber2026 是 Global Game Jam 里的合作项目，核心是把第三人称射击和节奏判定绑在一起：玩家需要跟着节拍开火，并在不同面具/状态之间切换节奏。活动结束后，我又和 Claude 重新整理过代码框架，把 Jam 期间堆在一起的逻辑拆回角色、节奏判定、战斗、事件和 UI 几层。",
      placeholder: "Cyber2026",
      meta: ["C++", "Unreal Engine 5.7", "Game Jam", "Event Bus"],
      points: [
        "节奏系统区分 Early Hit、Late Hit 和 Miss，避免所有输入都被粗暴地塞进一个命中窗口。",
        "面具切换和射击反馈通过事件分发给 UI，减少 Widget 直接读取角色变量的情况。",
        "战斗和死亡连锁加了重复触发保护，避免 Jam 原型里常见的边界抖动。",
        "活动结束后和 Claude 重新整理过目录与职责，让原型逻辑能继续维护，而不是只停留在 48 小时能跑的状态。",
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
    {
      title: "PBRDeferredRenderer",
      subtitle: "OpenGL PBR 延迟渲染器",
      status: "开发中",
      body: "PBRDeferredRenderer 是正在推进的 OpenGL 渲染项目，当前仓库已经搭起 C++20、CMake、GLFW、GLAD 和 OpenGL 4.6 Debug Context 的基础窗口与渲染循环。它会作为下一阶段学习 PBR、G-buffer 和延迟光照管线的主线项目继续扩展。",
      placeholder: "PBR Deferred",
      meta: ["C++20", "OpenGL 4.6", "GLFW", "In Development"],
      points: [
        "当前代码已完成 GLFW 窗口、GLAD 初始化、OpenGL 4.6 Core Profile 上下文和 Debug Callback，方便后续定位图形 API 错误。",
        "使用现代 OpenGL DSA 风格创建 VBO、EBO、VAO，并通过最小 Shader Program 绘制基础几何，先把渲染入口跑通。",
        "CMake 中直接集成 third_party/glad 和 GLFW 源码，项目结构已经为后续渲染模块拆分预留入口。",
        "后续重点会推进 PBR 材质、G-buffer、延迟光照、HDR / Tone Mapping 等渲染管线内容。",
      ],
      links: [
        {
          label: "打开仓库",
          href: "https://github.com/TodayYueC/PBRDeferredRenderer",
        },
      ],
    },
  ],
  en: [
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
      body: "Cyber2026 was a Global Game Jam collaboration built around third-person shooting and rhythm judgment: the player fires on beat and switches between masks or states. After the event, I reorganized the code framework with Claude, pulling jam-time logic back into character, rhythm judgment, combat, event, and UI layers.",
      placeholder: "Cyber2026",
      meta: ["C++", "Unreal Engine 5.7", "Game Jam", "Event Bus"],
      points: [
        "The rhythm system distinguishes Early Hit, Late Hit, and Miss instead of flattening all input into one timing window.",
        "Mask switching and shooting feedback are sent to UI through events, reducing direct reads from widgets into character state.",
        "Combat and chain-death logic include duplicate-trigger guards for the fragile edge cases common in jam prototypes.",
        "After the event, Claude and I reorganized folders and responsibilities so the prototype was not stuck as a 48-hour tangle.",
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
    {
      title: "PBRDeferredRenderer",
      subtitle: "OpenGL PBR deferred renderer",
      status: "In development",
      body: "PBRDeferredRenderer is the OpenGL rendering project I am currently building. The repository already has a C++20, CMake, GLFW, GLAD, and OpenGL 4.6 Debug Context foundation with a working window and render loop. It will become the main track for studying PBR, G-buffer layout, and deferred lighting.",
      placeholder: "PBR Deferred",
      meta: ["C++20", "OpenGL 4.6", "GLFW", "In Development"],
      points: [
        "The current code initializes a GLFW window, GLAD, an OpenGL 4.6 Core Profile context, and Debug Callback support for API diagnostics.",
        "It uses modern OpenGL DSA-style VBO, EBO, and VAO setup with a minimal shader program to get the first geometry path running.",
        "CMake integrates third_party/glad and GLFW from source, leaving room for future renderer module splits.",
        "Next steps are PBR materials, G-buffer construction, deferred lighting, HDR, and tone mapping.",
      ],
      links: [
        {
          label: "Open repository",
          href: "https://github.com/TodayYueC/PBRDeferredRenderer",
        },
      ],
    },
  ],
};

const vibeProjectItems = {
  zh: {
    gameplay: [
      {
        title: "ChronicleEngine",
        label: "UE5 叙事插件",
        body: "一个面向 UE5 的 JRPG 对话与叙事插件项目，覆盖 Dialogue Runner、变量与回滚、Trigger、UMG 表现层以及原生图编辑器等模块，包含从编辑器工作流到运行时接入的一整套叙事系统基础能力。",
        meta: ["UE5 Plugin", "Dialogue", "Slate Editor", "MIT"],
        links: [
          {
            label: "打开仓库",
            href: "https://github.com/TodayYueC/ChronicleEngine",
          },
        ],
      },
      {
        title: "Novella",
        label: "Godot 叙事插件",
        body: "一个基于 Godot 4 的 visual novel / GalGame 插件项目，包含脚本解析、运行时 VM、存档回滚、编辑器 dock 与打包脚本，提供从剧本执行到编辑器辅助的一套完整叙事插件能力。",
        meta: ["Godot 4", "GDScript", "Visual Novel", "Addon"],
        links: [
          { label: "打开仓库", href: "https://github.com/TodayYueC/Novella" },
        ],
      },
    ],
    other: [
      {
        title: "BodyTrack",
        label: "应用小项目",
        body: "一个 Kotlin + Jetpack Compose 的身体数据记录小工具，用来记体重、体脂、围度、BMI 和趋势。比起主线项目，它更像我拿来快速验证一个日常小需求的随手实现。",
        meta: ["Kotlin", "Compose", "Local-first"],
        links: [
          { label: "打开仓库", href: "https://github.com/TodayYueC/BodyTrack" },
        ],
      },
    ],
  },
  en: {
    gameplay: [
      {
        title: "ChronicleEngine",
        label: "UE5 narrative plugin",
        body: "A UE5 plugin project focused on JRPG-style dialogue and narrative flow, covering a dialogue runner, variables and rollback, triggers, a UMG-facing presentation layer, and a native graph editor as one complete narrative-system foundation.",
        meta: ["UE5 Plugin", "Dialogue", "Slate Editor", "MIT"],
        links: [
          {
            label: "Open repository",
            href: "https://github.com/TodayYueC/ChronicleEngine",
          },
        ],
      },
      {
        title: "Novella",
        label: "Godot narrative plugin",
        body: "A Godot 4 visual novel / GalGame plugin project with its own script parsing, runtime VM, save and rollback flow, editor dock, and packaging scripts, covering the core pieces needed for both script execution and editor-side support.",
        meta: ["Godot 4", "GDScript", "Visual Novel", "Addon"],
        links: [
          {
            label: "Open repository",
            href: "https://github.com/TodayYueC/Novella",
          },
        ],
      },
    ],
    other: [
      {
        title: "BodyTrack",
        label: "app side project",
        body: "A Kotlin + Jetpack Compose utility for tracking weight, body fat, measurements, BMI, and trends. Compared with the game-facing work, this one is more of a quick everyday need turned into a usable little app.",
        meta: ["Kotlin", "Compose", "Local-first"],
        links: [
          {
            label: "Open repository",
            href: "https://github.com/TodayYueC/BodyTrack",
          },
        ],
      },
    ],
  },
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
  return tags
    .map((tag) => `<span class="tag">${escapeHtml(tag)}</span>`)
    .join("");
}

function renderSkills() {
  const grid = document.querySelector("#skills-grid");
  if (!grid) return;

  grid.innerHTML = skillItems[state.lang]
    .map(
      (item) => `
    <article class="info-card">
      <h3>${escapeHtml(item.title)}</h3>
      <p>${escapeHtml(item.body)}</p>
      <div class="tag-list">${tagList(item.tags)}</div>
    </article>
  `,
    )
    .join("");
}

function renderProjects() {
  const list = document.querySelector("#projects-list");
  if (!list) return;
  const codes = [
    "GAS / COMBAT SYSTEM",
    "RHYTHM / GAME JAM",
    "CPU / RASTERIZATION",
    "OPENGL / PBR",
  ];
  list.innerHTML = projectItems[state.lang]
    .map(
      (project, index) => `
    <article class="project-card">
      <div class="project-media" aria-hidden="true">
        <span class="project-code">${codes[index]}</span><span class="project-no">0${index + 1}</span>
        <strong>${escapeHtml(project.placeholder)}</strong>
      </div>
      <div class="project-body">
        <p class="eyebrow">${escapeHtml(project.subtitle)}</p>
        <div class="project-title-row"><h3>${escapeHtml(project.title)}</h3>${project.status ? `<span class="status-pill">${escapeHtml(project.status)}</span>` : ""}</div>
        <p>${escapeHtml(project.body)}</p>
        <div class="project-meta">${project.meta.map((meta) => `<span>${escapeHtml(meta)}</span>`).join("")}</div>
        <details class="project-details"><summary>${escapeHtml(t("implementationDetails"))}</summary><ul class="project-points">${project.points.map((point) => `<li>${escapeHtml(point)}</li>`).join("")}</ul></details>
        <div class="project-links">${project.links.map((link) => `<a class="text-link" href="${escapeHtml(link.href)}" target="_blank" rel="noopener noreferrer">${escapeHtml(link.label)}</a>`).join("")}</div>
      </div>
    </article>`,
    )
    .join("");
}

function renderVibeProjects() {
  const gameplayList = document.querySelector("#vibe-gameplay-list");
  const otherList = document.querySelector("#vibe-other-list");
  if (!gameplayList || !otherList) return;

  const renderVibeCards = (projects) =>
    projects
      .map(
        (project) => `
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
  `,
      )
      .join("");

  gameplayList.innerHTML = renderVibeCards(
    vibeProjectItems[state.lang].gameplay,
  );
  otherList.innerHTML = renderVibeCards(vibeProjectItems[state.lang].other);
}

function filteredNotes() {
  const query = state.search.trim().toLowerCase();
  return noteItems[state.lang].filter(
    (note) =>
      (state.filter === "all" || note.category === state.filter) &&
      (!query ||
        [note.title, note.summary, note.number, ...note.tags]
          .join(" ")
          .toLowerCase()
          .includes(query)),
  );
}

function renderNotes() {
  const grid = document.querySelector("#notes-grid");
  if (!grid) return;
  const matches = filteredNotes();
  const visible = state.showAllNotes ? matches : matches.slice(0, 6);
  grid.innerHTML = visible
    .map((note) => {
      const isExpanded = state.expandedNoteId === note.id;
      const markdown = isExpanded
        ? renderMarkdown(window.notesData?.[note.id])
        : "";
      return `<article class="note-card ${isExpanded ? "expanded" : ""}" data-note-id="${escapeHtml(note.id)}">
      <button class="note-trigger" type="button" aria-expanded="${isExpanded}" aria-controls="content-${note.id}">
        <span class="note-topline"><span class="note-number">${escapeHtml(note.number)}</span><span class="note-category">${escapeHtml(t(note.category === "ue" ? "filterUE" : "filterGAS"))}</span></span>
        <span class="note-title">${escapeHtml(note.title)}</span><span class="note-summary">${escapeHtml(note.summary)}</span>
        <span class="note-tags">${tagList(note.tags)}</span><span class="note-expand-text">${escapeHtml(t(isExpanded ? "collapseNote" : "expandNote"))}</span>
      </button><div class="note-markdown" id="content-${note.id}" ${isExpanded ? "" : "hidden"}>${markdown}</div></article>`;
    })
    .join("");
  document.querySelector("#notes-status").textContent = matches.length
    ? state.lang === "zh"
      ? `显示 ${visible.length} / ${matches.length} 篇笔记`
      : `Showing ${visible.length} / ${matches.length} notes`
    : t("noResults");
  const more = document.querySelector(".notes-more");
  more.hidden = matches.length <= 6;
  more.textContent = t(state.showAllNotes ? "lessNotes" : "moreNotes");
}

function toggleLanguage() {
  state.lang = state.lang === "zh" ? "en" : "zh";
  savePreference("portfolioLang", state.lang);
  renderPage();
}

function setFilter(filter) {
  state.filter = filter;
  state.showAllNotes = false;
  state.expandedNoteId = null;
  renderNotes();
  updateMotionButton();
  document.querySelector("#notes-search").placeholder =
    state.lang === "zh" ? "搜索笔记 / SEARCH" : "Search notes...";
  document.querySelectorAll(".filter-btn").forEach((button) => {
    button.classList.toggle("active", button.dataset.filter === filter);
    button.setAttribute(
      "aria-pressed",
      String(button.dataset.filter === filter),
    );
  });
}

function handleNoteClick(card) {
  const noteId = card.dataset.noteId;
  state.expandedNoteId = state.expandedNoteId === noteId ? null : noteId;
  renderNotes();
  const current = document.querySelector(
    `[data-note-id="${CSS.escape(noteId)}"]`,
  );
  current?.querySelector(".note-trigger")?.focus({ preventScroll: true });
  if (state.expandedNoteId)
    current?.scrollIntoView({
      behavior: motionEnabled() ? "smooth" : "instant",
      block: "start",
    });
}

function setupEvents() {
  document
    .querySelector(".lang-toggle")
    ?.addEventListener("click", toggleLanguage);

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
    const trigger = event.target.closest(".note-trigger");
    if (trigger) handleNoteClick(trigger.closest(".note-card"));
  });
  document
    .querySelector("#notes-search")
    ?.addEventListener("input", (event) => {
      state.search = event.target.value;
      state.expandedNoteId = null;
      state.showAllNotes = false;
      renderNotes();
    });
  document.querySelector(".notes-more")?.addEventListener("click", () => {
    state.showAllNotes = !state.showAllNotes;
    state.expandedNoteId = null;
    renderNotes();
    if (!state.showAllNotes)
      document
        .querySelector(".notes-controls")
        .scrollIntoView({
          behavior: motionEnabled() ? "smooth" : "instant",
          block: "start",
        });
  });
  document.addEventListener("keydown", (event) => {
    if (event.key !== "Escape") return;
    navToggle?.setAttribute("aria-expanded", "false");
    navPanel?.classList.remove("active");
    document.body.classList.remove("nav-open");
    if (state.expandedNoteId) {
      const noteId = state.expandedNoteId;
      state.expandedNoteId = null;
      renderNotes();
      document
        .querySelector(`[data-note-id="${CSS.escape(noteId)}"] .note-trigger`)
        ?.focus({ preventScroll: true });
    }
  });
}

function renderPage() {
  updateStaticText();
  renderSkills();
  renderProjects();
  renderVibeProjects();
  renderNotes();
  updateMotionButton();
  document.querySelector("#notes-search").placeholder =
    state.lang === "zh" ? "搜索笔记 / SEARCH" : "Search notes...";
  document.querySelectorAll(".filter-btn").forEach((button) => {
    button.classList.toggle("active", button.dataset.filter === state.filter);
    button.setAttribute(
      "aria-pressed",
      String(button.dataset.filter === state.filter),
    );
  });
}

document.addEventListener("DOMContentLoaded", () => {
  setupEvents();
  renderPage();
  setupVisuals();
});

const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)");
let userPausedMotion = readPreference("portfolioMotion") === "paused";
function motionEnabled() {
  return !reducedMotion.matches && !userPausedMotion;
}
function updateMotionButton() {
  const paused = !motionEnabled();
  document.documentElement.classList.toggle("motion-paused", paused);
  const button = document.querySelector(".motion-toggle");
  button.textContent = t(paused ? "resumeMotion" : "pauseMotion");
  button.setAttribute("aria-pressed", String(paused));
  button.disabled = reducedMotion.matches;
  button.title = reducedMotion.matches
    ? state.lang === "zh"
      ? "已遵循系统的减少动态效果设置"
      : "Following your system reduced-motion preference"
    : "";
}
function setupVisuals() {
  document.querySelector(".motion-toggle").addEventListener("click", () => {
    userPausedMotion = !userPausedMotion;
    savePreference("portfolioMotion", userPausedMotion ? "paused" : "enabled");
    updateMotionButton();
  });
  reducedMotion.addEventListener("change", updateMotionButton);
  const revealObserver = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add("is-visible");
          revealObserver.unobserve(entry.target);
        }
      });
    },
    { threshold: 0.08 },
  );
  document.querySelectorAll(".reveal").forEach((element) => {
    element.classList.add("is-observed");
    revealObserver.observe(element);
  });
  const sections = [
    ...document.querySelectorAll("main section[id], footer[id]"),
  ];
  let pending = false;
  function syncScroll() {
    const max = document.documentElement.scrollHeight - innerHeight;
    document.querySelector(".reading-progress").style.transform =
      `scaleX(${max > 0 ? scrollY / max : 0})`;
    const current = sections
      .filter((section) => section.getBoundingClientRect().top <= 180)
      .at(-1);
    document.querySelectorAll(".nav-link").forEach((link) => {
      const active = link.hash === `#${current?.id}`;
      link.classList.toggle("active", active);
      if (active) link.setAttribute("aria-current", "location");
      else link.removeAttribute("aria-current");
    });
    pending = false;
  }
  window.addEventListener(
    "scroll",
    () => {
      if (!pending) {
        pending = true;
        requestAnimationFrame(syncScroll);
      }
    },
    { passive: true },
  );
  window.addEventListener("resize", syncScroll);
  syncScroll();
  const hero = document.querySelector(".hero");
  const art = document.querySelector(".hero-art");
  hero.addEventListener("pointermove", (event) => {
    if (!motionEnabled() || event.pointerType !== "mouse" || innerWidth < 900)
      return;
    const rect = hero.getBoundingClientRect();
    art.style.setProperty(
      "--mx",
      `${((event.clientX - rect.left) / rect.width - 0.5) * 12}px`,
    );
    art.style.setProperty(
      "--my",
      `${((event.clientY - rect.top) / rect.height - 0.5) * 8}px`,
    );
  });
  hero.addEventListener("pointerleave", () => {
    art.style.setProperty("--mx", "0px");
    art.style.setProperty("--my", "0px");
  });
  const wipe = document.querySelector(".page-wipe");
  document.querySelectorAll('a[href^="#"]').forEach((link) => {
    link.addEventListener("click", () => {
      if (!motionEnabled()) return;
      wipe.classList.remove("playing");
      void wipe.offsetWidth;
      wipe.classList.add("playing");
    });
  });
  wipe.addEventListener("animationend", () => wipe.classList.remove("playing"));
}
