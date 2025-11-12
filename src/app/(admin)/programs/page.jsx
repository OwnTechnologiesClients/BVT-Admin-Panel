"use client";

import React, { useState } from "react";
import { PageBreadcrumb } from "@/components/common";
import { ProgramsTable } from "@/components/programs";
import { GraduationCap, Users, Award, Plus } from "lucide-react";

export default function ProgramsPage() {
  const [activeTab, setActiveTab] = useState("programs");

  const tabs = [
    {
      id: "programs",
      label: "Programs",
      icon: GraduationCap,
      component: ProgramsTable
    },
    {
      id: "participants",
      label: "Participants",
      icon: Users,
      component: () => <div className="text-center py-8 text-gray-500">Participants management coming soon...</div>
    },
    {
      id: "certifications",
      label: "Certifications",
      icon: Award,
      component: () => <div className="text-center py-8 text-gray-500">Certifications management coming soon...</div>
    }
  ];

  const ActiveComponent = tabs.find(tab => tab.id === activeTab)?.component;

  return (
    <div className="space-y-6">
      <PageBreadcrumb pageTitle="Programs Management" />
      
      {/* Tab Navigation */}
      <div className="bg-white rounded-lg border border-gray-200">
        <div className="border-b border-gray-200">
          <nav className="flex space-x-8 px-6" aria-label="Tabs">
            {tabs.map((tab) => {
              const Icon = tab.icon;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`py-4 px-1 border-b-2 font-medium text-sm flex items-center gap-2 transition-colors ${
                    activeTab === tab.id
                      ? "border-blue-500 text-blue-600"
                      : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
                  }`}
                >
                  <Icon className="w-4 h-4" />
                  {tab.label}
                </button>
              );
            })}
          </nav>
        </div>
        
        {/* Tab Content */}
        <div className="p-6">
          {ActiveComponent && <ActiveComponent />}
        </div>
      </div>
    </div>
  );
}