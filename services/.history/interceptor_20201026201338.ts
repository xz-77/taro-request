import Taro, { Chain, request } from '@tarojs/taro';
import { ACCESS_TOKEN, USER_INFO } from "@/constants";
import captureException from '@/utils/sentry';
import { hideLoading, showLoading, showToast } from "@/utils/notification";

// enum HTTP_STATUS {
//   SUCCESS = 200,
//   CREATED = 201,
//   ACCEPTED = 202,
//   CLIENT_ERROR = 400,
//   AUTHENTICATE = 401,
//   FORBIDDEN = 403,
//   NOT_FOUND = 404,
//   SERVER_ERROR = 500,
//   BAD_GATEWAY = 502,
//   SERVICE_UNAVAILABLE = 503,
//   GATEWAY_TIMEOUT = 504
// }

let REQUEST_NUM = 0;

const gotoLogin = () => {
  const App = Taro.getApp();
  const pages = Taro.getCurrentPages()
  let currentPage = pages[pages.length - 1].route
  const pageOptions = pages[pages.length - 1].options || {}

  if (Object.keys(pageOptions).length) {
    currentPage +=
      '?' +
      Object.keys(pageOptions)
        .reduce((prev, item) => {
          prev.push(item + '=' + encodeURIComponent(pageOptions[item]))
          return prev
        }, [] as string[])
        .join('&')
  }

  if (!pages.some((item) => item.route.includes('pages/auth'))) {
    // Taro.clearStorageSync()
    Taro.removeStorageSync(ACCESS_TOKEN)
    Taro.removeStorageSync(USER_INFO)
    App.clearGlobalData();
    // 未登录拦截
    if (currentPage.includes('pages/login') || currentPage.includes('pages/auth') || currentPage.includes('pages/checkMedSession')) {
      Taro.reLaunch({
        url: `/pages/auth/index`,
      })
    } else {
      Taro.reLaunch({
        url: `/pages/auth/index?redirectUrl=${encodeURIComponent('/' + currentPage)}`,
      })
    }

  } else {
    showToast('鉴权失败!');
    setTimeout(() => {
      isShowLoading();
    }, 1500);
  }
}




export const interceptor = (chain: Chain) => {
  increaseRequest();
  const requestParams = chain.requestParams;
  const errorData = { data: { errcode: 1, errmsg: '', data: null } }
  return chain.proceed(requestParams).then((res: request.SuccessCallbackResult<{ errcode: number, errmsg: string, data: any }>) => {
    console.log('data->', res)
    reduceRequest();
    // if (res.statusCode === HTTP_STATUS.NOT_FOUND) {
    //   errShowToast('404->资源找不到');
    //   return errorData;
    // } else if (res.statusCode === HTTP_STATUS.BAD_GATEWAY) {
    //   errShowToast('502->服务端问题');
    //   return errorData;
    // } else if (res.statusCode === HTTP_STATUS.FORBIDDEN) {
    //   showToast('403->Forbidden')
    //   return errorData;
    // } else if (res.statusCode === HTTP_STATUS.AUTHENTICATE) {
    //   showToast('401->Unauthorized')
    //   return errorData;
    // } else 
    if (res.statusCode === 200 || res.statusCode === 304) {
      console.log('res.data->', res)
      if (res.data.errcode === 0) {
        return res;
      }
      const errcode = [20004, 780001, 999, 101, 102];
      if (errcode.includes(res.data.errcode)) {
        isHideLoading();
        gotoLogin();
      }
      if (res.data.errcode === 104) {
        // errShowToast('errcode/104->登陆解析失败');
        captureException({ requestParams })
        //快捷登录后端解析失败报错的兜底，进行重置登录操作
        Taro.clearStorageSync();
        Taro.reLaunch({
          url: '/pages/auth/index',
        });
      }
      // if (codeMessage[res.data.errcode]) {
      //   errShowToast(codeMessage[res.data.errcode]);
      //   return errorData;
      // }
      return errorData;
    } else {
      captureException({ statusError: res });
      errShowToast('statusError->服务器错误，请稍后重试')
    }
  }).catch(() => {
    reduceRequest();
    errShowToast('request:fail->接口请求超时失败')
    return errorData;
  })
}

const errShowToast = (message: string) => {
  isHideLoading();
  showToast(message);
  setTimeout(() => {
    isShowLoading();
  }, 1500);
}

const isHideLoading = () => {
  if (REQUEST_NUM > 0) {
    console.log('toast之前隐藏loading');
    hideLoading();
  }
}

const isShowLoading = () => {
  if (REQUEST_NUM > 0) {
    console.log('再次开始loading');
    showLoading();
  }
}

const increaseRequest = () => {

  if (REQUEST_NUM === 0) {
    console.log('开始loading');
    showLoading();
  }
  REQUEST_NUM += 1;
  console.log('REQUEST_NUM->', REQUEST_NUM)
}

const reduceRequest = () => {

  REQUEST_NUM -= 1;
  console.log('REQUEST_NUM->', REQUEST_NUM)
  if (REQUEST_NUM === 0) {
    console.log('结束loading');
    hideLoading();
  }
}