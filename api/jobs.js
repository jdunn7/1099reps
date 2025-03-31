const express = require('express');
const router = express.Router();
const jobsData = require('../resources/job-data.json');

// GET /api/jobs
router.get('/', (req, res) => {
    const { type, status } = req.query;
    let filteredJobs = jobsData;

    if (type && type !== 'all') {
        filteredJobs = filteredJobs.filter(job => job.type === type);
    }

    if (status && status !== 'all') {
        filteredJobs = filteredJobs.filter(job => job.status === status);
    }

    res.json(filteredJobs);
});

module.exports = router;
