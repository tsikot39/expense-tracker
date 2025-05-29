import mongoose, { Schema, Document } from 'mongoose';

export interface IExpense extends Document {
  title: string;
  amount: number;
  date: Date;
  category: string;
  description?: string;
  user: mongoose.Types.ObjectId;
  createdAt: Date;
  updatedAt: Date;
}

const ExpenseSchema: Schema = new Schema(
  {
    title: { type: String, required: true },
    amount: { type: Number, required: true },
    date: { type: Date, required: true, default: Date.now },
    category: { type: String, required: true },
    description: { type: String },
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  },
  { timestamps: true }
);

export default mongoose.models.Expense || mongoose.model<IExpense>('Expense', ExpenseSchema);
