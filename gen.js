const { Address, beginCell } = require('@ton/core');

// ===== ТВОЙ АДРЕС (КУДА ПЕРЕЙДЁТ NFT) =====
const newOwner = Address.parse('UQAGr7Su1HSSX1MCFIH9k8mEY6LinmP5Nsie7x0qreUigE5m');
const responseDestination = newOwner;

// ===== СОБИРАЕМ ЯЧЕЙКУ ПО СТАНДАРТУ TEP-62 (NFT TRANSFER) =====
const cell = beginCell()
    .storeUint(0x5fcc3d14, 32)      // op: transfer
    .storeUint(0, 64)                // query_id
    .storeAddress(newOwner)          // new_owner
    .storeAddress(responseDestination) // response_destination
    .storeBit(0)                     // custom_payload (пусто)
    .storeCoins(0)                   // forward_amount
    .storeBit(0)                     // forward_payload (пусто)
    .endCell();

// ===== ПОЛУЧАЕМ PAYLOAD В BASE64 =====
const payloadBase64 = cell.toBoc().toString('base64');
console.log(payloadBase64);
