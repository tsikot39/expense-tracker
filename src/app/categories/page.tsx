import { CategoryList } from "@/components/category-list";
import { Tag } from "lucide-react";

export default function CategoriesPage() {
  return (
    <div className="space-y-8">
      <div className="flex flex-col space-y-2">
        <h1 className="text-4xl font-bold tracking-tight bg-gradient-to-r from-primary to-primary/70 bg-clip-text text-transparent">
          Categories
        </h1>
        <p className="text-muted-foreground">
          Manage your expense categories to better organize and track your spending.
        </p>
      </div>

      <div className="pt-2">
        <div className="flex items-center mb-6">
          <Tag className="h-6 w-6 text-primary mr-3" />
          <h2 className="text-2xl font-semibold">All Categories</h2>
        </div>
        <CategoryList />
      </div>
    </div>
  );
}
