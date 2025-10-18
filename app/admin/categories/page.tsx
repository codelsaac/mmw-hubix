import { CategoryManagement } from "@/components/admin/category-management";
import { requireAuth } from "@/lib/auth-server";
import { UserRole } from "@/lib/permissions";

export default async function AdminCategoriesPage() {
  await requireAuth([UserRole.ADMIN]);

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-2xl font-bold mb-4">Category Management</h1>
      <CategoryManagement />
    </div>
  );
}
