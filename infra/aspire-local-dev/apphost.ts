import { createBuilder, ContainerLifetime } from './.modules/aspire.js';

const builder = await createBuilder();

const mongo = await builder.addMongoDB('mongo').withImage('mongo', { tag: '7' });
const mongodb = await mongo.addDatabase('mongodb');

const api = await builder.addJavaScriptApp('api', '../../api');
api.withHttpEndpoint({ env: 'PORT' });
api.withReference(mongodb);
api.waitFor(mongodb);

const fe = await builder.addJavaScriptApp('fe', '../../fe');
fe.withHttpEndpoint({ env: 'VITE_PORT' });
fe.withReference(api);

await builder.build().run();