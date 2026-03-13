import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import cookieParser from 'cookie-parser';
import { initDb } from './db.js';

import configRouter from './routes/config.js';
import visitRouter from './routes/visit.js';
import linkRouter from './routes/link.js';
import preFollowRouter from './routes/preFollow.js';
import webhookRouter from './routes/webhook.js';
import authRouter from './routes/auth.js';
import dashboardRouter from './routes/dashboard.js';
import customersRouter from './routes/customers.js';
import messagesRouter from './routes/messages.js';
import ordersRouter from './routes/orders.js';
import templatesRouter from './routes/templates.js';
import accountTypesRouter from './routes/accountTypes.js';
import cronRouter from './routes/cron.js';
import devToolsRouter from './routes/devTools.js';
import landingBlocksRouter from './routes/landingBlocks.js';
import siteConfigRouter from './routes/siteConfig.js';

const app = express();
const PORT = process.env.PORT || 3101;

app.use(cors({ origin: true, credentials: true }));
app.use(cookieParser());

// LINE webhook needs raw body for signature verification
app.use('/line/webhook', express.raw({ type: 'application/json' }));

app.use(express.json({ limit: '20mb' }));

// Public routes
app.use('/api/config', configRouter);
app.use('/api/landing-blocks', landingBlocksRouter);
app.use('/api/site-config', siteConfigRouter);
app.use('/api/visit', visitRouter);
app.use('/api/link', linkRouter);
app.use('/api/pre-follow', preFollowRouter);
app.use('/line/webhook', webhookRouter);

// Auth routes
app.use('/api/auth', authRouter);

// Admin routes
app.use('/api/dashboard', dashboardRouter);
app.use('/api/customers', customersRouter);
app.use('/api/messages', messagesRouter);
app.use('/api/orders', ordersRouter);
app.use('/api/templates', templatesRouter);
app.use('/api/account-types', accountTypesRouter);

// Cron routes
app.use('/api/cron', cronRouter);

// Dev tools
app.use('/api/dev', devToolsRouter);

app.get('/health', (_req, res) => res.json({ ok: true }));

initDb()
  .then(() => {
    app.listen(PORT, () => console.log(`[server] Listening on :${PORT}`));
  })
  .catch((err) => {
    console.error('[server] DB init failed:', err);
    process.exit(1);
  });
