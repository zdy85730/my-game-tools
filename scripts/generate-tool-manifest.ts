import { fileURLToPath } from 'node:url';

import { writeToolManifest } from './tool-registry';

const rootDir = fileURLToPath(new URL('../', import.meta.url));

await writeToolManifest(rootDir);
