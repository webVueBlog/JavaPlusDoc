(window.webpackJsonp=window.webpackJsonp||[]).push([[81],{574:function(t,n,a){"use strict";a.r(n);var e=a(2),i=Object(e.a)({},(function(){var t=this,n=t._self._c;return n("ContentSlotsDistributor",{attrs:{"slot-key":t.$parent.slotKey}},[n("blockquote",[n("p",[t._v("点击勘误"),n("a",{attrs:{href:"https://github.com/webVueBlog/JavaPlusDoc/issues",target:"_blank",rel:"noopener noreferrer"}},[t._v("issues"),n("OutboundLink")],1),t._v("，哪吒感谢大家的阅读")])]),t._v(" "),n("img",{attrs:{align:"right",width:"100",src:"https://cdn.jsdelivr.net/gh/YunYouJun/yun/images/yun-alpha-compressed.png"}}),t._v(" "),n("h2",{attrs:{id:"接口和内部类"}},[n("a",{staticClass:"header-anchor",attrs:{href:"#接口和内部类"}},[t._v("#")]),t._v(" 接口和内部类")]),t._v(" "),n("p",[t._v("接口通过 interface 关键字来定义")]),t._v(" "),n("p",[t._v("1）接口中定义的变量会在编译的时候自动加上 public static final 修饰符")]),t._v(" "),n("p",[t._v("2）没有使用 private、default 或者 static 关键字修饰的方法是隐式抽象的")]),t._v(" "),n("p",[t._v("3）从 Java 8 开始，接口中允许有静态方法")]),t._v(" "),n("p",[t._v("4）接口中允许定义 default 方法")]),t._v(" "),n("p",[t._v("我们还应该知道：")]),t._v(" "),n("p",[t._v("1）接口不允许直接实例化，否则编译器会报错。")]),t._v(" "),n("p",[t._v("2）接口可以是空的，既可以不定义变量，也可以不定义方法。最典型的例子就是 Serializable 接口，在 java.io 包下。")]),t._v(" "),n("p",[t._v("3）不要在定义接口的时候使用 final 关键字，否则会报编译错误，因为接口就是为了让子类实现的，而 final 阻止了这种行为。")]),t._v(" "),n("p",[t._v("4）接口的抽象方法不能是 private、protected 或者 final，否则编译器都会报错。")]),t._v(" "),n("p",[t._v("5）接口的变量是隐式 public static final（常量），所以其值无法改变。")]),t._v(" "),n("h3",{attrs:{id:"接口的三种模式"}},[n("a",{staticClass:"header-anchor",attrs:{href:"#接口的三种模式"}},[t._v("#")]),t._v(" 接口的三种模式")]),t._v(" "),n("p",[t._v("1）策略模式")]),t._v(" "),n("p",[t._v("策略模式的思想是，针对一组算法，将每一种算法封装到具有共同接口的实现类中，接口的设计者可以在不影响调用者的情况下对算法做出改变。")]),t._v(" "),n("p",[t._v("2）适配器模式")]),t._v(" "),n("p",[t._v("适配器模式的思想是，针对调用者的需求对原有的接口进行转接。生活当中最常见的适配器就是HDMI（英语：High Definition Multimedia Interface，中文：高清多媒体接口）线，可以同时发送音频和视频信号。")]),t._v(" "),n("p",[t._v("3）工厂模式")]),t._v(" "),n("p",[t._v("所谓的工厂模式理解起来也不难，就是什么工厂生产什么，比如说宝马工厂生产宝马，奔驰工厂生产奔驰，A 级学院毕业 A 级教练，C 级学院毕业 C 级教练。")]),t._v(" "),n("h3",{attrs:{id:"简单总结一下抽象类和接口的区别。"}},[n("a",{staticClass:"header-anchor",attrs:{href:"#简单总结一下抽象类和接口的区别。"}},[t._v("#")]),t._v(" 简单总结一下抽象类和接口的区别。")]),t._v(" "),n("p",[t._v("在 Java 中，通过关键字 abstract 定义的类叫做抽象类。Java 是一门面向对象的语言，因此所有的对象都是通过类来描述的；但反过来，并不是所有的类都是用来描述对象的，抽象类就是其中的一种。")]),t._v(" "),n("p",[t._v("接口（英文：Interface），在 Java 中是一个抽象类型，是抽象方法的集合；接口通过关键字 interface 来定义。接口与抽象类的不同之处在于：")]),t._v(" "),n("p",[t._v("1、抽象类可以有方法体的方法，但接口没有（Java 8 以前）。")]),t._v(" "),n("p",[t._v("2、接口中的成员变量隐式为 static final，但抽象类不是的。")]),t._v(" "),n("p",[t._v("3、一个类可以实现多个接口，但只能继承一个抽象类。")]),t._v(" "),n("h2",{attrs:{id:"成员内部类、局部内部类、匿名内部类、静态内部类"}},[n("a",{staticClass:"header-anchor",attrs:{href:"#成员内部类、局部内部类、匿名内部类、静态内部类"}},[t._v("#")]),t._v(" 成员内部类、局部内部类、匿名内部类、静态内部类")]),t._v(" "),n("p",[t._v("在 Java 中，可以将一个类定义在另外一个类里面或者一个方法里面，这样的类叫做内部类。")]),t._v(" "),n("p",[t._v("一般来说，内部类分为成员内部类、局部内部类、匿名内部类和静态内部类。")]),t._v(" "),n("p",[t._v("1）成员内部类")]),t._v(" "),n("p",[t._v("成员内部类是最常见的内部类")]),t._v(" "),n("p",[t._v("内部类可以随心所欲地访问外部类的成员，但外部类想要访问内部类的成员，就不那么容易了，必须先创建一个成员内部类的对象，再通过这个对象来访问")]),t._v(" "),n("p",[t._v("这也就意味着，如果想要在静态方法中访问成员内部类的时候，就必须先得创建一个外部类的对象，因为内部类是依附于外部类的。")]),t._v(" "),n("div",{staticClass:"language- extra-class"},[n("pre",[n("code",[t._v('public class Wanger {\n\tint age = 18;\n\tprivate String name = "实时";\n\tstatic double money = 1;\n\n\tpublic Wanger () {\n\t\tnew Wangxiaoer().print();\n\t}\n\n\tclass Wangxiaoer {\n\t\tint age = 81;\n\n\t\tpublic void print() {\n\t\t\tSystem.out.println(name);\n\t\t\tSystem.out.println(money);\n\t\t}\n\t}\n}\n\n\npublic class Wanger {\n\tint age = 18;\n\tprivate String name = "啊啊";\n\tstatic double money = 1;\n\n\tpublic Wanger () {\n\t\tnew Wangxiaoer().print();\n\t}\n\n\tpublic static void main(String[] args) {\n\t\tWanger wanger = new Wanger();\n\t\tWangxiaoer xiaoer = wanger.new Wangxiaoer();\n\t\txiaoer.print();\n\t}\n\n\tclass Wangxiaoer {\n\t\tint age = 81;\n\n\t\tpublic void print() {\n\t\t\tSystem.out.println(name);\n\t\t\tSystem.out.println(money);\n\t\t}\n\t}\n}\n')])])]),n("p",[t._v("局部内部类是定义在一个方法或者一个作用域里面的类，所以局部内部类的生命周期仅限于作用域内。")]),t._v(" "),n("p",[t._v("匿名内部类是我们平常用得最多的，尤其是启动多线程的时候，会经常用到，并且 IDE 也会帮我们自动生成。")]),t._v(" "),n("div",{staticClass:"language- extra-class"},[n("pre",[n("code",[t._v("public class ThreadDemo {\n\tpublic static void main(String[] args) {\n\t\tThread t = new Thread(new Runnable() {\n\t\t\t@Override\n\t\t\tpublic void run() {\n\t\t\t\tSystem.out.println(Thread.currentThread().getName());\n\t\t\t}\n\t\t});\n\t\tt.start();\n\t}\n}\n")])])]),n("p",[t._v("匿名内部类是唯一一种没有构造方法的类。")]),t._v(" "),n("p",[t._v("静态内部类和成员内部类类似，只是多了一个 static 关键字。")])])}),[],!1,null,null,null);n.default=i.exports}}]);