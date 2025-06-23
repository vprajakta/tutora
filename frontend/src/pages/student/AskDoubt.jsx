import React, { useState,useContext,useRef,useEffect } from "react";
import { useParams } from "react-router-dom";
import axios from "axios";
import Quill from 'quill'
import {toast} from 'react-toastify'
import { AppContext } from "../../context/AppContext.jsx";

const AskDoubt = () => {
  const { backendUrl, getToken } = useContext(AppContext);
  const [queryTitle, setQueryTitle] = useState("");

  const quillRef = useRef(null);
  const editorRef = useRef(null);

  const { courseId, lectureId } = useParams();

  useEffect(() => {
    //Intial Quill only once
    if (!quillRef.current && editorRef.current) {
      quillRef.current = new Quill(editorRef.current, {
        theme: "snow",
      });
    }
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    console.log("Submit triggered");
    try {
      const token = await getToken();
      console.log(token)
      const { data } = await axios.post(
        backendUrl + "/api/doubts/create-doubt",
        {
          courseId,
          lectureId,
          queryTitle,
          queryDetails: quillRef.current.root.innerHTML,
        },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      console.log(data);

      if (data.success) {
        toast.success(data.message);
        setQueryTitle("");
        quillRef.current.root.innerHTML = "";
      } else {
        toast.error(data.message);
      }
    } catch (error) {
      toast.error(error.message);
    }
  };
  return (
    <div className="h-screen overflow-scroll flex flex-col items-start justify-between md:pb-0 p-4 pt-8 pb-0">
      <form
        onSubmit={handleSubmit}
        action=""
        className="flex flex-col gap-4 max-w-md w-full text-gray-500"
      >
        <div className="flex flex-col gap-1">
          <p>Query Title</p>
          <input
            onChange={(e) => setQueryTitle(e.target.value)}
            value={queryTitle}
            type="text"
            placeholder="Type here"
            className="outline-none md:py-2.5 py-2 px-3 rounded border border-gray-500"
            required
          />
        </div>
        <div className="flex flex-col gap-1">
          <p>Query Details</p>
          <div ref={editorRef}></div>
        </div>

        <button
          type="submit"
          className="bg-black text-white w-max py-2.5 px-8 rounded my-4 cursor-pointer"
        >
          Submit
        </button>
      </form>
    </div>
  );
};

export default AskDoubt;
