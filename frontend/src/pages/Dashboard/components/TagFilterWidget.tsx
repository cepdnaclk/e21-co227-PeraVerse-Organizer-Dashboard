// TagFilterWidget.tsx
import React, { useState } from "react";
import axios from "axios";

interface Building {
  id: string;
  building_id: number;
  zone_id: number;
  building_name: string;
  description: string;
  exhibits: string[];
  exhibit_tags: Record<string, string[]>;
}

const tags = [
  "AI",
  "ICT",
  "Structures",
  "Mechanical",
  "Civil",
  "Power",
  "Automation",
  "Robotics",
  "Electronics",
  "Software",
];

const TagFilterWidget: React.FC = () => {
  const [selectedTag, setSelectedTag] = useState<string>("");
  const [filteredBuildings, setFilteredBuildings] = useState<Building[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string>("");

  const token = localStorage.getItem("authToken");
  const axiosInstance = axios.create({
    baseURL: "http://localhost:5000",
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  const handleTagChange = async (tag: string) => {
    setSelectedTag(tag);
    if (!tag) return;

    setLoading(true);
    setError("");
    try {
      const res = await axiosInstance.get(`/buildings/filterByTag?tag=${tag}`);
      setFilteredBuildings(res.data || []);
    } catch (err: any) {
      console.error("Error fetching filtered buildings:", err);
      setError("No exhibits found for the selected tag.");
      setFilteredBuildings([]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-4 p-4 bg-white rounded shadow">
      <div>
        <label className="block font-medium mb-1">Filter Exhibits by Tag</label>
        <select
          value={selectedTag}
          onChange={(e) => handleTagChange(e.target.value)}
          className="w-full border p-2 rounded"
        >
          <option value="">Select Tag</option>
          {tags.map((t) => (
            <option key={t} value={t}>
              {t}
            </option>
          ))}
        </select>
      </div>

      {loading && <p>Loading buildings...</p>}
      {error && <p className="text-black-600">{error}</p>}

      {filteredBuildings.length > 0 && (
        <div className="space-y-2 mt-2">
          <h4 className="font-semibold">Buildings with "{selectedTag}" tag:</h4>
          {filteredBuildings.map((b) => (
            <div
              key={b.id}
              className="border p-2 rounded bg-gray-50"
            >
              <p>
                <span className="font-semibold">Name:</span> {b.building_name}
              </p>
              <p>
                <span className="font-semibold">Zone:</span> {b.zone_id}
              </p>
              <p>
                <span className="font-semibold">Exhibits:</span>{" "}
                {b.exhibits
                  .filter((ex) => b.exhibit_tags[ex]?.includes(selectedTag))
                  .join(", ") || "None"}
              </p>
            </div>
          ))}
        </div>
      )}

      {filteredBuildings.length === 0 && selectedTag && !loading && !error && (
        <p>No buildings found for this tag.</p>
      )}
    </div>
  );
};

export default TagFilterWidget;
