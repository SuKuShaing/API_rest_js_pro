/*
He aquí la documentación de la Api
https://developers.themoviedb.org/3/getting-started
*/

const api_axios = axios.create({
    baseURL: 'https://api.themoviedb.org/3/',
    Headers: {
        'Content-Type': 'application/json;charset=utf-8'
    },
    params: {
        'api_key' : API_KEY
    }
})

//Utils

function createMovies(movies, container) {
    container.innerHTML = "";

    movies.forEach(movie => {

        const movieContainer = document.createElement('div');
        movieContainer.classList.add('movie-container'); //classList para crear la clase del elemento html
        movieContainer.addEventListener('click', () => {
            location.hash='#movie=' + movie.id;
        } );

        const movieImg = document.createElement('img');
        movieImg.classList.add('movie-img');
        movieImg.setAttribute('alt', movie.title); //setAttribute para agregar atributos a la etiqueta html
        movieImg.setAttribute(
            'src', 
            `https://image.tmdb.org/t/p/w300${movie.poster_path}`
            );

        movieContainer.appendChild(movieImg); //appendChild para añadirle los html creados
        container.appendChild(movieContainer);
    })
}

function createCategories(categories, container) {
    container.innerHTML= "";

    categories.forEach(category => {
        const categoryContainer = document.createElement('div');
        categoryContainer.classList.add('category-container'); //classList para crear la clase del elemento html

        const categoryTitle = document.createElement('h3');
        categoryTitle.classList.add('category-title');
        categoryTitle.setAttribute('id', 'id' + category.id); //setAttribute para agregar atributos a la etiqueta html
        categoryTitle.addEventListener('click', () => {
            location.hash = `#category=${category.id}-${category.name}`;
        });
        const categoryTitleText = document.createTextNode(category.name);

        categoryTitle.appendChild(categoryTitleText);
        categoryContainer.appendChild(categoryTitle);
        container.appendChild(categoryContainer);
    });
}

//lamados a la API
async function getTrendingMoviesPreview() {
    const {data} = await api_axios('trending/movie/week');

    const movies = data.results;
    // console.log(movies);
    trendingMoviesPreviewList.innerHTML = "";

    createMovies(movies, trendingMoviesPreviewList);
}

//lamados a la API
async function getMovieById(id) {
    const { data: movie } = await api_axios('movie/' + id);

    const movieImgUrl = `https://image.tmdb.org/t/p/w500${movie.poster_path}`;
    headerSection.style.background = `
    linear-gradient(
        180deg, 
        rgba(0, 0, 0, 0.35) 12.27%, 
        rgba(0, 0, 0, 0) 35.17%
        ),
    url(${movieImgUrl})
    `;

    movieDetailTitle.textContent = movie.title;
    movieDetailDescription.textContent = movie.overview;
    movieDetailScore.textContent = movie.vote_average.toFixed(1);

    createCategories(movie.genres, movieDetailCategoriesList);

    getRelatedMoviesId(id);
}

async function getCategoriesPreview() {
    const {data} = await api_axios('genre/movie/list'); //porque data tiene que estar entre corchetes 
    // console.log('data: ', data)
    
    const categories = data.genres;
    // console.log({data, categories});

    createCategories(categories, categoriesPreviewList);
}

async function getMoviesByCategory(id) {
    const {data} = await api_axios(`discover/movie`, {
        params: {
            with_genres: id
        }
    });

    const movies = data.results;

    createMovies(movies, genericSection);

    // window.scroll(0,0);
    /*el profe uso esto
    document.body.scrollTop = 0; webkit
    document.documentElement.scrollTop = 0; mozilla
    */
}

async function getMoviesBySearch(query) {
    const {data} = await api_axios(`search/movie`, {
        params: {
            query
        }
    });

    const movies = data.results;

    createMovies(movies, genericSection);
}

async function getTrendingMovies() {
    const {data} = await api_axios('trending/movie/week');
    const movies = data.results;
    // console.log({data, movies});
    trendingMoviesPreviewList.innerHTML = "";

    createMovies(movies, genericSection);
}

async function getRelatedMoviesId(id) {
    const { data } = await api_axios('movie/' + id + '/recommendations');
    const relatedMovies = data.results;

    createMovies(relatedMovies, relatedMoviesContainer);
}


/* 
Otra manera de acceder a los atributos es llamarlos como si fueran campos (visualmente se me hace mas fácil esta manera):
movieImg.alt=“Nombre de la película”;
movieImg.src='https://image.tmdb.org/t/p/w300/’+movie.poster_path;


Tenemos un archivo ignorado en el git ignore, sí desea usar este repositorio crear su APIKEY en la api que usaremos
# Secrets.js (API KEY)
src/secrets.js
*/ 