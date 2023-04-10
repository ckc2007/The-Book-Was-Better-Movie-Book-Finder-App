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
const authorInput = document.getElementById("author-input");
// use for save to local storage??
var titlesArr = [];
var authorsArr = [];
var searchHistoryArr = [];
// book constants below
const apiKeyBooks = "AIzaSyCglMf-pcXxWk1kbsxscoPr26PL-PStIYU";
const baseBookURL = "https://www.googleapis.com/books/v1";
const searchBookURL = `${baseBookURL}/volumes`;


// book title for search will be the movie title input
// var bookTitleInput = movieTitleInput.value;
// author input will be what is returned by the movie search query for author

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

function getBookList() {
  titlesArr.forEach((title) => {
    var url = `${searchBookURL}?q=${encodeURIComponent(
      title
    )}&key=${apiKeyBooks}`;
    fetch(url)
      .then((response) => response.json())
      .then((data) => {
        console.log(data);
        var books = data.items;
        bookList.innerHTML = "";
        books.forEach((book) => {
          var liEl = document.createElement("li");
          var titleEl = document.createElement("h4");
          var authorEl = document.createElement("h5");
          var link = document.createElement("a");
          var imgEl = document.createElement("img");
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
  var movieTitle = movieTitleInput.value;
  titlesArr.push(movieTitle);
  // call the get movie list function so the list appears upon the search button being clicked
  getMovieList();
  getBookList();
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

const getAllTimeTopMovies = () => {
  return fetch(
    `https://api.themoviedb.org/3/discover/movie?sort_by=vote_average.desc&vote_count.gte=1000&api_key=${apiKeyMovieDB}`
  )
    .then((response) => response.json())
    .then((data) => {
      const moviePromises = data.results.map((movie) => {
        const creditsURL = `https://api.themoviedb.org/3/movie/${movie.id}/credits?api_key=${apiKeyMovieDB}`;
        return fetch(creditsURL).then((response) => response.json());
      });

      return Promise.all(moviePromises).then((creditsData) => {
        const movieList = data.results.filter((movie, index) => {
          const crew = creditsData[index].crew;
          const author = crew.find(
            (person) =>
              person.job === "Novel" ||
              person.job === "Author" ||
              person.job === "Short Story"
          );
          return author;
        });
        const top5Movies = movieList.slice(0, 11);
        const movieEl = top5Movies.map((movie) => {
          const posterUrl = `https://image.tmdb.org/t/p/w200${movie.poster_path}`;
          const movieUrl = `https://www.themoviedb.org/movie/${movie.id}`;
          return `<a href="${movieUrl}"><img src="${posterUrl}" /></a>`;
        });
        // sends the entire list to the container
        return movieEl.join("");
      });
    });
};

getAllTimeTopMovies().then((html) => {
  // insert the HTML into the DOM
  const container = document.getElementById("movie-container");
  container.innerHTML = html;
});


// local storage
if (localStorage.getItem("search-history") !== null) {
  searchHistoryArr = JSON.parse(localStorage.getItem("search-history"));
  searchHistoryListEl.innerHTML = "";
  console.log(searchHistoryArr);
  renderSavedSearch();
}
// add arr to local storage
function saveLocal() {
  localStorage.setItem("search-history", JSON.stringify(searchHistoryArr));
}
//   add city to the saved search list
function renderSavedSearch() {
  searchHistoryListEl.innerHTML = "";
  console.log(searchHistoryArr);
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

// need a tile case function here:
// function title(string) {
//   return string
//     .toLowerCase()
//     .split(" ")
//     .map(function (word) {
//       return word.charAt(0).toUpperCase() + word.slice(1);
//     })
//     .join(" ");
// }

clearSearchBtn.addEventListener("click", function () {
  localStorage.removeItem("search-history");
  searchHistoryListEl.innerHTML = "";
  searchHistoryArr = [];
});
