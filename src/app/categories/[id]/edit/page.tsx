"use client";

import { CategoryForm } from "@/components/category-form";
import { useParams } from "next/navigation";

export default function EditCategoryPage() {
  const params = useParams();
  const categoryId = params.id as string;

  return (
    <div className="space-y-8">
      <div className="flex flex-col space-y-2">
        <h1 className="text-4xl font-bold tracking-tight bg-gradient-to-r from-primary to-primary/70 bg-clip-text text-transparent">
          Edit Category
        </h1>
        <p className="text-muted-foreground">
          Update the category details using the form below.
        </p>
      </div>

      <div className="pt-2 max-w-3xl">
        <CategoryForm categoryId={categoryId} />
      </div>
    </div>
  );
}
