"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Button, Badge } from "@/components/ui";
import { Plus, Trash2, Edit, Loader2 } from "lucide-react";
import * as categoryAPI from "@/lib/api/courseCategory";

const CategoryManager = () => {
  const router = useRouter();
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [editingCategory, setEditingCategory] = useState(null);
  const [saving, setSaving] = useState(false);

  // Fetch categories
  const fetchCategories = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await categoryAPI.getAllCategories({ limit: 100 });
      if (response.success) {
        setCategories(response.data || []);
      }
    } catch (err) {
      console.error('Error fetching categories:', err);
      setError(err.message || 'Failed to fetch categories');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCategories();
  }, []);

  const generateSlug = (name) => {
    return name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
  };

  const handleCreateCategory = async () => {
    const newCategory = {
      name: "",
      slug: "",
      description: "",
      isActive: true
    };
    setCategories([...categories, { ...newCategory, _id: `temp-${Date.now()}`, isNew: true }]);
    setEditingCategory(`temp-${Date.now()}`);
  };

  const handleSaveCategory = async (category) => {
    if (!category.name || !category.description) {
      alert('Please provide name and description');
      return;
    }

    try {
      setSaving(true);
      const categoryData = {
        name: category.name.trim(),
        slug: category.slug || generateSlug(category.name),
        description: category.description,
        isActive: category.isActive !== undefined ? category.isActive : true
      };

      if (category.isNew) {
        // Create new category
        const response = await categoryAPI.createCategory(categoryData);
        if (response.success) {
          await fetchCategories();
          setEditingCategory(null);
        }
      } else {
        // Update existing category
        const response = await categoryAPI.updateCategory(category._id, categoryData);
        if (response.success) {
          await fetchCategories();
          setEditingCategory(null);
        }
      }
    } catch (err) {
      alert(err.message || 'Failed to save category');
    } finally {
      setSaving(false);
    }
  };

  const handleDeleteCategory = async (categoryId) => {
    if (!confirm('Are you sure you want to delete this category?')) {
      return;
    }

    try {
      const response = await categoryAPI.deleteCategory(categoryId);
      if (response.success) {
        await fetchCategories();
      }
    } catch (err) {
      alert(err.message || 'Failed to delete category');
    }
  };

  const updateCategoryLocal = (categoryId, field, value) => {
    setCategories(categories.map(category => 
      category._id === categoryId || category.id === categoryId
        ? { ...category, [field]: value }
        : category
    ));
  };

  const handleNameChange = (categoryId, name) => {
    updateCategoryLocal(categoryId, 'name', name);
    updateCategoryLocal(categoryId, 'slug', generateSlug(name));
  };

  const sortedCategories = [...categories].sort((a, b) => a.name.localeCompare(b.name));

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-semibold text-gray-900">Course Categories</h3>
          <p className="text-gray-600">Manage course categories</p>
        </div>
        <Button
          onClick={handleCreateCategory}
          className="flex items-center gap-2"
          variant="primary"
        >
          <Plus className="w-4 h-4" />
          Add Category
        </Button>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <p className="text-red-600 text-sm">{error}</p>
        </div>
      )}

      <div className="space-y-4">
        {sortedCategories.map((category) => {
          const categoryId = category._id || category.id;
          const isEditing = editingCategory === categoryId;
          
          return (
            <div key={categoryId} className="border border-gray-200 rounded-lg p-6">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-3">
                  {isEditing ? (
                    <input
                      type="text"
                      value={category.name || ''}
                      onChange={(e) => handleNameChange(categoryId, e.target.value)}
                      className="text-lg font-semibold text-gray-900 border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      placeholder="Category name"
                    />
                  ) : (
                    <h4 className="text-lg font-semibold text-gray-900">{category.name}</h4>
                  )}
                  <Badge color={category.isActive ? "success" : "error"}>
                    {category.isActive ? "Active" : "Inactive"}
                  </Badge>
                </div>
                <div className="flex items-center gap-2">
                  {isEditing ? (
                    <>
                      <Button
                        variant="primary"
                        size="sm"
                        onClick={() => handleSaveCategory(category)}
                        disabled={saving}
                        className="flex items-center gap-2"
                      >
                        {saving ? (
                          <Loader2 className="w-4 h-4 animate-spin" />
                        ) : (
                          'Save'
                        )}
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => {
                          if (category.isNew) {
                            setCategories(categories.filter(c => c._id !== categoryId && c.id !== categoryId));
                          }
                          setEditingCategory(null);
                        }}
                        disabled={saving}
                      >
                        Cancel
                      </Button>
                    </>
                  ) : (
                    <>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setEditingCategory(categoryId)}
                      >
                        <Edit className="w-4 h-4" />
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleDeleteCategory(categoryId)}
                        className="text-red-600 hover:text-red-700"
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </>
                  )}
                </div>
              </div>

              {isEditing && (
                <div className="space-y-3">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Slug
                    </label>
                    <input
                      type="text"
                      value={category.slug || ''}
                      onChange={(e) => updateCategoryLocal(categoryId, 'slug', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      placeholder="category-slug"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Description
                    </label>
                    <textarea
                      value={category.description || ''}
                      onChange={(e) => updateCategoryLocal(categoryId, 'description', e.target.value)}
                      rows={3}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      placeholder="Category description"
                    />
                  </div>

                  <div className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      checked={category.isActive !== undefined ? category.isActive : true}
                      onChange={(e) => updateCategoryLocal(categoryId, 'isActive', e.target.checked)}
                      className="rounded"
                    />
                    <label className="text-sm text-gray-700">Active</label>
                  </div>
                </div>
              )}

              {!isEditing && (
                <div>
                  <p className="text-sm text-gray-600 mb-2">
                    <span className="font-medium">Slug:</span> {category.slug}
                  </p>
                  <p className="text-sm text-gray-600">
                    {category.description}
                  </p>
                </div>
              )}
            </div>
          );
        })}
      </div>

      {categories.length === 0 && !loading && (
        <div className="text-center py-12 text-gray-500">
          <p>No categories found. Click "Add Category" to create one.</p>
        </div>
      )}
    </div>
  );
};

export default CategoryManager;
