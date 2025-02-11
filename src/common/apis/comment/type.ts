export interface TableRequestData {
  /** 当前页码 */
  page?: number
  /** 查询条数 */
  size?: number
  keyword?: string
}

export interface TableRequestDataNew {
  /** 当前页码 */
  currentPage: number
  /** 查询条数 */
  size: number
  id: number
}

export interface TableData {
  avatarUrl: string
  id: number
  username: string
  gender: number
  birthday: string
  role: string
  nickname: string
  phone: string
  email: string
  status: number
  createdAt: string
  updatedAt: string
  lastLoginTime: string
  deleted: number
}

export type TableResponseData = ApiResponseData<{
  records: TableData[]
  total: number
}>

export type TableResponseDataNew = ApiResponseData<{
  data: TableData[]
  total: number
}>
