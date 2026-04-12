import { createBuilder, ContainerLifetime } from './.modules/aspire.js';

const builder = await createBuilder();

const mongo = await builder.addMongoDB('mongo');
mongo.withLifetime(ContainerLifetime.Persistent);
const mongodb = await mongo.addDatabase('mongodb');

const api = await builder.addJavaScriptApp('api', '../../api');
api.withHttpEndpoint({ port: 4000, env: 'PORT' });
api.withReference(mongodb);
api.waitFor(mongodb);

const fe = await builder.addJavaScriptApp('fe', '../../fe');
fe.withHttpEndpoint({ port: 5173, env: 'VITE_PORT' });
fe.withReference(api);

await builder.build().run();