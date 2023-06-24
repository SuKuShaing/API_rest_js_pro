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

const lazyloader = new IntersectionObserver((entries) => { //se puede agregar un (callback, options), options se usa para el área o las cosas a cargar y/o definir, en este caso como vigilamos solo lo que ve el usuario, no es necesario colocarlo | el callback recibe una fb, y se la envía una arrow fc
    entries.forEach((entry) => { //El parámetro que se le pasa a esta arrow es lo que entra en el área
        // console.log({entry});
        if (entry.isIntersecting) {
            const url = entry.target.getAttribute('data-img');
            entry.target.setAttribute('src', url);
            // lazyLoader.unobserve(entry.target);
        }
    });
});

function createMovies(movies, container, lazyload = false) { //por defecto el lazyloader esta desactivado
    console.log(`lazyload es ${lazyload}`);
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
            lazyload ? 'data-img' : 'src',  //si el lazyloader está activo se guarda en un lugar, sino en el otro
            `https://image.tmdb.org/t/p/w300${movie.poster_path}`
            );
        movieImg.addEventListener('error', ()=>{ //si es que se genera un error al cargar el poster de la película, lanza una imagen por defecto
            movieImg.setAttribute('src', 'https://lh3.googleusercontent.com/drive-viewer/AFGJ81pFXRJ8k4axZhGMzY_Sxpe-xRiwLQ24Z59VZRV_pqKh42b84_x480Rs2EjT8j8NyqeUl2Iv4m0KQCfnjXb7e_S8rw4V=w1366-h695');
        });

        if (lazyload) { //en caso de que el lazyloader esté activo, se ejecuta
            lazyloader.observe(movieImg);
        };

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

    createMovies(movies, trendingMoviesPreviewList, true);
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

    createMovies(movies, genericSection, true);

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

    createMovies(movies, genericSection, true);
}

async function getTrendingMovies() {
    const {data} = await api_axios('trending/movie/week');
    const movies = data.results;
    // console.log({data, movies});
    trendingMoviesPreviewList.innerHTML = "";

    createMovies(movies, genericSection, true);
}

async function getRelatedMoviesId(id) {
    const { data } = await api_axios('movie/' + id + '/recommendations');
    const relatedMovies = data.results;

    createMovies(relatedMovies, relatedMoviesContainer, true);
}


/* 
Otra manera de acceder a los atributos es llamarlos como si fueran campos (visualmente se me hace mas fácil esta manera):
movieImg.alt=“Nombre de la película”;
movieImg.src='https://image.tmdb.org/t/p/w300/’+movie.poster_path;


Tenemos un archivo ignorado en el git ignore, sí desea usar este repositorio crear su APIKEY en la api que usaremos
# Secrets.js (API KEY)
src/secrets.js
*/ 