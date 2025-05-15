---
title: 超详细Netty入门
author: 哪吒
date: '2020-01-01'
---

> 点击勘误[issues](https://github.com/webVueBlog/JavaPlusDoc/issues)，哪吒感谢大家的阅读

<img align="right" width="100" src="https://cdn.jsdelivr.net/gh/YunYouJun/yun/images/yun-alpha-compressed.png">

## 超详细Netty入门

Netty是 一个异步事件驱动的网络应用程序框架，用于快速开发可维护的高性能协议服务器和客户端。

从官网上介绍，Netty是一个网络应用程序框架，开发服务器和客户端。也就是用于网络编程的一个框架。既然是网络编程，Socket就不谈了，为什么不用NIO呢？

### NIO的缺点

NIO的类库和API繁杂，学习成本高，你需要熟练掌握Selector、ServerSocketChannel、SocketChannel、ByteBuffer等。

需要熟悉Java多线程编程。这是因为NIO编程涉及到Reactor模式，你必须对多线程和网络编程非常熟悉，才能写出高质量的NIO程序。

### Netty的优点

相对地，Netty的优点有很多：

- API使用简单，学习成本低。
- 功能强大，内置了多种解码编码器，支持多种协议。
- 性能高，对比其他主流的NIO框架，Netty的性能最优。
- 社区活跃，发现BUG会及时修复，迭代版本周期短，不断加入新的功能。
- Dubbo、Elasticsearch都采用了Netty，质量得到验证。


绿色的部分Core核心模块，包括零拷贝、API库、可扩展的事件模型。

橙色部分Protocol Support协议支持，包括Http协议、webSocket、SSL(安全套接字协议)、谷歌Protobuf协议、zlib/gzip压缩与解压缩、Large File Transfer大文件传输等等。

红色的部分Transport Services传输服务，包括Socket、Datagram、Http Tunnel等等。

以上可看出Netty的功能、协议、传输方式都比较全，比较强大。

引入Maven依赖

使用的版本是4.1.20，相对比较稳定的一个版本。

	<dependency>
		<groupId>io.netty</groupId>
		<artifactId>netty-all</artifactId>
		<version>4.1.20.Final</version>
	</dependency>

### 建服务端启动类

```
public class MyServer {
    public static void main(String[] args) throws Exception {
        //创建两个线程组 boosGroup、workerGroup
        EventLoopGroup bossGroup = new NioEventLoopGroup();
        EventLoopGroup workerGroup = new NioEventLoopGroup();
        try {
            //创建服务端的启动对象，设置参数
            ServerBootstrap bootstrap = new ServerBootstrap();
            //设置两个线程组boosGroup和workerGroup
            bootstrap.group(bossGroup, workerGroup)
                //设置服务端通道实现类型    
                .channel(NioServerSocketChannel.class)
                //设置线程队列得到连接个数    
                .option(ChannelOption.SO_BACKLOG, 128)
                //设置保持活动连接状态    
                .childOption(ChannelOption.SO_KEEPALIVE, true)
                //使用匿名内部类的形式初始化通道对象    
                .childHandler(new ChannelInitializer<SocketChannel>() {
                        @Override
                        protected void initChannel(SocketChannel socketChannel) throws Exception {
                            //给pipeline管道设置处理器
                            socketChannel.pipeline().addLast(new MyServerHandler());
                        }
                    });//给workerGroup的EventLoop对应的管道设置处理器
            System.out.println("java技术爱好者的服务端已经准备就绪...");
            //绑定端口号，启动服务端
            ChannelFuture channelFuture = bootstrap.bind(6666).sync();
            //对关闭通道进行监听
            channelFuture.channel().closeFuture().sync();
        } finally {
            bossGroup.shutdownGracefully();
            workerGroup.shutdownGracefully();
        }
    }
}
```

### 创建服务端处理器

```
/**
 * 自定义的Handler需要继承Netty规定好的HandlerAdapter
 * 才能被Netty框架所关联，有点类似SpringMVC的适配器模式
 **/
public class MyServerHandler extends ChannelInboundHandlerAdapter {

    @Override
    public void channelRead(ChannelHandlerContext ctx, Object msg) throws Exception {
        //获取客户端发送过来的消息
        ByteBuf byteBuf = (ByteBuf) msg;
        System.out.println("收到客户端" + ctx.channel().remoteAddress() + "发送的消息：" + byteBuf.toString(CharsetUtil.UTF_8));
    }

    @Override
    public void channelReadComplete(ChannelHandlerContext ctx) throws Exception {
        //发送消息给客户端
        ctx.writeAndFlush(Unpooled.copiedBuffer("服务端已收到消息，并给你发送一个问号?", CharsetUtil.UTF_8));
    }

    @Override
    public void exceptionCaught(ChannelHandlerContext ctx, Throwable cause) throws Exception {
        //发生异常，关闭通道
        ctx.close();
    }
}
```

### 创建客户端启动类

```
public class MyClient {

    public static void main(String[] args) throws Exception {
        NioEventLoopGroup eventExecutors = new NioEventLoopGroup();
        try {
            //创建bootstrap对象，配置参数
            Bootstrap bootstrap = new Bootstrap();
            //设置线程组
            bootstrap.group(eventExecutors)
                //设置客户端的通道实现类型    
                .channel(NioSocketChannel.class)
                //使用匿名内部类初始化通道
                .handler(new ChannelInitializer<SocketChannel>() {
                        @Override
                        protected void initChannel(SocketChannel ch) throws Exception {
                            //添加客户端通道的处理器
                            ch.pipeline().addLast(new MyClientHandler());
                        }
                    });
            System.out.println("客户端准备就绪，随时可以起飞~");
            //连接服务端
            ChannelFuture channelFuture = bootstrap.connect("127.0.0.1", 6666).sync();
            //对通道关闭进行监听
            channelFuture.channel().closeFuture().sync();
        } finally {
            //关闭线程组
            eventExecutors.shutdownGracefully();
        }
    }
}
```

### 创建客户端处理器

```
public class MyClientHandler extends ChannelInboundHandlerAdapter {

    @Override
    public void channelActive(ChannelHandlerContext ctx) throws Exception {
        //发送消息到服务端
        ctx.writeAndFlush(Unpooled.copiedBuffer("歪比巴卜~茉莉~Are you good~马来西亚~", CharsetUtil.UTF_8));
    }

    @Override
    public void channelRead(ChannelHandlerContext ctx, Object msg) throws Exception {
        //接收服务端发送过来的消息
        ByteBuf byteBuf = (ByteBuf) msg;
        System.out.println("收到服务端" + ctx.channel().remoteAddress() + "的消息：" + byteBuf.toString(CharsetUtil.UTF_8));
    }
}
```


## Netty的特性与重要组件


taskQueue任务队列

如果Handler处理器有一些长时间的业务处理，可以交给taskQueue异步处理。

```
public class MyServerHandler extends ChannelInboundHandlerAdapter {

    @Override
    public void channelRead(ChannelHandlerContext ctx, Object msg) throws Exception {
        //获取到线程池eventLoop，添加线程，执行
        ctx.channel().eventLoop().execute(new Runnable() {
            @Override
            public void run() {
                try {
                    //长时间操作，不至于长时间的业务操作导致Handler阻塞
                    Thread.sleep(1000);
                    System.out.println("长时间的业务处理");
                } catch (Exception e) {
                    e.printStackTrace();
                }
            }
        });
    }
}
```

scheduleTaskQueue延时任务队列

```
ctx.channel().eventLoop().schedule(new Runnable() {
    @Override
    public void run() {
        try {
            //长时间操作，不至于长时间的业务操作导致Handler阻塞
            Thread.sleep(1000);
            System.out.println("长时间的业务处理");
        } catch (Exception e) {
            e.printStackTrace();
        }
    }
},5, TimeUnit.SECONDS);//5秒后执行
```

### Future异步机制

在搭建HelloWord工程的时候，我们看到有一行这样的代码：


ChannelFuture channelFuture = bootstrap.connect("127.0.0.1", 6666);
很多操作都返回这个ChannelFuture对象，究竟这个ChannelFuture对象是用来做什么的呢？

ChannelFuture提供操作完成时一种异步通知的方式。一般在Socket编程中，等待响应结果都是同步阻塞的，而Netty则不会造成阻塞，因为ChannelFuture是采取类似观察者模式的形式进行获取结果。

```
//添加监听器
channelFuture.addListener(new ChannelFutureListener() {
    //使用匿名内部类，ChannelFutureListener接口
    //重写operationComplete方法
    @Override
    public void operationComplete(ChannelFuture future) throws Exception {
        //判断是否操作成功    
        if (future.isSuccess()) {
            System.out.println("连接成功");
        } else {
            System.out.println("连接失败");
        }
    }
});
```

## Bootstrap与ServerBootStrap

Bootstrap和ServerBootStrap是Netty提供的一个创建客户端和服务端启动器的工厂类，使用这个工厂类非常便利地创建启动类

可以看出都是继承于AbstractBootStrap抽象类，所以大致上的配置方法都相同。


bossGroup 用于监听客户端连接，专门负责与客户端创建连接，并把连接注册到workerGroup的Selector中。

workerGroup用于处理每一个连接发生的读写事件。

一般创建线程组直接使用以下new就完事了：

```
EventLoopGroup bossGroup = new NioEventLoopGroup();
EventLoopGroup workerGroup = new NioEventLoopGroup();
```

有点好奇的是，既然是线程组，那线程数默认是多少呢？深入源码：

```
//使用一个常量保存
    private static final int DEFAULT_EVENT_LOOP_THREADS;

    static {
        //NettyRuntime.availableProcessors() * 2，cpu核数的两倍赋值给常量
        DEFAULT_EVENT_LOOP_THREADS = Math.max(1, SystemPropertyUtil.getInt(
                "io.netty.eventLoopThreads", NettyRuntime.availableProcessors() * 2));

        if (logger.isDebugEnabled()) {
            logger.debug("-Dio.netty.eventLoopThreads: {}", DEFAULT_EVENT_LOOP_THREADS);
        }
    }
    
    protected MultithreadEventLoopGroup(int nThreads, Executor executor, Object... args) {
        //如果不传入，则使用常量的值，也就是cpu核数的两倍
        super(nThreads == 0 ? DEFAULT_EVENT_LOOP_THREADS : nThreads, executor, args);
    }
```


通过源码可以看到，默认的线程数是cpu核数的两倍。


channel()

这个方法用于设置通道类型，当建立连接后，会根据这个设置创建对应的Channel实例。


NioSocketChannel： 异步非阻塞的客户端 TCP Socket 连接。

NioServerSocketChannel： 异步非阻塞的服务器端 TCP Socket 连接。


常用的就是这两个通道类型，因为是异步非阻塞的。所以是首选。

OioSocketChannel： 同步阻塞的客户端 TCP Socket 连接。

OioServerSocketChannel： 同步阻塞的服务器端 TCP Socket 连接


### option()与childOption()

option()设置的是服务端用于接收进来的连接，也就是boosGroup线程。

childOption()是提供给父管道接收到的连接，也就是workerGroup线程。

SocketChannel参数，也就是childOption()常用的参数：

SO_RCVBUF Socket参数，TCP数据接收缓冲区大小。

TCP_NODELAY TCP参数，立即发送数据，默认值为Ture。

SO_KEEPALIVE Socket参数，连接保活，默认值为False。启用该功能时，TCP会主动探测空闲连接的有效性。


ServerSocketChannel参数，也就是option()常用参数：

SO_BACKLOG Socket参数，服务端接受连接的队列长度，如果队列已满，客户端连接将被拒绝。默认值，Windows为200，其他为128。

## 设置流水线(重点)

ChannelPipeline是Netty处理请求的责任链，ChannelHandler则是具体处理请求的处理器。实际上每一个channel都有一个处理器的流水线。

在Bootstrap中childHandler()方法需要初始化通道，实例化一个ChannelInitializer，这时候需要重写initChannel()初始化通道的方法，装配流水线就是在这个地方进行。

```
//使用匿名内部类的形式初始化通道对象
bootstrap.childHandler(new ChannelInitializer<SocketChannel>() {
    @Override
    protected void initChannel(SocketChannel socketChannel) throws Exception {
        //给pipeline管道设置自定义的处理器
        socketChannel.pipeline().addLast(new MyServerHandler());
    }
});
```

处理器Handler主要分为两种：

ChannelInboundHandlerAdapter(入站处理器)、ChannelOutboundHandler(出站处理器)

入站指的是数据从底层java NIO Channel到Netty的Channel。

出站指的是通过Netty的Channel来操作底层的java NIO Channel。

ChannelInboundHandlerAdapter处理器常用的事件有：

	注册事件 fireChannelRegistered。
	连接建立事件 fireChannelActive。
	读事件和读完成事件 fireChannelRead、fireChannelReadComplete。
	异常通知事件 fireExceptionCaught。
	用户自定义事件 fireUserEventTriggered。
	Channel 可写状态变化事件 fireChannelWritabilityChanged。
	连接关闭事件 fireChannelInactive。

ChannelOutboundHandler处理器常用的事件有：

	端口绑定 bind。
	连接服务端 connect。
	写事件 write。
	刷新时间 flush。
	读事件 read。
	主动断开连接 disconnect。
	关闭 channel 事件 close。

### bind()

提供用于服务端或者客户端绑定服务器地址和端口号，默认是异步启动。如果加上sync()方法则是同步。

有五个同名的重载方法，作用都是用于绑定地址端口号。


### 优雅地关闭EventLoopGroup

	//释放掉所有的资源，包括创建的线程
	bossGroup.shutdownGracefully();
	workerGroup.shutdownGracefully();

会关闭所有的child Channel。关闭之后，释放掉底层的资源

一种连接到网络套接字或能进行读、写、连接和绑定等I/O操作的组件。

channel为用户提供：

通道当前的状态（例如它是打开？还是已连接？）

channel的配置参数（例如接收缓冲区的大小）

channel支持的IO操作（例如读、写、连接和绑定），以及处理与channel相关联的所有IO事件和请求的ChannelPipeline。


### Selector

在NioEventLoop中，有一个成员变量selector，这是nio包的Selector

Netty中的Selector也和NIO的Selector是一样的，就是用于监听事件，管理注册到Selector中的channel，实现多路复用器。

### PiPeline与ChannelPipeline

在前面介绍Channel时，我们知道可以在channel中装配ChannelHandler流水线处理器，那一个channel不可能只有一个channelHandler处理器，肯定是有很多的，既然是很多channelHandler在一个流水线工作，肯定是有顺序的。

于是pipeline就出现了，pipeline相当于处理器的容器。初始化channel时，把channelHandler按顺序装在pipeline中，就可以实现按序执行channelHandler了。

在一个Channel中，只有一个ChannelPipeline。该pipeline在Channel被创建的时候创建。ChannelPipeline包含了一个ChannelHander形成的列表，且所有ChannelHandler都会注册到ChannelPipeline中。

### ChannelHandlerContext

在Netty中，Handler处理器是有我们定义的，上面讲过通过集成入站处理器或者出站处理器实现。这时如果我们想在Handler中获取pipeline对象，或者channel对象，怎么获取呢。

于是Netty设计了这个ChannelHandlerContext上下文对象，就可以拿到channel、pipeline等对象，就可以进行读写等操作。

通过类图，ChannelHandlerContext是一个接口，下面有三个实现类。

实际上ChannelHandlerContext在pipeline中是一个链表的形式。


每个EventLoopGroup里包括一个或多个EventLoop，每个EventLoop中维护一个Selector实例。

### 轮询机制的实现原理

```
private final AtomicInteger idx = new AtomicInteger();
private final EventExecutor[] executors;

@Override
public EventExecutor next() {
    //idx.getAndIncrement()相当于idx++，然后对任务长度取模
    return executors[idx.getAndIncrement() & executors.length - 1];
}
```

它这里还有一个判断，如果线程数不是2的N次方，则采用取模算法实现。

```
@Override
public EventExecutor next() {
    return executors[Math.abs(idx.getAndIncrement() % executors.length)];
}
```


