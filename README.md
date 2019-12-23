# react-api-data

Automate calling external APIs and handling response data. Supports any API with JSON responses. Uses Fetch for
performing API requests, normalizr for handling response data and redux for storing data.

## Installation

`npm install react-api-data`

or

`yarn add react-api-data`

Make sure _fetch_ is available globally, polyfill it if needed to support older environments.

## Install dependencies

React-api-data requires the installation of the peer-dependencies react-redux, redux-thunk and normalizr. 
These can be installed with the following command:

`npm install redux react-redux redux-thunk normalizr`

or

`yarn add redux react-redux redux-thunk normalizr`

## API

[API specification](api.md)

## Quick usage

### Config

```js
import { schema } from 'normalizr';
import { createStore, applyMiddleware, combineReducers } from 'redux';
import { configureApiData, reducer } from 'react-api-data';
import thunk from 'redux-thunk';

// optionally define normalizr response schemas

const authorSchema = new schema.Entity('Author');
const articleSchema = new schema.Entity('Article', {
    author: authorSchema
});

// define api endpoints

const endpointConfig = {
    getArticle: {
        url: 'http://www.mocky.io/v2/5a0c203e320000772de9664c?:articleId/:userId',
        method: 'GET',
        responseSchema: articleSchema
    },
    saveArticle: {
        url: 'http://www.mocky.io/v2/5a0c203e320000772de9664c?:articleId',
        method: 'POST',
        afterSuccess: ({ dispatch, request, getState }) => {
            // After successful post, invalidate the cache of the getArticle call, so it gets re-triggered.
            dispatch(invalidateApiDataRequest('getArticle', {articleId: request.params.articleId, userId: getState().userId})); 
        }
    }
};

// Configure store and dispatch config before you render components

const store = createStore(combineReducers({apiData: reducer}), applyMiddleware(thunk));
store.dispatch(configureApiData({}, endpointConfig));
```

### Bind API data to your component

```js
import { useApiData } from 'react-api-data';

const Article = (props) => {
    const article = useApiData('getArticle', { id: props.articleId });
        return (
        <Fragment>
            {article.request.networkStatus === 'success' && 
                <div>
                    <h1>{article.data.title}</h1>
                    <p>{article.data.body}</p>
                </div>
            }
        </Fragment>
    )
}

```

### Post data from you component

```js
import { useApiData } from 'react-api-data';

const PostComment = (props) => {
    const [comment, setComment] = useState('');
    const postComment = useApiData('postComment', {});
    const status = postComment.request.networkStatus;
    return (
        <Fragment>
            {status === 'ready' &&
                <SubmitArticleBody>
                    <TextBox
                        onChange={event => setComment(event.target.value)}
                        placeholder={'Add a comment...'}
                    />
                    <Button
                        onClick={() => postComment.perform(
                            { id: props.articleId }, { body: comment, articleId: props.articleId })
                        }
                    >
                        Submit
                    </Button>
                </SubmitArticleBody>
            }
            {status === 'loading' &&
                <div>Submitting...</div>
            }
            {status === 'failed' &&
                <SubmitArticleBody>
                    Something went wrong.
                    <Button
                        onClick={() =>
                            postComment.perform(
                                { id: props.articleId },
                                { body: comment, articleId: props.articleId }
                            )}
                    >
                        Try again
                    </Button>
                </SubmitArticleBody>
            }
            {status === 'success' &&
                <div>Submitted!</div>
            }
        </Fragment>
    );
};
```

# The gist

Calling external API endpoints and storing response data in your [redux](https://redux.js.org) state can create
bloat in your code when you have multiple endpoints, especially in [CRUD](https://en.wikipedia.org/wiki/Create,_read,_update_and_delete)
applications. This package is the result of eliminating repetitive code around API calls and centralizing the concerns of
fetching and storing API data into one single package. It provides an easy to use interface that aims to minimize the
amount of code needed to use data from external APIs, while maintaining maximum flexibility to support any non-standard
API. The idea is that you can just bind data from a given API endpoint to your component, react-api-data takes care of
fetching the data if needed, and binding the data to your component.

# Examples

## Caching API responses

Responses from successful API calls will be kept in memory so the same call won't be re-triggered a second time. This is especially useful when using *withApiData* for the same endpoint on multiple components.
You can set a *cacheDuration* to specify how long the response is considered valid, or to disable the caching entirely.

```js
export default {
    getArticle: {
        url: 'http://www.mocky.io/v2/5a0c203e320000772de9664c?:articleId/:userId',
        method: 'GET',
        cacheDuration: 60000, // 1 minute
    },
    getComments: {
        url: 'http://www.mocky.io/v2/5a0c203e320000772de9664c?:articleId',
        method: 'GET',
        cacheDuration: 0, // no caching, use with caution. Preferably set to a low value to prevent multiple simultaneous calls.
    },
    getPosts: {
        url: 'http://www.mocky.io/v2/5a0c203e320000772de9664c?:articleId',
        method: 'GET'
        // Infinite caching
    },
}
```

## Manually clearing cache from your component

```js
import { useApiData } from 'react-api-data';

const Articles = props => {
    const getArticles = useApiData('getArticles');
    return (
        <>
            {/* ... */}
            <button onClick={getArticles.invalidateCache}>Refresh</button>
        </>
    );
}

```

## Manually clearing cache using useActions

Using the useActions api to invalidate the cache of a specific endpoint.

```js
import { useActions} from 'react-api-data';

const Articles = props => {
    const actions = useActions();
    return (
        <>
            {/* ... */}
            <button onClick={() => actions.invalidateCache('getArticle', {id: '1234'})}>Refresh</button>
        </>
    );
}

```

## Removing api data from the store

```js
import { useActions} from 'react-api-data';

const LogoutComponent = props => {
    const actions = useActions();
    return (
        <>
            {/* ... */}
            <button onClick={() => actions.purgeAll()}>Logout</button>
        </>
    );
}
```

## Including Cookies in your Request

```js
export const globalConfig = {
    setRequestProperties: (defaultProperties) => ({
        ...defaultProperties,
        credentials: 'include',
    })
};
```

## Make multiple requests to the same endpoint at once

```js
const connectApiData = withApiData({
    items: 'getItemsInList'
}, (ownProps, state) => ({
    items: [{listId: 1}, {listId: 2}, {listId: 3}]
}));

const ItemsList = (props) => {
    if (props.items.every(item => item.request.networkStatus === 'success')) {
        return (
            <ul>
                {props.items.map(item => (<li>{item.data.title}</li>))}
            </ul>
        );
    }
    return <p>Loading...</p>;
}

export default connectApiData(ItemsList);
```
