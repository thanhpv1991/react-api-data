// @flow

import withApiData from './withApiData';
import reducer, { type State } from './reducer';
import { configure } from './actions/configure';
import { performApiRequest } from './actions/performRequest';
import { invalidateRequest } from './actions/invalidateRequest';
import { afterRehydrate } from './actions/afterRehydrate';
import { purge } from './actions/purge';
import { useRequestHandler } from './actions/performRequest';
import { getRequest } from './selectors/getRequest';
import { getResultData } from './selectors/getResultData';
import { getEntity } from './selectors/getEntity';
export type {
    NetworkStatus,
    NormalizeResult,
    NormalizedData,
    EndpointParams,
    DataRequest,
    GlobalConfig,
    Method,
    EndpointConfig,
    ConfigBeforeProps,
    ConfigAfterProps,
    Binding,
} from './types';

export {
    withApiData,
    configure,
    performApiRequest,
    invalidateRequest,
    afterRehydrate,
    useRequestHandler,
    getRequest,
    getResultData,
    getEntity,
    reducer,
    purge,
};

export var purgeApiData = purge;
export var getApiDataRequest = getRequest;
export var configureApiData = configure;

export interface ApiDataRequest implements DataRequest {}
export interface ApiDataGlobalConfig implements GlobalConfig {}
export interface ApiDataEndpointConfig implements EndpointConfig {}
export interface ApiDataConfigBeforeProps implements ConfigBeforeProps {}
export interface ApiDataConfigAfterProps implements ConfigAfterProps {}
export interface ApiDataBinding implements Binding {}