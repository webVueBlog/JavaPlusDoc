---
title: Java基本数据类型
author: 哪吒
date: '2020-01-01'
---

> 点击勘误[issues](https://github.com/webVueBlog/JavaPlusDoc/issues)，哪吒感谢大家的阅读

## Java基本数据类型

Java 中的数据类型可分为 2 种：

1）基本数据类型。

基本数据类型是 Java 语言操作数据的基础，包括 boolean、char、byte、short、int、long、float 和 double，共 8 种。

2）引用数据类型。

除了基本数据类型以外的类型，都是所谓的引用类型。常见的有数组、class（也就是类），以及接口（指向的是实现接口的类的对象）。

变量可以分为局部变量、成员变量、静态变量。

当变量是局部变量的时候，必须得先初始化，否则编译器不允许你使用它。

当变量是成员变量或者静态变量时，可以不进行初始化，它们会有一个默认值。

那不同的基本数据类型，是有不同的默认值和占用大小的

数据类型	默认值	大小
boolean	false	不确定
char	'\u0000'	2 字节
byte	0	1 字节
short	0	2 字节
int	0	4 字节
long	0L	8 字节
float	0.0f	4 字节
double	0.0	8 字节

1）bit（比特）

比特作为信息技术的最基本存储单位，非常小

大家都知道，计算机是以二进制存储数据的，二进制的一位，就是 1 比特，也就是说，比特要么为 0 要么为 1。

2）Byte（字节）

通常来说，一个英文字符是一个字节，一个中文字符是两个字节。字节与比特的换算关系是：1 字节 = 8 比特。

布尔（boolean）仅用于存储两个值：true 和 false，也就是真和假，通常用于条件的判断。

根据 Java 语言规范，boolean 类型只有两个值 true 和 false，但在语言层面，Java 没有明确规定 boolean 类型的大小。

一个字节可以表示 2^8 = 256 个不同的值。由于 byte 是有符号的，它的值可以是负数或正数，其取值范围是 -128 到 127（包括 -128 和 127）。

在网络传输、大文件读写时，为了节省空间，常用字节来作为数据的传输方式。

short 的取值范围在 -32,768 和 32,767 之间，包含 32,767。

实际开发中，short 比较少用，整型用 int 就 OK。

int 的取值范围在 -2,147,483,648（-2 ^ 31）和 2,147,483,647（2 ^ 31 -1）（含）之间。如果没有特殊需求，整型数据就用 int。

为什么 32 位的有符号整数的取值范围是从 -2^31 到 2^31 - 1 呢？

这是因为其中一位用于表示符号（正或负），剩下的 31 位用于表示数值，这意味着其范围是 -2,147,483,648（即 -2^31）到 2,147,483,647（即 2^31 - 1）。

在二进制系统中，每个位（bit）可以表示两个状态，通常是 0 和 1。对于 32 位得正二进制数，除去符号位，从右到左的每一位分别代表 2^0, 2^1, 2^2, ..., 2^30，这个二进制数转换为十进制就是 2^0 + 2^1 + 2^2 + ... + 2^30，也就是 2,147,483,647。

long 的取值范围在 -9,223,372,036,854,775,808(-2^63) 和 9,223,372,036,854,775,807(2^63 -1)（含）之间。如果 int 存储不下，就用 long。

为了和 int 作区分，long 型变量在声明的时候，末尾要带上大写的“L”。不用小写的“l”，是因为小写的“l”容易和数字“1”混淆。

float 是单精度的浮点数（单精度浮点数的有效数字大约为 6 到 7 位），32 位（4 字节），遵循 IEEE 754（二进制浮点数算术标准），取值范围为 1.4E-45 到 3.4E+38。float 不适合用于精确的数值，比如说金额。

为了和 double 作区分，float 型变量在声明的时候，末尾要带上小写的“f”。不需要使用大写的“F”，是因为小写的“f”很容易辨别。

double 是双精度浮点数（双精度浮点数的有效数字大约为 15 到 17 位），占 64 位（8 字节），也遵循 IEEE 754 标准，取值范围大约 ±4.9E-324 到 ±1.7976931348623157E308。double 同样不适合用于精确的数值，比如说金额。

在进行金融计算或需要精确小数计算的场景中，可以使用 BigDecimal 类来避免浮点数舍入误差。BigDecimal 可以表示一个任意大小且精度完全准确的浮点数。

在实际开发中，如果不是特别大的金额（精确到 0.01 元，也就是一分钱），一般建议乘以 100 转成整型进行处理。

char 用于表示 Unicode 字符，占 16 位（2 字节）的存储空间，取值范围为 0 到 65,535。

注意，字符字面量应该用单引号（''）包围，而不是双引号（""），因为双引号表示字符串字面量。

单精度（single-precision）和双精度（double-precision）是指两种不同精度的浮点数表示方法。

单精度是这样的格式，1 位符号，8 位指数，23 位小数。

单精度浮点数通常占用 32 位（4 字节）存储空间。数值范围大约是 ±1.4E-45 到 ±3.4028235E38，精度大约为 6 到 9 位有效数字。

双精度是这样的格式，1 位符号，11 位指数，52 为小数。

双精度浮点数通常占用 64 位（8 字节）存储空间，数值范围大约是 ±4.9E-324 到 ±1.7976931348623157E308，精度大约为 15 到 17 位有效数字。

计算精度取决于小数位（尾数）。小数位越多，则能表示的数越大，那么计算精度则越高。

一个数由若干位数字组成，其中影响测量精度的数字称作有效数字，也称有效数位。有效数字指科学计算中用以表示一个浮点数精度的那些数字。一般地，指一个用小数形式表示的浮点数中，从第一个非零的数字算起的所有数字。如 1.24 和 0.00124 的有效数字都有 3 位。

以下是确定有效数字的一些基本规则：

- 非零数字总是有效的。
- 位于两个非零数字之间的零是有效的。
- 对于小数，从左侧开始的第一个非零数字之前的零是无效的。
- 对于整数，从右侧开始的第一个非零数字之后的零是无效的。

下面是一些示例，说明如何确定有效数字：

- 1234：4 个有效数字（所有数字都是非零数字）
- 1002：4 个有效数字（零位于两个非零数字之间）
- 0.00234：3 个有效数字（从左侧开始的前两个零是无效的）
- 1200：2 个有效数字（从右侧开始的两个零是无效的）

int 和 char 之间比较特殊，可以互转

1）可以通过强制类型转换将整型 int 转换为字符 char。

2）可以使用 Character.forDigit() 方法将整型 int 转换为字符 char，参数 radix 为基数，十进制为 10，十六进制为 16。。

3）可以使用 int 的包装器类型 Integer 的 toString() 方法+String 的 charAt() 方法转成 char。

4）char 转 int

### 包装器类型

包装器类型（Wrapper Types）是 Java 中的一种特殊类型，用于将基本数据类型（如 int、float、char 等）转换为对应的对象类型。

Java 提供了以下包装器类型，与基本数据类型一一对应：

- Byte（对应 byte）
- Short（对应 short）
- Integer（对应 int）
- Long（对应 long）
- Float（对应 float）
- Double（对应 double）
- Character（对应 char）
- Boolean（对应 boolean）

基本数据类型在作为成员变量和静态变量的时候有默认值，引用数据类型也有的

引用数据类型的默认值为 null，包括数组和接口。

arrays 是一个 int 类型的数组，对吧？打印结果如下所示：

	[I@2d209079

[I 表示数组是 int 类型的，@ 后面是十六进制的 hashCode——这样的打印结果太“人性化”了，一般人表示看不懂！为什么会这样显示呢？查看一下 java.lang.Object 类的 toString() 方法就明白了。

数组虽然没有显式定义成一个类，但它的确是一个对象，继承了祖先类 Object 的所有方法。

### 基本数据类型和引用数据类型之间最大的差别。

基本数据类型：

	1、变量名指向具体的数值。
	2、基本数据类型存储在栈上。

引用数据类型：

	1、变量名指向的是存储对象的内存地址，在栈上。
	2、内存地址指向的对象存储在堆上。

### “堆是什么，栈又是什么？”

堆是堆（heap），栈是栈（stack），如果看到“堆栈”的话，请不要怀疑自己，那是翻译的错，堆栈也是栈，反正我很不喜欢“堆栈”这种叫法，容易让新人掉坑里。

堆是在程序运行时在内存中申请的空间（可理解为动态的过程）；切记，不是在编译时；因此，Java 中的对象就放在这里，这样做的好处就是：

当需要一个对象时，只需要通过 new 关键字写一行代码即可，当执行这行代码时，会自动在内存的“堆”区分配空间——这样就很灵活。

栈，能够和处理器（CPU，也就是脑子）直接关联，因此访问速度更快。既然访问速度快，要好好利用啊！Java 就把对象的引用放在栈里。为什么呢？因为引用的使用频率高吗？

不是的，因为 Java 在编译程序时，必须明确的知道存储在栈里的东西的生命周期，否则就没法释放旧的内存来开辟新的内存空间存放引用——空间就那么大，前浪要把后浪拍死在沙滩上啊。

涉及到字符串常量池