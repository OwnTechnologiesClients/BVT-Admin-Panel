"use client";

import React, { useState } from "react";
import { Badge, Button } from "@/components/ui";
import { Eye, Edit, Trash2, Plus, Filter, Search, Download } from "lucide-react";

const DataTable = ({ 
  title, 
  description, 
  data, 
  columns, 
  searchPlaceholder = "Search...",
  onAdd,
  onEdit,
  onDelete,
  onView,
  filters = [],
  stats = []
}) => {
  const [searchTerm, setSearchTerm] = useState("");
  const [activeFilters, setActiveFilters] = useState({});

  const filteredData = data.filter(item => {
    const matchesSearch = Object.values(item).some(value => 
      String(value).toLowerCase().includes(searchTerm.toLowerCase())
    );
    
    const matchesFilters = Object.entries(activeFilters).every(([key, value]) => 
      !value || item[key] === value
    );
    
    return matchesSearch && matchesFilters;
  });

  const handleFilterChange = (filterKey, value) => {
    setActiveFilters(prev => ({
      ...prev,
      [filterKey]: value === "All" ? "" : value
    }));
  };

  return (
    <div className="space-y-6">
      {/* Header with Actions */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">{title}</h2>
          <p className="text-gray-600">{description}</p>
        </div>
        <div className="flex items-center gap-3">
          <Button variant="outline" className="flex items-center gap-2">
            <Download className="w-4 h-4" />
            Export
          </Button>
          {onAdd && (
            <Button variant="primary" onClick={onAdd} className="flex items-center gap-2">
              <Plus className="w-4 h-4" />
              Add New
            </Button>
          )}
        </div>
      </div>

      {/* Statistics Cards */}
      {stats.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          {stats.map((stat, index) => (
            <div key={index} className="bg-white p-4 rounded-lg border border-gray-200">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">{stat.label}</p>
                  <p className={`text-2xl font-bold ${stat.color || 'text-gray-900'}`}>
                    {stat.value}
                  </p>
                </div>
                <div className={`w-8 h-8 ${stat.bgColor || 'bg-blue-100'} rounded-lg flex items-center justify-center`}>
                  <span className={`${stat.iconColor || 'text-blue-600'} font-semibold`}>
                    {stat.icon}
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Filters and Search */}
      <div className="bg-white p-4 rounded-lg border border-gray-200">
        <div className="flex flex-col lg:flex-row gap-4">
          {/* Search */}
          <div className="flex-1">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
              <input
                type="text"
                placeholder={searchPlaceholder}
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
          </div>

          {/* Dynamic Filters */}
          {filters.map((filter, index) => (
            <div key={index} className="lg:w-64">
              <select
                value={activeFilters[filter.key] || ""}
                onChange={(e) => handleFilterChange(filter.key, e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="">All {filter.label}</option>
                {filter.options.map(option => (
                  <option key={option} value={option}>
                    {option}
                  </option>
                ))}
              </select>
            </div>
          ))}

          {/* Additional Filters Button */}
          <Button variant="outline" className="flex items-center gap-2">
            <Filter className="w-4 h-4" />
            More Filters
          </Button>
        </div>
      </div>

      {/* Data Table */}
      <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                {columns.map((column, index) => (
                  <th key={index} className="text-left py-3 px-4 font-medium text-gray-700">
                    {column.label}
                  </th>
                ))}
                <th className="text-left py-3 px-4 font-medium text-gray-700">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredData.map((item, index) => (
                <tr key={item.id || index} className="border-b border-gray-100 hover:bg-gray-50">
                  {columns.map((column, colIndex) => (
                    <td key={colIndex} className="py-4 px-4">
                      {column.render ? column.render(item[column.key], item) : item[column.key]}
                    </td>
                  ))}
                  <td className="py-4 px-4">
                    <div className="flex items-center gap-2">
                      {onView && (
                        <Button 
                          variant="outline" 
                          size="sm" 
                          onClick={() => onView(item)}
                          className="text-gray-700 hover:text-gray-900"
                          title="View Details"
                        >
                          <Eye className="w-4 h-4" />
                        </Button>
                      )}
                      {onEdit && (
                        <Button 
                          variant="outline" 
                          size="sm" 
                          onClick={() => onEdit(item)}
                          className="text-gray-700 hover:text-gray-900"
                          title="Edit"
                        >
                          <Edit className="w-4 h-4" />
                        </Button>
                      )}
                      {onDelete && (
                        <Button 
                          variant="outline" 
                          size="sm" 
                          onClick={() => onDelete(item)}
                          className="text-red-600 hover:text-red-700"
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        <div className="bg-gray-50 px-4 py-3 border-t border-gray-200">
          <div className="flex items-center justify-between">
            <div className="text-sm text-gray-700">
              Showing {filteredData.length} of {data.length} items
            </div>
            <div className="flex items-center gap-2">
              <Button variant="outline" size="sm" disabled>Previous</Button>
              <Button variant="primary" size="sm">1</Button>
              <Button variant="outline" size="sm">2</Button>
              <Button variant="outline" size="sm">3</Button>
              <Button variant="outline" size="sm">Next</Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DataTable;
