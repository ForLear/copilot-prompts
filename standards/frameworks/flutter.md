# Flutter 开发规范

> 基于 Flutter 官方 [Style Guide](https://github.com/flutter/flutter/blob/main/docs/contributing/Style-guide-for-Flutter-repo.md) 和最佳实践

## 🎯 核心原则

1. **组合优于继承** - 通过组合构建复杂的 Widget 和逻辑
2. **Widget 即 UI** - Flutter 中一切皆 Widget
3. **不可变 Widget** - Widget(尤其是 StatelessWidget)应该是不可变的
4. **状态分离** - 区分瞬时状态(ephemeral state)和应用状态(app state)
5. **简洁声明式** - 编写简洁的现代声明式代码
6. **性能优先** - 优化 Widget 重建和内存使用

## Widget 设计

### StatelessWidget vs StatefulWidget

```dart
// ✅ 好 - 无状态 Widget,不可变
class UserAvatar extends StatelessWidget {
  const UserAvatar({
    super.key,
    required this.imageUrl,
    this.size = 40,
  });

  final String imageUrl;
  final double size;

  @override
  Widget build(BuildContext context) {
    return CircleAvatar(
      radius: size / 2,
      backgroundImage: NetworkImage(imageUrl),
    );
  }
}

// ✅ 好 - 有状态 Widget,状态清晰
class Counter extends StatefulWidget {
  const Counter({super.key});

  @override
  State<Counter> createState() => _CounterState();
}

class _CounterState extends State<Counter> {
  int _count = 0;

  void _increment() {
    setState(() {
      _count++;
    });
  }

  @override
  Widget build(BuildContext context) {
    return Column(
      children: [
        Text('Count: $_count'),
        ElevatedButton(
          onPressed: _increment,
          child: const Text('Increment'),
        ),
      ],
    );
  }
}

// ❌ 坏 - 不必要的 StatefulWidget
class UserAvatar extends StatefulWidget {
  const UserAvatar({super.key, required this.imageUrl});
  
  final String imageUrl;
  
  @override
  State<UserAvatar> createState() => _UserAvatarState();
}

class _UserAvatarState extends State<UserAvatar> {
  @override
  Widget build(BuildContext context) {
    return CircleAvatar(
      backgroundImage: NetworkImage(widget.imageUrl),
    );
  }
}
```

### Widget 构造函数

```dart
// ✅ 好 - 构造函数在最前,使用 const
class ProductCard extends StatelessWidget {
  // 1. 默认构造函数首先
  const ProductCard({
    super.key,
    required this.product,
    this.onTap,
  });
  
  // 2. 命名构造函数
  const ProductCard.compact({
    super.key,
    required this.product,
  }) : onTap = null;
  
  // 3. 字段
  final Product product;
  final VoidCallback? onTap;
  
  // 4. build 方法
  @override
  Widget build(BuildContext context) {
    return Card(
      child: InkWell(
        onTap: onTap,
        child: Column(
          children: [
            Image.network(product.imageUrl),
            Text(product.name),
            Text('\$${product.price}'),
          ],
        ),
      ),
    );
  }
}
```

### Widget 组合

```dart
// ✅ 好 - 将大 Widget 拆分成小的可复用组件
class ProductListItem extends StatelessWidget {
  const ProductListItem({super.key, required this.product});
  
  final Product product;
  
  @override
  Widget build(BuildContext context) {
    return Card(
      child: Row(
        children: [
          _ProductImage(imageUrl: product.imageUrl),
          Expanded(
            child: _ProductInfo(product: product),
          ),
          _ProductActions(product: product),
        ],
      ),
    );
  }
}

class _ProductImage extends StatelessWidget {
  const _ProductImage({required this.imageUrl});
  
  final String imageUrl;
  
  @override
  Widget build(BuildContext context) {
    return Image.network(
      imageUrl,
      width: 80,
      height: 80,
      fit: BoxFit.cover,
    );
  }
}

class _ProductInfo extends StatelessWidget {
  const _ProductInfo({required this.product});
  
  final Product product;
  
  @override
  Widget build(BuildContext context) {
    return Padding(
      padding: const EdgeInsets.all(8),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Text(
            product.name,
            style: Theme.of(context).textTheme.titleMedium,
          ),
          const SizedBox(height: 4),
          Text(
            product.description,
            maxLines: 2,
            overflow: TextOverflow.ellipsis,
          ),
        ],
      ),
    );
  }
}

// ❌ 坏 - 单一巨型 Widget
class ProductListItem extends StatelessWidget {
  const ProductListItem({super.key, required this.product});
  
  final Product product;
  
  @override
  Widget build(BuildContext context) {
    return Card(
      child: Row(
        children: [
          Image.network(
            product.imageUrl,
            width: 80,
            height: 80,
            fit: BoxFit.cover,
          ),
          Expanded(
            child: Padding(
              padding: const EdgeInsets.all(8),
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Text(
                    product.name,
                    style: Theme.of(context).textTheme.titleMedium,
                  ),
                  const SizedBox(height: 4),
                  Text(
                    product.description,
                    maxLines: 2,
                    overflow: TextOverflow.ellipsis,
                  ),
                  // ... 更多嵌套代码
                ],
              ),
            ),
          ),
          // ... 更多代码
        ],
      ),
    );
  }
}
```

## 状态管理

### 瞬时状态 (Ephemeral State)

```dart
// ✅ 好 - 使用 setState 管理局部状态
class TabContainer extends StatefulWidget {
  const TabContainer({super.key});

  @override
  State<TabContainer> createState() => _TabContainerState();
}

class _TabContainerState extends State<TabContainer> {
  int _selectedIndex = 0;

  @override
  Widget build(BuildContext context) {
    return Column(
      children: [
        TabBar(
          currentIndex: _selectedIndex,
          onTap: (index) {
            setState(() {
              _selectedIndex = index;
            });
          },
        ),
        IndexedStack(
          index: _selectedIndex,
          children: const [
            HomeTab(),
            ProfileTab(),
            SettingsTab(),
          ],
        ),
      ],
    );
  }
}
```

### 应用状态 (App State)

```dart
// ✅ 好 - 使用状态管理方案(如 Provider, Riverpod, Bloc)

// 使用 Provider 示例
class CartProvider extends ChangeNotifier {
  final List<Product> _items = [];
  
  List<Product> get items => List.unmodifiable(_items);
  
  int get itemCount => _items.length;
  
  double get totalPrice => 
    _items.fold(0, (sum, item) => sum + item.price);
  
  void addItem(Product product) {
    _items.add(product);
    notifyListeners();
  }
  
  void removeItem(Product product) {
    _items.remove(product);
    notifyListeners();
  }
  
  void clear() {
    _items.clear();
    notifyListeners();
  }
}

// 在 Widget 中使用
class CartButton extends StatelessWidget {
  const CartButton({super.key});
  
  @override
  Widget build(BuildContext context) {
    final itemCount = context.watch<CartProvider>().itemCount;
    
    return Badge(
      label: Text('$itemCount'),
      child: IconButton(
        icon: const Icon(Icons.shopping_cart),
        onPressed: () => Navigator.pushNamed(context, '/cart'),
      ),
    );
  }
}
```

## 布局最佳实践

### 响应式布局

```dart
// ✅ 好 - 使用 LayoutBuilder 创建响应式布局
class ResponsiveLayout extends StatelessWidget {
  const ResponsiveLayout({super.key, required this.child});
  
  final Widget child;
  
  @override
  Widget build(BuildContext context) {
    return LayoutBuilder(
      builder: (context, constraints) {
        if (constraints.maxWidth > 840) {
          return _DesktopLayout(child: child);
        } else if (constraints.maxWidth > 600) {
          return _TabletLayout(child: child);
        } else {
          return _MobileLayout(child: child);
        }
      },
    );
  }
}

// ✅ 好 - 使用 MediaQuery 获取屏幕信息
class AdaptiveCard extends StatelessWidget {
  const AdaptiveCard({super.key});
  
  @override
  Widget build(BuildContext context) {
    final size = MediaQuery.sizeOf(context);
    final isSmallScreen = size.width < 600;
    
    return Card(
      child: Padding(
        padding: EdgeInsets.all(isSmallScreen ? 8 : 16),
        child: Column(
          children: [
            if (!isSmallScreen) const Header(),
            const Content(),
          ],
        ),
      ),
    );
  }
}
```

### 避免溢出

```dart
// ✅ 好 - 使用 Flexible/Expanded 避免溢出
class UserInfo extends StatelessWidget {
  const UserInfo({super.key, required this.user});
  
  final User user;
  
  @override
  Widget build(BuildContext context) {
    return Row(
      children: [
        const CircleAvatar(radius: 24),
        const SizedBox(width: 8),
        Expanded( // 防止文本溢出
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              Text(
                user.name,
                overflow: TextOverflow.ellipsis,
                maxLines: 1,
              ),
              Text(
                user.email,
                overflow: TextOverflow.ellipsis,
                maxLines: 1,
                style: Theme.of(context).textTheme.bodySmall,
              ),
            ],
          ),
        ),
      ],
    );
  }
}

// ❌ 坏 - 可能导致溢出
class UserInfo extends StatelessWidget {
  const UserInfo({super.key, required this.user});
  
  final User user;
  
  @override
  Widget build(BuildContext context) {
    return Row(
      children: [
        const CircleAvatar(radius: 24),
        const SizedBox(width: 8),
        Column( // 没有限制宽度!
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Text(user.name), // 可能溢出
            Text(user.email),
          ],
        ),
      ],
    );
  }
}
```

## 主题和样式

### 使用 ThemeData

```dart
// ✅ 好 - 定义完整的主题
class MyApp extends StatelessWidget {
  const MyApp({super.key});

  @override
  Widget build(BuildContext context) {
    return MaterialApp(
      title: 'My App',
      theme: ThemeData(
        useMaterial3: true,
        colorScheme: ColorScheme.fromSeed(
          seedColor: Colors.blue,
          brightness: Brightness.light,
        ),
        textTheme: const TextTheme(
          displayLarge: TextStyle(
            fontSize: 57,
            fontWeight: FontWeight.bold,
          ),
          titleLarge: TextStyle(
            fontSize: 22,
            fontWeight: FontWeight.w600,
          ),
          bodyLarge: TextStyle(
            fontSize: 16,
            height: 1.5,
          ),
        ),
        cardTheme: CardTheme(
          elevation: 2,
          shape: RoundedRectangleBorder(
            borderRadius: BorderRadius.circular(12),
          ),
        ),
      ),
      home: const HomePage(),
    );
  }
}

// ✅ 好 - 使用主题值
class MyButton extends StatelessWidget {
  const MyButton({super.key, required this.label});
  
  final String label;
  
  @override
  Widget build(BuildContext context) {
    final theme = Theme.of(context);
    
    return ElevatedButton(
      style: ElevatedButton.styleFrom(
        backgroundColor: theme.colorScheme.primary,
        foregroundColor: theme.colorScheme.onPrimary,
      ),
      onPressed: () {},
      child: Text(label),
    );
  }
}

// ❌ 坏 - 硬编码颜色
class MyButton extends StatelessWidget {
  const MyButton({super.key, required this.label});
  
  final String label;
  
  @override
  Widget build(BuildContext context) {
    return ElevatedButton(
      style: ElevatedButton.styleFrom(
        backgroundColor: Colors.blue, // 硬编码!
        foregroundColor: Colors.white,
      ),
      onPressed: () {},
      child: Text(label),
    );
  }
}
```

### ThemeExtension 扩展主题

```dart
// ✅ 好 - 使用 ThemeExtension 添加自定义主题
@immutable
class CustomColors extends ThemeExtension<CustomColors> {
  const CustomColors({
    required this.success,
    required this.warning,
    required this.danger,
  });
  
  final Color success;
  final Color warning;
  final Color danger;
  
  @override
  CustomColors copyWith({
    Color? success,
    Color? warning,
    Color? danger,
  }) {
    return CustomColors(
      success: success ?? this.success,
      warning: warning ?? this.warning,
      danger: danger ?? this.danger,
    );
  }
  
  @override
  CustomColors lerp(CustomColors? other, double t) {
    if (other is! CustomColors) return this;
    return CustomColors(
      success: Color.lerp(success, other.success, t)!,
      warning: Color.lerp(warning, other.warning, t)!,
      danger: Color.lerp(danger, other.danger, t)!,
    );
  }
}

// 在主题中使用
ThemeData(
  extensions: [
    CustomColors(
      success: Colors.green,
      warning: Colors.orange,
      danger: Colors.red,
    ),
  ],
)

// 访问自定义主题
final customColors = Theme.of(context).extension<CustomColors>()!;
```

## 导航

### 使用现代路由

```dart
// ✅ 好 - 使用 go_router 或 auto_route
import 'package:go_router/go_router.dart';

final router = GoRouter(
  routes: [
    GoRoute(
      path: '/',
      builder: (context, state) => const HomePage(),
      routes: [
        GoRoute(
          path: 'profile/:userId',
          builder: (context, state) {
            final userId = state.pathParameters['userId']!;
            return ProfilePage(userId: userId);
          },
        ),
        GoRoute(
          path: 'settings',
          builder: (context, state) => const SettingsPage(),
        ),
      ],
    ),
  ],
);

// 导航
context.go('/profile/123');
context.push('/settings');

// ❌ 坏 - 过时的命名路由
MaterialApp(
  routes: {
    '/': (context) => const HomePage(),
    '/profile': (context) => const ProfilePage(),
  },
)
```

## 性能优化

### 避免不必要的重建

```dart
// ✅ 好 - 使用 const 构造函数
class MyWidget extends StatelessWidget {
  const MyWidget({super.key});
  
  @override
  Widget build(BuildContext context) {
    return const Column(
      children: [
        Text('Static Text'), // const Widget 不会重建
        Icon(Icons.home),
      ],
    );
  }
}

// ✅ 好 - 提取子 Widget
class ParentWidget extends StatefulWidget {
  const ParentWidget({super.key});
  
  @override
  State<ParentWidget> createState() => _ParentWidgetState();
}

class _ParentWidgetState extends State<ParentWidget> {
  int _counter = 0;
  
  @override
  Widget build(BuildContext context) {
    return Column(
      children: [
        Text('Counter: $_counter'),
        ElevatedButton(
          onPressed: () => setState(() => _counter++),
          child: const Text('Increment'),
        ),
        const ExpensiveWidget(), // 不会随 counter 变化而重建
      ],
    );
  }
}

class ExpensiveWidget extends StatelessWidget {
  const ExpensiveWidget({super.key});
  
  @override
  Widget build(BuildContext context) {
    // 昂贵的构建逻辑
    return const Text('Expensive Widget');
  }
}
```

### 列表性能

```dart
// ✅ 好 - 使用 ListView.builder 处理长列表
class ProductList extends StatelessWidget {
  const ProductList({super.key, required this.products});
  
  final List<Product> products;
  
  @override
  Widget build(BuildContext context) {
    return ListView.builder(
      itemCount: products.length,
      itemBuilder: (context, index) {
        final product = products[index];
        return ProductListItem(
          key: ValueKey(product.id), // 使用唯一 key
          product: product,
        );
      },
    );
  }
}

// ✅ 好 - 使用 ListView.separated 添加分隔符
ListView.separated(
  itemCount: items.length,
  itemBuilder: (context, index) => ListTile(title: Text(items[index])),
  separatorBuilder: (context, index) => const Divider(),
)

// ❌ 坏 - 一次性构建所有项目
ListView(
  children: products.map((p) => ProductListItem(product: p)).toList(),
)
```

### 图片优化

```dart
// ✅ 好 - 使用 cached_network_image
import 'package:cached_network_image/cached_network_image.dart';

class ProductImage extends StatelessWidget {
  const ProductImage({super.key, required this.imageUrl});
  
  final String imageUrl;
  
  @override
  Widget build(BuildContext context) {
    return CachedNetworkImage(
      imageUrl: imageUrl,
      placeholder: (context, url) => 
        const Center(child: CircularProgressIndicator()),
      errorWidget: (context, url, error) => 
        const Icon(Icons.error),
      fit: BoxFit.cover,
    );
  }
}

// ✅ 好 - 优化图片加载
Image.network(
  imageUrl,
  cacheWidth: 400, // 限制缓存图片宽度
  cacheHeight: 400,
  fit: BoxFit.cover,
)
```

## 测试

### Widget 测试

```dart
// ✅ 好 - 编写 Widget 测试
void main() {
  testWidgets('Counter increments', (tester) async {
    // Arrange
    await tester.pumpWidget(const MaterialApp(home: Counter()));
    
    // Assert initial state
    expect(find.text('0'), findsOneWidget);
    expect(find.text('1'), findsNothing);
    
    // Act
    await tester.tap(find.byIcon(Icons.add));
    await tester.pump();
    
    // Assert
    expect(find.text('0'), findsNothing);
    expect(find.text('1'), findsOneWidget);
  });
  
  testWidgets('Product card displays correctly', (tester) async {
    // Arrange
    const product = Product(
      id: '1',
      name: 'Test Product',
      price: 99.99,
    );
    
    await tester.pumpWidget(
      const MaterialApp(
        home: Scaffold(
          body: ProductCard(product: product),
        ),
      ),
    );
    
    // Assert
    expect(find.text('Test Product'), findsOneWidget);
    expect(find.text('\$99.99'), findsOneWidget);
  });
}
```

### 集成测试

```dart
// ✅ 好 - 编写集成测试
import 'package:integration_test/integration_test.dart';

void main() {
  IntegrationTestWidgetsFlutterBinding.ensureInitialized();
  
  testWidgets('Complete purchase flow', (tester) async {
    // 启动应用
    await tester.pumpWidget(const MyApp());
    await tester.pumpAndSettle();
    
    // 浏览商品
    expect(find.text('Products'), findsOneWidget);
    await tester.tap(find.text('Add to Cart').first);
    await tester.pumpAndSettle();
    
    // 查看购物车
    await tester.tap(find.byIcon(Icons.shopping_cart));
    await tester.pumpAndSettle();
    
    // 结账
    await tester.tap(find.text('Checkout'));
    await tester.pumpAndSettle();
    
    // 验证
    expect(find.text('Order Confirmed'), findsOneWidget);
  });
}
```

## 国际化 (i18n)

### 使用 intl 包

```dart
// ✅ 好 - 正确的国际化实现
import 'package:flutter_localizations/flutter_localizations.dart';
import 'package:intl/intl.dart';

class AppLocalizations {
  final Locale locale;
  
  AppLocalizations(this.locale);
  
  static AppLocalizations of(BuildContext context) {
    return Localizations.of<AppLocalizations>(context, AppLocalizations)!;
  }
  
  static const LocalizationsDelegate<AppLocalizations> delegate = 
    _AppLocalizationsDelegate();
  
  String get title => Intl.message(
    'My App',
    name: 'title',
    locale: locale.toString(),
  );
  
  String itemCount(int count) => Intl.plural(
    count,
    zero: 'No items',
    one: '1 item',
    other: '$count items',
    name: 'itemCount',
    args: [count],
    locale: locale.toString(),
  );
}

// 在 MaterialApp 中配置
MaterialApp(
  localizationsDelegates: const [
    AppLocalizations.delegate,
    GlobalMaterialLocalizations.delegate,
    GlobalWidgetsLocalizations.delegate,
  ],
  supportedLocales: const [
    Locale('en', ''),
    Locale('zh', ''),
  ],
  home: const HomePage(),
)

// ❌ 坏 - 硬编码文本
Text('Hello World') // 应该使用国际化
```

## 无障碍访问 (Accessibility)

```dart
// ✅ 好 - 提供语义信息
Semantics(
  label: '商品图片',
  child: Image.network(product.imageUrl),
)

// ✅ 好 - 确保足够的对比度
Text(
  'Important Text',
  style: TextStyle(
    color: Colors.black, // 与白色背景对比度 21:1
    fontSize: 16,
  ),
)

// ✅ 好 - 合适的触摸目标大小(至少 48x48)
SizedBox(
  width: 48,
  height: 48,
  child: IconButton(
    icon: const Icon(Icons.add),
    onPressed: () {},
  ),
)
```

## 错误处理

```dart
// ✅ 好 - 使用 ErrorWidget 自定义错误显示
void main() {
  ErrorWidget.builder = (FlutterErrorDetails details) {
    return Material(
      child: Container(
        color: Colors.red[100],
        child: Center(
          child: Text(
            'Error: ${details.exception}',
            style: const TextStyle(color: Colors.red),
          ),
        ),
      ),
    );
  };
  
  runApp(const MyApp());
}

// ✅ 好 - 使用 FutureBuilder 处理异步
class UserProfile extends StatelessWidget {
  const UserProfile({super.key, required this.userId});
  
  final String userId;
  
  @override
  Widget build(BuildContext context) {
    return FutureBuilder<User>(
      future: fetchUser(userId),
      builder: (context, snapshot) {
        if (snapshot.connectionState == ConnectionState.waiting) {
          return const Center(child: CircularProgressIndicator());
        }
        
        if (snapshot.hasError) {
          return Center(
            child: Text('Error: ${snapshot.error}'),
          );
        }
        
        if (!snapshot.hasData) {
          return const Center(child: Text('User not found'));
        }
        
        final user = snapshot.data!;
        return UserDetails(user: user);
      },
    );
  }
}
```

## 最佳实践总结

1. **优先使用 const** - 提升性能,减少重建
2. **组合小 Widget** - 保持代码可维护性
3. **合理使用状态管理** - 区分局部和全局状态
4. **响应式布局** - 适配不同屏幕尺寸
5. **使用主题系统** - 避免硬编码样式
6. **性能优化** - 使用 builder、const、key
7. **编写测试** - Widget 测试和集成测试
8. **国际化支持** - 使用 i18n 工具
9. **无障碍访问** - 添加语义信息
10. **错误处理** - 优雅处理异步和错误状态

---

**参考资源:**
- [Flutter Documentation](https://flutter.dev/docs)
- [Flutter Style Guide](https://github.com/flutter/flutter/blob/main/docs/contributing/Style-guide-for-Flutter-repo.md)
- [Effective Dart](https://dart.dev/effective-dart)
- [Material Design 3](https://m3.material.io/)
- [Flutter Performance Best Practices](https://flutter.dev/docs/perf/best-practices)
