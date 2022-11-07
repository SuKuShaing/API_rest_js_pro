
async function getTrendingMoviesPreview() {
    const res = await fetch('https://api.themoviedb.org/3/trending/movie/week?api_key=' + API_KEY);
    const data = await res.json();

    const movies = data.results;
    console.log({data, movies});
    movies.forEach(movie => {
        const trendingPreviewMoviesContainer = document.getElementById('trendingPreview-movieList');

        const movieContainer = document.createElement('div');
        movieContainer.classList.add('movie-container'); //classList para crear la clase del elemento html

        const movieImg = document.createElement('img');
        movieImg.classList.add('movie-img');
        movieImg.setAttribute('alt', movie.title); //setAttribute para agregar atributos a la etiqueta html
        movieImg.setAttribute('src', `https://image.tmdb.org/t/p/w500${movie.poster_path}`)

        movieContainer.appendChild(movieImg); //appendChild para añadirle los html creados
        trendingPreviewMoviesContainer.appendChild(movieContainer);
    });
}

getTrendingMoviesPreview();



/* 
Tenemos un archivo ignorado en el git ignore, sí desea usar este repositorio crear su APIKEY en la api que usaremos
# Secrets.js (API KEY)
src/secrets.js
*/ 