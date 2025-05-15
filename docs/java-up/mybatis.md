---
title: SpringBoot整合MyBatis
author: 哪吒
date: '2020-01-01'
---

> 点击勘误[issues](https://github.com/webVueBlog/JavaPlusDoc/issues)，哪吒感谢大家的阅读

<img align="right" width="100" src="https://cdn.jsdelivr.net/gh/YunYouJun/yun/images/yun-alpha-compressed.png">

## SpringBoot整合MyBatis

ORM 框架的本质是简化操作数据库的编码工作，常用的框架有两个，一个是可以灵活执行动态 SQL 的 MyBatis；一个是崇尚不用写 SQL 的 Hibernate。前者互联网行业用的多，后者传统行业用的多。

MyBatis 早些时候用起来比较繁琐，需要各种配置文件，需要实体类和 DAO 的映射关联，经过不断地演化和改进，可以通过 generator 自动生成实体类、配置文件和 DAO 层代码，简化了不少开发工作。

随着 MyBatis-Plus 的出现，又进一步加速了 MyBatis 的发展。经过 MyBatis-Plus 的增强，开发者只需要简单的配置，就可以快速进行单表的 CRUD 操作；同时，MyBatis-Plus又提供了代码生成、自动分页、逻辑删除、自动填充等丰富功能，进一步简化了开发工作。

## 整合 MyBatis

第一步，在 pom.xml 文件中引入 starter。

```
<dependency>
    <groupId>org.mybatis.spring.boot</groupId>
    <artifactId>mybatis-spring-boot-starter</artifactId>
    <version>2.2.2</version>
</dependency>
```

第二步，在 application.yml 文件中添加数据库连接配置。

```
spring:
  datasource:
    driver-class-name: com.mysql.cj.jdbc.Driver
    username: root
    password: **
    url: jdbc:mysql://localhost:3306/xxx-mybatis?useUnicode=true&characterEncoding=utf-8&serverTimezone=Asia/Shanghai&useSSL=false
```

这里使用了 lombok 的

1. @Data 注解自动生成 getter/setter
2. @Builder 生成链式调用
3. 由于 @Data和@Builder 配合使用的时候会导致无参构造方法丢失，所以我们主动声明了无参构造方法，并使用 @Tolerate 注解来告诉 lombok 请允许我们的无参构造方法存在（没有无参构造方法的时候会导致 ORM 映射出错）

第五步，新建 UserMapper.java 接口：

```
public interface UserMapper {
    @Select("SELECT * FROM user")
    List<User> getAll();

    @Select("SELECT * FROM user WHERE id = #{id}")
    User getOne(Integer id);

    @Insert("INSERT INTO user(name,password,age) VALUES(#{name}, #{password}, #{age})")
    void insert(User user);

    @Update("UPDATE user SET name=#{name},password=#{password},age=#{age} WHERE id =#{id}")
    void update(User user);

    @Delete("DELETE FROM user WHERE id =#{id}")
    void delete(Integer id);
}
```

1. @Select 注解用来查询
2. @Insert 注解用来插入
3. @Update 注解用来修改
4. @Delete 注解用来删除

第六步，在启动类 CodingmoreMybatisApplication 上添加 @MapperScan 注解来扫描 mapper。

```
@SpringBootApplication
@MapperScan
public class CodingmoreMybatisApplication {

	public static void main(String[] args) {
		SpringApplication.run(CodingmoreMybatisApplication.class, args);
	}

}
```

如果没有指定 @MapperScan 的扫描路径，将从声明该注解的类的包开始进行扫描。

第七步，在测试类中对 mapper 进行测试。

```
@SpringBootTest
@Slf4j
class CodingmoreMybatisApplicationTests {

	@Autowired
	private UserMapper userMapper;

	@Test
	void testInsert() {
		userMapper.insert(User.builder().age(18).name("aa").password("123456").build());
		userMapper.insert(User.builder().age(18).name("bb").password("123456").build());
		userMapper.insert(User.builder().age(18).name("cc").password("123456").build());
		log.info("查询所有：{}",userMapper.getAll().stream().toArray());
	}

	@Test
	List<User> testQuery() {
		List<User> all = userMapper.getAll();
		log.info("查询所有：{}",all.stream().toArray());
		return all;
	}

	@Test
	void testUpdate() {
		User one = userMapper.getOne(1);
		log.info("更新前{}", one);
		one.setPassword("654321");
		userMapper.update(one);
		log.info("更新后{}", userMapper.getOne(1));
	}

	@Test
	void testDelete() {
		log.info("删除前{}", userMapper.getAll().toArray());
		userMapper.delete(1);
		log.info("删除后{}", userMapper.getAll().toArray());

	}
}
```

## 极简 xml 版本

极简 xml 版本比较适合更加复杂的 SQL，接口层只定义空的方法，然后在 xml 中编写对应的 SQL。

第一步，新建 PostMapper。

```
public interface PostMapper {
    List<Posts> getAll();
    Posts getOne(Long id);
    void insert(Posts post);
    void update(Posts post);
    void delete(Long id);
}
```

第二步，在 resources 目录下新建 PostMapper.xml 文件。

```
<?xml version="1.0" encoding="UTF-8"?>
<!DOCTYPE mapper PUBLIC "-//mybatis.org//DTD Mapper 3.0//EN" "http://mybatis.org/dtd/mybatis-3-mapper.dtd">
<mapper namespace="top.codingmore.mapper.PostMapper">
    <resultMap id="BaseResultMap" type="top.codingmore.entity.Posts">
        <id column="posts_id" property="postsId"/>
        <result column="post_author" property="postAuthor"/>
        <result column="post_content" property="postContent"/>
        <result column="post_title" property="postTitle"/>
    </resultMap>

    <sql id="Base_Column_List">
        posts_id, post_author, post_content, post_title
    </sql>

    <select id="getAll" resultMap="BaseResultMap">
        select
        <include refid="Base_Column_List" />
        from posts;
    </select>

    <select id="getOne" parameterType="java.lang.Long" resultMap="BaseResultMap" >
        SELECT
        <include refid="Base_Column_List" />
        FROM users
        WHERE id = #{id}
    </select>

    <insert id="insert" parameterType="top.codingmore.entity.Posts">
        insert into
            posts
            (post_author,post_content,post_title)
        values
            (#{postAuthor},#{postContent},#{postTitle});
    </insert>
    <update id="update" parameterType="top.codingmore.entity.Posts">
        update
            posts
        set
        <if test="postAuthor != null">post_author=#{postAuthor},</if>
        <if test="postContent != null">post_content=#{postContent},</if>
        post_title=#{postTitle}
        where id=#{id}
    </update>
    <delete id="delete">
        delete from
            posts
        where
            id=#{id}
    </delete>
</mapper>
```

接口中方法对应的 SQL 直接写在 xml 文件中

```
<build>
    <resources>
        <resource>
            <directory>src/main/java</directory>
            <includes>
                <include>**/*.xml</include>
            </includes>
        </resource>
        <resource>
            <directory>src/main/resources</directory>
        </resource>
    </resources>
</build>
```

如果直接放在 resources 目录下，就不用担心打包时被忽略了，但放在 resources 目录下不会被  MyBatis 自动扫描到，所以需要在 application.yml 配置文件中告诉 MyBatis 具体的扫描路径：

```
mybatis:
  mapper-locations: classpath:mapper/*.xml
```

第三步，在测试类中添加测试方法：

```
@Test
void testPostInsert() {
    postMapper.insert(Posts.builder()
            .postAuthor(1L)
            .postTitle("aa")
            .postContent("123456")
            .build());
    log.info("查询所有：{}",postMapper.getAll().stream().toArray());
}

@Test
List<Posts> testPostQuery() {
    List<Posts> all = postMapper.getAll();
    log.info("查询所有：{}",all.stream().toArray());
    return all;
}

@Test
void testPostUpdate() {
    Posts one = postMapper.getOne(1L);
    log.info("更新前{}", one);
    one.setPostContent("bb");
    postMapper.update(one);
    log.info("更新后{}", postMapper.getOne(1L));
}

@Test
void testPostDelete() {
    log.info("删除前{}", postMapper.getAll().toArray());
    postMapper.delete(1L);
    log.info("删除后{}", postMapper.getAll().toArray());

}
```

可以看得出，注解版比较适合简单的 SQL 语句，一旦遇到比较复杂的 SQL 查询，比如说多表查询，xml 中写 SQL 语句会容易实现。

```
<select id="findByPageWithTagPaged" resultMap="PostsVoResultMapWithTagList">
    SELECT a.*, pt.description, ptr.post_tag_id
    FROM (
             SELECT
                <include refid="Base_Column_List_No_Content" />,
                 b.term_taxonomy_id,
                 c.user_nicename
             FROM
                 posts a
                     LEFT JOIN term_relationships b ON a.posts_id = b.term_relationships_id
                     LEFT JOIN users c ON a.post_author = c.users_id
             WHERE 1=1
             <if test="searchTagId != null">
                and a.posts_id in (select post_id from post_tag_relation where post_tag_id=#{searchTagId})
             </if>
             and ${ew.sqlSegment}
                 LIMIT #{pageStart}, #{pageSize}
         ) a
             LEFT JOIN post_tag_relation ptr on a.posts_id = ptr.post_id
             LEFT JOIN post_tag pt on pt.post_tag_id = ptr.post_tag_id
</select>
```

## 通过 MyBatis-Plus 增强

MP 提供了诸多优秀的特性，比如说：

1. 强大的 CRUD 操作：内置了通用的 mapper、service，可通过少量的配置实现大部分常用的 CRUD，不用再编写 SQL 语句。
2. 支持主键自动生成
3. 支持 ActiveRecord 模式：实体类只需继承 Model 类即可进行强大的 CRUD 操作
4. 强大的代码生成器：可快速生成 Mapper 、 Model 、 Service 、 Controller 层代码
5. 内置分页插件
6. 内置性能分析插件：可输出 SQL 语句以及其执行时间

第一步，在 pom.xml 文件中添加 MyBatis-Plus 的 starter。

```
<dependency>
    <groupId>com.baomidou</groupId>
    <artifactId>mybatis-plus-boot-starter</artifactId>
    <version>3.4.2</version>
</dependency>
```

第二步，新建 PostTag 实体类。

```
@Data
public class PostTag {
    private Long postTagId;
    private String description;
}
```

可以看得出，类名 PostTag，字段名 postTagId 和数据库表 post_tag、字段名 post_tag_id 并不一致，但 mp 自动帮我们做了映射关联。

第二步，新建 PostTagMapper 继承 BaseMapper，继承该接口后，无需编写 mapper.xml 文件，即可获得CRUD功能。




