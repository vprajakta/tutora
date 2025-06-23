import Doubt from "../models/Doubt.js";
import User from "../models/User.js";
import Course from "../models/Course.js";


export const createDoubt = async (req,res) => {

    try {
        
        const { courseId, lectureId, queryTitle, queryDetails } = req.body;

        const studentId = req.auth().userId;

        const course = await Course.findById(courseId);

        if (!course || !course.enrolledStudents?.includes(studentId)) {
          return res.json({
            success: false,
            message: "You are not enrolled in this course.",
          });
        }

        const doubt = new Doubt({
            courseId,
            lectureId,
            studentId,
            educatorId: course.educator,
            queryTitle,
            queryDetails,
        })

        await doubt.save()
        res.json({success:true, message: 'Doubt saved successfully',doubt})

    } catch (error) {
        console.error("Create Doubt Error:", error);
        res.json({ success:false,message: "Server error." });
    }
}

export const getDoubtsForEducator = async (req,res) => {
    try {
        const educatorId = req.auth().userId;
        const doubts = await Doubt.find({educatorId}).populate('studentId courseId')

        res.json({success:true, doubts});
    } catch (error) {
        console.error("Get Doubts Error:", error);
        res.json({success:true, message: "Server error." });
    }


}


export const getDoubtsForStudent = async (req,res) => {
    try {
        const studentId = req.auth().userId;
        const doubts = await Doubt.find({studentId}).populate('courseId educatorId')

        res.json({success:true, doubts})
    } catch (error) {
        console.error("Get Student Doubts Error:", error);
        res.json({ success:false,message: "Server error." });
    }
}

export const scheduleDoubtSession = async (req,res) =>{
    try {
        const {doubtId} = req.params;
        const {scheduledTime, videoRoomId} = req.body;
        const educatorId = req.auth().userId;

        const doubt = await Doubt.findById(doubtId);

        if(!doubt || doubt.educatorId !== educatorId)
        {
            return res.json({success:false, message:'Unauthorized or doubt not found'});
        }
        
        doubt.scheduledTime = new Date(scheduledTime);
        doubt.videoRoomId = videoRoomId;
        await doubt.save();
        res.json({success: true, message: 'Session Scheduled', doubt});
    } catch (error) {
        console.error("Schedule Session Error:", error);
        res.json({success:false, message: "Server error." });
    }
}

export const markDoubtResolved = async (req,res) =>{
    try {
        const {doubtId} = req.params;
        const educatorId = req.auth().userId;

        const doubt = await Doubt.findById(doubtId);

        if(!doubt || doubt.educatorId !== educatorId)
        {
            return res.json({success:false,message:'Unauthorized or doubt not found'});
        }

        doubt.isResolved = true;
        await doubt.save();
        res.json({success:true,message:'Doubt Marked as resolved'});
    } catch (error) {
        console.error("Resolve Error:", error);
        res.json({success:false, message: "Server error." });
    }
}