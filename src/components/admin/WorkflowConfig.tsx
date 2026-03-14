import { useState } from 'react';
import { Plus, Edit, Copy, Trash2 } from 'lucide-react';

export default function WorkflowConfig() {
  const workflows = [
    {
      id: '1',
      name: 'Court Litigation – Civil',
      stages: ['Matter Intake', 'Conflict Check', 'Case Filing', 'Hearings', 'Judgment & Review'],
      taskCount: 22,
      avgDuration: 75,
      active: true,
    },
    {
      id: '2',
      name: 'Debt Recovery',
      stages: ['Client Intake', 'Demand Letter', 'Negotiation', 'Court Filing', 'Recovery Plan'],
      taskCount: 15,
      avgDuration: 45,
      active: true,
    },
    {
      id: '3',
      name: 'Corporate Transactions',
      stages: ['Engagement', 'Due Diligence', 'Drafting', 'Execution', 'Post-Closure Advisory'],
      taskCount: 18,
      avgDuration: 60,
      active: true,
    },
    {
      id: '4',
      name: 'Regulatory Compliance',
      stages: ['Request Intake', 'Regulation Mapping', 'Submission Filing', 'Approval & Archiving'],
      taskCount: 12,
      avgDuration: 40,
      active: true,
    },
    {
      id: '5',
      name: 'Legal Advisory',
      stages: ['Issue Framing', 'Research', 'Draft Opinion', 'Review', 'Client Call'],
      taskCount: 9,
      avgDuration: 20,
      active: false,
    },
  ];

  return (
    <div>
      {/* Page Header */}
      <div className="mb-6">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h1 className="text-2xl font-semibold text-gray-900 mb-1">Workflow Configuration</h1>
            <p className="text-gray-600">Define case types, workflow stages, and reusable task templates</p>
          </div>
          <button className="inline-flex items-center px-4 py-2 bg-gray-800 text-white rounded hover:bg-gray-700">
            <Plus className="w-4 h-4 mr-2" />
            Create Workflow
          </button>
        </div>
      </div>

      {/* Workflows */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {workflows.map((workflow) => (
          <div key={workflow.id} className="bg-white border border-gray-200 rounded-lg p-6">
            <div className="flex items-start justify-between mb-4">
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <h3 className="text-lg font-semibold text-gray-900">{workflow.name}</h3>
                  <span className={`px-2 py-0.5 text-xs rounded ${
                    workflow.active ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-600'
                  }`}>
                    {workflow.active ? 'Active' : 'Inactive'}
                  </span>
                </div>
                <p className="text-sm text-gray-600">
                  {workflow.stages.length} stages • {workflow.taskCount} tasks • {workflow.avgDuration} days avg
                </p>
              </div>
              <div className="flex gap-1">
                <button className="p-1 text-gray-600 hover:text-gray-900">
                  <Edit className="w-4 h-4" />
                </button>
                <button className="p-1 text-gray-600 hover:text-gray-900">
                  <Copy className="w-4 h-4" />
                </button>
                <button className="p-1 text-gray-600 hover:text-red-600">
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>

            <div className="mb-4">
              <p className="text-sm font-medium text-gray-700 mb-2">Workflow Stages:</p>
              <div className="flex flex-wrap gap-2">
                {workflow.stages.map((stage, index) => (
                  <div key={index} className="flex items-center gap-1">
                    <span className="px-2 py-1 bg-gray-100 text-gray-700 text-xs rounded">
                      {index + 1}. {stage}
                    </span>
                    {index < workflow.stages.length - 1 && (
                      <span className="text-gray-400">→</span>
                    )}
                  </div>
                ))}
              </div>
            </div>

            <div className="flex gap-2">
              <button className="flex-1 px-3 py-2 text-sm border border-gray-300 rounded text-gray-700 hover:bg-gray-50">
                Edit Stages
              </button>
              <button className="flex-1 px-3 py-2 text-sm border border-gray-300 rounded text-gray-700 hover:bg-gray-50">
                Manage Tasks
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Task Templates */}
      <div className="mt-8">
        <div className="mb-4">
          <h2 className="text-lg font-semibold text-gray-900 mb-1">Task Templates</h2>
          <p className="text-sm text-gray-600">Reusable templates for common legal activities</p>
        </div>

        <div className="bg-white border border-gray-200 rounded-lg divide-y divide-gray-200">
          {[
            { name: 'Client Intake Form', category: 'Intake', duration: '1 hour', assignable: true },
            { name: 'Notice Drafting', category: 'Pre-litigation', duration: '3 hours', assignable: true },
            { name: 'Submit Pleadings to Court', category: 'Litigation', duration: '2 hours', assignable: true },
            { name: 'Due Diligence Checklist', category: 'Corporate', duration: '4 hours', assignable: false },
            { name: 'Weekly Case Update Report', category: 'Communication', duration: '1 hour', assignable: true },
          ].map((template, index) => (
            <div key={index} className="px-5 py-4 hover:bg-gray-50">
              <div className="flex items-center justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <p className="text-sm font-medium text-gray-900">{template.name}</p>
                    <span className="px-2 py-0.5 bg-gray-100 text-gray-700 text-xs rounded">
                      {template.category}
                    </span>
                  </div>
                  <p className="text-xs text-gray-500">
                    Est. duration: {template.duration} • {template.assignable ? 'Auto-assignable' : 'Manual only'}
                  </p>
                </div>
                <div className="flex gap-2">
                  <button className="text-xs text-gray-600 hover:text-gray-900">Edit</button>
                  <button className="text-xs text-gray-600 hover:text-red-600">Delete</button>
                </div>
              </div>
            </div>
          ))}
        </div>

        <button className="mt-4 inline-flex items-center px-4 py-2 border border-gray-300 rounded text-sm text-gray-700 hover:bg-gray-50">
          <Plus className="w-4 h-4 mr-2" />
          Add Task Template
        </button>
      </div>
    </div>
  );
}