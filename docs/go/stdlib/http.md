> 💫 甜心，保持规律的作息，这样学习效果会更好呢～

# GO语言HTTP编程

## 1. HTTP服务器

### 1.1 基本HTTP服务器
```go
package main

import (
    "fmt"
    "net/http"
)

func helloHandler(w http.ResponseWriter, r *http.Request) {
    fmt.Fprintf(w, "Hello, World!")
}

func main() {
    http.HandleFunc("/", helloHandler)
    
    fmt.Println("Server starting on :8080")
    err := http.ListenAndServe(":8080", nil)
    if err != nil {
        fmt.Printf("Server failed to start: %v\n", err)
    }
}
```

### 1.2 处理不同的HTTP方法
```go
func userHandler(w http.ResponseWriter, r *http.Request) {
    switch r.Method {
    case "GET":
        fmt.Fprintf(w, "GET: Get user information")
    case "POST":
        fmt.Fprintf(w, "POST: Create new user")
    case "PUT":
        fmt.Fprintf(w, "PUT: Update user")
    case "DELETE":
        fmt.Fprintf(w, "DELETE: Delete user")
    default:
        http.Error(w, "Method not allowed", http.StatusMethodNotAllowed)
    }
}

func main() {
    http.HandleFunc("/user", userHandler)
    http.ListenAndServe(":8080", nil)
}
```

### 1.3 获取请求参数
```go
func queryHandler(w http.ResponseWriter, r *http.Request) {
    // 获取查询参数
    name := r.URL.Query().Get("name")
    age := r.URL.Query().Get("age")
    
    fmt.Fprintf(w, "Name: %s, Age: %s\n", name, age)
}

func formHandler(w http.ResponseWriter, r *http.Request) {
    if r.Method == "POST" {
        // 解析表单数据
        err := r.ParseForm()
        if err != nil {
            http.Error(w, "Failed to parse form", http.StatusBadRequest)
            return
        }
        
        name := r.FormValue("name")
        email := r.FormValue("email")
        
        fmt.Fprintf(w, "Name: %s, Email: %s\n", name, email)
    } else {
        // 返回HTML表单
        html := `
        <html>
            <body>
                <form method="POST">
                    <input type="text" name="name" placeholder="Name"><br>
                    <input type="email" name="email" placeholder="Email"><br>
                    <input type="submit" value="Submit">
                </form>
            </body>
        </html>
        `
        w.Header().Set("Content-Type", "text/html")
        fmt.Fprint(w, html)
    }
}
```

### 1.4 处理JSON数据
```go
import (
    "encoding/json"
    "net/http"
)

type User struct {
    ID    int    `json:"id"`
    Name  string `json:"name"`
    Email string `json:"email"`
}

func jsonHandler(w http.ResponseWriter, r *http.Request) {
    if r.Method == "POST" {
        var user User
        err := json.NewDecoder(r.Body).Decode(&user)
        if err != nil {
            http.Error(w, "Invalid JSON", http.StatusBadRequest)
            return
        }
        
        // 处理用户数据
        user.ID = 123 // 模拟分配ID
        
        // 返回JSON响应
        w.Header().Set("Content-Type", "application/json")
        json.NewEncoder(w).Encode(user)
    } else {
        // 返回用户列表
        users := []User{
            {ID: 1, Name: "Alice", Email: "alice@example.com"},
            {ID: 2, Name: "Bob", Email: "bob@example.com"},
        }
        
        w.Header().Set("Content-Type", "application/json")
        json.NewEncoder(w).Encode(users)
    }
}
```

### 1.5 中间件
```go
func loggingMiddleware(next http.HandlerFunc) http.HandlerFunc {
    return func(w http.ResponseWriter, r *http.Request) {
        start := time.Now()
        
        // 调用下一个处理器
        next(w, r)
        
        // 记录请求信息
        fmt.Printf("%s %s %v\n", r.Method, r.URL.Path, time.Since(start))
    }
}

func authMiddleware(next http.HandlerFunc) http.HandlerFunc {
    return func(w http.ResponseWriter, r *http.Request) {
        token := r.Header.Get("Authorization")
        if token == "" {
            http.Error(w, "Unauthorized", http.StatusUnauthorized)
            return
        }
        
        // 验证token（简化示例）
        if token != "Bearer valid-token" {
            http.Error(w, "Invalid token", http.StatusUnauthorized)
            return
        }
        
        next(w, r)
    }
}

func protectedHandler(w http.ResponseWriter, r *http.Request) {
    fmt.Fprintf(w, "Protected content")
}

func main() {
    // 应用中间件
    http.HandleFunc("/protected", authMiddleware(loggingMiddleware(protectedHandler)))
    http.HandleFunc("/public", loggingMiddleware(func(w http.ResponseWriter, r *http.Request) {
        fmt.Fprintf(w, "Public content")
    }))
    
    http.ListenAndServe(":8080", nil)
}
```

## 2. HTTP客户端

### 2.1 基本GET请求
```go
package main

import (
    "fmt"
    "io"
    "net/http"
)

func main() {
    resp, err := http.Get("https://api.github.com/users/octocat")
    if err != nil {
        fmt.Printf("Error making request: %v\n", err)
        return
    }
    defer resp.Body.Close()
    
    body, err := io.ReadAll(resp.Body)
    if err != nil {
        fmt.Printf("Error reading response: %v\n", err)
        return
    }
    
    fmt.Printf("Status: %s\n", resp.Status)
    fmt.Printf("Body: %s\n", string(body))
}
```

### 2.2 POST请求
```go
import (
    "bytes"
    "encoding/json"
    "net/http"
)

type Post struct {
    Title string `json:"title"`
    Body  string `json:"body"`
    UserID int   `json:"userId"`
}

func main() {
    post := Post{
        Title:  "My Post",
        Body:   "This is the body of my post",
        UserID: 1,
    }
    
    jsonData, err := json.Marshal(post)
    if err != nil {
        fmt.Printf("Error marshaling JSON: %v\n", err)
        return
    }
    
    resp, err := http.Post(
        "https://jsonplaceholder.typicode.com/posts",
        "application/json",
        bytes.NewBuffer(jsonData),
    )
    if err != nil {
        fmt.Printf("Error making POST request: %v\n", err)
        return
    }
    defer resp.Body.Close()
    
    body, _ := io.ReadAll(resp.Body)
    fmt.Printf("Response: %s\n", string(body))
}
```

### 2.3 自定义HTTP客户端
```go
import (
    "context"
    "net/http"
    "time"
)

func main() {
    // 创建自定义客户端
    client := &http.Client{
        Timeout: time.Second * 10,
        Transport: &http.Transport{
            MaxIdleConns:        100,
            MaxIdleConnsPerHost: 10,
            IdleConnTimeout:     90 * time.Second,
        },
    }
    
    // 创建请求
    req, err := http.NewRequest("GET", "https://api.github.com/users/octocat", nil)
    if err != nil {
        fmt.Printf("Error creating request: %v\n", err)
        return
    }
    
    // 添加请求头
    req.Header.Set("User-Agent", "MyApp/1.0")
    req.Header.Set("Accept", "application/json")
    
    // 设置超时上下文
    ctx, cancel := context.WithTimeout(context.Background(), 5*time.Second)
    defer cancel()
    req = req.WithContext(ctx)
    
    // 发送请求
    resp, err := client.Do(req)
    if err != nil {
        fmt.Printf("Error making request: %v\n", err)
        return
    }
    defer resp.Body.Close()
    
    fmt.Printf("Status: %s\n", resp.Status)
}
```

### 2.4 处理JSON响应
```go
type GitHubUser struct {
    Login     string `json:"login"`
    ID        int    `json:"id"`
    Name      string `json:"name"`
    Email     string `json:"email"`
    PublicRepos int  `json:"public_repos"`
}

func main() {
    resp, err := http.Get("https://api.github.com/users/octocat")
    if err != nil {
        fmt.Printf("Error: %v\n", err)
        return
    }
    defer resp.Body.Close()
    
    var user GitHubUser
    err = json.NewDecoder(resp.Body).Decode(&user)
    if err != nil {
        fmt.Printf("Error decoding JSON: %v\n", err)
        return
    }
    
    fmt.Printf("User: %s (ID: %d)\n", user.Name, user.ID)
    fmt.Printf("Public repos: %d\n", user.PublicRepos)
}
```

## 3. 文件上传

### 3.1 服务器端处理文件上传
```go
func uploadHandler(w http.ResponseWriter, r *http.Request) {
    if r.Method == "POST" {
        // 解析多部分表单
        err := r.ParseMultipartForm(32 << 20) // 32MB
        if err != nil {
            http.Error(w, "Failed to parse form", http.StatusBadRequest)
            return
        }
        
        // 获取上传的文件
        file, header, err := r.FormFile("file")
        if err != nil {
            http.Error(w, "No file uploaded", http.StatusBadRequest)
            return
        }
        defer file.Close()
        
        // 创建目标文件
        dst, err := os.Create("./uploads/" + header.Filename)
        if err != nil {
            http.Error(w, "Failed to create file", http.StatusInternalServerError)
            return
        }
        defer dst.Close()
        
        // 复制文件内容
        _, err = io.Copy(dst, file)
        if err != nil {
            http.Error(w, "Failed to save file", http.StatusInternalServerError)
            return
        }
        
        fmt.Fprintf(w, "File %s uploaded successfully", header.Filename)
    } else {
        // 返回上传表单
        html := `
        <html>
            <body>
                <form method="POST" enctype="multipart/form-data">
                    <input type="file" name="file"><br>
                    <input type="submit" value="Upload">
                </form>
            </body>
        </html>
        `
        w.Header().Set("Content-Type", "text/html")
        fmt.Fprint(w, html)
    }
}
```

### 3.2 客户端上传文件
```go
func uploadFile(filename string, url string) error {
    file, err := os.Open(filename)
    if err != nil {
        return err
    }
    defer file.Close()
    
    // 创建multipart writer
    var buf bytes.Buffer
    writer := multipart.NewWriter(&buf)
    
    // 创建文件字段
    part, err := writer.CreateFormFile("file", filename)
    if err != nil {
        return err
    }
    
    // 复制文件内容
    _, err = io.Copy(part, file)
    if err != nil {
        return err
    }
    
    writer.Close()
    
    // 发送请求
    resp, err := http.Post(url, writer.FormDataContentType(), &buf)
    if err != nil {
        return err
    }
    defer resp.Body.Close()
    
    body, _ := io.ReadAll(resp.Body)
    fmt.Printf("Response: %s\n", string(body))
    
    return nil
}
```

## 4. 错误处理

### 4.1 HTTP错误处理
```go
func handleHTTPError(resp *http.Response) error {
    if resp.StatusCode >= 400 {
        body, _ := io.ReadAll(resp.Body)
        return fmt.Errorf("HTTP %d: %s", resp.StatusCode, string(body))
    }
    return nil
}

func makeRequest(url string) error {
    resp, err := http.Get(url)
    if err != nil {
        return fmt.Errorf("request failed: %w", err)
    }
    defer resp.Body.Close()
    
    if err := handleHTTPError(resp); err != nil {
        return err
    }
    
    // 处理成功响应
    return nil
}
```

### 4.2 重试机制
```go
func makeRequestWithRetry(url string, maxRetries int) error {
    var lastErr error
    
    for i := 0; i < maxRetries; i++ {
        resp, err := http.Get(url)
        if err != nil {
            lastErr = err
            time.Sleep(time.Second * time.Duration(i+1))
            continue
        }
        defer resp.Body.Close()
        
        if resp.StatusCode == 200 {
            return nil
        }
        
        lastErr = fmt.Errorf("HTTP %d", resp.StatusCode)
        time.Sleep(time.Second * time.Duration(i+1))
    }
    
    return fmt.Errorf("failed after %d retries: %w", maxRetries, lastErr)
}
```

## 5. 最佳实践

### 5.1 设置超时
```go
func createClient() *http.Client {
    return &http.Client{
        Timeout: 30 * time.Second,
        Transport: &http.Transport{
            DialContext: (&net.Dialer{
                Timeout:   30 * time.Second,
                KeepAlive: 30 * time.Second,
            }).DialContext,
            MaxIdleConns:          100,
            MaxIdleConnsPerHost:   10,
            IdleConnTimeout:       90 * time.Second,
            TLSHandshakeTimeout:   10 * time.Second,
            ExpectContinueTimeout: 1 * time.Second,
        },
    }
}
```

### 5.2 使用连接池
```go
var client = &http.Client{
    Transport: &http.Transport{
        MaxIdleConns:        100,
        MaxIdleConnsPerHost: 10,
        IdleConnTimeout:     90 * time.Second,
    },
}
```

### 5.3 处理大文件
```go
func downloadFile(url, filename string) error {
    resp, err := http.Get(url)
    if err != nil {
        return err
    }
    defer resp.Body.Close()
    
    file, err := os.Create(filename)
    if err != nil {
        return err
    }
    defer file.Close()
    
    // 使用缓冲复制，避免内存问题
    _, err = io.Copy(file, resp.Body)
    return err
}
```

### 5.4 安全考虑
```go
func secureHandler(w http.ResponseWriter, r *http.Request) {
    // 设置安全头
    w.Header().Set("X-Content-Type-Options", "nosniff")
    w.Header().Set("X-Frame-Options", "DENY")
    w.Header().Set("X-XSS-Protection", "1; mode=block")
    w.Header().Set("Content-Security-Policy", "default-src 'self'")
    
    // 验证内容类型
    if r.Header.Get("Content-Type") != "application/json" {
        http.Error(w, "Invalid content type", http.StatusBadRequest)
        return
    }
    
    // 处理请求
    fmt.Fprintf(w, "Secure response")
}
``` 