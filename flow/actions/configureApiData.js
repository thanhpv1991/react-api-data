// @flow
import type { ApiDataEndpointConfig, ApiDataGlobalConfig } from '../types';

export type ConfigureApiDataAction = {
  type: 'CONFIGURE_API_DATA';
  payload: {
    globalConfig: ApiDataGlobalConfig,
    endpointConfig: {
      [endpointKey: string]: ApiDataEndpointConfig
    }
  };
}

declare export var configureApiData: (
  globalConfig: ApiDataGlobalConfig,
  endpointConfig: {
    [endpointKey: string]: ApiDataEndpointConfig
  }
) => ConfigureApiDataAction;
