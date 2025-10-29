export interface queryPaginatedResult<T> {
  data: T[]
  meta: {
    total: number
    page: number
    last_page: number
  }
}
