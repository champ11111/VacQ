const Hospital = require("../models/Hospital");
// const vacCenter = require("../models/VacCenter");

//@ desc    Get all vaccine centers
//@ route   GET /api/v1/hospitals/vaccine-centers/
//@ access  Public
exports.getVacCenters = async (req, res, next) => {
  vacCenter.getAll((err, data) => {
    if (err) {
      res.status(500).send({
        message:
          err.message ||
          "Some error occurred while retrieving vaccine centers.",
      });
    } else res.send(data);
  });
};

//@ desc    Get all hospitals
//@ route   GET /api/v1/hospitals
//@ access  Public
exports.getHospitals = async (req, res, next) => {
  try {
    let query;

    //Copy req.query
    const reqQuery = { ...req.query };

    //Fields to exclude
    const removeFields = ["select", "sort", "page", "limit"];

    //Loop over removeFields and delete them from reqQuery
    removeFields.forEach((param) => delete reqQuery[param]);
    console.log(reqQuery);

    //Create query string
    let queryStr = JSON.stringify(req.query);
    queryStr = queryStr.replace(/\b(gte|gt|lte|lt)\b/g, (match) => `$${match}`);

    //Find hospitals
    query = Hospital.find(JSON.parse(queryStr)).populate("appointments");

    //Select Fields
    if (req.query.select) {
      const fields = req.query.select.split(",").join(" ");
      query = query.select(fields);
    }

    //sort by
    if (req.query.sort) {
      const sortBy = req.query.sort.split(",").join(" ");
      query = query.sort(sortBy);
    } else {
      query = query.sort("-createdAt");
    }

    //Pagination
    const page = parseInt(req.query.page, 10) || 1;
    const limit = parseInt(req.query.limit, 10) || 25;
    const startIndex = (page - 1) * limit;
    const endIndex = page * limit;
    const total = await Hospital.countDocuments();

    query = query.skip(startIndex).limit(limit);

    //Execute query
    const hospitals = await query;

    //Pagination result
    const pagination = {};

    if (endIndex < total) {
      pagination.next = {
        page: page + 1,
        limit,
      };
    }

    if (startIndex > 0) {
      pagination.prev = {
        page: page - 1,
        limit,
      };
    }

    res.status(200).json({
      success: true,
      count: hospitals.length,
      pagination,
      data: hospitals,
    });
  } catch (err) {
    res.status(400).json({ success: false, error: err.message });
  }
};

//@ desc     Get single hospital
//@ route   GET /api/v1/hospitals/:id
//@ access  Public
exports.getHospital = async (req, res, next) => {
  try {
    const hospital = await Hospital.findById(req.params.id);
    if (!hospital) {
      return res
        .status(404)
        .json({ success: false, error: "Hospital not found" });
    }
    res.status(200).json({ success: true, data: hospital });
  } catch (err) {
    res.status(400).json({ success: false, error: err.message });
  }
};

//@ desc     Create a hospitals
//@ route   Post /api/v1/hospitals
//@ access  Private
exports.createHospital = async (req, res, next) => {
  const hospital = await Hospital.create(req.body);
  res.status(201).json({ success: true, data: hospital });
};

//@ desc    Update single hospital
//@ route   Put /api/v1/hospitals/:id
//@ access  Private
exports.updateHospital = async (req, res, next) => {
  try {
    const hospital = await Hospital.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    });
    if (!hospital) {
      return res
        .status(404)
        .json({ success: false, error: "Hospital not found" });
    }
    return res.status(200).json({ success: true, data: hospital });
  } catch (err) {
    res.status(400).json({ success: false, error: err.message });
  }
};

//@ desc   Delete single hospital
//@ route   Delete /api/v1/hospitals/:id
//@ access  Private
exports.deleteHospital = async (req, res, next) => {
  try {
    const hospital = await Hospital.findById(req.params.id);
    if (!hospital) {
      return res
        .status(404)
        .json({ success: false, error: "Hospital not found" });
    }

    hospital.remove();

    return res.status(200).json({ success: true, data: {} });
  } catch (err) {
    res.status(400).json({ success: false, error: err.message });
  }
};
