import Taro from '@tarojs/taro';
import { ACCESS_TOKEN } from '@/constants';
import * as systemInfo from '@/services/systemInfo';
import { primary, passport, medData, patientMed, data as dataCollect, broker, wechat } from '@/config/baseUrl';
import { interceptor } from './interceptor';

Taro.addInterceptor(interceptor);

interface Idata {
  version: string;
  brand: string;
  model: string;
  system: string;
  platform: string;
  wxLanguage: string;
  wxVersion: string;
  sys_v: string;
  sys_p: string;
  sys_m: string;
  cli_c: 'medlinker';
  cli_v: string;
  userPlatform: 'me';
  sess: any;
}

const getData = <T>(params: T): T & Idata | Idata => {
  // 加鉴权token
  const token: string = Taro.getStorageSync(ACCESS_TOKEN) || '';

  const { version, brand, model, system, platform, wxLanguage, wxVersion } = systemInfo;

  let data: Idata = {
    version, // 小程序版本号
    brand, // 手机品牌
    model: model, // 手机型号
    system: system, // 手机系统及版本
    platform: platform, // 手机平台
    wxLanguage: wxLanguage, // 微信设置的语言
    wxVersion: wxVersion, // 微信版本号
    sys_v: system,
    sys_p: platform,
    sys_m: model,
    cli_c: 'medlinker',
    cli_v: version,
    userPlatform: 'me',
    sess: token,
  };

  if (params) {
    data = { ...data, ...params };
  }

  return data;
}

const getUrl = (hostType: string): string => {
  let host = '';
  if (hostType === 'primary') {
    host = primary;
  } else if (hostType === 'passport') {
    host = passport;
  } else if (hostType === 'medData') {
    host = medData;
  } else if (hostType === 'patientMed') {
    host = patientMed;
  } else if (hostType === 'data') {
    host = dataCollect;
  } else if (hostType === 'broker') {
    host = broker;
  } else if (hostType === 'wechat') {
    host = wechat;
  } else {
    host = hostType;
  }
  return host;
}

interface options<T> {
  url: string,
  data?: T,
  baseUrl?: string,
  header?: any,
  method: "GET" | "OPTIONS" | "HEAD" | "POST" | "PUT" | "DELETE" | "TRACE" | "CONNECT"
}

const create = <T, R>({ url, data, baseUrl = 'primary', header, method = 'GET' }: options<T>): Taro.RequestTask<R> => {
  const options = {
    url: `${getUrl(baseUrl)}${url}`,
    data: <T>getData(data),
    method,
    header
  }
  return Taro.request(options);
}

const request = {
  get: <T, R>(url: string, data?: T, baseUrl?: string, header?: any): Taro.RequestTask<R> => {
    return create<T, R>({ url, data, baseUrl, header, method: 'GET' })
  },
  post: <T, R>(url: string, data?: T, baseUrl?: string, header?: any): Taro.RequestTask<R> => {
    return create({ url, data, baseUrl, header, method: 'POST' })
  },
  put: <T, R>(url: string, data?: T, baseUrl?: string, header?: any): Taro.RequestTask<R> => {
    return create({ url, data, baseUrl, header, method: 'PUT' })
  },
  delete: <T, R>(url: string, data?: T, baseUrl?: string, header?: any): Taro.RequestTask<R> => {
    return create({ url, data, baseUrl, header, method: 'DELETE' })
  },
}

export default request;