import { Request } from 'express';
import csvService from '../services/csvService';
import normalizeService from '../services/normalizeService';
import batchService from '../services/batchService';
import aiService from '../services/aiService';
import validationService from '../services/validationService';

export class ImportController {
  async handleImport(req: Request) {
    const requestId = (req as any).requestId || 'unknown';
    const payload = req.body.records ?? null;
    console.info(`[import:${requestId}] handleImport entered`, {
      hasPayload: Boolean(payload),
      hasUploadedFile: Boolean(req.file),
      payloadCount: Array.isArray(payload) ? payload.length : null,
    });

    // If file uploaded via multipart, parse
    if (!payload && req.file) {
      const text = req.file.buffer.toString('utf8');
      console.info(`[import:${requestId}] parsing uploaded CSV`, {
        bytes: req.file.size,
      });
      const parsed = await csvService.parseCsv(text);
      // parsed is array of records
      console.info(`[import:${requestId}] csv parsed`, {
        rows: parsed.length,
        columns: parsed[0] ? Object.keys(parsed[0]) : [],
      });
      return this.processRecords(parsed, requestId);
    }

    if (!payload) {
      console.warn(`[import:${requestId}] missing records payload and file upload`);
      throw new Error('No records provided');
    }

    console.info(`[import:${requestId}] processing body records`, {
      rows: payload.length,
    });
    return this.processRecords(payload, requestId);
  }

  private async processRecords(records: any[], requestId: string) {
    console.info(`[import:${requestId}] processRecords start`, {
      incomingRows: records.length,
    });

    const normalized = normalizeService.normalizeRecords(records);
    const batches = batchService.splitIntoBatches(normalized, 5); // Changed batch size to 5
    console.info(`[import:${requestId}] records normalized and batched`, {
      normalizedRows: normalized.length,
      batchCount: batches.length,
      batchSize: 5, // Updated batch size in log
    });

    let imported = 0;
    const skippedRecords: any[] = [];
    const results: any[] = [];

    const start = Date.now();

    for (let batchIndex = 0; batchIndex < batches.length; batchIndex += 1) {
      const batch = batches[batchIndex];
      console.info(`[import:${requestId}] processing batch`, {
        batchIndex: batchIndex + 1,
        batchRows: batch.length,
      });

      const aiResults = await aiService.processBatch(batch, requestId, batchIndex + 1);
      console.info(`[import:${requestId}] batch completed`, {
        batchIndex: batchIndex + 1,
        aiResults: aiResults.length,
      });

      for (let i = 0; i < aiResults.length; i++) {
        const aiOut = aiResults[i];
        const valid = validationService.validateRecord(aiOut);
        if (valid.isValid) {
          imported++;
          results.push(aiOut);
        } else {
          console.warn(`[import:${requestId}] record failed validation`, {
            batchIndex: batchIndex + 1,
            rowIndex: i + 1,
            reason: valid.reason,
            record: aiOut,
          });
          skippedRecords.push({ record: batch[i], reason: valid.reason });
        }
      }
    }

    const end = Date.now();

    console.info(`[import:${requestId}] processRecords complete`, {
      imported,
      skipped: skippedRecords.length,
      processingTimeMs: end - start,
    });

    return {
      success: true,
      imported,
      skipped: skippedRecords.length,
      records: results,
      skippedRecords,
      processingTimeMs: end - start,
    };
  }
}

export default new ImportController();
