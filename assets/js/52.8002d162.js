(window.webpackJsonp=window.webpackJsonp||[]).push([[52],{519:function(e,i,r){e.exports=r.p+"assets/img/img_3.e5e45ea0.png"},618:function(e,i,r){"use strict";r.r(i);var t=r(2),v=Object(t.a)({},(function(){var e=this,i=e._self._c;return i("ContentSlotsDistributor",{attrs:{"slot-key":e.$parent.slotKey}},[i("blockquote",[i("p",[e._v("点击勘误"),i("a",{attrs:{href:"https://github.com/webVueBlog/JavaPlusDoc/issues",target:"_blank",rel:"noopener noreferrer"}},[e._v("issues"),i("OutboundLink")],1),e._v("，哪吒感谢大家的阅读")])]),e._v(" "),i("img",{attrs:{align:"right",width:"100",src:"https://cdn.jsdelivr.net/gh/YunYouJun/yun/images/yun-alpha-compressed.png"}}),e._v(" "),i("h2",{attrs:{id:"字符流"}},[i("a",{staticClass:"header-anchor",attrs:{href:"#字符流"}},[e._v("#")]),e._v(" 字符流")]),e._v(" "),i("p",[i("img",{attrs:{src:r(519),alt:"img_3.png"}})]),e._v(" "),i("p",[e._v("字符流是一种用于读取和写入字符数据的输入输出流。与字节流不同，字符流以字符为单位读取和写入数据，而不是以字节为单位。常用来处理文本信息。")]),e._v(" "),i("p",[e._v("如果用字节流直接读取中文，可能会遇到乱码问题")]),e._v(" "),i("div",{staticClass:"language- extra-class"},[i("pre",{pre:!0,attrs:{class:"language-text"}},[i("code",[e._v('//FileInputStream为操作文件的字符输入流\nFileInputStream inputStream = new FileInputStream("a.txt");//内容为“aa是傻 X”\n\nint len;\nwhile ((len=inputStream.read())!=-1){\n    System.out.print((char)len);\n}\n')])])]),i("p",[e._v("字符流 = 字节流 + 编码表")]),e._v(" "),i("p",[e._v("01、字符输入流（Reader）")]),e._v(" "),i("p",[e._v("java.io.Reader是字符输入流的超类（父类），它定义了字符输入流的一些共性方法：")]),e._v(" "),i("ul",[i("li",[e._v("1、close()：关闭此流并释放与此流相关的系统资源。")]),e._v(" "),i("li",[e._v("2、read()：从输入流读取一个字符。")]),e._v(" "),i("li",[e._v("3、read(char[] cbuf)：从输入流中读取一些字符，并将它们存储到字符数组 cbuf中")])]),e._v(" "),i("p",[e._v("FileReader 是 Reader 的子类，用于从文件中读取字符数据。它的主要特点如下：")]),e._v(" "),i("p",[e._v("可以通过构造方法指定要读取的文件路径。")]),e._v(" "),i("p",[e._v("每次可以读取一个或多个字符。")]),e._v(" "),i("p",[e._v("可以读取 Unicode 字符集中的字符，通过指定字符编码来实现字符集的转换。")]),e._v(" "),i("p",[e._v("1）FileReader构造方法")]),e._v(" "),i("ul",[i("li",[e._v("1、FileReader(File file)：创建一个新的 FileReader，参数为File对象。")]),e._v(" "),i("li",[e._v("2、FileReader(String fileName)：创建一个新的 FileReader，参数为文件名。")])]),e._v(" "),i("div",{staticClass:"language- extra-class"},[i("pre",{pre:!0,attrs:{class:"language-text"}},[i("code",[e._v('// 使用File对象创建流对象\nFile file = new File("a.txt");\nFileReader fr = new FileReader(file);\n\n// 使用文件名称创建流对象\nFileReader fr = new FileReader("b.txt");\n')])])]),i("p",[e._v("2）FileReader读取字符数据")]),e._v(" "),i("p",[e._v("①、读取字符：read方法，每次可以读取一个字符，返回读取的字符（转为 int 类型），当读取到文件末尾时，返回-1。")]),e._v(" "),i("p",[e._v("②、读取指定长度的字符：read(char[] cbuf, int off, int len)，并将其存储到字符数组中。其中，cbuf 表示存储读取结果的字符数组，off 表示存储结果的起始位置，len 表示要读取的字符数。")]),e._v(" "),i("p",[e._v("02、字符输出流（Writer）")]),e._v(" "),i("p",[e._v("java.io.Writer 是字符输出流类的超类（父类），可以将指定的字符信息写入到目的地，来看它定义的一些共性方法：")]),e._v(" "),i("ul",[i("li",[e._v("1、write(int c) 写入单个字符。")]),e._v(" "),i("li",[e._v("2、write(char[] cbuf) 写入字符数组。")]),e._v(" "),i("li",[e._v("3、write(char[] cbuf, int off, int len) 写入字符数组的一部分，off为开始索引，len为字符个数。")]),e._v(" "),i("li",[e._v("4、write(String str) 写入字符串。")]),e._v(" "),i("li",[e._v("5、write(String str, int off, int len) 写入字符串的某一部分，off 指定要写入的子串在 str 中的起始位置，len 指定要写入的子串的长度。")]),e._v(" "),i("li",[e._v("6、flush() 刷新该流的缓冲。")]),e._v(" "),i("li",[e._v("7、close() 关闭此流，但要先刷新它。")])]),e._v(" "),i("p",[e._v("java.io.FileWriter 类是 Writer 的子类，用来将字符写入到文件。")]),e._v(" "),i("p",[e._v("1）FileWriter 构造方法")]),e._v(" "),i("ol",[i("li",[e._v("FileWriter(File file)： 创建一个新的 FileWriter，参数为要读取的File对象。")]),e._v(" "),i("li",[e._v("FileWriter(String fileName)： 创建一个新的 FileWriter，参数为要读取的文件的名称。")])]),e._v(" "),i("p",[e._v("2）FileWriter写入数据")]),e._v(" "),i("p",[e._v("①、写入字符：write(int b) 方法，每次可以写出一个字符")]),e._v(" "),i("p",[e._v("②、写入字符数组：write(char[] cbuf) 方法，将指定字符数组写入输出流。")]),e._v(" "),i("p",[e._v("③、写入指定字符数组：write(char[] cbuf, int off, int len) 方法，将指定字符数组的一部分写入输出流。")]),e._v(" "),i("p",[e._v("④、写入字符串：write(String str) 方法，将指定字符串写入输出流。")]),e._v(" "),i("p",[e._v("⑤、写入指定字符串：write(String str, int off, int len) 方法，将指定字符串的一部分写入输出流。")]),e._v(" "),i("p",[e._v("3）关闭close和刷新flush")]),e._v(" "),i("p",[e._v("因为 FileWriter 内置了缓冲区 ByteBuffer，所以如果不关闭输出流，就无法把字符写入到文件中。")]),e._v(" "),i("p",[e._v("但是关闭了流对象，就无法继续写数据了。如果我们既想写入数据，又想继续使用流，就需要 flush 方法了。")]),e._v(" "),i("p",[e._v("flush ：刷新缓冲区，流对象可以继续使用。")]),e._v(" "),i("p",[e._v("close ：先刷新缓冲区，然后通知系统释放资源。流对象不可以再被使用了。")]),e._v(" "),i("p",[e._v("4）FileWriter的续写和换行")]),e._v(" "),i("p",[e._v("5）文本文件复制")]),e._v(" "),i("p",[e._v("Writer 和 Reader 是 Java I/O 中用于字符输入输出的抽象类，它们提供了一系列方法用于读取和写入字符数据。它们的区别在于 Writer 用于将字符数据写入到输出流中，而 Reader 用于从输入流中读取字符数据。")]),e._v(" "),i("p",[e._v("Writer 和 Reader 的常用子类有 FileWriter、FileReader，可以将字符流写入和读取到文件中。")]),e._v(" "),i("p",[e._v("在使用 Writer 和 Reader 进行字符输入输出时，需要注意字符编码的问题。")])])}),[],!1,null,null,null);i.default=v.exports}}]);