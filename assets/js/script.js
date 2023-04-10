const apiKeyMovieDB = "10e82ad5be957cc7820f3759e138724a";
const baseMovieURL = "https://api.themoviedb.org/3";
const searchMovieURL = `${baseMovieURL}/search/movie`;
const searchCreditsMovieURL = `${baseMovieURL}/movie/{{id}}/credits`;
// document selectors for displaying information to HTML
const searchForm = document.getElementById("search-form");
const searchContainer = document.getElementById("search-container");
// we only need one input for title (ether book or movie)
const movieTitleInput = document.getElementById("movie-title");
// using author list in the get author section
const authorList = document.getElementById("author-list");
// using bookList below in the google books section
const bookList = document.getElementById("book-list");
const movieList = document.getElementById("movie-list");
// book titles stored here
const authorInput = document.getElementById("author-input");
// use for save to local storage
var searchHistoryListEl = document.getElementById("search-history");
var savedCityBtn = document.querySelector(".btn");
var clearSearchBtn = document.querySelector("#clearBtn");
var titlesArr = [];
var authorsArr = [];
var searchHistoryArr = [];
// book constants below
const apiKeyBooks = "AIzaSyCglMf-pcXxWk1kbsxscoPr26PL-PStIYU";
const baseBookURL = "https://www.googleapis.com/books/v1";
const searchBookURL = `${baseBookURL}/volumes`;

// need a tile case function to correct for caps in input field:
function title(string) {
  return string
    .toLowerCase()
    .split(" ")
    .map(function (word) {
      return word.charAt(0).toUpperCase() + word.slice(1);
    })
    .join(" ");
}

// local storage
if (localStorage.getItem("search-history") !== null) {
  searchHistoryArr = JSON.parse(localStorage.getItem("search-history"));
  searchHistoryListEl.innerHTML = "";
  // console.log(searchHistoryArr);
  renderSavedSearch();
}

// add arr to local storage
function saveLocal() {
  localStorage.setItem("search-history", JSON.stringify(searchHistoryArr));
}

// add title to the saved search list
function renderSavedSearch() {
  searchHistoryListEl.innerHTML = "";
  // console.log(searchHistoryArr);
  for (var i = 0; i < searchHistoryArr.length; i++) {
    var buttonEl = document.createElement("button");
    buttonEl.setAttribute("id", `${searchHistoryArr[i]}`);
    buttonEl.classList.add("btn");
    buttonEl.textContent = searchHistoryArr[i].toString();
    searchHistoryListEl.appendChild(buttonEl);
    var breakEl = document.createElement("br");
    searchHistoryListEl.appendChild(breakEl);
  }
  saveLocal();
}

renderSavedSearch();

// clear search button functionality
clearSearchBtn.addEventListener("click", function () {
  localStorage.removeItem("search-history");
  searchHistoryListEl.innerHTML = "";
  searchHistoryArr = [];
});

// movies based on books list
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
        movieList.innerHTML = "";
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

// get books list
function getBookList() {
  titlesArr.forEach((title) => {
    var url = `${searchBookURL}?q=${encodeURIComponent(
      title
    )}&key=${apiKeyBooks}`;
    fetch(url)
      .then((response) => response.json())
      .then((data) => {
        // console.log(data);
        var books = data.items;
        bookList.innerHTML = "";
        books.forEach((book) => {
          var liEl = document.createElement("li");
          var titleEl = document.createElement("h4");
          var authorEl = document.createElement("h5");
          var link = document.createElement("a");
          var imgEl = document.createElement("img");
          // isbn not working - debug later
          // var isbnEl = document.createElement("p");
          var blurbEl = document.createElement("p");
          titleEl.textContent = book.volumeInfo.title;
          authorEl.textContent = book.volumeInfo.authors[0];
          link.href = book.volumeInfo.infoLink;
          imgEl.src = book.volumeInfo.imageLinks.smallThumbnail;
          imgEl.alt = book.volumeInfo.title;
          // isbnEl.textContent = book.volumeInfo.industryIdentifiers[0];
          blurbEl.textContent = book.volumeInfo.description;
          link.appendChild(imgEl);
          link.appendChild(titleEl);
          liEl.appendChild(link);
          liEl.appendChild(authorEl);
          liEl.appendChild(blurbEl);
          // liEl.appendChild(isbnEl);
          bookList.appendChild(liEl);
        });
      });
  });
}

// this function gets the AUTHOR and call the getMovieList function for display
// how?
// is searches the movie db crew data for [job = 'novel'] << see api docs
searchForm.addEventListener("submit", (event) => {
  event.preventDefault();
  var movieTitle = title(movieTitleInput.value);
  searchHistoryArr.push(movieTitle);
  titlesArr = [];
  titlesArr.push(movieTitle);
  bookList.innerHTML = "";
  movieList.innerHTML = "";
  // call the get movie list function so the list appears upon the search button being clicked
  getMovieList();
  getBookList();
  // now do a fetch to get the name of the author
  const urlAuth = `${searchMovieURL}?api_key=${apiKeyMovieDB}&query=${encodeURIComponent(
    movieTitle
  )}`;
  saveLocal();
  renderSavedSearch();

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
          var liEl = document.createElement("p");
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

// convert to async function?
// this populates the header with all the top rated films based on books (filtered)
const getAllTimeTopMovies = () => {
  return fetch(
    `https://api.themoviedb.org/3/discover/movie?sort_by=vote_average.desc&vote_count.gte=1000&api_key=${apiKeyMovieDB}`
  )
    .then((response) => response.json())
    .then((data) => {
      // these are the top 20 or so films by rating
      // console.log(data);
      const moviePromises = data.results.map((movie) => {
        const creditsURL = `https://api.themoviedb.org/3/movie/${movie.id}/credits?api_key=${apiKeyMovieDB}`;
        return fetch(creditsURL).then((response) => response.json());
      });
      // console.log(moviePromises)

      return Promise.all(moviePromises).then((creditsData) => {
        const movieList = data.results.filter((movie, index) => {
          // this is the credit data for the above list
          // console.log(creditsData);
          // look at the crew data property for each film
          const crew = creditsData[index].crew;
          // filter the crew list to find those that have the following jobs
          const author = crew.find(
            (person) =>
              person.job === "Novel" ||
              person.job === "Author" ||
              person.job === "Short Story"
          );
          // finds the author if the job exists in the credits
          return author;
        });
        // slice the list to show up to 10 movies that have an author
        // remember this is an array
        const top5Movies = movieList.slice(0, 11);
        // console.log(top5Movies);
        const movieEl = top5Movies.map((movie) => {
          const posterUrl = `https://image.tmdb.org/t/p/w200${movie.poster_path}`;
          const movieUrl = `https://www.themoviedb.org/movie/${movie.id}`;
          return `<a class="carousel-item" href="${movieUrl}"><img src="${posterUrl}" /></a>`;
        });
        // concats the list of links/images
        return movieEl.join("");
      });
    });
};

getAllTimeTopMovies().then((html) => {
  // insert the HTML into the DOM
  const container = document.getElementById("movie-container");
  container.innerHTML = html;
});

$(document).on("click", ".btn", function () {
  var movieTitle = $(this).attr("id");
  // searchHistoryArr.push(movieTitle);
  titlesArr = [];
  titlesArr.push(movieTitle);
  // titlesArr.push(movieTitle);
  // bookList.innerHTML = "";
  // movieList.innerHTML = "";
  // call the get movie list function so the list appears upon the search button being clicked
  getMovieList();
  getBookList();
  // now do a fetch to get the name of the author
  const urlAuth = `${searchMovieURL}?api_key=${apiKeyMovieDB}&query=${encodeURIComponent(
    movieTitle
  )}`;
  // saveLocal();
  // renderSavedSearch();

  fetch(urlAuth)
    // debug here - ok fixed - was url issue above - "search url" not "base url"
    .then((response) => response.json())
    .then((data) => {
      console.log(data);
      // not for feature - we can use the author to again search for related films that have that author on crew (implement later)
      // take the first movie returned - this is usually the main one we want
      if (data.results.length > 0) {
        var movieId = data.results[0].id;
        var creditsURL = `https://api.themoviedb.org/3/movie/${movieId}/credits?api_key=${apiKeyMovieDB}`;
        // console.log(creditsURL);
        return fetch(creditsURL);
      } else {
        throw new Error(
          `Sorry, can't find a movie with the title: "${movieTitle}"`
        );
      }
    })
    .then((response) => response.json())
    .then((data) => {
      // console.log(data);
      var author = data.crew.filter(
        (person) =>
          person.job === "Novel" ||
          person.job === "Writer" ||
          person.job === "Author" ||
          person.job === "Short Story"
      );
      // clear the author list
      authorList.innerHTML = "";
      if (author.length > 0) {
        author.forEach((author) => {
          var liEl = document.createElement("p");
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
