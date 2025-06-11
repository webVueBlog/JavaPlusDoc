# tomcat是什么

tomcat 是一个 web 服务器，用于处理 http 请求。

tomcat的本质就是个“服务员“，专业点说就是开源的java servlet容器。简单来说，当你用浏览器访问网站时，tomcat就像餐厅传菜员，把java代码做的”菜品“，翻译成你能看懂的HTML页面，它内置的JSP引擎会把页面布局，魔法符合变成正经的Java代码，Coyote连接器负责和浏览器对暗号”处理HTTP协议。

tomcat最牛的是它的类加载机制，每个应用独立的ClassLoader，就像给不同包间装隔离墙，内存泄露，不存在的，配合NIO非阻塞IO模型，每秒处理上千请求跟玩似的。

在server.xml的maxConnections属性中可以设置最大连接数，默认是200。

配合springboot变成微服务大佬们，tomcat的配置都在application.yml中。把reloadable属性设置为true，就可以实现热部署，修改代码后，不用重启服务器，就能看到效果。

> tomcat 是Java写前端的好帮手。为啥？ 因为它是一个web服务器，它可以处理http请求，返回html页面。
