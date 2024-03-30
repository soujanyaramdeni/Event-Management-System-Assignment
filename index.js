
const express = require("express");
const parser = require("body-parser");
const mysql = require('mysql2');
const axios = require("axios");
const moment = require("moment");

const app = express();
const PORT = 3010;
const databaseConnection = mysql.createConnection({
    host: "localhost",
    database: "weather",
    user: "root",
    password: "soujanya@1234"
});

app.use(parser.json());

databaseConnection.connect((err) => {
  if (err) {
    console.error('Database connection failed: ' + err.stack);
    return;
  }
  console.log('Connected to database');
});

app.get('/', (req, res) => {
  let sqlQuery = "SELECT * FROM event_assignment";
  databaseConnection.query(sqlQuery, function (err, results) {
    if (err) {
      console.error(err);
      res.status(500).json({ error: "Internal server error" });
    } else {
      res.send(results);
    }
  });
});

app.post("/events/create", (req, res) => {
    const { eventName, cityName, date, time, latitude, longitude } = req.body;
    if(!latitude&& !longitude&& !date){
      return res.status(400).json({error:"Latitude,longitude, date are required"})
    }
    else if(!latitude&&!longitude&& date){
      return res.status(400).json({error:"Latitude and Longitude are required"})
    }else if(!longitude&&!date&&latitude){
      return res.status(400).json({error:"Longitude and Date are required"})
    }else if(!latitude&&!date&&longitude){
      return res.status(400).json({error:"Latitude and Date are required"})
    }
    else if(!latitude){
      return res.status(400).json({error:"Latitude is required"})
    }else if(!longitude){
      return res.status(400).json({error:"Longitude is required"})
    }else if(!date){
      return res.status(400).json({error:"Date is required"})
    }
    const sqlQuery = "INSERT INTO event_assignment (event_name, city_name, date, time, latitude, longitude) VALUES (?, ?, ?, ?, ?, ?)";
    databaseConnection.query(sqlQuery, [eventName, cityName, date, time, latitude, longitude], (err, result) => {
      if (err) {
        console.error('Error inserting data: ' + err.message);
        res.status(500).json({ error: "Internal server error" });
        return;
      }
      console.log('Event created successfully');
      res.status(201).json({ message: "Event created successfully" });
    });
  });

app.post("/events/find", async (req, res) => {
  const {latitude,longitude,date}= req.body;
  if(!latitude&& !longitude&& !date){
    return res.status(400).json({error:"Latitude,longitude, date are required"})
  }
  else if(!latitude&&!longitude&& date){
    return res.status(400).json({error:"Latitude and Longitude are required"})
  }else if(!longitude&&!date&&latitude){
    return res.status(400).json({error:"Longitude and Date are required"})
  }else if(!latitude&&!date&&longitude){
    return res.status(400).json({error:"Latitude and Date are required"})
  }
  else if(!latitude){
    return res.status(400).json({error:"Latitude is required"})
  }else if(!longitude){
    return res.status(400).json({error:"Longitude is required"})
  }else if(!date){
    return res.status(400).json({error:"Date is required"})
  }
  const page = req.query.page || 1;
  const limit = 10;
  const skip = (page - 1) * limit;
  const endDate = moment(date).add(14, 'days').format('YYYY-MM-DD');
  console.log(endDate)

  try {
    const countSql = "SELECT COUNT(*) as totalEvents FROM event_assignment WHERE date BETWEEN ? AND DATE_ADD(?, INTERVAL 14 DAY)";
    databaseConnection.query(countSql, [date,date], (err, result) => {
      if (err) {
        console.error(err);
        res.status(500).json({ error: "Internal error" });
        return;
      }
      const totalEvents = result[0].totalEvents;
      const totalPages = Math.ceil(totalEvents / limit);

      if (page > totalPages) {
        return res.status(404).json({ message: "Events not found" });
      }
      const sqlQuery = "SELECT * FROM event_assignment WHERE date BETWEEN ? AND DATE_ADD(?, INTERVAL 14 DAY) ORDER BY date LIMIT ? OFFSET ?";
      databaseConnection.query(sqlQuery, [date, date, limit, skip], async (err, events) => {
        if (err) {
          console.error(err);
          res.status(500).json({ error: "Server error" });
          return;
        }
        

        const eventDetails = await Promise.all(
          events.map(async (event) => {
            try {
              const weatherRes = await axios.get(`https://gg-backend-assignment.azurewebsites.net/api/Weather?code=KfQnTWHJbg1giyB_Q9Ih3Xu3L9QOBDTuU5zwqVikZepCAzFut3rqsg==&city=${encodeURIComponent(event.city_name)}&date=${event.date}`);
              const distanceRes = await axios.get(`https://gg-backend-assignment.azurewebsites.net/api/Distance?code=IAKvV2EvJa6Z6dEIUqqd7yGAu7IZ8gaH-a0QO6btjRc1AzFu8Y3IcQ==&latitude1=${latitude}&longitude1=${longitude}&latitude2=${event.latitude}&longitude2=${event.longitude}`);

              const weatherData = weatherRes.data;
              const weatherKey = Object.keys(weatherData)[0];
              const weather = weatherData[weatherKey];
              const distance = distanceRes.data.distance;

              return {
                event_name: event.event_name,
                city_name: event.city_name,
                date: event.date,
                weather,
                distance_km: distance,
              };
            } catch (error) {
              console.error(error);
              return null;
            }
          })
        );
        const totalPages=5;
        const responseObj = {
          events: eventDetails.filter(event => event !== null),
          page,
          pageSize: limit,
          totalEvents,
          totalPages
        };
        res.json(responseObj);
      });
    });
  } catch (error) {
    console.error("error", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});