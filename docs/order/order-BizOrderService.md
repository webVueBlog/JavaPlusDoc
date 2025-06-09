---
title: 订单流程
author: 哪吒
date: '2020-01-01'
---

> 点击勘误[issues](https://github.com/webVueBlog/JavaPlusDoc/issues)，哪吒感谢大家的阅读

<img align="right" width="100" src="https://cdn.jsdelivr.net/gh/YunYouJun/yun/images/yun-alpha-compressed.png">

## 订单流程

```java
// 预支付订单缓存键 "pre_pay_order:";
// 预优惠券缓存键 "pre_coupon:";

    // 超过多少天未支付，则视为逾期 overdueThr;
    // 逾期支付的标准天数 payStd;
    // 逾期支付的标准金额 12 amount;
    // 改变批量费用规则的数量限制 0.5 countLimit;
```

```java
    static BlockingQueue blockingQueue = new LinkedBlockingQueue<>(100); //同一时间队列等待数最大超过100时，判定异常，允许抛出
    // 创建一个固定大小的线程池，线程池的大小为当前可用处理器的数量，最大线程数为当前可用处理器的数量乘以4，线程空闲时间超过10秒则被回收
    static ExecutorService fixedThreadPool = new ThreadPoolExecutor(Runtime.getRuntime().availableProcessors(),
            Runtime.getRuntime().availableProcessors() * 4, 10, TimeUnit.SECONDS,
            blockingQueue,// 队列容量
            new ThreadFactory() { // 线程工厂
                // 定义一个原子整数，用于生成线程的编号
                private final AtomicInteger threadNumber = new AtomicInteger(1);
                // 定义线程的名称前缀
                private final String namePrefix = "xxxx"; // 分账处理
                // 重写newThread方法，用于创建线程
                @Override
                public Thread newThread(Runnable r) {
                    // 创建线程，并设置线程的名称为前缀加上线程编号
                    Thread t = new Thread(r, namePrefix + threadNumber.getAndIncrement());
                    return t;
                }
            });
```

```java
/**
 * 获取预支付订单
 */
public BExchSvcOrder getCachePreOrderById(String orderId){ // 获取缓存中的预支付订单
}

// setRenewEndOrder 续上套餐 完结订单 续费订单新订单
public BExchSvcOrder setRenewEndOrder(BExchSvcOrder order,String dateTime) throws Exception {
    // 查询有无待生效订单,无则正常到期,有则续上套餐
    // 调用mongoPageQuery方法，查询待生效订单
    // 查询有无待生效订单:{}
    if (CollUtil.isNotEmpty( "待生效订单" )) {
        // setEndOldOrder 完结旧订单 续费完结
        // updType (value = "修改事件标签 1普通事件2换电事件")
        // 然后更新订单 旧订单 结算状态:{},结算订单:{}
        // 续上待生效为新执行中订单
        // 服务到期时间
        // 生效订单加上上次次数，实际次数
        // 自动续租订单内容:{}
        // 自动续租状态:{},自动续租订单:{}
    }
}

// 订单退款
public RestRet orderRefund(OrderRefundBO orderRefundBO){
    // 获取订单
    // 创建订单对象
    // 实际费用 totalFee Double.parseDouble 退款金额 refundAmount 折扣金额/最终金额 discountA
    // 退款金额不能小于等于0
    // 退款金额大于可退款最高金额
    // 创建WXRefundRequest对象 退款请求
    // 设置退款类型 取消订单 余额退款 押金解冻/退款 订单退款,允许部分退款
    // 是否全额退款 0否,1是
    // 支付方式 默认1微信2支付宝3余额
    // 调用服务实现类 refundOfOrder
}

// 订单转让
public RestRet orderTransfer(BExchSvcOrderBO bExchSvcOrderBO) throws Exception { // 订单转让
    //
}
```

## BlockingQueue

```java
public interface BlockingQueue<E> extends Queue<E> { // 定义一个阻塞队列接口，继承自队列接口
    /**
     * 如果可以立即将指定元素插入此队列而不违反容量限制，则插入该元素，
     * 成功时返回{@code true}，如果当前没有可用空间，则抛出{@code IllegalStateException}。
     * 在使用容量受限的队列时，通常更倾向于使用{@link #offer(Object) offer}。
     *
     * @param e 要添加的元素
     * @return {@code true}（如{@link Collection#add}所指定）
     * @throws IllegalStateException 如果由于容量限制而无法在此时添加元素
     * @throws ClassCastException 如果指定元素的类阻止其被添加到此队列
     * @throws NullPointerException 如果指定元素为null
     * @throws IllegalArgumentException 如果指定元素的某些属性阻止其被添加到此队列
     */
    boolean add(E e); // 添加元素的方法

    /**
     * 如果可以立即将指定元素插入此队列而不违反容量限制，则插入该元素，
     * 成功时返回{@code true}，如果当前没有可用空间，则返回{@code false}。
     * 在使用容量受限的队列时，此方法通常比{@link #add}更可取，
     * 因为{@link #add}只能通过抛出异常来失败。
     *
     * @param e 要添加的元素
     * @return {@code true} 如果元素被添加到此队列，否则{@code false}
     * @throws ClassCastException 如果指定元素的类阻止其被添加到此队列
     * @throws NullPointerException 如果指定元素为null
     * @throws IllegalArgumentException 如果指定元素的某些属性阻止其被添加到此队列
     */
    boolean offer(E e); // 尝试添加元素的方法

    /**
     * 插入指定元素到此队列，如果必要，等待空间变得可用。
     *
     * @param e 要添加的元素
     * @throws InterruptedException 如果在等待时被中断
     * @throws ClassCastException 如果指定元素的类阻止其被添加到此队列
     * @throws NullPointerException 如果指定元素为null
     * @throws IllegalArgumentException 如果指定元素的某些属性阻止其被添加到此队列
     */
    void put(E e) throws InterruptedException; // 等待插入元素的方法

    /**
     * 插入指定元素到此队列，如果必要，等待最多指定的等待时间，
     * 直到空间变得可用。
     *
     * @param e 要添加的元素
     * @param timeout 等待放弃之前的时间，单位为{@code unit}
     * @param unit 一个{@code TimeUnit}，决定如何解释{@code timeout}参数
     * @return {@code true} 如果成功，或者{@code false} 如果在指定的等待时间内空间不可用
     * @throws InterruptedException 如果在等待时被中断
     * @throws ClassCastException 如果指定元素的类阻止其被添加到此队列
     * @throws NullPointerException 如果指定元素为null
     * @throws IllegalArgumentException 如果指定元素的某些属性阻止其被添加到此队列
     */
    boolean offer(E e, long timeout, TimeUnit unit) throws InterruptedException; // 带超时的尝试添加元素的方法

    /**
     * 检索并移除此队列的头部，如果必要，等待直到元素可用。
     *
     * @return 此队列的头部
     * @throws InterruptedException 如果在等待时被中断
     */
    E take() throws InterruptedException; // 获取并移除头部元素的方法

    /**
     * 检索并移除此队列的头部，如果必要，等待最多指定的等待时间，
     * 直到元素可用。
     *
     * @param timeout 等待放弃之前的时间，单位为{@code unit}
     * @param unit 一个{@code TimeUnit}，决定如何解释{@code timeout}参数
     * @return 此队列的头部，或者{@code null} 如果在指定的等待时间内没有元素可用
     * @throws InterruptedException 如果在等待时被中断
     */
    E poll(long timeout, TimeUnit unit) throws InterruptedException; // 带超时的获取并移除头部元素的方法

    /**
     * 返回此队列在没有内存或资源限制的情况下理想上可以接受的额外元素数量，
     * 如果没有内在限制，则返回{@code Integer.MAX_VALUE}。
     *
     * <p>注意，您<em>无法</em>通过检查{@code remainingCapacity}来判断插入元素是否会成功，
     * 因为可能有其他线程即将插入或移除元素。
     *
     * @return 剩余容量
     */
    int remainingCapacity(); // 返回剩余容量的方法

    /**
     * 从此队列中移除指定元素的单个实例（如果存在）。
     * 更正式地说，移除一个元素{@code e}，使得{@code o.equals(e)}，
     * 如果此队列包含一个或多个这样的元素。
     * 如果此队列包含指定元素（或者等价地，如果此队列因调用而发生变化），
     * 则返回{@code true}。
     *
     * @param o 要从此队列中移除的元素（如果存在）
     * @return {@code true} 如果此队列因调用而发生变化
     * @throws ClassCastException 如果指定元素的类与此队列不兼容
     *         （<a href="../Collection.html#optional-restrictions">可选</a>）
     * @throws NullPointerException 如果指定元素为null
     *         （<a href="../Collection.html#optional-restrictions">可选</a>）
     */
    boolean remove(Object o); // 移除指定元素的方法

    /**
     * 如果此队列包含指定元素，则返回{@code true}。
     * 更正式地说，仅当此队列至少包含一个元素{@code e}使得{@code o.equals(e)}时返回{@code true}。
     *
     * @param o 要检查是否包含在此队列中的对象
     * @return {@code true} 如果此队列包含指定元素
     * @throws ClassCastException 如果指定元素的类与此队列不兼容
     *         （<a href="../Collection.html#optional-restrictions">可选</a>）
     * @throws NullPointerException 如果指定元素为null
     *         （<a href="../Collection.html#optional-restrictions">可选</a>）
     */
    public boolean contains(Object o); // 检查队列中是否包含指定元素的方法

    /**
     * 从此队列中移除所有可用元素并将它们添加到给定集合中。
     * 此操作可能比重复轮询此队列更高效。
     * 在尝试将元素添加到集合{@code c}时遇到的失败可能导致元素
     * 同时存在于两个集合中，或者在抛出相关异常时都不在任何集合中。
     * 尝试将队列排空到自身会导致{@code IllegalArgumentException}。
     * 此外，如果在操作进行时修改了指定集合，则此操作的行为是未定义的。
     *
     * @param c 要转移元素到的集合
     * @return 转移的元素数量
     * @throws UnsupportedOperationException 如果指定集合不支持添加元素
     * @throws ClassCastException 如果此队列的元素类阻止其被添加到指定集合
     * @throws NullPointerException 如果指定集合为null
     * @throws IllegalArgumentException 如果指定集合是此队列，或者此队列的某个元素的属性阻止其被添加到指定集合
     */
    int drainTo(Collection<? super E> c); // 将所有可用元素转移到指定集合的方法

    /**
     * 从此队列中最多移除给定数量的可用元素并将它们添加到给定集合中。
     * 在尝试将元素添加到集合{@code c}时遇到的失败可能导致元素
     * 同时存在于两个集合中，或者在抛出相关异常时都不在任何集合中。
     * 尝试将队列排空到自身会导致{@code IllegalArgumentException}。
     * 此外，如果在操作进行时修改了指定集合，则此操作的行为是未定义的。
     *
     * @param c 要转移元素到的集合
     * @param maxElements 要转移的最大元素数量
     * @return 转移的元素数量
     * @throws UnsupportedOperationException 如果指定集合不支持添加元素
     * @throws ClassCastException 如果此队列的元素类阻止其被添加到指定集合
     * @throws NullPointerException 如果指定集合为null
     * @throws IllegalArgumentException 如果指定集合是此队列，或者此队列的某个元素的属性阻止其被添加到指定集合
     */
    int drainTo(Collection<? super E> c, int maxElements); // 将最多指定数量的元素转移到指定集合的方法
}
```

## LinkedBlockingQueue

```java
public class LinkedBlockingQueue<E> extends AbstractQueue<E> // 定义一个链表阻塞队列类，继承自抽象队列
        implements BlockingQueue<E>, java.io.Serializable { // 实现阻塞队列接口和可序列化接口
    private static final long serialVersionUID = -6903933977591709194L; // 序列化ID

    /*
     * "双锁队列"算法的变体。putLock控制插入（和offer）的进入，
     * 并具有一个与之相关的条件，用于等待插入。takeLock也是如此。
     * 它们都依赖的“计数”字段作为原子变量维护，以避免在大多数情况下
     * 需要获取两个锁。此外，为了最小化插入和取出锁的需求，
     * 使用级联通知。当一个插入操作注意到它启用了至少一个取出时，
     * 它会通知取出者。取出者反过来会通知其他人，如果在信号之后
     * 进入了更多项目。取出操作也会通知插入操作。
     * 
     * 写入者和读取者之间的可见性如下：
     * 
     * 每当一个元素被入队时，获取putLock并更新计数。
     * 随后的读取者通过获取putLock（通过fullyLock）
     * 或获取takeLock，然后读取n = count.get()来保证对入队节点的可见性；
     * 这给出了前n个项目的可见性。
     * 
     * 为了实现弱一致性迭代器，似乎我们需要保持所有节点
     * 从前驱出队节点可达。这会导致两个问题：
     * - 允许恶意迭代器导致无限内存保留
     * - 如果一个节点在存活时被晋升为老年代，导致跨代链接
     *   旧节点和新节点，代际GC对此处理困难，导致重复的重大收集。
     * 然而，只有未删除的节点需要从出队节点可达，
     * 可达性不一定必须是GC理解的那种。
     * 我们使用将刚刚出队的节点链接到自身的技巧。
     * 这样的自链接隐含地意味着向head.next推进。
     */

    /**
     * 链表节点类
     */
    static class Node<E> { // 定义节点类
        E item; // 节点存储的元素

        /**
         * 可能是：
         * - 真实的后继节点
         * - 该节点，意味着后继是head.next
         * - null，意味着没有后继（这是最后一个节点）
         */
        Node<E> next; // 指向下一个节点

        Node(E x) { item = x; } // 节点构造函数
    }

    /** 容量限制，如果没有则为Integer.MAX_VALUE */
    private final int capacity; // 队列的最大容量

    /** 当前元素数量 */
    private final AtomicInteger count = new AtomicInteger(); // 当前元素计数

    /**
     * 链表的头部。
     * 不变式：head.item == null
     */
    transient Node<E> head; // 链表头部节点

    /**
     * 链表的尾部。
     * 不变式：last.next == null
     */
    private transient Node<E> last; // 链表尾部节点

    /** 由take、poll等持有的锁 */
    private final ReentrantLock takeLock = new ReentrantLock(); // 取出操作的锁

    /** 等待取出的等待队列 */
    private final Condition notEmpty = takeLock.newCondition(); // 等待非空条件

    /** 由put、offer等持有的锁 */
    private final ReentrantLock putLock = new ReentrantLock(); // 插入操作的锁

    /** 等待插入的等待队列 */
    private final Condition notFull = putLock.newCondition(); // 等待非满条件

    /**
     * 通知等待的取出操作。仅从put/offer调用（否则不锁定takeLock）。
     */
    private void signalNotEmpty() { // 通知有元素可取
        final ReentrantLock takeLock = this.takeLock; // 获取取出锁
        takeLock.lock(); // 锁定
        try {
            notEmpty.signal(); // 通知等待的取出操作
        } finally {
            takeLock.unlock(); // 解锁
        }
    }

    /**
     * 通知等待的插入操作。仅从take/poll调用。
     */
    private void signalNotFull() { // 通知有空间可插入
        final ReentrantLock putLock = this.putLock; // 获取插入锁
        putLock.lock(); // 锁定
        try {
            notFull.signal(); // 通知等待的插入操作
        } finally {
            putLock.unlock(); // 解锁
        }
    }

    /**
     * 将节点链接到队列的末尾。
     *
     * @param node 节点
     */
    private void enqueue(Node<E> node) { // 将节点入队
        // assert putLock.isHeldByCurrentThread(); // 确保当前线程持有插入锁
        // assert last.next == null; // 确保最后一个节点的next为null
        last = last.next = node; // 将新节点链接到链表末尾
    }

    /**
     * 从队列头部移除一个节点。
     *
     * @return 移除的节点
     */
    private E dequeue() { // 将节点出队
        // assert takeLock.isHeldByCurrentThread(); // 确保当前线程持有取出锁
        // assert head.item == null; // 确保头部节点的item为null
        Node<E> h = head; // 获取头部节点
        Node<E> first = h.next; // 获取第一个实际节点
        h.next = h; // 帮助GC，清除头部节点的next引用
        head = first; // 更新头部节点
        E x = first.item; // 获取第一个节点的元素
        first.item = null; // 清除第一个节点的元素引用
        return x; // 返回出队的元素
    }

    /**
     * 锁定以防止同时进行插入和取出操作。
     */
    void fullyLock() { // 完全锁定
        putLock.lock(); // 锁定插入锁
        takeLock.lock(); // 锁定取出锁
    }

    /**
     * 解锁以允许同时进行插入和取出操作。
     */
    void fullyUnlock() { // 完全解锁
        takeLock.unlock(); // 解锁取出锁
        putLock.unlock(); // 解锁插入锁
    }

//     /**
//      * 告诉当前线程是否持有两个锁。
//      */
//     boolean isFullyLocked() {
//         return (putLock.isHeldByCurrentThread() &&
//                 takeLock.isHeldByCurrentThread());
//     }

    /**
     * 创建一个容量为{@link Integer#MAX_VALUE}的{@code LinkedBlockingQueue}。
     */
    public LinkedBlockingQueue() { // 默认构造函数
        this(Integer.MAX_VALUE); // 调用带容量参数的构造函数
    }

    /**
     * 创建一个具有给定（固定）容量的{@code LinkedBlockingQueue}。
     *
     * @param capacity 此队列的容量
     * @throws IllegalArgumentException 如果{@code capacity}不大于零
     */
    public LinkedBlockingQueue(int capacity) { // 带容量参数的构造函数
        if (capacity <= 0) throw new IllegalArgumentException(); // 检查容量是否合法
        this.capacity = capacity; // 设置容量
        last = head = new Node<E>(null); // 初始化头部和尾部节点
    }

    /**
     * 创建一个容量为{@link Integer#MAX_VALUE}的{@code LinkedBlockingQueue}，
     * 初始包含给定集合的元素，
     * 按集合迭代器的遍历顺序添加。
     *
     * @param c 初始包含的元素集合
     * @throws NullPointerException 如果指定的集合或其任何元素为null
     */
    public LinkedBlockingQueue(Collection<? extends E> c) { // 带集合参数的构造函数
        this(Integer.MAX_VALUE); // 调用默认容量构造函数
        final ReentrantLock putLock = this.putLock; // 获取插入锁
        putLock.lock(); // 锁定
        try {
            int n = 0; // 计数器
            for (E e : c) { // 遍历集合
                if (e == null) // 检查元素是否为null
                    throw new NullPointerException();
                if (n == capacity) // 检查是否超过容量
                    throw new IllegalStateException("Queue full");
                enqueue(new Node<E>(e)); // 将元素入队
                ++n; // 增加计数
            }
            count.set(n); // 设置当前元素计数
        } finally {
            putLock.unlock(); // 解锁
        }
    }

    // 此文档注释被重写以删除对大于Integer.MAX_VALUE的集合的引用
    /**
     * 返回此队列中的元素数量。
     *
     * @return 此队列中的元素数量
     */
    public int size() { // 获取队列大小
        return count.get(); // 返回当前元素计数
    }

    // 此文档注释是修改后的副本，
    // 没有对无限队列的引用。
    /**
     * 返回此队列在没有内存或资源限制的情况下理想上可以接受的额外元素数量，
     * 这始终等于此队列的初始容量减去当前的{@code size}。
     *
     * <p>注意，您<em>无法</em>通过检查{@code remainingCapacity}来判断插入元素是否会成功，
     * 因为可能有其他线程即将插入或移除元素。
     */
    public int remainingCapacity() { // 获取剩余容量
        return capacity - count.get(); // 返回剩余容量
    }

    /**
     * 在此队列的尾部插入指定元素，如果必要，等待空间变得可用。
     *
     * @throws InterruptedException {@inheritDoc}
     * @throws NullPointerException {@inheritDoc}
     */
    public void put(E e) throws InterruptedException { // 插入元素的方法
        if (e == null) throw new NullPointerException(); // 检查元素是否为null
        // 注意：所有put/take等操作的约定是预设局部变量
        // 以负数表示失败，除非设置。
        int c = -1; // 初始化计数
        Node<E> node = new Node<E>(e); // 创建新节点
        final ReentrantLock putLock = this.putLock; // 获取插入锁
        final AtomicInteger count = this.count; // 获取当前计数
        putLock.lockInterruptibly(); // 可中断地锁定
        try {
            /*
             * 注意，计数在等待保护中使用，尽管它没有被锁保护。
             * 这是有效的，因为此时计数只能减少（所有其他插入都被锁定），
             * 如果它从容量变化，我们（或其他等待的插入）会被通知。
             * 对于其他等待保护中的计数的所有其他使用也是如此。
             */
            while (count.get() == capacity) { // 如果队列已满
                notFull.await(); // 等待直到有空间
            }
            enqueue(node); // 将节点入队
            c = count.getAndIncrement(); // 增加计数
            if (c + 1 < capacity) // 如果还有空间
                notFull.signal(); // 通知等待的插入操作
        } finally {
            putLock.unlock(); // 解锁
        }
        if (c == 0) // 如果之前队列为空
            signalNotEmpty(); // 通知有元素可取
    }

    /**
     * 在此队列的尾部插入指定元素，如果必要，等待最多指定的等待时间，
     * 直到空间变得可用。
     *
     * @return {@code true} 如果成功，或者{@code false} 如果
     *         指定的等待时间在空间可用之前到期
     * @throws InterruptedException {@inheritDoc}
     * @throws NullPointerException {@inheritDoc}
     */
    public boolean offer(E e, long timeout, TimeUnit unit) // 带超时的插入元素的方法
        throws InterruptedException {

        if (e == null) throw new NullPointerException(); // 检查元素是否为null
        long nanos = unit.toNanos(timeout); // 将超时转换为纳秒
        int c = -1; // 初始化计数
        final ReentrantLock putLock = this.putLock; // 获取插入锁
        final AtomicInteger count = this.count; // 获取当前计数
        putLock.lockInterruptibly(); // 可中断地锁定
        try {
            while (count.get() == capacity) { // 如果队列已满
                if (nanos <= 0) // 如果超时
                    return false; // 返回失败
                nanos = notFull.awaitNanos(nanos); // 等待纳秒
            }
            enqueue(new Node<E>(e)); // 将节点入队
            c = count.getAndIncrement(); // 增加计数
            if (c + 1 < capacity) // 如果还有空间
                notFull.signal(); // 通知等待的插入操作
        } finally {
            putLock.unlock(); // 解锁
        }
        if (c == 0) // 如果之前队列为空
            signalNotEmpty(); // 通知有元素可取
        return true; // 返回成功
    }

    /**
     * 如果可以立即将指定元素插入此队列而不超过队列的容量，
     * 则在此队列的尾部插入指定元素，成功时返回{@code true}，
     * 如果此队列已满，则返回{@code false}。
     * 在使用容量受限的队列时，此方法通常比{@link BlockingQueue#add add}方法更可取，
     * 后者只能通过抛出异常来失败。
     *
     * @throws NullPointerException 如果指定元素为null
     */
    public boolean offer(E e) { // 尝试立即插入元素的方法
        if (e == null) throw new NullPointerException(); // 检查元素是否为null
        final AtomicInteger count = this.count; // 获取当前计数
        if (count.get() == capacity) // 如果队列已满
            return false; // 返回失败
        int c = -1; // 初始化计数
        Node<E> node = new Node<E>(e); // 创建新节点
        final ReentrantLock putLock = this.putLock; // 获取插入锁
        putLock.lock(); // 锁定
        try {
            if (count.get() < capacity) { // 如果还有空间
                enqueue(node); // 将节点入队
                c = count.getAndIncrement(); // 增加计数
                if (c + 1 < capacity) // 如果还有空间
                    notFull.signal(); // 通知等待的插入操作
            }
        } finally {
            putLock.unlock(); // 解锁
        }
        if (c == 0) // 如果之前队列为空
            signalNotEmpty(); // 通知有元素可取
        return c >= 0; // 返回是否成功
    }

    public E take() throws InterruptedException { // 获取并移除头部元素的方法
        E x; // 存储出队元素
        int c = -1; // 初始化计数
        final AtomicInteger count = this.count; // 获取当前计数
        final ReentrantLock takeLock = this.takeLock; // 获取取出锁
        takeLock.lockInterruptibly(); // 可中断地锁定
        try {
            while (count.get() == 0) { // 如果队列为空
                notEmpty.await(); // 等待直到有元素可取
            }
            x = dequeue(); // 出队元素
            c = count.getAndDecrement(); // 减少计数
            if (c > 1) // 如果还有元素
                notEmpty.signal(); // 通知等待的取出操作
        } finally {
            takeLock.unlock(); // 解锁
        }
        if (c == capacity) // 如果之前队列已满
            signalNotFull(); // 通知有空间可插入
        return x; // 返回出队的元素
    }

    public E poll(long timeout, TimeUnit unit) throws InterruptedException { // 带超时的获取并移除头部元素的方法
        E x = null; // 存储出队元素
        int c = -1; // 初始化计数
        long nanos = unit.toNanos(timeout); // 将超时转换为纳秒
        final AtomicInteger count = this.count; // 获取当前计数
        final ReentrantLock takeLock = this.takeLock; // 获取取出锁
        takeLock.lockInterruptibly(); // 可中断地锁定
        try {
            while (count.get() == 0) { // 如果队列为空
                if (nanos <= 0) // 如果超时
                    return null; // 返回null
                nanos = notEmpty.awaitNanos(nanos); // 等待纳秒
            }
            x = dequeue(); // 出队元素
            c = count.getAndDecrement(); // 减少计数
            if (c > 1) // 如果还有元素
                notEmpty.signal(); // 通知等待的取出操作
        } finally {
            takeLock.unlock(); // 解锁
        }
        if (c == capacity) // 如果之前队列已满
            signalNotFull(); // 通知有空间可插入
        return x; // 返回出队的元素
    }

    public E poll() { // 获取并移除头部元素的方法
        final AtomicInteger count = this.count; // 获取当前计数
        if (count.get() == 0) // 如果队列为空
            return null; // 返回null
        E x = null; // 存储出队元素
        int c = -1; // 初始化计数
        final ReentrantLock takeLock = this.takeLock; // 获取取出锁
        takeLock.lock(); // 锁定
        try {
            if (count.get() > 0) { // 如果队列不为空
                x = dequeue(); // 出队元素
                c = count.getAndDecrement(); // 减少计数
                if (c > 1) // 如果还有元素
                    notEmpty.signal(); // 通知等待的取出操作
            }
        } finally {
            takeLock.unlock(); // 解锁
        }
        if (c == capacity) // 如果之前队列已满
            signalNotFull(); // 通知有空间可插入
        return x; // 返回出队的元素
    }

    public E peek() { // 查看头部元素的方法
        if (count.get() == 0) // 如果队列为空
            return null; // 返回null
        final ReentrantLock takeLock = this.takeLock; // 获取取出锁
        takeLock.lock(); // 锁定
        try {
            Node<E> first = head.next; // 获取第一个实际节点
            if (first == null) // 如果没有节点
                return null; // 返回null
            else
                return first.item; // 返回头部元素
        } finally {
            takeLock.unlock(); // 解锁
        }
    }

    /**
     * 与前驱trail一起取消链接内部节点p。
     */
    void unlink(Node<E> p, Node<E> trail) { // 取消节点链接的方法
        // assert isFullyLocked(); // 确保当前线程持有两个锁
        // p.next未更改，以允许遍历p的迭代器保持其弱一致性保证。
        p.item = null; // 清除节点的元素引用
        trail.next = p.next; // 将前驱节点的next指向p的下一个节点
        if (last == p) // 如果p是最后一个节点
            last = trail; // 更新最后一个节点
        if (count.getAndDecrement() == capacity) // 如果计数减少到容量
            notFull.signal(); // 通知有空间可插入
    }

    /**
     * 从此队列中移除指定元素的单个实例（如果存在）。
     * 更正式地说，移除一个元素{@code e}，使得{@code o.equals(e)}，
     * 如果此队列包含一个或多个这样的元素。
     * 如果此队列包含指定元素（或者等价地，如果此队列因调用而发生变化），
     * 则返回{@code true}。
     *
     * @param o 要从此队列中移除的元素（如果存在）
     * @return {@code true} 如果此队列因调用而发生变化
     */
    public boolean remove(Object o) { // 移除指定元素的方法
        if (o == null) return false; // 检查元素是否为null
        fullyLock(); // 完全锁定
        try {
            for (Node<E> trail = head, p = trail.next; // 遍历链表
                 p != null;
                 trail = p, p = p.next) {
                if (o.equals(p.item)) { // 如果找到匹配的元素
                    unlink(p, trail); // 取消链接
                    return true; // 返回成功
                }
            }
            return false; // 返回失败
        } finally {
            fullyUnlock(); // 解锁
        }
    }

    /**
     * 返回{@code true}如果此队列包含指定元素。
     * 更正式地说，仅当此队列至少包含一个元素{@code e}使得{@code o.equals(e)}时返回{@code true}。
     *
     * @param o 要检查是否包含在此队列中的对象
     * @return {@code true} 如果此队列包含指定元素
     */
    public boolean contains(Object o) { // 检查队列中是否包含指定元素的方法
        if (o == null) return false; // 检查元素是否为null
        fullyLock(); // 完全锁定
        try {
            for (Node<E> p = head.next; p != null; p = p.next) // 遍历链表
                if (o.equals(p.item)) // 如果找到匹配的元素
                    return true; // 返回成功
            return false; // 返回失败
        } finally {
            fullyUnlock(); // 解锁
        }
    }

    /**
     * 返回一个数组，包含此队列中的所有元素，按正确的顺序。
     *
     * <p>返回的数组将是“安全的”，因为此队列不会维护对它的引用。
     * （换句话说，此方法必须分配一个新数组）。
     * 调用者因此可以自由地修改返回的数组。
     *
     * <p>此方法充当数组基础和基于集合的API之间的桥梁。
     *
     * @return 包含此队列中所有元素的数组
     */
    public Object[] toArray() { // 将队列元素转换为数组的方法
        fullyLock(); // 完全锁定
        try {
            int size = count.get(); // 获取当前元素计数
            Object[] a = new Object[size]; // 创建新数组
            int k = 0; // 数组索引
            for (Node<E> p = head.next; p != null; p = p.next) // 遍历链表
                a[k++] = p.item; // 将元素添加到数组
            return a; // 返回数组
        } finally {
            fullyUnlock(); // 解锁
        }
    }

    /**
     * 返回一个数组，包含此队列中的所有元素，按正确的顺序；
     * 返回数组的运行时类型为指定数组的类型。
     * 如果队列适合指定数组，则返回该数组。
     * 否则，将分配一个新数组，其运行时类型为指定数组的类型，大小为此队列的大小。
     *
     * <p>如果此队列适合指定数组并且有多余的空间
     * （即，数组的元素比此队列多），则数组中紧跟队列末尾的元素设置为
     * {@code null}。
     *
     * <p>像{@link #toArray()}方法一样，此方法充当数组基础和
     * 基于集合的API之间的桥梁。此外，此方法允许
     * 精确控制输出数组的运行时类型，并且在某些情况下，
     * 可以用于节省分配成本。
     *
     * <p>假设{@code x}是一个已知仅包含字符串的队列。
     * 以下代码可以用于将队列转储到新分配的{@code String}数组中：
     *
     *  <pre> {@code String[] y = x.toArray(new String[0]);}</pre>
     *
     * 注意{@code toArray(new Object[0])}的功能与
     * {@code toArray()}相同。
     *
     * @param a 要存储队列元素的数组，如果足够大；否则，为此目的分配一个新数组
     * @return 包含此队列中所有元素的数组
     * @throws ArrayStoreException 如果指定数组的运行时类型
     *         不是此队列中每个元素的运行时类型的超类型
     * @throws NullPointerException 如果指定数组为null
     */
    @SuppressWarnings("unchecked")
    public <T> T[] toArray(T[] a) { // 将队列元素转换为指定类型的数组的方法
        fullyLock(); // 完全锁定
        try {
            int size = count.get(); // 获取当前元素计数
            if (a.length < size) // 如果指定数组不够大
                a = (T[])java.lang.reflect.Array.newInstance // 创建新数组
                    (a.getClass().getComponentType(), size);

            int k = 0; // 数组索引
            for (Node<E> p = head.next; p != null; p = p.next) // 遍历链表
                a[k++] = (T)p.item; // 将元素添加到数组
            if (a.length > k) // 如果数组还有空间
                a[k] = null; // 设置数组末尾为null
            return a; // 返回数组
        } finally {
            fullyUnlock(); // 解锁
        }
    }

    public String toString() { // 转换为字符串的方法
        fullyLock(); // 完全锁定
        try {
            Node<E> p = head.next; // 获取第一个实际节点
            if (p == null) // 如果没有节点
                return "[]"; // 返回空数组表示

            StringBuilder sb = new StringBuilder(); // 创建字符串构建器
            sb.append('['); // 添加开头的方括号
            for (;;) { // 无限循环
                E e = p.item; // 获取当前节点的元素
                sb.append(e == this ? "(this Collection)" : e); // 添加元素到字符串
                p = p.next; // 移动到下一个节点
                if (p == null) // 如果没有下一个节点
                    return sb.append(']').toString(); // 返回完整字符串
                sb.append(',').append(' '); // 添加逗号和空格
            }
        } finally {
            fullyUnlock(); // 解锁
        }
    }

    /**
     * 原子性地移除此队列中的所有元素。
     * 调用此方法后，队列将为空。
     */
    public void clear() { // 清空队列的方法
        fullyLock(); // 完全锁定
        try {
            for (Node<E> p, h = head; (p = h.next) != null; h = p) { // 遍历链表
                h.next = h; // 帮助GC，清除节点的next引用
                p.item = null; // 清除节点的元素引用
            }
            head = last; // 更新头部节点
            // assert head.item == null && head.next == null; // 确保头部节点为空
            if (count.getAndSet(0) == capacity) // 如果计数减少到容量
                notFull.signal(); // 通知有空间可插入
        } finally {
            fullyUnlock(); // 解锁
        }
    }

    /**
     * @throws UnsupportedOperationException {@inheritDoc}
     * @throws ClassCastException            {@inheritDoc}
     * @throws NullPointerException          {@inheritDoc}
     * @throws IllegalArgumentException      {@inheritDoc}
     */
    public int drainTo(Collection<? super E> c) { // 将元素转移到指定集合的方法
        return drainTo(c, Integer.MAX_VALUE); // 调用带最大元素参数的方法
    }

    /**
     * @throws UnsupportedOperationException {@inheritDoc}
     * @throws ClassCastException            {@inheritDoc}
     * @throws NullPointerException          {@inheritDoc}
     * @throws IllegalArgumentException      {@inheritDoc}
     */
    public int drainTo(Collection<? super E> c, int maxElements) { // 将最多指定数量的元素转移到指定集合的方法
        if (c == null) // 检查集合是否为null
            throw new NullPointerException();
        if (c == this) // 检查集合是否为自身
            throw new IllegalArgumentException();
        if (maxElements <= 0) // 检查最大元素数量是否合法
            return 0; // 返回0
        boolean signalNotFull = false; // 标记是否需要通知有空间可插入
        final ReentrantLock takeLock = this.takeLock; // 获取取出锁
        takeLock.lock(); // 锁定
        try {
            int n = Math.min(maxElements, count.get()); // 获取可转移的元素数量
            // count.get提供对前n个节点的可见性
            Node<E> h = head; // 获取头部节点
            int i = 0; // 计数器
            try {
                while (i < n) { // 转移元素
                    Node<E> p = h.next; // 获取下一个节点
                    c.add(p.item); // 将元素添加到集合
                    p.item = null; // 清除节点的元素引用
                    h.next = h; // 帮助GC，清除节点的next引用
                    h = p; // 移动到下一个节点
                    ++i; // 增加计数
                }
                return n; // 返回转移的元素数量
            } finally {
                // 即使c.add()抛出异常，也要恢复不变式
                if (i > 0) { // 如果有元素转移
                    // assert h.item == null; // 确保当前节点为空
                    head = h; // 更新头部节点
                    signalNotFull = (count.getAndAdd(-i) == capacity); // 更新计数并检查是否需要通知
                }
            }
        } finally {
            takeLock.unlock(); // 解锁
            if (signalNotFull) // 如果需要通知
                signalNotFull(); // 通知有空间可插入
        }
    }

    /**
     * 返回一个迭代器，按正确顺序遍历此队列中的元素。
     * 元素将按从第一个（头部）到最后一个（尾部）的顺序返回。
     *
     * <p>返回的迭代器是
     * <a href="package-summary.html#Weakly"><i>弱一致性</i></a>。
     *
     * @return 一个按正确顺序遍历此队列中元素的迭代器
     */
    public Iterator<E> iterator() { // 获取迭代器的方法
        return new Itr(); // 返回新的迭代器实例
    }

    private class Itr implements Iterator<E> { // 定义迭代器类
        /*
         * 基本的弱一致性迭代器。始终持有下一个
         * 要返回的元素，以便如果hasNext()报告为true，
         * 我们仍然可以返回它，即使与取出等操作竞争失败。
         */

        private Node<E> current; // 当前节点
        private Node<E> lastRet; // 上一个返回的节点
        private E currentElement; // 当前元素

        Itr() { // 迭代器构造函数
            fullyLock(); // 完全锁定
            try {
                current = head.next; // 获取第一个实际节点
                if (current != null) // 如果节点不为空
                    currentElement = current.item; // 获取当前元素
            } finally {
                fullyUnlock(); // 解锁
            }
        }

        public boolean hasNext() { // 检查是否还有下一个元素的方法
            return current != null; // 如果当前节点不为空，返回true
        }

        /**
         * 返回p的下一个有效后继节点，如果没有则返回null。
         *
         * 与其他遍历方法不同，迭代器需要处理：
         * - 出队节点（p.next == p）
         * - （可能多个）内部删除节点（p.item == null）
         */
        private Node<E> nextNode(Node<E> p) { // 获取下一个节点的方法
            for (;;) { // 无限循环
                Node<E> s = p.next; // 获取下一个节点
                if (s == p) // 如果是自链接
                    return head.next; // 返回头部的下一个节点
                if (s == null || s.item != null) // 如果节点为空或有效
                    return s; // 返回有效节点
                p = s; // 移动到下一个节点
            }
        }

        public E next() { // 获取下一个元素的方法
            fullyLock(); // 完全锁定
            try {
                if (current == null) // 如果没有下一个元素
                    throw new NoSuchElementException(); // 抛出异常
                E x = currentElement; // 获取当前元素
                lastRet = current; // 更新上一个返回的节点
                current = nextNode(current); // 获取下一个节点
                currentElement = (current == null) ? null : current.item; // 更新当前元素
                return x; // 返回当前元素
            } finally {
                fullyUnlock(); // 解锁
            }
        }

        public void remove() { // 移除当前元素的方法
            if (lastRet == null) // 如果没有上一个返回的节点
                throw new IllegalStateException(); // 抛出异常
            fullyLock(); // 完全锁定
            try {
                Node<E> node = lastRet; // 获取上一个返回的节点
                lastRet = null; // 清除上一个返回的节点
                for (Node<E> trail = head, p = trail.next; // 遍历链表
                     p != null;
                     trail = p, p = p.next) {
                    if (p == node) { // 如果找到要移除的节点
                        unlink(p, trail); // 取消链接
                        break; // 退出循环
                    }
                }
            } finally {
                fullyUnlock(); // 解锁
            }
        }
    }

    /** 自定义的Spliterators.IteratorSpliterator变体 */
    static final class LBQSpliterator<E> implements Spliterator<E> { // 定义Spliterator类
        static final int MAX_BATCH = 1 << 25;  // 最大批处理数组大小；
        final LinkedBlockingQueue<E> queue; // 队列引用
        Node<E> current;    // 当前节点；初始化前为null
        int batch;          // 分割的批处理大小
        boolean exhausted;  // 当没有更多节点时为true
        long est;           // 大小估计
        LBQSpliterator(LinkedBlockingQueue<E> queue) { // 构造函数
            this.queue = queue; // 设置队列引用
            this.est = queue.size(); // 初始化大小估计
        }

        public long estimateSize() { return est; } // 返回估计大小

        public Spliterator<E> trySplit() { // 尝试分割的方法
            Node<E> h; // 当前节点
            final LinkedBlockingQueue<E> q = this.queue; // 获取队列引用
            int b = batch; // 获取当前批处理大小
            int n = (b <= 0) ? 1 : (b >= MAX_BATCH) ? MAX_BATCH : b + 1; // 计算新的批处理大小
            if (!exhausted && // 如果没有耗尽
                ((h = current) != null || (h = q.head.next) != null) && // 获取当前节点或头部的下一个节点
                h.next != null) { // 如果下一个节点不为空
                Object[] a = new Object[n]; // 创建新数组
                int i = 0; // 数组索引
                Node<E> p = current; // 获取当前节点
                q.fullyLock(); // 完全锁定
                try {
                    if (p != null || (p = q.head.next) != null) { // 如果当前节点不为空或头部的下一个节点不为空
                        do {
                            if ((a[i] = p.item) != null) // 将节点的元素添加到数组
                                ++i; // 增加计数
                        } while ((p = p.next) != null && i < n); // 遍历节点
                    }
                } finally {
                    q.fullyUnlock(); // 解锁
                }
                if ((current = p) == null) { // 更新当前节点
                    est = 0L; // 更新估计大小
                    exhausted = true; // 标记为耗尽
                }
                else if ((est -= i) < 0L) // 更新估计大小
                    est = 0L; // 确保不为负
                if (i > 0) { // 如果有元素转移
                    batch = i; // 更新批处理大小
                    return Spliterators.spliterator // 返回Spliterator
                        (a, 0, i, Spliterator.ORDERED | Spliterator.NONNULL |
                         Spliterator.CONCURRENT);
                }
            }
            return null; // 返回null
        }

        public void forEachRemaining(Consumer<? super E> action) { // 对剩余元素执行操作的方法
            if (action == null) throw new NullPointerException(); // 检查操作是否为null
            final LinkedBlockingQueue<E> q = this.queue; // 获取队列引用
            if (!exhausted) { // 如果没有耗尽
                exhausted = true; // 标记为耗尽
                Node<E> p = current; // 获取当前节点
                do {
                    E e = null; // 存储元素
                    q.fullyLock(); // 完全锁定
                    try {
                        if (p == null) // 如果当前节点为空
                            p = q.head.next; // 获取头部的下一个节点
                        while (p != null) { // 遍历节点
                            e = p.item; // 获取节点的元素
                            p = p.next; // 移动到下一个节点
                            if (e != null) // 如果元素不为空
                                break; // 退出循环
                        }
                    } finally {
                        q.fullyUnlock(); // 解锁
                    }
                    if (e != null) // 如果元素不为空
                        action.accept(e); // 执行操作
                } while (p != null); // 继续直到没有更多节点
            }
        }

        public boolean tryAdvance(Consumer<? super E> action) { // 尝试获取下一个元素的方法
            if (action == null) throw new NullPointerException(); // 检查操作是否为null
            final LinkedBlockingQueue<E> q = this.queue; // 获取队列引用
            if (!exhausted) { // 如果没有耗尽
                E e = null; // 存储元素
                q.fullyLock(); // 完全锁定
                try {
                    if (current == null) // 如果当前节点为空
                        current = q.head.next; // 获取头部的下一个节点
                    while (current != null) { // 遍历节点
                        e = current.item; // 获取节点的元素
                        current = current.next; // 移动到下一个节点
                        if (e != null) // 如果元素不为空
                            break; // 退出循环
                    }
                } finally {
                    q.fullyUnlock(); // 解锁
                }
                if (current == null) // 如果没有更多节点
                    exhausted = true; // 标记为耗尽
                if (e != null) { // 如果元素不为空
                    action.accept(e); // 执行操作
                    return true; // 返回成功
                }
            }
            return false; // 返回失败
        }

        public int characteristics() { // 返回特征的方法
            return Spliterator.ORDERED | Spliterator.NONNULL |
                Spliterator.CONCURRENT; // 返回特征
        }
    }

    /**
     * 返回一个{@link Spliterator}，遍历此队列中的元素。
     *
     * <p>返回的spliterator是
     * <a href="package-summary.html#Weakly"><i>弱一致性</i></a>。
     *
     * <p>该{@code Spliterator}报告{@link Spliterator#CONCURRENT}，
     * {@link Spliterator#ORDERED}和{@link Spliterator#NONNULL}。
     *
     * @implNote
     * 该{@code Spliterator}实现{@code trySplit}以允许有限的
     * 并行性。
     *
     * @return 一个{@code Spliterator}，遍历此队列中的元素
     * @since 1.8
     */
    public Spliterator<E> spliterator() { // 获取Spliterator的方法
        return new LBQSpliterator<E>(this); // 返回新的Spliterator实例
    }

    /**
     * 将此队列保存到流中（即序列化它）。
     *
     * @param s 流
     * @throws java.io.IOException 如果发生I/O错误
     * @serialData 容量被发出（int），后跟所有
     * 其元素（每个都是{@code Object}）按正确顺序，
     * 后跟null
     */
    private void writeObject(java.io.ObjectOutputStream s) // 序列化方法
        throws java.io.IOException {

        fullyLock(); // 完全锁定
        try {
            // 写出任何隐藏的内容，加上容量
            s.defaultWriteObject(); // 默认序列化

            // 按正确顺序写出所有元素。
            for (Node<E> p = head.next; p != null; p = p.next) // 遍历链表
                s.writeObject(p.item); // 写出元素

            // 使用尾随null作为哨兵
            s.writeObject(null); // 写出null
        } finally {
            fullyUnlock(); // 解锁
        }
    }

    /**
     * 从流中重建此队列（即反序列化它）。
     * @param s 流
     * @throws ClassNotFoundException 如果找不到序列化对象的类
     * @throws java.io.IOException 如果发生I/O错误
     */
    private void readObject(java.io.ObjectInputStream s) // 反序列化方法
        throws java.io.IOException, ClassNotFoundException {
        // 读取容量和任何隐藏的内容
        s.defaultReadObject(); // 默认反序列化

        count.set(0); // 初始化计数
        last = head = new Node<E>(null); // 初始化头部和尾部节点

        // 读取所有元素并放入队列
        for (;;) {
            @SuppressWarnings("unchecked")
            E item = (E)s.readObject(); // 读取元素
            if (item == null) // 如果读取到null
                break; // 退出循环
            add(item); // 将元素添加到队列
        }
    }
}
```

## ReentrantLock

```java
public class ReentrantLock implements Lock, java.io.Serializable { // 定义一个可重入锁类，实现Lock接口和可序列化接口

    /**
     ...
 
      * 这相当于使用{@code ReentrantLock(false)}。
      */
     public ReentrantLock() { // 默认构造函数
         sync = new NonfairSync(); // 初始化为非公平锁
     }
 
     /**
      * 创建一个具有给定公平性策略的{@code ReentrantLock}实例。
      *
      * @param fair {@code true}如果此锁应使用公平的排序策略
      */
     public ReentrantLock(boolean fair) { // 带公平性参数的构造函数
         sync = fair ? new FairSync() : new NonfairSync(); // 根据参数选择公平或非公平锁
     }
 
     /**
      * 获取锁。
      *
      * <p>如果锁未被其他线程持有，则获取锁并立即返回，
      * 将锁持有计数设置为1。
      *
      * <p>如果当前线程已经持有锁，则持有计数
      * 增加1，方法立即返回。
      *
      * <p>如果锁被其他线程持有，则当前线程
      * 在调度目的上被禁用，处于休眠状态，直到锁被获取，
      * 此时锁持有计数设置为1。
      */
     public void lock() { // 获取锁的方法
         sync.lock(); // 调用同步对象的锁定方法
     }
 
     /**
      * 获取锁，除非当前线程被
      * {@linkplain Thread#interrupt 中断}。
      *
      * <p>如果锁未被其他线程持有，则获取锁并立即返回，
      * 将锁持有计数设置为1。
      *
      * <p>如果当前线程已经持有此锁，则持有计数
      * 增加1，方法立即返回。
      *
      * <p>如果锁被其他线程持有，则当前线程
      * 在调度目的上被禁用，处于休眠状态，直到发生以下两种情况之一：
      *
      * <ul>
      *
      * <li>当前线程获取锁；或
      *
      * <li>其他线程{@linkplain Thread#interrupt 中断}
      * 当前线程。
      *
      * </ul>
      *
      * <p>如果当前线程获取锁，则锁持有
      * 计数设置为1。
      *
      * <p>如果当前线程：
      *
      * <ul>
      *
      * <li>在进入此方法时设置了中断状态；或
      *
      * <li>在获取锁时被{@linkplain Thread#interrupt 中断}，
      *
      * </ul>
      * 则抛出{@link InterruptedException}，并清除当前线程的
      * 中断状态。
      *
      * <p>在此实现中，由于此方法是一个显式
      * 中断点，因此优先响应中断，而不是正常或重入获取锁。
      *
      * @throws InterruptedException 如果当前线程被中断
      */
     public void lockInterruptibly() throws InterruptedException { // 可中断的获取锁方法
         sync.acquireInterruptibly(1); // 调用同步对象的可中断获取方法
     }
 
     /**
      * 仅在锁未被其他线程持有时获取锁。
      *
      * <p>如果锁未被其他线程持有，则获取锁并
      * 立即返回，值为{@code true}，将锁持有计数设置为1。
      * 即使此锁已设置为使用公平排序策略，调用{@code tryLock()} <em>将</em>
      * 立即获取锁（如果可用），无论其他线程是否正在等待锁。
      * 这种“插队”行为在某些情况下可能有用，
      * 尽管它打破了公平性。如果您希望尊重
      * 此锁的公平性设置，请使用
      * {@link #tryLock(long, TimeUnit) tryLock(0, TimeUnit.SECONDS) }
      * 这几乎是等效的（它也检测中断）。
      *
      * <p>如果当前线程已经持有此锁，则持有
      * 计数增加1，方法返回{@code true}。
      *
      * <p>如果锁被其他线程持有，则此方法将返回
      * {@code false}。
      */
    public boolean tryLock() { // 尝试获取锁的方法
         return sync.nonfairTryAcquire(1); // 调用非公平尝试获取方法
     }
 
     /**
      * 如果在给定的等待时间内锁未被其他线程持有，
      * 则获取锁，且当前线程未被
      * {@linkplain Thread#interrupt 中断}。
      *
      * <p>如果锁未被其他线程持有，则获取锁并立即返回
      * 值为{@code true}，将锁持有计数设置为1。如果此锁已设置为使用公平
      * 排序策略，则如果有其他线程在等待锁，则不会获取可用锁。
      * 这与{@link #tryLock()}方法形成对比。如果您希望在公平锁上允许
      * 插队的定时{@code tryLock}，则将定时和非定时形式结合在一起：
      *
      *  <pre> {@code
      * if (lock.tryLock() ||
      *     lock.tryLock(timeout, unit)) {
      *   ...
      * }}</pre>
      *
      * <p>如果当前线程
      * 已经持有此锁，则持有计数增加1，方法返回{@code true}。
      *
      * <p>如果锁被其他线程持有，则当前线程
      * 在调度目的上被禁用，处于休眠状态，直到发生以下三种情况之一：
      *
      * <ul>
      *
      * <li>当前线程获取锁；或
      *
      * <li>其他线程{@linkplain Thread#interrupt 中断}
      * 当前线程；或
      *
      * <li>指定的等待时间到期
      *
      * </ul>
      *
      * <p>如果获取锁，则返回值{@code true}，并将
      * 锁持有计数设置为1。
      *
      * <p>如果当前线程：
      *
      * <ul>
      *
      * <li>在进入此方法时设置了中断状态；或
      *
      * <li>在获取锁时被{@linkplain Thread#interrupt 中断}，
      *
      * </ul>
      * 则抛出{@link InterruptedException}，并清除当前线程的
      * 中断状态。
      *
      * <p>如果指定的等待时间到期，则返回值{@code false}。
      * 如果时间小于或等于零，则方法将不会等待。
      *
      * <p>在此实现中，由于此方法是一个显式
      * 中断点，因此优先响应中断，而不是正常或重入获取锁，
      * 以及报告等待时间的到期。
      *
      * @param timeout 等待锁的时间
      * @param unit 超时参数的时间单位
      * @return {@code true}如果锁是空闲的并被当前线程获取，
      *         或锁已被当前线程持有；{@code false}如果在获取锁之前
      *         等待时间到期
      * @throws InterruptedException 如果当前线程被中断
      * @throws NullPointerException 如果时间单位为null
      */
     public boolean tryLock(long timeout, TimeUnit unit) // 尝试获取锁的方法，带超时参数
             throws InterruptedException {
         return sync.tryAcquireNanos(1, unit.toNanos(timeout)); // 调用同步对象的尝试获取方法
     }
 
     /**
      * 尝试释放此锁。
      *
      * <p>如果当前线程是此锁的持有者，则持有
      * 计数减少。如果持有计数现在为零，则释放锁。
      * 如果当前线程不是此锁的持有者，则抛出
      * {@link IllegalMonitorStateException}。
      *
     
     ...
    public void unlock() { // 释放锁的方法
    
      /**
      * 尝试释放此锁。
      *
      * <p>如果当前线程是此锁的持有者，则持有
      * 计数减少。如果持有计数现在为零，则释放锁。
      * 如果当前线程不是此锁的持有者，则抛出
      * {@link IllegalMonitorStateException}。
      *
      * @throws IllegalMonitorStateException 如果当前线程不持有此锁
      */
     public void unlock() { // 释放锁的方法
         sync.release(1); // 调用同步对象的释放方法
     }

    /**
     * 返回一个{@link Condition}实例，用于与此
     * {@link Lock}实例一起使用。
     *
     * <p>返回的{@link Condition}实例支持与
     * 内置监视器锁一起使用的相同用法
     * （{@link Object#wait() wait}，{@link Object#notify notify}，和
     * {@link Object#notifyAll notifyAll}）。
     *
     * <ul>
     *
     * <li>如果在调用任何{@link Condition}
     * {@linkplain Condition#await() 等待}或{@linkplain
     * Condition#signal 信号}方法时未持有此锁，则抛出
     * {@link IllegalMonitorStateException}。
     *
     * <li>当调用条件{@linkplain Condition#await() 等待}
     * 方法时，锁被释放，并且在返回之前，
     * 锁被重新获取，持有计数恢复到调用方法时的值。
     *
     * <li>如果线程在等待时被{@linkplain Thread#interrupt 中断}，
     * 则等待将终止，抛出{@link InterruptedException}，并清除线程的
     * 中断状态。
     *
     * <li> 等待线程按FIFO顺序被信号通知。
     *
     * <li> 从等待方法返回的线程的锁重新获取顺序与
     * 最初获取锁的线程相同，默认情况下未指定，但对于
     * <em>公平</em>锁，优先考虑等待时间最长的线程。
     *
     * </ul>
     *
     * @return Condition对象
     */
    public Condition newCondition() { // 创建新的条件对象的方法
        return sync.newCondition(); // 调用同步对象的方法
    }

    /**
     * 查询当前线程对此锁的持有次数。
     *
     * <p>线程对锁的持有次数是每个未匹配的
     * 解锁操作的锁操作。
     *
     * <p>持有计数信息通常仅用于测试和
     * 调试目的。例如，如果某段代码不应在
     * 已持有锁的情况下进入，则可以断言这一事实：
     *
     *  <pre> {@code
     * class X {
     *   ReentrantLock lock = new ReentrantLock();
     *   // ...
     *   public void m() {
     *     assert lock.getHoldCount() == 0; // 断言持有计数为0
     *     lock.lock(); // 获取锁
     *     try {
     *       // ... 方法体
     *     } finally {
     *       lock.unlock(); // 释放锁
     *     }
     *   }
     * }}</pre>
     *
     * @return 当前线程对该锁的持有次数，
     *         如果当前线程未持有此锁，则返回零
     */
    public int getHoldCount() { // 获取持有计数的方法
        return sync.getHoldCount(); // 调用同步对象的方法
    }

    /**
     * 查询当前线程是否持有此锁。
     *
     * <p>类似于内置监视器锁的{@link Thread#holdsLock(Object)}方法，
     * 此方法通常用于调试和测试。例如，只有在持有锁的情况下
     * 调用的方法可以断言这一点：
     *
     *  <pre> {@code
     * class X {
     *   ReentrantLock lock = new ReentrantLock();
     *   // ...
     *
     *   public void m() {
     *       assert lock.isHeldByCurrentThread(); // 断言当前线程持有锁
     *       // ... 方法体
     *   }
     * }}</pre>
     *
     * <p>它还可以用于确保可重入锁以非可重入方式使用，例如：
     *
     *  <pre> {@code
     * class X {
     *   ReentrantLock lock = new ReentrantLock();
     *   // ...
     *
     *   public void m() {
     *       assert !lock.isHeldByCurrentThread(); // 断言当前线程未持有锁
     *       lock.lock(); // 获取锁
     *       try {
     *           // ... 方法体
     *       } finally {
     *           lock.unlock(); // 释放锁
     *       }
     *   }
     * }}</pre>
     *
     * @return 如果当前线程持有此锁，则返回{@code true}，
     *         否则返回{@code false}
     */
    public boolean isHeldByCurrentThread() { // 检查当前线程是否持有锁的方法
        return sync.isHeldExclusively(); // 调用同步对象的方法
    }

    /**
     * 查询是否有任何线程持有此锁。此方法
     * 旨在用于监控系统状态，
     * 而不是用于同步控制。
     *
     * @return 如果任何线程持有此锁，则返回{@code true}，
     *         否则返回{@code false}
     */
    public boolean isLocked() { // 检查锁是否被持有的方法
        return sync.isLocked(); // 调用同步对象的方法
    }

    /**
     * 返回{@code true}如果此锁的公平性设置为true。
     *
     * @return {@code true}如果此锁的公平性设置为true
     */
    public final boolean isFair() { // 检查锁是否为公平锁的方法
        return sync instanceof FairSync; // 判断同步对象是否为公平同步
    }

    /**
     * 返回当前拥有此锁的线程，或
     * {@code null}如果未被拥有。当此方法被
     * 非拥有者线程调用时，返回值反映了
     * 当前锁状态的最佳努力近似。例如，
     * 即使有线程尝试获取锁，拥有者也可能会
     * 瞬时为{@code null}。
     * 此方法旨在促进构建提供
     * 更广泛锁监控功能的子类。
     *
     * @return 拥有者，或{@code null}如果未被拥有
     */
    protected Thread getOwner() { // 获取锁的拥有者线程的方法
        return sync.getOwner(); // 调用同步对象的方法
    }

    /**
     * 查询是否有任何线程在等待获取此锁。注意
     * 由于取消可能随时发生，返回{@code true}
     * 并不保证任何其他线程将来会获取此锁。
     * 此方法主要用于监控系统状态。
     *
     * @return 如果可能有其他线程在等待获取锁，则返回{@code true}
     */
    public final boolean hasQueuedThreads() { // 检查是否有线程在等待获取锁的方法
        return sync.hasQueuedThreads(); // 调用同步对象的方法
    }

    /**
     * 查询给定线程是否在等待获取此
     * 锁。注意由于取消可能随时发生，返回{@code true}
     * 并不保证此线程将来会获取此锁。
     * 此方法主要用于监控系统状态。
     *
     * @param thread 线程
     * @return 如果给定线程在等待获取此锁，则返回{@code true}
     * @throws NullPointerException 如果线程为null
     */
    public final boolean hasQueuedThread(Thread thread) { // 检查指定线程是否在等待获取锁的方法
        return sync.isQueued(thread); // 调用同步对象的方法
    }

    /**
     * 返回等待获取此锁的线程数量的估计值。
     * 该值仅为估计，因为线程数量可能在此方法遍历
     * 内部数据结构时动态变化。此方法旨在用于
     * 监控系统状态，而不是用于同步控制。
     *
     * @return 等待此锁的线程的估计数量
     */
    public final int getQueueLength() { // 获取等待获取锁的线程数量的方法
        return sync.getQueueLength(); // 调用同步对象的方法
    }

    /**
     * 返回一个集合，包含可能在等待获取此锁的线程。
     * 由于实际线程集可能在构建此结果时动态变化，
     * 返回的集合仅为最佳努力估计。返回集合的元素
     * 没有特定顺序。此方法旨在促进构建提供
     * 更广泛监控功能的子类。
     *
     * @return 线程集合
     */
    protected Collection<Thread> getQueuedThreads() { // 获取等待获取锁的线程集合的方法
        return sync.getQueuedThreads(); // 调用同步对象的方法
    }

    /**
     * 查询是否有任何线程在等待与此锁关联的给定条件。
     * 注意，由于超时和中断可能随时发生，返回{@code true}
     * 并不保证将来{@code signal}会唤醒任何线程。
     * 此方法主要用于监控系统状态。
     *
     * @param condition 条件
     * @return 如果有任何等待线程，则返回{@code true}
     * @throws IllegalMonitorStateException 如果此锁未被持有
     * @throws IllegalArgumentException 如果给定条件未与此锁关联
     * @throws NullPointerException 如果条件为null
     */
    public boolean hasWaiters(Condition condition) { // 检查是否有线程在等待给定条件的方法
        if (condition == null) // 检查条件是否为null
            throw new NullPointerException(); // 抛出空指针异常
        if (!(condition instanceof AbstractQueuedSynchronizer.ConditionObject)) // 检查条件是否为同步条件对象
            throw new IllegalArgumentException("not owner"); // 抛出非法参数异常
        return sync.hasWaiters((AbstractQueuedSynchronizer.ConditionObject)condition); // 调用同步对象的方法
    }

    /**
     * 返回等待与此锁关联的给定条件的线程数量的估计值。
     * 注意，由于超时和中断可能随时发生，估计值
     * 仅作为实际等待者数量的上限。
     * 此方法旨在用于监控系统状态，而不是用于同步控制。
     *
     * @param condition 条件
     * @return 等待线程的估计数量
     * @throws IllegalMonitorStateException 如果此锁未被持有
     * @throws IllegalArgumentException 如果给定条件未与此锁关联
     * @throws NullPointerException 如果条件为null
     */
    public int getWaitQueueLength(Condition condition) { // 获取等待给定条件的线程数量的方法
        if (condition == null) // 检查条件是否为null
            throw new NullPointerException(); // 抛出空指针异常
        if (!(condition instanceof AbstractQueuedSynchronizer.ConditionObject)) // 检查条件是否为同步条件对象
            throw new IllegalArgumentException("not owner"); // 抛出非法参数异常
        return sync.getWaitQueueLength((AbstractQueuedSynchronizer.ConditionObject)condition); // 调用同步对象的方法
    }

    /**
     * 返回一个集合，包含可能在等待与此锁关联的给定条件的线程。
     * 由于实际线程集可能在构建此结果时动态变化，
     * 返回的集合仅为最佳努力估计。返回集合的元素
     * 没有特定顺序。此方法旨在促进构建提供
     * 更广泛条件监控功能的子类。
     *
     * @param condition 条件
     * @return 线程集合
     * @throws IllegalMonitorStateException 如果此锁未被持有
     * @throws IllegalArgumentException 如果给定条件未与此锁关联
     * @throws NullPointerException 如果条件为null
     */
    protected Collection<Thread> getWaitingThreads(Condition condition) { // 获取等待给定条件的线程集合的方法
        if (condition == null) // 检查条件是否为null
            throw new NullPointerException(); // 抛出空指针异常
        if (!(condition instanceof AbstractQueuedSynchronizer.ConditionObject)) // 检查条件是否为同步条件对象
            throw new IllegalArgumentException("not owner"); // 抛出非法参数异常
        return sync.getWaitingThreads((AbstractQueuedSynchronizer.ConditionObject)condition); // 调用同步对象的方法
    }

    /**
     * 返回一个字符串，标识此锁及其锁状态。
     * 状态在括号中，包括字符串{@code "Unlocked"}
     * 或字符串{@code "Locked by"}，后跟
     * {@linkplain Thread#getName name}的拥有线程。
     *
     * @return 标识此锁及其锁状态的字符串
     */
    public String toString() { // 返回锁的字符串表示的方法
        Thread o = sync.getOwner(); // 获取锁的拥有者线程
        return super.toString() + ((o == null) ? // 返回锁的状态
                "[Unlocked]" :
                "[Locked by thread " + o.getName() + "]"); // 返回锁被哪个线程持有
    }
}
```

## Lock

```java
public interface Lock { // 定义一个锁接口

    /**
     * 获取锁。
     *
     * <p>如果锁不可用，则当前线程将被禁用
     * 以进行线程调度，并在锁被获取之前处于休眠状态。
     *
     * <p><b>实现考虑</b>
     *
     * <p>一个{@code Lock}实现可能能够检测到锁的错误使用，
     * 例如会导致死锁的调用，并可能在这种情况下抛出
     * （未检查的）异常。该{@code Lock}实现必须记录
     * 这些情况和异常类型。
     */
    void lock(); // 获取锁的方法

    /**
     * 获取锁，除非当前线程被
     * {@linkplain Thread#interrupt 中断}。
     *
     * <p>如果锁可用，则立即获取锁并返回。
     *
     * <p>如果锁不可用，则当前线程将被禁用
     * 以进行线程调度，并在以下两种情况之一发生之前处于休眠状态：
     *
     * <ul>
     * <li>当前线程获取锁；或
     * <li>其他线程{@linkplain Thread#interrupt 中断}当前线程，
     * 并且支持锁获取的中断。
     * </ul>
     *
     * <p>如果当前线程：
     * <ul>
     * <li>在进入此方法时设置了中断状态；或
     * <li>在获取锁时被{@linkplain Thread#interrupt 中断}，
     * 并且支持锁获取的中断，
     * </ul>
     * 则抛出{@link InterruptedException}，并清除当前线程的
     * 中断状态。
     *
     * <p><b>实现考虑</b>
     *
     * <p>在某些实现中，可能无法中断锁获取，
     * 如果可能，可能是一个昂贵的操作。
     * 程序员应意识到可能存在这种情况。实现应记录
     * 何时存在这种情况。
     *
     * <p>实现可以优先响应中断而不是正常方法返回。
     *
     * <p>一个{@code Lock}实现可能能够检测到锁的错误使用，
     * 例如会导致死锁的调用，并可能在这种情况下抛出
     * （未检查的）异常。该{@code Lock}实现必须记录
     * 这些情况和异常类型。
     *
     * @throws InterruptedException 如果当前线程在获取锁时被
     *         中断（并且支持锁获取的中断）
     */
    void lockInterruptibly() throws InterruptedException; // 可中断的获取锁的方法

    /**
     * 仅在调用时锁是空闲的情况下获取锁。
     *
     * <p>如果锁可用，则获取锁并立即返回
     * 值为{@code true}。
     * 如果锁不可用，则此方法将立即返回
     * 值为{@code false}。
     *
     * <p>此方法的典型用法习惯是：
     *  <pre> {@code
     * Lock lock = ...;
     * if (lock.tryLock()) {
     *   try {
     *     // 操作受保护的状态
     *   } finally {
     *     lock.unlock(); // 释放锁
     *   }
     * } else {
     *   // 执行替代操作
     * }}</pre>
     *
     * 此用法确保如果获取了锁，则锁会被解锁，
     * 并且如果未获取锁，则不会尝试解锁。
     *
     * @return {@code true} 如果锁被获取，
     *         {@code false} 否则
     */
    boolean tryLock(); // 尝试获取锁的方法

    /**
     * 如果在给定的等待时间内锁是空闲的，并且当前线程
     * 未被{@linkplain Thread#interrupt 中断}，则获取锁。
     *
     * <p>如果锁可用，则此方法立即返回
     * 值为{@code true}。
     * 如果锁不可用，则当前线程将被禁用
     * 以进行线程调度，并在以下三种情况之一发生之前处于休眠状态：
     * <ul>
     * <li>当前线程获取锁；或
     * <li>其他线程{@linkplain Thread#interrupt 中断}当前线程，
     * 并且支持锁获取的中断；或
     * <li>指定的等待时间到期
     * </ul>
     *
     * <p>如果获取锁，则返回值{@code true}。
     *
     * <p>如果当前线程：
     * <ul>
     * <li>在进入此方法时设置了中断状态；或
     * <li>在获取锁时被{@linkplain Thread#interrupt 中断}，
     * 并且支持锁获取的中断，
     * </ul>
     * 则抛出{@link InterruptedException}，并清除当前线程的
     * 中断状态。
     *
     * <p>如果指定的等待时间到期，则返回值{@code false}。
     * 如果时间小于或等于零，则方法将不会等待。
     *
     * <p><b>实现考虑</b>
     *
     * <p>在某些实现中，可能无法中断锁获取，
     * 如果可能，可能是一个昂贵的操作。
     * 程序员应意识到可能存在这种情况。实现应记录
     * 何时存在这种情况。
     *
     * <p>实现可以优先响应中断而不是正常
     * 方法返回，或报告超时。
     *
     * <p>一个{@code Lock}实现可能能够检测到锁的错误使用，
     * 例如会导致死锁的调用，并可能在这种情况下抛出
     * （未检查的）异常。该{@code Lock}实现必须记录
     * 这些情况和异常类型。
     *
     * @param time 等待锁的最大时间
     * @param unit {@code time}参数的时间单位
     * @return {@code true} 如果锁被获取，{@code false}
     *         如果在获取锁之前等待时间到期
     *
     * @throws InterruptedException 如果当前线程在获取锁时被中断
     *         （并且支持锁获取的中断）
     */
    boolean tryLock(long time, TimeUnit unit) throws InterruptedException; // 尝试获取锁的方法，带超时参数

    /**
     * 释放锁。
     *
     * <p><b>实现考虑</b>
     *
     * <p>一个{@code Lock}实现通常会对哪个线程可以释放锁施加
     * 限制（通常只有锁的持有者可以释放它），并且如果违反限制，
     * 可能会抛出（未检查的）异常。
     * 任何限制和异常类型必须由该{@code Lock}实现记录。
     */
    void unlock(); // 释放锁的方法

    /**
     * 返回一个新的{@link Condition}实例，该实例绑定到此
     * {@code Lock}实例。
     *
     * <p>在等待条件之前，当前线程必须持有锁。
     * 调用{@link Condition#await()}将原子释放锁
     * 然后等待，并在等待返回之前重新获取锁。
     *
     * <p><b>实现考虑</b>
     *
     * <p>{@link Condition}实例的确切操作取决于
     * {@code Lock}实现，必须由该实现记录。
     *
     * @return 绑定到此{@code Lock}实例的新{@link Condition}实例
     * @throws UnsupportedOperationException 如果此{@code Lock}
     *         实现不支持条件
     */
    Condition newCondition(); // 创建新的条件对象的方法
}
```

## ExecutorService

```java
//ExecutorService// 定义一个ExecutorService接口，继承自Executor，是 Executor的扩展，中文 翻译为执行器服务

public interface ExecutorService extends Executor { // 定义一个ExecutorService接口，继承自Executor

    /**
     * 启动有序关闭，其中之前提交的任务将被执行，
     * 但不接受新任务。
     * 如果已经关闭，则调用没有额外效果。
     *
     * <p>此方法不会等待之前提交的任务完成执行。
     * 使用{@link #awaitTermination awaitTermination}来做到这一点。
     *
     * @throws SecurityException 如果存在安全管理器，并且
     *         关闭此ExecutorService可能会操作
     *         调用者不允许修改的线程，因为它不持有
     *         {@link java.lang.RuntimePermission}{@code ("modifyThread")}，
     *         或安全管理器的{@code checkAccess}方法拒绝访问。
     */
    void shutdown(); // 关闭ExecutorService的方法

    /**
     * 尝试停止所有正在执行的任务，停止等待任务的处理，
     * 并返回等待执行的任务列表。
     *
     * <p>此方法不会等待正在执行的任务终止。
     * 使用{@link #awaitTermination awaitTermination}来做到这一点。
     *
     * <p>没有保证会停止正在执行的任务的处理，只有尽力而为。
     * 例如，典型的实现将通过{@link Thread#interrupt}取消，
     * 因此任何未能响应中断的任务可能永远不会终止。
     *
     * @return 从未开始执行的任务列表
     * @throws SecurityException 如果存在安全管理器，并且
     *         关闭此ExecutorService可能会操作
     *         调用者不允许修改的线程，因为它不持有
     *         {@link java.lang.RuntimePermission}{@code ("modifyThread")}，
     *         或安全管理器的{@code checkAccess}方法拒绝访问。
     */
    List<Runnable> shutdownNow(); // 立即关闭ExecutorService并返回未执行的任务列表的方法

    /**
     * 如果此执行器已关闭，则返回{@code true}。
     *
     * @return {@code true} 如果此执行器已关闭
     */
    boolean isShutdown(); // 检查ExecutorService是否已关闭的方法

    /**
     * 如果所有任务在关闭后已完成，则返回{@code true}。
     * 注意，{@code isTerminated}在调用{@code shutdown}或
     * {@code shutdownNow}之前永远不会为{@code true}。
     *
     * @return {@code true} 如果所有任务在关闭后已完成
     */
    boolean isTerminated(); // 检查ExecutorService是否已终止的方法

    /**
     * 阻塞直到所有任务在关闭请求后完成执行，
     * 或超时发生，或当前线程被中断，以先发生者为准。
     *
     * @param timeout 等待的最大时间
     * @param unit 超时参数的时间单位
     * @return {@code true} 如果此执行器终止，{@code false}
     *         如果在终止之前超时
     * @throws InterruptedException 如果在等待时被中断
     */
    boolean awaitTermination(long timeout, TimeUnit unit) // 等待ExecutorService终止的方法
        throws InterruptedException;

    /**
     * 提交一个返回值的任务进行执行，并返回一个
     * 表示任务待处理结果的Future。Future的{@code get}方法
     * 将在成功完成时返回任务的结果。
     *
     * <p>
     * 如果您希望立即阻塞等待任务，可以使用
     * {@code result = exec.submit(aCallable).get();}的构造。
     *
     * <p>注意：{@link Executors}类包括一组方法
     * 可以将一些其他常见的闭包对象，例如
     * {@link java.security.PrivilegedAction}转换为
     * {@link Callable}形式，以便可以提交。
     *
     * @param task 要提交的任务
     * @param <T> 任务结果的类型
     * @return 表示任务待处理完成的Future
     * @throws RejectedExecutionException 如果任务无法
     *         被调度执行
     * @throws NullPointerException 如果任务为null
     */
    <T> Future<T> submit(Callable<T> task); // 提交Callable任务的方法

    /**
     * 提交一个Runnable任务进行执行，并返回一个Future
     * 表示该任务。Future的{@code get}方法将在成功完成时
     * 返回给定的结果。
     *
     * @param task 要提交的任务
     * @param result 要返回的结果
     * @param <T> 结果的类型
     * @return 表示任务待处理完成的Future
     * @throws RejectedExecutionException 如果任务无法
     *         被调度执行
     * @throws NullPointerException 如果任务为null
     */
    <T> Future<T> submit(Runnable task, T result); // 提交Runnable任务并返回结果的方法

    /**
     * 提交一个Runnable任务进行执行，并返回一个Future
     * 表示该任务。Future的{@code get}方法将在成功完成时
     * 返回{@code null}。
     *
     * @param task 要提交的任务
     * @return 表示任务待处理完成的Future
     * @throws RejectedExecutionException 如果任务无法
     *         被调度执行
     * @throws NullPointerException 如果任务为null
     */
    Future<?> submit(Runnable task); // 提交Runnable任务的方法

    /**
     * 执行给定的任务，返回一个Future列表，持有
     * 它们的状态和结果，当所有任务完成时。
     * {@link Future#isDone}对于返回表列的每个元素都是{@code true}。
     * 注意，一个<em>完成的</em>任务可能正常终止或抛出异常。
     * 如果在此操作进行时修改给定的集合，则此方法的结果是未定义的。
     *
     * @param tasks 任务集合
     * @param <T> 从任务返回的值的类型
     * @return 表示任务的Future列表，顺序与给定任务列表的迭代器生成的顺序相同，
     *         每个任务都已完成
     * @throws InterruptedException 如果在等待时被中断，在这种情况下未完成的任务将被取消
     * @throws NullPointerException 如果任务或其任何元素为{@code null}
     * @throws RejectedExecutionException 如果任何任务无法被调度执行
     */
    <T> List<Future<T>> invokeAll(Collection<? extends Callable<T>> tasks) // 执行所有任务并返回结果的方法
        throws InterruptedException;

    /**
     * 执行给定的任务，返回一个Future列表，持有
     * 它们的状态和结果，当所有任务完成或超时到期时，
     * 以先发生者为准。
     * {@link Future#isDone}对于返回列表的每个元素都是{@code true}。
     * 返回时，未完成的任务将被取消。
     * 注意，一个<em>完成的</em>任务可能正常终止或抛出异常。
     * 如果在此操作进行时修改给定的集合，则此方法的结果是未定义的。
     *
     * @param tasks 任务集合
     * @param timeout 等待的最大时间
     * @param unit 超时参数的时间单位
     * @param <T> 从任务返回的值的类型
     * @return 表示任务的Future列表，顺序与给定任务列表的迭代器生成的顺序相同。
     *         如果操作没有超时，则每个任务都将完成。
     *         如果超时，则这些任务中的某些任务将未完成。
     * @throws InterruptedException 如果在等待时被中断，在这种情况下未完成的任务将被取消
     * @throws NullPointerException 如果任务、单位或任何元素任务为{@code null}
     * @throws TimeoutException 如果在任何任务成功完成之前超时到期
     * @throws ExecutionException 如果没有任务成功完成
     * @throws RejectedExecutionException 如果任务无法被调度执行
     */
    <T> T invokeAny(Collection<? extends Callable<T>> tasks) // 执行任务并返回成功结果的方法
        throws InterruptedException, ExecutionException;

    /**
     * 执行给定的任务，返回一个成功完成的任务的结果
     * （即没有抛出异常），如果有的话。在正常或异常返回时，
     * 未完成的任务将被取消。
     * 如果在此操作进行时修改给定的集合，则此方法的结果是未定义的。
     *
     * @param tasks 任务集合
     * @param <T> 从任务返回的值的类型
     * @return 由一个任务返回的结果
     * @throws InterruptedException 如果在等待时被中断
     * @throws NullPointerException 如果任务或任何元素任务
     *         为{@code null}
     * @throws IllegalArgumentException 如果任务为空
     * @throws ExecutionException 如果没有任务成功完成
     * @throws RejectedExecutionException 如果任务无法被调度执行
     */
    <T> T invokeAny(Collection<? extends Callable<T>> tasks,
                    long timeout, TimeUnit unit) // 执行任务并返回成功结果的方法，带超时参数
        throws InterruptedException, ExecutionException, TimeoutException;
}
```

```java
    static BlockingQueue blockingQueue = new LinkedBlockingQueue<>(100); // 创建一个容量为100的阻塞队列，超过100个等待任务时判定为异常，允许抛出
    // 创建一个固定大小的线程池，线程池的核心线程数为当前可用处理器的数量，最大线程数为当前可用处理器的数量乘以4，线程空闲时间超过10秒则被回收
    static ExecutorService fixedThreadPool = new ThreadPoolExecutor(Runtime.getRuntime().availableProcessors(), // 核心线程数
            Runtime.getRuntime().availableProcessors() * 4, // 最大线程数
            10, // 线程空闲时间
            TimeUnit.SECONDS, // 时间单位为秒
            blockingQueue, // 使用上面创建的阻塞队列作为任务队列
            new ThreadFactory() { // 自定义线程工厂
                // 定义一个原子整数，用于生成线程的编号
                private final AtomicInteger threadNumber = new AtomicInteger(1);
                // 定义线程的名称前缀
                private final String namePrefix = ""; // 线程名称前缀
                // 重写newThread方法，用于创建线程
                @Override
                public Thread newThread(Runnable r) {
                    // 创建线程，并设置线程的名称为前缀加上线程编号
                    Thread t = new Thread(r, namePrefix + threadNumber.getAndIncrement()); // 设置线程名称
                    return t; // 返回创建的线程
                }
            });
```
















