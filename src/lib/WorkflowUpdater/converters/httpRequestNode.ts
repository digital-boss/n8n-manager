import { IConverter, INode } from "../types";

const checkNodeType = (t: string) => t === 'n8n-nodes-base.httpRequest';

const ver1: IConverter = {
  predicate: (node: INode) => {
    return checkNodeType(node.type) && node.typeVersion === 1;
  },

  convert: (node: INode) => {
    node.typeVersion = 4.1;

    if (node.parameters.requestMethod) {
      node.parameters.method = node.parameters.requestMethod;
      delete node.parameters.requestMethod;
    }
  
    if (node.parameters.queryParametersUi) {
      node.parameters.sendQuery = true;
      node.parameters.queryParameters = {
        parameters: node.parameters.queryParametersUi.parameter,
      };
      delete node.parameters.queryParametersUi;
    }
  
    if (node.parameters.headerParametersUi) {
      node.parameters.sendHeaders = true;
      node.parameters.headerParameters = {
        parameters: node.parameters.headerParametersUi.parameter,
      };
      delete node.parameters.headerParametersUi;
    }
  
    if (node.parameters.bodyParametersUi) {
      node.parameters.sendBody = true;
      node.parameters.bodyParameters = {
        parameters: node.parameters.bodyParametersUi.parameter,
      };
      delete node.parameters.bodyParametersUi;
    }
  
    if (node.parameters.queryParametersJson) {
      node.parameters.sendQuery = true;
      node.parameters.specifyQuery = 'json';
      node.parameters.jsonQuery = node.parameters.queryParametersJson;
  
      delete node.parameters.queryParametersJson;
      delete node.parameters.jsonParameters;
    }
  
    if (node.parameters.headerParametersJson) {
      node.parameters.sendHeaders = true;
      node.parameters.specifyHeaders = 'json';
      node.parameters.jsonHeaders = node.parameters.headerParametersJson;
  
      delete node.parameters.headerParametersJson;
      delete node.parameters.jsonParameters;
    }
  
    if (node.parameters.bodyParametersJson) {
      node.parameters.sendBody = true;
      node.parameters.specifyBody = 'json';
      node.parameters.jsonBody = node.parameters.bodyParametersJson;
  
      delete node.parameters.bodyParametersJson;
      delete node.parameters.jsonParameters;
    }
  
    const method = node.parameters.method;
    delete node.parameters.method;

    let additionalText: string[] = [];
  
    // Check for options and transform them if present
    function updateOptions(options: any): any {
      const updatedOptions: any = {};
    
      for (const option in options) {
        switch (option) {
          case 'batchInterval':
          case 'batchSize':
            updatedOptions.batching = {
              batch: {
                batchInterval: options.batchInterval,
                batchSize: options.batchSize,
              },
            };
            break;
          case 'fullResponse':
            updatedOptions.response = { response: { fullResponse: options.fullResponse } };
            break;
          case 'followRedirect':
            updatedOptions.redirect = { redirect: {} };
            break;
          case 'ignoreResponseCode':
            updatedOptions.response = { response: { neverError: options.ignoreResponseCode } };
            break;
          case 'proxy':
            updatedOptions.proxy = options.proxy;
            break;
          case 'timeout':
            updatedOptions.timeout = options.timeout;
            break;
          case 'bodyContentType':
            node.parameters.contentType = options.bodyContentType;
            break;
          default:
            break;
        }
      }
    
      return updatedOptions;
    }
    
    if (node.parameters.options) {
      const updatedOptions = updateOptions(node.parameters.options);
      node.parameters.options = updatedOptions;
    }
  
    if (node.parameters.responseFormat) {
      if (node.parameters.responseFormat === "string") {
        node.parameters.responseFormat = "json";
        additionalText.push('The new version of the HTTP node not support response format "string"');
      }
      node.parameters.options = {
        response: {
          response: {
            responseFormat: node.parameters.responseFormat,
          },
        },
      };
      delete node.parameters.responseFormat;
    }
  
    if (node.parameters.authentication) {
      const authMethod: string = node.parameters.authentication;
  
      // Define a map that maps authentication types to genericAuthType values
      const authTypeMap: Record<string, string> = {
        basicAuth: 'httpBasicAuth',
        digestAuth: 'httpDigestAuth',
        headerAuth: 'httpHeaderAuth',
        oAuth1: 'oAuth1Api',
        oAuth2: 'oAuth2Api',
        queryAuth: 'httpQueryAuth',
      };
  
      if (authTypeMap[authMethod]) {
        node.parameters.genericAuthType = authTypeMap[authMethod];
      }
  
      node.parameters.authentication = 'genericCredentialType';
    }
  
    node.parameters = { method, ...node.parameters };
    return additionalText.join(',')
  }
}

const ver2: IConverter = {
  predicate: (node: INode) => {
    return checkNodeType(node.type) && node.typeVersion === 2;
  },

  convert: (node: INode) => {
    return 'Yon need manually update the node';
  }
}

export const httpRequestNodeConv: IConverter[] = [
  ver1,
  ver2
];
