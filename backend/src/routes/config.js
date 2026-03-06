import { Router } from 'express';

const router = Router();

router.get('/', (_req, res) => {
  res.json({
    liffId: process.env.LIFF_ID || '',
    lineOaId: process.env.LINE_OA_ID || '',
  });
});

export default router;
