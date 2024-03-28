const express = require('express')
const { open } = require("sqlite")
const sqlite3 = require("sqlite3")
const fs = require('fs')
const path = require('path')
const { format } = require('date-fns')
const csv = require('csv-parser');
const { v4: uuidV4 } = require('uuid');


const app = express()
const PATH = path.join(__dirname, 'database/events.db')
let db = null

const initializeDBAndServer = async () => {
    try {
        db = await open({
            filename: PATH,
            driver: sqlite3.Database
        })
        app.listen(3008, () => console.log("Server running at http://localhost:3008/"))
    } catch (err) {
        process.exit(1);
    }
}

initializeDBAndServer()

const fetchWeather = async ({ city_name, date }) => {
    let apiKey = process.env.weatherApiKey
    const formatedDate = format(new Date(date), "yyyy-mm-dd")
    const apiUrl =
        `https://gg-backend-assignment.azurewebsites.net/api/Weather?code=${apiKey}&city=${city_name}&date=${formatedDate}`
    const response = await fetch(apiUrl)
    const data = await response.json()
    return data
}

const fetchDistance = async (userLat, userLong, latitude, longitude) => {
    let apiKey = process.env.distanceApiKey
    const apiUrl =
        `https://gg-backend-assignment.azurewebsites.net/api/Distance?code=${apiKey}&latitude1=${userLat}&longitude1=${userLong}&latitude2=${latitude}&longitude2=${longitude}`
    const response = await fetch(apiUrl)
    const data = await response.json()
    return data
}

async function addEventsToDB(request, response) {
    try {
        await db.run(`CREATE TABLE IF NOT EXISTS event(
            event_id TEXT NOT NULL PRIMARY KEY,
            event_name TEXT,
            city_name TEXT,
            date DATE,
            time TIME,
            latitude TEXT,
            longitude TEXT
            )`)

        const dbResponse = await db.all(`SELECT event_id from event`)

        if (!dbResponse.length) {

            fs.createReadStream('./csv/dataset.csv')
                .pipe(csv())
                .on('data', async (row) => {
                    // Insert each row from the CSV file into the database
                    const INSERT_SQL_QUERY = `INSERT INTO event
                        (event_id, event_name, city_name, date, time, latitude, longitude)
                        VALUES (?, ?, ?, ?, ?, ?, ?)`

                    await db.run(
                        INSERT_SQL_QUERY,
                        [
                            uuidV4(),
                            row.event_name,
                            row.city_name,
                            row.date,
                            row.time,
                            row.latitude,
                            row.longitude
                        ]
                    )
                })
                .on('end', async () => {
                    response.send("CSV file successfully processed")
                });

        } else {
            response.send("CSV file already processed")
        }
    } catch (error) {
        response.statusCode = 500
        response.send("Internal server error")
    }
}

app.get("/add-events", addEventsToDB)

app.get("/events/find", async (request, response) => {
    try {
        let {
            Longitude: userLong,
            Latitude: userLat,
            date: searchDate,
            pageNo = 1
        } = request.query

        pageNo = parseInt(pageNo)

        if (!userLong || !userLat || !searchDate || !pageNo) {
            response.statusCode = 400;
            response.send("Invalid query parameter values")
            return
        }

        const daysToAdd = 14;
        const limit = 10;
        const offset = pageNo > 1 ? (pageNo - 1) * limit : 0

        const SQL_QUERY = `SELECT event_name, city_name, date, latitude, longitude
        FROM event
        WHERE ROUND(JULIANDAY(date) - JULIANDAY('${searchDate}')) BETWEEN 0 AND ${daysToAdd}
        ORDER BY 
            ROUND(JULIANDAY(date) - JULIANDAY('${searchDate}')), 
            CASE
                WHEN ABS(CAST(latitude as FLOAT) - CAST('${userLat}' as FLOAT)) <= ABS(CAST(longitude as FLOAT) - CAST('${userLong}' as FLOAT)) THEN ABS(CAST(latitude as FLOAT) - CAST('${userLat}' as FLOAT))
                ELSE ABS(CAST(longitude as FLOAT) - CAST('${userLong}' as FLOAT))
            END
        LIMIT ${limit}
        OFFSET ${offset}
        `
        const dbResponse = await db.all(SQL_QUERY)

        const promises = dbResponse.map(async element => {
            const { event_name, city_name, date, latitude, longitude } = element
            const [{ weather }, { distance }] = await Promise.all([fetchWeather(element), fetchDistance(userLat, userLong, latitude, longitude)])
            return { event_name, city_name, date, weather, distance }
        })

        const enhancedEvents = await Promise.all(promises)

        const filteredResponse = await db.all(`SELECT *, ROUND(JULIANDAY(date) - JULIANDAY('${searchDate}')) as dateDiff
            FROM event WHERE dateDiff BETWEEN 0 AND 14
        `)

        const totalEvents = filteredResponse.length

        const responseObject = {
            events: enhancedEvents,
            page: pageNo,
            pageSize: enhancedEvents.length,
            totalEvents,
            totalPages: Math.ceil(totalEvents / limit)
        }

        response.send(responseObject)
    } catch (err) {
        response.statusCode = 500
        response.send("Internal server error")
    }
})