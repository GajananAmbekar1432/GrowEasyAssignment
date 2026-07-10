import { Router, Request, Response } from 'express';
import multer from 'multer';
import { ImportController } from '../controllers/importController';

const router = Router();
const upload = multer();
const controller = new ImportController();

router.post('/', upload.single('file'), async (req: Request, res: Response) => {
  const requestId = `${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 8)}`;
  (req as any).requestId = requestId;

  console.info(`[import:${requestId}] request started`, {
    hasFile: Boolean(req.file),
    hasBodyRecords: Boolean((req.body as any)?.records),
    contentType: req.headers['content-type'],
  });

  try {
    const result = await controller.handleImport(req);
    console.info(`[import:${requestId}] request completed`, {
      success: result?.success,
      imported: result?.imported,
      skipped: result?.skipped,
      processingTimeMs: result?.processingTimeMs,
    });
    res.json(result);
  } catch (err: any) {
    console.error(`[import:${requestId}] request failed`, {
      message: err?.message,
      stack: err?.stack,
    });
    res.status(500).json({ success: false, message: err.message || 'Import failed' });
  }
});

export default router;
