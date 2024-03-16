const express = require("express");
const router = express.Router();
const mongoose = require('mongoose');

const User=require("../../models/User");
const Course = require("../../models/course/Course");
const File = require("../../models/course/File");
const Module = require("../../models/course/Module");
const Section = require("../../models/course/Section");
const CreationRequest = require("../../models/instructors/CreationRequest");
const authenticateAdmin =  require("../../middleware/authenticateAdmin");
const authenticateAdminInstructor =  require("../../middleware/authenticateAdminInstructor");

// Fetching all course creation requests
router.get('/courses',authenticateAdmin, async (req, res) => {
    try {
        const requests = await CreationRequest.find({ entityType: 'Course' });
        let courses=[];
        for(let request of requests){
            const course = await Course.findById(request.entityId);
            courses.push(course);
        }

        res.json({ success: true, courses: courses });
    } catch (err) {
        console.error(err);
        res.status(500).json({ success: false, message: 'Internal server error' });
    }
});

// Fetching all module creation requests
router.get('/modules',authenticateAdmin, async (req, res) => {
    try {
        const requests = await CreationRequest.find({ entityType: 'Module' });
        let modules=[];
        for(let request of requests){
            const module = await Module.findById(request.entityId);
            modules.push(module);
        }

        res.json({ success: true, modules: modules });
    } catch (err) {
        console.error(err);
        res.status(500).json({ success: false, message: 'Internal server error' });
    }
});

//Approving course creation request
router.put('/approve/course/:courseId', async (req, res) => {
    const courseId = req.params.courseId;
    try {
        // Update course approvalStatus and publishedStatus
        const updatedCourse = await Course.findByIdAndUpdate(courseId, {
            approvalStatus: true,
            publishedStatus: true
        }, { new: true });

        // Update approvalStatus for all modules of the course
        await Module.updateMany({ courseId: courseId }, { approvalStatus: true });

        // Update approvalStatus for all sections of each module
        const modules = await Module.find({ courseId: courseId });
        for (const module of modules) {
            await Section.updateMany({ moduleId: module._id }, { approvalStatus: true });
        }

         // Delete entry from CreationRequest schema
         const entityIdObj = new mongoose.Types.ObjectId(courseId);
         await CreationRequest.deleteOne({ entityId: entityIdObj, entityType: 'Course' });

        res.status(200).json({ message: 'Course, modules, and sections approved successfully', updatedCourse });
    } catch (error) {
        console.error('Error approving course:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

module.exports = router;