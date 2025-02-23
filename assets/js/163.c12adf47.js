(window.webpackJsonp=window.webpackJsonp||[]).push([[163],{808:function(_,v,p){"use strict";p.r(v);var t=p(2),s=Object(t.a)({},(function(){var _=this,v=_._self._c;return v("ContentSlotsDistributor",{attrs:{"slot-key":_.$parent.slotKey}},[v("blockquote",[v("p",[_._v("点击勘误"),v("a",{attrs:{href:"https://github.com/webVueBlog/JavaPlusDoc/issues",target:"_blank",rel:"noopener noreferrer"}},[_._v("issues"),v("OutboundLink")],1),_._v("，哪吒感谢大家的阅读")])]),_._v(" "),v("img",{attrs:{align:"right",width:"100",src:"https://cdn.jsdelivr.net/gh/YunYouJun/yun/images/yun-alpha-compressed.png"}}),_._v(" "),v("h2",{attrs:{id:"缓存雪崩、穿透、击穿"}},[v("a",{staticClass:"header-anchor",attrs:{href:"#缓存雪崩、穿透、击穿"}},[_._v("#")]),_._v(" 缓存雪崩、穿透、击穿")]),_._v(" "),v("p",[_._v("加随机时间过期后，如果访问时间刚好就是加了随机时间后的数据，这样岂不是白加了随机时间？")]),_._v(" "),v("p",[_._v("热点数据不过期，那岂不是有越来越多的脏数据？")]),_._v(" "),v("p",[_._v("缓存指 Redis。")]),_._v(" "),v("p",[_._v("提高 Redis 可用性：Redis 要么用集群架构，要么用主从 + 哨兵。保证 Redis 的可用性。")]),_._v(" "),v("p",[_._v("没有哨兵的主从不能自动故障转移，所以只有主从，万一高峰期或者在关键的活动时间节点挂了。")]),_._v(" "),v("p",[_._v("那么等出现线上告警、定位问题、沟通信息、等运维解决，一套操作下来，估计黄花菜都凉了。")]),_._v(" "),v("h3",{attrs:{id:"减少对缓存的依赖"}},[v("a",{staticClass:"header-anchor",attrs:{href:"#减少对缓存的依赖"}},[_._v("#")]),_._v(" 减少对缓存的依赖")]),_._v(" "),v("p",[_._v("对于热点数据，是不是可以考虑加上本地缓存，比如：Guava、Ehcache，更简单点，hashMap、List 什么也可以。")]),_._v(" "),v("p",[_._v("减少对 Redis 压力的同时，还能提高性能，一举两得。")]),_._v(" "),v("h3",{attrs:{id:"业务降级"}},[v("a",{staticClass:"header-anchor",attrs:{href:"#业务降级"}},[_._v("#")]),_._v(" 业务降级")]),_._v(" "),v("p",[_._v("从保护下游（接口或数据库）的角度考虑，针对大流量场景是不是可以做下限流。这样即使缓存崩了，也不至于把下游全部拖垮。")]),_._v(" "),v("p",[_._v("以及该降级的功能是不是可以降级，提前写好降级开关和降级逻辑，关键时候全靠它稳住。")]),_._v(" "),v("h2",{attrs:{id:"_1-缓存雪崩"}},[v("a",{staticClass:"header-anchor",attrs:{href:"#_1-缓存雪崩"}},[_._v("#")]),_._v(" 1. 缓存雪崩")]),_._v(" "),v("p",[_._v("即缓存同一时间大面积的失效，这个时候来了一大波请求，都怼到数据库上，最后数据库处理不过来崩了。")]),_._v(" "),v("p",[_._v("1.1 业务场景举例")]),_._v(" "),v("p",[_._v("APP 首页有大量热点数据，在某大型活动期间，针对不同时间段需要展示不同的首页数据。")]),_._v(" "),v("p",[_._v("比如在 0 点时需要替换新的首页数据，此时旧首页数据过期，新首页数据刚开始加载。")]),_._v(" "),v("p",[_._v("而 0 点正在有个小活动开始，大批请求涌入。因为新数据刚开始加载，请求多数没有命中缓存，请求到了数据库，最后就把数据库打挂了。")]),_._v(" "),v("p",[_._v("1.2 解决方案")]),_._v(" "),v("p",[_._v("再强调一下，所谓的解决方案是需要根据实际业务调整，不同业务的处理不完全相同")]),_._v(" "),v("p",[_._v("1.2.1 方法一")]),_._v(" "),v("p",[_._v("常见方式就是给过期时间加个随机时间。")]),_._v(" "),v("p",[_._v("注意这个随机时间不是几秒哈，可以长达几分钟。因为如果数据量很大，按照上述例子，加上 Redis 是单线程处理数据的。那么几秒的缓冲不一定能够保证新数据都被加载完成。")]),_._v(" "),v("p",[_._v("所以过期时间宁愿设置长一点，也好过短一点。反正最后都是会过期掉，最终效果是一样的。")]),_._v(" "),v("p",[_._v("而且过期时间范围加大，key 会更加分散，这样也是一定程度缩短 Redis 在过期 key 时候的阻塞时间。")]),_._v(" "),v("p",[_._v("「如果访问时间刚好就是加了随机时间后的数据，这样岂不是白加了随机时间」。")]),_._v(" "),v("p",[_._v("现在你结合上例活动的例子，它还会是一个问题吗？结合业务，一定要结合业务。")]),_._v(" "),v("p",[_._v("1.2.2 方法二")]),_._v(" "),v("p",[_._v("加互斥锁，但这个方案会导致吞吐量明显下降。所以还是要看实际业务，像上述例子就不合适用")]),_._v(" "),v("p",[_._v("1.2.3 方法三")]),_._v(" "),v("p",[_._v("热点数据不设置过期。不过期的话，正常业务请求自然就不会打到数据库了。")]),_._v(" "),v("p",[_._v("那新的问题又来了，不过期有脏数据，怎么办？")]),_._v(" "),v("p",[_._v("很简单，活动整体结束后再删除嘛。")]),_._v(" "),v("p",[_._v("那像上述例子，可以怎么处理呢？—— 选择方法一；或者提前把 0 点需要的新数据加载进 Redis，不必等到 0 点才去加载，这样也是可以的")]),_._v(" "),v("h2",{attrs:{id:"_2-缓存击穿"}},[v("a",{staticClass:"header-anchor",attrs:{href:"#_2-缓存击穿"}},[_._v("#")]),_._v(" 2. 缓存击穿")]),_._v(" "),v("p",[_._v("缓存击穿是指一个热点 key 过期或被删除后，导致线上原本能命中该热点 key 的请求，瞬间大量地打到数据库上，最终导致数据库被击垮。")]),_._v(" "),v("p",[_._v("有种千里之堤，溃于蚁穴的感觉。")]),_._v(" "),v("p",[_._v("2.1 业务场景举例")]),_._v(" "),v("p",[_._v("出现情况一般是误操作，比如设置错了过期时间、误删除导致的。")]),_._v(" "),v("p",[_._v("2.2 解决方案")]),_._v(" "),v("p",[_._v("方法一")]),_._v(" "),v("p",[_._v("代码问题，该 review 的 review。")]),_._v(" "),v("p",[_._v("热点数据到底要不要过期，什么时候过期要明确")]),_._v(" "),v("p",[_._v("既然是热点数据，大概率是核心流程。那么该保证的核心功能还是需要保证的，减少犯错机会。万一出问题，那就是用户的一波输出了。")]),_._v(" "),v("p",[_._v("方法二")]),_._v(" "),v("p",[_._v("线上误操作的事情，该加强权限管理的加强，特别是线上权限，一定需要审核，以防手抖。")]),_._v(" "),v("h2",{attrs:{id:"_3-缓存穿透"}},[v("a",{staticClass:"header-anchor",attrs:{href:"#_3-缓存穿透"}},[_._v("#")]),_._v(" 3. 缓存穿透")]),_._v(" "),v("p",[_._v("缓存穿透是指：客户端请求缓存和数据库中不存在的数据，导致所有的请求都打到数据库上。如果请求很多，数据库依旧会挂得明明白白。")]),_._v(" "),v("p",[_._v("3.1 业务场景举例")]),_._v(" "),v("p",[_._v("数据库主键 id 都是正数，然后客户端发起了 id = -1 的查询")]),_._v(" "),v("p",[_._v("一个查询接口，有一个状态字段 status，其实 0 表示开始、1 表示结束。结果有请求一直发 status=3 的请求过来")]),_._v(" "),v("p",[_._v("3.2 解决方案")]),_._v(" "),v("p",[_._v("3.2.1 方法一")]),_._v(" "),v("p",[_._v("做好参数校验，对于不合理的参数要及时 return 结束")]),_._v(" "),v("p",[_._v("这点非常重点，做任何业务都一样，对于后端来说，要有互不信任原则。")]),_._v(" "),v("p",[_._v("简单来说，就是不要信任来自前端、客户端和上游服务的请求数据，该做的校验还是要做。")]),_._v(" "),v("p",[_._v("因为我们永远都不知道用户会写什么奇奇怪怪的数据；又或者即使你和对接的开发约定好了要怎么传参数，但你保不准他就没遵守呢；退一步来说，万一接口被破解呢。")]),_._v(" "),v("p",[_._v("3.2.2 方法二")]),_._v(" "),v("p",[_._v("对于查不到数据的 key，也将其短暂缓存起来。")]),_._v(" "),v("p",[_._v("比如 30s。这样能避免大量相同请求瞬间打到数据库上，减轻压力。")]),_._v(" "),v("p",[_._v("但是后面肯定要去看为什么会有这样的数据，从根本上解决问题，该方法只是缓解问题而已。")]),_._v(" "),v("p",[_._v("如果发现就是某些 ip 在请求，并且这些数据非法，那可以在网关层限制这些 ip 访问")]),_._v(" "),v("p",[_._v("3.2.3 方法三")]),_._v(" "),v("p",[_._v("提供一个能迅速判断请求是否有效的拦截机制，比如布隆过滤器，Redis 本身就具有这个功能。")]),_._v(" "),v("p",[_._v("让它维护所有合法的 key，如果请求参数不合法，则直接返回。否则就从缓存或数据库中获取。")])])}),[],!1,null,null,null);v.default=s.exports}}]);