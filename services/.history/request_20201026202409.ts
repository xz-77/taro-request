import Taro from '@tarojs/taro';
import { ACCESS_TOKEN } from '@/constants';
import * as systemInfo from '@/services/systemInfo';
import { primary, passport, medData, patientMed, data as dataCollect, broker, wechat } from '@/config/baseUrl';
import { interceptor } from './interceptor';

Taro.addInterceptor(interceptor);

interface options<T> {
  url: string,
  data?: T,
  baseUrl?: string,
  header?: any,
  method: "GET" | "OPTIONS" | "HEAD" | "POST" | "PUT" | "DELETE" | "TRACE" | "CONNECT"
}

const create = <T, R>({ url, data, baseUrl = 'primary', header, method = 'GET' }: options<T>): Taro.RequestTask<R> => {
  const options = {
    url: `${baseUrl}${url}`,
    data,
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