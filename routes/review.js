const express = require("express");
const router = express.Router();
const wrapasync = require("../utils/wrapasync.js");
const ExpressError = require("../utils/ExpressError.js");
const {reviewSchema} = require("../schema.js");
const Review = require("../models/review.js");
const Listing = require("../models/listing.js");


const validatereview=(req, res, next)=>{
  let { error } = reviewSchema.validate(req.body);
  console.log(error);
  if(error){
    
    let errMsg = error.details.map((el)=> el.message).join(",");
    throw new ExpressError(400,errMsg);
  }
  else{
    next();
  }

};

//Review
//post

router.post("/", validatereview, wrapasync( async(req, res) =>{
  let listing = await Listing.findById(req.params.id);
  let newReview = new Review(req.body.review);

  listing.reviews.push(newReview);

  await newReview.save();
  await listing.save();

  res.redirect(`/listings/${listing._id}`)
}));

//Delete review
router.delete("/:reviewId", wrapasync(async(req, res) => {
  let {id, reviewId } = req.params;
  await Listing.findByIdAndUpdate(id, {$pull: { reviews: reviewId}});
  await Review.findByIdAndDelete(reviewId);

  res.redirect(`/listings/${id}`);
}));


module.exports = router;