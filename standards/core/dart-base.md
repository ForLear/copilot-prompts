# Dart 基础规范

> 基于 [Effective Dart](https://dart.dev/effective-dart) 和 Flutter 官方最佳实践

## 核心原则

1. **类型安全优先** - 充分利用 Dart 的类型系统和空安全特性
2. **简洁清晰** - 代码应当简洁但不失可读性
3. **函数式风格** - 优先使用函数式和声明式编程模式
4. **不可变性** - 优先使用不可变数据结构
5. **测试优先** - 编写可测试的代码

## 类型系统

### 空安全 (Null Safety)

```dart
// ✅ 好 - 充分利用空安全
String? nullableString;
String nonNullableString = 'Hello';

// 使用 null 检查
if (nullableString != null) {
  print(nullableString.length);
}

// 使用 null-aware 操作符
final length = nullableString?.length ?? 0;

// ❌ 坏 - 避免使用 ! 除非确定非空
final length = nullableString!.length; // 危险!
```

### 类型推断

```dart
// ✅ 好 - 让 Dart 推断明显的类型
var name = 'John';
var count = 42;
final items = <String>[];

// ✅ 好 - 显式声明不明显的类型
String? getUserName() => null;
final String? username = getUserName();

// ❌ 坏 - 过度类型标注
String name = 'John'; // 不必要
```

### 泛型

```dart
// ✅ 好 - 使用泛型保证类型安全
class Box<T> {
  final T value;
  Box(this.value);
}

final stringBox = Box<String>('Hello');

// 泛型方法
T first<T>(List<T> items) => items.first;

// ❌ 坏 - 避免使用 dynamic
class Box {
  final dynamic value; // 失去类型安全
  Box(this.value);
}
```

## 函数与方法

### 函数定义

```dart
// ✅ 好 - 清晰的参数和返回类型
int add(int a, int b) => a + b;

// 命名参数
String greet({
  required String name,
  String title = '',
}) {
  return title.isEmpty ? name : '$title $name';
}

// 可选位置参数
String formatDate(DateTime date, [String format = 'yyyy-MM-dd']) {
  // 实现
}
```

### 异步编程

```dart
// ✅ 好 - 正确使用 async/await
Future<User?> fetchUser(String id) async {
  try {
    final response = await http.get(Uri.parse('/api/users/$id'));
    if (response.statusCode == 200) {
      return User.fromJson(jsonDecode(response.body));
    }
    return null;
  } catch (e) {
    print('Error fetching user: $e');
    return null;
  }
}

// ✅ 好 - 使用 Stream 处理事件序列
Stream<int> countStream(int max) async* {
  for (var i = 0; i < max; i++) {
    await Future.delayed(Duration(seconds: 1));
    yield i;
  }
}

// ❌ 坏 - 忘记 await
Future<void> saveUser(User user) async {
  database.save(user); // 忘记 await!
}
```

### 箭头函数

```dart
// ✅ 好 - 单行函数使用箭头语法
int square(int x) => x * x;
bool get isValid => value > 0 && value < 100;

// ✅ 好 - 复杂逻辑使用函数体
String formatName(String first, String last) {
  final firstName = first.trim();
  final lastName = last.trim();
  return '$lastName, $firstName';
}

// ❌ 坏 - 过度复杂的箭头函数
String formatName(String first, String last) => 
  '${last.trim()}, ${first.trim().toUpperCase()}'; // 难以阅读
```

## 类与对象

### 类定义

```dart
// ✅ 好 - 清晰的类结构
class User {
  // 1. 构造函数首先
  User({
    required this.id,
    required this.name,
    this.email,
  });
  
  // 2. 命名构造函数
  User.guest() : id = 0, name = 'Guest', email = null;
  
  // 3. 字段
  final int id;
  final String name;
  final String? email;
  
  // 4. Getters
  bool get hasEmail => email != null;
  
  // 5. 方法
  Map<String, dynamic> toJson() => {
    'id': id,
    'name': name,
    'email': email,
  };
  
  // 6. 重写方法
  @override
  String toString() => 'User($id: $name)';
  
  @override
  bool operator ==(Object other) =>
    identical(this, other) ||
    other is User && 
    runtimeType == other.runtimeType &&
    id == other.id;
  
  @override
  int get hashCode => id.hashCode;
}
```

### 不可变类

```dart
// ✅ 好 - 使用不可变数据
class Point {
  const Point(this.x, this.y);
  
  final double x;
  final double y;
  
  // 返回新实例而不是修改
  Point translate(double dx, double dy) => 
    Point(x + dx, y + dy);
}

// ❌ 坏 - 可变状态
class Point {
  Point(this.x, this.y);
  
  double x;
  double y;
  
  void translate(double dx, double dy) {
    x += dx;
    y += dy;
  }
}
```

## 模式匹配

### Switch 表达式和语句

```dart
// ✅ 好 - 使用 switch 表达式
String getStatusMessage(Status status) => switch (status) {
  Status.pending => '等待中',
  Status.running => '运行中',
  Status.completed => '已完成',
  Status.failed => '失败',
};

// ✅ 好 - 模式匹配
String describe(Object obj) => switch (obj) {
  int() => '整数',
  String() => '字符串',
  List<int>() => '整数列表',
  _ => '其他类型',
};

// ✅ 好 - 解构
void processUser(User user) {
  final User(:name, :email) = user;
  print('$name: ${email ?? "无邮箱"}');
}
```

### Records (记录类型)

```dart
// ✅ 好 - 使用 Record 返回多个值
(int, String) getUserInfo() => (42, 'John');

// 命名字段
({int age, String name}) getDetailedUserInfo() => 
  (age: 42, name: 'John');

// 解构使用
final (age, name) = getUserInfo();
final (:age, :name) = getDetailedUserInfo();

// ❌ 坏 - 为简单返回定义完整的类
class UserInfo {
  final int age;
  final String name;
  UserInfo(this.age, this.name);
}
```

## 集合

### 列表操作

```dart
// ✅ 好 - 使用函数式方法
final numbers = [1, 2, 3, 4, 5];

final doubled = numbers.map((n) => n * 2).toList();
final evens = numbers.where((n) => n.isEven).toList();
final sum = numbers.reduce((a, b) => a + b);

// ✅ 好 - 集合字面量
final names = <String>['Alice', 'Bob'];
final scores = <String, int>{'Alice': 90, 'Bob': 85};
final uniqueIds = <int>{1, 2, 3};

// ✅ 好 - 集合 if 和 for
final items = [
  'Home',
  if (isLoggedIn) 'Profile',
  if (isAdmin) 'Admin Panel',
  for (var category in categories) category.name,
];
```

### Spread 操作符

```dart
// ✅ 好 - 使用 spread 操作符
final first = [1, 2, 3];
final second = [4, 5, 6];
final combined = [...first, ...second];

// null-aware spread
final List<int>? optional = null;
final result = [...first, ...?optional]; // [1, 2, 3]
```

## 错误处理

### 异常处理

```dart
// ✅ 好 - 具体的异常类型
class ValidationException implements Exception {
  final String message;
  ValidationException(this.message);
  
  @override
  String toString() => 'ValidationException: $message';
}

// ✅ 好 - 适当的 try-catch
Future<void> processData(String data) async {
  try {
    final parsed = jsonDecode(data);
    await saveToDatabase(parsed);
  } on FormatException catch (e) {
    print('Invalid JSON format: $e');
    rethrow;
  } on DatabaseException catch (e, stackTrace) {
    print('Database error: $e');
    print(stackTrace);
    throw ProcessingException('Failed to save data');
  } finally {
    cleanup();
  }
}

// ❌ 坏 - 捕获所有异常却不处理
try {
  dangerousOperation();
} catch (e) {
  // 空的 catch 块 - 隐藏错误!
}
```

## 命名规范

### 标识符命名

```dart
// ✅ 好 - 清晰的命名
class UserProfile {}           // UpperCamelCase 类名
void fetchUserData() {}        // lowerCamelCase 函数/方法
const maxRetryCount = 3;       // lowerCamelCase 常量
enum NetworkStatus {}          // UpperCamelCase 枚举
final _privateField = 0;       // 下划线开头表示私有

// 文件名使用 snake_case
// user_profile.dart
// network_service.dart

// ❌ 坏 - 不清晰的命名
class UP {}                    // 缩写不清晰
void fetchUD() {}              // 缩写不清晰
const MAX_RETRY = 3;           // Dart 不使用 SCREAMING_CAPS
```

### 布尔值命名

```dart
// ✅ 好 - 使用 is/has/can 等前缀
bool isValid;
bool hasPermission;
bool canEdit;
bool shouldRetry;

// ❌ 坏
bool valid;       // 不够清晰
bool permission;  // 听起来不像布尔值
```

## 断言和调试

### 使用 assert

```dart
// ✅ 好 - 使用 assert 验证不变量
class Rectangle {
  Rectangle(this.width, this.height)
    : assert(width > 0, 'Width must be positive'),
      assert(height > 0, 'Height must be positive');
  
  final double width;
  final double height;
  
  double get area {
    assert(!width.isNaN && !height.isNaN);
    return width * height;
  }
}

// ✅ 好 - 调试时的断言
void processItems(List<Item> items) {
  assert(() {
    // 复杂的验证逻辑,仅在 debug 模式运行
    for (final item in items) {
      if (!item.isValid) {
        print('Invalid item found: $item');
        return false;
      }
    }
    return true;
  }());
  
  // 处理逻辑...
}
```

## 文档注释

### DartDoc 风格

```dart
/// 计算两个数的和。
///
/// 接受两个整数参数 [a] 和 [b],返回它们的和。
///
/// 示例:
/// ```dart
/// final result = add(2, 3);
/// print(result); // 输出: 5
/// ```
int add(int a, int b) => a + b;

/// 表示应用程序中的用户。
///
/// [User] 是不可变的,包含用户的基本信息。
/// 使用 [User.guest] 创建访客用户。
///
/// 另见:
/// * [UserProfile] - 用户的详细资料
/// * [UserRepository] - 用户数据访问
class User {
  /// 创建新用户实例。
  ///
  /// [id] 和 [name] 是必需的。
  /// [email] 是可选的。
  User({
    required this.id,
    required this.name,
    this.email,
  });
  
  /// 用户的唯一标识符。
  final int id;
  
  /// 用户的显示名称。
  final String name;
  
  /// 用户的电子邮件地址(可选)。
  final String? email;
}
```

## 避免的模式

### ❌ 避免使用 dynamic

```dart
// ❌ 坏 - 失去类型安全
dynamic data = fetchData();
print(data.length); // 运行时才知道是否出错

// ✅ 好 - 使用具体类型或泛型
Object data = fetchData();
if (data is String) {
  print(data.length);
}
```

### ❌ 避免过度使用 extension

```dart
// ❌ 坏 - 不必要的 extension
extension StringExtension on String {
  String capitalize() => this[0].toUpperCase() + substring(1);
}

// ✅ 好 - 使用普通函数
String capitalize(String str) => 
  str[0].toUpperCase() + str.substring(1);
```

### ❌ 避免 part/part of

```dart
// ❌ 坏 - 避免使用 part/part of
// file1.dart
part of 'main.dart';

// ✅ 好 - 使用 import/export
// file1.dart
class MyClass {}

// main.dart
import 'file1.dart';
```

## 性能建议

### 避免不必要的计算

```dart
// ✅ 好 - 缓存计算结果
class Rectangle {
  Rectangle(this.width, this.height);
  
  final double width;
  final double height;
  
  late final double area = width * height; // 只计算一次
}

// ❌ 坏 - 重复计算
class Rectangle {
  Rectangle(this.width, this.height);
  
  final double width;
  final double height;
  
  double get area => width * height; // 每次访问都计算
}
```

### 使用 const 构造函数

```dart
// ✅ 好 - 使用 const 减少内存分配
class Color {
  const Color(this.r, this.g, this.b);
  
  final int r, g, b;
  
  static const red = Color(255, 0, 0);
  static const blue = Color(0, 0, 255);
}

// 使用时
const widget = Icon(icon: Icons.home, color: Color.red);
```

## 最佳实践总结

1. **充分利用空安全** - 明确区分可空和非空类型
2. **优先使用不可变数据** - 使用 `final` 和 `const`
3. **编写简洁的代码** - 但不牺牲可读性
4. **使用模式匹配** - switch 表达式和解构
5. **适当的异常处理** - 使用具体的异常类型
6. **编写文档注释** - 为公共 API 提供清晰的文档
7. **使用断言验证** - 在开发时捕获错误
8. **遵循命名规范** - 保持代码一致性
9. **测试优先** - 编写可测试的代码
10. **性能意识** - 使用 const、缓存等优化技巧

---

**参考资源:**
- [Effective Dart](https://dart.dev/effective-dart)
- [Dart Language Tour](https://dart.dev/language)
- [Flutter Style Guide](https://github.com/flutter/flutter/blob/main/docs/contributing/Style-guide-for-Flutter-repo.md)
