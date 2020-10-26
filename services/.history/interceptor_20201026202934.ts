import Taro, { Chain, request } from '@tarojs/taro';
import { ACCESS_TOKEN, USER_INFO } from "@/constants";
import captureException from '@/utils/sentry';

enum HTTP_STATUS {
  SUCCESS = 200,
  CREATED = 201,
  ACCEPTED = 202,
  CLIENT_ERROR = 400,
  AUTHENTICATE = 401,
  FORBIDDEN = 403,
  NOT_FOUND = 404,
  SERVER_ERROR = 500,
  BAD_GATEWAY = 502,
  SERVICE_UNAVAILABLE = 503,
  GATEWAY_TIMEOUT = 504
}

let REQUEST_NUM = 0;

export const interceptor = (chain: Chain) => {
  increaseRequest();
  const requestParams = chain.requestParams;
  const errorData = { data: { errcode: 1, errmsg: '', data: null } }
  return chain.proceed(requestParams).then((res: request.SuccessCallbackResult<{ errcode: number, errmsg: string, data: any }>) => {
    console.log('data->', res)
    reduceRequest();
    if (res.statusCode === HTTP_STATUS.NOT_FOUND) {
      errShowToast('404->资源找不到');
      return errorData;
    } else if (res.statusCode === HTTP_STATUS.BAD_GATEWAY) {
      errShowToast('502->服务端问题');
      return errorData;
    } else if (res.statusCode === HTTP_STATUS.FORBIDDEN) {
      errShowToast('403->Forbidden')
      return errorData;
    } else if (res.statusCode === HTTP_STATUS.AUTHENTICATE) {
      errShowToast('401->Unauthorized')
      return errorData;
    } else if (res.statusCode === 200) {
      if (res.data.errcode === 0) {
        return res;
      }
      return errorData;
    } else {
      errShowToast('statusError->服务器错误，请稍后重试')
    }
  }).catch(() => {
    reduceRequest();
    errShowToast('request:fail->接口请求超时失败')
    return errorData;
  })
}

const errShowToast = (title: string) => {
  isHideLoading();
  Taro.showToast({ title, icon: 'none', mask: true, duration: 1500 });
  setTimeout(() => {
    isShowLoading();
  }, 1500);
}

const isHideLoading = () => {
  if (REQUEST_NUM > 0) {
    console.log('toast之前隐藏loading');
    Taro.hideLoading();
  }
}

const isShowLoading = () => {
  if (REQUEST_NUM > 0) {
    Taro.showLoading({
      title: 'loading...',
      mask: true,
    });
  }
}

const increaseRequest = () => {

  if (REQUEST_NUM === 0) {
    console.log('开始loading');
    Taro.showLoading({
      title: 'loading...',
      mask: true,
    });
  }
  REQUEST_NUM += 1;
  console.log('REQUEST_NUM->', REQUEST_NUM)
}

const reduceRequest = () => {

  REQUEST_NUM -= 1;
  console.log('REQUEST_NUM->', REQUEST_NUM)
  if (REQUEST_NUM === 0) {
    console.log('结束loading');
    Taro.hideLoading();
  }
}