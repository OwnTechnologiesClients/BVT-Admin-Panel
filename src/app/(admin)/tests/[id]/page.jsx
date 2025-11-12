"use client";

import React from "react";
import { useParams } from "next/navigation";
import { TestDetailsView } from "@/components/tests";

const AdminTestDetailsPage = () => {
  const params = useParams();
  const testId = params.id;

  return (
    <TestDetailsView
      testId={testId}
      basePath="/tests"
      breadcrumbProps={{
        homeHref: "/",
        homeLabel: "Dashboard",
        trail: [{ label: "Tests", href: "/tests" }],
      }}
    />
  );
};

export default AdminTestDetailsPage;
// "use client";

// import React, { useState } from "react";
// import { useParams } from "next/navigation";
// import { PageBreadcrumb, ComponentCard } from "@/components/common";
// import { Badge } from "@/components/ui";
// import { 
//   Clock, 
//   CheckCircle, 
//   XCircle, 
//   Users, 
//   Award,
//   Calendar,
//   FileText,
//   Download,
//   Mail,
//   TrendingUp,
//   AlertCircle,
//   Eye,
//   EyeOff
// } from "lucide-react";
// import { useRouter } from "next/navigation";

// const TestDetailsPage = () => {
//   const params = useParams();
//   const testId = params.id;
//   const router = useRouter();

//   // Mock data - replace with actual API call
//   const [testData] = useState({
//     id: testId,
//     title: "Marine Engineering Fundamentals - Final Exam",
//     course: "Marine Engineering Fundamentals",
//     description: "Comprehensive final examination covering all modules of Marine Engineering Fundamentals. This test evaluates understanding of basic marine engineering principles, propulsion systems, and maintenance procedures.",
//     duration: 60,
//     passingScore: 70,
//     totalQuestions: 20,
//     totalStudents: 45,
//     completed: 38,
//     pending: 7,
//     averageScore: 78.5,
//     highestScore: 95,
//     lowestScore: 45,
//     isActive: true,
//     randomizeQuestions: true,
//     showResults: true,
//     maxAttempts: 3,
//     createdAt: "2025-01-15",
//     createdBy: "Dr. Sarah Johnson",
//   });

//   const [selectedTab, setSelectedTab] = useState("completed"); // completed, pending, all
//   const [resultsReleased, setResultsReleased] = useState(false);

//   const [students] = useState([
//     {
//       id: 1,
//       name: "John Anderson",
//       email: "john.anderson@navy.mil",
//       enrollmentDate: "2025-01-10",
//       status: "completed",
//       score: 85,
//       attempts: 1,
//       completedAt: "2025-01-20 14:30",
//       timeSpent: 52,
//       passed: true,
//     },
//     {
//       id: 2,
//       name: "Emily Roberts",
//       email: "emily.roberts@navy.mil",
//       enrollmentDate: "2025-01-10",
//       status: "completed",
//       score: 92,
//       attempts: 1,
//       completedAt: "2025-01-20 15:15",
//       timeSpent: 58,
//       passed: true,
//     },
//     {
//       id: 3,
//       name: "Michael Chen",
//       email: "michael.chen@navy.mil",
//       enrollmentDate: "2025-01-10",
//       status: "completed",
//       score: 68,
//       attempts: 2,
//       completedAt: "2025-01-21 10:20",
//       timeSpent: 60,
//       passed: false,
//     },
//     {
//       id: 4,
//       name: "Sarah Williams",
//       email: "sarah.williams@navy.mil",
//       enrollmentDate: "2025-01-10",
//       status: "completed",
//       score: 95,
//       attempts: 1,
//       completedAt: "2025-01-20 16:45",
//       timeSpent: 55,
//       passed: true,
//     },
//     {
//       id: 5,
//       name: "David Martinez",
//       email: "david.martinez@navy.mil",
//       enrollmentDate: "2025-01-10",
//       status: "pending",
//       score: null,
//       attempts: 0,
//       completedAt: null,
//       timeSpent: null,
//       passed: null,
//     },
//     {
//       id: 6,
//       name: "Lisa Thompson",
//       email: "lisa.thompson@navy.mil",
//       enrollmentDate: "2025-01-10",
//       status: "completed",
//       score: 78,
//       attempts: 1,
//       completedAt: "2025-01-21 09:30",
//       timeSpent: 59,
//       passed: true,
//     },
//     {
//       id: 7,
//       name: "James Wilson",
//       email: "james.wilson@navy.mil",
//       enrollmentDate: "2025-01-10",
//       status: "pending",
//       score: null,
//       attempts: 0,
//       completedAt: null,
//       timeSpent: null,
//       passed: null,
//     },
//     {
//       id: 8,
//       name: "Jennifer Brown",
//       email: "jennifer.brown@navy.mil",
//       enrollmentDate: "2025-01-10",
//       status: "completed",
//       score: 82,
//       attempts: 1,
//       completedAt: "2025-01-21 11:00",
//       timeSpent: 57,
//       passed: true,
//     },
//   ]);

//   const breadcrumbItems = [
//     { label: "Dashboard", href: "/" },
//     { label: "Tests", href: "/tests" },
//     { label: testData.title, href: `/tests/${testId}` },
//   ];

//   const filteredStudents = students.filter(student => {
//     if (selectedTab === "all") return true;
//     return student.status === selectedTab;
//   });

//   const passedCount = students.filter(s => s.passed === true).length;
//   const failedCount = students.filter(s => s.status === "completed" && s.passed === false).length;
//   const completionRate = ((testData.completed / testData.totalStudents) * 100).toFixed(1);

//   return (
//     <div className="space-y-6">
//       <PageBreadcrumb items={breadcrumbItems} />
      
//       {/* Header */}
//       <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
//         <div>
//           <div className="flex items-center gap-3 mb-2">
//             <h1 className="text-2xl font-bold text-gray-900">{testData.title}</h1>
//             <Badge color={testData.isActive ? "success" : "default"}>
//               {testData.isActive ? "Active" : "Inactive"}
//             </Badge>
//           </div>
//           <p className="text-sm text-gray-600">
//             Course: <span className="font-medium">{testData.course}</span>
//           </p>
//         </div>
//         <div className="flex items-center gap-3">
//           <button className="flex items-center gap-2 px-4 py-2 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors">
//             <Download className="w-4 h-4" />
//             Export Results
//           </button>
//           <button className="flex items-center gap-2 px-4 py-2 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors">
//             <Mail className="w-4 h-4" />
//             Notify Pending
//           </button>
//           <button 
//             onClick={() => setResultsReleased(!resultsReleased)}
//             className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-colors ${
//               resultsReleased 
//                 ? "bg-green-600 text-white hover:bg-green-700" 
//                 : "bg-blue-600 text-white hover:bg-blue-700"
//             }`}
//           >
//             {resultsReleased ? (
//               <>
//                 <Eye className="w-4 h-4" />
//                 Results Released
//               </>
//             ) : (
//               <>
//                 <EyeOff className="w-4 h-4" />
//                 Release Results
//               </>
//             )}
//           </button>
//         </div>
//       </div>

//       {/* Statistics Overview */}
//       <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
//         <div className="bg-white rounded-2xl border border-gray-200 p-6">
//           <div className="flex items-center justify-between mb-2">
//             <div className="p-2 bg-blue-100 rounded-lg">
//               <Users className="w-5 h-5 text-blue-600" />
//             </div>
//             <span className="text-sm text-gray-500">Total</span>
//           </div>
//           <div className="text-2xl font-bold text-gray-900">{testData.totalStudents}</div>
//           <p className="text-xs text-gray-600 mt-1">Enrolled Students</p>
//         </div>

//         <div className="bg-white rounded-2xl border border-gray-200 p-6">
//           <div className="flex items-center justify-between mb-2">
//             <div className="p-2 bg-green-100 rounded-lg">
//               <CheckCircle className="w-5 h-5 text-green-600" />
//             </div>
//             <span className="text-sm text-gray-500">{completionRate}%</span>
//           </div>
//           <div className="text-2xl font-bold text-gray-900">{testData.completed}</div>
//           <p className="text-xs text-gray-600 mt-1">Completed</p>
//         </div>

//         <div className="bg-white rounded-2xl border border-gray-200 p-6">
//           <div className="flex items-center justify-between mb-2">
//             <div className="p-2 bg-orange-100 rounded-lg">
//               <AlertCircle className="w-5 h-5 text-orange-600" />
//             </div>
//             <span className="text-sm text-gray-500">
//               {((testData.pending / testData.totalStudents) * 100).toFixed(0)}%
//             </span>
//           </div>
//           <div className="text-2xl font-bold text-gray-900">{testData.pending}</div>
//           <p className="text-xs text-gray-600 mt-1">Pending</p>
//         </div>

//         <div className="bg-white rounded-2xl border border-gray-200 p-6">
//           <div className="flex items-center justify-between mb-2">
//             <div className="p-2 bg-purple-100 rounded-lg">
//               <TrendingUp className="w-5 h-5 text-purple-600" />
//             </div>
//             <span className="text-sm text-gray-500">Average</span>
//           </div>
//           <div className="text-2xl font-bold text-gray-900">{testData.averageScore.toFixed(1)}%</div>
//           <p className="text-xs text-gray-600 mt-1">Score</p>
//         </div>
//       </div>

//       {/* Test Information */}
//       <ComponentCard title="Test Information">
//         <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
//           <div className="flex items-start gap-3">
//             <div className="p-2 bg-blue-50 rounded-lg">
//               <Clock className="w-5 h-5 text-blue-600" />
//             </div>
//             <div>
//               <p className="text-sm text-gray-600">Duration</p>
//               <p className="text-base font-semibold text-gray-900">{testData.duration} minutes</p>
//             </div>
//           </div>

//           <div className="flex items-start gap-3">
//             <div className="p-2 bg-green-50 rounded-lg">
//               <FileText className="w-5 h-5 text-green-600" />
//             </div>
//             <div>
//               <p className="text-sm text-gray-600">Questions</p>
//               <p className="text-base font-semibold text-gray-900">{testData.totalQuestions} questions</p>
//             </div>
//           </div>

//           <div className="flex items-start gap-3">
//             <div className="p-2 bg-purple-50 rounded-lg">
//               <Award className="w-5 h-5 text-purple-600" />
//             </div>
//             <div>
//               <p className="text-sm text-gray-600">Passing Score</p>
//               <p className="text-base font-semibold text-gray-900">{testData.passingScore}%</p>
//             </div>
//           </div>

//           <div className="flex items-start gap-3">
//             <div className="p-2 bg-orange-50 rounded-lg">
//               <Calendar className="w-5 h-5 text-orange-600" />
//             </div>
//             <div>
//               <p className="text-sm text-gray-600">Created</p>
//               <p className="text-base font-semibold text-gray-900">{testData.createdAt}</p>
//             </div>
//           </div>

//           <div className="flex items-start gap-3">
//             <div className="p-2 bg-pink-50 rounded-lg">
//               <Users className="w-5 h-5 text-pink-600" />
//             </div>
//             <div>
//               <p className="text-sm text-gray-600">Created By</p>
//               <p className="text-base font-semibold text-gray-900">{testData.createdBy}</p>
//             </div>
//           </div>

//           <div className="flex items-start gap-3">
//             <div className="p-2 bg-yellow-50 rounded-lg">
//               <AlertCircle className="w-5 h-5 text-yellow-600" />
//             </div>
//             <div>
//               <p className="text-sm text-gray-600">Max Attempts</p>
//               <p className="text-base font-semibold text-gray-900">
//                 {testData.maxAttempts === 0 ? "Unlimited" : testData.maxAttempts}
//               </p>
//             </div>
//           </div>
//         </div>

//         {testData.description && (
//           <div className="mt-6 pt-6 border-t border-gray-200">
//             <h4 className="text-sm font-semibold text-gray-900 mb-2">Description</h4>
//             <p className="text-sm text-gray-700 leading-relaxed">{testData.description}</p>
//           </div>
//         )}

//         <div className="mt-4 flex flex-wrap gap-4">
//           <div className="flex items-center gap-2">
//             <div className={`w-3 h-3 rounded-full ${testData.randomizeQuestions ? 'bg-green-500' : 'bg-gray-300'}`}></div>
//             <span className="text-sm text-gray-700">Randomize Questions</span>
//           </div>
//           <div className="flex items-center gap-2">
//             <div className={`w-3 h-3 rounded-full ${testData.showResults ? 'bg-green-500' : 'bg-gray-300'}`}></div>
//             <span className="text-sm text-gray-700">Show Results Immediately</span>
//           </div>
//         </div>
//       </ComponentCard>

//       {/* --- Edit/View Questions --- */}
//       <div className="flex gap-4 mb-8">
//         <button
//           onClick={() => router.push(`/tests/${testId}/questions/edit`)}
//           className="inline-flex items-center px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg shadow transition-colors"
//         >
//           Edit Questions
//         </button>
//         <button
//           onClick={() => router.push(`/tests/${testId}/questions/view`)}
//           className="inline-flex items-center px-4 py-2 bg-gray-50 hover:bg-gray-100 border border-gray-300 text-gray-800 font-medium rounded-lg shadow-sm transition-colors"
//         >
//           View Questions
//         </button>
//       </div>

//       {/* Performance Statistics */}
//       <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
//         <ComponentCard title="Score Distribution">
//           <div className="space-y-3">
//             <div className="flex items-center justify-between">
//               <span className="text-sm text-gray-600">Highest Score</span>
//               <span className="text-lg font-bold text-green-600">{testData.highestScore}%</span>
//             </div>
//             <div className="flex items-center justify-between">
//               <span className="text-sm text-gray-600">Average Score</span>
//               <span className="text-lg font-bold text-blue-600">{testData.averageScore.toFixed(1)}%</span>
//             </div>
//             <div className="flex items-center justify-between">
//               <span className="text-sm text-gray-600">Lowest Score</span>
//               <span className="text-lg font-bold text-red-600">{testData.lowestScore}%</span>
//             </div>
//           </div>
//         </ComponentCard>

//         <ComponentCard title="Pass/Fail Status">
//           <div className="space-y-3">
//             <div className="flex items-center justify-between">
//               <div className="flex items-center gap-2">
//                 <CheckCircle className="w-4 h-4 text-green-600" />
//                 <span className="text-sm text-gray-600">Passed</span>
//               </div>
//               <span className="text-lg font-bold text-green-600">{passedCount}</span>
//             </div>
//             <div className="flex items-center justify-between">
//               <div className="flex items-center gap-2">
//                 <XCircle className="w-4 h-4 text-red-600" />
//                 <span className="text-sm text-gray-600">Failed</span>
//               </div>
//               <span className="text-lg font-bold text-red-600">{failedCount}</span>
//             </div>
//             <div className="mt-4 pt-4 border-t">
//               <div className="text-xs text-gray-600 mb-2">Pass Rate</div>
//               <div className="w-full bg-gray-200 rounded-full h-3">
//                 <div 
//                   className="bg-green-600 h-3 rounded-full transition-all"
//                   style={{ width: `${(passedCount / testData.completed * 100).toFixed(0)}%` }}
//                 ></div>
//               </div>
//               <div className="text-right text-sm font-semibold text-gray-900 mt-1">
//                 {((passedCount / testData.completed) * 100).toFixed(1)}%
//               </div>
//             </div>
//           </div>
//         </ComponentCard>

//         <ComponentCard title="Completion Status">
//           <div className="space-y-4">
//             <div>
//               <div className="flex justify-between text-sm mb-2">
//                 <span className="text-gray-600">Completed</span>
//                 <span className="font-semibold text-gray-900">{testData.completed}/{testData.totalStudents}</span>
//               </div>
//               <div className="w-full bg-gray-200 rounded-full h-3">
//                 <div 
//                   className="bg-blue-600 h-3 rounded-full transition-all"
//                   style={{ width: `${completionRate}%` }}
//                 ></div>
//               </div>
//               <div className="text-right text-sm font-semibold text-gray-900 mt-1">
//                 {completionRate}%
//               </div>
//             </div>
//           </div>
//         </ComponentCard>
//       </div>

//       {/* Student Performance Table */}
//       <ComponentCard title="Student Performance">
//         {/* Tabs */}
//         <div className="flex items-center gap-2 mb-6 border-b border-gray-200">
//           <button
//             onClick={() => setSelectedTab("all")}
//             className={`px-4 py-2 text-sm font-medium transition-colors border-b-2 ${
//               selectedTab === "all"
//                 ? "border-blue-600 text-blue-600"
//                 : "border-transparent text-gray-600 hover:text-gray-900"
//             }`}
//           >
//             All Students ({students.length})
//           </button>
//           <button
//             onClick={() => setSelectedTab("completed")}
//             className={`px-4 py-2 text-sm font-medium transition-colors border-b-2 ${
//               selectedTab === "completed"
//                 ? "border-blue-600 text-blue-600"
//                 : "border-transparent text-gray-600 hover:text-gray-900"
//             }`}
//           >
//             Completed ({testData.completed})
//           </button>
//           <button
//             onClick={() => setSelectedTab("pending")}
//             className={`px-4 py-2 text-sm font-medium transition-colors border-b-2 ${
//               selectedTab === "pending"
//                 ? "border-blue-600 text-blue-600"
//                 : "border-transparent text-gray-600 hover:text-gray-900"
//             }`}
//           >
//             Pending ({testData.pending})
//           </button>
//         </div>

//         {/* Table */}
//         <div className="overflow-x-auto">
//           <table className="w-full">
//             <thead className="bg-gray-50 border-b border-gray-200">
//               <tr>
//                 <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
//                   Student
//                 </th>
//                 <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
//                   Status
//                 </th>
//                 <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
//                   Score
//                 </th>
//                 <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
//                   Attempts
//                 </th>
//                 <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
//                   Time Spent
//                 </th>
//                 <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
//                   Completed At
//                 </th>
//                 <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
//                   Result
//                 </th>
//               </tr>
//             </thead>
//             <tbody className="bg-white divide-y divide-gray-200">
//               {filteredStudents.map((student) => (
//                 <tr key={student.id} className="hover:bg-gray-50 transition-colors">
//                   <td className="px-4 py-4">
//                     <div>
//                       <div className="text-sm font-medium text-gray-900">{student.name}</div>
//                       <div className="text-xs text-gray-500">{student.email}</div>
//                     </div>
//                   </td>
//                   <td className="px-4 py-4">
//                     <Badge color={student.status === "completed" ? "success" : "warning"}>
//                       {student.status === "completed" ? "Completed" : "Pending"}
//                     </Badge>
//                   </td>
//                   <td className="px-4 py-4">
//                     {student.score !== null ? (
//                       <span className={`text-sm font-semibold ${
//                         student.score >= testData.passingScore 
//                           ? "text-green-600" 
//                           : "text-red-600"
//                       }`}>
//                         {student.score}%
//                       </span>
//                     ) : (
//                       <span className="text-sm text-gray-400">-</span>
//                     )}
//                   </td>
//                   <td className="px-4 py-4">
//                     <span className="text-sm text-gray-700">{student.attempts}</span>
//                   </td>
//                   <td className="px-4 py-4">
//                     {student.timeSpent !== null ? (
//                       <span className="text-sm text-gray-700">{student.timeSpent} min</span>
//                     ) : (
//                       <span className="text-sm text-gray-400">-</span>
//                     )}
//                   </td>
//                   <td className="px-4 py-4">
//                     {student.completedAt ? (
//                       <span className="text-sm text-gray-700">{student.completedAt}</span>
//                     ) : (
//                       <span className="text-sm text-gray-400">Not completed</span>
//                     )}
//                   </td>
//                   <td className="px-4 py-4">
//                     {student.passed !== null ? (
//                       student.passed ? (
//                         <div className="flex items-center gap-1 text-green-600">
//                           <CheckCircle className="w-4 h-4" />
//                           <span className="text-sm font-medium">Pass</span>
//                         </div>
//                       ) : (
//                         <div className="flex items-center gap-1 text-red-600">
//                           <XCircle className="w-4 h-4" />
//                           <span className="text-sm font-medium">Fail</span>
//                         </div>
//                       )
//                     ) : (
//                       <span className="text-sm text-gray-400">-</span>
//                     )}
//                   </td>
//                 </tr>
//               ))}
//             </tbody>
//           </table>

//           {filteredStudents.length === 0 && (
//             <div className="text-center py-12 bg-gray-50">
//               <p className="text-gray-600">No students found in this category</p>
//             </div>
//           )}
//         </div>
//       </ComponentCard>
//     </div>
//   );
// };

// export default TestDetailsPage;


