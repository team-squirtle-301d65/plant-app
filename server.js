'use strict'

//Packages
const express = require('express');
const cors = require('cors');
const superagent = require('superagent');
const pg = require('pg');
require('dotenv').config();

//Global Vars
const PORT=process.env.PORT ||3003;
const app = express();
const methodOverride = require('method-override');
const DATABASE_URL = process.env.DATABASE_URL;

const client = new pg.Client(DATABASE_URL)
client.on('error', error => console.error(error));

const API_KEY = process.env.API_KEY;
//pass in object argument from movieObject




//Configs
app.set('view engine', 'ejs');
app.use(express.urlencoded({extended: true}));
app.use(cors());
app.use(express.static('./public'));
app.use(methodOverride('_method'));
app.use(express.static('./public'));
// app.get('/api/movies/:id', getSingleMovie);


//Server
client.connect()
  .then(() => {
    app.listen(PORT, () => console.log(`listening on ${PORT}`));
  });

//Routes
//app.get('/api/movies', (req, res));
// app.get('api/movies/:id', (req, res));
// app.post('/api/movies', (req, res));
// app.delete('/api/movies/:id', (req, res));
app.get('/', renderHomepage);

// Functions
function handleError(error, res) {
  console.error(error);
  res.render('error', {error});
}
/*****************************ROUTES */
app.get('/detail/:id', (req, res) => {
  //username takes place of id in this case
  const mySql = `SELECT * FROM movies WHERE username=$1;`;
  const id = req.body.id;
  // now going to be a text input on the form which is no longer in params
  
  //'${req.params.id}' removed from mySql to figure out how to get id arg into sql query
  //I am connecting to the database successfully but there is nothing in it. So I need to get it seeded.
  console.log(mySql);
  client.query(mySql, [id])
    .then( result => {
      //const movies = movieObject.find(m => m.id === parseInt(req.params.id));
      if(!result)res.status(404).send('The movie with the given id is not found');
      console.log(result);
      // send whatever pages/detail needs to render data
      res.render('pages/detail', {movie: result.rows[0]});
    })
    .catch(error => {
      console.log(error);
      handleError(error, res);
    });
});




app.post('/detail', (req, res) => {
  const {id, title, poster,rating,plot, actors, genre, username} = req.body;
  const values = [title, poster, rating, plot, actors, genre, username];
  const mySql = `INSERT INTO movies (title, poster, vote_average, overview, release_date) VALUES ($1, $2, $3,$4, $5, $6)`;
  client.query(mySql, values)
    .then( result => {
      res.redirect('/pages/watchlist', {movieObject:result.rows});
    })
    .catch(error => {
      handleError(error, res);
    });
});




const movieObject = [ {id:1,title:2 } ];

function Movie(movieObject){
  //need to replace with more precise values
  this.title = movieObject.title;
  this.poster = 'https://image.tmdb.org/t/p/w600_and_h900_bestv2' + movieObject.poster_path;
  this.vote_average = movieObject.vote_average;
  this.overview = movieObject.overview;

  // provides the release year only
  movieObject.release_date = movieObject.release_date.slice(0,4);
  this.release_date = movieObject.release_date;

 
}


function renderHomepage(req,res){
  // const movieSearchUrl = `https://api.themoviedb.org/3/movie/3/recommendations?api_key=${MOVIE_API_KEY}&language=en-US&page=1`;

  const movieSearchUrl =  `https://api.themoviedb.org/3/discover/movie/?certification_country=US&sort_by=vote_average&api_key=82d4270c35eb3e4492fa5462bb89256d&vote_count.gte=15&vote_average.gte=8&primary_release_date.gte=2018-01-01`;

  superagent.get(movieSearchUrl)
    .then(APIMovieData => {

      // console.log(APIMovieData);
      const movieArr = APIMovieData.body.results.map(movieData => new Movie(movieData));


      res.render('pages/index.ejs', { movies : movieArr});


    })
    .catch();

}



