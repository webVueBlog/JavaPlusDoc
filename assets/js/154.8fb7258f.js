(window.webpackJsonp=window.webpackJsonp||[]).push([[154],{795:function(v,_,t){"use strict";t.r(_);var e=t(2),r=Object(e.a)({},(function(){var v=this,_=v._self._c;return _("ContentSlotsDistributor",{attrs:{"slot-key":v.$parent.slotKey}},[_("blockquote",[_("p",[v._v("点击勘误"),_("a",{attrs:{href:"https://github.com/webVueBlog/JavaPlusDoc/issues",target:"_blank",rel:"noopener noreferrer"}},[v._v("issues"),_("OutboundLink")],1),v._v("，哪吒感谢大家的阅读")])]),v._v(" "),_("img",{attrs:{align:"right",width:"100",src:"https://cdn.jsdelivr.net/gh/YunYouJun/yun/images/yun-alpha-compressed.png"}}),v._v(" "),_("h2",{attrs:{id:"一条sql查询语句是如何执行的"}},[_("a",{staticClass:"header-anchor",attrs:{href:"#一条sql查询语句是如何执行的"}},[v._v("#")]),v._v(" 一条SQL查询语句是如何执行的")]),v._v(" "),_("p",[v._v("SQL 语句在 MySQL 的各个功能模块中的执行过程。")]),v._v(" "),_("p",[v._v("客户端->连接器（管理连接，权限验证）->查询缓存（命中缓存直接返回结果）->分析器（词法分析，语法分析）->优化器（生成执行计划）->执行器（调用存储引擎的接口）->返回结果")]),v._v(" "),_("p",[v._v("存储引擎-> InnoDB, MyISAM, Memory, CSV, Archive（存储数据，提供读写接口）")]),v._v(" "),_("h2",{attrs:{id:"mysql-的逻辑架构-餐厅点餐系统"}},[_("a",{staticClass:"header-anchor",attrs:{href:"#mysql-的逻辑架构-餐厅点餐系统"}},[v._v("#")]),v._v(" MySQL 的逻辑架构 = 餐厅点餐系统")]),v._v(" "),_("p",[v._v("MySQL 可以分为两层：Server 层和存储引擎层。")]),v._v(" "),_("p",[v._v("Server 层：像餐厅的前台和服务员")]),v._v(" "),_("blockquote",[_("p",[v._v("连接器：就像餐厅的门卫或前台接待，你来了之后，他们会核实你是不是会员（检查用户名和密码）。如果验证通过，接待会给你安排座位（建立连接）。")])]),v._v(" "),_("p",[v._v("比如，来了个 VIP 客人（根用户），连接器快速确认身份并热情接待。")]),v._v(" "),_("blockquote",[_("p",[v._v("查询缓存：服务员会先问厨房：“这道菜是不是之前做过？有现成的吗？”（查询缓存）。")])]),v._v(" "),_("p",[v._v("如果有，那就直接把现成的菜端上来（命中缓存）；如果没有，就让厨房重新做菜（走后续流程）。")]),v._v(" "),_("blockquote",[_("p",[v._v("分析器：服务员拿到你写的菜单（SQL 语句），需要先理解你写的是什么内容（解析语法和单词）。")])]),v._v(" "),_("p",[v._v("如果你菜单上写的是“白菜炒肉”（SQL 语句格式正确），那服务员能顺利理解；但如果你写的是“炒白菜肉”（SQL 错误），服务员就会提醒你修改。")]),v._v(" "),_("blockquote",[_("p",[v._v("优化器：厨师长会决定菜怎么做最省时间、最有效率（查询优化器）。比如，同样是炒肉，可以先切菜再炒，或者先炒肉后加菜，看哪种更快。")])]),v._v(" "),_("p",[v._v("如果点的是“从表里找一条最贵的菜”，优化器会先找索引帮忙，而不是从头到尾挨个翻菜单。")]),v._v(" "),_("blockquote",[_("p",[v._v("执行器：服务员根据最终确定的菜单去通知厨房制作，并确保整个过程都顺利进行（执行 SQL 语句）。")])]),v._v(" "),_("p",[v._v("服务员在执行过程中，可能会遇到厨房原材料不足、火候不够的问题（权限不足或表不存在），都会及时反馈给你。")]),v._v(" "),_("h2",{attrs:{id:"存储引擎层-像餐厅的厨房"}},[_("a",{staticClass:"header-anchor",attrs:{href:"#存储引擎层-像餐厅的厨房"}},[v._v("#")]),v._v(" 存储引擎层：像餐厅的厨房")]),v._v(" "),_("p",[v._v("存储引擎：厨房决定怎么储存食材、怎么做菜。MySQL 的存储引擎是“插件式的”，就像餐厅可以选择中餐、日料、法餐不同的厨师团队来做菜。")]),v._v(" "),_("ol",[_("li",[v._v("InnoDB：中餐大厨，擅长用高效的锅炒菜（支持事务、高并发），也是餐厅的默认大厨。")]),v._v(" "),_("li",[v._v("Memory：快餐团队，直接用现成的冷藏食材做（数据存储在内存中，速度快但易丢失）。")]),v._v(" "),_("li",[v._v("MyISAM：传统厨师，适合简单的家常菜（不支持事务，但查询速度快）。")])]),v._v(" "),_("p",[v._v("当服务员把点菜单递给厨房时，厨房（存储引擎）负责根据食材准备情况去做菜（存取数据）。")]),v._v(" "),_("h2",{attrs:{id:"例子-建表时选择不同的存储引擎"}},[_("a",{staticClass:"header-anchor",attrs:{href:"#例子-建表时选择不同的存储引擎"}},[v._v("#")]),v._v(" 例子：建表时选择不同的存储引擎")]),v._v(" "),_("p",[v._v("假如你来餐厅点了“烧鹅饭”，我们可以类比一下：")]),v._v(" "),_("ol",[_("li",[v._v("如果你没指定厨师（存储引擎），餐厅会默认找中餐大厨（InnoDB）来做这道菜。")]),v._v(" "),_("li",[v._v("如果你明确要求“烧鹅饭用快餐模式”（Memory 引擎），服务员会把请求交给快餐团队，但他们只能用现成的冷冻烧鹅。")]),v._v(" "),_("li",[v._v("如果你说“我要传统方式的烧鹅饭”（MyISAM 引擎），那么老派厨师会慢悠悠地做，且过程中不支持加单（不支持事务）。")])]),v._v(" "),_("h2",{attrs:{id:"总结-mysql-逻辑架构图"}},[_("a",{staticClass:"header-anchor",attrs:{href:"#总结-mysql-逻辑架构图"}},[v._v("#")]),v._v(" 总结 MySQL 逻辑架构图")]),v._v(" "),_("p",[v._v("Server 层（服务员和前台）负责协调和服务，主要包括：")]),v._v(" "),_("ol",[_("li",[v._v("连接器：核实客人身份并安排座位。")]),v._v(" "),_("li",[v._v("查询缓存：检查厨房有没有现成的菜。")]),v._v(" "),_("li",[v._v("分析器：理解菜单内容。")]),v._v(" "),_("li",[v._v("优化器：确定最优的做菜流程。")]),v._v(" "),_("li",[v._v("执行器：确保厨房顺利完成任务。")])]),v._v(" "),_("p",[v._v("存储引擎层（厨房）负责存储和加工数据，根据不同的需求选择不同的厨师团队（InnoDB、MyISAM、Memory 等）。")])])}),[],!1,null,null,null);_.default=r.exports}}]);