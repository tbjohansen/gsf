import React, { useState } from 'react';

const AccommodationForm = () => {
  const [formData, setFormData] = useState({
    // Section A
    fullName: '',
    gender: '',
    dateOfBirth: '',
    nationality: '',
    studentId: '',
    programOfStudy: '',
    yearOfStudy: '',
    phoneNumber: '',
    email: '',
    emergencyContactName: '',
    emergencyContactPhone: '',
    
    // Section B
    applicantType: '',
    preferredRoomType: '',
    selectedHostelName: '',
    roomType: '',
    checkInDate: '',
    durationOfStay: '',
    specialNeeds: '',
    specialNeedsDetails: '',
    
    // Section C
    paymentMethod: 'bankDeposit',
    bankName: '',
    accountName: '',
    accountNumber: '',
    paymentReference: '',
    amountPaid: '',
    paymentDate: '',
    
    // Section D
    inventory: {
      mattress: { quantity: '', condition: '', handedOver: '', date: '', remarks: '' },
      bedFrame: { quantity: '', condition: '', handedOver: '', date: '', remarks: '' },
      chair: { quantity: '', condition: '', handedOver: '', date: '', remarks: '' },
      studyTable: { quantity: '', condition: '', handedOver: '', date: '', remarks: '' },
      wardrobe: { quantity: '', condition: '', handedOver: '', date: '', remarks: '' },
      roomKey: { quantity: '', condition: '', handedOver: '', date: '', remarks: '' },
      lightFixtures: { quantity: '', condition: '', handedOver: '', date: '', remarks: '' },
    },
    
    // Section E
    signature: '',
    declarationDate: '',
  });

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleInventoryChange = (item, field, value) => {
    setFormData(prev => ({
      ...prev,
      inventory: {
        ...prev.inventory,
        [item]: {
          ...prev.inventory[item],
          [field]: value
        }
      }
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    // Form submission logic would go here
    console.log('Form submitted:', formData);
    alert('Form submitted successfully! Please send the filled form with payment slip to dss@kcmcu.ac.tr');
  };

  return (
    <div className="max-w-4xl mx-auto p-6 bg-white shadow-md rounded-lg">
      <header className="text-center mb-8 border-b pb-4">
        <h1 className="text-xl font-bold">THE GOOD SAMARITAN FOUNDATION</h1>
        <h2 className="text-lg font-semibold mt-2">ACCOMMODATION REQUEST FORM</h2>
      </header>

      <form onSubmit={handleSubmit} className="space-y-8">
        {/* SECTION A: APPLICANT INFORMATION */}
        <section className="border rounded-lg p-6">
          <h3 className="text-lg font-bold mb-4 border-b pb-2">SECTION A: APPLICANT INFORMATION</h3>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-1">Student's Full Name</label>
              <input
                type="text"
                name="fullName"
                value={formData.fullName}
                onChange={handleInputChange}
                className="w-full p-2 border rounded"
                required
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium mb-1">Gender</label>
              <div className="flex space-x-4">
                <label className="flex items-center">
                  <input
                    type="radio"
                    name="gender"
                    value="male"
                    checked={formData.gender === 'male'}
                    onChange={handleInputChange}
                    className="mr-2"
                  />
                  Male
                </label>
                <label className="flex items-center">
                  <input
                    type="radio"
                    name="gender"
                    value="female"
                    checked={formData.gender === 'female'}
                    onChange={handleInputChange}
                    className="mr-2"
                  />
                  Female
                </label>
              </div>
            </div>
            
            <div>
              <label className="block text-sm font-medium mb-1">Date of Birth</label>
              <input
                type="date"
                name="dateOfBirth"
                value={formData.dateOfBirth}
                onChange={handleInputChange}
                className="w-full p-2 border rounded"
                required
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium mb-1">Nationality</label>
              <input
                type="text"
                name="nationality"
                value={formData.nationality}
                onChange={handleInputChange}
                className="w-full p-2 border rounded"
                required
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium mb-1">Student/Staff ID Number</label>
              <input
                type="text"
                name="studentId"
                value={formData.studentId}
                onChange={handleInputChange}
                className="w-full p-2 border rounded"
                required
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium mb-1">Program of Study / School</label>
              <input
                type="text"
                name="programOfStudy"
                value={formData.programOfStudy}
                onChange={handleInputChange}
                className="w-full p-2 border rounded"
                required
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium mb-1">Year of Study</label>
              <input
                type="text"
                name="yearOfStudy"
                value={formData.yearOfStudy}
                onChange={handleInputChange}
                className="w-full p-2 border rounded"
                required
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium mb-1">Phone Number</label>
              <input
                type="tel"
                name="phoneNumber"
                value={formData.phoneNumber}
                onChange={handleInputChange}
                className="w-full p-2 border rounded"
                required
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium mb-1">Email Address</label>
              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleInputChange}
                className="w-full p-2 border rounded"
                required
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium mb-1">Emergency Contact Name & Relation</label>
              <input
                type="text"
                name="emergencyContactName"
                value={formData.emergencyContactName}
                onChange={handleInputChange}
                className="w-full p-2 border rounded"
                required
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium mb-1">Emergency Contact Phone Number</label>
              <input
                type="tel"
                name="emergencyContactPhone"
                value={formData.emergencyContactPhone}
                onChange={handleInputChange}
                className="w-full p-2 border rounded"
                required
              />
            </div>
          </div>
        </section>

        {/* SECTION B: ACCOMMODATION DETAILS */}
        <section className="border rounded-lg p-6">
          <h3 className="text-lg font-bold mb-4 border-b pb-2">SECTION B: ACCOMMODATION DETAILS</h3>
          
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-2">Type of Applicant</label>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                {['Undergraduate Student', 'Postgraduate Student', 'Staff', 'Visiting Scholar', 'Other'].map(type => (
                  <label key={type} className="flex items-center">
                    <input
                      type="radio"
                      name="applicantType"
                      value={type}
                      checked={formData.applicantType === type}
                      onChange={handleInputChange}
                      className="mr-2"
                    />
                    {type}
                  </label>
                ))}
              </div>
            </div>
            
            <div>
              <label className="block text-sm font-medium mb-2">Preferred Room Type</label>
              <div className="space-y-2">
                {[
                  "BISHOP STEPHANO MOSHI HOSTEL= 240,000 per semester (2 Decker's)",
                  "BISHOP STEPHANO MOSHI (Executive Rooms) = 100 USD per month for foreigners and 150,000 per month for Tanzanian students (Single rooms)",
                  "BISHOP STEPHANO MOSHI HOSTEL= 540,000 per semester (1 Decker)",
                  "BISHOP STEPHANO MOSHI HOSTEL= 600,000 per semester (2 separate beds)",
                  "NURU HOSTEL: 240,000 per semester (shared room)",
                  "NURU HOSTEL: 450,000 per semester (shared room)",
                  "KILIMANJARO HOSTEL 300,000 per semester (shared room)",
                  "CAUTION MONEY (Non Refundable) 30,000"
                ].map((option, index) => (
                  <label key={index} className="flex items-start">
                    <input
                      type="radio"
                      name="preferredRoomType"
                      value={option}
                      checked={formData.preferredRoomType === option}
                      onChange={handleInputChange}
                      className="mt-1 mr-2"
                    />
                    <span>{option}</span>
                  </label>
                ))}
              </div>
            </div>
            
            <div>
              <label className="block text-sm font-medium mb-1">Selected Hostel Name</label>
              <input
                type="text"
                name="selectedHostelName"
                value={formData.selectedHostelName}
                onChange={handleInputChange}
                className="w-full p-2 border rounded"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium mb-2">Room Type</label>
              <div className="flex space-x-4">
                <label className="flex items-center">
                  <input
                    type="radio"
                    name="roomType"
                    value="single"
                    checked={formData.roomType === 'single'}
                    onChange={handleInputChange}
                    className="mr-2"
                  />
                  Single Room
                </label>
                <label className="flex items-center">
                  <input
                    type="radio"
                    name="roomType"
                    value="shared"
                    checked={formData.roomType === 'shared'}
                    onChange={handleInputChange}
                    className="mr-2"
                  />
                  Shared Room
                </label>
              </div>
            </div>
            
            <div>
              <label className="block text-sm font-medium mb-1">Requested Check-in Date</label>
              <input
                type="date"
                name="checkInDate"
                value={formData.checkInDate}
                onChange={handleInputChange}
                className="w-full p-2 border rounded"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium mb-2">Expected Duration of Stay</label>
              <div className="flex flex-wrap gap-4">
                {['1 Semester', 'Full Academic Year', 'Short-Term'].map(duration => (
                  <label key={duration} className="flex items-center">
                    <input
                      type="radio"
                      name="durationOfStay"
                      value={duration}
                      checked={formData.durationOfStay === duration}
                      onChange={handleInputChange}
                      className="mr-2"
                    />
                    {duration}
                  </label>
                ))}
              </div>
            </div>
            
            <div>
              <label className="block text-sm font-medium mb-2">
                Do you have any special needs or health conditions related to accommodation?
              </label>
              <div className="flex space-x-4 mb-2">
                <label className="flex items-center">
                  <input
                    type="radio"
                    name="specialNeeds"
                    value="yes"
                    checked={formData.specialNeeds === 'yes'}
                    onChange={handleInputChange}
                    className="mr-2"
                  />
                  Yes
                </label>
                <label className="flex items-center">
                  <input
                    type="radio"
                    name="specialNeeds"
                    value="no"
                    checked={formData.specialNeeds === 'no'}
                    onChange={handleInputChange}
                    className="mr-2"
                  />
                  No
                </label>
              </div>
              {formData.specialNeeds === 'yes' && (
                <textarea
                  name="specialNeedsDetails"
                  value={formData.specialNeedsDetails}
                  onChange={handleInputChange}
                  className="w-full p-2 border rounded"
                  placeholder="Please specify"
                />
              )}
            </div>
          </div>
        </section>

        {/* SECTION C: PAYMENT INFORMATION */}
        <section className="border rounded-lg p-6">
          <h3 className="text-lg font-bold mb-4 border-b pb-2">SECTION C: PAYMENT INFORMATION</h3>
          
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-2">Payment Method</label>
              <div className="flex space-x-4">
                <label className="flex items-center">
                  <input
                    type="radio"
                    name="paymentMethod"
                    value="bankDeposit"
                    checked={formData.paymentMethod === 'bankDeposit'}
                    onChange={handleInputChange}
                    className="mr-2"
                  />
                  Bank Deposit
                </label>
              </div>
            </div>
            
            <div className="overflow-x-auto">
              <table className="min-w-full border-collapse border">
                <thead>
                  <tr className="bg-gray-100">
                    <th className="border p-2 text-left">HOSTEL NAME</th>
                    <th className="border p-2 text-left">A/C NAME</th>
                    <th className="border p-2 text-left">ACCO. NO</th>
                    <th className="border p-2 text-left">BANK NAME AND ADDRESS</th>
                    <th className="border p-2 text-left">SWIFT CODE</th>
                  </tr>
                </thead>
                <tbody>
                  <tr>
                    <td className="border p-2" rowSpan="3">Bishop Stephano Moshi Hostel</td>
                    <td className="border p-2">1: The GSF-KCMC</td>
                    <td className="border p-2">0106038001(TSHS A/C)</td>
                    <td className="border p-2">DTB Bank P.O.BOX 8395 MOSHI</td>
                    <td className="border p-2">DTKETZTZ</td>
                  </tr>
                  <tr>
                    <td className="border p-2">2: GSF House Rent</td>
                    <td className="border p-2">017103005117 (TSHS A/C)</td>
                    <td className="border p-2">NBC Ltd P.O.BOX 3030 MOSHI</td>
                    <td className="border p-2"></td>
                  </tr>
                  <tr>
                    <td className="border p-2">3: The GSF-KCMC</td>
                    <td className="border p-2">0106038002 (USD A/C)</td>
                    <td className="border p-2">NBC Ltd P.O.BOX 3030 MOSHI</td>
                    <td className="border p-2"></td>
                  </tr>
                  <tr>
                    <td className="border p-2">Kilimanjaro Hostel</td>
                    <td className="border p-2">GSF Kilimanjaro Hall</td>
                    <td className="border p-2">017101005242 (TSHS A/C)</td>
                    <td className="border p-2">NBC Ltd P.O.BOX 3030 MOSHI</td>
                    <td className="border p-2">NLCBTZTXOTM</td>
                  </tr>
                  <tr>
                    <td className="border p-2">Nuru Hostel and Other Hostel</td>
                    <td className="border p-2">GSF House Rent</td>
                    <td className="border p-2">017103005117 (TSHS A/C)</td>
                    <td className="border p-2">NBC Ltd P.O.BOX 3030 MOSHI</td>
                    <td className="border p-2">NLCBTZTXOTM</td>
                  </tr>
                </tbody>
              </table>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium mb-1">Bank Name</label>
                <input
                  type="text"
                  name="bankName"
                  value={formData.bankName}
                  onChange={handleInputChange}
                  className="w-full p-2 border rounded"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium mb-1">Account Name</label>
                <input
                  type="text"
                  name="accountName"
                  value={formData.accountName}
                  onChange={handleInputChange}
                  className="w-full p-2 border rounded"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium mb-1">Account Number</label>
                <input
                  type="text"
                  name="accountNumber"
                  value={formData.accountNumber}
                  onChange={handleInputChange}
                  className="w-full p-2 border rounded"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium mb-1">Payment Reference Number</label>
                <input
                  type="text"
                  name="paymentReference"
                  value={formData.paymentReference}
                  onChange={handleInputChange}
                  className="w-full p-2 border rounded"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium mb-1">Amount Paid (TZS)</label>
                <input
                  type="text"
                  name="amountPaid"
                  value={formData.amountPaid}
                  onChange={handleInputChange}
                  className="w-full p-2 border rounded"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium mb-1">Date of Payment</label>
                <input
                  type="date"
                  name="paymentDate"
                  value={formData.paymentDate}
                  onChange={handleInputChange}
                  className="w-full p-2 border rounded"
                />
              </div>
            </div>
          </div>
        </section>

        {/* SECTION D: INVENTORY HANDOVER RECORD */}
        <section className="border rounded-lg p-6">
          <h3 className="text-lg font-bold mb-4 border-b pb-2">SECTION D: INVENTORY HANDOVER RECORD</h3>
          
          <div className="overflow-x-auto">
            <table className="min-w-full border-collapse border">
              <thead>
                <tr className="bg-gray-100">
                  <th className="border p-2 text-left">Item Description</th>
                  <th className="border p-2 text-left">Quantity</th>
                  <th className="border p-2 text-left">Condition</th>
                  <th className="border p-2 text-left">Handed Over (Yes/No)</th>
                  <th className="border p-2 text-left">Date of Handover</th>
                  <th className="border p-2 text-left">Remarks</th>
                </tr>
              </thead>
              <tbody>
                {Object.entries(formData.inventory).map(([item, data]) => (
                  <tr key={item}>
                    <td className="border p-2 capitalize">{item.replace(/([A-Z])/g, ' $1')}</td>
                    <td className="border p-2">
                      <input
                        type="text"
                        value={data.quantity}
                        onChange={(e) => handleInventoryChange(item, 'quantity', e.target.value)}
                        className="w-full p-1 border rounded"
                      />
                    </td>
                    <td className="border p-2">
                      <select
                        value={data.condition}
                        onChange={(e) => handleInventoryChange(item, 'condition', e.target.value)}
                        className="w-full p-1 border rounded"
                      >
                        <option value="">Select</option>
                        {item === 'mattress' ? (
                          <>
                            <option value="new">New</option>
                            <option value="used">Used</option>
                          </>
                        ) : (
                          <>
                            <option value="good">Good</option>
                            <option value="fair">Fair</option>
                            <option value="functional">Functional</option>
                          </>
                        )}
                      </select>
                    </td>
                    <td className="border p-2">
                      <select
                        value={data.handedOver}
                        onChange={(e) => handleInventoryChange(item, 'handedOver', e.target.value)}
                        className="w-full p-1 border rounded"
                      >
                        <option value="">Select</option>
                        <option value="yes">Yes</option>
                        <option value="no">No</option>
                      </select>
                    </td>
                    <td className="border p-2">
                      <input
                        type="date"
                        value={data.date}
                        onChange={(e) => handleInventoryChange(item, 'date', e.target.value)}
                        className="w-full p-1 border rounded"
                      />
                    </td>
                    <td className="border p-2">
                      <input
                        type="text"
                        value={data.remarks}
                        onChange={(e) => handleInventoryChange(item, 'remarks', e.target.value)}
                        className="w-full p-1 border rounded"
                      />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>

        {/* SECTION E: DECLARATION BY APPLICANT */}
        <section className="border rounded-lg p-6">
          <h3 className="text-lg font-bold mb-4 border-b pb-2">SECTION E: DECLARATION BY APPLICANT</h3>
          
          <p className="mb-4">
            I undersigned declare that the information provided above is true and complete to the best of my knowledge. 
            I accept to receive the listed items in the condition described and agree to take full responsibility for them 
            during my stay. I understand that I will be required to return them in good condition upon vacating the accommodation.
          </p>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-1">Applicant's Signature</label>
              <input
                type="text"
                name="signature"
                value={formData.signature}
                onChange={handleInputChange}
                className="w-full p-2 border rounded"
                required
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium mb-1">Date</label>
              <input
                type="date"
                name="declarationDate"
                value={formData.declarationDate}
                onChange={handleInputChange}
                className="w-full p-2 border rounded"
                required
              />
            </div>
          </div>
        </section>

        {/* Important Notes */}
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
          <h4 className="font-bold mb-2">Important Notes:</h4>
          <ul className="list-disc pl-5 space-y-1">
            <li>Check-in services at the hostel will be available only during working hours Monday to Friday from 08:00 AM – 04:00 PM</li>
            <li>No services will be provided on Saturdays and Sundays</li>
            <li>Send a duly filled form with a scanned copy of the bank pay-in slip to email address: <strong>dss@kcmcu.ac.tr</strong></li>
            <li className="font-bold text-red-600">REMEMBER: Do not make any payment before liaising with the warden's office</li>
          </ul>
        </div>

        {/* Submit Button */}
        <div className="text-center">
          <button
            type="submit"
            className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-6 rounded"
          >
            Submit Form
          </button>
        </div>
      </form>
    </div>
  );
};

export default AccommodationForm;