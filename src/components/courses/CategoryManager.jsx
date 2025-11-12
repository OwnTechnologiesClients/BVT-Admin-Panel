"use client";

import React, { useState } from "react";
import { Button, Badge } from "@/components/ui";
import { Plus, Trash2, Edit, ArrowRight } from "lucide-react";

const CategoryManager = () => {
  const [categories, setCategories] = useState([
    {
      id: 1,
      name: "Marine Engineering",
      slug: "marine-engineering",
      description: "Courses related to marine engineering and ship systems",
      parentCategory: null,
      order: 1,
      image: "",
      isActive: true
    },
    {
      id: 2,
      name: "Propulsion Systems",
      slug: "propulsion-systems",
      description: "Marine propulsion and engine systems",
      parentCategory: 1,
      order: 1,
      image: "",
      isActive: true
    },
    {
      id: 3,
      name: "Navigation",
      slug: "navigation",
      description: "Navigation systems and GPS technologies",
      parentCategory: null,
      order: 2,
      image: "",
      isActive: true
    },
    {
      id: 4,
      name: "Maritime Safety",
      slug: "maritime-safety",
      description: "Safety protocols and emergency procedures",
      parentCategory: null,
      order: 3,
      image: "",
      isActive: true
    }
  ]);

  const [editingCategory, setEditingCategory] = useState(null);

  const addCategory = () => {
    const newCategory = {
      id: categories.length + 1,
      name: "",
      slug: "",
      description: "",
      parentCategory: null,
      order: categories.length + 1,
      image: "",
      isActive: true
    };
    setCategories([...categories, newCategory]);
    setEditingCategory(newCategory.id);
  };

  const updateCategory = (categoryId, field, value) => {
    setCategories(categories.map(category => 
      category.id === categoryId 
        ? { ...category, [field]: value }
        : category
    ));
  };

  const deleteCategory = (categoryId) => {
    // Check if category has subcategories
    const hasSubcategories = categories.some(cat => cat.parentCategory === categoryId);
    if (hasSubcategories) {
      alert("Cannot delete category with subcategories. Please delete subcategories first.");
      return;
    }
    setCategories(categories.filter(category => category.id !== categoryId));
  };

  const generateSlug = (name) => {
    return name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
  };

  const handleNameChange = (categoryId, name) => {
    updateCategory(categoryId, 'name', name);
    updateCategory(categoryId, 'slug', generateSlug(name));
  };

  const getParentCategories = (currentId) => {
    return categories.filter(cat => 
      cat.id !== currentId && 
      cat.parentCategory === null && 
      cat.isActive
    );
  };

  const getSubcategories = (parentId) => {
    return categories.filter(cat => cat.parentCategory === parentId);
  };

  const mainCategories = categories.filter(cat => cat.parentCategory === null);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-semibold text-gray-900">Course Categories</h3>
          <p className="text-gray-600">Manage course categories and subcategories</p>
        </div>
        <Button
          onClick={addCategory}
          className="flex items-center gap-2"
        >
          <Plus className="w-4 h-4" />
          Add Category
        </Button>
      </div>

      <div className="space-y-4">
        {mainCategories.map((category) => (
          <div key={category.id} className="border border-gray-200 rounded-lg p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-3">
                <span className="text-sm font-medium text-gray-500">
                  Category {category.order}
                </span>
                <input
                  type="text"
                  value={category.name}
                  onChange={(e) => handleNameChange(category.id, e.target.value)}
                  className="text-lg font-semibold text-gray-900 bg-transparent border-none focus:ring-0 p-0"
                  placeholder="Category name"
                />
              </div>
              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setEditingCategory(category.id)}
                >
                  <Edit className="w-4 h-4" />
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => deleteCategory(category.id)}
                  className="text-red-600 hover:text-red-700"
                >
                  <Trash2 className="w-4 h-4" />
                </Button>
              </div>
            </div>

            <div className="space-y-3">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Slug
                  </label>
                  <input
                    type="text"
                    value={category.slug}
                    onChange={(e) => updateCategory(category.id, 'slug', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    placeholder="category-slug"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Order
                  </label>
                  <input
                    type="number"
                    value={category.order}
                    onChange={(e) => updateCategory(category.id, 'order', parseInt(e.target.value))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    min="1"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Description
                </label>
                <textarea
                  value={category.description}
                  onChange={(e) => updateCategory(category.id, 'description', e.target.value)}
                  rows={3}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  placeholder="Category description"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Image URL
                </label>
                <input
                  type="text"
                  value={category.image}
                  onChange={(e) => updateCategory(category.id, 'image', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  placeholder="https://example.com/image.jpg"
                />
              </div>

              <div className="flex items-center gap-4">
                <div className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    checked={category.isActive}
                    onChange={(e) => updateCategory(category.id, 'isActive', e.target.checked)}
                    className="rounded"
                  />
                  <label className="text-sm text-gray-700">Active</label>
                </div>
              </div>
            </div>

            {/* Subcategories */}
            {getSubcategories(category.id).length > 0 && (
              <div className="mt-6 pt-6 border-t border-gray-200">
                <h4 className="font-medium text-gray-700 mb-4">Subcategories</h4>
                <div className="space-y-3">
                  {getSubcategories(category.id).map((subcategory) => (
                    <div key={subcategory.id} className="bg-gray-50 rounded-lg p-4">
                      <div className="flex items-center justify-between mb-3">
                        <div className="flex items-center gap-3">
                          <ArrowRight className="w-4 h-4 text-gray-400" />
                          <input
                            type="text"
                            value={subcategory.name}
                            onChange={(e) => handleNameChange(subcategory.id, e.target.value)}
                            className="font-medium text-gray-900 bg-transparent border-none focus:ring-0 p-0"
                            placeholder="Subcategory name"
                          />
                        </div>
                        <div className="flex items-center gap-2">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => setEditingCategory(subcategory.id)}
                          >
                            <Edit className="w-4 h-4" />
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => deleteCategory(subcategory.id)}
                            className="text-red-600 hover:text-red-700"
                          >
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </div>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                        <input
                          type="text"
                          value={subcategory.slug}
                          onChange={(e) => updateCategory(subcategory.id, 'slug', e.target.value)}
                          className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                          placeholder="subcategory-slug"
                        />
                        <input
                          type="number"
                          value={subcategory.order}
                          onChange={(e) => updateCategory(subcategory.id, 'order', parseInt(e.target.value))}
                          className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                          placeholder="Order"
                          min="1"
                        />
                      </div>

                      <textarea
                        value={subcategory.description}
                        onChange={(e) => updateCategory(subcategory.id, 'description', e.target.value)}
                        rows={2}
                        className="w-full mt-3 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        placeholder="Subcategory description"
                      />
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};

export default CategoryManager;