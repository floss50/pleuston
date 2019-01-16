import React from 'react'
import ReactDOM from 'react-dom'
import { Logger } from '@oceanprotocol/squid'

import thunk from 'redux-thunk'

import { Provider } from 'react-redux'
import { createStore, applyMiddleware } from 'redux'
import { composeWithDevTools } from 'redux-devtools-extension'

import { createBrowserHistory } from 'history'
import {
    ConnectedRouter as Router,
    routerMiddleware
} from 'connected-react-router'

import { Web3Provider } from 'react-web3'
import Web3Unavailable from './components/Account/Web3Unavailable'
import Web3AccountUnavailable from './components/Account/Web3AccountUnavailable'

import appReducer from './reducers'
import {
    getAccounts,
    getAssets,
    setProviders,
    setNetworkName
} from './actions/index'

import App from './App'
import * as serviceWorker from './serviceWorker'

import * as Web3 from 'web3'

// Replace the old injected version by the new local
if (window.web3) {
    window.web3 = new Web3(window.web3.currentProvider)
}

const history = createBrowserHistory()

const store = createStore(
    appReducer(history),
    composeWithDevTools(
        applyMiddleware(
            routerMiddleware(history), // for dispatching history actions
            thunk
        )
    )
)

serviceWorker.register()

window.addEventListener('load', async () => {
    Logger.log('booting up pleuston')
    store.dispatch(setProviders())
        .then(() => {
            store.dispatch(setNetworkName())
            store.dispatch(getAccounts())
                .then(() => {
                    // store.dispatch(getOrders())
                    store.dispatch(getAssets())
                })
        })
})

ReactDOM.render(
    <Provider store={store}>
        <Web3Provider
            onChangeAccount={() => store.dispatch(getAccounts())}
            web3UnavailableScreen={() => <Web3Unavailable />}
            accountUnavailableScreen={() => <Web3AccountUnavailable />}
        >
            <Router history={history}>
                <App />
            </Router>
        </Web3Provider>
    </Provider>,
    document.getElementById('root')
)
