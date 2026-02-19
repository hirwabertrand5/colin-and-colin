import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, ArrowRight, Check } from 'lucide-react';

export default function CreateCase() {
  const navigate = useNavigate();
  const [step, setStep] = useState(1);
  const [formData, setFormData] = useState({
    // Step 1: Case Basics
    caseName: '',
    caseType: '',
    clientName: '',
    clientEmail: '',
    clientPhone: '',
    supervisingPartner: '',
    priority: 'Medium',
    description: '',
    
    // Step 2: Workflow Setup
    workflow: 'civil_litigation',
    estimatedDuration: '',
    budget: '',
    
    // Step 3: Review
  });

  const caseTypes = [
  'Civil (Land Dispute)',
  'Employment Dispute',
  'Debt Recovery',
  'Corporate Transaction',
  'Family Law',
  'Estate & Succession',
  'Commercial Litigation',
  'Regulatory Compliance',
];

  const partners = [
  'Gatete Colin',
  'Mushimiyimana Janviere',
  'Ninsima James',
  'Kayumba Steven',
  'Manishimwe Cedrick',
  'Uwase Linda',
];

  const workflows = [
  { id: 'land_dispute', name: 'Land Dispute Workflow', stages: 5, estimatedDays: 90 },
  { id: 'employment_dispute', name: 'Employment Dispute Workflow', stages: 4, estimatedDays: 60 },
  { id: 'recovery_track', name: 'Recovery Process', stages: 4, estimatedDays: 45 },
  { id: 'corporate_structure', name: 'Corporate Transaction Setup', stages: 3, estimatedDays: 30 },
  { id: 'estate_matter', name: 'Estate & Succession', stages: 3, estimatedDays: 40 },
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

  const handleSubmit = () => {
    // In a real app, this would save to backend
    console.log('Creating case:', formData);
    navigate('/cases');
  };

  const canProceed = () => {
    if (step === 1) {
      return formData.caseName && formData.caseType && formData.clientName && formData.supervisingPartner;
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

      {/* Form Content */}
      <div className="bg-white border border-gray-200 rounded-lg p-6 mb-6">
        {/* Step 1: Case Basics */}
        {step === 1 && (
          <div className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Case Name *
              </label>
              <input
                type="text"
                value={formData.caseName}
                onChange={(e) => handleInputChange('caseName', e.target.value)}
                placeholder="e.g., Smith vs. Johnson"
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

            <div className="border-t border-gray-200 pt-6">
              <h3 className="text-sm font-medium text-gray-900 mb-4">Client Information</h3>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Client Name *
                  </label>
                  <input
                    type="text"
                    value={formData.clientName}
                    onChange={(e) => handleInputChange('clientName', e.target.value)}
                    placeholder="Full name or company name"
                    className="w-full px-3 py-2 border border-gray-300 rounded bg-white text-gray-900 focus:outline-none focus:ring-2 focus:ring-gray-400"
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Email
                    </label>
                    <input
                      type="email"
                      value={formData.clientEmail}
                      onChange={(e) => handleInputChange('clientEmail', e.target.value)}
                      placeholder="client@email.com"
                      className="w-full px-3 py-2 border border-gray-300 rounded bg-white text-gray-900 focus:outline-none focus:ring-2 focus:ring-gray-400"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Phone
                    </label>
                    <input
                      type="tel"
                      value={formData.clientPhone}
                      onChange={(e) => handleInputChange('clientPhone', e.target.value)}
                      placeholder="(555) 123-4567"
                      className="w-full px-3 py-2 border border-gray-300 rounded bg-white text-gray-900 focus:outline-none focus:ring-2 focus:ring-gray-400"
                    />
                  </div>
                </div>
              </div>
            </div>

            <div className="border-t border-gray-200 pt-6">
              <h3 className="text-sm font-medium text-gray-900 mb-4">Case Assignment</h3>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Supervising Partner *
                  </label>
                  <select
                    value={formData.supervisingPartner}
                    onChange={(e) => handleInputChange('supervisingPartner', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded bg-white text-gray-900 focus:outline-none focus:ring-2 focus:ring-gray-400"
                  >
                    <option value="">Select partner</option>
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
            </div>
          </div>
        )}

        {/* Step 2: Workflow Setup */}
        {step === 2 && (
          <div className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-3">
                Select Workflow Template *
              </label>
              <div className="grid grid-cols-1 gap-3">
                {workflows.map((workflow) => (
                  <label
                    key={workflow.id}
                    className={`
                      relative flex items-start p-4 border rounded-lg cursor-pointer transition-colors
                      ${formData.workflow === workflow.id 
                        ? 'border-gray-800 bg-gray-50' 
                        : 'border-gray-300 hover:bg-gray-50'
                      }
                    `}
                  >
                    <input
                      type="radio"
                      name="workflow"
                      value={workflow.id}
                      checked={formData.workflow === workflow.id}
                      onChange={(e) => handleInputChange('workflow', e.target.value)}
                      className="mt-1"
                    />
                    <div className="ml-3 flex-1">
                      <p className="text-sm font-medium text-gray-900">{workflow.name}</p>
                      <p className="text-xs text-gray-500 mt-1">
                        {workflow.stages} stages • Estimated {workflow.estimatedDays} days
                      </p>
                    </div>
                  </label>
                ))}
              </div>
            </div>

            <div className="border-t border-gray-200 pt-6">
              <h3 className="text-sm font-medium text-gray-900 mb-4">Additional Details</h3>
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

            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <p className="text-sm text-blue-900">
                The selected workflow will automatically create task checklists and set up default deadlines based on the case type.
              </p>
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
                  <span className="text-sm text-gray-600">Case Name:</span>
                  <span className="col-span-2 text-sm font-medium text-gray-900">{formData.caseName}</span>
                </div>

                <div className="grid grid-cols-3 gap-4 py-3 border-b border-gray-200">
                  <span className="text-sm text-gray-600">Case Type:</span>
                  <span className="col-span-2 text-sm font-medium text-gray-900">{formData.caseType}</span>
                </div>

                <div className="grid grid-cols-3 gap-4 py-3 border-b border-gray-200">
                  <span className="text-sm text-gray-600">Client:</span>
                  <span className="col-span-2 text-sm font-medium text-gray-900">{formData.clientName}</span>
                </div>

                <div className="grid grid-cols-3 gap-4 py-3 border-b border-gray-200">
                  <span className="text-sm text-gray-600">Supervising Partner:</span>
                  <span className="col-span-2 text-sm font-medium text-gray-900">{formData.supervisingPartner}</span>
                </div>

                <div className="grid grid-cols-3 gap-4 py-3 border-b border-gray-200">
                  <span className="text-sm text-gray-600">Priority:</span>
                  <span className="col-span-2 text-sm font-medium text-gray-900">{formData.priority}</span>
                </div>

                <div className="grid grid-cols-3 gap-4 py-3 border-b border-gray-200">
                  <span className="text-sm text-gray-600">Workflow:</span>
                  <span className="col-span-2 text-sm font-medium text-gray-900">
                    {workflows.find(w => w.id === formData.workflow)?.name}
                  </span>
                </div>

                {formData.description && (
                  <div className="py-3">
                    <span className="text-sm text-gray-600 block mb-2">Description:</span>
                    <p className="text-sm text-gray-900">{formData.description}</p>
                  </div>
                )}
              </div>
            </div>

            <div className="bg-green-50 border border-green-200 rounded-lg p-4">
              <p className="text-sm text-green-900">
                Once created, the case will be assigned to {formData.supervisingPartner} and workflow tasks will be automatically generated.
              </p>
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
              className="inline-flex items-center px-4 py-2 bg-gray-800 text-white rounded hover:bg-gray-700 transition-colors"
            >
              <Check className="w-4 h-4 mr-2" />
              Create Case
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
