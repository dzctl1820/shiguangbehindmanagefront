import type * as Login from "./type"
import { request } from "@/http/axios"

/** 登录并返回 Token */
export function loginApi(data: Login.LoginRequestData) {
  return request<Login.LoginResponseData>({
    url: "/api/users/login",
    method: "post",
    data
  })
}
