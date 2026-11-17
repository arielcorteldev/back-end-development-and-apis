import express from "express";
import cors from "cors";

const app = express();

app.use(cors({ optionsSuccessStatus: 200 }));

app.use(express.static("public"));

app.get("/", (req, res) => {
  res.sendFile(import.meta.dirname + "/views/index.html");
});

// Do not change code above this line
// The "?" makes :date optional, so /api and /api/2015-12-25 both match
app.get("/api{/:date}", (req, res) => {
  const { date } = req.params;

  let parsed;

  if (!date) {
    // Requirements 6 & 7: empty param -> current time
    parsed = new Date();
  } else if (/^-?\d+$/.test(date)) {
    // All digits means a Unix timestamp in ms. new Date("1451001600000")
    // would treat it as a string and return Invalid Date, so convert to Number first.
    parsed = new Date(Number(date));
  } else {
    // Anything else: let the Date constructor parse it (requirement 4)
    parsed = new Date(date);
  }

  // An invalid Date has NaN as its time value (requirement 5)
  if (isNaN(parsed.getTime())) {
    return res.json({ error: "Invalid Date" });
  }

  // Requirements 1, 2, 3
  res.json({
    unix: parsed.getTime(),     // milliseconds since 1970-01-01
    utc: parsed.toUTCString(),  // e.g. "Fri, 25 Dec 2015 00:00:00 GMT"
  });
});
// Do not change code below this line

const PORT = 8000;
const listener = app.listen(PORT, function () {
  console.log("Your app is listening on port " + listener.address().port);
});
