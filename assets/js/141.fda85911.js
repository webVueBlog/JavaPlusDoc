(window.webpackJsonp=window.webpackJsonp||[]).push([[141],{781:function(t,e,a){"use strict";a.r(e);var n=a(2),r=Object(n.a)({},(function(){var t=this,e=t._self._c;return e("ContentSlotsDistributor",{attrs:{"slot-key":t.$parent.slotKey}},[e("blockquote",[e("p",[t._v("点击勘误"),e("a",{attrs:{href:"https://github.com/webVueBlog/JavaPlusDoc/issues",target:"_blank",rel:"noopener noreferrer"}},[t._v("issues"),e("OutboundLink")],1),t._v("，哪吒感谢大家的阅读")])]),t._v(" "),e("img",{attrs:{align:"right",width:"100",src:"https://cdn.jsdelivr.net/gh/YunYouJun/yun/images/yun-alpha-compressed.png"}}),t._v(" "),e("h2",{attrs:{id:"字节流"}},[e("a",{staticClass:"header-anchor",attrs:{href:"#字节流"}},[t._v("#")]),t._v(" 字节流")]),t._v(" "),e("p",[t._v("我们必须得明确一点，一切文件（文本、视频、图片）的数据都是以二进制的形式存储的，传输时也是。所以，字节流可以传输任意类型的文件数据。")]),t._v(" "),e("h3",{attrs:{id:"字节输出流-outputstream"}},[e("a",{staticClass:"header-anchor",attrs:{href:"#字节输出流-outputstream"}},[t._v("#")]),t._v(" 字节输出流（OutputStream）")]),t._v(" "),e("p",[t._v("java.io.OutputStream 是字节输出流的超类（父类），我们来看一下它定义的一些共性方法：")]),t._v(" "),e("p",[t._v("1、 close() ：关闭此输出流并释放与此流相关联的系统资源。")]),t._v(" "),e("p",[t._v("2、 flush() ：刷新此输出流并强制缓冲区的字节被写入到目的地。")]),t._v(" "),e("p",[t._v("3、 write(byte[] b)：将 b.length 个字节从指定的字节数组写入此输出流。")]),t._v(" "),e("p",[t._v("4、 write(byte[] b, int off, int len) ：从指定的字节数组写入 len 字节到此输出流，从偏移量 off开始。 也就是说从off个字节数开始一直到len个字节结束")]),t._v(" "),e("h3",{attrs:{id:"fileoutputstream类"}},[e("a",{staticClass:"header-anchor",attrs:{href:"#fileoutputstream类"}},[t._v("#")]),t._v(" FileOutputStream类")]),t._v(" "),e("p",[t._v("OutputStream 有很多子类，我们从最简单的一个子类 FileOutputStream 开始。看名字就知道是文件输出流，用于将数据写入到文件。")]),t._v(" "),e("p",[t._v("1）FileOutputStream 的构造方法")]),t._v(" "),e("p",[t._v("1、使用文件名创建 FileOutputStream 对象。")]),t._v(" "),e("div",{staticClass:"language- extra-class"},[e("pre",{pre:!0,attrs:{class:"language-text"}},[e("code",[t._v('String fileName = "example.txt";\nFileOutputStream fos = new FileOutputStream(fileName);\n')])])]),e("p",[t._v('以上代码使用文件名 "example.txt" 创建一个 FileOutputStream 对象，将数据写入到该文件中。如果文件不存在，则创建一个新文件；如果文件已经存在，则覆盖原有文件。')]),t._v(" "),e("p",[t._v("2、使用文件对象创建 FileOutputStream 对象。")]),t._v(" "),e("div",{staticClass:"language- extra-class"},[e("pre",{pre:!0,attrs:{class:"language-text"}},[e("code",[t._v('File file = new File("example.txt");\nFileOutputStream fos = new FileOutputStream(file);\n')])])]),e("p",[t._v("2）FileOutputStream 写入字节数据")]),t._v(" "),e("p",[t._v("使用 FileOutputStream 写入字节数据主要通过 write 方法：")]),t._v(" "),e("div",{staticClass:"language- extra-class"},[e("pre",{pre:!0,attrs:{class:"language-text"}},[e("code",[t._v("write(int b)\nwrite(byte[] b)\nwrite(byte[] b,int off,int len)  //从`off`索引开始，`len`个字节\n")])])]),e("p",[t._v("①、写入字节：write(int b) 方法，每次可以写入一个字节")]),t._v(" "),e("p",[t._v("②、写入字节数组：write(byte[] b)")]),t._v(" "),e("p",[t._v("③、写入指定长度字节数组：write(byte[] b, int off, int len)")]),t._v(" "),e("div",{staticClass:"language- extra-class"},[e("pre",{pre:!0,attrs:{class:"language-text"}},[e("code",[t._v('String fileName = "example.txt";\nboolean append = true;\nFileOutputStream fos = new FileOutputStream(fileName, append);\n')])])]),e("div",{staticClass:"language- extra-class"},[e("pre",{pre:!0,attrs:{class:"language-text"}},[e("code",[t._v('// 使用文件名称创建流对象\nFileOutputStream fos = new FileOutputStream("fos.txt",true);     \n// 字符串转换为字节数组\nbyte[] b = "abcde".getBytes();\n// 写出从索引2开始，2个字节。索引2是c，两个字节，也就是cd。\nfos.write(b);\n// 关闭资源\nfos.close();\n\n\n')])])]),e("h3",{attrs:{id:"字节输入流-inputstream"}},[e("a",{staticClass:"header-anchor",attrs:{href:"#字节输入流-inputstream"}},[t._v("#")]),t._v(" 字节输入流（InputStream）")]),t._v(" "),e("p",[t._v("java.io.InputStream 是字节输入流的超类（父类），我们来看一下它的一些共性方法：")]),t._v(" "),e("p",[t._v("1、close() ：关闭此输入流并释放与此流相关的系统资源。")]),t._v(" "),e("p",[t._v("2、int read()： 从输入流读取数据的下一个字节。")]),t._v(" "),e("p",[t._v("3、read(byte[] b)： 该方法返回的 int 值代表的是读取了多少个字节，读到几个返回几个，读取不到返回-1")]),t._v(" "),e("h3",{attrs:{id:"fileinputstream类"}},[e("a",{staticClass:"header-anchor",attrs:{href:"#fileinputstream类"}},[t._v("#")]),t._v(" FileInputStream类")]),t._v(" "),e("p",[t._v("InputStream 有很多子类，我们从最简单的一个子类 FileInputStream 开始。看名字就知道是文件输入流，用于将数据从文件中读取数据。")]),t._v(" "),e("h3",{attrs:{id:"_1-fileinputstream的构造方法"}},[e("a",{staticClass:"header-anchor",attrs:{href:"#_1-fileinputstream的构造方法"}},[t._v("#")]),t._v(" 1）FileInputStream的构造方法")]),t._v(" "),e("p",[t._v("1、FileInputStream(String name)：创建一个 FileInputStream 对象，并打开指定名称的文件进行读取。文件名由 name 参数指定。如果文件不存在，将会抛出 FileNotFoundException 异常。")]),t._v(" "),e("p",[t._v("2、FileInputStream(File file)：创建一个 FileInputStream 对象，并打开指定的 File 对象表示的文件进行读取。")]),t._v(" "),e("div",{staticClass:"language- extra-class"},[e("pre",{pre:!0,attrs:{class:"language-text"}},[e("code",[t._v('// 创建一个 FileInputStream 对象\nFileInputStream fis = new FileInputStream("test.txt");\n\n// 读取文件内容\nint data;\nwhile ((data = fis.read()) != -1) {\n    System.out.print((char) data);\n}\n\n// 关闭输入流\nfis.close();\n')])])]),e("h3",{attrs:{id:"_2-fileinputstream读取字节数据"}},[e("a",{staticClass:"header-anchor",attrs:{href:"#_2-fileinputstream读取字节数据"}},[t._v("#")]),t._v(" 2）FileInputStream读取字节数据")]),t._v(" "),e("p",[t._v("①、读取字节：read()方法会读取一个字节并返回其整数表示。如果已经到达文件的末尾，则返回 -1。如果在读取时发生错误，则会抛出 IOException 异常。")]),t._v(" "),e("p",[t._v("②、使用字节数组读取：read(byte[] b) 方法会从输入流中最多读取 b.length 个字节，并将它们存储到缓冲区数组 b 中。")]),t._v(" "),e("p",[t._v("3）字节流FileInputstream复制图片")]),t._v(" "),e("p",[t._v("原理很简单，就是把图片信息读入到字节输入流中，再通过字节输出流写入到文件中。")]),t._v(" "),e("div",{staticClass:"language- extra-class"},[e("pre",{pre:!0,attrs:{class:"language-text"}},[e("code",[t._v('// 创建一个 FileInputStream 对象以读取原始图片文件\nFileInputStream fis = new FileInputStream("original.jpg");\n\n// 创建一个 FileOutputStream 对象以写入复制后的图片文件\nFileOutputStream fos = new FileOutputStream("copy.jpg");\n\n// 创建一个缓冲区数组以存储读取的数据\nbyte[] buffer = new byte[1024];\nint count;\n\n// 读取原始图片文件并将数据写入复制后的图片文件\nwhile ((count = fis.read(buffer)) != -1) {\n    fos.write(buffer, 0, count);\n}\n\n// 关闭输入流和输出流\nfis.close();\nfos.close();\n')])])])])}),[],!1,null,null,null);e.default=r.exports}}]);