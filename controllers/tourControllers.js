/* eslint-disable prettier/prettier */
const Tour = require('../models/tourModel');
const catchAsync = require('../utils/catchAsync');
const AppError = require('../utils/appError');
const factory = require('./handlerFactory');

// Read and Write from database

// ROUTE HANDLER

exports.getAllTours = factory.getAll(Tour);
exports.createTour = factory.createOne(Tour);
exports.deleteTour = factory.deleteOne(Tour);
exports.updateTour = factory.updateOne(Tour);

// Not working !! 🛑
//exports.getTour = factory.getOne(Tour, { path: 'reviews' });

exports.getTour = catchAsync(async (req, res, next) => {
  const tour = await Tour.findById(req.params.id).populate('reviews');

  // .populate({
  //   path: 'guides',
  //   select: '-__v -passwordChangedAt',
  // });

  //Tour.findOne({ id: req.params.id });

  if (!tour) {
    return next(new AppError('No tour found with that ID', 404));
  }
  res.status(200).json({
    status: 'success',
    data: tour,
  });
});

exports.aliasTopTours = (req, res, next) => {
  req.query.limit = '5';
  req.query.sort = 'sort=-ratingsAverage,price';
  req.query.fields = 'name, price, ratingsAverage, summary, difficulty';
  next();
};

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

// '/tours-within/:distance/center/:latlng/unit/:unit',
// /tours-within/233/center/27.18664029908823, 31.168556231386006/unit/mi

exports.getToursWithin = catchAsync(async (req, res, next) => {
  const { distance, latlng, unit } = req.params;
  const [lat, lng] = latlng.split(',');

  // Calculate Radius in Miles (mi) or Kilometers (km) based on the provided distance and unit.
  // If 'unit' is equal to 'mi', use the formula distance / 3963.2 to calculate the radius in miles.
  // If 'unit' is not equal to 'mi', assume it's 'km', and use the formula distance / 6378.1 to calculate the radius in kilometers.
  // The result is stored in the constant variable 'radius', representing the calculated radius.
  const radius = unit === 'mi' ? distance / 3963.2 : distance / 6378.1;

  if (!lat || !lng)
    return next(
      new AppError(
        'Please provide latituter and longitude in the format lat,lng.',
        400
      )
    );
  const tours = await Tour.find({
    startLocation: { $geoWithin: { $centerSphere: [[lng, lat], radius] } },
  });
  res.status(200).json({
    status: 'success',
    results: tours.length,
    data: {
      data: tours,
    },
  });
});

exports.getDistances = catchAsync(async (req, res, next) => {
  const { latlng, unit } = req.params;
  const [lat, lng] = latlng.split(',');

  const multiplier = unit === 'mi' ? 0.000621371 : 0.001; // 0.000621371 -> from m to mile  0.001 -> form m to km

  if (!lat || !lng)
    return next(
      new AppError(
        'Please provide latituter and longitude in the format lat,lng.',
        400
      )
    );

  const distances = await Tour.aggregate([
    {
      // geoNear need to be the first stage
      $geoNear: {
        near: {
          type: 'Point',
          coordinates: [lng * 1, lat * 1],
        },
        distanceField: 'distance',
        distanceMultiplier: multiplier,
      },
    },
    {
      $project: {
        distance: 1,
        name: 1,
      },
    },
  ]);
  res.status(200).json({
    status: 'success',
    data: {
      data: distances,
    },
  });
});

// exports.getAllTours = catchAsync(async (req, res, next) => {
//   // EXECUTE QUERY
//   const features = new APIFeatures(Tour.find(), req.query)
//     .filter()
//     .sort()
//     .limitFileds()
//     .Pagination();
//   const tours = await features.query;

//   // SEND RESPONSE
//   res.status(200).json({
//     status: 'success',
//     results: tours.length,
//     data: tours,
//   });
// });

// exports.createTour = catchAsync(async (req, res, next) => {
//   // const newTour = new Tour({})
//   // newTour.save()

//   const newTour = await Tour.create(req.body);

//   res.status(201).json({
//     status: 'success',
//     data: {
//       tour: newTour,
//       //tourId: newTour._id,
//     },
//   });
//   // try {

//   // } catch (err) {
//   //   res.status(400).json({
//   //     status: 'fail',
//   //     message: err.message,
//   //   });
//   // }
// });

// exports.deleteTour = catchAsync(async (req, res, next) => {
//   const tour = await Tour.findByIdAndDelete(req.params.id);
//   if (!tour) {
//     return next(new AppError('No tour found with that ID', 404));
//   }
//   // Tour.findOne ({id: req.pms.id })
//   res.status(204).json({
//     status: 'success',
//     data: null,
//   });
// });

// exports.updateTour = catchAsync(async (req, res, next) => {
//   const tour = await Tour.findByIdAndUpdate(req.params.id, req.body, {
//     new: true,
//     runValidators: true,
//   });
//   if (!tour) {
//     return next(new AppError('No tour found with that ID', 404));
//   }
//   res.status(201).json({
//     status: 'success',
//     data: tour,
//   });
// });
