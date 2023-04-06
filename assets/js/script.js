const apiKeyMovieDB = "10e82ad5be957cc7820f3759e138724a";
const baseMovieURL = "https://api.themoviedb.org/3";
const searchMovieURL = `${baseMovieURL}/search/movie`;
const searchCreditsMovieURL = `${baseMovieURL}/movie/{{id}}/credits`;
// document selectors for displaying information to HTML
const searchForm = document.getElementById("search-form");
// we only need one input for title (ether book or movie)
const movieTitleInput = document.getElementById("movie-title");
const bookList = document.getElementById("book-list");
const movieList = document.getElementById("movie-list");
// book titles stored here
var titlesArr = [];

// movies based on books
function getMovieList() {
  // console.log(titlesArr)
  titlesArr.forEach((title) => {
    var url = `${searchMovieUrl}?api_key=${apiKeyMovieDB}&query=${encodeURIComponent(
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
          var liEl = document.createElement("li");
          var link = document.createElement("a");
          var imgEl = document.createElement("img");
          link.textContent = movie.title;
          link.href = `https://www.themoviedb.org/movie/${movie.id}`;
          imgEl.src = `https://api.themoivedb.org/3/movie/${movie.id}/images?api_key=${apiKeyMovieDB}`;
          imgEl.alt = `${movie.title}`;
          // append image to link/text
          link.appendChild(imgEl);
          // append link and image to list element
          liEl.appendChild(link);
          // append list element to the main list
          movieList.appendChild(liEl);
        });
      });
  });
}

// this function get author
// how?
// is searches the movie db crew data for [job = 'novel'] << see api docs
function getAuthor() {
  searchForm.addEventListener("submit", (event) => {
    event.preventDefault();
    var title = movieTitleInput.value;
    titlesArr.push(title);
  });
}
