/* global fetch */
/* eslint-disable camelcase */

import TruffleContract from 'truffle-contract'

import Market from '@oceanprotocol/keeper-contracts/build/contracts/OceanMarket'
import Auth from '@oceanprotocol/keeper-contracts/build/contracts/OceanAuth'
import { dbNamespace } from '../config'

const DEFAULT_GAS = 300 * 1000

export function getOceanBackendURL(providers) {
    const { web3, ocnURL } = providers
    return ocnURL + '/assets'
}

export async function deployContracts(provider) {
    const market = TruffleContract(Market)
    market.setProvider(provider)
    const acl = TruffleContract(Auth)
    acl.setProvider(provider)
    let contracts = {
        market: await market.deployed(),
        acl: await acl.deployed()
    }
    console.log("market and acl contracts: ", contracts)
    return contracts
}

export async function publish(asset, market_contract, account, provider) {
    const { web3, ocnURL } = provider

    let account_address = account.name
    let assetId = ''
    // First, register on the keeper (on-chain)
    try {
        const id_str = asset.name + asset.description
        await market_contract.requestTokens(2000, { from: account_address})
        // try {
        //     let value = await market_contract.tokenBalance({from: account_address})
        //     console.log("balance: ", value)
        // } catch (e) {
        //     // await market_contract.requestTokens(2000, { from: account_address})
        //     // let value = await market_contract.tokenBalance({from: account_address})
        //
        //     console.log('got error calling market.tokenBalance', e.toString())
        // }

        assetId = await market_contract.generateId(id_str)
        console.log("about to do market.register: ", assetId, asset.price, account_address)
        await market_contract.register(
            assetId,
            asset.price, // price is zero for now.
            { from: account_address, gas: DEFAULT_GAS }
        )

    } catch (e) {
        console.error("Error registering the asset on-chain:", e)
        return
    }

    // Now register in oceandb and publish the metadata
    // prepare the asset json payload
    asset.id = assetId
    asset.publisher = account_address
    var jAsset = JSON.stringify({
        "metadata": {
            "name": asset.name,
            "description": asset.description,
            "links": asset.links,
            "format": asset.format,
            "size": asset.size
        },
        "assetId": asset.id,
        "publisherId": asset.publisher
    })
    console.log('newasset to publish: ', jAsset, asset)
    let ocean_register_resource_url = getOceanBackendURL(provider) + '/metadata'
    fetch(ocean_register_resource_url, {
        method: 'POST',
        body: jAsset,
        headers: { 'Content-type': 'application/json' }
    }).then(res => res.json())
    .catch(error => console.error('Error:', error))
    .then(response => console.log('Success:', response))

}

export async function updateMetadata(asset, account, providers) {
    const { web3, ocean_backend } = providers

    // get provider-backend url
    let update_url = ocean_backend.api_url + '/assets/metadata'
    fetch(update_url, {
        method: 'PUT',
        body: JSON.stringify(asset),
        headers: { 'Content-type': 'application/json' }
    }).then(res => res.json())
        .catch(error => console.error('Error:', error))
        .then(response => console.log('Success:', response))
}

export async function purchaseResource(asset, account, providers) {
    const { web3, db } = providers

    // TODO:
    // trigger purchaseResource on OceanAccessControl contract
    // listen to `resourcePurchaseAgreementPublished`
    // Once the purchase agreement is fetched, display to the user to get confirmation to proceed with purchase
    // When agreement accepted by consumer, pat the purchase price and continue with the purchase transaction
    // ...
}

export async function list(contract, account, providers, own_assets_only=false) {
    // const { db } = providers

    // let assetIdToAsset = {}
    let ocean_get_resource_ids_url = getOceanBackendURL(providers) + '/metadata'
    console.log('provider url: ', ocean_get_resource_ids_url)
    var dbAssets = JSON.parse(await fetch(ocean_get_resource_ids_url, { method: 'GET' }).then( data => {return data.json()}))
    console.log('assets: ', dbAssets)
    dbAssets = Object.values(dbAssets)

    let filteredAssets = []
    for (var asset of dbAssets) {
        let valid = true//await contract.checkAsset(asset.assetId)
        if (valid) {
            filteredAssets.push(asset)
        }
    }
    dbAssets = filteredAssets

    function myOwn(asset) {
        console.log("account: ", account.name)
        console.log("publisher: ", asset.publisherId)
        return asset.publisherId === account.name
    }
    if (account) {
        dbAssets = dbAssets.filter(myOwn)
    }

    if (!!dbAssets) {
        return Object.values(dbAssets).map( (dbAsset) => ({
            ...dbAsset.metadata,
            id: dbAsset.assetId,
            publisher: dbAsset.publisherId,
            date: "",
            url: "",
            stats: {
                change: '+4.5%',
                accepted: '52%',
                rejected: '32.8%',
                challenged: '3',
                purchased: '142'
            },
            price: 0.0,
            // date: (new Date(dbAsset.metadata.date)).toLocaleDateString('en-US'),

        }))
    } else {
        return {};
    }


    // assetIdToAsset = response
    // console.log('asset ids: ', assetIdToAsset)
    // return response
    // let dbAssets = await db.models.ocean.retrieve(dbNamespace)
    // if (own_assets_only && account) {
    //     const act_str = account.name
    //     dbAssets = dbAssets.filter(obj => obj.data.web3.account === act_str)
    //     console.log('num assets for current account: ' + dbAssets.length + '>>>>  ' + act_str)
    // }
    //
    // // console.log("num all assets: " + dbAssets.length + '>>>>  ' + act_str)
    //
    // return dbAssets.map(dbAsset => ({
    //     ...dbAsset.data.value,
    //     id: dbAsset.data.web3.id,
    //     publisher: dbAsset.data.web3.account,
    //     published: web3AssetIds.indexOf(dbAsset.data.web3.id) > -1,
    //     web3Id: dbAsset.data.web3.id,
    //     date: (new Date(dbAsset.data.value.date)).toLocaleDateString('en-US'),
    //     dbId: dbAsset.assetId
    // }))
}

export async function purchase(assetId, contract, account, providers) {
    const { web3 } = providers

    await contract.purchase(
        assetId,
        { from: account.name, gas: 200000 }
    )

    const token = web3.toAscii(await contract.getAssetToken(assetId))

    // const dbAssetRetrieved = await db.models.ocean.retrieve(token)[0]
    return token
}
