import cors from '@fastify/cors';
import Fastify from 'fastify';

const app = Fastify({
  logger: true,
});

await app.register(cors, {
  origin: true,
});

app.get('/healthz', async () => ({
  status: 'ok',
  service: 'sandbox-battle-lab',
}));

app.get('/api/loadouts', async () => ({
  items: [
    {
      id: '1',
      operator: 'Ranger-01',
      role: 'Assault',
      burst: 'High',
      survivability: 'Medium',
    },
    {
      id: '2',
      operator: 'Mist-09',
      role: 'Control',
      burst: 'Medium',
      survivability: 'High',
    },
    {
      id: '3',
      operator: 'Relay-22',
      role: 'Support',
      burst: 'Low',
      survivability: 'High',
    },
  ],
}));

const port = Number(process.env.PORT ?? 3301);
const host = process.env.HOST ?? '0.0.0.0';

await app.listen({ port, host });
