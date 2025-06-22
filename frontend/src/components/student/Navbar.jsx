import React, { useContext } from "react";
import { assets } from "../../assets/assets.js";
import { data, Link, useLocation } from "react-router-dom";
import { useClerk, useUser, UserButton } from "@clerk/clerk-react";
import { AppContext } from "../../context/AppContext.jsx";
import axios from "axios";
import { toast } from "react-toastify";
const Navbar = () => {



  const {navigate, isEducator, setIsEducator, backendUrl, getToken} =useContext(AppContext)
  const location = useLocation();
  const { openSignIn } = useClerk();
  const { user } = useUser();
  
  const becomeEducator = async () =>{
    try {
      if(isEducator){
        navigate('/educator');
        return;
      }
      const token = await getToken()
      const {data} = await axios.get(backendUrl + '/api/educator/update-role',{headers: {Authorization: `Bearer ${token}`}})
      if(data.success){
        setIsEducator(true)
        toast.success(data.message)
      }
      else{
        toast.error(data.message)
      }
    } catch (error) {
      toast.error(error.message)
    }
  }

  const isCourseListPage = location.pathname.includes("/course-list");
  console.log(location.pathname);
  return (
    <div
      className={`flex items-center justify-between px-4 sm:px-10 md:px-14 lg:px-36 border-b border-gray-500 py-4 ${
        isCourseListPage ? "bg-white" : "bg-cyan-100/70"
      }`}
    >
      <img
        onClick={() => navigate("/")}
        src={assets.logo}
        alt="logo"
        className="w-28 lg:w-32 cursor-pointer "
      />
      <div className="hidden md:flex items-center gap-5 text-gray-500">
        {user && (
          <div className="flex items-center gap-5">
            <button className="cursor-pointer" onClick={becomeEducator}>
              {isEducator ? "Educator Dashboard" : "Become Educator"}
            </button>
            | <Link to="/my-enrollments">My Enrollments</Link>
          </div>
        )}
        {user ? (
          <UserButton />
        ) : (
          <button
            onClick={() => openSignIn()}
            className="bg-blue-600 text-white px-5 py-2 rounded-full"
          >
            Create Account
          </button>
        )}
      </div>
      <div className="md:hidden flex items-center gap-2 sm:gap-5 text-gray-500  ">
        <div className="flex items-center gap-1 sm:gap-2 max-sm:text-xs">
          {user && (
            <>
              <button onClick={becomeEducator}>
                {isEducator ? "Educator Dashboard" : "Become Educator"}
              </button>
              | <Link to="/my-enrollments">My Enrollments</Link>
            </>
          )}
        </div>
        {user ? (
          <UserButton />
        ) : (
          <button onClick={() => openSignIn()}>
            <img src={assets.user_icon} alt="user" />
          </button>
        )}
      </div>
    </div>
  );
};

export default Navbar;
