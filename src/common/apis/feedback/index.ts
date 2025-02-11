import type * as Table from "./type"
import { request } from "@/http/axios"
import axios from "axios"

/** 增 */
export function createTableDataApi(data: CreateUserRequestData) {
  return request({
    url: "/api/admin/foods",
    method: "post",
    data
  })
}

/** 删 */
export function deleteTableDataApi(id: number) {
  return request({
    url: `/api/admin/feedback/admin/delete/${id}`,
    method: "delete"
  })
}

export function deleteBatchTableDataApi(ids: number[]) {
  return request({
    url: "/api/admin/feedback/admin/batch-delete",
    method: "delete",
    data: ids
  })
}

/** 查 */
export function getTableDataApi(params: Table.TableRequestData) {
  return request<Table.TableResponseData>({
    url: "/api/admin/feedback/admin/all",
    method: "get",
    params
  })
}

/** 修改反馈记录的处理状态 */
export function updateFeedbackStatusApi(feedbackId: number, status: string) {
  const params = new URLSearchParams();
  params.append("status", status);
  return request({
    url: `/api/admin/feedback/admin/status/${feedbackId}`,
    method: "post",
    data: params,
    headers: {
      "Content-Type": "application/x-www-form-urlencoded",
    },
  });
}
