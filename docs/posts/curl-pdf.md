---
title: CURL远程下载PDF
date: 2022-07-18 23:02:10
category: Note
tag:
    - curl
---

## 远程调用携带 Token 下载 PDF

```php
if (!function_exists('downFile')) {
    /**
     * 下载顺丰云打印面单远程PDF
     * @param $url string 远端文件路径
     * @param $savePath string 保存本地文件路径
     * @param $token string token
     * @return string
     */
    function downFile($url, $savePath, $token)
    {
        $ch = curl_init();
        curl_setopt($ch, CURLOPT_SSL_VERIFYPEER, false);//关闭对等证书
        curl_setopt($ch, CURLOPT_URL, $url);//请求地址
        curl_setopt($ch, CURLOPT_RETURNTRANSFER, 1);
        curl_setopt($ch, CURLOPT_HTTPHEADER, array(
            'X-Auth-token: '.$token
        ));
        curl_setopt($ch, CURLOPT_HEADER, true);//返回头部信息
        //需要response header
        curl_setopt($ch, CURLOPT_NOBODY, false);//需要response body
        $response = curl_exec($ch);
        //分离header与body
        $header = '';
        $body = '';
        if (curl_getinfo($ch, CURLINFO_HTTP_CODE) == '200') {
            $headerSize = curl_getinfo($ch, CURLINFO_HEADER_SIZE); //头信息size
            $header = substr($response, 0, $headerSize);
            $body = substr($response, $headerSize);
        }
        curl_close($ch);
        //文件名

        if ('' != $body) {
            $file = date('YmdHis').'.pdf';
            $fullName = rtrim($savePath, '/').'/'.$file;
            //创建目录并设置权限
            $basePath = dirname($fullName);
            if (!file_exists($basePath)) {
                @mkdir($basePath, 0777, true);
                @chmod($basePath, 0777);
            }
            if (file_put_contents($fullName, $body)) {
                return $file;
            }
        }

        return false;
    }
}
```

:::info 注意
这里的生成的`$file`的名称如果是多个请求下载，可能会名称重复，还需要设置一个不重复的名称比较保险
:::
