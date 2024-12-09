module.exports = {
	title: 'Jeskson文档',
	description: '架构师',
	base: '/JavaPlusDoc/',
	theme: 'reco',
	head: [
		['meta', {
			name: 'viewport',
			content: 'width=device-width,initial-scale=1,user-scalable=no'
		}]
	],
	plugins: [
		'@vuepress/medium-zoom',
		'@vuepress-reco/vuepress-plugin-loading-page',
		[
			'dynamic-title',
			{
				showIcon: '/favicon.ico',
				showText: '(/≧▽≦/)咦！又好了！',
				hideIcon: '/failure.ico',
				hideText: '(●—●)喔哟，崩溃啦！',
				recoverTime: 2000,
			},
		],
		// 看板娘
		[
			"@vuepress-reco/vuepress-plugin-kan-ban-niang",
			{
				theme: ["blackCat"],
				clean: true,
				height: 260,
				modelStyle: {
					width: '100px',
					position: "fixed",
					right: "0px",
					bottom: "0px",
					opacity: "0.9",
					zIndex: 99999,
					objectFit: 'cover',
				}
			}
		],
		['vuepress-plugin-code-copy', true]
	],
	locales: {
		'/': {
			lang: 'zh-CN'
		}
	},
	themeConfig: {
		lastUpdated: '上次更新',
		subSidebar: 'auto',
		nav: [{
				text: '首页',
				link: '/'
			},
			{
				text: '网站',
				link: 'https://webvueblog.github.io/JavaPlusDoc/'
			},
			{
				text: '星星',
				link: 'https://github.com/webVueBlog/JavaPlusDoc'
			},
			{
				text: '作者',
				items: [{
					text: 'Github',
					link: 'https://github.com/webVueBlog'
				}]
			}
		],
		sidebar: [{
				title: '架构师',
				path: '/',
				collapsable: false, // 不折叠
				children: [{
					title: "学前必读",
					path: "/"
				}]
			},
			{
				title: 'Redis',
				path: '/redis/rumen',
				collapsable: false, // 不折叠
				children: [{
					title: "入门教程",
					path: "/redis/rumen"
				},{
					title: "缓存雪崩、穿透、击穿",
					path: "/redis/xuebeng-chuantou-jichuan"
				}]
			},
			{
				title: '操作系统',
				path: '/cs/os',
				collapsable: false, // 不折叠
				children: [{
					title: "计算机操作系统",
					path: "/cs/os"
				},{
					title: "计算机网络",
					path: "/cs/wangluo"
				}]
			},
			{
				title: 'Java进阶',
				path: '/java-up/nginx',
				collapsable: false, // 不折叠
				children: [{
					title: "浅出搞懂Nginx",
					path: "/java-up/nginx"
				},{
					title: "Nginx服务器SSL证书安装部署",
					path: "/java-up/ssl"
				},{
					title: "SpringAOP扫盲",
					path: "/java-up/aop-log"
				},{
					title: "SpringIoC扫盲",
					path: "/java-up/ioc"
				},{
					title: "超详细Netty入门",
					path: "/java-up/netty"
				}]
			},
			{
				title: "Java基础",
				path: '/basic-grammar/basic-data-type',
				collapsable: false, // 不折叠
				children: [{
						title: "Java基本数据类型",
						path: "/basic-grammar/basic-data-type"
					},
					{
						title: "基本数据类型的转换",
						path: "/basic-grammar/type-cast"
					},
					{
						title: "基本数据类型缓存池剖析",
						path: "/basic-grammar/int-cache"
					},
					{
						title: "掌握运算符",
						path: "/basic-grammar/operator"
					},
					{
						title: "流程控制语句",
						path: "/basic-grammar/flow-control"
					},
					{
						title: "深入解读String类",
						path: "/basic-grammar/string-source"
					},
					{
						title: "字符串常量池",
						path: "/basic-grammar/constant-pool"
					},
					{
						title: "StringBuilder和StringBuffer",
						path: "/basic-grammar/builder-buffer"
					},
					{
						title: "如何比较两个字符串相等",
						path: "/basic-grammar/equals"
					},
					{
						title: "万物皆对象",
						path: "/basic-grammar/object-class"
					},
					{
						title: "Java中的包",
						path: "/basic-grammar/package"
					},
					{
						title: "Java变量",
						path: "/basic-grammar/var"
					},
					{
						title: "Java方法",
						path: "/basic-grammar/method"
					},
					{
						title: "构造方法",
						path: "/basic-grammar/construct"
					},
					{
						title: "抽象类",
						path: "/basic-grammar/abstract"
					},
					{
						title: "接口和内部类",
						path: "/basic-grammar/interface"
					},
					{
						title: "封装继承多态",
						path: "/basic-grammar/encapsulation-inheritance-polymorphism"
					},
					{
						title: "this与super关键字",
						path: "/basic-grammar/this-super"
					},
					{
						title: "不可变对象",
						path: "/basic-grammar/immutable"
					},
				],
			},
		]
	}
}