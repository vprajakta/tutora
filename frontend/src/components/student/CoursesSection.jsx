import React, { useContext } from 'react'
import {Link} from 'react-router-dom'
import { AppContext } from '../../context/AppContext';
import CourseCard from './CourseCard';
const CoursesSection = () => {
  const {allCourses} = useContext(AppContext)
  return (
    <div className="px-8 py-16 md:px-40 ">
      <h2 className="text-3xl font-medium text-gray-800">
        Discover Your Next Lesson
      </h2>
      <p className="text-sm md:text-gray-500 text-base mt-3">
        Browse a wide range of expertly designed courses crafted to boost your
        skills and expand your knowledge — <br/>whether you're just starting out or
        looking to master new techniques.
      </p>
      <div className='grid grid-cols-4 px-4 md:my-16 my-10 gap-4'>
        {allCourses.slice(0,4).map((course,index)=><CourseCard key={index} course={course}/>)}
      </div>
      <Link
        to={"/course-list"}
        onClick={() => scrollTo(0, 0)}
        className=" inline-block text-gray-500 border border-gray-500/30 px-10 py-3 rounded mt-3 "
      >
        Show all courses
      </Link>
    </div>
  );
}

export default CoursesSection
