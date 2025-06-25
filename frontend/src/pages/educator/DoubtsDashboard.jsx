import React, { useEffect, useState, useContext, useCallback } from "react";
import axios from "axios";
import { AppContext, useSocket } from "../../context/AppContext.jsx";
import { toast } from "react-toastify";
import { useNavigate } from "react-router-dom";
import Loading from "../../components/student/Loading.jsx";

const DoubtsDashboard = () => {
  const { backendUrl, getToken } = useContext(AppContext);
  const socket = useSocket();
  const navigate = useNavigate();

  const [doubts, setDoubts] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [selectedDoubtId, setSelectedDoubtId] = useState(null);
  const [scheduledTime, setScheduledTime] = useState("");
  const [videoRoomId, setVideoRoomId] = useState("");

  

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

  const openModal = (doubtId) => {
    setSelectedDoubtId(doubtId);
    const generateRoomId = `${doubtId}-${Date.now()}`;
    setVideoRoomId(generateRoomId)
    setShowModal(true);
  };

  const closeModal = () => {
    setShowModal(false);
    setScheduledTime("");
    setVideoRoomId("");
  };

  const handleSchedule = async () => {
    try {
      const token = await getToken();
      const { data } = await axios.put(
        `${backendUrl}/api/doubts/schedule-doubt/${selectedDoubtId}`,
        {
          scheduledTime: new Date(scheduledTime),
          videoRoomId,
        },
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      if (data.success) {
        fetchDoubts();
        toast.success(data.message);
        closeModal();
      } else {
        toast.error(data.message);
      }
    } catch (err) {
      toast.error(err.message);
    }
  };

  const handleResolve = async (id) => {
    try {
      const token = await getToken();
      const { data } = await axios.put(
        `${backendUrl}/api/doubts/resolve-doubt/${id}`,
        {},
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      if (data.success) {
        fetchDoubts();
        toast.success(data.message);
      } else {
        toast.error(data.message);
      }
    } catch (err) {
      toast.error(err.message);
    }
  };

  const handleJoinMeet = useCallback(
    (roomId, educatorEmail) => {
      if (!roomId) {
        toast.error("Missing room");
        return;
      }
      console.log(roomId);
      if (!educatorEmail) {
        toast.error("Missing email");
        return;
      }

      socket.emit("room:join", { email: educatorEmail, room: roomId });
      navigate(`/room/${roomId}`);
    },
    [navigate]
  );

  useEffect(() => {
    socket.on("room:join", handleJoinMeet);
    return () => {
      socket.off("room:join", handleJoinMeet);
    };
  }, [socket, handleJoinMeet]);

  return doubts ? (
    <div className="p-4 md:px-10">
      <h2 className="text-2xl font-bold mb-6">Student Doubts</h2>

      <div className="overflow-x-auto">
        <table className="min-w-full text-sm text-left border rounded shadow-md">
          <thead className="bg-gray-100 border-b text-gray-700">
            <tr>
              <th className="px-4 py-3">Title</th>
              <th className="px-4 py-3">Details</th>
              <th className="px-4 py-3">Student</th>
              <th className="px-4 py-3">Course</th>
              <th className="px-4 py-3">Scheduled</th>
              <th className="px-4 py-3">Action</th>
            </tr>
          </thead>
          <tbody>
            {doubts.map((doubt) => {
              const currentTime = new Date();
              const scheduleTime = new Date(doubt.scheduledTime);
              const isPast =
                currentTime >=
                new Date(scheduleTime.getTime() - 1000 * 60 * 1000);
              const isFuture =
                currentTime <=
                new Date(scheduleTime.getTime() + 1000 * 60 * 1000);
              const isWithinJoinTime = isPast && isFuture;

              return (
                <tr key={doubt._id} className="border-b hover:bg-gray-50">
                  <td className="px-4 py-3 font-medium text-gray-800">
                    {doubt.queryTitle}
                  </td>
                  <td className="px-4 py-3 text-gray-700">
                    <p
                      dangerouslySetInnerHTML={{
                        __html: doubt.queryDetails.slice(0, 200),
                      }}
                    ></p>
                    
                  </td>
                  <td className="px-4 py-3">
                    {doubt.studentId?.name || "N/A"}
                  </td>
                  <td className="px-4 py-3">
                    {doubt.courseId?.courseTitle || "N/A"}
                  </td>
                  <td className="px-4 py-3 text-sm text-green-600">
                    {doubt.scheduledTime ? (
                      new Date(doubt.scheduledTime).toLocaleString()
                    ) : (
                      <span className="text-yellow-600">Not scheduled</span>
                    )}
                  </td>
                  <td className="px-4 py-3 space-y-2">
                    {!doubt.scheduledTime && (
                      <button
                        className="bg-purple-600 text-white px-2 py-1 rounded text-xs hover:bg-purple-700 transition"
                        onClick={() => openModal(doubt._id)}
                      >
                        Schedule
                      </button>
                    )}
                    {!doubt.isResolved && (
                      <button
                        className="bg-green-600 text-white px-2 py-1 rounded text-xs hover:bg-green-700 transition"
                        onClick={() => handleResolve(doubt._id)}
                      >
                        Resolve
                      </button>
                    )}
                    {doubt.isResolved && (
                      <span className=" text-xs text-white bg-yellow-500 px-3 py-1 rounded w-max">
                        Resolved
                      </span>
                    )}
                    {doubt.scheduledTime && isWithinJoinTime && (
                      <button
                        onClick={() => handleJoinMeet(doubt?.videoRoomId,doubt.educatorId?.email)}
                        className="bg-blue-600 text-white px-3 py-1 rounded text-xs hover:bg-blue-700 transition"
                      >
                        Join Meet
                      </button>
                    )}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 z-10 flex items-center justify-center bg-black bg-opacity-30">
          <div className="bg-white p-6 rounded-md shadow-md w-80">
            <h3 className="text-lg font-semibold mb-4">
              Schedule Doubt Session
            </h3>
            <label className="block mb-2 text-sm">Scheduled Time</label>
            <input
              type="datetime-local"
              value={scheduledTime}
              onChange={(e) => setScheduledTime(e.target.value)}
              className="w-full px-3 py-2 border rounded mb-4"
            />
            <label className="block mb-2 text-sm">Room ID</label>
            <input
              type="text"
              value={videoRoomId}
              readOnly
              placeholder="e.g., course123-user456"
              className="w-full px-3 py-2 border rounded mb-4"
            />
            <div className="flex justify-end space-x-2">
              <button
                onClick={closeModal}
                className="px-3 py-1 rounded bg-gray-300 hover:bg-gray-400 text-sm"
              >
                Cancel
              </button>
              <button
                onClick={handleSchedule}
                className="px-3 py-1 rounded bg-blue-600 text-white hover:bg-blue-700 text-sm"
              >
                Schedule
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
    
  )
  : (
    <Loading/>
  )
};

export default DoubtsDashboard;
