import { useEffect, useState } from 'react';
import { Upload, CheckCircle } from 'lucide-react';
import { getWorkflowForCase, completeWorkflowStep, WorkflowInstance } from '../../services/workflowInstanceService';
import { addDocumentToCase } from '../../services/documentService';
import { attachWorkflowOutput } from '../../services/workflowOutputService';

type Props = {
  caseId: string;
  canCompleteSteps: boolean;
  canUpload: boolean;
};

export default function CaseWorkflowTab({ caseId, canCompleteSteps, canUpload }: Props) {
  const [wf, setWf] = useState<WorkflowInstance | null>(null);
  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState('');
  const [busyKey, setBusyKey] = useState<string>('');

  const load = async () => {
    setLoading(true);
    setErr('');
    try {
      const data = await getWorkflowForCase(caseId);
      setWf(data);
    } catch (e: any) {
      setErr(e.message || 'Failed to load workflow');
      setWf(null);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
    // eslint-disable-next-line
  }, [caseId]);

  const uploadForOutput = async (stepKey: string, outputKey: string, outputName: string, category?: string) => {
    if (!canUpload) return;

    const input = document.createElement('input');
    input.type = 'file';
    input.onchange = async () => {
      const file = input.files?.[0];
      if (!file) return;

      try {
        setBusyKey(`${stepKey}:${outputKey}`);
        setErr('');

        // 1) upload document
        const uploaded = await addDocumentToCase(caseId, {
          name: outputName,
          file,
          category,
          workflowInstanceId: wf?._id,
          stepKey,
          outputKey,
        });

        if (!uploaded?._id) throw new Error('Upload succeeded but documentId missing.');

        // 2) attach to workflow output slot
        await attachWorkflowOutput({
          caseId,
          stepKey,
          outputKey,
          documentId: uploaded._id,
        });

        // 3) refresh
        await load();
      } catch (e: any) {
        setErr(e.message || 'Failed to upload deliverable');
      } finally {
        setBusyKey('');
      }
    };
    input.click();
  };

  const onCompleteStep = async (stepKey: string) => {
    if (!canCompleteSteps) return;
    try {
      setBusyKey(`complete:${stepKey}`);
      setErr('');
      const updated = await completeWorkflowStep(caseId, stepKey);
      setWf(updated);
    } catch (e: any) {
      setErr(e.message || 'Failed to complete step');
    } finally {
      setBusyKey('');
    }
  };

  if (loading) return <div className="py-8 text-gray-500">Loading workflow...</div>;
  if (err) return <div className="py-4 text-red-700 bg-red-50 border border-red-100 rounded px-4">{err}</div>;
  if (!wf) return <div className="py-8 text-gray-500">No workflow found for this case.</div>;

  const steps = [...wf.steps].sort((a, b) => a.order - b.order);

  return (
    <div className="space-y-4">
      <div className="bg-white border border-gray-200 rounded-lg p-5">
        <div className="flex items-center justify-between">
          <div>
            <div className="text-sm text-gray-500">Workflow status</div>
            <div className="text-lg font-semibold text-gray-900">{wf.status}</div>
          </div>
          <div className="text-sm text-gray-600">
            Current step: <span className="font-medium text-gray-900">{wf.currentStepKey || '—'}</span>
          </div>
        </div>
      </div>

      {steps.map((s) => (
        <div key={s.stepKey} className="bg-white border border-gray-200 rounded-lg overflow-hidden">
          <div className="px-5 py-4 border-b border-gray-200 flex items-center justify-between">
            <div>
              <div className="text-xs text-gray-500">{s.stepKey}</div>
              <div className="font-semibold text-gray-900">{s.title}</div>
              <div className="text-sm text-gray-600">Status: {s.status}</div>
            </div>

            {canCompleteSteps && (
              <button
                disabled={busyKey === `complete:${s.stepKey}` || s.status === 'Completed'}
                onClick={() => onCompleteStep(s.stepKey)}
                className="inline-flex items-center gap-2 px-3 py-2 bg-gray-900 text-white rounded hover:bg-gray-800 disabled:opacity-60"
              >
                <CheckCircle className="w-4 h-4" />
                Complete Step
              </button>
            )}
          </div>

          <div className="p-5">
            <div className="text-sm font-medium text-gray-900 mb-3">Deliverables</div>

            {s.outputs.length === 0 ? (
              <div className="text-sm text-gray-500">No deliverables defined for this step.</div>
            ) : (
              <div className="space-y-3">
                {s.outputs.map((o) => (
                  <div key={o.key} className="flex items-center justify-between gap-3 border border-gray-200 rounded p-3">
                    <div className="min-w-0">
                      <div className="font-medium text-gray-900 truncate">
                        {o.name} {o.required ? <span className="text-xs text-red-600">(required)</span> : null}
                      </div>
                      <div className="text-xs text-gray-500">
                        Output key: {o.key} {o.category ? `• Category: ${o.category}` : ''}
                      </div>
                      <div className="text-xs mt-1">
                        {o.documentId ? (
                          <span className="text-green-700 font-medium">Uploaded</span>
                        ) : (
                          <span className="text-gray-500">Not uploaded</span>
                        )}
                      </div>
                    </div>

                    {canUpload && (
                      <button
                        onClick={() => uploadForOutput(s.stepKey, o.key, o.name, o.category)}
                        disabled={busyKey === `${s.stepKey}:${o.key}`}
                        className="inline-flex items-center gap-2 px-3 py-2 border border-gray-300 rounded text-gray-700 hover:bg-gray-50 disabled:opacity-60"
                      >
                        <Upload className="w-4 h-4" />
                        Upload
                      </button>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      ))}
    </div>
  );
}