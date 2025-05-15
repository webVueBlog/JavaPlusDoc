---
title: 处理校验逻辑
author: 哪吒
date: '2020-01-01'
---

> 点击勘误[issues](https://github.com/webVueBlog/JavaPlusDoc/issues)，哪吒感谢大家的阅读

<img align="right" width="100" src="https://cdn.jsdelivr.net/gh/YunYouJun/yun/images/yun-alpha-compressed.png">

## 处理校验逻辑

需要对请求参数进行校验，比如说非空啊、长度限制啊等等，可选的解决方案有两种：

1. 一种是用 Hibernate Validator 来处理
2. 一种是用全局异常来处理

## 一、Hibernate Validator

Spring Boot 已经内置了 Hibernate Validator 校验框架，这个可以通过 Spring Boot 官网查看和确认。

第一步，进入 Spring Boot 官网，点击 learn 这个面板，点击参考文档。

## 第二步，在参考文档页点击「依赖的版本」。

第三步，在依赖版本页就可以查看到所有的依赖了，包括版本号。

```
<dependency>
    <groupId>org.hibernate.validator</groupId>
    <artifactId>hibernate-validator</artifactId>
    <version>6.0.17.Final</version>
</dependency>
<dependency>
    <groupId>javax.validation</groupId>
    <artifactId>validation-api</artifactId>
    <version>2.0.1.Final</version>
</dependency>
```

通过 Hibernate Validator 校验框架，我们可以直接在请求参数的字段上加入注解来完成校验。

## 具体该怎么做呢？

第一步，在需要验证的字段上加上 Hibernate Validator 提供的校验注解。

比如说我现在有一个用户名和密码登录的请求参数 UsersLoginParam 类：

```
@Data
@ApiModel(value="用户登录", description="用户表")
public class UsersLoginParam implements Serializable {
    private static final long serialVersionUID = 1L;

    @ApiModelProperty(value = "登录名")
    @NotBlank(message="登录名不能为空")
    private String userLogin;

    @ApiModelProperty(value = "密码")
    @NotBlank(message="密码不能为空")
    private String userPass;
}
```

就可以通过 @NotBlank 注解来对用户名和密码进行判空校验。除了 @NotBlank 注解，Hibernate Validator 还提供了以下常用注解：

1. @NotNull：被注解的字段不能为 null；
2. @NotEmpty：被注解的字段不能为空；
3. @Min：被注解的字段必须大于等于其value值；
4. @Max：被注解的字段必须小于等于其value值；
5. @Size：被注解的字段必须在其min和max值之间；
6. @Pattern：被注解的字段必须符合所定义的正则表达式；
7. @Email：被注解的字段必须符合邮箱格式。

第二步，在对应的请求接口（UsersController.login()）中添加 @Validated 注解，并注入一个 BindingResult 参数。

```
@Controller
@Api(tags="用户")
@RequestMapping("/users")
public class UsersController {
    @Autowired
    private IUsersService usersService;

    @ApiOperation(value = "登录以后返回token")
    @RequestMapping(value = "/login", method = RequestMethod.POST)
    @ResponseBody
    public ResultObject login(@Validated UsersLoginParam users, BindingResult result) {
        String token = usersService.login(users.getUserLogin(), users.getUserPass());
        if (token == null) {
            return ResultObject.validateFailed("用户名或密码错误");
        }
        Map<String, String> tokenMap = new HashMap<>();
        tokenMap.put("token", token);
        tokenMap.put("tokenHead", tokenHead);
        return ResultObject.success(tokenMap);
    }
}
```

第三步，为控制层（UsersController）创建一个切面，将通知注入到 BindingResult 对象中，然后再判断是否有校验错误，有错误的话返回校验提示信息，否则放行。

```
@Aspect
@Component
@Order(2)
public class BindingResultAspect {
    @Pointcut("execution(public * com.codingmore.controller.*.*(..))")
    public void BindingResult() {
    }

    @Around("BindingResult()")
    public Object doAround(ProceedingJoinPoint joinPoint) throws Throwable {
        Object[] args = joinPoint.getArgs();
        for (Object arg : args) {
            if (arg instanceof BindingResult) {
                BindingResult result = (BindingResult) arg;
                if (result.hasErrors()) {
                    FieldError fieldError = result.getFieldError();
                    if(fieldError!=null){
                        return ResultObject.validateFailed(fieldError.getDefaultMessage());
                    }else{
                        return ResultObject.validateFailed();
                    }
                }
            }
        }
        return joinPoint.proceed();
    }
}
```
可以看得出，Hibernate Validator 带来的优势有这些：

1. 验证逻辑与业务逻辑进行了分离，降低了程序耦合度；
2. 统一且规范的验证方式，无需再次编写重复的验证代码。

不过，也带来一些弊端，比如说：

1. 需要在请求接口的方法中注入 BindingResult 对象，而这个对应在方法体中并没有用到
2. 只能校验一些非常简单的逻辑，涉及到数据查询就无能为力了。

二、全局异常处理

使用全局异常处理的优点就是比较灵活，可以处理比较复杂的逻辑校验，在校验失败的时候直接抛出异常，然后进行捕获处理就可以了。

第一步，新建一个自定义异常类 ApiException。

```
public class ApiException extends RuntimeException {
    private IErrorCode errorCode;

    public ApiException(IErrorCode errorCode) {
        super(errorCode.getMessage());
        this.errorCode = errorCode;
    }

    public ApiException(String message) {
        super(message);
    }

    public ApiException(Throwable cause) {
        super(cause);
    }

    public ApiException(String message, Throwable cause) {
        super(message, cause);
    }

    public IErrorCode getErrorCode() {
        return errorCode;
    }
}
```

第二步，新建一个断言处理类 Asserts，简化抛出 ApiException 的步骤。

```
public class Asserts {
    public static void fail(String message) {
        throw new ApiException(message);
    }

    public static void fail(IErrorCode errorCode) {
        throw new ApiException(errorCode);
    }
}
```

第三步，新建一全局异常处理类 GlobalExceptionHandler，对异常信息进行解析，并封装到统一的返回对象 ResultObject 中。

```
@ControllerAdvice
public class GlobalExceptionHandler {
    @ResponseBody
    @ExceptionHandler(value = ApiException.class)
    public ResultObject handle(ApiException e) {
        if (e.getErrorCode() != null) {
            return ResultObject.failed(e.getErrorCode());
        }
        return ResultObject.failed(e.getMessage());
    }
}
```

全局异常处理类用到了两个注解，@ControllerAdvice 和 @ExceptionHandler。

@ControllerAdvice 是一个特殊的 @Component（可以通过源码看得到），用于标识一个类，这个类中被以下三种注解标识的方法：@ExceptionHandler，@InitBinder，@ModelAttribute，将作用于所有@Controller 类的接口上。

```
@Target({ElementType.TYPE})
@Retention(RetentionPolicy.RUNTIME)
@Documented
@Component
public @interface ControllerAdvice {
}
```

@ExceptionHandler 注解的作用就是标识统一异常处理，它可以指定要统一处理的异常类型，比如说我们自定义的 ApiException。

第四步，在需要校验的地方通过 Asserts 类抛出异常 ApiException。还拿用户登录这个接口来说明吧。

```
@Controller
@Api(tags="用户")
@RequestMapping("/users")
public class UsersController {
    @ApiOperation(value = "登录以后返回token")
    @RequestMapping(value = "/login", method = RequestMethod.POST)
    @ResponseBody
    public ResultObject login(@Validated UsersLoginParam users, BindingResult result) {
        String token = usersService.login(users.getUserLogin(), users.getUserPass());
     
        Map<String, String> tokenMap = new HashMap<>();
        tokenMap.put("token", token);
        tokenMap.put("tokenHead", tokenHead);
        return ResultObject.success(tokenMap);
    }
}
```

该接口需要查询数据库验证密码是否正确，如果密码不正确就抛出校验信息“密码不正确”。

```
@Service
public class UsersServiceImpl extends ServiceImpl<UsersMapper, Users> implements IUsersService {
    public String login(String username, String password) {
        String token = null;
        //密码需要客户端加密后传递
        UserDetails userDetails = loadUserByUsername(username);
        if (!passwordEncoder.matches(password, userDetails.getPassword())) {
            Asserts.fail("密码不正确");
         }
        // 其他代码省略
        return token;
    }
}
```

```
config
controller
dto
mapper
model
service impl
webapi
```
