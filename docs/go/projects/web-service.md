# GO语言Web服务开发实战

## 1. 项目概述

本实战项目将创建一个完整的RESTful API服务，包含用户管理、认证、数据库操作等功能。

### 1.1 项目结构
```
myapp/
├── cmd/
│   └── server/
│       └── main.go
├── internal/
│   ├── handlers/
│   │   ├── user.go
│   │   └── auth.go
│   ├── models/
│   │   └── user.go
│   ├── database/
│   │   └── db.go
│   └── middleware/
│       ├── auth.go
│       └── logging.go
├── pkg/
│   └── utils/
│       └── jwt.go
├── configs/
│   └── config.yaml
├── go.mod
└── go.sum
```

## 2. 项目初始化

### 2.1 创建项目
```bash
mkdir myapp
cd myapp
go mod init myapp
```

### 2.2 安装依赖
```bash
go get github.com/gin-gonic/gin
go get github.com/golang-jwt/jwt/v4
go get gorm.io/gorm
go get gorm.io/driver/postgres
go get github.com/spf13/viper
```

## 3. 数据模型

### 3.1 用户模型
```go
// internal/models/user.go
package models

import (
    "time"
    "gorm.io/gorm"
)

type User struct {
    ID        uint           `json:"id" gorm:"primaryKey"`
    Username  string         `json:"username" gorm:"unique;not null"`
    Email     string         `json:"email" gorm:"unique;not null"`
    Password  string         `json:"-" gorm:"not null"`
    Role      string         `json:"role" gorm:"default:'user'"`
    CreatedAt time.Time      `json:"created_at"`
    UpdatedAt time.Time      `json:"updated_at"`
    DeletedAt gorm.DeletedAt `json:"-" gorm:"index"`
}

type CreateUserRequest struct {
    Username string `json:"username" binding:"required"`
    Email    string `json:"email" binding:"required,email"`
    Password string `json:"password" binding:"required,min=6"`
}

type UpdateUserRequest struct {
    Username string `json:"username"`
    Email    string `json:"email" binding:"omitempty,email"`
}

type LoginRequest struct {
    Username string `json:"username" binding:"required"`
    Password string `json:"password" binding:"required"`
}

type LoginResponse struct {
    Token string `json:"token"`
    User  User   `json:"user"`
}
```

## 4. 数据库配置

### 4.1 数据库连接
```go
// internal/database/db.go
package database

import (
    "fmt"
    "log"
    "myapp/internal/models"
    "gorm.io/driver/postgres"
    "gorm.io/gorm"
)

var DB *gorm.DB

func InitDB() {
    dsn := "host=localhost user=postgres password=password dbname=myapp port=5432 sslmode=disable"
    db, err := gorm.Open(postgres.Open(dsn), &gorm.Config{})
    if err != nil {
        log.Fatal("Failed to connect to database:", err)
    }
    
    DB = db
    
    // 自动迁移
    err = DB.AutoMigrate(&models.User{})
    if err != nil {
        log.Fatal("Failed to migrate database:", err)
    }
    
    fmt.Println("Database connected and migrated successfully")
}

func GetDB() *gorm.DB {
    return DB
}
```

## 5. 认证中间件

### 5.1 JWT工具
```go
// pkg/utils/jwt.go
package utils

import (
    "errors"
    "time"
    "github.com/golang-jwt/jwt/v4"
)

var jwtSecret = []byte("your-secret-key")

type Claims struct {
    UserID   uint   `json:"user_id"`
    Username string `json:"username"`
    Role     string `json:"role"`
    jwt.RegisteredClaims
}

func GenerateToken(userID uint, username, role string) (string, error) {
    claims := Claims{
        UserID:   userID,
        Username: username,
        Role:     role,
        RegisteredClaims: jwt.RegisteredClaims{
            ExpiresAt: jwt.NewNumericDate(time.Now().Add(24 * time.Hour)),
            IssuedAt:  jwt.NewNumericDate(time.Now()),
        },
    }
    
    token := jwt.NewWithClaims(jwt.SigningMethodHS256, claims)
    return token.SignedString(jwtSecret)
}

func ValidateToken(tokenString string) (*Claims, error) {
    token, err := jwt.ParseWithClaims(tokenString, &Claims{}, func(token *jwt.Token) (interface{}, error) {
        return jwtSecret, nil
    })
    
    if err != nil {
        return nil, err
    }
    
    if claims, ok := token.Claims.(*Claims); ok && token.Valid {
        return claims, nil
    }
    
    return nil, errors.New("invalid token")
}
```

### 5.2 认证中间件
```go
// internal/middleware/auth.go
package middleware

import (
    "net/http"
    "strings"
    "myapp/pkg/utils"
    "github.com/gin-gonic/gin"
)

func AuthMiddleware() gin.HandlerFunc {
    return func(c *gin.Context) {
        authHeader := c.GetHeader("Authorization")
        if authHeader == "" {
            c.JSON(http.StatusUnauthorized, gin.H{"error": "Authorization header required"})
            c.Abort()
            return
        }
        
        tokenString := strings.TrimPrefix(authHeader, "Bearer ")
        if tokenString == authHeader {
            c.JSON(http.StatusUnauthorized, gin.H{"error": "Bearer token required"})
            c.Abort()
            return
        }
        
        claims, err := utils.ValidateToken(tokenString)
        if err != nil {
            c.JSON(http.StatusUnauthorized, gin.H{"error": "Invalid token"})
            c.Abort()
            return
        }
        
        c.Set("user_id", claims.UserID)
        c.Set("username", claims.Username)
        c.Set("role", claims.Role)
        c.Next()
    }
}

func AdminMiddleware() gin.HandlerFunc {
    return func(c *gin.Context) {
        role, exists := c.Get("role")
        if !exists {
            c.JSON(http.StatusUnauthorized, gin.H{"error": "User not authenticated"})
            c.Abort()
            return
        }
        
        if role != "admin" {
            c.JSON(http.StatusForbidden, gin.H{"error": "Admin access required"})
            c.Abort()
            return
        }
        
        c.Next()
    }
}
```

## 6. 处理器

### 6.1 用户处理器
```go
// internal/handlers/user.go
package handlers

import (
    "net/http"
    "strconv"
    "myapp/internal/database"
    "myapp/internal/models"
    "myapp/pkg/utils"
    "github.com/gin-gonic/gin"
    "golang.org/x/crypto/bcrypt"
)

type UserHandler struct{}

func NewUserHandler() *UserHandler {
    return &UserHandler{}
}

// 注册用户
func (h *UserHandler) Register(c *gin.Context) {
    var req models.CreateUserRequest
    if err := c.ShouldBindJSON(&req); err != nil {
        c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
        return
    }
    
    // 检查用户是否已存在
    var existingUser models.User
    if err := database.DB.Where("username = ? OR email = ?", req.Username, req.Email).First(&existingUser).Error; err == nil {
        c.JSON(http.StatusConflict, gin.H{"error": "User already exists"})
        return
    }
    
    // 加密密码
    hashedPassword, err := bcrypt.GenerateFromPassword([]byte(req.Password), bcrypt.DefaultCost)
    if err != nil {
        c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to hash password"})
        return
    }
    
    user := models.User{
        Username: req.Username,
        Email:    req.Email,
        Password: string(hashedPassword),
        Role:     "user",
    }
    
    if err := database.DB.Create(&user).Error; err != nil {
        c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to create user"})
        return
    }
    
    c.JSON(http.StatusCreated, gin.H{"message": "User created successfully", "user": user})
}

// 用户登录
func (h *UserHandler) Login(c *gin.Context) {
    var req models.LoginRequest
    if err := c.ShouldBindJSON(&req); err != nil {
        c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
        return
    }
    
    var user models.User
    if err := database.DB.Where("username = ?", req.Username).First(&user).Error; err != nil {
        c.JSON(http.StatusUnauthorized, gin.H{"error": "Invalid credentials"})
        return
    }
    
    // 验证密码
    if err := bcrypt.CompareHashAndPassword([]byte(user.Password), []byte(req.Password)); err != nil {
        c.JSON(http.StatusUnauthorized, gin.H{"error": "Invalid credentials"})
        return
    }
    
    // 生成JWT token
    token, err := utils.GenerateToken(user.ID, user.Username, user.Role)
    if err != nil {
        c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to generate token"})
        return
    }
    
    response := models.LoginResponse{
        Token: token,
        User:  user,
    }
    
    c.JSON(http.StatusOK, response)
}

// 获取用户信息
func (h *UserHandler) GetProfile(c *gin.Context) {
    userID, _ := c.Get("user_id")
    
    var user models.User
    if err := database.DB.First(&user, userID).Error; err != nil {
        c.JSON(http.StatusNotFound, gin.H{"error": "User not found"})
        return
    }
    
    c.JSON(http.StatusOK, user)
}

// 更新用户信息
func (h *UserHandler) UpdateProfile(c *gin.Context) {
    userID, _ := c.Get("user_id")
    
    var req models.UpdateUserRequest
    if err := c.ShouldBindJSON(&req); err != nil {
        c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
        return
    }
    
    var user models.User
    if err := database.DB.First(&user, userID).Error; err != nil {
        c.JSON(http.StatusNotFound, gin.H{"error": "User not found"})
        return
    }
    
    // 更新字段
    if req.Username != "" {
        user.Username = req.Username
    }
    if req.Email != "" {
        user.Email = req.Email
    }
    
    if err := database.DB.Save(&user).Error; err != nil {
        c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to update user"})
        return
    }
    
    c.JSON(http.StatusOK, user)
}

// 获取所有用户（管理员功能）
func (h *UserHandler) GetAllUsers(c *gin.Context) {
    var users []models.User
    if err := database.DB.Find(&users).Error; err != nil {
        c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to fetch users"})
        return
    }
    
    c.JSON(http.StatusOK, users)
}

// 删除用户（管理员功能）
func (h *UserHandler) DeleteUser(c *gin.Context) {
    userID, err := strconv.ParseUint(c.Param("id"), 10, 32)
    if err != nil {
        c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid user ID"})
        return
    }
    
    if err := database.DB.Delete(&models.User{}, userID).Error; err != nil {
        c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to delete user"})
        return
    }
    
    c.JSON(http.StatusOK, gin.H{"message": "User deleted successfully"})
}
```

## 7. 路由配置

### 7.1 主路由
```go
// internal/routes/routes.go
package routes

import (
    "myapp/internal/handlers"
    "myapp/internal/middleware"
    "github.com/gin-gonic/gin"
)

func SetupRoutes() *gin.Engine {
    r := gin.Default()
    
    // 添加中间件
    r.Use(middleware.LoggingMiddleware())
    
    // 公开路由
    public := r.Group("/api/v1")
    {
        userHandler := handlers.NewUserHandler()
        
        public.POST("/register", userHandler.Register)
        public.POST("/login", userHandler.Login)
    }
    
    // 需要认证的路由
    protected := r.Group("/api/v1")
    protected.Use(middleware.AuthMiddleware())
    {
        userHandler := handlers.NewUserHandler()
        
        protected.GET("/profile", userHandler.GetProfile)
        protected.PUT("/profile", userHandler.UpdateProfile)
    }
    
    // 管理员路由
    admin := r.Group("/api/v1/admin")
    admin.Use(middleware.AuthMiddleware(), middleware.AdminMiddleware())
    {
        userHandler := handlers.NewUserHandler()
        
        admin.GET("/users", userHandler.GetAllUsers)
        admin.DELETE("/users/:id", userHandler.DeleteUser)
    }
    
    return r
}
```

## 8. 主程序

### 8.1 服务器入口
```go
// cmd/server/main.go
package main

import (
    "log"
    "myapp/internal/database"
    "myapp/internal/routes"
)

func main() {
    // 初始化数据库
    database.InitDB()
    
    // 设置路由
    r := routes.SetupRoutes()
    
    // 启动服务器
    log.Println("Server starting on :8080")
    if err := r.Run(":8080"); err != nil {
        log.Fatal("Failed to start server:", err)
    }
}
```

## 9. 配置文件

### 9.1 配置文件
```yaml
# configs/config.yaml
server:
  port: 8080
  host: "0.0.0.0"

database:
  host: "localhost"
  port: 5432
  user: "postgres"
  password: "password"
  name: "myapp"
  sslmode: "disable"

jwt:
  secret: "your-secret-key"
  expiration: 24h

logging:
  level: "info"
  format: "json"
```

## 10. 测试

### 10.1 API测试
```bash
# 注册用户
curl -X POST http://localhost:8080/api/v1/register \
  -H "Content-Type: application/json" \
  -d '{"username":"testuser","email":"test@example.com","password":"password123"}'

# 用户登录
curl -X POST http://localhost:8080/api/v1/login \
  -H "Content-Type: application/json" \
  -d '{"username":"testuser","password":"password123"}'

# 获取用户信息（需要token）
curl -X GET http://localhost:8080/api/v1/profile \
  -H "Authorization: Bearer YOUR_TOKEN_HERE"
```

### 10.2 单元测试
```go
// internal/handlers/user_test.go
package handlers

import (
    "bytes"
    "encoding/json"
    "net/http"
    "net/http/httptest"
    "testing"
    "myapp/internal/models"
    "github.com/gin-gonic/gin"
    "github.com/stretchr/testify/assert"
)

func TestUserHandler_Register(t *testing.T) {
    gin.SetMode(gin.TestMode)
    
    r := gin.New()
    handler := NewUserHandler()
    r.POST("/register", handler.Register)
    
    req := models.CreateUserRequest{
        Username: "testuser",
        Email:    "test@example.com",
        Password: "password123",
    }
    
    body, _ := json.Marshal(req)
    request, _ := http.NewRequest("POST", "/register", bytes.NewBuffer(body))
    request.Header.Set("Content-Type", "application/json")
    
    w := httptest.NewRecorder()
    r.ServeHTTP(w, request)
    
    assert.Equal(t, http.StatusCreated, w.Code)
}
```

## 11. 部署

### 11.1 Dockerfile
```dockerfile
FROM golang:1.21-alpine AS builder

WORKDIR /app
COPY go.mod go.sum ./
RUN go mod download

COPY . .
RUN go build -o main ./cmd/server

FROM alpine:latest
RUN apk --no-cache add ca-certificates
WORKDIR /root/

COPY --from=builder /app/main .
COPY --from=builder /app/configs ./configs

EXPOSE 8080
CMD ["./main"]
```

### 11.2 Docker Compose
```yaml
# docker-compose.yml
version: '3.8'

services:
  app:
    build: .
    ports:
      - "8080:8080"
    depends_on:
      - db
    environment:
      - DB_HOST=db
      - DB_PORT=5432
      - DB_USER=postgres
      - DB_PASSWORD=password
      - DB_NAME=myapp

  db:
    image: postgres:15
    environment:
      - POSTGRES_USER=postgres
      - POSTGRES_PASSWORD=password
      - POSTGRES_DB=myapp
    ports:
      - "5432:5432"
    volumes:
      - postgres_data:/var/lib/postgresql/data

volumes:
  postgres_data:
```

## 12. 最佳实践

### 12.1 错误处理
```go
// 自定义错误类型
type AppError struct {
    Code    int    `json:"code"`
    Message string `json:"message"`
    Details string `json:"details,omitempty"`
}

func (e AppError) Error() string {
    return e.Message
}

// 统一错误处理中间件
func ErrorHandler() gin.HandlerFunc {
    return func(c *gin.Context) {
        c.Next()
        
        if len(c.Errors) > 0 {
            err := c.Errors.Last()
            c.JSON(http.StatusInternalServerError, gin.H{
                "error": err.Error(),
            })
        }
    }
}
```

### 12.2 日志记录
```go
// internal/middleware/logging.go
package middleware

import (
    "time"
    "github.com/gin-gonic/gin"
    "github.com/sirupsen/logrus"
)

func LoggingMiddleware() gin.HandlerFunc {
    return gin.LoggerWithFormatter(func(param gin.LogFormatterParams) string {
        return fmt.Sprintf("%s - [%s] \"%s %s %s %d %s \"%s\" %s\"\n",
            param.ClientIP,
            param.TimeStamp.Format(time.RFC1123),
            param.Method,
            param.Path,
            param.Request.Proto,
            param.StatusCode,
            param.Latency,
            param.Request.UserAgent(),
            param.ErrorMessage,
        )
    })
}
```

### 12.3 配置管理
```go
// internal/config/config.go
package config

import (
    "github.com/spf13/viper"
)

type Config struct {
    Server   ServerConfig   `mapstructure:"server"`
    Database DatabaseConfig `mapstructure:"database"`
    JWT      JWTConfig     `mapstructure:"jwt"`
}

type ServerConfig struct {
    Port int    `mapstructure:"port"`
    Host string `mapstructure:"host"`
}

type DatabaseConfig struct {
    Host     string `mapstructure:"host"`
    Port     int    `mapstructure:"port"`
    User     string `mapstructure:"user"`
    Password string `mapstructure:"password"`
    Name     string `mapstructure:"name"`
    SSLMode  string `mapstructure:"sslmode"`
}

type JWTConfig struct {
    Secret     string `mapstructure:"secret"`
    Expiration string `mapstructure:"expiration"`
}

func LoadConfig() (*Config, error) {
    viper.SetConfigName("config")
    viper.SetConfigType("yaml")
    viper.AddConfigPath("./configs")
    
    if err := viper.ReadInConfig(); err != nil {
        return nil, err
    }
    
    var config Config
    if err := viper.Unmarshal(&config); err != nil {
        return nil, err
    }
    
    return &config, nil
}
```

这个实战项目展示了GO语言Web服务开发的完整流程，包括项目结构、数据模型、认证、路由、测试和部署等方面。通过这个项目，可以学习到GO语言Web开发的最佳实践。 