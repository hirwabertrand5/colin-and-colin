import mongoose, { Schema, Document } from 'mongoose';

export interface ICaseDocument extends Document {
  caseId: mongoose.Types.ObjectId;
  name: string;
  category: string;
  uploadedBy: string;
  uploadedDate: string;
  size: string;
  url: string;
}

const DocumentSchema = new Schema<ICaseDocument>(
  {
    caseId: { type: Schema.Types.ObjectId, ref: 'Case', required: true },
    name: { type: String, required: true },
    category: { type: String, required: true },
    uploadedBy: { type: String, required: true },
    uploadedDate: { type: String, required: true },
    size: { type: String, required: true },
    url: { type: String, required: true }, // For MVP, just store a string (can be a local path or S3 URL)
  },
  { timestamps: true }
);

export default mongoose.model<ICaseDocument>('Document', DocumentSchema);