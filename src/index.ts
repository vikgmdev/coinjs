import { FullNode } from './node';

const node = new FullNode();

(async () => {
    await node.ensure();
    await node.open();
    await node.connect();
    node.startSync();
})().catch(err => {
    console.error(err.stack);
    process.exit(1);
});
