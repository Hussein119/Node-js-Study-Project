/* eslint-disable prettier/prettier */
const Tour = require('../models/tourModel');
const APIFeatures = require('../utils/apiFeatures');
const catchAsync = require('../utils/catchAsync');
const AppError = require('../utils/appError');

// Read and Write from database

// ROUTE HANDLER

exports.aliasTopTours = (req, res, next) => {
  req.query.limit = '5';
  req.query.sort = 'sort=-ratingsAverage,price';
  req.query.fields = 'name, price, ratingsAverage, summary, difficulty';
  next();
};

exports.getAllTours = catchAsync(async (req, res, next) => {
  // EXECUTE QUERY
  const features = new APIFeatures(Tour.find(), req.query)
    .filter()
    .sort()
    .limitFileds()
    .Pagination();
  const tours = await features.query;

  // SEND RESPONSE
  res.status(200).json({
    status: 'success',
    results: tours.length,
    data: tours,
  });
});

exports.getTour = catchAsync(async (req, res, next) => {
  const tour = await Tour.findById(req.params.id);
  // Tour.findOne ({id: req.pms.id })

  if (!tour) {
    return next(new AppError('No tour found with that ID', 404));
  }
  res.status(200).json({
    status: 'success',
    data: tour,
  });
});

exports.createTour = catchAsync(async (req, res, next) => {
  // const newTour = new Tour({})
  // newTour.save()

  const newTour = await Tour.create(req.body);

  res.status(201).json({
    status: 'success',
    data: {
      tour: newTour,
    },
  });
  // try {

  // } catch (err) {
  //   res.status(400).json({
  //     status: 'fail',
  //     message: err.message,
  //   });
  // }
});

exports.deleteTour = catchAsync(async (req, res, next) => {
  const tour = await Tour.findByIdAndDelete(req.params.id);
  if (!tour) {
    return next(new AppError('No tour found with that ID', 404));
  }
  // Tour.findOne ({id: req.pms.id })
  res.status(204).json({
    status: 'success',
    data: null,
  });
});

exports.updateTour = catchAsync(async (req, res, next) => {
  const tour = await Tour.findByIdAndUpdate(req.params.id, req.body, {
    new: true,
    runValidators: true,
  });
  if (!tour) {
    return next(new AppError('No tour found with that ID', 404));
  }
  res.status(201).json({
    status: 'success',
    data: tour,
  });
});

exports.getTourStats = catchAsync(async (req, res, next) => {
  // get number of all Tours
  //const numDocs = await Tour.countDocuments();
  //console.log(numDocs);

  const stats = await Tour.aggregate([
    {
      $match: { ratingsAverage: { $gte: 4.5 } },
    },
    {
      $group: {
        //_id: null,
        _id: { $toUpper: '$difficulty' },
        numTours: { $sum: 1 },
        numRatings: { $sum: '$ratingsQuantity' },
        avgRating: { $avg: '$ratingsAverage' },
        avgPrice: { $avg: '$price' },
        minPrice: { $min: '$price' },
        maxPrice: { $max: '$price' },
      },
    },
    {
      $project: {
        _id: 0,
      },
    },
    {
      /*
         1 Sort ascending.
        -1 Sort descending.
        */
      $sort: { avgPrice: -1 },
    },
    // {
    //   $limit: 6,
    // },
    // {
    //   $match: { _id: { $ne: 'EASY' } }, // ne -> not equal to
    // },
  ]);
  res.status(200).json({
    status: 'success',
    data: stats,
  });
});

exports.getMonthlyPlan = catchAsync(async (req, res, next) => {
  const year = req.params.year * 1; // 2021

  const plan = await Tour.aggregate([
    {
      $unwind: '$startDates',
    },
    {
      $match: {
        startDates: {
          $gte: new Date(`${year}-01-01`),
          $lte: new Date(`${year}-12-31`),
        },
      },
    },
    {
      $group: {
        _id: { $month: '$startDates' },
        numTourStarts: { $sum: 1 },
        tours: { $push: '$name' },
      },
    },
    {
      $addFields: { month: '$_id' },
    },
    {
      $project: {
        _id: 0, // _id no longer show up if 1 it would show up
      },
    },
    {
      $sort: { numTourStarts: -1 },
    },
    {
      $limit: 12, // limit the number of digit month
    },
  ]);

  res.status(200).json({
    status: 'success',
    data: {
      plan,
    },
  });
});
