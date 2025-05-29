import mongoose, { Schema, Document } from 'mongoose';

export interface ICategory extends Document {
  name: string;
  color?: string;
  icon?: string;
  user: mongoose.Types.ObjectId;
  createdAt: Date;
  updatedAt: Date;
}

const CategorySchema: Schema = new Schema(
  {
    name: { type: String, required: true },
    color: { type: String, default: '#6366F1' }, // Default indigo color
    icon: { type: String, default: 'tag' },
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  },
  { timestamps: true }
);

// Compound index for name and user to ensure uniqueness per user
CategorySchema.index({ name: 1, user: 1 }, { unique: true });

export default mongoose.models.Category || mongoose.model<ICategory>('Category', CategorySchema);
