import mongoose, { Schema, Document } from 'mongoose';

export interface ICaseDocument extends Document {
  caseId: mongoose.Types.ObjectId;
  name: string;
  category?: string; // ✅ now optional
  uploadedBy: string;
  uploadedDate: string;
  size: string;
  url: string;
}

const DocumentSchema = new Schema<ICaseDocument>(
  {
    caseId: { type: Schema.Types.ObjectId, ref: 'Case', required: true },
    name: { type: String, required: true },

    
    category: { type: String, required: false },

    uploadedBy: { type: String, required: true },
    uploadedDate: { type: String, required: true },
    size: { type: String, required: true },
    url: { type: String, required: true },
  },
  { timestamps: true }
);

export default mongoose.model<ICaseDocument>('Document', DocumentSchema);