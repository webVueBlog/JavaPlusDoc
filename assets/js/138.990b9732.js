(window.webpackJsonp=window.webpackJsonp||[]).push([[138],{644:function(e,s,t){"use strict";t.r(s);var v=t(2),r=Object(v.a)({},(function(){var e=this,s=e._self._c;return s("ContentSlotsDistributor",{attrs:{"slot-key":e.$parent.slotKey}},[s("blockquote",[s("p",[e._v("点击勘误"),s("a",{attrs:{href:"https://github.com/webVueBlog/JavaPlusDoc/issues",target:"_blank",rel:"noopener noreferrer"}},[e._v("issues"),s("OutboundLink")],1),e._v("，哪吒感谢大家的阅读")])]),e._v(" "),s("img",{attrs:{align:"right",width:"100",src:"https://cdn.jsdelivr.net/gh/YunYouJun/yun/images/yun-alpha-compressed.png"}}),e._v(" "),s("h2",{attrs:{id:"入门教程"}},[s("a",{staticClass:"header-anchor",attrs:{href:"#入门教程"}},[e._v("#")]),e._v(" 入门教程")]),e._v(" "),s("p",[e._v("Redis 针对不同的操作系统有不同的安装方式")]),e._v(" "),s("p",[e._v("Windows")]),e._v(" "),s("p",[e._v("下载地址如下：")]),e._v(" "),s("p",[e._v("https://github.com/MicrosoftArchive/redis/releases")]),e._v(" "),s("p",[e._v("我们这里选择第二种，MSI 的方式 MySQL 的时候讲过了，我们换一种口味。")]),e._v(" "),s("p",[e._v("打开命令行，进入到当前解压后的目录，输入启动命令：")]),e._v(" "),s("p",[e._v("redis-server redis.windows.conf")]),e._v(" "),s("p",[e._v("macOS 可以直接通过 Homebrew（戳链接了解）来安装 Redis，非常方便。")]),e._v(" "),s("p",[e._v("如果有 warp 终端（戳链接了解）的话，会更加智能，直接问它“如何安装 Redis”它就会告诉你安装步骤。")]),e._v(" "),s("p",[e._v("CentOS 默认的仓库中可能不包含 Redis，因此需要启用 EPEL（Extra Packages for Enterprise Linux）仓库。")]),e._v(" "),s("p",[e._v("sudo yum install epel-release")]),e._v(" "),s("p",[e._v("安装 Redis：")]),e._v(" "),s("p",[e._v("sudo yum install redis")]),e._v(" "),s("p",[e._v("启动 Redis 服务：")]),e._v(" "),s("p",[e._v("sudo systemctl start redis")]),e._v(" "),s("p",[e._v("设置开机启动：")]),e._v(" "),s("p",[e._v("sudo systemctl enable redis")]),e._v(" "),s("p",[e._v("查看 Redis 服务状态：")]),e._v(" "),s("p",[e._v("service redis status")]),e._v(" "),s("p",[e._v("设置开机启动：")]),e._v(" "),s("p",[e._v("sudo systemctl enable redis")]),e._v(" "),s("p",[e._v("查看 Redis 服务状态：")]),e._v(" "),s("p",[e._v("redis-cli ping")]),e._v(" "),s("h2",{attrs:{id:"redis-的数据结构"}},[s("a",{staticClass:"header-anchor",attrs:{href:"#redis-的数据结构"}},[e._v("#")]),e._v(" Redis 的数据结构")]),e._v(" "),s("p",[e._v("Redis 有 5 种基础数据结构，String、Hash、List、Set、SortedSet，也是学 Redis 必须掌握的。除此之外，还有 HyperLogLog、Geo、Pub/Sub，算是高级数据结构了。")]),e._v(" "),s("p",[e._v("String 结构使用非常广泛，比如说把用户的登陆信息转成 JSON 字符串后缓存起来，等需要取出的时候再反序列化一次。")]),e._v(" "),s("p",[e._v("在项目中添加 Gson（用于序列化和反序列化用户信息） 依赖")]),e._v(" "),s("div",{staticClass:"language- extra-class"},[s("pre",[s("code",[e._v("<dependency>\n\t<groupId>com.google.code.gson</groupId>\n\t<artifactId>gson</artifactId>\n\t<version>2.8.6</version>\n\t<scope>compile</scope>\n</dependency>\n")])])]),s("p",[e._v('Jedis jedis = new Jedis("localhost", 6379);')])])}),[],!1,null,null,null);s.default=r.exports}}]);