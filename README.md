### taro-request

* 二次封装Taro.request
* 封装并且统一Taro.loading
  * 使用计数器的方式实现，因为loading和toast只能存在一个，所以toast的时候进行hideloading判断(直接调用hideloading，一些情况下android会报错)，一定时间之后根据当前计时器判断继续loading，最终在计时器为0的时候进行hideloading操作。
* 根据http请求status进行简单的报错提示。业务报错可以自行扩展
* 接口书写方式
```javascript
export function name(params: params) {
  return request.get<params,response>('xxxx', params, 'xx');
}
```

#### v1.0.1

* 完善逻辑
  * 增加setTimeout，解决在request串行请求的情况下多次闪现loading问题(也就是串行请求会有多个loading)。
  * 增加clearTimeout，解决在request串行请求任意接口报错的提示问题，并且去除对其他接口的请求的影响。(也就是提示语存在时间1.5s，计数器直接-1,如果依然还有接口未返回就继续loading，如果所有接口都已请求完毕就全部结束)