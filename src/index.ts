import { FullNode } from './node';

const node = new FullNode();

(async () => {
    await node.connect();
})().catch(err => {
    console.error(err.stack);
    process.exit(1);
});
