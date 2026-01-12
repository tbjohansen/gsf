import React, { useState } from 'react';

const ApplicationLetter = () => {
  const [applicationData, setApplicationData] = useState({
    fullName: '',
    employeeId: '',
    department: 'Human Resources',
    position: '',
    currentAddress: '',
    familySize: 1,
    yearsOfService: 1,
    applicationLetter: '',
    date: new Date().toISOString().split('T')[0],
    contactPhone: '',
    contactEmail: ''
  });

  const [isPreview, setIsPreview] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);

  const departments = [
    'Human Resources',
    'Finance',
    'Operations',
    'IT',
    'Marketing',
    'Sales',
    'Administration',
    'Engineering'
  ];

  const defaultLetterTemplate = `Dear Managing Director,

I am writing to formally apply for company housing accommodation as per the employee benefits policy. 

My current living situation requires improvement due to [brief reason - distance from work, family needs, etc.]. The company housing would significantly enhance my work-life balance and productivity.

I assure you that I will maintain the property with utmost care and comply with all housing regulations. This accommodation would greatly support my continued dedication to the company.

Thank you for considering my application.

Yours faithfully,
[Your Name]`;

  const handleChange = (e) => {
    const { name, value } = e.target;
    setApplicationData(prev => ({
      ...prev,
      [name]: name === 'familySize' || name === 'yearsOfService' ? parseInt(value) || 0 : value
    }));
  };

  const handleLetterChange = (e) => {
    setApplicationData(prev => ({
      ...prev,
      applicationLetter: e.target.value
    }));
  };

  const handleUseTemplate = () => {
    let template = defaultLetterTemplate.replace('[Your Name]', applicationData.fullName || '[Your Name]');
    setApplicationData(prev => ({
      ...prev,
      applicationLetter: template
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!isPreview) {
      setIsPreview(true);
      return;
    }
    
    // In a real app, you would send data to backend here
    console.log('Application submitted:', applicationData);
    setIsSubmitted(true);
    setIsPreview(false);
  };

  const handleEdit = () => {
    setIsPreview(false);
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { 
      year: 'numeric', 
      month: 'long', 
      day: 'numeric' 
    });
  };

  if (isSubmitted) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-gray-100 p-4 md:p-8">
        <div className="max-w-6xl mx-auto">
          <div className="bg-white rounded-2xl shadow-xl p-8 text-center">
            <div className="mb-6">
              <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg className="w-10 h-10 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path>
                </svg>
              </div>
              <h1 className="text-3xl font-bold text-gray-800 mb-2">Application Submitted Successfully!</h1>
              <p className="text-gray-600">Your housing application has been received.</p>
            </div>
            
            <div className="bg-gray-50 rounded-xl p-6 mb-6 text-left max-w-2xl mx-auto">
              <h2 className="text-xl font-semibold text-gray-800 mb-4">Application Summary</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <p className="text-gray-600">Application ID:</p>
                  <p className="font-semibold">HAP-{Date.now().toString().slice(-8)}</p>
                </div>
                <div>
                  <p className="text-gray-600">Applicant:</p>
                  <p className="font-semibold">{applicationData.fullName}</p>
                </div>
                <div>
                  <p className="text-gray-600">Submission Date:</p>
                  <p className="font-semibold">{formatDate(applicationData.date)}</p>
                </div>
                <div>
                  <p className="text-gray-600">Status:</p>
                  <p className="font-semibold text-blue-600">Under Review</p>
                </div>
              </div>
            </div>
            
            <p className="text-gray-600 mb-8 max-w-2xl mx-auto">
              You will receive a confirmation email at {applicationData.contactEmail} within 24 hours. 
              Our housing committee will review your application and contact you within 5-7 working days.
            </p>
            
            <button 
              onClick={() => {
                setIsSubmitted(false);
                setApplicationData({
                  fullName: '',
                  employeeId: '',
                  department: 'Human Resources',
                  position: '',
                  currentAddress: '',
                  familySize: 1,
                  yearsOfService: 1,
                  applicationLetter: '',
                  date: new Date().toISOString().split('T')[0],
                  contactPhone: '',
                  contactEmail: ''
                });
              }}
              className="bg-blue-600 text-white px-8 py-3 rounded-lg font-semibold hover:bg-blue-700 transition-colors"
            >
              Submit Another Application
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-gray-100 p-4 md:p-8">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <header className="mb-8 text-center">
          <h1 className="text-3xl md:text-4xl font-bold text-gray-800 mb-2">
            Company Housing Application
          </h1>
          <p className="text-gray-600">
            Apply for employee housing accommodation by submitting a formal letter to the Managing Director
          </p>
        </header>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Application Form */}
          <div className={`lg:col-span-2 ${isPreview ? 'hidden lg:block' : 'block'}`}>
            <div className="bg-white rounded-2xl shadow-xl p-6 md:p-8">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-bold text-gray-800">Application Form</h2>
                <span className="bg-blue-100 text-blue-800 text-sm font-medium px-3 py-1 rounded-full">
                  Step 1: Fill Details
                </span>
              </div>

              <form onSubmit={handleSubmit}>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
                  {/* Personal Information */}
                  <div className="space-y-4">
                    <h3 className="text-lg font-semibold text-gray-700 border-b pb-2">
                      Personal Information
                    </h3>
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Full Name *
                      </label>
                      <input
                        type="text"
                        name="fullName"
                        value={applicationData.fullName}
                        onChange={handleChange}
                        required
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition"
                        placeholder="John Smith"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Employee ID *
                      </label>
                      <input
                        type="text"
                        name="employeeId"
                        value={applicationData.employeeId}
                        onChange={handleChange}
                        required
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition"
                        placeholder="EMP-12345"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Department *
                      </label>
                      <select
                        name="department"
                        value={applicationData.department}
                        onChange={handleChange}
                        required
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition"
                      >
                        {departments.map(dept => (
                          <option key={dept} value={dept}>{dept}</option>
                        ))}
                      </select>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Position *
                      </label>
                      <input
                        type="text"
                        name="position"
                        value={applicationData.position}
                        onChange={handleChange}
                        required
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition"
                        placeholder="Senior Developer"
                      />
                    </div>
                  </div>

                  {/* Housing Details */}
                  <div className="space-y-4">
                    <h3 className="text-lg font-semibold text-gray-700 border-b pb-2">
                      Housing Requirements
                    </h3>
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Current Address *
                      </label>
                      <input
                        type="text"
                        name="currentAddress"
                        value={applicationData.currentAddress}
                        onChange={handleChange}
                        required
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition"
                        placeholder="123 Main Street, City"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Family Size *
                      </label>
                      <div className="flex items-center space-x-4">
                        <input
                          type="range"
                          name="familySize"
                          min="1"
                          max="10"
                          value={applicationData.familySize}
                          onChange={handleChange}
                          className="w-full"
                        />
                        <span className="text-lg font-semibold text-blue-600 min-w-[2rem]">
                          {applicationData.familySize}
                        </span>
                      </div>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Years of Service *
                      </label>
                      <div className="flex items-center space-x-4">
                        <input
                          type="range"
                          name="yearsOfService"
                          min="0"
                          max="30"
                          value={applicationData.yearsOfService}
                          onChange={handleChange}
                          className="w-full"
                        />
                        <span className="text-lg font-semibold text-blue-600 min-w-[2rem]">
                          {applicationData.yearsOfService}
                        </span>
                      </div>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Application Date *
                      </label>
                      <input
                        type="date"
                        name="date"
                        value={applicationData.date}
                        onChange={handleChange}
                        required
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition"
                      />
                    </div>
                  </div>

                  {/* Contact Information */}
                  <div className="md:col-span-2 space-y-4">
                    <h3 className="text-lg font-semibold text-gray-700 border-b pb-2">
                      Contact Information
                    </h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Phone Number *
                        </label>
                        <input
                          type="tel"
                          name="contactPhone"
                          value={applicationData.contactPhone}
                          onChange={handleChange}
                          required
                          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition"
                          placeholder="+1234567890"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Email Address *
                        </label>
                        <input
                          type="email"
                          name="contactEmail"
                          value={applicationData.contactEmail}
                          onChange={handleChange}
                          required
                          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition"
                          placeholder="john.smith@company.com"
                        />
                      </div>
                    </div>
                  </div>
                </div>

                {/* Application Letter */}
                <div className="mb-8">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-lg font-semibold text-gray-700">
                      Application Letter to Managing Director *
                    </h3>
                    <button
                      type="button"
                      onClick={handleUseTemplate}
                      className="text-sm bg-blue-50 text-blue-600 px-4 py-2 rounded-lg hover:bg-blue-100 transition-colors"
                    >
                      Use Template
                    </button>
                  </div>
                  
                  <div className="border-2 border-gray-200 rounded-lg p-1">
                    <textarea
                      name="applicationLetter"
                      value={applicationData.applicationLetter}
                      onChange={handleLetterChange}
                      required
                      rows={12}
                      className="w-full px-4 py-3 border-0 focus:ring-0 outline-none resize-none rounded-lg"
                      placeholder="Write your formal application letter here..."
                    />
                  </div>
                  <p className="text-sm text-gray-500 mt-2">
                    Write a formal letter requesting housing allocation. Include reasons for your application and any special circumstances.
                  </p>
                </div>

                <div className="flex justify-between items-center pt-6 border-t">
                  <div className="text-sm text-gray-500">
                    All fields marked with * are required
                  </div>
                  <button
                    type="submit"
                    className="bg-blue-600 text-white px-8 py-3 rounded-lg font-semibold hover:bg-blue-700 transition-colors flex items-center"
                  >
                    Preview Application
                    <svg className="w-5 h-5 ml-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7"></path>
                    </svg>
                  </button>
                </div>
              </form>
            </div>
          </div>

          {/* Preview Section */}
          <div className={`${isPreview ? 'block' : 'hidden lg:block'}`}>
            <div className="sticky top-8">
              <div className="bg-white rounded-2xl shadow-xl p-6 md:p-8">
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-2xl font-bold text-gray-800">Application Preview</h2>
                  <span className="bg-green-100 text-green-800 text-sm font-medium px-3 py-1 rounded-full">
                    {isPreview ? 'Step 2: Review' : 'Live Preview'}
                  </span>
                </div>

                <div className="space-y-6">
                  {isPreview && (
                    <div className="bg-blue-50 border border-blue-200 rounded-xl p-4 mb-4">
                      <div className="flex items-start">
                        <svg className="w-5 h-5 text-blue-600 mt-0.5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path>
                        </svg>
                        <p className="text-sm text-blue-700">
                          Review your application carefully before submission. You can go back to edit if needed.
                        </p>
                      </div>
                    </div>
                  )}

                  {/* Preview Card */}
                  <div className="border border-gray-200 rounded-xl p-6 bg-gray-50">
                    <div className="text-center mb-6">
                      <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                        <svg className="w-8 h-8 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4"></path>
                        </svg>
                      </div>
                      <h3 className="text-xl font-bold text-gray-800">Housing Application</h3>
                      <p className="text-gray-600">To: Managing Director</p>
                    </div>

                    <div className="space-y-4">
                      <div className="grid grid-cols-2 gap-4 text-sm">
                        <div>
                          <p className="text-gray-500">Applicant</p>
                          <p className="font-semibold">{applicationData.fullName || 'Not provided'}</p>
                        </div>
                        <div>
                          <p className="text-gray-500">Employee ID</p>
                          <p className="font-semibold">{applicationData.employeeId || 'Not provided'}</p>
                        </div>
                        <div>
                          <p className="text-gray-500">Department</p>
                          <p className="font-semibold">{applicationData.department}</p>
                        </div>
                        <div>
                          <p className="text-gray-500">Position</p>
                          <p className="font-semibold">{applicationData.position || 'Not provided'}</p>
                        </div>
                        <div>
                          <p className="text-gray-500">Family Size</p>
                          <p className="font-semibold">{applicationData.familySize} members</p>
                        </div>
                        <div>
                          <p className="text-gray-500">Service Years</p>
                          <p className="font-semibold">{applicationData.yearsOfService} years</p>
                        </div>
                      </div>

                      <div className="border-t pt-4">
                        <p className="text-gray-500 mb-2">Application Letter Preview:</p>
                        <div className="bg-white border rounded-lg p-4 max-h-60 overflow-y-auto">
                          <p className="text-sm text-gray-700 whitespace-pre-line">
                            {applicationData.applicationLetter || 'No letter content yet...'}
                          </p>
                        </div>
                      </div>

                      <div className="border-t pt-4">
                        <p className="text-gray-500 mb-2">Contact Information:</p>
                        <div className="text-sm">
                          <p className="font-semibold">{applicationData.contactPhone || 'Phone not provided'}</p>
                          <p className="text-blue-600">{applicationData.contactEmail || 'Email not provided'}</p>
                        </div>
                      </div>

                      <div className="border-t pt-4 text-xs text-gray-500">
                        <p>Application Date: {formatDate(applicationData.date)}</p>
                      </div>
                    </div>
                  </div>

                  {isPreview ? (
                    <div className="space-y-4">
                      <button
                        onClick={handleSubmit}
                        className="w-full bg-green-600 text-white py-3 rounded-lg font-semibold hover:bg-green-700 transition-colors"
                      >
                        Submit Application
                      </button>
                      <button
                        onClick={handleEdit}
                        className="w-full border-2 border-gray-300 text-gray-700 py-3 rounded-lg font-semibold hover:bg-gray-50 transition-colors"
                      >
                        Edit Application
                      </button>
                    </div>
                  ) : (
                    <div className="text-center p-4 border-2 border-dashed border-gray-300 rounded-xl">
                      <svg className="w-12 h-12 text-gray-400 mx-auto mb-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 15l-2 5L9 9l11 4-5 2zm0 0l5 5M7.188 2.239l.777 2.897M5.136 7.965l-2.898-.777M13.95 4.05l-2.122 2.122m-5.657 5.656l-2.12 2.122"></path>
                      </svg>
                      <p className="text-gray-600">Fill the form to see live preview here</p>
                    </div>
                  )}
                </div>
              </div>

              {/* Information Panel */}
              <div className="mt-6 bg-white rounded-2xl shadow-xl p-6">
                <h3 className="text-lg font-semibold text-gray-800 mb-4">Application Guidelines</h3>
                <ul className="space-y-3 text-sm text-gray-600">
                  <li className="flex items-start">
                    <svg className="w-5 h-5 text-green-500 mr-2 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path>
                    </svg>
                    <span>Ensure all personal details are accurate</span>
                  </li>
                  <li className="flex items-start">
                    <svg className="w-5 h-5 text-green-500 mr-2 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path>
                    </svg>
                    <span>Letter should be formal and concise</span>
                  </li>
                  <li className="flex items-start">
                    <svg className="w-5 h-5 text-green-500 mr-2 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path>
                    </svg>
                    <span>Mention any special circumstances</span>
                  </li>
                  <li className="flex items-start">
                    <svg className="w-5 h-5 text-green-500 mr-2 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path>
                    </svg>
                    <span>Review carefully before submission</span>
                  </li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ApplicationLetter;