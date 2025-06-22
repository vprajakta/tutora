import React from 'react'
import { assets } from '../../assets/assets';

const Hero = () => {
  return (
    <div className="flex flex-col items-center justify-center w-full md:pt-36 pt-20 px-7 md:px-0 space-y-7 text-center bg-gradient-to-b from-cyan-100/7">
      <h1 className="md:text-3xl text-xl relative font-bold text-gray-800 max-w-3xl mx-auto">
        From Live Sessions to Lasting Knowledge.
        <span className="text-blue-600 ml-2">
          The Smart Way to Learn, Teach, and Transform.
        </span>
        <img
          src={assets.sketch}
          alt="sketch"
          className="md:block hidden absolute -bottom-7 right-0"
        />
      </h1>
      <p className="md:block hidden max-w-2xl mx-auto text-gray-500">
        Experience the future of education with{" "}
        <span className="font-serif text-indigo-600 text-2xl font-semibold italic tracking-wide drop-shadow-sm hover:text-indigo-700 transition-colors duration-300">
          Scholarly
        </span>{" "}
        — a modern tutoring platform powered by WebRTC and MERN stack, offering
        real-time mentoring, interactive screen sharing, and recorded sessions
        for review and feedback. Engage, educate, and elevate — all in one
        place.
      </p>
      <p className="md:hidden max-w-2xl mx-auto text-gray-500">
        Experience the future of education with{" "}
        <span className="font-serif text-indigo-600 text-xl font-semibold italic tracking-wide drop-shadow-sm hover:text-indigo-700 transition-colors duration-300">
          Scholarly
        </span>{" "}
        — a modern tutoring platform powered by WebRTC and MERN stack, offering
        real-time mentoring, interactive screen sharing, and recorded sessions
        for review and feedback. Engage, educate, and elevate — all in one
        place.
      </p>
    </div>
  );
}

export default Hero
