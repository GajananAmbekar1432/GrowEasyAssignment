import { Router } from 'express';
import importRouter from './import';

const router = Router();

router.use('/import', importRouter);

export default router;
