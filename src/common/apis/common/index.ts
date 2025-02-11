import { request } from "@/http/axios"
import axios from "axios"

/** 分析用户反馈情感分布 */
export function getFeedbackDataApi() {
  return request({
    url: "/api/admin/feedback/admin/analyze-sentiment",
    method: "get",
  })
}

/** 查看用户反馈统计数据 */
export function getFeedbackAnalyseDataApi() {
  return request({
    url: "/api/admin/feedback/admin/stats",
    method: "get",
  })
}

/** 统计用户数据 */
export function getUserDataApi() {
  return request({
    url: "/api/admin/user/statistics",
    method: "get",
  })
}


