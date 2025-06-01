---
title: 字节数组
author: 哪吒
date: '2020-01-01'
---

> 点击勘误[issues](https://github.com/webVueBlog/JavaPlusDoc/issues)，哪吒感谢大家的阅读

<img align="right" width="100" src="https://cdn.jsdelivr.net/gh/YunYouJun/yun/images/yun-alpha-compressed.png">

## 字节数组

数： int i —— 要转换的整数。

步骤：

1. 创建一个长度为 4 的字节数组 targets，用来存储转换后的字节。
2. 按照从低字节到高字节的顺序，将整数的每个字节填充到数组中：
3. `targets[3]` 存储最低位字节（8 位），通过 i & 0xFF 获取。
4. `targets[2]` 存储次低位字节，使用 i >> 8 & 0xFF 右移 8 位后获取。
5. `targets[1]` 存储次高位字节，使用 i >> 16 & 0xFF 右移 16 位后获取。
6. `targets[0]` 存储最高位字节，使用 i >> 24 & 0xFF 右移 24 位后获取。
7. 返回字节数组 targets。

示例：

假设我们有一个整数 i = 305419896（对应的十六进制表示是 0x12345678）。

调用 intToByte4(305419896) 时的转换过程：

305419896 十进制等于 0x12345678 十六进制。

将 0x12345678 转换为字节数组：

1. `targets[3] = (byte) (0x12345678 & 0xFF) = 0x7`8（最低位字节）
2. `targets[2] = (byte) (0x12345678 >> 8 & 0xFF) = 0x56`
3. `targets[1] = (byte) (0x12345678 >> 16 & 0xFF) = 0x34`
4. `targets[0] = (byte) (0x12345678 >> 24 & 0xFF) = 0x12`（最高位字节）
5. 所以返回的字节数组为：`[0x12, 0x34, 0x56, 0x78]`

```java
public class Main {
    public static void main(String[] args) {
        int i = 305419896; // 整数 305419896 (0x12345678)
        byte[] byteArray = intToByte4(i);
        
        // 输出字节数组
        System.out.println("Byte array: ");
        for (byte b : byteArray) {
            System.out.printf("0x%02X ", b);
        }
    }
    
    public static byte[] intToByte4(int i) {
        byte[] targets = new byte[4];
        targets[3] = (byte) (i & 0xFF);  
        targets[2] = (byte) (i >> 8 & 0xFF);  
        targets[1] = (byte) (i >> 16 & 0xFF);  
        targets[0] = (byte) (i >> 24 & 0xFF);  
        return targets;
    }
}


```

```
Byte array:
0x12 0x34 0x56 0x78 

```

0xFF 是一个十六进制表示法，代表一个 8 位的二进制数，其值为 11111111。它通常用于按位操作，尤其是在取整数的低 8 位时非常有用。

十六进制解释：

1. 0x 表示后面的数是十六进制数。
2. FF 是十六进制表示的数字，它等于 255，十进制形式。

二进制表示：

1. 0xFF 的二进制表示是 11111111。
2. 它相当于 8 个 1，即全 1 的二进制数。

