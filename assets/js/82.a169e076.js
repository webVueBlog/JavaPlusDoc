(window.webpackJsonp=window.webpackJsonp||[]).push([[82],{575:function(e,t,r){"use strict";r.r(t);var a=r(2),n=Object(a.a)({},(function(){var e=this,t=e._self._c;return t("ContentSlotsDistributor",{attrs:{"slot-key":e.$parent.slotKey}},[t("blockquote",[t("p",[e._v("点击勘误"),t("a",{attrs:{href:"https://github.com/webVueBlog/JavaPlusDoc/issues",target:"_blank",rel:"noopener noreferrer"}},[e._v("issues"),t("OutboundLink")],1),e._v("，哪吒感谢大家的阅读")])]),e._v(" "),t("img",{attrs:{align:"right",width:"100",src:"https://cdn.jsdelivr.net/gh/YunYouJun/yun/images/yun-alpha-compressed.png"}}),e._v(" "),t("h2",{attrs:{id:"iterator和iterable的区别"}},[t("a",{staticClass:"header-anchor",attrs:{href:"#iterator和iterable的区别"}},[e._v("#")]),e._v(" Iterator和Iterable的区别")]),e._v(" "),t("p",[e._v("在 Java 中，我们对 List 进行遍历的时候，主要有这么三种方式。")]),e._v(" "),t("p",[e._v("第一种：for 循环。")]),e._v(" "),t("p",[e._v("第二种：迭代器。")]),e._v(" "),t("p",[e._v("第三种：for-each。")]),e._v(" "),t("p",[e._v("第一种我们略过，第二种用的是 Iterator，第三种看起来是 for-each，其实背后也是 Iterator，看一下反编译后的代码就明白了。")]),e._v(" "),t("p",[e._v("for-each 只不过是个语法糖，让我们开发者在遍历 List 的时候可以写更少的代码，更简洁明了。")]),e._v(" "),t("p",[e._v("Iterator 是个接口，JDK 1.2 的时候就有了，用来改进 Enumeration 接口：")]),e._v(" "),t("ol",[t("li",[e._v("允许删除元素（增加了 remove 方法）")]),e._v(" "),t("li",[e._v("优化了方法名（Enumeration 中是 hasMoreElements 和 nextElement，不简洁）")])]),e._v(" "),t("div",{staticClass:"language- extra-class"},[t("pre",{pre:!0,attrs:{class:"language-text"}},[t("code",[e._v('public interface Iterator<E> {\n    // 判断集合中是否存在下一个对象\n    boolean hasNext();\n    // 返回集合中的下一个对象，并将访问指针移动一位\n    E next();\n    // 删除集合中调用next()方法返回的对象\n    default void remove() {\n        throw new UnsupportedOperationException("remove");\n    }\n}\n')])])]),t("p",[e._v("JDK 1.8 时，Iterable 接口中新增了 forEach 方法。该方法接受一个 Consumer 对象作为参数，用于对集合中的每个元素执行指定的操作。该方法的实现方式是使用 for-each 循环遍历集合中的元素，对于每个元素，调用 Consumer 对象的 accept 方法执行指定的操作。")]),e._v(" "),t("div",{staticClass:"language- extra-class"},[t("pre",{pre:!0,attrs:{class:"language-text"}},[t("code",[e._v("default void forEach(Consumer<? super T> action) {\n    Objects.requireNonNull(action);\n    for (T t : this) {\n        action.accept(t);\n    }\n}\n")])])])])}),[],!1,null,null,null);t.default=n.exports}}]);