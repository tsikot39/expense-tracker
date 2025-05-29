import { CategoryForm } from "@/components/category-form";

export default function NewCategoryPage() {
  return (
    <div className="space-y-8">
      <div className="flex flex-col space-y-2">
        <h1 className="text-4xl font-bold tracking-tight bg-gradient-to-r from-primary to-primary/70 bg-clip-text text-transparent">
          Add New Category
        </h1>
        <p className="text-muted-foreground">
          Create a new expense category by filling out the form below.
        </p>
      </div>

      <div className="pt-2 max-w-3xl">
        <CategoryForm />
      </div>
    </div>
  );
}
