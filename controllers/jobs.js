const Job = require("../models/Job");
const { StatusCodes } = require("http-status-codes");
const { BadRequestError, NotFoundError } = require("../errors");
require("dotenv").config();

const getAllJobs = async (req, res) => {
  const jobs = await Job.find({ createdBy: req.user.userId }).sort("createdAt");
  if (!jobs) {
    throw new NotFoundError(`No job found`);
  }
  res.status(StatusCodes.OK).json({ jobs, count: jobs.length });
};
const getJob = async (req, res) => {
  const {
    user: { userId },
    params: { id: jobId },
  } = req;

  const job = await Job.findOne({
    _id: jobId,
    createdBy: userId,
  });
  if (!job) {
    throw new NotFoundError(`No job found`);
  }
  res.status(StatusCodes.OK).json({ job });
};
const createJob = async (req, res) => {
  //Iniciate createdBy get from userId
  req.body.createdBy = req.user.userId;
  const job = await Job.create(req.body);
  res.status(StatusCodes.CREATED).json({ job });
};
const updateJob = async (req, res) => {
  const {
    body: { company, position },
    user: { userId },
    params: { id: jobId },
  } = req;

  if (company === "" || position === "") {
    throw new BadRequestError(`Company or Position fields cannot be empty`);
  }
  //Find a job with id and createdBy is same with user login
  const job = await Job.findOneAndUpdate(
    { _id: jobId, createdBy: userId },
    req.body,
    {
      new: true,
      runValidators: true,
    }
  );
  if (!job) {
    throw new NotFoundError(`No job found`);
  }
  res.status(StatusCodes.OK).json({ message: "Job updated", job });
};
const deleteJob = async (req, res) => {
  const {
    user: { userId },
    params: { id: jobId },
  } = req;

  const job = await Job.findOneAndDelete({
    _id: jobId,
    createdBy: userId,
  });
  if (!job) {
    throw new NotFoundError(`No job found`);
  }
  res.status(StatusCodes.OK).json({ job });
};
module.exports = {
  getAllJobs,
  getJob,
  createJob,
  updateJob,
  deleteJob,
};
