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
				title: "Java基础",
				path: '/basic-grammar/basic-data-type',
				// collapsable: false, // 不折叠
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
				],
			},
		]
	}
}