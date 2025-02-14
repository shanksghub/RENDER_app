import React, { useState, useEffect } from "react";
import axios from "axios";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL; 

const DisasterDashboard = () => {
  const [disasters, setDisasters] = useState([]);
  const [selectedDisaster, setSelectedDisaster] = useState(null);
  const [structuredData, setStructuredData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [userIds, setUserIds] = useState([]); // Selected user IDs
  const [availableUsers, setAvailableUsers] = useState([]); // Fetch user list

  useEffect(() => {
    fetchDisasters();
    fetchUsers();
  }, []);

  const fetchDisasters = async () => {
    try {
      const response = await axios.get(`${BACKEND_URL}/disasters`);
      setDisasters(response.data);
    } catch (error) {
      console.error("Error fetching disasters", error);
    }
  };

  const fetchUsers = async () => {
    try {
      const response = await axios.get(`${BACKEND_URL}/users`); // Fetch user list
      setAvailableUsers(response.data);
    } catch (error) {
      console.error("Error fetching users", error);
    }
  };

  const analyzeWithMistral = async (disaster) => {
    setLoading(true);
    try {
      const response = await axios.post(`${BACKEND_URL}/analyze`, {
        text: disaster.description,
      });
      setStructuredData(response.data);
      setSelectedDisaster(disaster);
    } catch (error) {
      console.error("Mistral analysis failed", error);
    }
    setLoading(false);
  };

  const toggleUserSelection = (userId) => {
    setUserIds((prev) =>
      prev.includes(userId) ? prev.filter((id) => id !== userId) : [...prev, userId]
    );
  };

  const sendAlert = async () => {
    if (userIds.length === 0) {
      alert("Select at least one user to send the alert.");
      return;
    }
    try {
      await axios.post(`${BACKEND_URL}/send-alert`, {
        message: structuredData,
        selected_user_ids: userIds, // Send user IDs, not phone numbers
      });
      alert("Alert sent successfully!");
    } catch (error) {
      console.error("Error sending alert", error);
    }
  };

  return (
    <div className="p-6">
      <h1 className="text-xl font-bold mb-4">Disaster Alerts</h1>
      <div className="grid grid-cols-2 gap-4">
        <div>
          <h2 className="font-semibold">Incoming Disasters</h2>
          {disasters.map((disaster) => (
            <Card
              key={disaster.id}
              className="cursor-pointer p-2 mb-2"
              onClick={() => analyzeWithMistral(disaster)}
            >
              <CardContent>{disaster.title}</CardContent>
            </Card>
          ))}
        </div>
        <div>
          {selectedDisaster && structuredData && (
            <div>
              <h2 className="font-semibold">Structured Data</h2>
              <Card className="p-2">
                <CardContent>
                  <p><strong>Location:</strong> {structuredData.location}</p>
                  <p><strong>Time:</strong> {structuredData.time}</p>
                  <p><strong>Severity:</strong> {structuredData.severity}</p>
                  <p><strong>Excerpt:</strong> "{structuredData.excerpt}"</p>
                </CardContent>
              </Card>

              {/* User Selection for Alerts */}
              <h3 className="font-semibold mt-4">Select Users to Notify</h3>
              <div className="max-h-40 overflow-y-auto">
                {availableUsers.map((user) => (
                  <div key={user.id} className="flex items-center gap-2">
                    <Checkbox
                      checked={userIds.includes(user.id)}
                      onCheckedChange={() => toggleUserSelection(user.id)}
                    />
                    <span>{user.name} (ID: {user.id})</span>
                  </div>
                ))}
              </div>

              <Button onClick={sendAlert} className="mt-4">Send Alert</Button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default DisasterDashboard;
