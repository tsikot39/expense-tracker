"use client";

import { ExpenseForm } from "@/components/expense-form";
import { useParams } from "next/navigation";

export default function EditExpensePage() {
  const params = useParams();
  const expenseId = params.id as string;

  return (
    <div className="space-y-8">
      <div className="flex flex-col space-y-2">
        <h1 className="text-4xl font-bold tracking-tight bg-gradient-to-r from-primary to-primary/70 bg-clip-text text-transparent">
          Edit Expense
        </h1>
        <p className="text-muted-foreground">
          Update the expense details using the form below.
        </p>
      </div>

      <div className="pt-2 max-w-3xl">
        <ExpenseForm expenseId={expenseId} />
      </div>
    </div>
  );
}
