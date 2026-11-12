---
title: laravel的database
date: 2026-10-24 19:33:10
---

## 创建一个新的模型以及这个模型所有的资源文件

```bash
php artisan make:model Lesson -a
```

```bash
php artisan make:model Lesson -a

   INFO  Model [app/Models/Lesson.php] created successfully.  

   INFO  Factory [database/factories/LessonFactory.php] created successfully.  

   INFO  Migration [database/migrations/2026_10_24_112317_create_lessons_table.php] created successfully.  

   INFO  Seeder [database/seeders/LessonSeeder.php] created successfully.  

   INFO  Request [app/Http/Requests/StoreLessonRequest.php] created successfully.  

   INFO  Request [app/Http/Requests/UpdateLessonRequest.php] created successfully.  

   INFO  Controller [app/Http/Controllers/LessonController.php] created successfully.  

   INFO  Policy [app/Policies/LessonPolicy.php] created successfully.  
```

填充对应的`migration`

```php
public function up(): void
{
    Schema::create('lessons', function (Blueprint $table) {
        $table->id();
        $table->string('title')->comment('标题');
        $table->string('preview')->comment('预览图片');
        $table->text('description')->comment('课程介绍');
        $table->decimal('price', 8, 2)->default(0)->comment('价格');
        $table->unsignedSmallInteger('order')->default(0)->comment('排序');
        $table->unsignedInteger('video_num')->default(0)->comment('视频数量');
        $table->string('download_address')->nullable()->comment('下载地址');
        $table->char('type', 20)->default('project')->comment('课程类型 system|project');
        $table->timestamps();
    });
}
```

使用`factory`进行造数据，使用对应的`fake()`方法来造数据

```php
class LessonFactory extends Factory
{
    /**
     * Define the model's default state.
     *
     * @return array<string, mixed>
     */
    public function definition(): array
    {
        return [
            'title' => fake()->sentence(),
            'preview' => fake()->imageUrl(),
            'description' => fake()->sentence(),
            'price' => fake()->numberBetween(100, 999),
        ];
    }
}
```

最终还是需要对应的`seeder`来执行，外加一个命令

```bash
php artisan migrate:fresh --seed # 注意这个命令会清除所有的表的数据然后进行填充，慎用，开发阶段无所谓
```

