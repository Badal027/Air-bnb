const express = require("express");
const app = express();
const mongoose = require("mongoose");
const Listing = require("./models/listing.js");
const path = require("path");
const methodOverride = require("method-override");
const ejsMate = require("ejs-mate");
const wrapAsync = require("./utils/wrapAsync.js");
const ExpressError=require("./utils/ExpressError.js")

const MONGO_URL = "mongodb://127.0.0.1:27017/wanderlust";

main()
  .then(() => {
    console.log("connected to DB");
  })
  .catch((err) => {
    console.log(err);
  });

app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "views"));
app.use(express.urlencoded({ extended: true }));
app.use(methodOverride("_method"));
app.engine("ejs", ejsMate);
app.use(express.static(path.join(__dirname, "/public")));

async function main() {
  await mongoose.connect(MONGO_URL);
}
app.get("/", (req, res) => {
  res.send("Hii, i'm root....");
});

//Index Route

app.get("/listings",
wrapAsync( async (req, res) => {
  const allListings = await Listing.find({});
  res.render("listings/index.ejs", { allListings });
}));

//New Route

app.get("/listings/new", (req, res) => {
  res.render("listings/new.ejs");
});

//show Route

app.get("/listings/:id", 
    wrapAsync(async (req, res) => {
  let { id } = req.params;
  const listing = await Listing.findById(id);
  res.render("listings/show.ejs", { listing });
}));

//Create Route

app.post(
  "/listings",
  wrapAsync(async (req, res, next) => {
    // let {title,description, image, price, country, location} =req.body ;

    const newListing = new Listing(req.body.listing);
    await newListing.save();
    res.redirect("/listings");
  })
);

//Edit Route

app.get("/listings/:id/edit", 
    wrapAsync(async (req, res) => {
  let { id } = req.params;
  const listing = await Listing.findById(id);
  res.render("listings/edit.ejs", { listing });
}));

//Update Route
app.put("/listings/:id", 
    wrapAsync(async (req, res) => {
  let { id } = req.params;
  await Listing.findByIdAndUpdate(id, { ...req.body.listing });
  res.redirect(`/listings/${id}`);
}));

// Delete Rout

app.delete("/listings/:id", 
    wrapAsync(async (req, res) => {
  let { id } = req.params;
  let deletedListing = await Listing.findByIdAndDelete(id);
  console.log(deletedListing);
  res.redirect("/listings");
}));
// app.get("/testlisting ", async (req,res)=>{
//     let sapleListing = new Listing({
//         title: "My New Villa",
//         description : "By the beach",
//         price :12000,
//         location:"Calangute,Goa",
//         country: "India",
//     });
//    await sampleListing.save();
//    console.log("Sample was saved");
//    res.send("successful testing");

// } );
app.all("*",(req,res,next) =>{
    next(new ExpressError(404,"page not found !"))
});

app.use((err, req, res, next) => {
    let {statusCode,message}=err;
    res.status(statusCode=500).send(message="Somthing went Wrong brother");

});

app.listen(8080, () => {
  console.log("Server is listening to port 8080");
});
