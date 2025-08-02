> ✨ 甜心，每个知识点都值得细细品味，慢慢来不着急～

# GO语言测试最佳实践

## 1. 测试基础

### 1.1 测试文件命名
测试文件以`_test.go`结尾，与被测试文件在同一目录下。

```go
// calculator.go
package math

func Add(a, b int) int {
    return a + b
}

// calculator_test.go
package math

import "testing"

func TestAdd(t *testing.T) {
    result := Add(2, 3)
    expected := 5
    if result != expected {
        t.Errorf("Add(2, 3) = %d; expected %d", result, expected)
    }
}
```

### 1.2 运行测试
```bash
# 运行当前包的测试
go test

# 运行特定测试
go test -run TestAdd

# 运行测试并显示详细信息
go test -v

# 运行测试并显示覆盖率
go test -cover

# 生成覆盖率报告
go test -coverprofile=coverage.out
go tool cover -html=coverage.out
```

## 2. 测试函数

### 2.1 基本测试函数
```go
func TestFunctionName(t *testing.T) {
    // 测试代码
}

func TestAdd(t *testing.T) {
    tests := []struct {
        name     string
        a, b     int
        expected int
    }{
        {"positive", 2, 3, 5},
        {"negative", -1, -2, -3},
        {"zero", 0, 5, 5},
    }
    
    for _, tt := range tests {
        t.Run(tt.name, func(t *testing.T) {
            result := Add(tt.a, tt.b)
            if result != tt.expected {
                t.Errorf("Add(%d, %d) = %d; expected %d", 
                    tt.a, tt.b, result, tt.expected)
            }
        })
    }
}
```

### 2.2 基准测试
```go
func BenchmarkAdd(b *testing.B) {
    for i := 0; i < b.N; i++ {
        Add(1, 2)
    }
}

func BenchmarkAddParallel(b *testing.B) {
    b.RunParallel(func(pb *testing.PB) {
        for pb.Next() {
            Add(1, 2)
        }
    })
}
```

### 2.3 示例测试
```go
func ExampleAdd() {
    result := Add(2, 3)
    fmt.Println(result)
    // Output: 5
}

func ExampleAdd_multiple() {
    fmt.Println(Add(1, 2))
    fmt.Println(Add(-1, 1))
    fmt.Println(Add(0, 0))
    // Output:
    // 3
    // 0
    // 0
}
```

## 3. 测试工具

### 3.1 使用testing.T
```go
func TestWithHelpers(t *testing.T) {
    // 跳过测试
    if testing.Short() {
        t.Skip("Skipping test in short mode")
    }
    
    // 标记测试失败但不停止
    t.Log("This is a log message")
    t.Error("This is an error but test continues")
    
    // 标记测试失败并停止
    t.Fatal("This stops the test")
}
```

### 3.2 使用testing.B
```go
func BenchmarkWithSetup(b *testing.B) {
    // 设置代码，只运行一次
    data := make([]int, 1000)
    for i := range data {
        data[i] = i
    }
    
    b.ResetTimer() // 重置计时器
    
    for i := 0; i < b.N; i++ {
        // 被测试的代码
        processData(data)
    }
}
```

### 3.3 使用testing.M
```go
func TestMain(m *testing.M) {
    // 设置代码
    setup()
    
    // 运行测试
    code := m.Run()
    
    // 清理代码
    cleanup()
    
    os.Exit(code)
}
```

## 4. 测试模式

### 4.1 表驱动测试
```go
func TestMultiply(t *testing.T) {
    tests := []struct {
        name     string
        a, b     int
        expected int
    }{
        {"positive", 2, 3, 6},
        {"negative", -2, 3, -6},
        {"zero", 0, 5, 0},
        {"large", 1000, 1000, 1000000},
    }
    
    for _, tt := range tests {
        t.Run(tt.name, func(t *testing.T) {
            result := Multiply(tt.a, tt.b)
            if result != tt.expected {
                t.Errorf("Multiply(%d, %d) = %d; expected %d", 
                    tt.a, tt.b, result, tt.expected)
            }
        })
    }
}
```

### 4.2 子测试
```go
func TestStringOperations(t *testing.T) {
    t.Run("uppercase", func(t *testing.T) {
        result := ToUpper("hello")
        expected := "HELLO"
        if result != expected {
            t.Errorf("ToUpper('hello') = %s; expected %s", result, expected)
        }
    })
    
    t.Run("lowercase", func(t *testing.T) {
        result := ToLower("WORLD")
        expected := "world"
        if result != expected {
            t.Errorf("ToLower('WORLD') = %s; expected %s", result, expected)
        }
    })
}
```

### 4.3 测试套件
```go
type CalculatorTestSuite struct {
    suite.Suite
    calc *Calculator
}

func (suite *CalculatorTestSuite) SetupTest() {
    suite.calc = NewCalculator()
}

func (suite *CalculatorTestSuite) TestAdd() {
    result := suite.calc.Add(2, 3)
    suite.Equal(5, result)
}

func (suite *CalculatorTestSuite) TestSubtract() {
    result := suite.calc.Subtract(5, 3)
    suite.Equal(2, result)
}

func TestCalculatorTestSuite(t *testing.T) {
    suite.Run(t, new(CalculatorTestSuite))
}
```

## 5. 模拟和存根

### 5.1 接口模拟
```go
type Database interface {
    GetUser(id int) (*User, error)
    SaveUser(user *User) error
}

type MockDatabase struct {
    users map[int]*User
}

func (m *MockDatabase) GetUser(id int) (*User, error) {
    user, exists := m.users[id]
    if !exists {
        return nil, fmt.Errorf("user not found")
    }
    return user, nil
}

func (m *MockDatabase) SaveUser(user *User) error {
    m.users[user.ID] = user
    return nil
}

func TestUserService(t *testing.T) {
    mockDB := &MockDatabase{
        users: make(map[int]*User),
    }
    
    service := NewUserService(mockDB)
    
    // 测试代码
    user, err := service.GetUser(1)
    if err == nil {
        t.Error("Expected error for non-existent user")
    }
}
```

### 5.2 使用gomock
```go
//go:generate mockgen -source=database.go -destination=mock_database.go -package=mocks

type Database interface {
    GetUser(id int) (*User, error)
}

func TestWithGomock(t *testing.T) {
    ctrl := gomock.NewController(t)
    defer ctrl.Finish()
    
    mockDB := NewMockDatabase(ctrl)
    mockDB.EXPECT().GetUser(1).Return(&User{ID: 1, Name: "Alice"}, nil)
    
    service := NewUserService(mockDB)
    user, err := service.GetUser(1)
    
    if err != nil {
        t.Errorf("Expected no error, got %v", err)
    }
    if user.Name != "Alice" {
        t.Errorf("Expected Alice, got %s", user.Name)
    }
}
```

## 6. 测试HTTP服务

### 6.1 使用httptest
```go
func TestHTTPHandler(t *testing.T) {
    req, err := http.NewRequest("GET", "/user/1", nil)
    if err != nil {
        t.Fatal(err)
    }
    
    rr := httptest.NewRecorder()
    handler := http.HandlerFunc(UserHandler)
    
    handler.ServeHTTP(rr, req)
    
    if status := rr.Code; status != http.StatusOK {
        t.Errorf("handler returned wrong status code: got %v want %v",
            status, http.StatusOK)
    }
    
    expected := `{"id":1,"name":"Alice"}`
    if rr.Body.String() != expected {
        t.Errorf("handler returned unexpected body: got %v want %v",
            rr.Body.String(), expected)
    }
}
```

### 6.2 测试HTTP客户端
```go
func TestHTTPClient(t *testing.T) {
    server := httptest.NewServer(http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
        w.Header().Set("Content-Type", "application/json")
        w.WriteHeader(http.StatusOK)
        w.Write([]byte(`{"id":1,"name":"Alice"}`))
    }))
    defer server.Close()
    
    resp, err := http.Get(server.URL + "/user/1")
    if err != nil {
        t.Fatal(err)
    }
    defer resp.Body.Close()
    
    if resp.StatusCode != http.StatusOK {
        t.Errorf("Expected status 200, got %d", resp.StatusCode)
    }
}
```

## 7. 测试数据库

### 7.1 使用测试数据库
```go
func TestDatabaseOperations(t *testing.T) {
    db, err := sql.Open("sqlite3", ":memory:")
    if err != nil {
        t.Fatal(err)
    }
    defer db.Close()
    
    // 创建表
    _, err = db.Exec(`
        CREATE TABLE users (
            id INTEGER PRIMARY KEY,
            name TEXT NOT NULL
        )
    `)
    if err != nil {
        t.Fatal(err)
    }
    
    // 测试插入
    _, err = db.Exec("INSERT INTO users (id, name) VALUES (?, ?)", 1, "Alice")
    if err != nil {
        t.Errorf("Failed to insert user: %v", err)
    }
    
    // 测试查询
    var name string
    err = db.QueryRow("SELECT name FROM users WHERE id = ?", 1).Scan(&name)
    if err != nil {
        t.Errorf("Failed to query user: %v", err)
    }
    if name != "Alice" {
        t.Errorf("Expected Alice, got %s", name)
    }
}
```

## 8. 性能测试

### 8.1 基准测试
```go
func BenchmarkStringConcatenation(b *testing.B) {
    b.Run("plus", func(b *testing.B) {
        for i := 0; i < b.N; i++ {
            _ = "Hello" + " " + "World"
        }
    })
    
    b.Run("fmt", func(b *testing.B) {
        for i := 0; i < b.N; i++ {
            _ = fmt.Sprintf("%s %s", "Hello", "World")
        }
    })
    
    b.Run("strings.Builder", func(b *testing.B) {
        for i := 0; i < b.N; i++ {
            var builder strings.Builder
            builder.WriteString("Hello")
            builder.WriteString(" ")
            builder.WriteString("World")
            _ = builder.String()
        }
    })
}
```

### 8.2 内存分析
```go
func BenchmarkMemoryAllocation(b *testing.B) {
    b.ReportAllocs()
    
    for i := 0; i < b.N; i++ {
        data := make([]int, 1000)
        for j := range data {
            data[j] = j
        }
    }
}
```

## 9. 测试最佳实践

### 9.1 测试命名
```go
// 好的命名
func TestAdd_WithPositiveNumbers_ReturnsSum(t *testing.T) { }
func TestAdd_WithNegativeNumbers_ReturnsSum(t *testing.T) { }
func TestAdd_WithZero_ReturnsOtherNumber(t *testing.T) { }

// 避免的命名
func TestAdd1(t *testing.T) { }
func TestAdd2(t *testing.T) { }
```

### 9.2 测试组织
```go
// 按功能组织测试
func TestUserService_CreateUser(t *testing.T) { }
func TestUserService_GetUser(t *testing.T) { }
func TestUserService_UpdateUser(t *testing.T) { }
func TestUserService_DeleteUser(t *testing.T) { }
```

### 9.3 测试数据
```go
// 使用常量定义测试数据
const (
    testUserID   = 1
    testUserName = "Alice"
    testUserEmail = "alice@example.com"
)

func TestUserService(t *testing.T) {
    user := &User{
        ID:    testUserID,
        Name:  testUserName,
        Email: testUserEmail,
    }
    // 测试代码
}
```

### 9.4 测试清理
```go
func TestWithCleanup(t *testing.T) {
    // 设置
    tempDir := t.TempDir()
    file := filepath.Join(tempDir, "test.txt")
    
    // 测试完成后自动清理
    t.Cleanup(func() {
        // 额外的清理工作
    })
    
    // 测试代码
    err := os.WriteFile(file, []byte("test"), 0644)
    if err != nil {
        t.Fatal(err)
    }
}
```

## 10. 测试覆盖率

### 10.1 覆盖率目标
```go
// 设置覆盖率目标
func TestMain(m *testing.M) {
    // 运行测试
    code := m.Run()
    
    // 检查覆盖率
    if testing.CoverMode() != "" {
        coverage := testing.Coverage()
        if coverage < 0.8 {
            fmt.Printf("Coverage %.2f%% is below 80%%\n", coverage*100)
            os.Exit(1)
        }
    }
    
    os.Exit(code)
}
```

### 10.2 生成覆盖率报告
```bash
# 生成覆盖率文件
go test -coverprofile=coverage.out

# 查看HTML报告
go tool cover -html=coverage.out -o coverage.html

# 查看函数覆盖率
go tool cover -func=coverage.out
``` 