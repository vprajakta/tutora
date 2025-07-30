import { createContext, useEffect, useState, useContext, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import humanizeDuration from "humanize-duration";
import { useAuth, useUser } from "@clerk/clerk-react";
import axios from "axios";
import { toast } from "react-toastify";
import { io } from "socket.io-client";

// Create App Context
export const AppContext = createContext();

// Custom Hook to use socket
export const useSocket = () => {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error("useSocket must be used within an AppContextProvider");
  }
  return context.socket;
};

export const AppContextProvider = (props) => {
  const backendUrl = import.meta.env.VITE_BACKEND_URL;
  const currency = import.meta.env.VITE_CURRENCY;

  const { getToken } = useAuth();
  const { user } = useUser();
  const navigate = useNavigate();

  const [allCourses, setAllCourses] = useState([]);
  const [isEducator, setIsEducator] = useState(false);
  const [enrolledCourses, setEnrolledCourses] = useState([]);
  const [userData, setUserData] = useState(null);
  const [socket, setSocket] = useState(null);

  // Set base URL for Axios (optional)
  useEffect(() => {
    axios.defaults.baseURL = backendUrl;
  }, [backendUrl]);

  // Initialize socket connection
  useEffect(() => {
    const newSocket = io(backendUrl, {
      path: "/socket.io",
      transports: ["websocket"],
      withCredentials: true,
    });

    setSocket(newSocket);

    return () => {
      newSocket.disconnect();
    };
  }, [backendUrl]);

  // Fetch all courses
  const fetchAllCourses = async () => {
    try {
      const { data } = await axios.get("/api/course/all");
      if (data.success) {
        setAllCourses(data.courses);
      } else {
        toast.error(data.message);
      }
    } catch (error) {
      toast.error(error.message);
    }
  };

  // Fetch user data
  const fetchUserData = async () => {
    try {
      if (user?.publicMetadata?.role === "educator") {
        setIsEducator(true);
      }

      const token = await getToken();
      const { data } = await axios.get("/api/user/data", {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (data.success) {
        setUserData(data.user);
      } else {
        toast.error(data.message);
      }
    } catch (error) {
      toast.error(error.message);
    }
  };

  // Fetch enrolled courses
  const fetchUserEnrolledCourses = async () => {
    try {
      const token = await getToken();
      const { data } = await axios.get("/api/user/enrolled-courses", {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (data.success) {
        setEnrolledCourses(data.enrolledCourses.reverse());
      } else {
        toast.error(data.message);
      }
    } catch (error) {
      toast.error(error.message);
    }
  };

  // Calculate average rating
  const calculateRating = (course) => {
    if (course.courseRatings.length === 0) return 0;
    const totalRating = course.courseRatings.reduce(
      (sum, rating) => sum + rating.rating,
      0
    );
    return Math.floor(totalRating / course.courseRatings.length);
  };

  // Calculate chapter duration
  const calculateChapterTime = (chapter) => {
    const time = chapter.chapterContent.reduce(
      (sum, lecture) => sum + lecture.lectureDuration,
      0
    );
    return humanizeDuration(time * 60 * 1000, { units: ["h", "m"] });
  };

  // Calculate course duration
  const calculateCourseDuration = (course) => {
    let time = 0;
    course.courseContent.forEach((chapter) => {
      chapter.chapterContent.forEach((lecture) => {
        time += lecture.lectureDuration;
      });
    });
    return humanizeDuration(time * 60 * 1000, { units: ["h", "m"] });
  };

  // Calculate total number of lectures
  const calculateNoOfLectures = (course) => {
    return course.courseContent.reduce((total, chapter) => {
      return (
        total +
        (Array.isArray(chapter.chapterContent)
          ? chapter.chapterContent.length
          : 0)
      );
    }, 0);
  };

  // Initial fetch
  useEffect(() => {
    fetchAllCourses();
  }, []);

  useEffect(() => {
    const fetchUserDetails = async () => {
      try {
        await fetchUserData();
        await fetchUserEnrolledCourses();
      } catch (err) {
        toast.error("Error loading user data.");
      }
    };

    if (user) {
      fetchUserDetails();
    }
  }, [user]);

  const value = {
    currency,
    allCourses,
    navigate,
    calculateRating,
    isEducator,
    setIsEducator,
    calculateChapterTime,
    calculateCourseDuration,
    calculateNoOfLectures,
    enrolledCourses,
    fetchUserEnrolledCourses,
    backendUrl,
    userData,
    setUserData,
    getToken,
    fetchAllCourses,
    socket,
  };

  return (
    <AppContext.Provider value={value}>{props.children}</AppContext.Provider>
  );
};

