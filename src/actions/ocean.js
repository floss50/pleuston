import {
    Ocean
} from '@oceanprotocol/squid'

import {
    keeperScheme,
    keeperHost,
    keeperPort,
    aquariusScheme,
    aquariusHost,
    aquariusPort,
    brizoScheme,
    brizoHost,
    brizoPort,
    parityScheme,
    parityHost,
    parityPort,
    secretStoreScheme,
    secretStoreHost,
    secretStorePort,
    threshold,
    password,
    address
} from '../../config/ocean'

export async function provideOcean() {
    const nodeUri = `${keeperScheme}://${keeperHost}:${keeperPort}`
    const aquariusUri = `${aquariusScheme}://${aquariusHost}:${aquariusPort}`
    const brizoUri = `${brizoScheme}://${brizoHost}:${brizoPort}`
    const parityUri = `${parityScheme}://${parityHost}:${parityPort}`
    const secretStoreUri = `${secretStoreScheme}://${secretStoreHost}:${secretStorePort}`

    const config = {
        // todo: change this when the new interface of metmask is released
        web3Provider: global.web3 ? global.web3.currentProvider : null,
        // this is just a fallback in case web3 is not injected
        nodeUri,
        aquariusUri,
        brizoUri,
        parityUri,
        secretStoreUri,
        threshold,
        password,
        address
    }

    const ocean = Ocean.getInstance ? await Ocean.getInstance(config) : await new Ocean(config)

    return { ocean }
}
