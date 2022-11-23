import request from '@/utils/request'

// 查询有效登录次数
export function countSysLogin() {
  return request({
    // url: '/system/config/list',
    url: '/system/countSys/countSysLogin',
    method: 'get',
  })
}
