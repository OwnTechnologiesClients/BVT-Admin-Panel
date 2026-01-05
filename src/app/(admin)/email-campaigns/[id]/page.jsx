"use client";

import React, { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { 
  Mail, 
  ArrowLeft, 
  Send, 
  Users, 
  CheckCircle,
  XCircle,
  Clock,
  RefreshCw,
  Calendar,
  User
} from "lucide-react";
import { getCampaign, sendCampaign, getEmailLogs } from "@/lib/api/email";

export default function CampaignDetailsPage() {
  const params = useParams();
  const router = useRouter();
  const [campaign, setCampaign] = useState(null);
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);

  useEffect(() => {
    fetchData();
  }, [params.id]);

  const fetchData = async () => {
    setLoading(true);
    try {
      const [campaignRes, logsRes] = await Promise.all([
        getCampaign(params.id),
        getEmailLogs({ campaignId: params.id, limit: 1000 }) // Fetch more recipients
      ]);
      
      if (campaignRes.success) {
        setCampaign(campaignRes.data);
      }
      if (logsRes.success) {
        console.log('Email logs response:', logsRes);
        // Handle both array and paginated response
        const logsData = Array.isArray(logsRes.data) ? logsRes.data : (logsRes.data?.data || []);
        setLogs(logsData);
        console.log('Set logs:', logsData.length);
      } else {
        console.error('Failed to fetch logs:', logsRes);
      }
    } catch (error) {
      console.error('Failed to fetch data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSend = async () => {
    if (!confirm('Are you sure you want to send this campaign?')) return;
    
    setSending(true);
    try {
      const res = await sendCampaign(params.id);
      if (res.success) {
        alert(res.message);
        fetchData();
      } else {
        alert(res.message || 'Failed to send campaign');
      }
    } catch (error) {
      alert('Failed to send campaign');
    } finally {
      setSending(false);
    }
  };

  const getStatusBadge = (status) => {
    const badges = {
      draft: { bg: 'bg-gray-100', text: 'text-gray-700', icon: Clock },
      scheduled: { bg: 'bg-blue-100', text: 'text-blue-700', icon: Clock },
      sending: { bg: 'bg-yellow-100', text: 'text-yellow-700', icon: RefreshCw },
      sent: { bg: 'bg-green-100', text: 'text-green-700', icon: CheckCircle },
      failed: { bg: 'bg-red-100', text: 'text-red-700', icon: XCircle },
      cancelled: { bg: 'bg-gray-100', text: 'text-gray-500', icon: XCircle }
    };
    
    const badge = badges[status] || badges.draft;
    const Icon = badge.icon;
    
    return (
      <span className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-sm font-medium ${badge.bg} ${badge.text}`}>
        <Icon className="w-4 h-4" />
        {status.charAt(0).toUpperCase() + status.slice(1)}
      </span>
    );
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <RefreshCw className="w-8 h-8 animate-spin text-blue-600" />
      </div>
    );
  }

  if (!campaign) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-500">Campaign not found</p>
        <Link href="/email-campaigns" className="text-blue-600 hover:underline mt-2 inline-block">
          Back to campaigns
        </Link>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div className="flex items-center gap-4">
          <Link
            href="/email-campaigns"
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <ArrowLeft className="w-5 h-5 text-gray-600" />
          </Link>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">{campaign.name}</h1>
            <p className="text-gray-500 mt-1">{campaign.subject}</p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          {getStatusBadge(campaign.status)}
          {campaign.status === 'draft' && (
            <button
              onClick={handleSend}
              disabled={sending}
              className="inline-flex items-center gap-2 px-4 py-2.5 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors font-medium disabled:opacity-50"
            >
              {sending ? (
                <RefreshCw className="w-5 h-5 animate-spin" />
              ) : (
                <Send className="w-5 h-5" />
              )}
              Send Campaign
            </button>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Campaign Details */}
        <div className="lg:col-span-2 space-y-6">
          {/* Stats */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            <div className="bg-white rounded-xl p-4 border border-gray-100 shadow-sm">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-blue-100 flex items-center justify-center">
                  <Users className="w-5 h-5 text-blue-600" />
                </div>
                <div>
                  <p className="text-2xl font-bold text-gray-900">{campaign.stats?.totalRecipients || 0}</p>
                  <p className="text-xs text-gray-500">Recipients</p>
                </div>
              </div>
            </div>
            <div className="bg-white rounded-xl p-4 border border-gray-100 shadow-sm">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-green-100 flex items-center justify-center">
                  <CheckCircle className="w-5 h-5 text-green-600" />
                </div>
                <div>
                  <p className="text-2xl font-bold text-gray-900">{campaign.stats?.sent || 0}</p>
                  <p className="text-xs text-gray-500">Sent</p>
                </div>
              </div>
            </div>
            <div className="bg-white rounded-xl p-4 border border-gray-100 shadow-sm">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-red-100 flex items-center justify-center">
                  <XCircle className="w-5 h-5 text-red-600" />
                </div>
                <div>
                  <p className="text-2xl font-bold text-gray-900">{campaign.stats?.failed || 0}</p>
                  <p className="text-xs text-gray-500">Failed</p>
                </div>
              </div>
            </div>
            <div className="bg-white rounded-xl p-4 border border-gray-100 shadow-sm">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-yellow-100 flex items-center justify-center">
                  <Mail className="w-5 h-5 text-yellow-600" />
                </div>
                <div>
                  <p className="text-2xl font-bold text-gray-900">
                    {campaign.stats?.totalRecipients 
                      ? Math.round((campaign.stats.sent / campaign.stats.totalRecipients) * 100) 
                      : 0}%
                  </p>
                  <p className="text-xs text-gray-500">Success Rate</p>
                </div>
              </div>
            </div>
          </div>

          {/* Recipients List */}
          <div className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden">
            <div className="p-4 border-b border-gray-100 flex items-center justify-between">
              <h2 className="font-semibold text-gray-900 flex items-center gap-2">
                <Users className="w-5 h-5" />
                Recipients ({logs.length})
              </h2>
            </div>
            {logs.length === 0 ? (
              <div className="p-8 text-center">
                <Mail className="w-10 h-10 text-gray-300 mx-auto mb-3" />
                <p className="text-gray-500">No emails sent yet</p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="bg-gray-50">
                      <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase">Recipient</th>
                      <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase">Status</th>
                      <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase">Sent At</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100">
                    {logs.map((log) => (
                      <tr key={log._id} className="hover:bg-gray-50">
                        <td className="px-4 py-3">
                          <div>
                            <p className="font-medium text-gray-900 text-sm">{log.recipient?.name || 'Unknown'}</p>
                            <p className="text-xs text-gray-500">{log.recipient?.email}</p>
                          </div>
                        </td>
                        <td className="px-4 py-3">
                          <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded text-xs font-medium ${
                            log.status === 'sent' 
                              ? 'bg-green-100 text-green-700' 
                              : 'bg-red-100 text-red-700'
                          }`}>
                            {log.status === 'sent' ? (
                              <CheckCircle className="w-3 h-3" />
                            ) : (
                              <XCircle className="w-3 h-3" />
                            )}
                            {log.status}
                          </span>
                        </td>
                        <td className="px-4 py-3 text-sm text-gray-500">
                          {log.sentAt 
                            ? new Date(log.sentAt).toLocaleString()
                            : '-'
                          }
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Campaign Info */}
          <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-4">
            <h3 className="font-semibold text-gray-900 mb-4">Campaign Info</h3>
            <div className="space-y-3">
              <div className="flex items-start gap-3">
                <Mail className="w-5 h-5 text-gray-400 mt-0.5" />
                <div>
                  <p className="text-xs text-gray-500">Template</p>
                  <p className="text-sm font-medium text-gray-900">
                    {campaign.templateType?.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())}
                  </p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <Users className="w-5 h-5 text-gray-400 mt-0.5" />
                <div>
                  <p className="text-xs text-gray-500">Audience</p>
                  <p className="text-sm font-medium text-gray-900">
                    {(campaign.audience?.audienceType || campaign.audience?.type || '')
                      .replace(/_/g, ' ')
                      .replace(/\b\w/g, l => l.toUpperCase())}
                  </p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <Calendar className="w-5 h-5 text-gray-400 mt-0.5" />
                <div>
                  <p className="text-xs text-gray-500">Created</p>
                  <p className="text-sm font-medium text-gray-900">
                    {new Date(campaign.createdAt).toLocaleDateString('en-US', {
                      month: 'long',
                      day: 'numeric',
                      year: 'numeric'
                    })}
                  </p>
                </div>
              </div>
              {campaign.sentAt && (
                <div className="flex items-start gap-3">
                  <Send className="w-5 h-5 text-gray-400 mt-0.5" />
                  <div>
                    <p className="text-xs text-gray-500">Sent</p>
                    <p className="text-sm font-medium text-gray-900">
                      {new Date(campaign.sentAt).toLocaleDateString('en-US', {
                        month: 'long',
                        day: 'numeric',
                        year: 'numeric',
                        hour: '2-digit',
                        minute: '2-digit'
                      })}
                    </p>
                  </div>
                </div>
              )}
              {campaign.createdBy && (
                <div className="flex items-start gap-3">
                  <User className="w-5 h-5 text-gray-400 mt-0.5" />
                  <div>
                    <p className="text-xs text-gray-500">Created By</p>
                    <p className="text-sm font-medium text-gray-900">
                      {campaign.createdBy.firstName} {campaign.createdBy.lastName}
                    </p>
                  </div>
                </div>
              )}
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}

