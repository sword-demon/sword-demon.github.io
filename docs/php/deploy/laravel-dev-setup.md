---
title: macOS 下 PHP 和 Laravel 开发环境配置
date: 2026-10-19
tags:
  - PHP
  - Laravel
  - macOS
  - 开发环境
categories:
  - PHP
---

# macOS 下 PHP 和 Laravel 开发环境配置

适用于 macOS Darwin 27.0.0 及更高版本的 PHP + Laravel 开发环境快速配置方案。

## 环境要求

- macOS 10.15+
- Homebrew 已安装
- 命令行工具基础

## PHP 安装

### 使用 Homebrew 安装 PHP 8.3

```bash
# 安装 PHP 8.3(Laravel 11 推荐)
brew install php@8.3

# 添加到 PATH
echo 'export PATH="/opt/homebrew/opt/php@8.3/bin:$PATH"' >> ~/.zshrc
echo 'export PATH="/opt/homebrew/opt/php@8.3/sbin:$PATH"' >> ~/.zshrc
source ~/.zshrc

# 验证安装
php -v
```

### 必要扩展

Laravel 需要的扩展 Homebrew 版本已包含:
- OpenSSL
- PDO
- Mbstring
- Tokenizer
- XML
- Ctype
- JSON
- BCMath

验证扩展:

```bash
php -m | grep -E 'pdo|mbstring|xml|ctype|json|bcmath'
```

## Composer 安装

```bash
# 安装 Composer
brew install composer

# 验证
composer --version

# 配置国内镜像(可选, 加速下载)
composer config -g repo.packagist composer https://mirrors.aliyun.com/composer/
```

## Laravel 安装

### 全局安装 Laravel Installer

```bash
composer global require laravel/installer

# 添加 Composer 全局 bin 到 PATH
echo 'export PATH="$HOME/.composer/vendor/bin:$PATH"' >> ~/.zshrc
source ~/.zshrc

# 验证
laravel --version
```

### 创建新项目

```bash
# 方式 1: 使用 Laravel Installer
laravel new project-name

# 方式 2: 使用 Composer(推荐, 保证最新版本)
composer create-project laravel/laravel project-name

cd project-name
```

## 数据库配置

### MySQL(推荐用于生产环境)

```bash
brew install mysql
brew services start mysql

# 安全配置
mysql_secure_installation
```

### SQLite(开发快速启动)

Laravel 默认使用 SQLite, 无需额外安装:

```bash
# 创建数据库文件
touch database/database.sqlite
```

`.env` 配置:

```ini
DB_CONNECTION=sqlite
# DB_DATABASE=/absolute/path/to/database.sqlite
```

## 开发服务器

### Artisan 内置服务器(开发环境)

```bash
php artisan serve
# 访问 http://localhost:8000

# 指定端口
php artisan serve --port=8080

# 指定 host
php artisan serve --host=0.0.0.0 --port=8000
```

### Valet(推荐 macOS 本地开发)

```bash
composer global require laravel/valet
valet install

# 在项目目录
cd ~/Sites/my-laravel-app
valet link app-name
# 访问 http://app-name.test

# 配置目录自动服务
cd ~/Sites
valet park
# 目录下所有项目自动通过 {folder-name}.test 访问
```

## 开发工具配置

### VS Code 扩展

必装:
- **PHP Intelephense** (代码智能提示)
- **Laravel Extra Intellisense** (Laravel 特定智能提示)
- **Laravel Blade Snippets** (Blade 模板支持)

可选:
- **PHP Debug** (Xdebug 调试)
- **Laravel Goto View** (快速跳转视图)

### PHPStorm 配置

1. Laravel 插件: Settings → Plugins → Laravel
2. 启用 Laravel: Settings → Languages & Frameworks → PHP → Laravel → Enable
3. 配置 PHP 解释器: Settings → PHP → CLI Interpreter → `/opt/homebrew/bin/php`

## 常用配置调整

### php.ini 位置

```bash
# 查看配置文件路径
php --ini

# 编辑配置
vim /opt/homebrew/etc/php/8.3/php.ini
```

### 开发环境推荐配置

```ini
; 显示所有错误
display_errors = On
error_reporting = E_ALL

; 内存限制
memory_limit = 512M

; 上传限制
upload_max_filesize = 64M
post_max_size = 64M

; 执行时间
max_execution_time = 300
```

### Laravel .env 开发配置

```ini
APP_NAME=MyApp
APP_ENV=local
APP_DEBUG=true
APP_URL=http://localhost:8000

LOG_CHANNEL=stack
LOG_LEVEL=debug

DB_CONNECTION=sqlite
```

## 常见开发任务

### 数据库迁移

```bash
# 运行迁移
php artisan migrate

# 回滚
php artisan migrate:rollback

# 重置并重新运行
php artisan migrate:fresh

# 填充测试数据
php artisan db:seed
```

### 缓存管理

```bash
# 清除缓存
php artisan cache:clear
php artisan config:clear
php artisan route:clear
php artisan view:clear

# 优化(生产环境)
php artisan config:cache
php artisan route:cache
php artisan view:cache
```

### 队列处理(开发环境)

```bash
# 启动队列 worker
php artisan queue:work

# 后台运行
brew services start redis  # 如使用 Redis 作为队列驱动
php artisan queue:work --daemon
```

## 调试配置

### Laravel Telescope(开发调试面板)

```bash
composer require laravel/telescope --dev
php artisan telescope:install
php artisan migrate

# 访问 http://localhost:8000/telescope
```

### Xdebug 安装(可选)

```bash
pecl install xdebug

# 添加到 php.ini
echo "zend_extension=\"$(pecl config-get ext_dir)/xdebug.so\"" >> /opt/homebrew/etc/php/8.3/php.ini

# 配置 Xdebug 3
cat >> /opt/homebrew/etc/php/8.3/php.ini <<EOF
xdebug.mode=debug
xdebug.start_with_request=yes
xdebug.client_port=9003
EOF

# 重启 PHP-FPM
brew services restart php@8.3
```

## 性能优化

### OPcache 启用(生产环境)

在 `php.ini` 中:

```ini
opcache.enable=1
opcache.memory_consumption=256
opcache.interned_strings_buffer=16
opcache.max_accelerated_files=10000
opcache.revalidate_freq=2
```

### Laravel 优化

```bash
# 生产环境部署优化
composer install --optimize-autoloader --no-dev
php artisan config:cache
php artisan route:cache
php artisan view:cache
```

## 故障排查

### 权限问题

```bash
# 修复 storage 和 cache 权限
chmod -R 775 storage bootstrap/cache
chown -R $(whoami):_www storage bootstrap/cache
```

### Composer 内存不足

```bash
# 临时增加内存限制
php -d memory_limit=-1 /opt/homebrew/bin/composer install
```

### Laravel 安装失败

```bash
# 清除 Composer 缓存
composer clear-cache

# 降级到特定版本
composer create-project laravel/laravel:^10.0 project-name
```

## 开发环境方案对比

| 方案 | 启动速度 | 版本切换 | 数据库/Redis | 适用场景 | 国内体验 |
|------|---------|---------|-------------|---------|---------|
| **Laravel Herd** | ⚡️ 秒开 | GUI 点击 | 一键启动 | macOS 本地开发 | ⭐⭐⭐⭐⭐ |
| **phpbrew** | ⚡️ 原生 | 命令行 | 需自行配置 | 精细控制 | ⭐⭐⭐⭐ |
| **Laravel Sail** | 🐌 首次慢 | Docker 切换 | 内置完整栈 | 团队统一环境 | ⭐⭐ (镜像慢) |
| **Homebrew** | ⚡️ 原生 | 繁琐 | 需自行配置 | 简单场景 | ⭐⭐⭐ |

---

## 方案 A: Laravel Herd (推荐 🔥)

**macOS 上的最佳选择**，由 Laravel 官方团队开发，零配置秒开项目。

### 安装

```bash
# 下载安装器
# 访问 https://herd.laravel.com 下载 .dmg
# 或使用 Homebrew
brew install --cask herd
```

### 核心功能

```bash
# 🎯 安装后自动完成的事：
# ✅ PHP 8.1/8.2/8.3 多版本(GUI 切换)
# ✅ Nginx 自动配置
# ✅ MySQL/PostgreSQL 一键启动
# ✅ Redis/Meilisearch 内置
# ✅ Composer/Node.js/npm 全局命令
# ✅ 自动 HTTPS 证书
# ✅ 邮件测试工具(Mailpit)

# 添加项目到 Herd(自动识别 ~/Sites 目录)
# 或手动添加: Herd 菜单栏 → Add Site → 选择项目文件夹

# 立即访问项目
open http://my-project.test

# 切换 PHP 版本: Herd 菜单栏 → PHP Version → 8.3
# 或按项目独立配置: 右键项目 → PHP Version
```

### 内置服务管理(GUI 操作)

| 服务 | 启动方式 | 访问地址 |
|------|---------|---------|
| **MySQL** | Herd → Services → MySQL | `localhost:3306` (用户: `root`, 无密码) |
| **PostgreSQL** | Herd → Services → PostgreSQL | `localhost:5432` |
| **Redis** | Herd → Services → Redis | `localhost:6379` |
| **Mailpit** | Herd → Services → Mail | http://localhost:8025 |
| **Meilisearch** | Herd → Services → Meilisearch | http://localhost:7700 |

### 数据库配置(.env)

```env
# MySQL(Herd 默认)
DB_CONNECTION=mysql
DB_HOST=127.0.0.1
DB_PORT=3306
DB_DATABASE=your_database
DB_USERNAME=root
DB_PASSWORD=

# PostgreSQL
DB_CONNECTION=pgsql
DB_HOST=127.0.0.1
DB_PORT=5432
DB_DATABASE=your_database
DB_USERNAME=herd
DB_PASSWORD=

# Redis
REDIS_HOST=127.0.0.1
REDIS_PORT=6379
```

### 创建数据库

```bash
# MySQL
mysql -u root
CREATE DATABASE my_laravel_db;
exit;

# PostgreSQL
psql -U herd
CREATE DATABASE my_laravel_db;
\q
```

### 优点

- ✅ **零配置**: 安装即用，3 分钟启动首个项目
- ✅ **性能极佳**: 原生 PHP，无 Docker 虚拟化开销
- ✅ **版本切换**: GUI 点击切换，支持项目独立版本
- ✅ **自动 HTTPS**: 无需手动配置证书
- ✅ **国内友好**: 无需下载 Docker 镜像
- ✅ **资源占用低**: 空闲时几乎不占内存

### 缺点

- ❌ 仅支持 macOS
- ❌ 不适合需要自定义系统依赖的项目
- ❌ 团队环境可能不一致(本地配置 vs 生产环境)

---

## 方案 B: phpbrew (跨平台,类似 nvm)

```bash
# 安装 phpbrew
curl -L -O https://github.com/phpbrew/phpbrew/releases/latest/download/phpbrew.phar
chmod +x phpbrew.phar
sudo mv phpbrew.phar /usr/local/bin/phpbrew

# 初始化
phpbrew init
echo 'source ~/.phpbrew/bashrc' >> ~/.zshrc
source ~/.zshrc

# 列出可安装版本
phpbrew known

# 安装 PHP(自动编译并包含常用扩展)
phpbrew install 8.3 +default +mysql +pdo +openssl +curl +zip +mbstring
phpbrew install 8.2 +default +mysql +pdo +openssl +curl +zip +mbstring

# 切换版本(一条命令!)
phpbrew switch 8.3
phpbrew switch 8.2

# 查看已安装版本
phpbrew list

# 安装扩展到当前版本
phpbrew ext install redis
phpbrew ext install imagick

# 升级 PHP 版本
phpbrew update      # 更新版本列表
phpbrew install 8.4 +default +mysql  # 安装新版本
phpbrew switch 8.4  # 切换到新版本
```

**优点**:
- ✅ 一条命令切换版本(`switch`)
- ✅ 自动编译优化配置
- ✅ 独立管理每个版本的扩展
- ✅ 支持多版本并存,按项目切换

### 方案 B: asdf (跨语言版本管理)

如果你还用 Node.js/Python/Ruby,推荐用 asdf 统一管理:

```bash
# 安装 asdf
brew install asdf
echo '. $(brew --prefix asdf)/libexec/asdf.sh' >> ~/.zshrc
source ~/.zshrc

# 安装 PHP 插件
asdf plugin add php

# 列出可安装版本
asdf list all php

# 安装多个版本
asdf install php 8.3.0
asdf install php 8.2.0

# 全局默认版本
asdf global php 8.3.0

# 项目级版本(在项目目录创建 .tool-versions)
cd ~/my-laravel-project
asdf local php 8.2.0

# 查看已安装版本
asdf list php

# 卸载旧版本
asdf uninstall php 8.1.0
```

**优点**:
- ✅ 统一管理多种语言版本(PHP/Node/Python/Ruby)
- ✅ 支持项目级版本锁定(`.tool-versions`)
- ✅ 命令简单易记
- ✅ 与团队共享版本配置(提交 `.tool-versions` 到 Git)

### 方案 C: Homebrew (原方案,适合简单场景)

```bash
# 安装多个版本
brew install php@8.2 php@8.3

# 切换版本
brew unlink php@8.3
brew link php@8.2 --force --overwrite

# 验证
php -v
```

**缺点**: 命令复杂,容易忘记 `unlink/link` 组合。

### Laravel 版本选择

- **Laravel 11**: PHP >= 8.2, 最新特性
- **Laravel 10**: PHP >= 8.1, 长期支持(LTS)
- **Laravel 9**: PHP >= 8.0, 已终止支持

### 推荐工作流

```bash
# 项目开始时选择 PHP 版本
cd ~/my-laravel-project
phpbrew switch 8.3  # 或 asdf local php 8.3.0

# 需要测试兼容性?快速切换!
phpbrew switch 8.2
composer install
php artisan test

# 升级 PHP 到新版本
phpbrew install 8.4 +default
phpbrew switch 8.4
composer update  # 更新依赖
php artisan test  # 验证兼容性
```

## 参考资源

- [Laravel 官方文档](https://laravel.com/docs)
- [PHP 官方文档](https://www.php.net/docs.php)
- [Homebrew PHP 配置](https://github.com/Homebrew/homebrew-php)
- [Laravel Valet 文档](https://laravel.com/docs/valet)

## 下一步

- 学习 Laravel 路由和控制器
- 掌握 Eloquent ORM 数据库操作
- 了解 Blade 模板引擎
- 配置 Laravel Sanctum/Passport 实现 API 认证
