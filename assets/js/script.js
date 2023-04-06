const apiKeyMovieDB = "10e82ad5be957cc7820f3759e138724a";
const baseMovieURL = "https://api.themoviedb.org/3";
const searchMovieURL = `${baseMovieURL}/search/movie`;
const searchCreditsMovieURL = `${baseMovieURL}/movie/{{id}}/credits`;
// document selectors for displaying information to HTML
const searchForm = document.getElementById("search-form");
// we only need one input for title (ether book or movie)
const movieTitleInput = document.getElementById("movie-title");
// using author list in the get author section
const authorList = document.getElementById("author-list");
// using bookList below in the google books section
const bookList = document.getElementById("book-list");
const movieList = document.getElementById("movie-list");
// book titles stored here
var titlesArr = [];

// movies based on books
function getMovieList() {
  // console.log(titlesArr)
  titlesArr.forEach((title) => {
    var url = `${searchMovieURL}?api_key=${apiKeyMovieDB}&query=${encodeURIComponent(
      title
    )}`;
    fetch(url)
      .then((response) => response.json())
      .then((data) => {
        // console.log(data)
        var movies = data.results.filter((movie) =>
          movie.title.toLowerCase().includes(title.toLowerCase())
        );
        // wrap the link code around the image code - append img to link
        movies.forEach((movie) => {
          // console.log(movie.id);
          // console.log(data);
          var liEl = document.createElement("li");
          var link = document.createElement("a");
          var imgEl = document.createElement("img");
          var breakEl = document.createElement("br");
          var blurbEl = document.createElement("p");
          link.textContent = movie.title;
          const imagePath = movie.poster_path;
          const posterUrl = `https://image.tmdb.org/t/p/w200/${imagePath}`;
          link.href = `https://www.themoviedb.org/movie/${movie.id}`;
          imgEl.src = posterUrl;
          imgEl.alt = `${movie.title}`;
          blurbEl.innerText = movie.overview;
          // append image to link/text
          link.appendChild(breakEl);
          link.appendChild(imgEl);
          // append link and image to list element
          liEl.appendChild(link);
          liEl.appendChild(blurbEl);
          // append list element to the main list
          movieList.appendChild(liEl);
        });
      });
  });
}
// this function gets the AUTHOR and call the getMovieList function for display
// how?
// is searches the movie db crew data for [job = 'novel'] << see api docs
searchForm.addEventListener("submit", (event) => {
  event.preventDefault();
  var movieTitle = movieTitleInput.value;
  titlesArr.push(movieTitle);
  // call the get movie list function so the list appears upon the search button being clicked
  getMovieList();
  // now do a fetch to get the name of the author
  const urlAuth = `${searchMovieURL}?api_key=${apiKeyMovieDB}&query=${encodeURIComponent(
    movieTitle
  )}`;

  fetch(urlAuth)
    // debug here - ok fixed - was url issue above - search not base
    .then((response) => response.json())
    .then((data) => {
      console.log(data);
      // not for feature - we can use the author to again search for related films that have that author on crew (implement later)
      // take the first movie returned - this is usually the main one we want
      if (data.results.length > 0) {
        var movieId = data.results[0].id;
        var creditsURL = `https://api.themoviedb.org/3/movie/${movieId}/credits?api_key=${apiKeyMovieDB}`;
        console.log(creditsURL);
        return fetch(creditsURL);
      } else {
        throw new Error(
          `Sorry, can't find a movie with the title: "${movieTitle}"`
        );
      }
    })
    .then((response) => response.json())
    .then((data) => {
      console.log(data);
      var author = data.crew.filter(
        (person) =>
          person.job === "Novel" ||
          person.job === "Writer" ||
          person.job === "Author" ||
          person.job === "Short Story"
      );
      // clear the booklist
      authorList.innerHTML = "";
      if (author.length > 0) {
        author.forEach((author) => {
          var liEl = document.createElement("li");
          liEl.textContent = author.name;
          authorList.appendChild(liEl);
        });
      } else {
        var liEl = document.createElement("li");
        liEl.textContent = "No author found";
        authorList.appendChild(liEl);
      }
    });
});

// discover movies based on an author's works - see notes

// Google Books API - will return a list of images of the books, blurb, author, and ISBN
