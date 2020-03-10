import { FullNode } from './node';

const port = Number(process.argv[2]);
const node = new FullNode(port);

(async (): Promise<void> => {
    await node.connect();
})().catch(err => {
    console.error(err.stack);
    process.exit(1);
});

// process.stdin.on('data', (data) => {
//     const nodes = node.pool.peers.list.toArray().map( item => ({
//         prev: item.prev?.value.address.hostname,
//         value: item.value?.address.hostname,
//         next: item.next?.value.address.hostname,
//     }));
//     console.log(nodes);
// })
