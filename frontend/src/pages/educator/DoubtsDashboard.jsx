import React, { useEffect, useState, useContext } from "react";
import axios from "axios";
import { AppContext } from "../../context/AppContext.jsx";

const DoubtsDashboard = () => {
  const { backendUrl, navigate, getToken } = useContext(AppContext);
  const [doubts, setDoubts] = useState([]);

  const fetchDoubts = async () => {
    try {
      const token = await getToken();
      const { data } = await axios.get(
        backendUrl + "/api/doubts/get-doubts-educator",
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      if (data.success) {
        setDoubts(data.doubts);
        console.log(data.doubts);
      } else {
        toast.error(data.message);
      }
    } catch (error) {
      toast.error(error.message);
    }
  };

  useEffect(() => {
    fetchDoubts();
  }, []);

  const handleSchedule = async (id) => {
    const dateTime = prompt("Enter meeting time (YYYY-MM-DD HH:MM)");
    const roomId = prompt("Enter video room ID (e.g., course123-user456)");
    try {
      await axios.put(`/api/doubts/schedule/${id}`, {
        scheduledTime: new Date(dateTime),
        videoRoomId: roomId,
      });
      fetchDoubts();
    } catch (err) {
      alert("Failed to schedule");
    }
  };

  const handleResolve = async (id) => {
    await axios.put(`/api/doubts/resolve/${id}`);
    fetchDoubts();
  };

  return (
    <div className="p-4">
      <h2 className="text-xl font-bold mb-4">Student Doubts</h2>
      {doubts.map((doubt) => (
        <div key={doubt._id} className="border p-4 mb-3 rounded shadow">
          <h3 className="font-semibold">{doubt.queryTitle}</h3>
          <p>{doubt.queryDetails}</p>
          <p className="text-sm text-gray-500">From: {doubt.studentId?.name}</p>
          <p className="text-sm text-gray-500">
            Course: {doubt.courseId?.courseTitle}
          </p>

          {!doubt.scheduledTime ? (
            <button
              className="bg-purple-500 text-white px-3 py-1 mt-2 rounded"
              onClick={() => handleSchedule(doubt._id)}
            >
              Schedule Session
            </button>
          ) : (
            <p className="text-green-600 mt-2">
              Scheduled on: {new Date(doubt.scheduledTime).toLocaleString()}
            </p>
          )}

          {!doubt.isResolved && (
            <button
              className="bg-green-500 text-white px-3 py-1 mt-2 ml-2 rounded"
              onClick={() => handleResolve(doubt._id)}
            >
              Mark Resolved
            </button>
          )}
        </div>
      ))}
    </div>
  );
};

export default DoubtsDashboard;
