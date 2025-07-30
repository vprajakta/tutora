import React, { useEffect, useState, useContext, useCallback } from "react";
import axios from "axios";
import { Link } from "react-router-dom";
import { AppContext ,useSocket} from "../../context/AppContext.jsx";
import { toast } from "react-toastify";
import Loading from "../../components/student/Loading.jsx";

const MyDoubts = () => {
  const [doubts, setDoubts] = useState([]);
  const socket = useSocket();
  const { backendUrl, getToken, navigate } = useContext(AppContext);

  const fetchDoubts = async () => {
    try {
      const token = await getToken();
      const { data } = await axios.get(
        backendUrl + "/api/doubts/get-my-doubts",

        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      if (data.success) {
        setDoubts(data.doubts);
        toast.success(data.message);
        console.log(data.doubts);
      } else {
        toast.error(data.message);
      }
    } catch (error) {
      toast.error(error.message);
    }
  };
  const handleJoinMeet = useCallback((roomId, email) => {
    if (!email || !roomId) {
      toast.error("Missing email or room ID");
      return;
    }
    socket.emit("room:join", { email: email, room: roomId });
    navigate(`/room/${roomId}`);
  },[navigate]);

  useEffect(() => {
    fetchDoubts();
  }, []);

  useEffect(()=>{
          socket.on("room:join", handleJoinMeet);
          return () => {
              socket.off('room:join',handleJoinMeet)
          }
      },[socket,handleJoinMeet])

  return doubts ? (
    <>
      <div className="md:px-36 px-8 pt-10">
        <h1 className="text-2xl font-semibold">My Doubts</h1>

        <table className="md:table-auto table-fixed w-full overflow-hidden border mt-10">
          <thead className="text-gray-900 border-b border-gray-500/20 text-sm text-left max-sm:hidden">
            <tr>
              <th className="px-4 py-3 font-semibold truncate text-center">
                Query Title
              </th>
              <th className="px-4 py-3 font-semibold truncate text-center">
                Query Details
              </th>
              <th className="px-4 py-3 font-semibold truncate text-center">
                Course
              </th>

              <th className="px-4 py-3 font-semibold truncate text-center">
                Educator
              </th>
              <th className="px-4 py-3 font-semibold truncate text-center">
                status
              </th>
            </tr>
          </thead>
          <tbody className="text-gray-700">
            {doubts?.map((doubt, index) => {
              const currentTime = new Date();
              const scheduled = new Date(doubt.scheduledTime);
              const isPast =
                currentTime >= new Date(scheduled.getTime() - 1000 * 60 * 1000);
              const isFuture =
                currentTime <= new Date(scheduled.getTime() + 1000 * 60 * 1000);
              const isWithinJoinTime = isPast && isFuture;

              return (
                <tr key={index} className="border-b border-gray-500/20">
                  <td className="px-4 py-3 max-sm:hidden">
                    {doubt.queryTitle}
                  </td>
                  <td className="px-4 py-3 max-sm:hidden">
                    <p
                      dangerouslySetInnerHTML={{
                        __html: doubt.queryDetails.slice(0, 200),
                      }}
                    ></p>
                  </td>
                  <td className="px-4 py-3 max-sm:hidden">
                    {doubt.courseId?.courseTitle}
                  </td>
                  <td className="px-4 py-3 max-sm:hidden">
                    {doubt.educatorId?.name}
                  </td>
                  <td className="px-4 py-3 max-sm:hidden space-y-1">
                    {doubt.scheduledTime ? (
                      <>
                        {!doubt.isResolved && (
                          <span className="block text-sm font-medium text-blue-600 bg-blue-50  px-2 py-1 rounded-md w-max">
                            Scheduled:{" "}
                            {new Date(doubt.scheduledTime).toLocaleString()}
                          </span>
                        )}
                        {doubt.isResolved && (
                          <span className="block text-sm font-medium text-green-600 bg-green-50 px-2 py-1 rounded-md w-max">
                            Resolved By Educator {doubt.educatorId.name}
                          </span>
                        )}
                        {doubt.scheduledTime && isWithinJoinTime && (
                          <button
                            onClick={() =>
                              handleJoinMeet(
                                doubt?.videoRoomId,doubt?.studentId?.email
                              )
                            }
                            className="bg-blue-600 text-white px-3 py-1 rounded text-xs hover:bg-blue-700 transition cursor-pointer"
                          >
                            Join Meet
                          </button>
                        )}
                      </>
                    ) : (
                      <span className="block text-sm font-medium text-yellow-600 bg-yellow-100 px-2 py-1 rounded-md w-max">
                        Waiting for educator to schedule
                      </span>
                    )}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </>
  ) : (
    <Loading/>
  )

}

export default MyDoubts;