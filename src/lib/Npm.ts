import { PrivateApiClient } from "src/PrivateApiClient";
import { IPrivateApiConfig } from "src/PrivateApiClient/HttpClient";
import fs from "node:fs";
import path from "node:path";
import { version } from "node:process";

interface INodePackage {
  packageName: string;
  installedVersion: string;
  installedNodes: {
    name: string;
  }[]
}

interface INameVersion {
  name: string;
  version: string;
}

const nodesListToText = (nodesPackages: INodePackage[]) => {
  const list = nodesPackages.map(i => {
    const nodes = i.installedNodes.map(j => j.name).join(', '); 
    return `${i.packageName}@${i.installedVersion}. Nodes: ${nodes}`
  })
  return list.join('\n');
}

const packageToNameVer = (p: INodePackage): INameVersion => {
  return {
    name: p.packageName,
    version: p.installedVersion,
  };
}

const strToNameVer = (str: string): INameVersion => {
  const nameVer = str.split(/@(?=[^@]+$)/);
  return {
    name: nameVer[0],
    version: nameVer[1]
  }
}

const stringListToNameVer = (text: string): INameVersion[] => {
  return text
    .split('\n')
    .map(i => i.trim())
    .filter(i => i !== '')
    .map(strToNameVer)
}

const nameVerToStr = (pkg: INameVersion): string => {
  return `${pkg.name}@${pkg.version}`
}

const isPkgEqual = (a: INameVersion, b: INameVersion): boolean => {
  return a.name === b.name && a.version === b.version;
}

export class Npm {

  client: PrivateApiClient;

  constructor(public config: IPrivateApiConfig) {
    this.client = new PrivateApiClient(config);
  }

  private async getListFromSrv(): Promise<INodePackage[]> {
    const res = await this.client.nodes.list();
    return res.data.data as INodePackage[];
  }

  private getListFromFile(file: string): INameVersion[] {
    const text = fs.readFileSync(file, 'utf-8');
    return stringListToNameVer(text);
  }

  async list (json: boolean) {
    const data = await this.getListFromSrv();
    if (json) {
      console.log(JSON.stringify(data, undefined, 2));
    } else {
      const listTxt = nodesListToText(data);
      console.log(listTxt);
    }
  }

  async saveList (file: string) {
    const data = await this.getListFromSrv();
    const listStr = data.map(i => `${i.packageName}@${i.installedVersion}`);
    const content = listStr.sort().join('\n') + '\n'
    fs.writeFileSync(file, content);
  }

  /**
   * @param packages packages with or without version
   * @param nodeListFile 
   */
  async install (packages: string[], nodeListFile: string) {
    const list = [...packages];
    if (nodeListFile) {
      const fromFile = this.getListFromFile(nodeListFile).map(nameVerToStr)
      list.push(...fromFile);
    }
    
    for(const name of list) {
      const res = await this.client.nodes.install(name);
      console.log(name, res.status)
    }
  }

  /**
   * @param packages package names only, without version
   */
  async uninstall (packages: string[]) {
    for (const name of packages) {
      const res = await this.client.nodes.uninstall(name);
      console.log(name, res.status)
    }
  }

  /**
   * @param packages package names only, without version
   */
  async update (packages: string[]) {
    for (const name of packages) {
      const res = await this.client.nodes.update(name);
      console.log(name, res.status)
    }
  }

  async setupAll (nodeListFile: string, reinstallExisting: boolean) {
    const listFromSrv = (await this.getListFromSrv()).map(packageToNameVer);
    const listFromFile = this.getListFromFile(nodeListFile);
    
    const toUninstall = listFromSrv.filter(i => listFromFile.findIndex(j => i.name === j.name) === -1);
    const toInstall = listFromFile.filter(i => listFromSrv.findIndex(j => i.name === j.name) === -1);
    const toUpdate = reinstallExisting
      ? listFromFile.filter(i => listFromSrv.findIndex(j => 
          i.name === j.name
        ) > -1) // reinstall (uninstall + install) all packages from server
      : listFromFile.filter(i => listFromSrv.findIndex(j => 
          i.name === j.name 
          && i.version !== j.version
        ) > -1) // update only packages with different version (higher or lower)

    console.log(`List from ${this.config.url}:`)
    console.log(listFromSrv.map(nameVerToStr).join('\n') + '\n')

    console.log(`List from ${nodeListFile}:`)
    console.log(listFromFile.map(nameVerToStr).join('\n') + '\n')

    console.log('\nUninstalling: ')
    for (const pkg of toUninstall) {
      const res = await this.client.nodes.uninstall(pkg.name);
      console.log(nameVerToStr(pkg), res.status)
    }

    console.log('\nInstalling: ')
    for (const pkg of toInstall) {
      const p = nameVerToStr(pkg);
      const res = await this.client.nodes.install(p);
      console.log(p, res.status)
    }

    console.log('\nUpgrade/Downgrade: ')
    for (const pkg of toUpdate) {
      const p = nameVerToStr(pkg);
      const res1 = await this.client.nodes.uninstall(pkg.name);
      const srvPkg = nameVerToStr(listFromSrv.find(i => i.name === pkg.name)!);
      console.log('Uninstallig', srvPkg, res1.status)
      const res2 = await this.client.nodes.install(p);
      console.log('Installing', p, res2.status)
    }
    
  }
}