import React, { useEffect, useState, useContext } from "react";
import axios from "axios";
import { Link } from "react-router-dom";
import { AppContext } from "../../context/AppContext.jsx";
import { toast } from "react-toastify";

const MyDoubts = () => {
  const [doubts, setDoubts] = useState([]);

  const { backendUrl, getToken, navigate } = useContext(AppContext);
  useEffect(() => {
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
          console.log(data.doubts);
        } else {
          toast.error(data.message);
        }
      } catch (error) {
        toast.error(error.message);
      }
    };

    fetchDoubts();
  }, []);

  return (
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
            {doubts?.map((doubt, index) => (
              <tr key={index} className="border-b border-gray-500/20">
                <td className="px-4 py-3 max-sm:hidden">{doubt.queryTitle}</td>
                <td className="px-4 py-3 max-sm:hidden">
                  {doubt.queryDetails}
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
                      <span className="block text-sm font-medium text-green-600 bg-green-50 px-2 py-1 rounded-md w-max">
                        Scheduled:{" "}
                        {new Date(doubt.scheduledTime).toLocaleString()}
                      </span>
                      <Link
                        to={`/video-call?room=${doubt.videoRoomId}`}
                        className="inline-block mt-1 text-sm text-white bg-blue-600 hover:bg-blue-700 px-3 py-1 rounded shadow transition duration-200"
                      >
                        Join Video Call
                      </Link>
                    </>
                  ) : (
                    <span className="block text-sm font-medium text-yellow-600 bg-yellow-100 px-2 py-1 rounded-md w-max">
                      Waiting for educator to schedule
                    </span>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </>
  );
};

export default MyDoubts;
