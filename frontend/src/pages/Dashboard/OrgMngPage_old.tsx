import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuthCheck } from '../../utils/useAuthCheck';

const OrgMangPage: React.FC = () => {
  // Get the organizer ID from the URL parameters
  const { id } = useParams();  
  // Hook for programmatic navigation
  const navigate = useNavigate();
  // Use our custom hook to check authentication
  const { handleTokenExpiration } = useAuthCheck();
  
  // State for the current organizer being edited
  const [organizer, setOrganizer] = useState<any>({
    organizer_name: '',
    fname: '',
    lname: '',
    email: '',
    contact_no: '',
    password: ''
  });
  
  // State for storing the list of all organizers
  const [organizers, setOrganizers] = useState<any[]>([]);

  // Effect to fetch organizer details when component mounts or ID changes
  useEffect(() => {
    // Check if ID exists before making API call
    if (!id) {
      console.error('Organizer ID is missing');
      return;
    }

    // Fetch the organizer details by ID
    const fetchOrganizer = async () => {
      try {        
        // Get authentication token from local storage
        const token = localStorage.getItem('authToken');
        console.log('Fetching organizer with ID:', id);  // Log the ID being used for the fetch
        
        // API call to get specific organizer data
        const response = await fetch(`http://localhost:5000/organizers/${id}`, {
          headers: {
            Authorization: `Bearer ${token}`
          }
        });
        
        // Check if response is 401 Unauthorized (token expired or invalid)
        if (response.status === 401) {
          console.error('Unauthorized: Token may have expired');
          handleTokenExpiration();
          return;
        }
        
        const data = await response.json();
        
        // Handle case where no data is returned
        if (!data) {
          console.error('No organizer found with this ID');
          return;
        }

        // Update state with fetched organizer data
        setOrganizer(data);
      } catch (error) {
        console.error('Error fetching organizer:', error);
        // Just log the error instead of forcing logout
        console.error('Network or server error when fetching organizer data');
      }
    };

    fetchOrganizer();
  }, [id]); // Dependency array - effect runs when ID changes

  // Effect to fetch all organizers when component mounts
  useEffect(() => {
    // Fetch all organizers for the table
    const fetchOrganizers = async () => {
      try {
        const response = await fetch('http://localhost:5000/organizers');
        const data = await response.json();
        setOrganizers(data);
      } catch (error) {
        console.error('Error fetching organizers:', error);
      }
    };

    fetchOrganizers();
  }, []); // Empty dependency array - runs only on mount

  // Handle form input changes
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    // Update organizer state with new input value
    setOrganizer({ ...organizer, [name]: value });
  };

  // Handle form submission for updating organizer
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      
      // API call to update organizer
      //get the token from local storage
      const token = localStorage.getItem('authToken');
      const response = await fetch(`http://localhost:5000/organizers/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json', 
          Authorization: `Bearer ${token}` 
        },
        body: JSON.stringify(organizer),
      });
      
      // Check if response is 401 Unauthorized (token expired or invalid)
      if (response.status === 401) {
        console.error('Unauthorized: Token may have expired');
        handleTokenExpiration();
        return;
      }
      
      const result = await response.json();
      alert(result.message);
      navigate('/organizers');  // Redirect to organizer list after successful update
    } catch (error) {
      console.error('Error updating organizer:', error);
    }
  };

  return (
    <div>
      {/* Edit Organizer Form Section */}
      <h2 className="text-xl font-bold mb-4">Edit Organizer</h2>
      <form onSubmit={handleSubmit}>
        <div className="space-y-4">
          {/* Organizer Name Input */}
          <div>
            <label className="block text-sm font-medium text-gray-700">Organizer Name</label>
            <input
              type="text"
              name="organizer_name"
              value={organizer.organizer_name}
              onChange={handleChange}
              className="mt-1 p-2 block w-full border rounded-md"
            />
          </div>
          
          {/* First Name Input */}
          <div>
            <label className="block text-sm font-medium text-gray-700">First Name</label>
            <input
              type="text"
              name="fname"
              value={organizer.fname}
              onChange={handleChange}
              className="mt-1 p-2 block w-full border rounded-md"
            />
          </div>
          
          {/* Last Name Input */}
          <div>
            <label className="block text-sm font-medium text-gray-700">Last Name</label>
            <input
              type="text"
              name="lname"
              value={organizer.lname}
              onChange={handleChange}
              className="mt-1 p-2 block w-full border rounded-md"
            />
          </div>
          
          {/* Email Input */}
          <div>
            <label className="block text-sm font-medium text-gray-700">Email</label>
            <input
              type="email"
              name="email"
              value={organizer.email}
              onChange={handleChange}
              className="mt-1 p-2 block w-full border rounded-md"
            />
          </div>
          
          {/* Contact Number Input */}
          <div>
            <label className="block text-sm font-medium text-gray-700">Contact No</label>
            <input
              type="text"
              name="contact_no"
              value={organizer.contact_no}
              onChange={handleChange}
              className="mt-1 p-2 block w-full border rounded-md"
            />
          </div>
          
          {/* Password Input */}
          <div>
            <label className="block text-sm font-medium text-gray-700">Password</label>
            <input
              type="password"
              name="password"
              value={organizer.password}
              onChange={handleChange}
              className="mt-1 p-2 block w-full border rounded-md"
            />
          </div>
          
          {/* Submit Button */}
          <button type="submit" className="px-6 py-2 bg-blue-600 text-white rounded-md">Update Organizer</button>
        </div>
      </form>

      {/* Organizers List Table Section */}
      <h2 className="text-xl font-bold mb-4 mt-8">Organizers List</h2>
      <div className="overflow-x-auto">
        <table className="min-w-full bg-white border border-gray-200">
          <thead>
            <tr className="bg-gray-100">
              <th className="py-2 px-4 border-b text-left">Organizer Name</th>
              <th className="py-2 px-4 border-b text-left">Actions</th>
            </tr>
          </thead>
          <tbody>
            {/* Map through organizers array to render table rows */}
            {organizers.map((org) => (
              <tr key={org.organizer_id}>
                <td>{org.organizer_name}</td>
                <td className="py-2 px-4 border-b">
                  {/* Edit Button */}
                  <button className="text-blue-600 hover:underline">Edit</button>
                  {/* Delete Button */}
                  <button className="text-red-600 hover:underline ml-4">Delete</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default OrgMangPage;