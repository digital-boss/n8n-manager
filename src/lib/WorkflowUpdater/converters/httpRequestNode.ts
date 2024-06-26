import type { IConverter, INode } from "../types";

const checkNodeType = (t: string) => t === 'n8n-nodes-base.httpRequest';

function updateOptions(node: INode): void {
  const method = node.parameters.method;
  delete node.parameters.method;

  // Check for options and transform them if present
  if (node.parameters.options) {
    const updatedOptions: any = {};

    for (const option in node.parameters.options) {
      switch (option) {
        case 'batchInterval':
        case 'batchSize':
          updatedOptions.batching = {
            batch: {
              batchInterval: node.parameters.options.batchInterval,
              batchSize: node.parameters.options.batchSize,
            },
          };
          break;
        case 'fullResponse':
          updatedOptions.response = { response: { fullResponse: node.parameters.options.fullResponse } };
          break;
        case 'followRedirect':
          updatedOptions.redirect = { redirect: {} };
          break;
        case 'ignoreResponseCode':
          updatedOptions.response = { response: { neverError: node.parameters.options.ignoreResponseCode } };
          break;
        case 'proxy':
          updatedOptions.proxy = node.parameters.options.proxy;
          break;
        case 'timeout':
          updatedOptions.timeout = node.parameters.options.timeout;
          break;
        case 'bodyContentType':
          node.parameters.contentType = node.parameters.options.bodyContentType;
          break;
        default:
          break;
      }
    }

    node.parameters.options = updatedOptions;
  }

  node.parameters = { method, ...node.parameters };
}

const ver1: IConverter = {
  predicate: (node: INode) => {
    return checkNodeType(node.type) && node.typeVersion === 1;
  },

  convert: (node: INode) => {
    let todoMessage: string[] = [];
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

    updateOptions(node);

    if (node.parameters.responseFormat) {
      if (node.parameters.responseFormat === "string") {
        node.parameters.responseFormat = "json";
        todoMessage.push('The new version of the HTTP node not support response format "string"');
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

    if (!node.parameters.options.splitIntoItems) {
      todoMessage.push('The new version of the HTTP node splits the response into items like the "splitIntoItems" option of the old node. Adjust the workflow as needed.');
    }

    if (node.parameters.method == 'OPTIONS') {
      todoMessage.push('Request method "OPTIONS": you will need to manually check the response to ensure it is working as expected.');
    }
    if (node.parameters.method == 'HEAD') {
      todoMessage.push('Request method "HEAD": you will need to manually check the response to ensure it is working as expected.');
    }
    return todoMessage.join('\n');
  }
}

const ver2: IConverter = {
  predicate: (node: INode) => {
    return checkNodeType(node.type) && node.typeVersion === 2;
  },

  convert: (node: INode) => {
    return 'You need to manually update the node';
  }
}

export const httpRequestNodeConv: IConverter[] = [
  ver1,
  ver2
];
