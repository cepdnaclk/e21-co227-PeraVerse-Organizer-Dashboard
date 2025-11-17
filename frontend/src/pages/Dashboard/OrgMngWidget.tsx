import React, { useState, useEffect } from 'react';
// React - main library for creating UI components
//use state - hook for state variables  
//use effect - hook for side effects like data fetching

const OrgMngWidget: React.FC = () => { //declares a react functional component - to define components in React
  
  //state variables
  const [organizers, setOrganizers] = useState<any[]>([]); //holds the array of organizer objects fetched from backend

  const [searchId, setSearchId] = useState<number | null>(null); //holdss the ID entered in text box

  const [error, setError] = useState<string | null>(null); //stores error messages for dispaly

  const [loggedInUserEmail, setLoggedInUserEmail] = useState(''); //stores logged-in user's email

  // Editing state
  const [editingOrganizer, setEditingOrganizer] = useState<any | null>(null);
  //holds the organizer currently being edited

  const [editForm, setEditForm] = useState<any>({ //stores the input fields into edit form
    fname: '',
    lname: '',
    email: '',
    contact_no: '',
    password: '',
  });

  // Validation state
  const [validationErrors, setValidationErrors] = useState<any>({
    email: '',
    contact_no: ''
  });
  
  useEffect(() => { //runs once after the first render

    const getLoggedInUserEmail = (): string => {
      try {
        const authUser = localStorage.getItem('authUser');
        if (authUser) {
          const userObj = JSON.parse(authUser);
          return userObj.email?.toLowerCase().trim() || '';
        }
      } catch (err) {
        console.error("Error parsing logged-in user:", err);
      }
      return '';
    };

    const email = getLoggedInUserEmail();
    setLoggedInUserEmail(email);

    fetchOrganizers(); //call this function to fetch from db
    
  },[]);

  // Validation functions
  const validateEmail = (email: string): string => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!email.trim()) {
      return 'Email is required';
    }
    if (!emailRegex.test(email)) {
      return 'Please enter a valid email address';
    }
    return '';
  };

  const validateContactNumber = (contactNo: string): string => {
    const contactRegex = /^\d{10}$/;
    if (!contactNo.trim()) {
      return 'Contact number is required';
    }
    if (!contactRegex.test(contactNo)) {
      return 'Contact number must be exactly 10 digits';
    }
    return '';
  };

  const fetchOrganizers = async () => {
    try {
      const response = await fetch('http://localhost:5000/organizers', {
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('authToken')}`
        }
      });
      const data = await response.json();  //parse JSON response
      console.log('Fetched organizers data:', data); // Debug log
      setOrganizers(data); //update organizer state
    } catch (error) {
      console.error('Fetch organizers error:', error);
      setError('Failed to load organizers. Please try again later.');
    }
  };
  

  //handle delete when delete button clicked
  const handleDelete = async (id: number | string | undefined) => {
    // Validate that we have a valid ID
    if (!id || id === 'undefined' || id === 'null') {
      alert('Invalid organizer ID. Cannot delete this organizer.');
      return;
    }

    // Convert to number if it's a string
    const numericId = typeof id === 'string' ? parseInt(id, 10) : id;
    
    if (isNaN(numericId) || numericId <= 0) {
      alert('Invalid organizer ID. Cannot delete this organizer.');
      return;
    }

    if (window.confirm('Are you sure you want to delete this organizer?')) {
      try {

        //get JWT token from local storage for authentication
        const token = localStorage.getItem('authToken');

        const response = await fetch(`http://localhost:5000/organizers/${id}`, {
          method: 'DELETE',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}` // send JWT
          },
        });

        const result = await response.json();
        if (response.ok) {
          alert(result.message);
          setOrganizers(organizers.filter((org) => org.organizer_ID || org.id || org.organizerId || org.organizer_id !== id));
        } else {
          alert(result.message || 'Failed to delete organizer. Please try again.');
        }
      } catch (error) {
        console.error('Delete error:', error);
        alert('Failed to delete organizer. Please try again.');
      }
    }
  };

  
  const handleSearch = async () => {
    if (searchId !== null && searchId >= 1) {
      try {
        const response = await fetch(`http://localhost:5000/organizers/${searchId}`, {
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${localStorage.getItem('authToken')}`
          }
        });
        if (!response.ok) {
          setError('Organizer not found');
          return;
        }
        const data = await response.json();
        setOrganizers([data]);
      } catch (error) {
        setError('Failed to fetch organizer by ID.');
      }
    }
  };
  

  // Edit logic - when edit button is clicked
  const handleEditClick = async (organizer: any) => {
    const id = organizer.organizer_ID || organizer.id || organizer.organizerId || organizer.organizer_id;
    if (!id) {
      alert('Invalid organizer ID. Cannot edit this organizer.');
      return;
    }
    
    try {
        // get the token from localStorage
        const token = localStorage.getItem('authToken');
      const response = await fetch(`http://localhost:5000/organizers/${id}`, {
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        }
      });
      const data = await response.json();
      setEditingOrganizer(data);
      setEditForm({ // fill edit form with organizer's existing data
        fname: data.fname || data.Fname || '',
        lname: data.lname || data.Lname || '',
        email: data.email || '',
        contact_no: data.contact_no || '',
        password: '',
      });
      // Clear validation errors when starting a new edit
      setValidationErrors({
        email: '',
        contact_no: ''
      });
    } catch (error) {
      alert('Failed to fetch organizer details.');
    }
  };

  //when user type in edit form
  const handleEditFormChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setEditForm({ ...editForm, [name]: value });

    // Real-time validation
    if (name === 'email') {
      const emailError = validateEmail(value);
      setValidationErrors((prev: any) => ({ ...prev, email: emailError }));
    } else if (name === 'contact_no') {
      const contactError = validateContactNumber(value);
      setValidationErrors((prev: any) => ({ ...prev, contact_no: contactError }));
    }
  };
  

  //when save button clicked
  const handleEditFormSubmit = async (e: React.FormEvent) => {
    e.preventDefault(); //prevent default form reload
    if (!editingOrganizer) return;
    
    // Validate all fields before submission
    const emailError = validateEmail(editForm.email);
    const contactError = validateContactNumber(editForm.contact_no);
    
    setValidationErrors({
      email: emailError,
      contact_no: contactError
    });

    // Check if there are any validation errors
    if (emailError || contactError) {
      alert('Please fix the validation errors before submitting.');
      return;
    }
    
    //the id of the organizer being edited
    const id = editingOrganizer.organizer_ID || editingOrganizer.id || editingOrganizer.organizerId || editingOrganizer.organizer_id;
    
    
    if (!id) {
      alert('Invalid organizer ID. Cannot update this organizer.');
      return;
    }
 
    const token = localStorage.getItem('authToken'); // get token from localStorage

    
    try {
      // Map frontend field names to backend field names
      const updateData = {
        Fname: editForm.fname,
        Lname: editForm.lname,
        email: editForm.email,
        contact_no: editForm.contact_no,
        password: editForm.password,
      };
      
      const response = await fetch(`http://localhost:5000/organizers/${id}`, {
        method: 'PUT',
        headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`, // add token
      },
        body: JSON.stringify(updateData),
      });
      const result = await response.json();

      if (!response.ok) {
      alert(result.message || 'Failed to update organizer.');
      } else {
      // Update frontend state only if update succeeded
      setOrganizers((prev) => //take the previous state so that we can edit it safely
        prev.map((org) => { //loops through each organizer in the previous list
                            //create a new array where one organizer is replaced with one organizer updated

          const orgId = org.organizer_ID || org.id || org.organizerId || org.organizer_id;
          //take the organizer ID of the organizers from array

          return orgId === id ? result.organizer : org;
          //check if the currrent organizer ID is eqaul ro the edited ID
          //if yes, replace it with responese from backend
    
        })
      );
      alert(result.message || 'Organizer updated!');
    }
      
    } catch (error) {
      alert('Failed to update organizer.');
    } finally{
      // close the edit modal regardless of success or failure
      setEditingOrganizer(null);
    }
  };

  const handleEditCancel = () => {
    setEditingOrganizer(null);
    setValidationErrors({
      email: '',
      contact_no: ''
    });
  };




  return (
    <div>
      <h2 className="text-xl font-bold mb-4">Organizer Management</h2>    
  
     
      {/* Search Bar */}
      <div className="mb-4"> 
        <input
          type="number"
          min={1}
          placeholder="Search by Organizer ID"
          value={searchId ?? ''}    
          onChange={(e) => {
            const val = Number(e.target.value);
            setSearchId(val >= 1 ? val : null);
          }}
          className="p-2 border rounded"
        />
        <button
          onClick={handleSearch}
          className="ml-2 px-4 py-2 bg-blue-600 text-white rounded"
          disabled={searchId === null}
        >
          Search
        </button>
      </div>

      {error && <p className="text-red-500">{error}</p>}


      {/* Edit Modal/Section */}
      {editingOrganizer && (
        <div className="fixed inset-0 bg-black/30 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded shadow-lg w-full max-w-md">
            <h3 className="text-lg font-bold mb-4">Edit Organizer</h3>
            <form onSubmit={handleEditFormSubmit} className="space-y-4">
              <div>
                <label className="block font-medium mb-1">First Name</label>
                <input
                  name="fname"
                  value={editForm.fname}
                  onChange={handleEditFormChange}
                  className="w-full border p-2 rounded"
                  required
                />
              </div>
              <div>
                <label className="block font-medium mb-1">Last Name</label>
                <input
                  name="lname"
                  value={editForm.lname}
                  onChange={handleEditFormChange}
                  className="w-full border p-2 rounded"
                  required
                />
              </div>
              <div>
                <label className="block font-medium mb-1">Email</label>
                <input
                  name="email"
                  type="email"
                  value={editForm.email}
                  onChange={handleEditFormChange}
                  className={`w-full border p-2 rounded ${
                    validationErrors.email ? 'border-red-500' : 'border-gray-300'
                  }`}
                  required
                />
                {validationErrors.email && (
                  <p className="text-red-500 text-sm mt-1">{validationErrors.email}</p>
                )}
              </div>
              <div>
                <label className="block font-medium mb-1">Contact No</label>
                <input
                  name="contact_no"
                  type="tel"
                  value={editForm.contact_no}
                  onChange={handleEditFormChange}
                  onInput={(e) => {
                    // Only allow numeric input
                    const target = e.target as HTMLInputElement;
                    target.value = target.value.replace(/\D/g, '');
                  }}
                  className={`w-full border p-2 rounded ${
                    validationErrors.contact_no ? 'border-red-500' : 'border-gray-300'
                  }`}
                  placeholder="Enter 10-digit contact number"
                  maxLength={10}
                  required
                />
                {validationErrors.contact_no && (
                  <p className="text-red-500 text-sm mt-1">{validationErrors.contact_no}</p>
                )}
              </div>
              <div>
                <label className="block font-medium mb-1">Password</label>
                <input
                  name="password"
                  type="password"
                  value={editForm.password}
                  onChange={handleEditFormChange}
                  className="w-full border p-2 rounded"
                  required
                />
              </div>
              <div className="flex justify-end gap-2">
                <button
                  type="button"
                  onClick={handleEditCancel}
                  className="px-4 py-2 bg-gray-200 rounded"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={validationErrors.email || validationErrors.contact_no}
                  className={`px-4 py-2 rounded ${
                    validationErrors.email || validationErrors.contact_no
                      ? 'bg-gray-400 text-gray-200 cursor-not-allowed'
                      : 'bg-blue-600 text-white hover:bg-blue-700'
                  }`}
                >
                  Save
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Organizers Table */}
      <div className="overflow-hidden bg-white shadow sm:rounded-lg">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="py-2 px-4 border-b text-left">ID</th>
              
              <th className="py-2 px-4 border-b text-left">First Name</th>
              <th className="py-2 px-4 border-b text-left">Last Name</th>
              <th className="py-2 px-4 border-b text-left">Email</th>
              <th className="py-2 px-4 border-b text-left">Contact No</th>
              <th className="py-2 px-4 border-b text-left">Last Edited</th>
              <th className="py-2 px-4 border-b text-left">Actions</th>
            </tr>
          </thead>
          <tbody>
            {organizers.map((org, idx) => {
              const id = org.organizer_ID || org.id || org.organizerId || org.organizer_id;
              
              // Check if current organizer is the logged-in organizer
              
              const isLoggedInOrganizer = org.email?.toLowerCase().trim() === loggedInUserEmail?.toLowerCase().trim();                    
              
              return (
              <tr key={String(id ?? idx)}>
                <td>{id ?? '-'}</td>
                
                <td>{org.fname ?? '-'}</td>
                <td>{org.lname ?? '-'}</td>
                <td>{org.email ?? '-'}</td>
                <td>{org.contact_no ?? '-'}</td>

                <td>{org.edited_at ? new Date(org.edited_at).toLocaleString('en-LK', 
                    {timeZone: 'Asia/Colombo',
                    })
                    : '—'}
                </td>

                <td className="py-2 px-4 border-b">
                  
                  {/* Only enable Edit/Delete for logged-in organizer */}
                  <button
                  onClick={() => handleEditClick(org)}
                  className={`text-blue-600 hover:underline ${!isLoggedInOrganizer ? "opacity-15 cursor-not-allowed" : ""}`}
                  disabled={!isLoggedInOrganizer}
                  >
                  Edit
                  </button>

                  <button
                  onClick={() => handleDelete(id)}
                  className={`text-red-600 hover:underline ml-4 ${!isLoggedInOrganizer ? "opacity-15 cursor-not-allowed" : ""}`}
                  disabled={!isLoggedInOrganizer}
                  >
                  Delete
                  </button>

                </td>
              </tr>
              );
            })}
          </tbody>
        </table>
      </div>


    </div>
  );
};

export default OrgMngWidget;
