## Event management system - Assignment Instructions

[Assignment Link](https://docs.google.com/document/d/1roMRKnjb2z8ap7K4F0Ls3GVP-_WoXhR85ePqOLXdk9Y/edit)

## Why Node.js?

Tech Stack: For this project, I chose to use the MERN stack, which consists of Sql as the database, Express.js as the backend framework, and Node.js as the r   untime environment.

- Database Choice (SQL): SQL was selected as the database for its flexibility, scalability, and ease of use with Node.js. SQL's Table based structure allowed for seamless integration with the Rows and columns like data format used in the application. Additionally, SQL's support for Relationsships and constrains made it a suitable choice for handling potential scalability requirements in the future.

- Backend Framework (Express.js): Express.js was chosen as the backend framework due to its lightweight nature, robust features, and ease of building RESTful APIs. The middleware support in Express.js facilitated the implementation of authentication, validation, and error handling logic in a modular and structured manner.

- Runtime Environment (Node.js): Node.js was used as the runtime environment for the entire stack due to its event-driven, non-blocking I/O model. This architecture ensured high performance and scalability, especially for handling concurrent requests and real-time updates in the application.


## Project setup

- [Live server link](https://event-management-system-n9tf.onrender.com/events/find/?Latitude=40.7128&Longitude=-74.0060&date=2024-03-15)
- [GitHub link](https://github.com/jeyaseelan1998/event-management-system.git)
- Clone the repo using `$ git clone https://github.com/jeyaseelan1998/event-management-system.git`
- start app
  - `npm install`
  - `npm run dev`

## Endpoints

`base_url = "https://event-management-system-n9tf.onrender.com"`

### `<base_url>/add-events`

One time request to server to process csv file

```
{
    method: "GET"
}
```

#### Success Response

##### First request

```
CSV file successfully processed
```

##### For frequent request

```
CSV file already processed
```

#### Failed Response

```
Internal server error
```

<hr />

### `<base_url>/events/find`

```
sample_apiUrl = <base_url>/events/find/Latitude=40.7128&Longitude=-74.0060&date=2024-03-15&pageNo=5

{
    method: "GET"
}
```

#### Success Response

```
{
  "events": [
    {
      "event_name": "Try fast suddenly",
      "city_name": "Elizabethberg",
      "date": "2024-03-29",
      "weather": "Sunny, 18C",
      "distance": "14383.43229714746"
    },
    ...
  ],
  "page": 5,
  "pageSize": 4,
  "totalEvents": 44,
  "totalPages": 5
}
```


#### Failure Response

```
Invalid query parameter values
```

OR


```
Internal server error
```

## Screenshots

![sample](https://res.cloudinary.com/dj5c1rxzz/image/upload/v1711611112/assignment/add-event.png "endpoint: /events/find")
![sample](https://res.cloudinary.com/dj5c1rxzz/image/upload/f_auto,q_auto/v1/assignment/events.find "endpoint: /events/find")