import fs from "node:fs";
import path from "node:path";
import { PublicApiClient } from "src/PublicApiClient";
import { IPublicApiConfig } from "src/PublicApiClient/HttpClient";
import { IRestCliConfig, RestCliClient } from "src/RestCliClient";
import { AxiosResponse } from "axios";

interface IDataTable {
  id: string;
  name: string;
  projectId?: string;
  columns?: IDataTableColumn[];
  rows?: IDataTableRow[];
  createdAt?: string;
  updatedAt?: string;
}

interface IDataTableColumn {
  id: string;
  name: string;
  type: string;
  [key: string]: any;
}

interface IDataTableRow {
  id?: number;
  [key: string]: any;
}

interface IGetAllDataTablesResponse {
  data: IDataTable[];
  nextCursor?: string;
}

interface IGetAllRowsResponse {
  data: IDataTableRow[];
  nextCursor?: string;
}

const getFileName = (dt: IDataTable) => {
  const name = dt.name
    .replace(/::|: /g, ' - ')
    .replace(/[:|]/g, '')
    .replace(/\s+/g, ' ')
    .replace(/\\|\//g, '_');
  return `${name}.json`;
};

const getDataTableFiles = (dir: string): string[] => {
  if (!fs.existsSync(dir)) {
    return [];
  }
  return fs.readdirSync(dir, { withFileTypes: true })
    .filter(dirent => dirent.isFile())
    .map(dirent => dirent.name)
    .filter(i => i.endsWith('.json'));
};

const getNameFromFileName = (fileName: string): string => {
  return fileName.replace(/\.json$/, '');
};

const getDataTableFromFile = (file: string): IDataTable => {
  const content = fs.readFileSync(file, 'utf-8');
  return JSON.parse(content);
};

const isNumericString = (input: string): boolean => {
  return /^\d+$/.test(input);
};

const sortIds = (ids: string[]): string[] => {
  const numericIds = ids.filter(id => isNumericString(id));
  const nonNumericIds = ids.filter(id => !isNumericString(id));

  // Sort the numeric IDs as numbers and combine them with the non-numeric IDs
  return [
    ...numericIds.map(id => parseInt(id)).sort((a, b) => a - b).map(String),
    ...nonNumericIds.sort(),
  ];
};

export class DataTables {

  private publicApiClient: PublicApiClient;
  restCliClient?: RestCliClient;

  constructor(
    public publicApiCfg: IPublicApiConfig,
    public restCliCfg?: IRestCliConfig,
  ) {
    this.publicApiClient = new PublicApiClient(this.publicApiCfg);
    
    if (this.restCliCfg) {
      this.restCliClient = new RestCliClient(this.restCliCfg);
    }
  }

  // Fetch all data tables from n8n instance (across all projects)

  private async fetchAllDataTables(): Promise<IDataTable[]> {
    
    let allDataTables: IDataTable[] = [];
    let nextCursor: string | undefined = undefined;

    do {
      const response: AxiosResponse<IGetAllDataTablesResponse> = await this.publicApiClient.dataTable
        .getAll({ cursor: nextCursor, limit: 100 });
      
      allDataTables = allDataTables.concat(response.data.data);
      nextCursor = response.data.nextCursor;
    } while (nextCursor);
    
    return allDataTables;
  }

  // Fetch all rows for a specific data table

  private async fetchAllRows(dataTableId: string): Promise<IDataTableRow[]> {
    
    let allRows: IDataTableRow[] = [];
    let nextCursor: string | undefined = undefined;

    do {
      const response: AxiosResponse<IGetAllRowsResponse> = await this.publicApiClient.dataTable
        .getRows(dataTableId, { cursor: nextCursor, limit: 250 });
      
      allRows = allRows.concat(response.data.data);
      nextCursor = response.data.nextCursor;
    } while (nextCursor);
    
    return allRows;
  }

  // Fetch data tables from n8n instance with columns and rows

  private async getDataTablesFromSrv(dataTableIds?: string[]): Promise<IDataTable[]> {

    if (dataTableIds && dataTableIds.length > 0) {
      const dataTables = await Promise.all(
        dataTableIds.map(async (id) => {
          const dtResponse = await this.publicApiClient.dataTable.get(id);
          const dataTable = dtResponse.data as IDataTable;

          dataTable.rows = await this.fetchAllRows(id);
          
          return dataTable;
        })
      );
      return dataTables;
    } else {
      const dataTables = await this.fetchAllDataTables();
      
      const dataTablesWithData = await Promise.all(
        dataTables.map(async (dt) => {
          dt.rows = await this.fetchAllRows(dt.id);
          
          return dt;
        })
      );
      
      return dataTablesWithData;
    }
  }

  // Get data tables from directory

  private getDataTablesFromDir(dir: string, dataTableIdentifiers?: string[]): IDataTable[] {
    const files = getDataTableFiles(dir);
    
    let filteredFiles = files;
    if (dataTableIdentifiers && dataTableIdentifiers.length > 0) {
      // Load all tables to check both ID and name
      const allTables = files.map(f => getDataTableFromFile(path.join(dir, f)));
      filteredFiles = files.filter(f => {
        const tableName = getNameFromFileName(f);
        const table = allTables.find(t => getNameFromFileName(getFileName(t)) === tableName);
        if (!table) return false;
        // Match by either ID or name
        return dataTableIdentifiers.includes(table.id) || dataTableIdentifiers.includes(table.name);
      });
    }
    
    return filteredFiles.map(f => getDataTableFromFile(path.join(dir, f)));
  }

  // Publish data tables to n8n instance

  private async publishDataTables(dataTables: IDataTable[], webhookPayload?: any) {
    if (dataTables.length === 0) {
      console.log('There are no data tables to publish.');
      return;
    }

    const outputIdsList = sortIds(dataTables.map(i => i.id)).join();
    console.log(`Publishing [${outputIdsList}]`);
    console.log(`Note: Table IDs are auto-generated by n8n and will differ across environments. Tables are matched by name.\n`);
    
    // Fetch all existing tables to match by name if ID doesn't exist
    const allExistingTables = await this.fetchAllDataTables();

    for (const dt of dataTables) {
      try {
        let existingDataTable: IDataTable | null = null;
        let actualTableId = dt.id;
        
        // Try to find table by ID first
        try {
          const response = await this.publicApiClient.dataTable.get(dt.id);
          existingDataTable = response.data as IDataTable;
        } catch (error: any) {
          if (error.response?.status !== 404) {
            throw error;
          }
          
          // ID not found, try to find by NAME
          const tableByName = allExistingTables.find(t => t.name === dt.name);
          if (tableByName) {
            existingDataTable = tableByName;
            actualTableId = tableByName.id;
            console.log(`  Table ID ${dt.id} not found, but found table by name "${dt.name}" with ID ${actualTableId} on this environment`);
          }
        }

        if (existingDataTable) {
          // Delete all existing rows from the table
          const existingRows = await this.fetchAllRows(actualTableId);
          if (existingRows.length > 0) {
            const rowIds = existingRows.map(row => row.id).filter(id => id !== undefined) as number[];
            if (rowIds.length > 0) {
              await this.publicApiClient.dataTable.deleteRowsByIds(actualTableId, rowIds);
            }
          }
          
          // Update table name if needed
          if (existingDataTable.name !== dt.name) {
            await this.publicApiClient.dataTable.update(actualTableId, { name: dt.name });
            console.log(`  Updated data table name ${actualTableId}: ${dt.name}`);
          } else {
          }
        } else {
          // Create new data table (n8n will auto-generate ID)
          const createPayload: any = {
            name: dt.name,
            columns: dt.columns || [],
          };
          
          const response = await this.publicApiClient.dataTable.create(createPayload);
          actualTableId = response.data.id;
          if (actualTableId !== dt.id) {
            console.log(`  Created data table "${dt.name}" with NEW ID ${actualTableId} (file had ID ${dt.id} from different environment)`);
          } else {
            console.log(`  Created data table ${actualTableId}: ${dt.name}`);
          }
        }

        if (dt.rows && dt.rows.length > 0) {
          // Remove auto-generated fields (id, createdAt, updatedAt) as they'll be regenerated
          const rowsToInsert = dt.rows.map(row => {
            const { id, createdAt, updatedAt, ...cleanRow } = row;
            return cleanRow;
          });
          
          const batchSize = 100;
          for (let i = 0; i < rowsToInsert.length; i += batchSize) {
            const batch = rowsToInsert.slice(i, i + batchSize);
            await this.publicApiClient.dataTable.insertRows(actualTableId, batch);
            //console.log(`  Inserted ${batch.length} rows into ${dt.name} (${i + batch.length}/${rowsToInsert.length})`);
          }
        }
      } catch (error: any) {
        console.error(`  Error publishing data table ${dt.id}: ${error.message}`);
        if (error.response?.data) {
          console.error(`  Details:`, error.response.data);
        }
      }
    }
  }


  /****************************************************************************
   * Public Methods
   */

  // List all data tables in the project
 
  async list(json: boolean) {
    const res = await this.fetchAllDataTables();

    if (json) {
      const jsonRes = res.map(dt => ({
        id: dt.id,
        name: dt.name,
        projectId: dt.projectId,
      }));
      console.log(jsonRes);
    } else {
      const lines = res.map(i => `${i.id}: ${i.name}`);
      console.log(lines.join('\n'));
      console.log(`\nNote: These IDs are from n8n and are environment-specific. When migrating tables, use names instead of IDs.`);
    }
  }

  async delete(identifiers: string[]) {
    // Fetch all tables to support deletion by name
    const allTables = await this.fetchAllDataTables();
    
    for (const identifier of identifiers) {
      let tableToDelete = allTables.find(t => t.id === identifier);
      
      if (!tableToDelete) {
        tableToDelete = allTables.find(t => t.name === identifier);
      }
      
      if (tableToDelete) {
        process.stdout.write(`Deleting "${tableToDelete.name}" (${tableToDelete.id})... `);
        await this.publicApiClient.dataTable.delete(tableToDelete.id);
        console.log('Done.');
      } else {
      }
    }
  }
 
  async save(
    dir: string,
    dataTableIdentifiers?: string[],
    keepFiles: boolean = false,
  ) {
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }

    const dataTablesFromSrv = await this.getDataTablesFromSrv(dataTableIdentifiers);
    const filesList = getDataTableFiles(dir);
    
    // Load existing files to check by name
    const existingTables = filesList.map(f => {
      try {
        return getDataTableFromFile(path.join(dir, f));
      } catch {
        return null;
      }
    }).filter(t => t !== null) as IDataTable[];
    
    const relevantFiles = dataTableIdentifiers && dataTableIdentifiers.length > 0
      ? filesList.filter(f => {
          const table = existingTables.find(t => getFileName(t) === f);
          if (!table) return false;
          return dataTableIdentifiers.includes(table.id) || dataTableIdentifiers.includes(table.name);
        })
      : filesList;
    
    const dataTableNamesFromSrv = dataTablesFromSrv.map(dt => getFileName(dt));
    const filesToDelete = relevantFiles.filter(f => !dataTableNamesFromSrv.includes(f));

    if (!keepFiles && filesToDelete.length > 0) {
      for (const file of filesToDelete) {
        fs.unlinkSync(path.join(dir, file));
        console.log(`Deleted file: ${file}`);
      }
    }

    for (const dt of dataTablesFromSrv) {
      const newFileName = getFileName(dt);
      const newFilePath = path.join(dir, newFileName);
      
      const content = JSON.stringify(dt, undefined, 2);
      fs.writeFileSync(newFilePath, content);
      console.log(`Saved: ${newFileName}`);
    }
  }

  async publish(dir: string, dataTableIds?: string[], webhookPayload?: any) {
    const dataTables = this.getDataTablesFromDir(dir, dataTableIds);
    const payload = webhookPayload ? { ...webhookPayload, dataTables } : undefined;
    await this.publishDataTables(dataTables, payload);
  }

  async setupAll(dir: string, webhookPayload?: any) {
    // Fetch all data tables from server
    const dataTablesFromSrv = await this.fetchAllDataTables();
    const dataTablesFromDir = this.getDataTablesFromDir(dir);
    
    const dataTableIdsFromDir = dataTablesFromDir.map(dt => dt.id);
    const dataTableIdsToDelete = dataTablesFromSrv.filter(
      dt => !dataTableIdsFromDir.includes(dt.id)
    );

    if (dataTableIdsToDelete.length > 0) {
      console.log(`Deleting data tables not present in directory...`);
      for (const dt of dataTableIdsToDelete) {
        const res = await this.publicApiClient.dataTable.delete(dt.id);
        console.log(`Deleted ${dt.id}. Result status: ${res.status}`);
      }
    } else {
      console.log('There are no data tables at n8n instance which aren\'t present in directory. So nothing to delete.');
    }
  
    const payload = webhookPayload ? { ...webhookPayload, dataTables: dataTablesFromDir } : undefined;
    await this.publishDataTables(dataTablesFromDir, payload);
  }
}
