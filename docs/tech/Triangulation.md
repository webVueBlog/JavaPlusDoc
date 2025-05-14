---
title: 用户登录认证服务
author: 哪吒
date: '2020-01-01'
---

> 点击勘误[issues](https://github.com/webVueBlog/JavaPlusDoc/issues)，哪吒感谢大家的阅读

<img align="right" width="100" src="https://cdn.jsdelivr.net/gh/YunYouJun/yun/images/yun-alpha-compressed.png">

## 用户登录认证服务

```java
    /**
     * tokenHeartbeatTMap数据展示
     * key: token
     * value: token心跳时间
     * 说明：tokenHeartbeatTMap用于存储token的心跳时间，以便在需要时清理过期的token
     */
    public static Map<String, Long> tokenHeartbeatTMap = new ConcurrentHashMap<>();
    // 用于存储token对应的用户登录信息
    /**
     * tokenLoginInfoMap数据展示
     * key: token
     * value: 用户登录信息
     * 说明：tokenLoginInfoMap用于存储token对应的用户登录信息，以便在需要时获取用户登录信息
     */
    public static Map<String, UserLoginInfo> tokenLoginInfoMap = new ConcurrentHashMap<>();
    // 上次清理时间
    /**
     * lastClearT数据展示
     * value: 上次清理时间
     * 说明：lastClearT用于记录上次清理过期的token的时间，以便在需要时进行清理
     */
    static Long lastClearT = System.currentTimeMillis();
    
    /**
     * UPDATE_INTERVAL数据展示
     * value: 10分钟
     * 说明：UPDATE_INTERVAL用于设置更新token的时间间隔，这里设置为10分钟
     * 
     */
    private static final long UPDATE_INTERVAL = 10 * 60 * 1000;

    // Token在Redis中的过期时间：15天
    /**
     * TOKEN_EXPIRE_DAYS数据展示
     * value: 15天
     * 说明：TOKEN_EXPIRE_DAYS用于设置Token在Redis中的过期时间，这里设置为15天
     */
    private static final long TOKEN_EXPIRE_DAYS = 15;

    // 清除过期的token
    private void clearExpiredTokensIfNeeded() {
        // 获取当前时间
        long currentTime = System.currentTimeMillis();
        // 如果当前时间减去上次清除时间大于清除间隔
        if (currentTime - lastClearT > CLEAR_INTERVAL) {
            // 遍历token心跳时间map，移除过期的token
            tokenHeartbeatTMap.entrySet().removeIf(entry -> currentTime - entry.getValue() > CLEAR_INTERVAL);
            // 遍历token登录信息map，移除不在token心跳时间map中的token
            tokenLoginInfoMap.entrySet().removeIf(entry -> !tokenHeartbeatTMap.containsKey(entry.getKey()));
            // 更新上次清除时间
            lastClearT = currentTime;
        }
    }

    /**
     * 更新缓存中的token时间
     * 该方法从Redis中获取用户登录信息，并更新token的过期时间
     *
     * @param token 用户token
     * @return 更新后的用户登录信息，如果未找到则返回null
     */
    @SuppressWarnings("null")// 忽略空指针警告
    public UserLoginInfo updateCacheTokenTime(String token) {
        // 从Redis中获取用户登录信息
        String userLoginInfoStr = userGatewayRedisTemplate.opsForValue().get("userToken:" + token);
        // 如果用户登录信息不为空
        if (!StringUtils.isEmpty(userLoginInfoStr)) {
            // 将用户登录信息转换为UserLoginInfo对象
            UserLoginInfo userLoginInfo = GsonUtils.getObjectFromJson(userLoginInfoStr, UserLoginInfo.class);
            // 更新Redis中用户登录信息的过期时间
            userGatewayRedisTemplate.opsForValue().set("userToken:" + token, userLoginInfoStr, TOKEN_EXPIRE_DAYS, TimeUnit.DAYS);
            // 记录日志
            logger.info("更新用户登录信息: 用户名={}, tokenHeartbeatTMap大小={}, tokenLoginInfoMap大小={}",
                    userLoginInfo.getUserNa(), tokenHeartbeatTMap.size(), tokenLoginInfoMap.size());
            // 返回用户登录信息
            return userLoginInfo;
        }
        // 如果用户登录信息为空，返回null
        return null;
    }

    /**
     * 更新并获取用户登录信息
     * 该方法从Redis中获取最新的用户登录信息，更新本地缓存，并返回更新后的信息
     *
     * @param token 用户token
     * @return 更新后的用户登录信息，如果未找到则返回null
     */
    // 根据token更新缓存中的登录信息，并返回更新后的登录信息
    private UserLoginInfo updateAndGetLoginInfo(String token) {
        // 更新缓存中的token时间
        UserLoginInfo userLoginInfo = updateCacheTokenTime(token);
        // 如果更新后的登录信息不为空
        if (userLoginInfo != null) {
            // 获取当前时间
            long currentTime = System.currentTimeMillis();
            // 将token和当前时间存入tokenHeartbeatTMap中
            tokenHeartbeatTMap.put(token, currentTime);
            // 将token和登录信息存入tokenLoginInfoMap中
            tokenLoginInfoMap.put(token, userLoginInfo);
        }
        // 返回更新后的登录信息
        return userLoginInfo;
    }

    /**
     * 清除指定手机号列表的登录信息
     * 该方法用于批量清除特定用户的登录信息，通常用于强制用户重新登录
     *
     * @param mobileList 需要清除登录信息的手机号列表
     */
    // 清除用户登录信息
    public void clearFuLableLoginInfo(List<String> mobileList) {
        // 获取所有以"userToken"开头的key
        Set<String> keys = userGatewayRedisTemplate.keys("userToken*");
        // 如果没有key，直接返回
        if (keys == null || keys.isEmpty()) {
            return;
        }

        // 获取所有key对应的value
        List<String> userInfoStrList = userGatewayRedisTemplate.opsForValue().multiGet(keys);
        // 如果没有value，直接返回
        if (userInfoStrList == null) {
            return;
        }

        // 遍历所有value
        for (String userInfoStr : userInfoStrList) {
            // 将value转换为UserLoginInfo对象
            UserLoginInfo userLoginInfo = GsonUtils.getObjectFromJson(userInfoStr, UserLoginInfo.class);
            // 如果对象不为空，并且mobileList中包含该对象的mobile
            if (userLoginInfo != null && mobileList.contains(userLoginInfo.getMobile())) {
                // 获取token
                String token = userLoginInfo.getToken();
                // 从tokenHeartbeatTMap中移除token
                tokenHeartbeatTMap.remove(token);
                // 从tokenLoginInfoMap中移除token
                tokenLoginInfoMap.remove(token);
                // 从Redis中删除"userToken:" + token
                userGatewayRedisTemplate.delete("userToken:" + token);
            }
        }
    }

    /**
     * 更新用户ID对应的token集合
     * 该方法用于维护用户ID和token之间的映射关系
     *
     * @param userId   用户ID
     * @param newToken 新的token
     */
    @SuppressWarnings("unchecked")// 忽略类型转换警告
    private void updateUserIdTokenSet(String userId, String newToken) {
        // 定义key
        String key = "userIdToken:" + userId;
        // 从redis中获取userIdTokenSetStr
        String userIdTokenSetStr = userGatewayRedisTemplate.opsForValue().get(key);

        Set<String> tokenSet = new HashSet<>();
        // 如果userIdTokenSetStr不为空，则将其转换为Set<String>类型
        if (!StringUtils.isEmpty(userIdTokenSetStr)) {
            tokenSet = GsonUtils.getObjectFromJson(userIdTokenSetStr, Set.class);
        }

        // 将newToken添加到tokenSet中
        tokenSet.add(newToken);
        // 如果userGatewayRedisTemplate.opsForValue().get("userToken:" + token)为空，则从tokenSet中移除该token
        tokenSet.removeIf(token -> userGatewayRedisTemplate.opsForValue().get("userToken:" + token) == null);

        // 如果tokenSet不为空，则将其转换为json字符串并存储到redis中
        if (!tokenSet.isEmpty()) {
            userGatewayRedisTemplate.opsForValue().set(key, GsonUtils.getJsonFromObject(tokenSet));
        } else {
            // 否则，删除redis中的key
            userGatewayRedisTemplate.delete(key);
        }
    }

    /**
     * 发送用户登录事件
     * 该方法用于通过Kafka发送用户登录事件
     *
     * @param userId 用户ID
     * @param token  用户token
     */
    // 发送用户登录事件
    private void sendUserLoginEvent(String userId, String token) {
        // 创建广播事件
        BroadcastEvent broadcastEvent = new BroadcastEvent();
        // 设置事件ID为"userLogin"
        broadcastEvent.setEventId("userLogin");
        // 设置事件内容为token
        broadcastEvent.setContent(token);
        // 发送广播事件到Kafka
        eventKafkaTemplate.send("broadcast-biz-event",
                // 设置消息的key为userId的反转字符串和userId的组合
                StrUtils.reverseString(userId) + "_" + userId,
                // 将广播事件转换为JSON字符串
                GsonUtils.getJsonFromObject(broadcastEvent));
    }

    /**
     * 设置用户登录信息
     * 该方法用于在用户登录成功后，将登录信息保存到Redis和本地缓存中
     *
     * @param userLoginInfo 用户登录信息
     */
    public void setLoginInfo(UserLoginInfo userLoginInfo) {
        // 获取用户登录信息中的token和userId
        String token = userLoginInfo.getToken();
        String userId = userLoginInfo.getUserId();

        // 保存token信息到Redis
        userGatewayRedisTemplate.opsForValue().set("userToken:" + token,
                GsonUtils.getJsonFromObject(userLoginInfo), TOKEN_EXPIRE_DAYS, TimeUnit.DAYS);

        // 更新用户ID对应的token集合
        updateUserIdTokenSet(userId, token);

        // 发送用户登录事件
        sendUserLoginEvent(userId, token);

        // 清除本地缓存中的旧数据
        tokenLoginInfoMap.remove(token);
        tokenHeartbeatTMap.remove(token);
    }

    /**
     * 发送用户登出事件
     * 该方法用于通过Kafka发送用户登出事件
     *
     * @param userId 用户ID
     * @param token  用户token
     */
    // 发送用户登出事件
    private void sendUserLogoutEvent(String userId, String token) {
        // 创建广播事件
        BroadcastEvent broadcastEvent = new BroadcastEvent();
        // 设置事件ID
        broadcastEvent.setEventId("userLoginOut");
        // 设置事件内容
        broadcastEvent.setContent(token);
        // 发送广播事件到Kafka
        eventKafkaTemplate.send("broadcast-biz-event",
                // 设置消息的key，将userId反转后与userId拼接
                StrUtils.reverseString(userId) + "_" + userId,
                // 将广播事件转换为JSON字符串
                GsonUtils.getJsonFromObject(broadcastEvent));
    }

    /**
     * 清除本地缓存
     * 该方法用于清除本地缓存中的用户登录信息
     *
     * @param token 用户token
     */
    private void clearLocalCache(String token) {
        tokenLoginInfoMap.remove(token);
        tokenHeartbeatTMap.remove(token);
    }

    /**
     * 用户登出
     * 该方法用于处理用户登出操作，清除相关的登录信息
     *
     * @param request HTTP请求
     */
    // 登出方法
    public void loginOut(HttpServletRequest request) {
        // 获取请求头中的token
        String token = request.getHeader("token");
        // 如果token为空，则直接返回
        if (StringUtils.isEmpty(token)) {
            return;
        }

        // 从Redis中获取用户信息
        String userInfoStr = userGatewayRedisTemplate.opsForValue().get("userToken:" + token);
        // 删除Redis中的用户信息
        userGatewayRedisTemplate.delete("userToken:" + token);

        // 如果用户信息不为空
        if (!StringUtils.isEmpty(userInfoStr)) {
            // 将用户信息转换为UserLoginInfo对象
            UserLoginInfo userLoginInfo = GsonUtils.getObjectFromJson(userInfoStr, UserLoginInfo.class);
            // 发送用户登出事件
            sendUserLogoutEvent(userLoginInfo.getUserId(), token);
            // 清除本地缓存
            clearLocalCache(token);
        }
    }

    /**
     * 创建用户登录信息
     * 该方法根据登录请求和登录结果创建用户登录信息对象
     *
     * @param loginReq 登录请求
     * @param restRet  登录结果
     * @return 用户登录信息
     */
    // 根据登录请求和返回结果创建用户登录信息
    private UserLoginInfo createUserLoginInfo(LoginReq loginReq, RestRet restRet) {
        // 从返回结果中获取操作员用户信息
        OperatorUserInfoBO operatorUserInfoBO = GsonUtils.getObjectFromJson(restRet.getDetail(), OperatorUserInfoBO.class);
        // 创建用户登录信息对象
        UserLoginInfo userLoginInfo = new UserLoginInfo();
        // 将操作员用户信息复制到用户登录信息对象中
        BeanUtils.copyProperties(operatorUserInfoBO, userLoginInfo);

        // 生成一个唯一的token
        String token = (new ObjectId()).toString();
        // 记录日志，记录用户登录的token和手机号
        logger.info("用户登录的TOKEN: {}, 手机: {}", token, loginReq.getMobile());
        // 将token设置到用户登录信息对象中
        userLoginInfo.setToken(token);

        // 设置用户登录信息的openId
        setOpenIds(userLoginInfo, loginReq);
        // 设置用户登录信息的附加信息
        setAdditionalInfo(userLoginInfo, operatorUserInfoBO, loginReq);

        // 返回用户登录信息对象
        return userLoginInfo;
    }

    /**
     * 设置开放平台ID
     * 该方法设置微信和支付宝的开放平台ID
     *
     * @param userLoginInfo 用户登录信息
     * @param loginReq      登录请求
     */
    // 设置用户登录信息中的微信和支付宝的openId
    private void setOpenIds(UserLoginInfo userLoginInfo, LoginReq loginReq) {
        // 如果微信openId不为空，则设置用户登录信息中的微信openId
        if (StrUtil.isNotBlank(loginReq.getWxOpenId())) {
            userLoginInfo.setWxOpenId(loginReq.getWxOpenId());
        }
        // 如果支付宝openId不为空，则设置用户登录信息中的支付宝openId
        if (StrUtil.isNotBlank(loginReq.getAliOpenId())) {
            userLoginInfo.setAliOpenId(loginReq.getAliOpenId());
        }
    }
```

