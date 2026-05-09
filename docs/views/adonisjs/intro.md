---
title: 使用 AdonisJS 创建第一个项目
description: 通过 AdonisJS CLI 创建一个新的 AdonisJS 项目
date: 2026-05-09 20:14:01
categories:
  - AdonisJS
---

在本章中，我们将使用 AdonisJS CLI 创建一个新的 AdonisJS 项目。

## 安装 AdonisJS CLI

要安装 AdonisJS CLI，请运行以下命令：

```bash
npm install -g @adonisjs/cli
```

或者直接

```bash
npm init adonisjs@latest
Need to install the following packages:
create-adonisjs@2.4.0
Ok to proceed? (y) y

> npx
> "create-adonisjs"


     _       _             _         _ ____
    / \   __| | ___  _ __ (_)___    | / ___|
   / _ \ / _` |/ _ \| '_ \| / __|_  | \___ \
  / ___ \ (_| | (_) | | | | \__ \ |_| |___) |
 /_/   \_\__,_|\___/|_| |_|_|___/\___/|____/


❯ Where should we create your new project · document
❯ Which starter kit would you like to use · Web Starter Kit
❯ Which authentication guard you want to use · access_tokens
❯ Which database driver you want to use · mysql
❯ Download starter kit (5.42 s)
  Downloaded "github:adonisjs/web-starter-kit"
❯ Install packages (20 s)
  Packages installed using "npm"
❯ Prepare application (331 ms)
  Application ready
❯ Configure Lucid (3.49 s)
  Lucid configured to use "mysql" database
❯ Configure Auth (1.14 s)
  Auth configured to use "access_tokens" guard

╭──────────────────────────────────────────────────────────────────╮
│    Your AdonisJS project has been created successfully!          │
│──────────────────────────────────────────────────────────────────│
│                                                                  │
│    ❯ cd document                                                 │
│    ❯ npm run dev                                                 │
│    ❯ Open http://localhost:3333                                  │
│    ❯                                                             │
│    ❯ Have any questions?                                         │
│    ❯ Join our Discord server - https://discord.gg/vDcEjq6        │
│                                                                  │
╰──────────────────────────────────────────────────────────────────╯
```

或者

```bash
# Create a project and get prompted for all options
npm init adonisjs@latest hello-world

# Create a project with MySQL
npm init adonisjs@latest hello-world -- --db=mysql

# Create a project with PostgreSQL and API starter kit
npm init adonisjs@latest hello-world -- --db=postgres --kit=api

# Create a project with API starter kit and access tokens guard
npm init adonisjs@latest hello-world -- --kit=api --auth-guard=access_tokens
```

## Inertia

以前

```txt
routers -> component -> 页面
axios -> 后台 -> 渲染到页面
```

现在可以简化上面2 个的第一个的流程,都用后端处理就行.

## 创建 migration 迁移文件

1. 批量生成测试数据
2. 批量生成数据表
3. 表版本控制
4. 操作数据使用`model`模型

查看命令操作

```bash
node ace

Options:
  --ansi|--no-ansi    Force enable or disable colorful output
  --help              View help for a given command

Available commands:
  add                 Install and configure a package
  build               Build application for production by compiling frontend assets and TypeScript source to JavaScript
  configure           Configure a package after it has been installed
  eject               Eject scaffolding stubs to your application root
  list                View list of available commands
  repl                Start a new REPL session
  serve               Start the development HTTP server along with the file watcher to perform restarts on file change
  test                Run tests along with the file watcher to re-run tests on file change

db
  db:seed             Execute database seeders
  db:truncate         Truncate all tables in database
  db:wipe             Drop all tables, views and types in database

env
  env:add             Add a new environment variable

generate
  generate:key        Generate a cryptographically secure random application key

inspect
  inspect:rcfile      Inspect the RC file with its default values

lang
  lang:publish        Eject localization templates to resources/lang/en directory

list
  list:routes         List application routes. This command will boot the application in the console environment

make
  make:command        Create a new ace command class
  make:controller     Create a new HTTP controller class
  make:event          Create a new event class
  make:exception      Create a new custom exception class
  make:factory        Make a new factory
  make:listener       Create a new event listener class
  make:middleware     Create a new middleware class for HTTP requests
  make:migration      Make a new migration file
  make:model          Make a new Lucid model
  make:preload        Create a new preload file inside the start directory
  make:provider       Create a new service provider class
  make:seeder         Make a new Seeder file
  make:service        Create a new service class
  make:test           Create a new Japa test file
  make:validator      Create a new file to define VineJS validators
  make:view           Create a new Edge.js template file

migration
  migration:fresh     Drop all tables and re-migrate the database
  migration:refresh   Rollback and migrate database
  migration:reset     Rollback all migrations
  migration:rollback  Rollback migrations to a specific batch number
  migration:run       Migrate database by running pending migrations
  migration:status    View migrations status
```

> 创建数据库迁移文件

```bash
node ace make:migration --help

Description:
  Make a new migration file

Usage:
  node ace make:migration [options] [--] <name>

Arguments:
  name                       Name of the migration file

Options:
  --connection[=CONNECTION]  Select database connection for which to create the migration
  --folder[=FOLDER]          Select migration directory (if multiple sources are configured)
  --create                   Create a new default (Default action)
  --alter                    Alter an existing table
```

### 创建分类栏目迁移文件

```bash
node ace make:migration category
DONE:    create database/migrations/1771863160778_create_categories_table.ts
```

### 使用模型一次性创建所有的

```bash
node ace make:model --help

Description:
  Make a new Lucid model

Usage:
  node ace make:model [options] [--] <name>

Arguments:
  name              Name of the model class

Options:
  -m, --migration   Generate the migration for the model
  -c, --controller  Generate the controller for the model
  -f, --factory     Generate a factory for the model
node ace make:model category -mcf
DONE:    create app/models/category.ts
DONE:    create database/migrations/1771863312559_create_categories_table.ts
DONE:    create app/controllers/categories_controller.ts
DONE:    create database/factories/category_factory.ts
```

### 执行迁移创建表

```bash
node ace migration:run
[ info ] Upgrading migrations version from "1" to "2"
❯ migrated database/migrations/1771862200498_create_users_table
❯ migrated database/migrations/1771862200499_create_access_tokens_table
❯ migrated database/migrations/1771863312559_create_categories_table

Migrated in 199 ms
```

### 表创建

```typescript
import { BaseSchema } from "@adonisjs/lucid/schema";

export default class extends BaseSchema {
  protected tableName = "categories";

  async up() {
    this.schema.createTable(this.tableName, (table) => {
      table.increments("id");

      // 栏目的名称 不允许为空
      table.string("title", 100).notNullable();
      // 父子级的关系
      table.integer("parent_id").nullable().defaultTo(0);

      table.timestamp("created_at");
      table.timestamp("updated_at");
    });
  }

  async down() {
    this.schema.dropTable(this.tableName);
  }
}
```

### 使用 factory 创建数据

```typescript title="database/factories/category_factory.ts"
import factory from "@adonisjs/lucid/factories";
import Category from "#models/category";

export const CategoryFactory = factory
  .define(Category, async ({ faker }) => {
    return {
      title: faker.lorem.sentence(),
    };
  })
  .build();
```

也可以使用`node ace repl`进入交互式命令行处理

### 使用 seeder 来批量创建数据

```bash
node ace make:seeder category
DONE:    create database/seeders/category_seeder.ts
```

```typescript title="database/seeders/category_seeder.ts"
import { CategoryFactory } from "#database/factories/category_factory";
import { BaseSeeder } from "@adonisjs/lucid/seeders";

export default class extends BaseSeeder {
  async run() {
    // Write your database queries inside the run method
    // 创建多条数据
    await CategoryFactory.createMany(3);
  }
}
```

也可以在里面查询某个数据修改某个数据

```typescript title="database/seeders/category_seeder.ts"
import { CategoryFactory } from "#database/factories/category_factory";
import Category from "#models/category";
import { BaseSeeder } from "@adonisjs/lucid/seeders";

export default class extends BaseSeeder {
  async run() {
    // Write your database queries inside the run method
    // 创建多条数据
    await CategoryFactory.createMany(3);

    const category = await Category.findOrFail(1);
    category.title = "新的分类名称";
    await category.save();
    console.log(category);
  }
}
```

删除所有表并创建所有表然后填充数据

```bash
node ace migration:fresh --seed
```

## 修改配置文件调整时区

```txt title=".env"
# 将 UTC 换成 PRC 或者 Asia/Shanghai
TZ=PRC
```
