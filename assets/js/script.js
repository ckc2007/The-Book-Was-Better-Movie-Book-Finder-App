const apiKeyMovieDB = "10e82ad5be957cc7820f3759e138724a";
const baseMovieURL = "https://api.themoviedb.org/3";
const searchMovieURL = `${baseMovieURL}/search/movie`;
const searchCreditsMovieURL = `${baseMovieURL}/movie/{{id}}/credits`;
// document selectors for displaying information to HTML
const searchForm = document.getElementById("search-form");
// we only need one input for title (ether book or movie)
const titleInput = document.getElementById("title-input");
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
        movies.forEach((movie) => {
          var liEl = document.createElement("li");
          var link = document.createElement("a");
          link.textContent = movie.title;
          link.href = `https://www.themoviedb.org/movie/${movie.id}`;
          liEl.appendChild(link);
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
    var title = titleInput.value;
    titlesArr.push(title);
  });
}
