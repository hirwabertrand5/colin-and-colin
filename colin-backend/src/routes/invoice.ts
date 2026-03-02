import express from 'express';
import { getInvoicesForCase, addInvoiceToCase, uploadProof } from '../controllers/invoiceController';
import { authenticate } from '../middleware/authMiddleware';
import { upload } from '../controllers/documentController'; // reuse multer config

const router = express.Router();

// Optional: quick sanity check (remove after confirmation)
if (
  typeof authenticate !== 'function' ||
  typeof getInvoicesForCase !== 'function' ||
  typeof addInvoiceToCase !== 'function' ||
  typeof uploadProof !== 'function' ||
  !upload ||
  typeof (upload as any).single !== 'function'
) {
  throw new Error(
    `Invoice routes misconfigured: ${JSON.stringify({
      authenticate: typeof authenticate,
      getInvoicesForCase: typeof getInvoicesForCase,
      addInvoiceToCase: typeof addInvoiceToCase,
      uploadProof: typeof uploadProof,
      upload: typeof upload,
      uploadSingle: typeof (upload as any)?.single,
    })}`
  );
}

router.get('/cases/:caseId/invoices', authenticate, getInvoicesForCase);
router.post('/cases/:caseId/invoices', authenticate, addInvoiceToCase);
router.post('/invoices/:invoiceId/proof', authenticate, upload.single('file'), uploadProof);

export default router;