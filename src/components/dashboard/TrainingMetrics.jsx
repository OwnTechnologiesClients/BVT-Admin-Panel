"use client";

import React, { useState, useEffect } from "react";
import { Badge } from "@/components/ui";
import { Users, BookOpen, Calendar, DollarSign, Loader2 } from "lucide-react";
import { getDashboardStats } from "@/lib/api/dashboard";

export const TrainingMetrics = () => {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        setLoading(true);
        setError(null);
        const response = await getDashboardStats();

        if (response.success) {
          setStats(response.data);
        } else {
          setError(response.message || "Failed to fetch statistics");
        }
      } catch (err) {
        console.error("Error fetching dashboard stats:", err);
        setError(err.message || "An error occurred while fetching statistics");
      } finally {
        setLoading(false);
      }
    };

    fetchStats();
  }, []);

  if (loading) {
    return (
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 md:gap-6">
        {[1, 2, 3, 4].map((i) => (
          <div key={i} className="rounded-2xl border border-gray-200 bg-white p-5 md:p-6">
            <div className="flex items-center justify-center w-12 h-12 bg-gray-100 rounded-xl mb-5">
              <Loader2 className="w-6 h-6 text-gray-400 animate-spin" />
            </div>
            <div className="h-16 bg-gray-100 rounded animate-pulse" />
          </div>
        ))}
      </div>
    );
  }

  if (error || !stats) {
    return (
      <div className="rounded-2xl border border-red-200 bg-red-50 p-5 md:p-6">
        <p className="text-red-600">
          {error || "Failed to load dashboard statistics"}
        </p>
      </div>
    );
  }

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('nb-NO', {
      style: 'currency',
      currency: 'NOK',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);
  };

  const formatGrowth = (growth) => {
    const isPositive = growth >= 0;
    return {
      value: Math.abs(growth).toFixed(1),
      isPositive
    };
  };

  const studentsGrowth = formatGrowth(stats.totalStudents.growth);
  const coursesGrowth = formatGrowth(stats.totalCourses.growth);
  const eventsGrowth = formatGrowth(stats.upcomingEvents.growth);
  const revenueGrowth = formatGrowth(stats.monthlyRevenue.growth);

  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 md:gap-6">
      {/* Total Students */}
      <div className="rounded-2xl border border-gray-200 bg-white p-5 md:p-6">
        <div className="flex items-center justify-center w-12 h-12 bg-gray-100 rounded-xl">
          <Users className="text-gray-800 size-6" />
        </div>

        <div className="flex items-end justify-between mt-5">
          <div>
            <span className="text-sm text-gray-700">
              Total Students
            </span>
            <h4 className="mt-2 font-bold text-gray-800 text-title-sm">
              {stats.totalStudents.value.toLocaleString()}
            </h4>
          </div>
          <Badge color={studentsGrowth.isPositive ? "success" : "default"}>
            <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
              {studentsGrowth.isPositive ? (
                <path fillRule="evenodd" d="M5.293 7.707a1 1 0 010-1.414l4-4a1 1 0 011.414 0l4 4a1 1 0 01-1.414 1.414L11 5.414V17a1 1 0 11-2 0V5.414L6.707 7.707a1 1 0 01-1.414 0z" clipRule="evenodd" />
              ) : (
                <path fillRule="evenodd" d="M14.707 12.293a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 111.414-1.414L9 14.586V3a1 1 0 012 0v11.586l2.293-2.293a1 1 0 011.414 0z" clipRule="evenodd" />
              )}
            </svg>
            {studentsGrowth.value}%
          </Badge>
        </div>
      </div>

      {/* Total Courses */}
      <div className="rounded-2xl border border-gray-200 bg-white p-5 md:p-6">
        <div className="flex items-center justify-center w-12 h-12 bg-gray-100 rounded-xl">
          <BookOpen className="text-gray-800" />
        </div>
        <div className="flex items-end justify-between mt-5">
          <div>
            <span className="text-sm text-gray-700">
              Total Courses
            </span>
            <h4 className="mt-2 font-bold text-gray-800 text-title-sm">
              {stats.totalCourses.value.toLocaleString()}
            </h4>
          </div>

          <Badge color={coursesGrowth.isPositive ? "success" : "default"}>
            <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
              {coursesGrowth.isPositive ? (
                <path fillRule="evenodd" d="M5.293 7.707a1 1 0 010-1.414l4-4a1 1 0 011.414 0l4 4a1 1 0 01-1.414 1.414L11 5.414V17a1 1 0 11-2 0V5.414L6.707 7.707a1 1 0 01-1.414 0z" clipRule="evenodd" />
              ) : (
                <path fillRule="evenodd" d="M14.707 12.293a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 111.414-1.414L9 14.586V3a1 1 0 012 0v11.586l2.293-2.293a1 1 0 011.414 0z" clipRule="evenodd" />
              )}
            </svg>
            {coursesGrowth.value}%
          </Badge>
        </div>
      </div>

      {/* Upcoming Events */}
      <div className="rounded-2xl border border-gray-200 bg-white p-5 md:p-6">
        <div className="flex items-center justify-center w-12 h-12 bg-gray-100 rounded-xl">
          <Calendar className="text-gray-800" />
        </div>
        <div className="flex items-end justify-between mt-5">
          <div>
            <span className="text-sm text-gray-700">
              Upcoming Events
            </span>
            <h4 className="mt-2 font-bold text-gray-800 text-title-sm">
              {stats.upcomingEvents.value.toLocaleString()}
            </h4>
          </div>

          <Badge color={eventsGrowth.isPositive ? "success" : "default"}>
            <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
              {eventsGrowth.isPositive ? (
                <path fillRule="evenodd" d="M5.293 7.707a1 1 0 010-1.414l4-4a1 1 0 011.414 0l4 4a1 1 0 01-1.414 1.414L11 5.414V17a1 1 0 11-2 0V5.414L6.707 7.707a1 1 0 01-1.414 0z" clipRule="evenodd" />
              ) : (
                <path fillRule="evenodd" d="M14.707 12.293a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 111.414-1.414L9 14.586V3a1 1 0 012 0v11.586l2.293-2.293a1 1 0 011.414 0z" clipRule="evenodd" />
              )}
            </svg>
            {eventsGrowth.value}%
          </Badge>
        </div>
      </div>

      {/* Monthly Revenue */}
      <div className="rounded-2xl border border-gray-200 bg-white p-5 md:p-6">
        <div className="flex items-center justify-center w-12 h-12 bg-gray-100 rounded-xl">
          <DollarSign className="text-gray-800" />
        </div>
        <div className="flex items-end justify-between mt-5">
          <div>
            <span className="text-sm text-gray-700">
              Monthly Revenue
            </span>
            <h4 className="mt-2 font-bold text-gray-800 text-title-sm">
              {formatCurrency(stats.monthlyRevenue.value)}
            </h4>
          </div>

          <Badge color={revenueGrowth.isPositive ? "success" : "default"}>
            <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
              {revenueGrowth.isPositive ? (
                <path fillRule="evenodd" d="M5.293 7.707a1 1 0 010-1.414l4-4a1 1 0 011.414 0l4 4a1 1 0 01-1.414 1.414L11 5.414V17a1 1 0 11-2 0V5.414L6.707 7.707a1 1 0 01-1.414 0z" clipRule="evenodd" />
              ) : (
                <path fillRule="evenodd" d="M14.707 12.293a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 111.414-1.414L9 14.586V3a1 1 0 012 0v11.586l2.293-2.293a1 1 0 011.414 0z" clipRule="evenodd" />
              )}
            </svg>
            {revenueGrowth.value}%
          </Badge>
        </div>
      </div>
    </div>
  );
};
