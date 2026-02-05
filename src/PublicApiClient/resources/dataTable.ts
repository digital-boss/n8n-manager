import { ResourceBase } from "./resourceBase";

export class DataTable extends ResourceBase {
  constructor(httpClient: any) {
    super(httpClient);
  }

  getAll(options?: { limit?: number; cursor?: string; filter?: string; sortBy?: string }) {
    return this.httpClient.request({
      url: `/data-tables`,
      method: 'GET',
      params: {
        limit: options?.limit ?? 100,
        ...(options?.cursor && { cursor: options.cursor }),
        ...(options?.filter && { filter: options.filter }),
        ...(options?.sortBy && { sortBy: options.sortBy }),
      }
    });
  }
  
  get(dataTableId: string) {
    return this.httpClient.request({
      url: `/data-tables/${dataTableId}`,
      method: 'GET',
    });
  }

  delete(dataTableId: string) {
    return this.httpClient.request({
      url: `/data-tables/${dataTableId}`,
      method: 'DELETE',
    });
  }

  create(dataTable: any) {
    return this.httpClient.request({
      url: `/data-tables`,
      method: 'POST',
      data: dataTable
    });
  }
  
  update(dataTableId: string, dataTable: any) {
    return this.httpClient.request({
      url: `/data-tables/${dataTableId}`,
      method: 'PATCH',
      data: dataTable
    });
  }
  
  getRows(dataTableId: string, options?: {
    limit?: number;
    cursor?: string;
    sortBy?: string;
    filter?: string;
    search?: string;
  }) {
    return this.httpClient.request({
      url: `/data-tables/${dataTableId}/rows`,
      method: 'GET',
      params: {
        limit: options?.limit ?? 100,
        ...(options?.cursor && { cursor: options.cursor }),
        ...(options?.sortBy && { sortBy: options.sortBy }),
        ...(options?.filter && { filter: options.filter }),
        ...(options?.search && { search: options.search }),
      }
    });
  }

  insertRows(dataTableId: string, rows: any[], returnType?: 'all' | 'id' | 'count') {
    return this.httpClient.request({
      url: `/data-tables/${dataTableId}/rows`,
      method: 'POST',
      data: {
        data: rows,
        returnType: returnType ?? 'count'
      }
    });
  }

  deleteRowsByIds(dataTableId: string, rowIds: number[]) {
    if (rowIds.length === 0) {
      return Promise.resolve({ data: true });
    }
    
    const filterObj = {
      type: "or",
      filters: rowIds.map(id => ({ columnName: "id", condition: "eq", value: id }))
    };
    
    const searchParams = new URLSearchParams({
      filter: JSON.stringify(filterObj),
      returnData: 'false'
    });
    
    return this.httpClient.request({
      url: `/data-tables/${dataTableId}/rows/delete?${searchParams}`,
      method: 'DELETE',
    });
  }
}
