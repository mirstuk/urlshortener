const dns = require("dns");
const express = require("express");
const path = require("path");
const mongoose = require("mongoose");
const cors = require("cors");
require("dotenv").config();
const app = express();

const Url = require("./models/Url");

// Basic Configuration
const port = process.env.PORT || 3000;

mongoose
  .connect(
    process.env.MLAB_URI,
    {
      useNewUrlParser: true,
      useCreateIndex: true
    }
  )
  .then(() => console.log("MongoDB connected ..."))
  .catch(err => console.log(err));

app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cors());

app.use("/public", express.static(path.join(__dirname, "/public")));

app.get("/", function(req, res) {
  res.sendFile(path.join(__dirname, "/views/index.html"));
});

app.post("/api/shorturl/new", function(req, res) {
  const hostname = new URL(req.body.url).hostname;
  const options = { all: true };
  dns.lookup(hostname, options, (err, addresses) => {
    if (err) res.json({ error: "Invalid URL" });
    else {
      const date = "" + Date.now();
      const short = date.substring(date.length - 4);
      const newUrl = new Url({
        url: req.body.url,
        short: short
      });
      newUrl
        .save()
        .then(url => res.json({ original_Url: url.url, short_url: url.short }))
        .catch(err => res.status(500).json({ error: err }));
    }
  });
});

app.get("/api/shorturl/:short", function(req, res) {
  const shorturl = req.params.short;
  Url.findOne({ short: shorturl })
    .select("url short")
    .exec()
    .then(doc => {
      if (doc) {
        Url.deleteOne({ short: doc.short }).exec();
        res.redirect(301, doc.url);
      } else res.json({ error: "no doc found" });
    })
    .catch(err => res.status(500).json({ error: err }));
});

app.listen(port, function() {
  console.log(`Node.js listening on port ${port} ...`);
});
