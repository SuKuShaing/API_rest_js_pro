/*
He aquí la documentación de la Api
https://developers.themoviedb.org/3/getting-started
*/


//Data
const api_axios = axios.create({
    baseURL: 'https://api.themoviedb.org/3/',
    Headers: {
        'Content-Type': 'application/json;charset=utf-8'
    },
    params: {
        'api_key' : API_KEY,
        "language": navigator.language || "es-ES"
        // Para cambiar el idioma a la app ⬆, la api debe soportarlo, hay una iso para este tema -> https://en.wikipedia.org/wiki/ISO_3166-1_alpha-2 
    }
})


function likedMovieList() {
    //con esta fc se obtiene la lista de peliculas guardadas en LS (localStorage)
    const item = JSON.parse(localStorage.getItem('liked_movies')); //convierte el texto que da LS en objeto js
    let movies;

    //Se valida que no esté vacio, sí está vació presenta un error en el lugar en el que fue llamado
    if (item) {//valida que tenga contenido
        movies = item;
    } else {
        movies = {}
    }

    return movies;
}

function likeMovie(movie) {
    //con esta fc agregamos películas a la lista de películas likeadas
    const likedMovies = likedMovieList();//llamamos al objeto que contiene la lista de películas likeadas

    if (likedMovies[movie.id]) {//valida que exista el id de la pelicula, puesto que se guarda el par { id_pelicula: contenido_pelicula }
        likedMovies[movie.id] = undefined;
        //remueve de localStorage la película si se encontraba dentro de la lista
    } else {
        likedMovies[movie.id] = movie;
        //agregar la película a la lista de películas likeadas
    }

    localStorage.setItem('liked_movies', JSON.stringify(likedMovies)); //Convierte el objeto Js en un texto que se guarda en LS
}


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

function createMovies(
    movies, 
    container, 
    {
        lazyload = false, //por defecto el lazyloader esta desactivado
        clean = true,
    } = {},
) {
    console.log(`lazyload es ${lazyload}`);
    if (clean) {
        container.innerHTML = "";
    }

    movies.forEach(movie => {

        const movieContainer = document.createElement('div');
        movieContainer.classList.add('movie-container'); //classList para crear la clase del elemento html

        const movieImg = document.createElement('img');
        movieImg.classList.add('movie-img');
        movieImg.setAttribute('alt', movie.title); //setAttribute para agregar atributos a la etiqueta html
        movieImg.setAttribute(
            lazyload ? 'data-img' : 'src',  //si el lazyloader está activo se guarda en un lugar, sino en el otro
            `https://image.tmdb.org/t/p/w300${movie.poster_path}`
            );
        movieImg.addEventListener('click', () => {
            location.hash='#movie=' + movie.id;
        } );
        movieImg.addEventListener('error', ()=>{ //si es que se genera un error al cargar el poster de la película, lanza una imagen por defecto
            movieImg.setAttribute('src', 'https://lh3.googleusercontent.com/drive-viewer/AFGJ81pFXRJ8k4axZhGMzY_Sxpe-xRiwLQ24Z59VZRV_pqKh42b84_x480Rs2EjT8j8NyqeUl2Iv4m0KQCfnjXb7e_S8rw4V=w1366-h695');
        });

        const movieBtn = document.createElement('button');
        movieBtn.classList.add('movie-btn');
        likedMovieList()[movie.id] && movieBtn.classList.add('movie-btn--liked');
        movieBtn.addEventListener('click', () => {
            movieBtn.classList.toggle('movie-btn--liked');
            likeMovie(movie); //agrega una película a la lista
            getLikedMovies(); //para que se recargue y aparezca el corazón marcado en ambas categorías, trending y liked
            getTrendingMoviesPreview(); //para que se recargue y aparezca el corazón marcado en ambas categorias, trending y liked
        });

        if (lazyload) { //en caso de que el lazyloader esté activo, se ejecuta
            lazyloader.observe(movieImg);
        };

        movieContainer.appendChild(movieImg); //appendChild para añadirle los html creados
        movieContainer.appendChild(movieBtn);
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

    createMovies(movies, trendingMoviesPreviewList, {lazyload: true});
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
    maxPage = data.total_pages;

    createMovies(movies, genericSection, {lazyload: true});

    // window.scroll(0,0);
    /*el profe uso esto
    document.body.scrollTop = 0; webkit
    document.documentElement.scrollTop = 0; mozilla
    */
}

function getPaginatedMoviesByCategory(id) {
    return async function () {
        // document.documentElement.scrollTop : Cuanto de avance ha hecho el usuario en la web, contando los pixeles desde el top // document.documentElement.clientHeight : Cuanto mide la pantalla del usuario en px // document.documentElement.scrollHeight : Cuanto es el largo de la pagina en px

        const { scrollTop, scrollHeight, clientHeight } = document.documentElement;
        const scrollIsBottom = (scrollTop + clientHeight) >= (scrollHeight - (0.1 * clientHeight)) //verifica que el usuario llegue al final del sitio para recargar más películas
        const pageIsNotMax = page < maxPage; //valida que no sea la última pagina que puede ser llamada a la API

        if (scrollIsBottom && pageIsNotMax) {
            page++;
            const {data} = await api_axios(`discover/movie`, {
                params: {
                    with_genres: id,
                    page,
                }
            });
            const movies = data.results;

            createMovies(movies, genericSection, {lazyload: true, clean: false});
        }
    } 
}

async function getMoviesBySearch(query) {
    const {data} = await api_axios(`search/movie`, {
        params: {
            query
        }
    });

    const movies = data.results;
    maxPage = data.total_pages;
    console.log(`maxPage: ${maxPage}`);

    createMovies(movies, genericSection, {lazyload: true});
}

function getPaginatedMoviesBySearch(query) {
    return async function () {
        // document.documentElement.scrollTop : Cuanto de avance ha hecho el usuario en la web, contando los pixeles desde el top // document.documentElement.clientHeight : Cuanto mide la pantalla del usuario en px // document.documentElement.scrollHeight : Cuanto es el largo de la pagina en px

    const { scrollTop, scrollHeight, clientHeight } = document.documentElement;
    const scrollIsBottom = (scrollTop + clientHeight) >= (scrollHeight - (0.1 * clientHeight)) //verifica que el usuario llegue al final del sitio para recargar más películas
    const pageIsNotMax = page < maxPage; //valida que no sea la última pagina que puede ser llamada a la API

    if (scrollIsBottom && pageIsNotMax) {
        page++;
        const {data} = await api_axios(`search/movie`, {
            params: {
                query,
                page,
            }
        });
        const movies = data.results;

        createMovies(movies, genericSection, {lazyload: true, clean: false});
    }
    } 
}

async function getTrendingMovies() {
    const {data} = await api_axios('trending/movie/week');
    const movies = data.results;
    // console.log({data, movies});
    console.log(`total_pages: ${data.total_pages}`);
    maxPage = data.total_pages;
    trendingMoviesPreviewList.innerHTML = "";

    createMovies(movies, genericSection, {lazyload: true, clean: false});

    // const btnLoadMore = document.createElement('button');
    // btnLoadMore.innerText = 'Cargar más';
    // btnLoadMore.addEventListener('click', getPaginatedTrendingMovies)

    // genericSection.appendChild(btnLoadMore);
}

async function getPaginatedTrendingMovies() {
    // document.documentElement.scrollTop : Cuanto de avance ha hecho el usuario en la web, contando los pixeles desde el top
    // document.documentElement.clientHeight : Cuanto mide la pantalla del usuario en px
    // document.documentElement.scrollHeight : Cuanto es el largo de la pagina en px

    const { scrollTop, scrollHeight, clientHeight } = document.documentElement;

    const scrollIsBottom = (scrollTop + clientHeight) >= (scrollHeight - (0.1 * clientHeight)) //verifica que el usuario llegue al final del sitio para recargar más películas

    const pageIsNotMax = page < maxPage; //valida que no sea la última pagina que puede ser llamada a la API

    if (scrollIsBottom && pageIsNotMax) {
        page++;
        const {data} = await api_axios('trending/movie/week', {
            params: {
                page,

            },
        });    
        const movies = data.results;

        createMovies(movies, genericSection, {lazyload: true, clean: false});
    }

    //Ya no necesitamos el botón puesto que al llegar al final la web agrega más películas
    // const btnLoadMore = document.createElement('button');
    // btnLoadMore.innerText = 'Cargar más';
    // btnLoadMore.addEventListener('click', getPaginatedTrendingMovies)
    // genericSection.appendChild(btnLoadMore);
}

async function getRelatedMoviesId(id) {
    const { data } = await api_axios('movie/' + id + '/recommendations');
    const relatedMovies = data.results;

    createMovies(relatedMovies, relatedMoviesContainer, {lazyload: true});
}

function getLikedMovies() {
    //Esta fc obtiene la lista de películas likeadas y las coloca en la pantalla
    const likedMovies = likedMovieList(); //llama a la lista de películas y obtiene un objeto que contiene la lista
    const moviesArray = Object.values(likedMovies) // la fc para crear cada película recibe un array no un objeto, así que transformamos ese objeto en un array

    createMovies(moviesArray, likedMoviesListArticle, { lazyload: true, clean: true }); //creamos cada película
}

/* 
Otra manera de acceder a los atributos es llamarlos como si fueran campos (visualmente se me hace mas fácil esta manera):
movieImg.alt=“Nombre de la película”;
movieImg.src='https://image.tmdb.org/t/p/w300/’+movie.poster_path;


Tenemos un archivo ignorado en el git ignore, sí desea usar este repositorio crear su APIKEY en la api que usaremos
# Secrets.js (API KEY)
src/secrets.js
*/ 