(window.webpackJsonp=window.webpackJsonp||[]).push([[166],{818:function(s,t,e){"use strict";e.r(t);var r=e(2),n=Object(r.a)({},(function(){var s=this,t=s._self._c;return t("ContentSlotsDistributor",{attrs:{"slot-key":s.$parent.slotKey}},[t("blockquote",[t("p",[s._v("点击勘误"),t("a",{attrs:{href:"https://github.com/webVueBlog/JavaPlusDoc/issues",target:"_blank",rel:"noopener noreferrer"}},[s._v("issues"),t("OutboundLink")],1),s._v("，哪吒感谢大家的阅读")])]),s._v(" "),t("img",{attrs:{align:"right",width:"100",src:"https://cdn.jsdelivr.net/gh/YunYouJun/yun/images/yun-alpha-compressed.png"}}),s._v(" "),t("h2",{attrs:{id:"es生产集群的部署架构"}},[t("a",{staticClass:"header-anchor",attrs:{href:"#es生产集群的部署架构"}},[s._v("#")]),s._v(" ES生产集群的部署架构")]),s._v(" "),t("p",[s._v("部署了几台机器？有多少个索引？每个索引有多大数据量？每个索引给了多少个分片？你肯定知道！")]),s._v(" "),t("ul",[t("li",[s._v("es 生产集群我们部署了 5 台机器，每台机器是 6 核 64G 的，集群总内存是 320G。")]),s._v(" "),t("li",[s._v("我们 es 集群的日增量数据大概是 2000 万条，每天日增量数据大概是 500MB，每月增量数据大概是 6 亿，15G。目前系统已经运行了几个月，现在 es 集群里数据总量大概是 100G 左右。")]),s._v(" "),t("li",[s._v("目前线上有 5 个索引（这个结合你们自己业务来，看看自己有哪些数据可以放 es 的），每个索引的数据量大概是 20G，所以这个数据量之内，我们每个索引分配的是 8 个 shard，比默认的 5 个 shard 多了 3 个 shard。")])])])}),[],!1,null,null,null);t.default=n.exports}}]);