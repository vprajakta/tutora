import React from "react";
import "quill/dist/quill.snow.css";
import { Routes, Route, useMatch } from "react-router-dom";
import Home from "./pages/student/Home.jsx";
import CoursesList from "./pages/student/CoursesList.jsx";
import CourseDetails from "./pages/student/CourseDetails.jsx";
import MyEnrollments from "./pages/student/MyEnrollments.jsx";
import Player from "./pages/student/Player.jsx";
import Loading from "./components/student/Loading.jsx";
import Educator from "./pages/educator/Educator.jsx";
import Dashboard from "./pages/educator/Dashboard.jsx";
import StudentsEnrolled from "./pages/educator/StudentsEnrolled.jsx";
import MyCourses from "./pages/educator/MyCourses.jsx";
import AddCourse from "./pages/educator/AddCourse.jsx";
import Navbar from "./components/student/Navbar.jsx";
import { ToastContainer } from "react-toastify";
import Lobby from "./screens/Lobby.jsx";
import Room from "./screens/Room.jsx";
import AskDoubt from "./pages/student/AskDoubt.jsx";
import MyDoubts from "./pages/student/MyDoubts.jsx";
import DoubtsDashboard from "./pages/educator/DoubtsDashboard.jsx";


const App = () => {
  const isEducatorRoute = useMatch("/educator/*");
  return (
    <div className="text-default min-h-screen bg-white">
      <ToastContainer />
      {!isEducatorRoute && <Navbar />}
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/course-list" element={<CoursesList />} />
        <Route path="/course/:id" element={<CourseDetails />} />
        <Route path="/course-list/:input" element={<CoursesList />} />
        <Route path="/my-enrollments" element={<MyEnrollments />} />
        <Route path="/my-doubts" element={<MyDoubts />} />
        <Route path="/player/:courseId" element={<Player />} />
        <Route
          path="/player/:courseId/lecture/:lectureId/ask-doubt"
          element={<AskDoubt />}
        />
        <Route path="/loading/:path" element={<Loading />} />
        <Route path="/educator" element={<Educator />}>
          <Route path="/educator" element={<Dashboard />} />
          <Route path="add-course" element={<AddCourse />} />
          <Route path="my-courses" element={<MyCourses />} />
          <Route path="students-enrolled" element={<StudentsEnrolled />} />
          <Route path="doubts-dashboard" element={<DoubtsDashboard/>} />
        </Route>

        <Route path="/lobby" element={<Lobby />} />
        <Route path="/room/:roomId" element={<Room />} />
      </Routes>
    </div>
  );
};

export default App;
