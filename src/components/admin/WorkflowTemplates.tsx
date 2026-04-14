import { useEffect, useState } from 'react';
import {
  listAllWorkflowTemplates,
  createWorkflowTemplate,
  updateWorkflowTemplate,
  deleteWorkflowTemplate,
} from '../../services/workflowService';

type Template = any;

export default function WorkflowTemplates() {
  const [templates, setTemplates] = useState<Template[]>([]);
  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState('');

  const [selected, setSelected] = useState<Template | null>(null);
  const [editor, setEditor] = useState<string>('');

  const load = async () => {
    setLoading(true);
    setErr('');
    try {
      const data = await listAllWorkflowTemplates();
      setTemplates(data);
    } catch (e: any) {
      setErr(e.message || 'Failed to load templates');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, []);

  const onSelect = (t: Template) => {
    setSelected(t);
    setEditor(JSON.stringify(t, null, 2));
  };

  const onSave = async () => {
    if (!selected) return;
    try {
      setErr('');
      const parsed = JSON.parse(editor);
      await updateWorkflowTemplate(selected._id, parsed);
      await load();
      alert('Template saved');
    } catch (e: any) {
      setErr(e.message || 'Failed to save template');
    }
  };

  const onCreate = async () => {
    try {
      setErr('');
      const blank = {
  name: 'New Template',
  matterType: 'New Matter Type',
  caseType: 'Transactional Cases' as const,
  version: 1,
  active: true,
  stages: [],
  steps: [],
};
      await createWorkflowTemplate(blank);
      await load();
    } catch (e: any) {
      setErr(e.message || 'Failed to create template');
    }
  };

  const onDelete = async (id: string) => {
    if (!confirm('Delete this template?')) return;
    try {
      await deleteWorkflowTemplate(id);
      setSelected(null);
      setEditor('');
      await load();
    } catch (e: any) {
      setErr(e.message || 'Failed to delete template');
    }
  };

  return (
    <div className="bg-white border border-gray-200 rounded-lg p-6">
      <div className="flex items-center justify-between mb-4">
        <div>
          <h2 className="text-lg font-semibold text-gray-900">Workflow Templates</h2>
          <p className="text-sm text-gray-500">Edit SOP templates used to generate case workflows.</p>
        </div>

        <button onClick={onCreate} className="px-4 py-2 bg-gray-900 text-white rounded hover:bg-gray-800">
          New Template
        </button>
      </div>

      {err && <div className="mb-4 px-4 py-3 bg-red-50 border border-red-100 text-red-700 rounded">{err}</div>}
      {loading && <div className="text-gray-500">Loading...</div>}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <div className="border border-gray-200 rounded p-3 space-y-2">
          {templates.map((t) => (
            <div
              key={t._id}
              onClick={() => onSelect(t)}
              className={`p-3 rounded border cursor-pointer ${
                selected?._id === t._id ? 'border-gray-900 bg-gray-50' : 'border-gray-200'
              }`}
            >
              <div className="font-medium text-gray-900">{t.matterType}</div>
              <div className="text-xs text-gray-500">
                {t.name} • v{t.version} • {t.active ? 'Active' : 'Inactive'}
              </div>
              <div className="text-xs text-gray-500">CaseType: {t.caseType}</div>

              <button
                onClick={(e) => {
                  e.stopPropagation();
                  onDelete(t._id);
                }}
                className="mt-2 text-xs text-red-700 underline"
              >
                Delete
              </button>
            </div>
          ))}
        </div>

        <div className="lg:col-span-2 border border-gray-200 rounded p-3">
          {!selected ? (
            <div className="text-gray-500">Select a template to edit.</div>
          ) : (
            <>
              <div className="flex items-center justify-between mb-3">
                <div className="font-semibold text-gray-900">Edit Template (JSON)</div>
                <button onClick={onSave} className="px-4 py-2 bg-gray-900 text-white rounded hover:bg-gray-800">
                  Save
                </button>
              </div>

              <textarea
                value={editor}
                onChange={(e) => setEditor(e.target.value)}
                rows={26}
                className="w-full font-mono text-xs border border-gray-300 rounded p-3"
              />

              <p className="text-xs text-gray-500 mt-2">
                Ensure each step has unique key, order, title, stageKey, actions[], outputs[].
              </p>
            </>
          )}
        </div>
      </div>
    </div>
  );
}