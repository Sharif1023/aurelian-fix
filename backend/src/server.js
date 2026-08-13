import app from './app.js';
import { env } from './config/env.js';
import { testDatabase } from './config/db.js';
await testDatabase();
app.listen(env.port,()=>console.log(`SHARUU API running on http://localhost:${env.port}`));
