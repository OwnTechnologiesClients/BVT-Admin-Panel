"use client";

import React, { useState, useEffect } from "react";
import axios from "axios";
import { getAllTransactions } from "@/lib/api/stripe";
import {
  CreditCard,
  Search,
  Filter,
  Download,
  Eye,
  CheckCircle,
  XCircle,
  Clock,
  FileText,
  ChevronLeft,
  ChevronRight
} from "lucide-react";
import DataTable from "@/components/common/DataTable";
import PageBreadcrumb from "@/components/common/PageBreadcrumb";
import ComponentCard from "@/components/common/ComponentCard";

const PaymentsPage = () => {
  const [loading, setLoading] = useState(true);
  const [transactions, setTransactions] = useState([]);
  const [statistics, setStatistics] = useState({
    totalAmount: 0,
    successfulCount: 0,
    pendingCount: 0
  });

  const columns = [
    {
      label: "Student",
      key: "studentId",
      render: (value, row) => (
        <div className="flex flex-col">
          <span className="font-medium text-gray-900">{row.studentId?.fullName || "Unknown"}</span>
          <span className="text-xs text-gray-500">{row.studentId?.email || "N/A"}</span>
        </div>
      )
    },
    {
      label: "Item",
      key: "itemId",
      render: (value, row) => (
        <div className="flex items-center gap-2">
          <span className={`px-2 py-0.5 rounded-full text-[10px] uppercase font-bold ${row.itemType === 'Course' ? 'bg-blue-100 text-blue-700' : 'bg-purple-100 text-purple-700'
            }`}>
            {row.itemType}
          </span>
          <span className="text-sm text-gray-700 truncate max-w-[200px]">
            {row.itemId?.title || row.itemType + " ID: " + row.itemId?._id?.substring(0, 8)}
          </span>
        </div>
      )
    },
    {
      label: "Amount",
      key: "amount",
      render: (value, row) => (
        <span className="font-bold text-gray-900">
          {row.amount?.toFixed(2)} {row.currency || 'NOK'}
        </span>
      )
    },
    {
      label: "Status",
      key: "status",
      render: (value, row) => (
        <span className={`flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium ${row.status === 'completed' ? 'bg-green-100 text-green-700' :
          row.status === 'pending' ? 'bg-yellow-100 text-yellow-700' :
            'bg-red-100 text-red-700'
          }`}>
          {row.status === 'completed' ? <CheckCircle className="w-3.5 h-3.5" /> :
            row.status === 'pending' ? <Clock className="w-3.5 h-3.5" /> :
              <XCircle className="w-3.5 h-3.5" />}
          {row.status.charAt(0).toUpperCase() + row.status.slice(1)}
        </span>
      )
    },
    {
      label: "Date",
      key: "createdAt",
      render: (value, row) => new Date(row.createdAt).toLocaleDateString()
    },
    {
      label: "Actions",
      key: "actions",
      render: (value, row) => (
        <div className="flex items-center gap-2">
          {row.invoice?.pdfUrl ? (
            <button
              onClick={() => window.open(row.invoice.pdfUrl, '_blank')}
              className="flex items-center gap-1 px-3 py-1.5 bg-blue-50 text-blue-600 rounded-lg hover:bg-blue-100 transition-colors text-xs font-medium"
              title={`View Invoice: ${row.invoice.invoiceNumber}`}
            >
              <FileText className="w-3.5 h-3.5" />
              View Invoice
            </button>
          ) : (
            <span className="text-xs text-gray-400 italic">No Invoice</span>
          )}
        </div>
      )
    }
  ];

  useEffect(() => {
    // Fetch transactions from backend
    const fetchTransactions = async () => {
      try {
        const response = await getAllTransactions();

        if (response.success) {
          setTransactions(response.data);

          // Calculate stats
          const stats = response.data.reduce((acc, curr) => {
            if (curr.status === 'completed') {
              acc.totalAmount += curr.amount;
              acc.successfulCount += 1;
            } else if (curr.status === 'pending') {
              acc.pendingCount += 1;
            }
            return acc;
          }, { totalAmount: 0, successfulCount: 0, pendingCount: 0 });

          setStatistics(stats);
        }
      } catch (error) {
        console.error("Error fetching transactions:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchTransactions();
  }, []);

  return (
    <div className="space-y-6">
      <PageBreadcrumb pageTitle="Payment Management" />

      {/* Stats Overview */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 flex items-center gap-4">
          <div className="p-3 bg-blue-50 rounded-xl">
            <CreditCard className="w-6 h-6 text-blue-600" />
          </div>
          <div>
            <p className="text-sm text-gray-500">Total Revenue</p>
            <p className="text-2xl font-bold text-gray-900">{statistics.totalAmount.toFixed(2)} NOK</p>
          </div>
        </div>
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 flex items-center gap-4">
          <div className="p-3 bg-green-50 rounded-xl">
            <CheckCircle className="w-6 h-6 text-green-600" />
          </div>
          <div>
            <p className="text-sm text-gray-500">Successful Payments</p>
            <p className="text-2xl font-bold text-gray-900">{statistics.successfulCount}</p>
          </div>
        </div>
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 flex items-center gap-4">
          <div className="p-3 bg-yellow-50 rounded-xl">
            <Clock className="w-6 h-6 text-yellow-600" />
          </div>
          <div>
            <p className="text-sm text-gray-500">Pending Sessions</p>
            <p className="text-2xl font-bold text-gray-900">{statistics.pendingCount}</p>
          </div>
        </div>
      </div>

      {/* Transactions Table */}
      <ComponentCard title="Recent Transactions">
        <DataTable
          columns={columns}
          data={transactions}
          loading={loading}
        />
      </ComponentCard>
    </div>
  );
};

export default PaymentsPage;
