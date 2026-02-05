import { ResourceBase } from "./resourceBase";
import { AxiosRequestConfig } from "axios";

export class DataTable extends ResourceBase {
  constructor(httpClient: any) {
    super(httpClient);
  }

  private logRequest(method: string, url: string, params?: Record<string, unknown>) {
    const paramsString = params ? ` params=${JSON.stringify(params)}` : '';
  }

  getAll(options?: { limit?: number; cursor?: string; filter?: string; sortBy?: string }) {
    const url = `/data-tables`;
    const requestOptions: AxiosRequestConfig = {
      url,
      method: 'GET',
      params: {
        limit: options?.limit ?? 100,
        ...(options?.cursor && { cursor: options.cursor }),
        ...(options?.filter && { filter: options.filter }),
        ...(options?.sortBy && { sortBy: options.sortBy }),
      }
    };
    this.logRequest(requestOptions.method ?? 'GET', url, requestOptions.params);
    return this.httpClient.request(requestOptions);
  }
  
  get(dataTableId: string) {
    const url = `/data-tables/${dataTableId}`;
    this.logRequest('GET', url);
    return this.httpClient.request({
      url,
      method: 'GET',
    });
  }

  delete(dataTableId: string) {
    const url = `/data-tables/${dataTableId}`;
    this.logRequest('DELETE', url);
    return this.httpClient.request({
      url,
      method: 'DELETE',
    });
  }

  create(dataTable: any) {
    const url = `/data-tables`;
    this.logRequest('POST', url);
    return this.httpClient.request({
      url,
      method: 'POST',
      data: dataTable
    });
  }
  
  update(dataTableId: string, dataTable: any) {
    const url = `/data-tables/${dataTableId}`;
    this.logRequest('PATCH', url);
    return this.httpClient.request({
      url,
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
    const url = `/data-tables/${dataTableId}/rows`;
    const requestOptions: AxiosRequestConfig = {
      url,
      method: 'GET',
      params: {
        limit: options?.limit ?? 100,
        ...(options?.cursor && { cursor: options.cursor }),
        ...(options?.sortBy && { sortBy: options.sortBy }),
        ...(options?.filter && { filter: options.filter }),
        ...(options?.search && { search: options.search }),
      }
    };
    this.logRequest(requestOptions.method ?? 'GET', url, requestOptions.params);
    return this.httpClient.request(requestOptions);
  }

  insertRows(dataTableId: string, rows: any[], returnType?: 'all' | 'id' | 'count') {
    const url = `/data-tables/${dataTableId}/rows`;
    this.logRequest('POST', url, { count: rows.length, returnType: returnType ?? 'count' });
    return this.httpClient.request({
      url,
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
    
    const filters = rowIds.map(id => ({
      columnName: "id",
      condition: "eq",
      value: id
    }));
    
    const filterObj = {
      type: "or",
      filters
    };
    
    const filterJson = JSON.stringify(filterObj);
    const url = `/data-tables/${dataTableId}/rows/delete`;
    this.logRequest('DELETE', url, { rowCount: rowIds.length });
    
    // Build URL with properly encoded filter parameter
    const searchParams = new URLSearchParams();
    searchParams.append('filter', filterJson);
    searchParams.append('returnData', 'false');
    
    return this.httpClient.request({
      url: `${url}?${searchParams.toString()}`,
      method: 'DELETE',
    });
  }
}
