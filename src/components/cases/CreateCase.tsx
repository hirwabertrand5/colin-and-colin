import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, ArrowRight, Check } from 'lucide-react';
import { createCase, CaseData } from '../../services/caseService';

export default function CreateCase() {
  const navigate = useNavigate();
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const [formData, setFormData] = useState<CaseData>({
    caseNo: '',
    parties: '',
    caseType: '',
    status: 'On Boarding',
    priority: 'Medium',
    assignedTo: '',
    description: '',
    workflow: 'land_dispute',
    estimatedDuration: '',
    budget: '',
  });

  const caseTypes = [
    'Transactional Cases',
    'Litigation Cases',
    'Labor Cases',
  ];

  const partners = [
    'Gatete Colin',
    'Mushimiyimana Janviere',
    'Ninsima James',
    'Kayumba Steven',
    'Manishimwe Cedrick',
    'Uwase Linda',
  ];

  const statuses = [
    'On Boarding',
    'Pre trial',
    'Mediation',
    'Hearing',
    'Appeal',
    'Pronouncement',
    'Cope of Judgement',
    'Execution',
  ];

  const handleInputChange = (field: string, value: string) => {
    setFormData({ ...formData, [field]: value });
  };

  const handleNext = () => {
    if (step < 3) setStep(step + 1);
  };

  const handleBack = () => {
    if (step > 1) setStep(step - 1);
  };

  const handleSubmit = async () => {
    setLoading(true);
    setError('');
    setSuccess('');
    try {
      await createCase(formData);
      setSuccess('Case created successfully!');
      setTimeout(() => navigate('/cases'), 1000);
    } catch (err: any) {
      setError(err.message || 'Failed to create case');
    } finally {
      setLoading(false);
    }
  };

  const canProceed = () => {
    if (step === 1) {
      return formData.caseNo && formData.parties && formData.caseType && formData.assignedTo;
    }
    if (step === 2) {
      return formData.workflow;
    }
    return true;
  };

  return (
    <div className="max-w-4xl mx-auto">
      {/* Header */}
      <div className="mb-6">
        <button
          onClick={() => navigate('/cases')}
          className="inline-flex items-center text-sm text-gray-600 hover:text-gray-900 mb-4"
        >
          <ArrowLeft className="w-4 h-4 mr-1" />
          Back to Cases
        </button>
        <h1 className="text-2xl font-semibold text-gray-900 mb-1">Create New Case</h1>
        <p className="text-gray-600">Follow the steps to set up a new case</p>
      </div>

      {/* Progress Steps */}
      <div className="mb-8">
        <div className="flex items-center">
          {[1, 2, 3].map((stepNumber, index) => (
            <div key={stepNumber} className="flex items-center flex-1">
              <div className="flex items-center">
                <div className={`
                  w-10 h-10 rounded-full flex items-center justify-center font-medium
                  ${step > stepNumber ? 'bg-gray-800 text-white' : 
                    step === stepNumber ? 'bg-gray-800 text-white' : 
                    'bg-gray-200 text-gray-500'}
                `}>
                  {step > stepNumber ? <Check className="w-5 h-5" /> : stepNumber}
                </div>
                <div className="ml-3">
                  <p className="text-sm font-medium text-gray-900">
                    {stepNumber === 1 && 'Case Basics'}
                    {stepNumber === 2 && 'Workflow Setup'}
                    {stepNumber === 3 && 'Review & Confirm'}
                  </p>
                </div>
              </div>
              {index < 2 && (
                <div className={`flex-1 h-0.5 mx-4 ${step > stepNumber ? 'bg-gray-800' : 'bg-gray-200'}`} />
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Error/Success */}
      {error && (
        <div className="mb-4 bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">
          {error}
        </div>
      )}
      {success && (
        <div className="mb-4 bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded">
          {success}
        </div>
      )}

      {/* Form Content */}
      <div className="bg-white border border-gray-200 rounded-lg p-6 mb-6">
        {/* Step 1: Case Basics */}
        {step === 1 && (
          <div className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Case No. *
              </label>
              <input
                type="text"
                value={formData.caseNo}
                onChange={(e) => handleInputChange('caseNo', e.target.value)}
                placeholder="e.g., RS/SCP/RCOM 00388/2024/TC"
                className="w-full px-3 py-2 border border-gray-300 rounded bg-white text-gray-900 focus:outline-none focus:ring-2 focus:ring-gray-400"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Parties *
              </label>
              <input
                type="text"
                value={formData.parties}
                onChange={(e) => handleInputChange('parties', e.target.value)}
                placeholder="e.g., John vs Smith"
                className="w-full px-3 py-2 border border-gray-300 rounded bg-white text-gray-900 focus:outline-none focus:ring-2 focus:ring-gray-400"
              />
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Case Type *
                </label>
                <select
                  value={formData.caseType}
                  onChange={(e) => handleInputChange('caseType', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded bg-white text-gray-900 focus:outline-none focus:ring-2 focus:ring-gray-400"
                >
                  <option value="">Select type</option>
                  {caseTypes.map(type => (
                    <option key={type} value={type}>{type}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Priority *
                </label>
                <select
                  value={formData.priority}
                  onChange={(e) => handleInputChange('priority', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded bg-white text-gray-900 focus:outline-none focus:ring-2 focus:ring-gray-400"
                >
                  <option value="Low">Low</option>
                  <option value="Medium">Medium</option>
                  <option value="High">High</option>
                </select>
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Assigned To *
              </label>
              <select
                value={formData.assignedTo}
                onChange={(e) => handleInputChange('assignedTo', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded bg-white text-gray-900 focus:outline-none focus:ring-2 focus:ring-gray-400"
              >
                <option value="">Select staff</option>
                {partners.map(partner => (
                  <option key={partner} value={partner}>{partner}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Case Description
              </label>
              <textarea
                value={formData.description}
                onChange={(e) => handleInputChange('description', e.target.value)}
                rows={4}
                placeholder="Brief description of the case..."
                className="w-full px-3 py-2 border border-gray-300 rounded bg-white text-gray-900 focus:outline-none focus:ring-2 focus:ring-gray-400"
              />
            </div>
          </div>
        )}

        {/* Step 2: Workflow Setup */}
        {step === 2 && (
          <div className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-3">
                Select Status *
              </label>
              <select
                value={formData.status}
                onChange={(e) => handleInputChange('status', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded bg-white text-gray-900 focus:outline-none focus:ring-2 focus:ring-gray-400"
              >
                {statuses.map(status => (
                  <option key={status} value={status}>{status}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-3">
                Workflow Template
              </label>
              <input
                type="text"
                value={formData.workflow}
                onChange={(e) => handleInputChange('workflow', e.target.value)}
                placeholder="e.g., land_dispute"
                className="w-full px-3 py-2 border border-gray-300 rounded bg-white text-gray-900 focus:outline-none focus:ring-2 focus:ring-gray-400"
              />
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Estimated Duration (days)
                </label>
                <input
                  type="number"
                  value={formData.estimatedDuration}
                  onChange={(e) => handleInputChange('estimatedDuration', e.target.value)}
                  placeholder="180"
                  className="w-full px-3 py-2 border border-gray-300 rounded bg-white text-gray-900 focus:outline-none focus:ring-2 focus:ring-gray-400"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Budget Estimate
                </label>
                <input
                  type="text"
                  value={formData.budget}
                  onChange={(e) => handleInputChange('budget', e.target.value)}
                  placeholder="e.g., RWF 10,000,000"
                  className="w-full px-3 py-2 border border-gray-300 rounded bg-white text-gray-900 focus:outline-none focus:ring-2 focus:ring-gray-400"
                />
              </div>
            </div>
          </div>
        )}

        {/* Step 3: Review & Confirm */}
        {step === 3 && (
          <div className="space-y-6">
            <div>
              <h3 className="text-sm font-medium text-gray-900 mb-4">Review Case Details</h3>
              <div className="space-y-4">
                <div className="grid grid-cols-3 gap-4 py-3 border-b border-gray-200">
                  <span className="text-sm text-gray-600">Case No.:</span>
                  <span className="col-span-2 text-sm font-medium text-gray-900">{formData.caseNo}</span>
                </div>
                <div className="grid grid-cols-3 gap-4 py-3 border-b border-gray-200">
                  <span className="text-sm text-gray-600">Parties:</span>
                  <span className="col-span-2 text-sm font-medium text-gray-900">{formData.parties}</span>
                </div>
                <div className="grid grid-cols-3 gap-4 py-3 border-b border-gray-200">
                  <span className="text-sm text-gray-600">Case Type:</span>
                  <span className="col-span-2 text-sm font-medium text-gray-900">{formData.caseType}</span>
                </div>
                <div className="grid grid-cols-3 gap-4 py-3 border-b border-gray-200">
                  <span className="text-sm text-gray-600">Assigned To:</span>
                  <span className="col-span-2 text-sm font-medium text-gray-900">{formData.assignedTo}</span>
                </div>
                <div className="grid grid-cols-3 gap-4 py-3 border-b border-gray-200">
                  <span className="text-sm text-gray-600">Priority:</span>
                  <span className="col-span-2 text-sm font-medium text-gray-900">{formData.priority}</span>
                </div>
                <div className="grid grid-cols-3 gap-4 py-3 border-b border-gray-200">
                  <span className="text-sm text-gray-600">Status:</span>
                  <span className="col-span-2 text-sm font-medium text-gray-900">{formData.status}</span>
                </div>
                {formData.description && (
                  <div className="py-3">
                    <span className="text-sm text-gray-600 block mb-2">Description:</span>
                    <p className="text-sm text-gray-900">{formData.description}</p>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Navigation Buttons */}
      <div className="flex items-center justify-between">
        <button
          onClick={handleBack}
          className={`inline-flex items-center px-4 py-2 border border-gray-300 rounded text-gray-700 hover:bg-gray-50 transition-colors ${
            step === 1 ? 'invisible' : ''
          }`}
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back
        </button>

        <div className="flex gap-3">
          <button
            onClick={() => navigate('/cases')}
            className="px-4 py-2 border border-gray-300 rounded text-gray-700 hover:bg-gray-50 transition-colors"
          >
            Cancel
          </button>

          {step < 3 ? (
            <button
              onClick={handleNext}
              disabled={!canProceed()}
              className="inline-flex items-center px-4 py-2 bg-gray-800 text-white rounded hover:bg-gray-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Next
              <ArrowRight className="w-4 h-4 ml-2" />
            </button>
          ) : (
            <button
              onClick={handleSubmit}
              disabled={loading}
              className="inline-flex items-center px-4 py-2 bg-gray-800 text-white rounded hover:bg-gray-700 transition-colors"
            >
              {loading ? 'Creating...' : (
                <>
                  <Check className="w-4 h-4 mr-2" />
                  Create Case
                </>
              )}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}