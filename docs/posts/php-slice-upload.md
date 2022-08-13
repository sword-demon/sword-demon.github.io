---
title: PHP分片上传大文件
date: 2022-08-13
category: Note
tag:
    - slice
    - upload
---

## 分片上传大文件

```html
<div class="form-group" id="videoUpload" style="display: none;">
    <label for="article" class="col-sm-2 control-label">上传视频文件:</label>
    <div class="col-md-3">
        <label class="btn btn-primary" id="uploadVideoFunc" for="uploadVideo">
            <input
                type="file"
                id="uploadVideo"
                class="file"
                multiple="multiple"
                style="display:none"
                onchange="$('#upload-file-info').html(this.files[0].name)"
                accept=".mp4"
            />
            请选择视频文件
        </label>
        <span class="label label-info" id="upload-file-info"></span>
        <input type="hidden" name="video" />
    </div>
    <div class="col-sm-4">
        <button id="btnUploadVideo" type="button" class="btn btn-success">上传</button>
        <span id="output" style="font-size: 12px">上传进度</span>
    </div>
</div>
```

```javascript
function upload() {
    var file = $('#uploadVideo')[0].files[0]
    if (file == undefined) {
        $.fn.winktips('请选择文件')
        return false
    }
    $(this).addClass('disabled')

    var name = file.name
    var size = file.size
    var succeed = 0
    var shardSize = 1024 * 1024
    var shardCount = Math.ceil(size / shardSize)
    for (var i = 0; i < shardCount; i++) {
        // 计算每一篇数据的起始和结束位置
        var start = i * shardSize
        var end = Math.min(size, start + shardSize)
        // 构造一个表单
        var form = new FormData()
        form.append('data', file.slice(start, end))
        form.append('name', name)
        form.append('total', shardCount)
        form.append('index', i + 1)
        $.ajax({
            url: "<?php echo site_url('Banner/upload?act=upload'); ?>",
            type: 'POST',
            data: form,
            async: true,
            processData: false,
            contentType: false,
            success: function (res) {
                var returnData = $.parseJSON(res)
                if (returnData.errno == 200) {
                    ++succeed
                    $('#output').text(succeed + ' / ' + shardCount)
                    if (succeed == shardCount) {
                        // 合并
                        $.ajax({
                            url: "<?php echo site_url('Banner/upload?act=join'); ?>",
                            type: 'POST',
                            data: { total: shardCount },
                            success: function (res) {
                                var returnData = $.parseJSON(res)
                                if (returnData.errno == 200) {
                                    $.fn.winktips('上传成功')
                                    setTimeout(function () {
                                        $('#videoFile').removeClass('disabled')
                                        $('[name=video]').val(returnData.path)
                                    }, 1000)
                                } else {
                                    $.fn.winktips('合并失败')
                                    setTimeout(function () {
                                        location.reload()
                                    }, 2000)
                                }
                            },
                        })
                    }
                } else {
                    $.fn.winktips('上传失败')
                    setTimeout(function () {
                        location.reload()
                    }, 2000)
                }
            },
        })
    }
}

$('#btnUploadVideo').click(function () {
    if ($(this).hasClass('disabled')) {
        return false
    } else {
        console.log('触发上传')
        upload()
    }
})
```

```php
public function upload()
{
    $act = isset($_GET['act']) && !empty($_GET['act']) ? $this->input->get('act', true) : '';
    if ('' == $act) {
        echo json_encode([
            'errno' => 1001,
            'message' => '方法不存在',
        ]);
        die;
    }

    if ($act == "upload") {
        $index = $this->input->post('index', true);
        $filename = FCPATH."upload/videos/$index.mp4";
        $result = move_uploaded_file($_FILES['data']['tmp_name'], $filename);
        if ($result) {
            echo json_encode(array('errno' => 200, 'message' => 'ok'));
            die;
        } else {
            echo json_encode(array('errno' => 1001, 'message' => '上传失败'));
            die;
        }
    }

    if ($act == "join") {
        // 合并数据
        $total = (int) $this->input->post('total', true);
        $last_name = generate_random_str(5);
        $index_arr = [];
        for ($i = 1; $i <= $total; $i++) {
            $index_arr[] = $i;
            file_put_contents(FCPATH."/upload/videos/".$last_name.".mp4",
                              file_get_contents(FCPATH."upload/videos/$i.mp4"), FILE_APPEND);
        }
        while (!empty($index_arr)) {
            $id = array_pop($index_arr);
            @unlink(FCPATH."upload/videos/$id.mp4");
        }
        echo json_encode(array('errno' => 200, 'message' => '上传成功', 'path' => "upload/videos/$last_name.mp4"));
        die;
    }
}
```
