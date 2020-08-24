# 京东云上传 demo

本项目为京东云分片上传demo，分别提供服务端以及前端实现。


## 使用说明

> Server 端配置

运行前请配置server中s3Config，
```js

let  s3Config= {
  protocal: 'http',
  maxRetries: 2,
  httpOptions: {
    timeout: 10000,
  },
  credentials: {
    accessKeyId: '',
    secretAccessKey: ''
  }
}
```
需要细化配置cors 规则，demo中的配置仅做示例。

---
> Client 端配置

修改views/Home 中 regionId和bucket。

关于分片的配置详见[vue-ossupload](https://git.jd.com/middleware-fe/vue-ossupload)


## 联系

有问题请提 [issue](https://github.com/ryansecret/uploadDemo/issues).

## License

[MIT](LICENSE)