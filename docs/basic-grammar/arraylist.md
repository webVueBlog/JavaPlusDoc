---
title: ArrayList详解
author: 哪吒
date: '2020-01-01'
---

> 点击勘误[issues](https://github.com/webVueBlog/JavaPlusDoc/issues)，哪吒感谢大家的阅读

<img align="right" width="100" src="https://cdn.jsdelivr.net/gh/YunYouJun/yun/images/yun-alpha-compressed.png">

## ArrayList详解

ArrayList 实现了 List 接口，并且是基于数组实现的。

数组的大小是固定的，一旦创建的时候指定了大小，就不能再调整了。也就是说，如果数组满了，就不能再添加任何元素了。ArrayList 在数组的基础上实现了自动扩容，并且提供了比数组更丰富的预定义方法（各种增删改查），非常灵活。

Java 这门编程语言和别的编程语言，比如说 C语言的不同之处就在这里，如果是 C语言的话，你就必须得动手实现自己的 ArrayList，原生的库函数里面是没有的。

### 01、创建 ArrayList

```html
ArrayList<String> alist = new ArrayList<String>();

List<String> alist = new ArrayList<>();

List<String> alist = new ArrayList<>(20);
```

### 02、向 ArrayList 中添加元素

可以通过 add() 方法向 ArrayList 中添加一个元素。

```
堆栈过程图示：
add(element)
└── if (size == elementData.length) // 判断是否需要扩容
    ├── grow(minCapacity) // 扩容
    │   └── newCapacity = oldCapacity + (oldCapacity >> 1) // 计算新的数组容量
    │   └── Arrays.copyOf(elementData, newCapacity) // 创建新的数组
    ├── elementData[size++] = element; // 添加新元素
    └── return true; // 添加成功
```

```
/**
 * 将指定元素添加到 ArrayList 的末尾
 * @param e 要添加的元素
 * @return 添加成功返回 true
 */
public boolean add(E e) {
    ensureCapacityInternal(size + 1);  // 确保 ArrayList 能够容纳新的元素
    elementData[size++] = e; // 在 ArrayList 的末尾添加指定元素
    return true;
}

/**
 * 确保 ArrayList 能够容纳指定容量的元素
 * @param minCapacity 指定容量的最小值
 */
private void ensureCapacityInternal(int minCapacity) {
    if (elementData == DEFAULTCAPACITY_EMPTY_ELEMENTDATA) { // 如果 elementData 还是默认的空数组
        minCapacity = Math.max(DEFAULT_CAPACITY, minCapacity); // 使用 DEFAULT_CAPACITY 和指定容量的最小值中的较大值
    }

    ensureExplicitCapacity(minCapacity); // 确保容量能够容纳指定容量的元素
}

/**
 * 检查并确保集合容量足够，如果需要则增加集合容量。
 *
 * @param minCapacity 所需最小容量
 */
private void ensureExplicitCapacity(int minCapacity) {
    // 检查是否超出了数组范围，确保不会溢出
    if (minCapacity - elementData.length > 0)
        // 如果需要增加容量，则调用 grow 方法
        grow(minCapacity);
}

/**
 * 扩容 ArrayList 的方法，确保能够容纳指定容量的元素
 * @param minCapacity 指定容量的最小值
 */
private void grow(int minCapacity) {
    // 检查是否会导致溢出，oldCapacity 为当前数组长度
    int oldCapacity = elementData.length;
    int newCapacity = oldCapacity + (oldCapacity >> 1); // 扩容至原来的1.5倍
    if (newCapacity - minCapacity < 0) // 如果还是小于指定容量的最小值
        newCapacity = minCapacity; // 直接扩容至指定容量的最小值
    if (newCapacity - MAX_ARRAY_SIZE > 0) // 如果超出了数组的最大长度
        newCapacity = hugeCapacity(minCapacity); // 扩容至数组的最大长度
    // 将当前数组复制到一个新数组中，长度为 newCapacity
    elementData = Arrays.copyOf(elementData, newCapacity);
}
```

### 03、右移操作符

```
>> 是右移运算符，oldCapacity >> 1 相当于 oldCapacity 除以 2。

```

十进制的情况下，10 是基数，二进制的情况下，2 是基数。

10 在十进制的表示法是 0*10^0+1*10^1=0+10=10。

10 的二进制数是 1010，也就是 0*2^0 + 1*2^1 + 0*2^2 + 1*2^3=0+2+0+8=10。

然后是移位运算，移位分为左移和右移，在 Java 中，左移的运算符是 <<，右移的运算符 >>。

拿 oldCapacity >> 1 来说吧，>> 左边的是被移位的值，此时是 10，也就是二进制 1010；>> 右边的是要移位的位数，此时是 1。

1010 向右移一位就是 101，空出来的最高位此时要补 0，也就是 0101。

“那为什么不补 1 呢？”三妹这个问题很尖锐。

“因为是算术右移，并且是正数，所以最高位补 0；如果表示的是负数，就需要补 1。”我慢吞吞地回答道，“0101 的十进制就刚好是 1*2^0 + 0*2^1 + 1*2^2 + 0*2^3=1+0+4+0=5，如果多移几个数来找规律的话，就会发现，右移 1 位是原来的 1/2，右移 2 位是原来的 1/4，诸如此类。”

也就是说，ArrayList 的大小会扩容为原来的大小+原来大小/2，也就是 1.5 倍。


### 04、向 ArrayList 的指定位置添加元素

除了 add(E e) 方法，还可以通过 add(int index, E element) 方法把元素添加到 ArrayList 的指定位置：

add(int index, E element) 方法的源码如下：

```html
/**
 * 在指定位置插入一个元素。
 *
 * @param index   要插入元素的位置
 * @param element 要插入的元素
 * @throws IndexOutOfBoundsException 如果索引超出范围，则抛出此异常
 */
public void add(int index, E element) {
    rangeCheckForAdd(index); // 检查索引是否越界

    ensureCapacityInternal(size + 1);  // 确保容量足够，如果需要扩容就扩容
    System.arraycopy(elementData, index, elementData, index + 1,
            size - index); // 将 index 及其后面的元素向后移动一位
    elementData[index] = element; // 将元素插入到指定位置
    size++; // 元素个数加一
}
```

add(int index, E element)方法会调用到一个非常重要的本地方法 System.arraycopy()，它会对数组进行复制（要插入位置上的元素往后复制）。

这是 arraycopy() 的语法：

System.arraycopy(Object src, int srcPos, Object dest, int destPos, int length);

在 ArrayList.add(int index, E element) 方法中，具体用法如下：

System.arraycopy(elementData, index, elementData, index + 1, size - index);

- elementData：表示要复制的源数组，即 ArrayList 中的元素数组。
- index：表示源数组中要复制的起始位置，即需要将 index 及其后面的元素向后移动一位。
- elementData：表示要复制到的目标数组，即 ArrayList 中的元素数组。
- index + 1：表示目标数组中复制的起始位置，即将 index 及其后面的元素向后移动一位后，应该插入到的位置。
- size - index：表示要复制的元素个数，即需要将 index 及其后面的元素向后移动一位，需要移动的元素个数为 size - index。

### 05、更新 ArrayList 中的元素

可以使用 set() 方法来更改 ArrayList 中的元素，需要提供下标和新元素。

```
/**
 * 用指定元素替换指定位置的元素。
 *
 * @param index   要替换的元素的索引
 * @param element 要存储在指定位置的元素
 * @return 先前在指定位置的元素
 * @throws IndexOutOfBoundsException 如果索引超出范围，则抛出此异常
 */
public E set(int index, E element) {
    rangeCheck(index); // 检查索引是否越界

    E oldValue = elementData(index); // 获取原来在指定位置上的元素
    elementData[index] = element; // 将新元素替换到指定位置上
    return oldValue; // 返回原来在指定位置上的元素
}
```

### 06、删除 ArrayList 中的元素

remove(int index) 方法用于删除指定下标位置上的元素，remove(Object o) 方法用于删除指定值的元素。

```
/**
 * 删除指定位置的元素。
 *
 * @param index 要删除的元素的索引
 * @return 先前在指定位置的元素
 * @throws IndexOutOfBoundsException 如果索引超出范围，则抛出此异常
 */
public E remove(int index) {
    rangeCheck(index); // 检查索引是否越界

    E oldValue = elementData(index); // 获取要删除的元素

    int numMoved = size - index - 1; // 计算需要移动的元素个数
    if (numMoved > 0) // 如果需要移动元素，就用 System.arraycopy 方法实现
        System.arraycopy(elementData, index+1, elementData, index,
                numMoved);
    elementData[--size] = null; // 将数组末尾的元素置为 null，让 GC 回收该元素占用的空间

    return oldValue; // 返回被删除的元素
}
```

需要注意的是，在 ArrayList 中，删除元素时，需要将删除位置后面的元素向前移动一位，以填补删除位置留下的空缺。如果需要移动元素，则需要使用 System.arraycopy 方法将删除位置后面的元素向前移动一位。最后，将数组末尾的元素置为 null，以便让垃圾回收机制回收该元素占用的空间。

### 07、遍历 ArrayList 中的元素

如果要正序查找一个元素，可以使用 indexOf() 方法；如果要倒序查找一个元素，可以使用 lastIndexOf() 方法。

```
/**
 * 返回指定元素在列表中第一次出现的位置。
 * 如果列表不包含该元素，则返回 -1。
 *
 * @param o 要查找的元素
 * @return 指定元素在列表中第一次出现的位置；如果列表不包含该元素，则返回 -1
 */
public int indexOf(Object o) {
    if (o == null) { // 如果要查找的元素是 null
        for (int i = 0; i < size; i++) // 遍历列表
            if (elementData[i]==null) // 如果找到了 null 元素
                return i; // 返回元素的索引
    } else { // 如果要查找的元素不是 null
        for (int i = 0; i < size; i++) // 遍历列表
            if (o.equals(elementData[i])) // 如果找到了要查找的元素
                return i; // 返回元素的索引
    }
    return -1; // 如果找不到要查找的元素，则返回 -1
}
```

如果元素为 null 的时候使用“==”操作符，否则使用 equals() 方法。

lastIndexOf() 方法和 indexOf() 方法类似，不过遍历的时候从最后开始。

contains() 方法可以判断 ArrayList 中是否包含某个元素，其内部就是通过 indexOf() 方法实现的：

```
public boolean contains(Object o) {
    return indexOf(o) >= 0;
}
```


## 08、二分查找法

如果 ArrayList 中的元素是经过排序的，就可以使用二分查找法，效率更快。

Collections 类的 sort() 方法可以对 ArrayList 进行排序，该方法会按照字母顺序对 String 类型的列表进行排序。如果是自定义类型的列表，还可以指定 Comparator 进行排序。

```
List<String> copy = new ArrayList<>(alist);
copy.add("a");
copy.add("c");
copy.add("b");
copy.add("d");

Collections.sort(copy);
System.out.println(copy);

[a, b, c, d]
```

排序后就可以使用二分查找法了：

```
int index = Collections.binarySearch(copy, "b");

```


### 09、ArrayList增删改查时的时间复杂度

1）查询

时间复杂度为 O(1)，因为 ArrayList 内部使用数组来存储元素，所以可以直接根据索引来访问元素。

2）插入

添加一个元素（调用 add() 方法时）的时间复杂度最好情况为 O(1)，最坏情况为 O(n)。

- 如果在列表末尾添加元素，时间复杂度为 O(1)。
- 如果要在列表的中间或开头插入元素，则需要将插入位置之后的元素全部向后移动一位，时间复杂度为 O(n)。

3）删除

删除一个元素（调用 remove(Object) 方法时）的时间复杂度最好情况 O(1)，最坏情况 O(n)。

- 如果要删除列表末尾的元素，时间复杂度为 O(1)。
- 如果要删除列表中间或开头的元素，则需要将删除位置之后的元素全部向前移动一位，时间复杂度为 O(n)。

4）修改

修改一个元素（调用 set()方法时）与查询操作类似，可以直接根据索引来访问元素，时间复杂度为 O(1)。


### 10、总结

ArrayList，如果有个中文名的话，应该叫动态数组，也就是可增长的数组，可调整大小的数组。动态数组克服了静态数组的限制，静态数组的容量是固定的，只能在首次创建的时候指定。而动态数组会随着元素的增加自动调整大小，更符合实际的开发需求。

