import React, { useState, useEffect } from "react";
import axios from "axios";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL; 

const DisasterDashboard = () => {
  const [disasters, setDisasters] = useState([]);
  const [selectedDisaster, setSelectedDisaster] = useState(null);
  const [structuredData, setStructuredData] = useState(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetchDisasters();
  }, []);

  const fetchDisasters = async () => {
    try {
      const response = await axios.get(`${BACKEND_URL}/disasters`);
      setDisasters(response.data);
    } catch (error) {
      console.error("Error fetching disasters", error);
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

  const sendAlert = async () => {
    try {
      await axios.post(`${BACKEND_URL}/send-alert`, {
        message: structuredData,
        selected_users: ["+1234567890"], // Replace with actual user phone numbers
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
                  <Button onClick={sendAlert} className="mt-2">Send Alert</Button>
                </CardContent>
              </Card>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default DisasterDashboard;
