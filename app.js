const express = require("express");
const app = express();
const mongoose = require("mongoose");
const Listing = require("./models/listing.js");
const path = require("path");
const methodOverride = require("method-override");
const ejsMate = require("ejs-mate");
const wrapasync = require("./utils/wrapasync.js");
const ExpressError = require("./utils/ExpressError.js");
const {listingSchema, reviewSchema} = require("./schema.js");
const Review = require("./models/review.js");
const { request } = require("http");
const listings = require("./routes/listing.js");


const MONGO_URL = "mongodb://127.0.0.1:27017/horizonHops";

main()
  .then(() => {
    console.log("connected to DB");
  })
  .catch((err) => {
    console.log(err);
  });

async function main() {
  await mongoose.connect(MONGO_URL);
}

app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "views"));
app.use(express.urlencoded({ extended: true }));
app.use(methodOverride("_method"));
app.engine('ejs', ejsMate);
app.use(express.static(path.join(__dirname, "/public")));


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


app.use("/listings",listings);



//Review
//post

app.post("/listings/:id/reviews", validatereview, wrapasync( async(req, res) =>{
  let listing = await Listing.findById(req.params.id);
  let newReview = new Review(req.body.review);

  listing.reviews.push(newReview);

  await newReview.save();
  await listing.save();

  res.redirect(`/listings/${listing._id}`)
}));

//Delete review
app.delete("/listings/:id/reviews/:reviewId", wrapasync(async(req, res) => {
  let {id, reviewId } = req.params;
  await Listing.findByIdAndUpdate(id, {$pull: { reviews: reviewId}});
  await Review.findByIdAndDelete(reviewId);

  res.redirect(`/listings/${id}`);
}));


app.all("*", (req, res, next)=>{
  next(new ExpressError(404, "page not found!"));
});

//Middle Ware
app.use((err, req, res, next )=>{
  let {statusCode=500 , message="Something Went Wrong"} = err;
  res.status(statusCode).render("error.ejs",{message});
  //res.status(statusCode).send(message);
});



app.listen(8080, () => {
  console.log("server is listening to port 8080");
});

