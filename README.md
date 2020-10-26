### taro-request

* 二次封装Taro.request
* 封装并且统一Taro.loading
  * 使用计数器的方式实现，因为loading和toast只能存在一个，所以toast的时候进行hideloading判断(直接调用hideloading，一些情况下android会报错)，一定时间之后根据当前计时器判断继续loading，最终在计时器为0的时候进行hideloading操作。
* 根据http请求status进行简单的报错提示。业务报错可以自行扩展
