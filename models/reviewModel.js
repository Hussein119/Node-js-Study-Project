const mongoose = require('mongoose');
const Tour = require('./tourModel');

const reviewSchema = new mongoose.Schema(
  {
    review: {
      type: String,
      required: [true, 'Review cannot be empty!'],
    },
    rating: {
      type: Number,
      min: 1,
      max: 5,
    },
    createdAt: {
      type: Date,
      default: Date.now,
    },
    tour: {
      type: mongoose.Schema.ObjectId,
      ref: 'Tour',
      required: [true, 'Review must belong to a tour.'],
    },
    user: {
      type: mongoose.Schema.ObjectId,
      ref: 'User',
      required: [true, 'Review must belong to a user.'],
    },
  },
  {
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

// to handel duplicate reviews from the same user in the same tour
reviewSchema.index({ tour: 1, user: 1 }, { unique: true });

//take more time , be careful 🤨
reviewSchema.pre(/^find/, function (next) {
  // this.populate({
  //   path: 'tour',
  //   select: 'name',
  // }).populate({
  //   path: 'user',
  //   select: 'name photo',
  // });

  this.populate({
    path: 'user',
    select: 'name photo',
  });
  next();
});

reviewSchema.statics.calcAverageRating = async function (tourId) {
  // this points to the model
  const stats = await this.aggregate([
    {
      $match: { tour: tourId },
    },
    {
      $group: {
        _id: '$tour',
        nRatings: { $sum: 1 },
        avgRating: { $avg: '$rating' },
      },
    },
  ]);

  if (stats.length > 0) {
    await Tour.findByIdAndUpdate(tourId, {
      ratingsAverage: stats[0].avgRating,
      ratingsQuantity: stats[0].nRatings,
    });
  } else {
    await Tour.findByIdAndUpdate(tourId, {
      // default
      ratingsAverage: 4.5,
      ratingsQuantity: 0,
    });
  }
};

reviewSchema.post('save', function () {
  // this point to current review
  // this.constructor === Review , but you cannot use Review now , it is not declared yet
  this.constructor.calcAverageRating(this.tour);
});

// in .post you do not have access to query

// Section 11 , e: 169

// findOneAndUpdate -> is just a shorhand for findOneAndUpdate with the current Id
// findOneAndDelete

/*
! I find out that we don't need this middtemre as the post
! middleware gets doc os on argument
*/
// reviewSchema.pre(/^findOneAnd/, async function (next) {
//   // this is the current query
//   this.r = await this.findOne();
//   console.log(this);
//   next();
// });

reviewSchema.post(/^findOneAnd/, async function (doc) {
  // await this.findOne(); does not work here the quey has already executed
  // here is the same thing we need to call constructor on doc
  // await this.r.constructor.calcAverageRating(this.r.tour);
  // we need to check if there's a doc because what if we are deleting
  // with id that's not present
  if (doc) await doc.constructor.calcAverageRating(doc.tour);
});

const Review = mongoose.model('Review', reviewSchema);

module.exports = Review;
