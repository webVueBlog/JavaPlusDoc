module.exports = {
	title: 'Jeskson文档',
	description: '架构师',
	base: '/JavaPlusDoc/',
	theme: 'reco',
	head: [
		['meta', { name: 'viewport', content: 'width=device-width,initial-scale=1,user-scalable=no' }]
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
			text: '星星',
			link: 'https://github.com/webVueBlog/JavaPlusDoc'
		},
		{
			text: '作者',
			items: [{
				text: 'Github',
				link: 'https://github.com/webVueBlog'
			}
			]
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
			title: "服务器安装",
			path: '/handbook/entry',
			// collapsable: false, // 不折叠
			children: [{
				title: "入口entry",
				path: "/handbook/entry"
			},
			{
				title: "target",
				path: "/handbook/target"
			},
			],
		},
		]
	}
}
