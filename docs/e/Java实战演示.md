---
title: Java实战演示
date: 2024-01-15
categories:
 - Java
 - 实战
tags:
 - Java
 - 示例
 - 实践
 - 项目
---

# Java实战演示

## 项目结构设计

### 标准Java项目结构

```
java-demo-project/
├── src/
│   ├── main/
│   │   ├── java/
│   │   │   └── com/
│   │   │       └── example/
│   │   │           ├── model/
│   │   │           ├── service/
│   │   │           ├── util/
│   │   │           └── Main.java
│   │   └── resources/
│   │       ├── config.properties
│   │       └── log4j2.xml
│   └── test/
│       └── java/
│           └── com/
│               └── example/
│                   └── service/
├── lib/
├── docs/
├── build.sh
└── README.md
```

## 基础示例：学生管理系统

### 1. 数据模型设计

```java
// Student.java - 学生实体类
package com.example.model;

import java.time.LocalDate;
import java.util.Objects;

/**
 * 学生实体类
 * 演示Java基础语法：类、封装、构造方法等
 */
public class Student {
    private String id;
    private String name;
    private int age;
    private String major;
    private LocalDate enrollmentDate;
    private double gpa;
    
    // 默认构造方法
    public Student() {
    }
    
    // 带参数的构造方法
    public Student(String id, String name, int age, String major) {
        this.id = id;
        this.name = name;
        this.age = age;
        this.major = major;
        this.enrollmentDate = LocalDate.now();
        this.gpa = 0.0;
    }
    
    // 完整构造方法
    public Student(String id, String name, int age, String major, 
                   LocalDate enrollmentDate, double gpa) {
        this.id = id;
        this.name = name;
        this.age = age;
        this.major = major;
        this.enrollmentDate = enrollmentDate;
        this.gpa = gpa;
    }
    
    // Getter和Setter方法
    public String getId() { return id; }
    public void setId(String id) { this.id = id; }
    
    public String getName() { return name; }
    public void setName(String name) { this.name = name; }
    
    public int getAge() { return age; }
    public void setAge(int age) { 
        if (age < 0 || age > 150) {
            throw new IllegalArgumentException("年龄必须在0-150之间");
        }
        this.age = age; 
    }
    
    public String getMajor() { return major; }
    public void setMajor(String major) { this.major = major; }
    
    public LocalDate getEnrollmentDate() { return enrollmentDate; }
    public void setEnrollmentDate(LocalDate enrollmentDate) { 
        this.enrollmentDate = enrollmentDate; 
    }
    
    public double getGpa() { return gpa; }
    public void setGpa(double gpa) {
        if (gpa < 0.0 || gpa > 4.0) {
            throw new IllegalArgumentException("GPA必须在0.0-4.0之间");
        }
        this.gpa = gpa;
    }
    
    // 业务方法
    public boolean isHonorStudent() {
        return gpa >= 3.5;
    }
    
    public int getStudyYears() {
        return LocalDate.now().getYear() - enrollmentDate.getYear();
    }
    
    // equals和hashCode方法
    @Override
    public boolean equals(Object obj) {
        if (this == obj) return true;
        if (obj == null || getClass() != obj.getClass()) return false;
        Student student = (Student) obj;
        return Objects.equals(id, student.id);
    }
    
    @Override
    public int hashCode() {
        return Objects.hash(id);
    }
    
    // toString方法
    @Override
    public String toString() {
        return String.format("Student{id='%s', name='%s', age=%d, major='%s', gpa=%.2f}",
                id, name, age, major, gpa);
    }
}
```

### 2. 服务层设计

```java
// StudentService.java - 学生服务类
package com.example.service;

import com.example.model.Student;
import java.util.*;
import java.util.stream.Collectors;

/**
 * 学生服务类
 * 演示集合框架、Stream API、异常处理等
 */
public class StudentService {
    private Map<String, Student> students;
    
    public StudentService() {
        this.students = new HashMap<>();
        initializeTestData();
    }
    
    /**
     * 初始化测试数据
     */
    private void initializeTestData() {
        addStudent(new Student("S001", "张三", 20, "计算机科学"));
        addStudent(new Student("S002", "李四", 21, "软件工程"));
        addStudent(new Student("S003", "王五", 19, "数据科学"));
        
        // 设置GPA
        students.get("S001").setGpa(3.8);
        students.get("S002").setGpa(3.2);
        students.get("S003").setGpa(3.9);
    }
    
    /**
     * 添加学生
     */
    public boolean addStudent(Student student) {
        if (student == null || student.getId() == null) {
            throw new IllegalArgumentException("学生信息不能为空");
        }
        
        if (students.containsKey(student.getId())) {
            return false; // 学生已存在
        }
        
        students.put(student.getId(), student);
        return true;
    }
    
    /**
     * 根据ID查找学生
     */
    public Optional<Student> findStudentById(String id) {
        return Optional.ofNullable(students.get(id));
    }
    
    /**
     * 根据姓名查找学生
     */
    public List<Student> findStudentsByName(String name) {
        return students.values().stream()
                .filter(student -> student.getName().contains(name))
                .collect(Collectors.toList());
    }
    
    /**
     * 根据专业查找学生
     */
    public List<Student> findStudentsByMajor(String major) {
        return students.values().stream()
                .filter(student -> student.getMajor().equals(major))
                .collect(Collectors.toList());
    }
    
    /**
     * 获取所有学生
     */
    public List<Student> getAllStudents() {
        return new ArrayList<>(students.values());
    }
    
    /**
     * 获取优秀学生（GPA >= 3.5）
     */
    public List<Student> getHonorStudents() {
        return students.values().stream()
                .filter(Student::isHonorStudent)
                .sorted((s1, s2) -> Double.compare(s2.getGpa(), s1.getGpa()))
                .collect(Collectors.toList());
    }
    
    /**
     * 更新学生信息
     */
    public boolean updateStudent(Student student) {
        if (student == null || student.getId() == null) {
            return false;
        }
        
        if (!students.containsKey(student.getId())) {
            return false;
        }
        
        students.put(student.getId(), student);
        return true;
    }
    
    /**
     * 删除学生
     */
    public boolean deleteStudent(String id) {
        return students.remove(id) != null;
    }
    
    /**
     * 获取统计信息
     */
    public StudentStatistics getStatistics() {
        List<Student> allStudents = getAllStudents();
        
        if (allStudents.isEmpty()) {
            return new StudentStatistics(0, 0.0, 0.0, 0.0, new HashMap<>());
        }
        
        double avgGpa = allStudents.stream()
                .mapToDouble(Student::getGpa)
                .average()
                .orElse(0.0);
        
        double maxGpa = allStudents.stream()
                .mapToDouble(Student::getGpa)
                .max()
                .orElse(0.0);
        
        double minGpa = allStudents.stream()
                .mapToDouble(Student::getGpa)
                .min()
                .orElse(0.0);
        
        Map<String, Long> majorCount = allStudents.stream()
                .collect(Collectors.groupingBy(
                    Student::getMajor,
                    Collectors.counting()
                ));
        
        return new StudentStatistics(
            allStudents.size(),
            avgGpa,
            maxGpa,
            minGpa,
            majorCount
        );
    }
    
    /**
     * 统计信息内部类
     */
    public static class StudentStatistics {
        private final int totalStudents;
        private final double averageGpa;
        private final double maxGpa;
        private final double minGpa;
        private final Map<String, Long> majorDistribution;
        
        public StudentStatistics(int totalStudents, double averageGpa, 
                               double maxGpa, double minGpa, 
                               Map<String, Long> majorDistribution) {
            this.totalStudents = totalStudents;
            this.averageGpa = averageGpa;
            this.maxGpa = maxGpa;
            this.minGpa = minGpa;
            this.majorDistribution = majorDistribution;
        }
        
        // Getter方法
        public int getTotalStudents() { return totalStudents; }
        public double getAverageGpa() { return averageGpa; }
        public double getMaxGpa() { return maxGpa; }
        public double getMinGpa() { return minGpa; }
        public Map<String, Long> getMajorDistribution() { return majorDistribution; }
        
        @Override
        public String toString() {
            StringBuilder sb = new StringBuilder();
            sb.append("学生统计信息:\n");
            sb.append(String.format("总学生数: %d\n", totalStudents));
            sb.append(String.format("平均GPA: %.2f\n", averageGpa));
            sb.append(String.format("最高GPA: %.2f\n", maxGpa));
            sb.append(String.format("最低GPA: %.2f\n", minGpa));
            sb.append("专业分布:\n");
            majorDistribution.forEach((major, count) -> 
                sb.append(String.format("  %s: %d人\n", major, count)));
            return sb.toString();
        }
    }
}
```

### 3. 工具类设计

```java
// ValidationUtil.java - 验证工具类
package com.example.util;

import java.util.regex.Pattern;

/**
 * 验证工具类
 * 演示静态方法、正则表达式等
 */
public class ValidationUtil {
    
    // 学号格式：S + 3位数字
    private static final Pattern STUDENT_ID_PATTERN = Pattern.compile("^S\\d{3}$");
    
    // 姓名格式：2-10个中文字符或英文字母
    private static final Pattern NAME_PATTERN = Pattern.compile("^[\\u4e00-\\u9fa5a-zA-Z]{2,10}$");
    
    /**
     * 验证学号格式
     */
    public static boolean isValidStudentId(String id) {
        return id != null && STUDENT_ID_PATTERN.matcher(id).matches();
    }
    
    /**
     * 验证姓名格式
     */
    public static boolean isValidName(String name) {
        return name != null && NAME_PATTERN.matcher(name).matches();
    }
    
    /**
     * 验证年龄范围
     */
    public static boolean isValidAge(int age) {
        return age >= 16 && age <= 35;
    }
    
    /**
     * 验证GPA范围
     */
    public static boolean isValidGpa(double gpa) {
        return gpa >= 0.0 && gpa <= 4.0;
    }
    
    /**
     * 验证专业名称
     */
    public static boolean isValidMajor(String major) {
        return major != null && !major.trim().isEmpty() && major.length() <= 50;
    }
}
```

```java
// FileUtil.java - 文件操作工具类
package com.example.util;

import com.example.model.Student;
import java.io.*;
import java.time.LocalDate;
import java.time.format.DateTimeFormatter;
import java.util.ArrayList;
import java.util.List;

/**
 * 文件操作工具类
 * 演示文件I/O、异常处理等
 */
public class FileUtil {
    
    private static final String CSV_HEADER = "ID,姓名,年龄,专业,入学日期,GPA";
    private static final DateTimeFormatter DATE_FORMATTER = DateTimeFormatter.ofPattern("yyyy-MM-dd");
    
    /**
     * 将学生列表导出到CSV文件
     */
    public static void exportToCSV(List<Student> students, String filename) throws IOException {
        try (PrintWriter writer = new PrintWriter(new FileWriter(filename, false))) {
            writer.println(CSV_HEADER);
            
            for (Student student : students) {
                writer.printf("%s,%s,%d,%s,%s,%.2f%n",
                    student.getId(),
                    student.getName(),
                    student.getAge(),
                    student.getMajor(),
                    student.getEnrollmentDate().format(DATE_FORMATTER),
                    student.getGpa());
            }
        }
    }
    
    /**
     * 从CSV文件导入学生列表
     */
    public static List<Student> importFromCSV(String filename) throws IOException {
        List<Student> students = new ArrayList<>();
        
        try (BufferedReader reader = new BufferedReader(new FileReader(filename))) {
            String line = reader.readLine(); // 跳过标题行
            
            while ((line = reader.readLine()) != null) {
                String[] parts = line.split(",");
                if (parts.length == 6) {
                    try {
                        Student student = new Student(
                            parts[0].trim(),
                            parts[1].trim(),
                            Integer.parseInt(parts[2].trim()),
                            parts[3].trim(),
                            LocalDate.parse(parts[4].trim(), DATE_FORMATTER),
                            Double.parseDouble(parts[5].trim())
                        );
                        students.add(student);
                    } catch (Exception e) {
                        System.err.println("解析行数据失败: " + line + ", 错误: " + e.getMessage());
                    }
                }
            }
        }
        
        return students;
    }
    
    /**
     * 将对象序列化到文件
     */
    public static void serializeToFile(Object obj, String filename) throws IOException {
        try (ObjectOutputStream oos = new ObjectOutputStream(new FileOutputStream(filename))) {
            oos.writeObject(obj);
        }
    }
    
    /**
     * 从文件反序列化对象
     */
    @SuppressWarnings("unchecked")
    public static <T> T deserializeFromFile(String filename, Class<T> clazz) 
            throws IOException, ClassNotFoundException {
        try (ObjectInputStream ois = new ObjectInputStream(new FileInputStream(filename))) {
            return (T) ois.readObject();
        }
    }
}
```

### 4. 主程序设计

```java
// Main.java - 主程序
package com.example;

import com.example.model.Student;
import com.example.service.StudentService;
import com.example.util.FileUtil;
import com.example.util.ValidationUtil;

import java.time.LocalDate;
import java.util.List;
import java.util.Optional;
import java.util.Scanner;

/**
 * 学生管理系统主程序
 * 演示控制台交互、异常处理、完整业务流程
 */
public class Main {
    
    private static StudentService studentService = new StudentService();
    private static Scanner scanner = new Scanner(System.in);
    
    public static void main(String[] args) {
        System.out.println("=== 欢迎使用学生管理系统 ===");
        
        while (true) {
            showMenu();
            int choice = getChoice();
            
            try {
                switch (choice) {
                    case 1:
                        addStudent();
                        break;
                    case 2:
                        findStudent();
                        break;
                    case 3:
                        listAllStudents();
                        break;
                    case 4:
                        listHonorStudents();
                        break;
                    case 5:
                        updateStudent();
                        break;
                    case 6:
                        deleteStudent();
                        break;
                    case 7:
                        showStatistics();
                        break;
                    case 8:
                        exportData();
                        break;
                    case 9:
                        importData();
                        break;
                    case 0:
                        System.out.println("感谢使用，再见！");
                        return;
                    default:
                        System.out.println("无效选择，请重新输入！");
                }
            } catch (Exception e) {
                System.err.println("操作失败: " + e.getMessage());
            }
            
            System.out.println("\n按回车键继续...");
            scanner.nextLine();
        }
    }
    
    private static void showMenu() {
        System.out.println("\n=== 主菜单 ===");
        System.out.println("1. 添加学生");
        System.out.println("2. 查找学生");
        System.out.println("3. 显示所有学生");
        System.out.println("4. 显示优秀学生");
        System.out.println("5. 更新学生信息");
        System.out.println("6. 删除学生");
        System.out.println("7. 统计信息");
        System.out.println("8. 导出数据");
        System.out.println("9. 导入数据");
        System.out.println("0. 退出系统");
        System.out.print("请选择操作: ");
    }
    
    private static int getChoice() {
        try {
            return Integer.parseInt(scanner.nextLine().trim());
        } catch (NumberFormatException e) {
            return -1;
        }
    }
    
    private static void addStudent() {
        System.out.println("\n=== 添加学生 ===");
        
        System.out.print("学号 (格式: S001): ");
        String id = scanner.nextLine().trim();
        if (!ValidationUtil.isValidStudentId(id)) {
            System.out.println("学号格式错误！");
            return;
        }
        
        System.out.print("姓名: ");
        String name = scanner.nextLine().trim();
        if (!ValidationUtil.isValidName(name)) {
            System.out.println("姓名格式错误！");
            return;
        }
        
        System.out.print("年龄: ");
        int age;
        try {
            age = Integer.parseInt(scanner.nextLine().trim());
            if (!ValidationUtil.isValidAge(age)) {
                System.out.println("年龄必须在16-35之间！");
                return;
            }
        } catch (NumberFormatException e) {
            System.out.println("年龄格式错误！");
            return;
        }
        
        System.out.print("专业: ");
        String major = scanner.nextLine().trim();
        if (!ValidationUtil.isValidMajor(major)) {
            System.out.println("专业名称无效！");
            return;
        }
        
        Student student = new Student(id, name, age, major);
        
        if (studentService.addStudent(student)) {
            System.out.println("学生添加成功！");
        } else {
            System.out.println("学生已存在！");
        }
    }
    
    private static void findStudent() {
        System.out.println("\n=== 查找学生 ===");
        System.out.println("1. 按学号查找");
        System.out.println("2. 按姓名查找");
        System.out.println("3. 按专业查找");
        System.out.print("请选择查找方式: ");
        
        int choice = getChoice();
        switch (choice) {
            case 1:
                System.out.print("请输入学号: ");
                String id = scanner.nextLine().trim();
                Optional<Student> student = studentService.findStudentById(id);
                if (student.isPresent()) {
                    System.out.println("找到学生: " + student.get());
                } else {
                    System.out.println("未找到该学生！");
                }
                break;
            case 2:
                System.out.print("请输入姓名: ");
                String name = scanner.nextLine().trim();
                List<Student> studentsByName = studentService.findStudentsByName(name);
                displayStudents(studentsByName);
                break;
            case 3:
                System.out.print("请输入专业: ");
                String major = scanner.nextLine().trim();
                List<Student> studentsByMajor = studentService.findStudentsByMajor(major);
                displayStudents(studentsByMajor);
                break;
            default:
                System.out.println("无效选择！");
        }
    }
    
    private static void listAllStudents() {
        System.out.println("\n=== 所有学生 ===");
        List<Student> students = studentService.getAllStudents();
        displayStudents(students);
    }
    
    private static void listHonorStudents() {
        System.out.println("\n=== 优秀学生 (GPA >= 3.5) ===");
        List<Student> honorStudents = studentService.getHonorStudents();
        displayStudents(honorStudents);
    }
    
    private static void updateStudent() {
        System.out.println("\n=== 更新学生信息 ===");
        System.out.print("请输入要更新的学生学号: ");
        String id = scanner.nextLine().trim();
        
        Optional<Student> optionalStudent = studentService.findStudentById(id);
        if (!optionalStudent.isPresent()) {
            System.out.println("未找到该学生！");
            return;
        }
        
        Student student = optionalStudent.get();
        System.out.println("当前学生信息: " + student);
        
        System.out.print("新的GPA (当前: " + student.getGpa() + "): ");
        String gpaStr = scanner.nextLine().trim();
        if (!gpaStr.isEmpty()) {
            try {
                double gpa = Double.parseDouble(gpaStr);
                if (ValidationUtil.isValidGpa(gpa)) {
                    student.setGpa(gpa);
                    if (studentService.updateStudent(student)) {
                        System.out.println("学生信息更新成功！");
                    } else {
                        System.out.println("更新失败！");
                    }
                } else {
                    System.out.println("GPA必须在0.0-4.0之间！");
                }
            } catch (NumberFormatException e) {
                System.out.println("GPA格式错误！");
            }
        }
    }
    
    private static void deleteStudent() {
        System.out.println("\n=== 删除学生 ===");
        System.out.print("请输入要删除的学生学号: ");
        String id = scanner.nextLine().trim();
        
        if (studentService.deleteStudent(id)) {
            System.out.println("学生删除成功！");
        } else {
            System.out.println("未找到该学生！");
        }
    }
    
    private static void showStatistics() {
        System.out.println("\n=== 统计信息 ===");
        StudentService.StudentStatistics stats = studentService.getStatistics();
        System.out.println(stats);
    }
    
    private static void exportData() {
        System.out.println("\n=== 导出数据 ===");
        System.out.print("请输入导出文件名 (例: students.csv): ");
        String filename = scanner.nextLine().trim();
        
        try {
            List<Student> students = studentService.getAllStudents();
            FileUtil.exportToCSV(students, filename);
            System.out.println("数据导出成功！文件: " + filename);
        } catch (Exception e) {
            System.err.println("导出失败: " + e.getMessage());
        }
    }
    
    private static void importData() {
        System.out.println("\n=== 导入数据 ===");
        System.out.print("请输入导入文件名: ");
        String filename = scanner.nextLine().trim();
        
        try {
            List<Student> students = FileUtil.importFromCSV(filename);
            int successCount = 0;
            for (Student student : students) {
                if (studentService.addStudent(student)) {
                    successCount++;
                }
            }
            System.out.println("导入完成！成功导入 " + successCount + " 个学生记录。");
        } catch (Exception e) {
            System.err.println("导入失败: " + e.getMessage());
        }
    }
    
    private static void displayStudents(List<Student> students) {
        if (students.isEmpty()) {
            System.out.println("没有找到学生记录。");
            return;
        }
        
        System.out.println("\n学生列表:");
        System.out.println("学号\t姓名\t年龄\t专业\t\tGPA\t优秀学生");
        System.out.println("================================================");
        
        for (Student student : students) {
            System.out.printf("%s\t%s\t%d\t%-10s\t%.2f\t%s%n",
                student.getId(),
                student.getName(),
                student.getAge(),
                student.getMajor(),
                student.getGpa(),
                student.isHonorStudent() ? "是" : "否");
        }
        
        System.out.println("总计: " + students.size() + " 个学生");
    }
}
```

## 编译和运行演示

### 1. 编译项目

```bash
# 创建输出目录
mkdir -p classes

# 编译所有Java文件
javac -d classes -sourcepath src/main/java src/main/java/com/example/*.java src/main/java/com/example/*/*.java

# 或者使用通配符
find src/main/java -name "*.java" | xargs javac -d classes
```

### 2. 运行程序

```bash
# 运行主程序
java -cp classes com.example.Main

# 或者创建JAR文件后运行
jar cfe student-management.jar com.example.Main -C classes .
java -jar student-management.jar
```

### 3. 构建脚本

```bash
#!/bin/bash
# build.sh

echo "清理输出目录..."
rm -rf classes docs
mkdir -p classes docs

echo "编译源代码..."
find src/main/java -name "*.java" | xargs javac -d classes

if [ $? -eq 0 ]; then
    echo "编译成功！"
    
    echo "生成文档..."
    javadoc -d docs -sourcepath src/main/java -subpackages com.example
    
    echo "创建JAR文件..."
    jar cfe student-management.jar com.example.Main -C classes .
    
    echo "构建完成！"
    echo "运行程序: java -jar student-management.jar"
else
    echo "编译失败！"
    exit 1
fi
```

## 高级特性演示

### 1. 多线程处理

```java
// ConcurrentStudentService.java
package com.example.service;

import com.example.model.Student;
import java.util.concurrent.ConcurrentHashMap;
import java.util.concurrent.locks.ReadWriteLock;
import java.util.concurrent.locks.ReentrantReadWriteLock;

/**
 * 线程安全的学生服务
 * 演示并发编程、锁机制
 */
public class ConcurrentStudentService {
    private final ConcurrentHashMap<String, Student> students;
    private final ReadWriteLock lock = new ReentrantReadWriteLock();
    
    public ConcurrentStudentService() {
        this.students = new ConcurrentHashMap<>();
    }
    
    public boolean addStudent(Student student) {
        lock.writeLock().lock();
        try {
            if (students.containsKey(student.getId())) {
                return false;
            }
            students.put(student.getId(), student);
            return true;
        } finally {
            lock.writeLock().unlock();
        }
    }
    
    public Student findStudentById(String id) {
        lock.readLock().lock();
        try {
            return students.get(id);
        } finally {
            lock.readLock().unlock();
        }
    }
}
```

### 2. 泛型和反射

```java
// GenericDAO.java
package com.example.dao;

import java.lang.reflect.Field;
import java.util.*;

/**
 * 泛型数据访问对象
 * 演示泛型、反射机制
 */
public class GenericDAO<T> {
    private final Class<T> entityClass;
    private final Map<String, T> storage;
    
    public GenericDAO(Class<T> entityClass) {
        this.entityClass = entityClass;
        this.storage = new HashMap<>();
    }
    
    public void save(T entity) {
        String id = getId(entity);
        if (id != null) {
            storage.put(id, entity);
        }
    }
    
    public T findById(String id) {
        return storage.get(id);
    }
    
    public List<T> findAll() {
        return new ArrayList<>(storage.values());
    }
    
    private String getId(T entity) {
        try {
            Field idField = entityClass.getDeclaredField("id");
            idField.setAccessible(true);
            return (String) idField.get(entity);
        } catch (Exception e) {
            return null;
        }
    }
}
```

### 3. Lambda表达式和Stream API

```java
// StudentAnalyzer.java
package com.example.analyzer;

import com.example.model.Student;
import java.util.*;
import java.util.stream.Collectors;

/**
 * 学生数据分析器
 * 演示Lambda表达式、Stream API、函数式编程
 */
public class StudentAnalyzer {
    
    /**
     * 按GPA分组
     */
    public static Map<String, List<Student>> groupByGpaLevel(List<Student> students) {
        return students.stream()
            .collect(Collectors.groupingBy(student -> {
                double gpa = student.getGpa();
                if (gpa >= 3.7) return "优秀";
                else if (gpa >= 3.0) return "良好";
                else if (gpa >= 2.0) return "及格";
                else return "不及格";
            }));
    }
    
    /**
     * 查找最高GPA的学生
     */
    public static Optional<Student> findTopStudent(List<Student> students) {
        return students.stream()
            .max(Comparator.comparing(Student::getGpa));
    }
    
    /**
     * 计算各专业平均GPA
     */
    public static Map<String, Double> calculateAverageGpaByMajor(List<Student> students) {
        return students.stream()
            .collect(Collectors.groupingBy(
                Student::getMajor,
                Collectors.averagingDouble(Student::getGpa)
            ));
    }
    
    /**
     * 筛选并排序
     */
    public static List<Student> filterAndSort(List<Student> students, 
                                            double minGpa, 
                                            String major) {
        return students.stream()
            .filter(s -> s.getGpa() >= minGpa)
            .filter(s -> major == null || s.getMajor().equals(major))
            .sorted(Comparator.comparing(Student::getGpa).reversed())
            .collect(Collectors.toList());
    }
}
```

## 测试和调试

### 1. 单元测试示例

```java
// StudentServiceTest.java
package com.example.service;

import com.example.model.Student;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import static org.junit.jupiter.api.Assertions.*;

/**
 * 学生服务测试类
 * 演示单元测试、断言
 */
class StudentServiceTest {
    
    private StudentService studentService;
    
    @BeforeEach
    void setUp() {
        studentService = new StudentService();
    }
    
    @Test
    void testAddStudent() {
        Student student = new Student("S999", "测试学生", 20, "测试专业");
        assertTrue(studentService.addStudent(student));
        assertFalse(studentService.addStudent(student)); // 重复添加
    }
    
    @Test
    void testFindStudentById() {
        Student student = new Student("S999", "测试学生", 20, "测试专业");
        studentService.addStudent(student);
        
        assertTrue(studentService.findStudentById("S999").isPresent());
        assertFalse(studentService.findStudentById("S000").isPresent());
    }
    
    @Test
    void testGetHonorStudents() {
        Student student1 = new Student("S997", "优秀学生", 20, "计算机");
        student1.setGpa(3.8);
        
        Student student2 = new Student("S998", "普通学生", 21, "计算机");
        student2.setGpa(2.5);
        
        studentService.addStudent(student1);
        studentService.addStudent(student2);
        
        assertEquals(1, studentService.getHonorStudents().size());
    }
}
```

### 2. 调试技巧

```java
// 使用断言进行调试
assert student != null : "学生对象不能为空";
assert student.getGpa() >= 0.0 && student.getGpa() <= 4.0 : "GPA超出有效范围";

// 使用日志记录
import java.util.logging.Logger;
import java.util.logging.Level;

private static final Logger logger = Logger.getLogger(StudentService.class.getName());

public boolean addStudent(Student student) {
    logger.info("尝试添加学生: " + student.getId());
    
    if (students.containsKey(student.getId())) {
        logger.warning("学生已存在: " + student.getId());
        return false;
    }
    
    students.put(student.getId(), student);
    logger.info("学生添加成功: " + student.getId());
    return true;
}
```

## 总结

这个Java实战演示项目涵盖了Java开发的核心概念和技术：

1. **面向对象编程**：类、对象、封装、继承
2. **集合框架**：List、Map、Set的使用
3. **异常处理**：try-catch、自定义异常
4. **文件I/O**：文件读写、序列化
5. **多线程**：并发安全、锁机制
6. **泛型和反射**：类型安全、动态操作
7. **函数式编程**：Lambda、Stream API
8. **测试和调试**：单元测试、日志记录

通过这个完整的项目示例，可以深入理解Java语言的特性和最佳实践。