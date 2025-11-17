
import React, { useState, useEffect } from 'react';
import { useNavigate } from "react-router-dom";
import { useAuthCheck } from "../../utils/useAuthCheck";




const OrgMngWidget: React.FC = () => {

  const navigate = useNavigate(); // ✅ to handle redirection
  const { handleTokenExpiration } = useAuthCheck(); // Use our custom hook
  // State for storing all organizers
  const [organizers, setOrganizers] = useState<any[]>([]);
  // State for storing search input by ID
  const [searchId, setSearchId] = useState<number | null>(null);
  // State for storing error messages
  const [error, setError] = useState<string | null>(null);

  // Editing state: stores the organizer currently being edited
  const [editingOrganizer, setEditingOrganizer] = useState<any | null>(null);
  // Form state for editing an organizer
  const [editForm, setEditForm] = useState<any>({
    fname: '',
    lname: '',
    email: '',
    contact_no: '',
    password: '',
  });


useEffect(() => {
  const token = localStorage.getItem("authToken");

  //  Show message if token missing
  if (!token) {
    handleTokenExpiration();
    return;
  }

  fetchOrganizers();
}, [navigate]);


  // Function to fetch all organizers from the backend
  const fetchOrganizers = async () => {
    try {
      // Get auth token from localStorage (if your API requires authentication)
      const token = localStorage.getItem('authToken');
      const response = await fetch('http://localhost:5000/organizers', {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      //  Handle invalid/expired token from backend
      if (response.status === 401 || response.status === 403) {
        // Show token expiration message without forcing logout
        handleTokenExpiration();
        return;
      }

      const data = await response.json();
      console.log('Fetched organizers data:', data);
      setOrganizers(data);

    } catch (error) {
      console.error('Fetch organizers error:', error);
      setError('Failed to load organizers. Please try again later.');
    }
  };

  // Function to delete an organizer by ID
  const handleDelete = async (id: number | string | undefined) => {
    // Validate that we have a proper ID
    if (!id || id === 'undefined' || id === 'null') {
      alert('Invalid organizer ID. Cannot delete this organizer.');
      return;
    }

    // Convert string IDs to number
    const numericId = typeof id === 'string' ? parseInt(id, 10) : id;

    if (isNaN(numericId) || numericId <= 0) {
      alert('Invalid organizer ID. Cannot delete this organizer.');
      return;
    }

    if (window.confirm('Are you sure you want to delete this organizer?')) {
      try {
        const token = localStorage.getItem('authToken'); 
        const response = await fetch(`http://localhost:5000/organizers/${numericId}`, {
          method: 'DELETE',
          headers: {
            Authorization: `Bearer ${token}` // attach token if required
          }
        });
        
        // Check if token expired
        if (response.status === 401 || response.status === 403) {
          handleTokenExpiration();
          return;
        }
        
        const result = await response.json();
        if (response.ok) {
          alert(result.message);
          // Remove deleted organizer from the list
          setOrganizers(organizers.filter((org) => org.organizer_ID !== numericId));
        } else {
          alert(result.message || 'Failed to delete organizer. Please try again.');
        }
      } catch (error) {
        console.error('Delete error:', error);
        alert('Failed to delete organizer. Please try again.');
      }
    }
  };

  // Function to search organizer by ID
  const handleSearch = async () => {
    if (searchId !== null && searchId >= 1) {
      try {
        const token = localStorage.getItem('authToken'); // optional token
        const response = await fetch(`http://localhost:5000/organizers/${searchId}`, {
          headers: {
            Authorization: `Bearer ${token}`
          }
        });
        
        // Check if token expired
        if (response.status === 401 || response.status === 403) {
          handleTokenExpiration();
          return;
        }
        
        if (!response.ok) {
          setError('Organizer not found');
          return;
        }
        const data = await response.json();
        setOrganizers([data]); // Show only the searched organizer
      } catch (error) {
        setError('Failed to fetch organizer by ID.');
      }
    }
  };



  //  Function called when clicking "Edit" button
const handleEditClick = async (organizer: any) => {
  const id =
    organizer.organizer_ID ||
    organizer.id ||
    organizer.organizerId ||
    organizer.organizer_id;

  if (!id) {
    alert("Invalid organizer ID. Cannot edit this organizer.");
    return;
  }

  try {
    const token = localStorage.getItem("authToken");
    const response = await fetch(`http://localhost:5000/organizers/${id}`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    //  Check if token is invalid or expired
    if (response.status === 401 || response.status === 403) {
      // Show token expiration message without forcing logout
      handleTokenExpiration();
      return;
    }

    if (!response.ok) {
      throw new Error("Failed to fetch organizer details.");
    }

    const data = await response.json();

    // Prefill the edit form
    setEditingOrganizer(data);
    setEditForm({
      fname: data.fname || data.Fname || "",
      lname: data.lname || data.Lname || "",
      email: data.email || "",
      contact_no: data.contact_no || "",
      password: "", // Password is blank initially
    });
  } catch (error) {
    alert("Failed to fetch organizer details.");
  }
};



//  Function to handle changes in the edit form
const handleEditFormChange = (e: React.ChangeEvent<HTMLInputElement>) => {
  setEditForm({ ...editForm, [e.target.name]: e.target.value });
};



//  Function to submit the edit form
const handleEditFormSubmit = async (e: React.FormEvent) => {
  e.preventDefault();
  if (!editingOrganizer) return;

  const id =
    editingOrganizer.organizer_ID ||
    editingOrganizer.id ||
    editingOrganizer.organizerId ||
    editingOrganizer.organizer_id;

  if (!id) {
    alert("Invalid organizer ID. Cannot update this organizer.");
    return;
  }

  try {
    // Prepare data to send to backend
    const updateData = {
      Fname: editForm.fname,
      Lname: editForm.lname,
      email: editForm.email,
      contact_no: editForm.contact_no,
      password: editForm.password,
    };

    const token = localStorage.getItem("authToken");
    const response = await fetch(`http://localhost:5000/organizers/${id}`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(updateData),
    });

    //  Check if token is invalid or expired
    if (response.status === 401 || response.status === 403) {
      // Show token expiration message without forcing logout
      handleTokenExpiration();
      return;
    }

    if (!response.ok) {
      throw new Error("Failed to update organizer.");
    }

    const result = await response.json();
    alert(result.message || "Organizer updated successfully!");

    // Update the local state so UI reflects the new changes
    setOrganizers((prev) =>
      prev.map((org) => {
        const orgId =
          org.organizer_ID ||
          org.id ||
          org.organizerId ||
          org.organizer_id;
        return orgId === id
          ? {
              ...org,
              ...editForm,
              organizer_name: `${editForm.fname} ${editForm.lname}`,
            }
          : org;
      })
    );

    setEditingOrganizer(null); // close edit modal
  } catch (error) {
    alert("Failed to update organizer.");
  }
};



//  Cancel editing
const handleEditCancel = () => {
  setEditingOrganizer(null);
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
                  value={editForm.email}
                  onChange={handleEditFormChange}
                  className="w-full border p-2 rounded"
                  required
                />
              </div>
              <div>
                <label className="block font-medium mb-1">Contact No</label>
                <input
                  name="contact_no"
                  value={editForm.contact_no}
                  onChange={handleEditFormChange}
                  className="w-full border p-2 rounded"
                  required
                />
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
                  className="px-4 py-2 bg-blue-600 text-white rounded"
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
              <th className="py-2 px-4 border-b text-left">Organizer Name</th>
              <th className="py-2 px-4 border-b text-left">First Name</th>
              <th className="py-2 px-4 border-b text-left">Last Name</th>
              <th className="py-2 px-4 border-b text-left">Email</th>
              <th className="py-2 px-4 border-b text-left">Contact No</th>
              <th className="py-2 px-4 border-b text-left">Actions</th>
            </tr>
          </thead>
          <tbody>
            {organizers.map((org, idx) => {
              const id = org.organizer_ID || org.id || org.organizerId || org.organizer_id;
              return (
              <tr key={String(id ?? idx)}>
                <td>{id ?? '-'}</td>
                <td>{org.organizer_name ?? '-'}</td>
                <td>{org.fname ?? '-'}</td>
                <td>{org.lname ?? '-'}</td>
                <td>{org.email ?? '-'}</td>
                <td>{org.contact_no ?? '-'}</td>
                <td className="py-2 px-4 border-b">
                  <button
                    onClick={() => handleEditClick(org)}
                    className="text-blue-600 hover:underline"
                  >
                    Edit
                  </button>
                  <button
                    onClick={() => {
                      console.log('Delete button clicked for organizer:', org);
                      console.log('Organizer ID:', org.organizer_ID);
                      // Try different possible field names for the ID
                      const id = org.organizer_ID || org.id || org.organizerId || org.organizer_id;
                      console.log('Using ID:', id);
                      handleDelete(id);
                    }}
                    className="text-red-600 hover:underline ml-4"
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
 

