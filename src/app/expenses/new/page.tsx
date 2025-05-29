import { ExpenseForm } from "@/components/expense-form";

export default function NewExpensePage() {
  return (
    <div className="space-y-8">
      <div className="flex flex-col space-y-2">
        <h1 className="text-4xl font-bold tracking-tight bg-gradient-to-r from-primary to-primary/70 bg-clip-text text-transparent">
          Add New Expense
        </h1>
        <p className="text-muted-foreground">
          Create a new expense by filling out the form below.
        </p>
      </div>

      <div className="pt-2 max-w-3xl">
        <ExpenseForm />
      </div>
    </div>
  );
}
