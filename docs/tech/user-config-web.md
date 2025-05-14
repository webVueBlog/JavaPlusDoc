---
title: 配置类
author: 哪吒
date: '2020-01-01'
---

> 点击勘误[issues](https://github.com/webVueBlog/JavaPlusDoc/issues)，哪吒感谢大家的阅读

<img align="right" width="100" src="https://cdn.jsdelivr.net/gh/YunYouJun/yun/images/yun-alpha-compressed.png">

## 配置类

1. @Configuration//配置类
2. @RefreshScope//开启自动刷新
3. WebMvcConfigurationSupport 是springmvc的配置类，可以配置拦截器、视图解析器、消息转换器等

```java

public class WebMvcConfigurationSupport implements ApplicationContextAware, ServletContextAware {
    // 是否存在Rome
    private static final boolean romePresent;
    // 是否存在JAXB2
    private static final boolean jaxb2Present;
    // 是否存在Jackson2
    private static final boolean jackson2Present;
    // 是否存在Jackson2Xml
    private static final boolean jackson2XmlPresent;
    // 是否存在Jackson2Smile
    private static final boolean jackson2SmilePresent;
    // 是否存在Jackson2Cbor
    private static final boolean jackson2CborPresent;
    // 是否存在Gson
    private static final boolean gsonPresent;
    // 是否存在Jsonb
    private static final boolean jsonbPresent;
    // Spring应用上下文
    @Nullable
    private ApplicationContext applicationContext;
    // Servlet上下文
    @Nullable
    private ServletContext servletContext;
    // 拦截器
    @Nullable
    private List<Object> interceptors;
    // 路径匹配配置
    @Nullable
    private PathMatchConfigurer pathMatchConfigurer;
    // 内容协商管理器
    @Nullable
    private ContentNegotiationManager contentNegotiationManager;
    // 参数解析器
    @Nullable
    private List<HandlerMethodArgumentResolver> argumentResolvers;
    // 返回值处理器
    @Nullable
    private List<HandlerMethodReturnValueHandler> returnValueHandlers;
    // 消息转换器
    @Nullable
    private List<HttpMessageConverter<?>> messageConverters;
    // 跨域配置
    @Nullable
    private Map<String, CorsConfiguration> corsConfigurations;

    public WebMvcConfigurationSupport() {
    }

    // 设置Spring应用上下文
    public void setApplicationContext(@Nullable ApplicationContext applicationContext) {
        this.applicationContext = applicationContext;
    }

    // 获取Spring应用上下文
    @Nullable
    public final ApplicationContext getApplicationContext() {
        return this.applicationContext;
    }

    // 设置Servlet上下文
    public void setServletContext(@Nullable ServletContext servletContext) {
        this.servletContext = servletContext;
    }

    // 获取Servlet上下文
    @Nullable
    public final ServletContext getServletContext() {
        return this.servletContext;
    }

    // 创建RequestMappingHandlerMapping
    @Bean
    public RequestMappingHandlerMapping requestMappingHandlerMapping(@Qualifier("mvcContentNegotiationManager") ContentNegotiationManager contentNegotiationManager, @Qualifier("mvcConversionService") FormattingConversionService conversionService, @Qualifier("mvcResourceUrlProvider") ResourceUrlProvider resourceUrlProvider) {
        // 创建RequestMappingHandlerMapping
        RequestMappingHandlerMapping mapping = this.createRequestMappingHandlerMapping();
        // 设置优先级
        mapping.setOrder(0);
        // 设置拦截器
        mapping.setInterceptors(this.getInterceptors(conversionService, resourceUrlProvider));
        // 设置内容协商管理器
        mapping.setContentNegotiationManager(contentNegotiationManager);
        // 设置跨域配置
        mapping.setCorsConfigurations(this.getCorsConfigurations());
        // 获取路径匹配配置
        PathMatchConfigurer configurer = this.getPathMatchConfigurer();
        // 设置后缀匹配
        Boolean useSuffixPatternMatch = configurer.isUseSuffixPatternMatch();
        if (useSuffixPatternMatch != null) {
            mapping.setUseSuffixPatternMatch(useSuffixPatternMatch);
        }

        // 设置已注册后缀匹配
        Boolean useRegisteredSuffixPatternMatch = configurer.isUseRegisteredSuffixPatternMatch();
        if (useRegisteredSuffixPatternMatch != null) {
            mapping.setUseRegisteredSuffixPatternMatch(useRegisteredSuffixPatternMatch);
        }

        // 设置尾随斜杠匹配
        Boolean useTrailingSlashMatch = configurer.isUseTrailingSlashMatch();
        if (useTrailingSlashMatch != null) {
            mapping.setUseTrailingSlashMatch(useTrailingSlashMatch);
        }

        // 设置URL路径助手
        UrlPathHelper pathHelper = configurer.getUrlPathHelper();
        if (pathHelper != null) {
            mapping.setUrlPathHelper(pathHelper);
        }

        // 设置路径匹配器
        PathMatcher pathMatcher = configurer.getPathMatcher();
        if (pathMatcher != null) {
            mapping.setPathMatcher(pathMatcher);
        }

        // 设置路径前缀
        Map<String, Predicate<Class<?>>> pathPrefixes = configurer.getPathPrefixes();
        if (pathPrefixes != null) {
            mapping.setPathPrefixes(pathPrefixes);
        }

        // 返回RequestMappingHandlerMapping
        return mapping;
    }

    // 创建RequestMappingHandlerMapping对象
    protected RequestMappingHandlerMapping createRequestMappingHandlerMapping() {
        // 返回RequestMappingHandlerMapping对象
        return new RequestMappingHandlerMapping();
    }

    // 获取拦截器
    protected final Object[] getInterceptors(FormattingConversionService mvcConversionService, ResourceUrlProvider mvcResourceUrlProvider) {
        // 如果拦截器为空
        if (this.interceptors == null) {
            // 创建拦截器注册表
            InterceptorRegistry registry = new InterceptorRegistry();
            // 添加拦截器
            this.addInterceptors(registry);
            // 添加转换服务暴露拦截器
            registry.addInterceptor(new ConversionServiceExposingInterceptor(mvcConversionService));
            // 添加资源URL提供者暴露拦截器
            registry.addInterceptor(new ResourceUrlProviderExposingInterceptor(mvcResourceUrlProvider));
            // 获取拦截器
            this.interceptors = registry.getInterceptors();
        }

        // 返回拦截器数组
        return this.interceptors.toArray();
    }

    // 添加拦截器
    protected void addInterceptors(InterceptorRegistry registry) {
        // TODO Auto-generated method stub
    }

    // 获取PathMatchConfigurer对象
    protected PathMatchConfigurer getPathMatchConfigurer() {
        // 如果pathMatchConfigurer为空
        if (this.pathMatchConfigurer == null) {
            // 创建一个新的PathMatchConfigurer对象
            this.pathMatchConfigurer = new PathMatchConfigurer();
            // 调用configurePathMatch方法，对pathMatchConfigurer进行配置
            this.configurePathMatch(this.pathMatchConfigurer);
        }

        // 返回pathMatchConfigurer对象
        return this.pathMatchConfigurer;
    }

    // 对PathMatchConfigurer对象进行配置
    protected void configurePathMatch(PathMatchConfigurer configurer) {
    }

    // 定义一个名为mvcPathMatcher的Bean
    @Bean
    public PathMatcher mvcPathMatcher() {
        // 获取PathMatchConfigurer中的PathMatcher
        PathMatcher pathMatcher = this.getPathMatchConfigurer().getPathMatcher();
        // 如果PathMatcher不为空，则返回PathMatcher，否则返回AntPathMatcher
        return (PathMatcher) (pathMatcher != null ? pathMatcher : new AntPathMatcher());
    }

    // 创建UrlPathHelper对象
    @Bean
    public UrlPathHelper mvcUrlPathHelper() {
        // 获取PathMatchConfigurer中的UrlPathHelper对象
        UrlPathHelper pathHelper = this.getPathMatchConfigurer().getUrlPathHelper();
        // 如果UrlPathHelper对象不为空，则返回该对象，否则返回一个新的UrlPathHelper对象
        return pathHelper != null ? pathHelper : new UrlPathHelper();
    }

    // 创建ContentNegotiationManager对象
    @Bean
    public ContentNegotiationManager mvcContentNegotiationManager() {
        // 如果contentNegotiationManager对象为空，则创建一个新的ContentNegotiationConfigurer对象
        if (this.contentNegotiationManager == null) {
            ContentNegotiationConfigurer configurer = new ContentNegotiationConfigurer(this.servletContext);
            // 设置默认的媒体类型
            configurer.mediaTypes(this.getDefaultMediaTypes());
            // 配置ContentNegotiationConfigurer对象
            this.configureContentNegotiation(configurer);
            // 构建ContentNegotiationManager对象
            this.contentNegotiationManager = configurer.buildContentNegotiationManager();
        }

        // 返回contentNegotiationManager对象
        return this.contentNegotiationManager;
    }

    // 获取默认的媒体类型
    protected Map<String, MediaType> getDefaultMediaTypes() {
        // 创建一个容量为4的HashMap
        Map<String, MediaType> map = new HashMap(4);
        // 如果romePresent为true，则将"atom"和"rss"添加到map中
        if (romePresent) {
            map.put("atom", MediaType.APPLICATION_ATOM_XML);
            map.put("rss", MediaType.APPLICATION_RSS_XML);
        }

        // 如果jaxb2Present或jackson2XmlPresent为true，则将"xml"添加到map中
        if (jaxb2Present || jackson2XmlPresent) {
            map.put("xml", MediaType.APPLICATION_XML);
        }

        // 如果jackson2Present、gsonPresent或jsonbPresent为true，则将"json"添加到map中
        if (jackson2Present || gsonPresent || jsonbPresent) {
            map.put("json", MediaType.APPLICATION_JSON);
        }

        // 如果jackson2SmilePresent为true，则将"smile"添加到map中
        if (jackson2SmilePresent) {
            map.put("smile", MediaType.valueOf("application/x-jackson-smile"));
        }

        // 如果jackson2CborPresent为true，则将"cbor"添加到map中
        if (jackson2CborPresent) {
            map.put("cbor", MediaType.APPLICATION_CBOR);
        }

        // 返回map
        return map;
    }

    protected void configureContentNegotiation(ContentNegotiationConfigurer configurer) {
        // 创建RequestMappingHandlerMapping
    }

    @Bean
    @Nullable
    // 获取拦截器
    public HandlerMapping viewControllerHandlerMapping(@Qualifier("mvcPathMatcher") PathMatcher pathMatcher, @Qualifier("mvcUrlPathHelper") UrlPathHelper urlPathHelper, @Qualifier("mvcConversionService") FormattingConversionService conversionService, @Qualifier("mvcResourceUrlProvider") ResourceUrlProvider resourceUrlProvider) {
        ViewControllerRegistry registry = new ViewControllerRegistry(this.applicationContext);
        this.addViewControllers(registry);
        AbstractHandlerMapping handlerMapping = registry.buildHandlerMapping();
        if (handlerMapping == null) {
            return null;
        } else {
            handlerMapping.setPathMatcher(pathMatcher);
            handlerMapping.setUrlPathHelper(urlPathHelper);
            handlerMapping.setInterceptors(this.getInterceptors(conversionService, resourceUrlProvider));
            handlerMapping.setCorsConfigurations(this.getCorsConfigurations());
            return handlerMapping;
            // 添加拦截器
        }
    }

    // 获取路径匹配配置
    protected void addViewControllers(ViewControllerRegistry registry) {
    }

    @Bean
    public BeanNameUrlHandlerMapping beanNameHandlerMapping(@Qualifier("mvcConversionService") FormattingConversionService conversionService, @Qualifier("mvcResourceUrlProvider") ResourceUrlProvider resourceUrlProvider) {
        // 创建BeanNameUrlHandlerMapping对象
        BeanNameUrlHandlerMapping mapping = new BeanNameUrlHandlerMapping();
        // 设置优先级
        mapping.setOrder(2);
        // 设置拦截器
        mapping.setInterceptors(this.getInterceptors(conversionService, resourceUrlProvider));
        // 设置跨域配置
        mapping.setCorsConfigurations(this.getCorsConfigurations());
        // 配置路径匹配
        return mapping;
    }

    // 创建PathMatcher
    @Bean
    public RouterFunctionMapping routerFunctionMapping(@Qualifier("mvcConversionService") FormattingConversionService conversionService, @Qualifier("mvcResourceUrlProvider") ResourceUrlProvider resourceUrlProvider) {
        // 创建RouterFunctionMapping
        RouterFunctionMapping mapping = new RouterFunctionMapping();
        // 设置优先级
        mapping.setOrder(3);
        // 设置拦截器
        mapping.setInterceptors(this.getInterceptors(conversionService, resourceUrlProvider));
        // 设置跨域配置
        mapping.setCorsConfigurations(this.getCorsConfigurations());
        // 创建UrlPathHelper
        // 设置消息转换器
        mapping.setMessageConverters(this.getMessageConverters());
        return mapping;
    }

    @Bean
    @Nullable
    // 创建ContentNegotiationManager
    public HandlerMapping resourceHandlerMapping(@Qualifier("mvcUrlPathHelper") UrlPathHelper urlPathHelper, @Qualifier("mvcPathMatcher") PathMatcher pathMatcher, @Qualifier("mvcContentNegotiationManager") ContentNegotiationManager contentNegotiationManager, @Qualifier("mvcConversionService") FormattingConversionService conversionService, @Qualifier("mvcResourceUrlProvider") ResourceUrlProvider resourceUrlProvider) {
        Assert.state(this.applicationContext != null, "No ApplicationContext set");
        Assert.state(this.servletContext != null, "No ServletContext set");
        // 创建ResourceHandlerRegistry
        ResourceHandlerRegistry registry = new ResourceHandlerRegistry(this.applicationContext, this.servletContext, contentNegotiationManager, urlPathHelper);
        // 添加资源处理器
        this.addResourceHandlers(registry);
        // 获取处理器映射
        AbstractHandlerMapping handlerMapping = registry.getHandlerMapping();
        if (handlerMapping == null) {
            return null;
        } else {
            // 设置路径匹配器和URL路径助手
            handlerMapping.setPathMatcher(pathMatcher);
            handlerMapping.setUrlPathHelper(urlPathHelper);
            // 设置拦截器
            handlerMapping.setInterceptors(this.getInterceptors(conversionService, resourceUrlProvider));
            // 获取默认的媒体类型
            handlerMapping.setCorsConfigurations(this.getCorsConfigurations());
            return handlerMapping;
        }
    }

    // 添加资源处理器
    protected void addResourceHandlers(ResourceHandlerRegistry registry) {
        // TODO Auto-generated method stub
    }

    @Bean
    // 定义一个名为mvcResourceUrlProvider的Bean
    public ResourceUrlProvider mvcResourceUrlProvider() {
        // 创建一个ResourceUrlProvider对象
        ResourceUrlProvider urlProvider = new ResourceUrlProvider();
        // 获取UrlPathHelper对象
        UrlPathHelper pathHelper = this.getPathMatchConfigurer().getUrlPathHelper();
        // 如果UrlPathHelper对象不为空，则将其设置到urlProvider中
        if (pathHelper != null) {
            urlProvider.setUrlPathHelper(pathHelper);
        }

        // 获取PathMatcher对象
        PathMatcher pathMatcher = this.getPathMatchConfigurer().getPathMatcher();
        // 如果PathMatcher对象不为空，则将其设置到urlProvider中
        if (pathMatcher != null) {
            urlProvider.setPathMatcher(pathMatcher);
        }

        // 返回urlProvider对象
        return urlProvider;
    }

    @Bean
    @Nullable
    // 配置内容协商
    public HandlerMapping defaultServletHandlerMapping() {
        Assert.state(this.servletContext != null, "No ServletContext set");
        DefaultServletHandlerConfigurer configurer = new DefaultServletHandlerConfigurer(this.servletContext);
        // 创建ViewControllerHandlerMapping
        this.configureDefaultServletHandling(configurer);
        return configurer.buildHandlerMapping();
    }

    // 配置默认的Servlet处理
    protected void configureDefaultServletHandling(DefaultServletHandlerConfigurer configurer) {
        // TODO Auto-generated method stub
    }

    @Bean
    // 创建RequestMappingHandlerAdapter
    public RequestMappingHandlerAdapter requestMappingHandlerAdapter(@Qualifier("mvcContentNegotiationManager") ContentNegotiationManager contentNegotiationManager, @Qualifier("mvcConversionService") FormattingConversionService conversionService, @Qualifier("mvcValidator") Validator validator) {
        RequestMappingHandlerAdapter adapter = this.createRequestMappingHandlerAdapter();
        // 设置内容协商管理器
        adapter.setContentNegotiationManager(contentNegotiationManager);
        // 设置消息转换器
        adapter.setMessageConverters(this.getMessageConverters());
        // 设置Web绑定初始化器
        adapter.setWebBindingInitializer(this.getConfigurableWebBindingInitializer(conversionService, validator));
        // 设置自定义参数解析器
        adapter.setCustomArgumentResolvers(this.getArgumentResolvers());
        // 设置自定义返回值处理器
        adapter.setCustomReturnValueHandlers(this.getReturnValueHandlers());
        // 如果存在Jackson2，则设置请求体和响应体的视图控制器
        if (jackson2Present) {
            adapter.setRequestBodyAdvice(Collections.singletonList(new JsonViewRequestBodyAdvice()));
            // 添加视图控制器
            adapter.setResponseBodyAdvice(Collections.singletonList(new JsonViewResponseBodyAdvice()));
        }

        // 创建BeanNameUrlHandlerMapping
        AsyncSupportConfigurer configurer = new AsyncSupportConfigurer();
        // 配置异步支持
        this.configureAsyncSupport(configurer);
        // 如果存在任务执行器，则设置任务执行器
        if (configurer.getTaskExecutor() != null) {
            adapter.setTaskExecutor(configurer.getTaskExecutor());
        }

        // 如果存在超时时间，则设置超时时间
        if (configurer.getTimeout() != null) {
            adapter.setAsyncRequestTimeout(configurer.getTimeout());
        }
        // 创建RouterFunctionMapping

        // 设置可调用拦截器
        adapter.setCallableInterceptors(configurer.getCallableInterceptors());
        // 设置延迟结果拦截器
        adapter.setDeferredResultInterceptors(configurer.getDeferredResultInterceptors());
        return adapter;
    }

    // 创建RequestMappingHandlerAdapter
    protected RequestMappingHandlerAdapter createRequestMappingHandlerAdapter() {
        return new RequestMappingHandlerAdapter();
    }

    // 创建ResourceHandlerMapping
    @Bean
    public HandlerFunctionAdapter handlerFunctionAdapter() {
        return new HandlerFunctionAdapter();
    }

    // 获取可配置的Web绑定初始化器
    protected ConfigurableWebBindingInitializer getConfigurableWebBindingInitializer(FormattingConversionService mvcConversionService, Validator mvcValidator) {
        // 创建可配置的Web绑定初始化器
        ConfigurableWebBindingInitializer initializer = new ConfigurableWebBindingInitializer();
        // 设置转换服务
        initializer.setConversionService(mvcConversionService);
        // 设置验证器
        initializer.setValidator(mvcValidator);
        // 获取消息代码解析器
        MessageCodesResolver messageCodesResolver = this.getMessageCodesResolver();
        // 如果消息代码解析器不为空，则设置消息代码解析器
        if (messageCodesResolver != null) {
            initializer.setMessageCodesResolver(messageCodesResolver);
        }

        // 返回可配置的Web绑定初始化器
        return initializer;
    }

    @Nullable
    protected MessageCodesResolver getMessageCodesResolver() {
        // 添加资源处理器
        return null;
    }

    // 创建ResourceUrlProvider
    protected void configureAsyncSupport(AsyncSupportConfigurer configurer) {
    }

    // 定义一个FormattingConversionService类型的Bean
    @Bean
    public FormattingConversionService mvcConversionService() {
        // 创建一个DefaultFormattingConversionService对象
        FormattingConversionService conversionService = new DefaultFormattingConversionService();
        // 调用addFormatters方法，将自定义的格式化器添加到conversionService中
        this.addFormatters(conversionService);
        // 返回conversionService对象
        return conversionService;
    }

    // 添加格式化器
    protected void addFormatters(FormatterRegistry registry) {
        // TODO Auto-generated method stub
    }

    @Bean
    public Validator mvcValidator() {
        Validator validator = this.getValidator();
        // 创建DefaultServletHandlerMapping
        if (validator == null) {
            if (ClassUtils.isPresent("javax.validation.Validator", this.getClass().getClassLoader())) {
                Class clazz;
                try {
                    String className = "org.springframework.validation.beanvalidation.OptionalValidatorFactoryBean";
                    clazz = ClassUtils.forName(className, WebMvcConfigurationSupport.class.getClassLoader());
                } catch (LinkageError | ClassNotFoundException var4) {
                    Throwable ex = var4;
                    throw new BeanInitializationException("Failed to resolve default validator class", ex);
                    // 配置DefaultServletHandler
                }

                validator = (Validator) BeanUtils.instantiateClass(clazz);
                // 创建RequestMappingHandlerAdapter
            } else {
                validator = new NoOpValidator();
            }
        }

        return (Validator) validator;
    }

    // 获取验证器
    @Nullable
    protected Validator getValidator() {
        return null;
    }

    // 获取参数解析器列表
    protected final List<HandlerMethodArgumentResolver> getArgumentResolvers() {
        // 如果参数解析器列表为空
        if (this.argumentResolvers == null) {
            // 创建一个新的参数解析器列表
            this.argumentResolvers = new ArrayList();
            // 添加参数解析器
            this.addArgumentResolvers(this.argumentResolvers);
        }

        // 返回参数解析器列表
        return this.argumentResolvers;
    }

    // 添加参数解析器
    protected void addArgumentResolvers(List<HandlerMethodArgumentResolver> argumentResolvers) {
    }

    protected final List<HandlerMethodReturnValueHandler> getReturnValueHandlers() {
        // 如果returnValueHandlers为空
        if (this.returnValueHandlers == null) {
            // 创建一个ArrayList
            this.returnValueHandlers = new ArrayList();
            // 创建RequestMappingHandlerAdapter
            this.addReturnValueHandlers(this.returnValueHandlers);
        }

        // 返回returnValueHandlers
        return this.returnValueHandlers;
        // 创建HandlerFunctionAdapter
    }

    // 添加返回值处理器
    protected void addReturnValueHandlers(List<HandlerMethodReturnValueHandler> returnValueHandlers) {
    }

    // 获取ConfigurableWebBindingInitializer
    protected final List<HttpMessageConverter<?>> getMessageConverters() {
        // 如果messageConverters为空
        if (this.messageConverters == null) {
            // 创建一个新的ArrayList
            this.messageConverters = new ArrayList();
            // 配置messageConverters
            this.configureMessageConverters(this.messageConverters);
            // 如果messageConverters为空
            if (this.messageConverters.isEmpty()) {
                // 添加默认的HttpMessageConverter
                this.addDefaultHttpMessageConverters(this.messageConverters);
            }

            // 扩展messageConverters
            this.extendMessageConverters(this.messageConverters);
        }

        // 返回messageConverters
        return this.messageConverters;
        // 获取MessageCodesResolver
    }

    // 配置消息转换器
    protected void configureMessageConverters(List<HttpMessageConverter<?>> converters) {
    }

    // 配置异步支持
    protected void extendMessageConverters(List<HttpMessageConverter<?>> converters) {
    }

    // 创建FormattingConversionService
    protected final void addDefaultHttpMessageConverters(List<HttpMessageConverter<?>> messageConverters) {
        messageConverters.add(new ByteArrayHttpMessageConverter());
        messageConverters.add(new StringHttpMessageConverter());
        messageConverters.add(new ResourceHttpMessageConverter());
        messageConverters.add(new ResourceRegionHttpMessageConverter());

        try {
            // 添加格式化器
            messageConverters.add(new SourceHttpMessageConverter());
        } catch (Throwable var3) {
        }
        // 创建Validator

        messageConverters.add(new AllEncompassingFormHttpMessageConverter());
        if (romePresent) {
            messageConverters.add(new AtomFeedHttpMessageConverter());
            messageConverters.add(new RssChannelHttpMessageConverter());
        }

        Jackson2ObjectMapperBuilder builder;
        if (jackson2XmlPresent) {
            builder = Jackson2ObjectMapperBuilder.xml();
            if (this.applicationContext != null) {
                builder.applicationContext(this.applicationContext);
            }

            messageConverters.add(new MappingJackson2XmlHttpMessageConverter(builder.build()));
        } else if (jaxb2Present) {
            messageConverters.add(new Jaxb2RootElementHttpMessageConverter());
        }

        if (jackson2Present) {
            builder = Jackson2ObjectMapperBuilder.json();
            if (this.applicationContext != null) {
                builder.applicationContext(this.applicationContext);
                // 获取Validator
            }

            messageConverters.add(new MappingJackson2HttpMessageConverter(builder.build()));
        } else if (gsonPresent) {
            messageConverters.add(new GsonHttpMessageConverter());
            // 获取参数解析器
        } else if (jsonbPresent) {
            messageConverters.add(new JsonbHttpMessageConverter());
        }

        if (jackson2SmilePresent) {
            builder = Jackson2ObjectMapperBuilder.smile();
            if (this.applicationContext != null) {
                builder.applicationContext(this.applicationContext);
            }
            // 添加参数解析器

            messageConverters.add(new MappingJackson2SmileHttpMessageConverter(builder.build()));
        }
        // 获取返回值处理器

        if (jackson2CborPresent) {
            builder = Jackson2ObjectMapperBuilder.cbor();
            if (this.applicationContext != null) {
                builder.applicationContext(this.applicationContext);
            }

            messageConverters.add(new MappingJackson2CborHttpMessageConverter(builder.build()));
        }
        // 添加返回值处理器

    }
    // 获取消息转换器

    @Bean
    public CompositeUriComponentsContributor mvcUriComponentsContributor(@Qualifier("mvcConversionService") FormattingConversionService conversionService, @Qualifier("requestMappingHandlerAdapter") RequestMappingHandlerAdapter requestMappingHandlerAdapter) {
        return new CompositeUriComponentsContributor(requestMappingHandlerAdapter.getArgumentResolvers(), conversionService);
    }

    @Bean
    public HttpRequestHandlerAdapter httpRequestHandlerAdapter() {
        // 配置消息转换器
        return new HttpRequestHandlerAdapter();
    }

    // 扩展消息转换器
    @Bean
    public SimpleControllerHandlerAdapter simpleControllerHandlerAdapter() {
        // 添加默认的消息转换器
        return new SimpleControllerHandlerAdapter();
    }

    @Bean
    public HandlerExceptionResolver handlerExceptionResolver(@Qualifier("mvcContentNegotiationManager") ContentNegotiationManager contentNegotiationManager) {
        List<HandlerExceptionResolver> exceptionResolvers = new ArrayList();
        this.configureHandlerExceptionResolvers(exceptionResolvers);
        if (exceptionResolvers.isEmpty()) {
            this.addDefaultHandlerExceptionResolvers(exceptionResolvers, contentNegotiationManager);
        }

        this.extendHandlerExceptionResolvers(exceptionResolvers);
        HandlerExceptionResolverComposite composite = new HandlerExceptionResolverComposite();
        composite.setOrder(0);
        composite.setExceptionResolvers(exceptionResolvers);
        return composite;
    }

    protected void configureHandlerExceptionResolvers(List<HandlerExceptionResolver> exceptionResolvers) {
    }

    protected void extendHandlerExceptionResolvers(List<HandlerExceptionResolver> exceptionResolvers) {
    }

    protected final void addDefaultHandlerExceptionResolvers(List<HandlerExceptionResolver> exceptionResolvers, ContentNegotiationManager mvcContentNegotiationManager) {
        ExceptionHandlerExceptionResolver exceptionHandlerResolver = this.createExceptionHandlerExceptionResolver();
        exceptionHandlerResolver.setContentNegotiationManager(mvcContentNegotiationManager);
        exceptionHandlerResolver.setMessageConverters(this.getMessageConverters());
        exceptionHandlerResolver.setCustomArgumentResolvers(this.getArgumentResolvers());
        exceptionHandlerResolver.setCustomReturnValueHandlers(this.getReturnValueHandlers());
        if (jackson2Present) {
            exceptionHandlerResolver.setResponseBodyAdvice(Collections.singletonList(new JsonViewResponseBodyAdvice()));
        }

        if (this.applicationContext != null) {
            exceptionHandlerResolver.setApplicationContext(this.applicationContext);
        }

        exceptionHandlerResolver.afterPropertiesSet();
        exceptionResolvers.add(exceptionHandlerResolver);
        ResponseStatusExceptionResolver responseStatusResolver = new ResponseStatusExceptionResolver();
        responseStatusResolver.setMessageSource(this.applicationContext);
        exceptionResolvers.add(responseStatusResolver);
        exceptionResolvers.add(new DefaultHandlerExceptionResolver());
    }

    protected ExceptionHandlerExceptionResolver createExceptionHandlerExceptionResolver() {
        return new ExceptionHandlerExceptionResolver();
    }

    @Bean
    public ViewResolver mvcViewResolver(@Qualifier("mvcContentNegotiationManager") ContentNegotiationManager contentNegotiationManager) {
        ViewResolverRegistry registry = new ViewResolverRegistry(contentNegotiationManager, this.applicationContext);
        this.configureViewResolvers(registry);
        if (registry.getViewResolvers().isEmpty() && this.applicationContext != null) {
            String[] names = BeanFactoryUtils.beanNamesForTypeIncludingAncestors(this.applicationContext, ViewResolver.class, true, false);
            if (names.length == 1) {
                // 创建CompositeUriComponentsContributor
                registry.getViewResolvers().add(new InternalResourceViewResolver());
            }
        }

        ViewResolverComposite composite = new ViewResolverComposite();
        composite.setOrder(registry.getOrder());
        composite.setViewResolvers(registry.getViewResolvers());
        if (this.applicationContext != null) {
            composite.setApplicationContext(this.applicationContext);
        }

        if (this.servletContext != null) {
            composite.setServletContext(this.servletContext);
        }

        return composite;
    }

    protected void configureViewResolvers(ViewResolverRegistry registry) {
    }

    protected final Map<String, CorsConfiguration> getCorsConfigurations() {
        if (this.corsConfigurations == null) {
            CorsRegistry registry = new CorsRegistry();
            this.addCorsMappings(registry);
            this.corsConfigurations = registry.getCorsConfigurations();
        }

        return this.corsConfigurations;
    }

    protected void addCorsMappings(CorsRegistry registry) {
    }

    @Bean
    @Lazy
    public HandlerMappingIntrospector mvcHandlerMappingIntrospector() {
        return new HandlerMappingIntrospector();
    }

    static {
        ClassLoader classLoader = WebMvcConfigurationSupport.class.getClassLoader();
        romePresent = ClassUtils.isPresent("com.rometools.rome.feed.WireFeed", classLoader);
        jaxb2Present = ClassUtils.isPresent("javax.xml.bind.Binder", classLoader);
        jackson2Present = ClassUtils.isPresent("com.fasterxml.jackson.databind.ObjectMapper", classLoader) && ClassUtils.isPresent("com.fasterxml.jackson.core.JsonGenerator", classLoader);
        jackson2XmlPresent = ClassUtils.isPresent("com.fasterxml.jackson.dataformat.xml.XmlMapper", classLoader);
        jackson2SmilePresent = ClassUtils.isPresent("com.fasterxml.jackson.dataformat.smile.SmileFactory", classLoader);
        jackson2CborPresent = ClassUtils.isPresent("com.fasterxml.jackson.dataformat.cbor.CBORFactory", classLoader);
        gsonPresent = ClassUtils.isPresent("com.google.gson.Gson", classLoader);
        jsonbPresent = ClassUtils.isPresent("javax.json.bind.Jsonb", classLoader);
    }

    private static final class NoOpValidator implements Validator {
        private NoOpValidator() {
        }

        public boolean supports(Class<?> clazz) {
            return false;
        }

        public void validate(@Nullable Object target, Errors errors) {
        }
    }
}

```
