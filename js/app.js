/* 
Attendre le chargement du DOM
*/
document.addEventListener('DOMContentLoaded', () => {

    /* 
    Déclarations
    */
        const registerForm = document.querySelector('#register');
        const loginForm = document.querySelector('#login');
        const searchForm = document.querySelector('#searchDataForm');

        const searchLabel = document.querySelector('header form span');
        const searchData = document.querySelector('[name="searchData"]');
        const api_key = '5bc5808f012c27ff4c3564f5822edd37'
        const themoviedbUrl = `https://api.themoviedb.org/3/search/movie?api_key=${api_key}&query=`;
        const movieList = document.querySelector('#movieList');
        const moviePopin = document.querySelector('#moviePopin');
        const favSection = document.querySelector('#favoritesFilmSection');
        const btnLogout = document.querySelector('#logout')
        const btnProfil = document.querySelector('#profil')
        const btnCloseProfil = document.querySelector('#closeProfil')
        const profilSection = document.querySelector('#profilSection')
        const logSection = document.querySelector('#logSection')
        const btnLogin = document.querySelector('#loginBtn')
        const btnRegister = document.querySelector('#registerBtn')
        
        let favoritesFilm = [];
    //

    /* 
    Fonctions
    */

    const checkUserConnect = () => {
        if(localStorage.getItem('user_id')){
            getProfil(localStorage.getItem('user_id'))
            btnProfil.classList.add('open')
            btnLogout.classList.add('open')
            registerForm.classList.add('close')
            loginForm.classList.add('close')
        } else {
            loginForm.classList.add('open')
            btnProfil.classList.add('close')
            btnLogout.classList.add('close')
            logSection.classList.add('open')

        }
        btnLogin.addEventListener('click',event => {
            btnRegister.classList.remove('close')
            btnRegister.classList.add('open')
            btnLogin.classList.remove('open')
            btnLogin.classList.add('close')
            registerForm.classList.remove('open')
            registerForm.classList.add('close')
            loginForm.classList.add('open')
            loginForm.classList.remove('close')           
        })
        btnRegister.addEventListener('click',event => {
            btnRegister.classList.remove('open')
            btnRegister.classList.add('close')
            btnLogin.classList.remove('close')
            btnLogin.classList.add('open')
            registerForm.classList.add('open')
            registerForm.classList.remove('close')
            loginForm.classList.remove('open')
            loginForm.classList.add('close')       
        })
        btnLogout.addEventListener('click', event => {
            if(registerForm.classList.contains('open')){
                registerForm.classList.remove('open')
                registerForm.classList.add('close')
            }
            if(btnLogin.classList.contains('open')){
                btnLogin.classList.remove('open')
                btnLogin.classList.add('close')
                btnRegister.classList.add('open')
                btnRegister.classList.remove('close')
            }
            btnProfil.classList.add('close')
            btnProfil.classList.remove('open')
            btnLogout.classList.remove('open')
            localStorage.removeItem('user_id')
            checkUserConnect()
        })
        btnProfil.addEventListener('click', event => {
            if(!profilSection.classList.contains('open')){
                profilSection.classList.remove('close')
                profilSection.classList.add('open')

            }
        })
        btnCloseProfil.addEventListener('click', event => {
            if(profilSection.classList.contains('open')){
                profilSection.classList.remove('open')
                profilSection.classList.add('close')
            }
        })
    }

        const getProfil = user_id => {
           fetch('https://api.dwsapp.io/api/me/'+user_id)
           .then(r => {
               return r.json()
            })
            .then(jsonData => {
                console.log(jsonData)
                favoritesFilm = jsonData.data.favorite
                displayFavoritesFilm()
            })
            .catch(err => {
                console.error(err)
            })
        }

       

        const displayFavoritesFilm = () => {
            favSection.innerHTML = '';
            
            favoritesFilm.forEach( film => {
                favSection.innerHTML += `
                <li>${film.title} <button class="fav" movie-id="${film.id}">Voir les détails</button><button class="del-fav" fav-id="${film._id}">Supprimer</button></li>
                `;
            })

            getPopinLink( document.querySelectorAll('.fav') );

            document.querySelectorAll('.del-fav').forEach(btn => {
                btn.addEventListener('click', event => {
                    fetch('https://api.dwsapp.io/api/favorite/'+btn.getAttribute('fav-id'), {
                        method: 'DELETE',
                        headers: {'Content-type': 'application/json'}
                    })
                    .then(r => {
                        getProfil(localStorage.getItem('user_id'))
                        displayFavoritesFilm()
                    })
                    .catch(err => {
                        console.error(err)
                    })
                })
            })
           
        };

        const getSearchSumbit = () => {
            searchForm.addEventListener('submit', event => {
                // Stop event propagation
                event.preventDefault();

                // Check form data
                searchData.value.length > 0 
                ? fetchFunction(searchData.value) 
                : displayError(searchData, 'Minimum 1 caractère')
            })
        }

        const postRegisterSumbit = () => {
            registerForm.addEventListener('submit', event => {
                // Stop event propagation
                event.preventDefault();

                let data = formDataToJson(registerForm)

                postFetchFunction(data, 'https://api.dwsapp.io/api/register')
            });
        };

        const postLoginSumbit = () => {
            loginForm.addEventListener('submit', event => {
                // Stop event propagation
                event.preventDefault();

                let data = formDataToJson(loginForm)

                postFetchFunction(data, 'https://api.dwsapp.io/api/login')
            });
        };
        
        const formDataToJson = (form) => {
            let formData = new FormData(form)

            let object = {};
            formData.forEach(function(value, key){
                object[key] = value;
            });
            return JSON.stringify(object);
        }

        const displayError = (tag, msg) => {
            searchLabel.textContent = msg;
            tag.addEventListener('focus', () => searchLabel.textContent = '');
        };

        const postFetchFunction = (data, url) => {
            fetch(url, {
                method: 'POST',
                body: data,
                headers: {'Content-type': 'application/json'}
            })
            .then(r => {
                return r.json()
            })
            .then( jsonData => {
                if(jsonData.data.identity._id){
                    window.localStorage.setItem('user_id', jsonData.data.identity._id);
                    logSection.classList.remove('open')
                    logSection.classList.add('close')
                    btnLogout.classList.remove('close')
                    btnLogout.classList.add('open')
                    getProfil(localStorage.getItem('user_id'))
                    if(btnProfil.classList.contains('close')){
                        btnProfil.classList.remove('close')
                        btnProfil.classList.add('open')
                    }
                }
            })
            .catch(err => {
                console.error(err)
            })
        }

        const fetchFunction = (keywords, index = 1) => {
            
            let fetchUrl = null;

            typeof keywords === 'number' 
            ? fetchUrl = `https://api.themoviedb.org/3/movie/${keywords}?api_key=${api_key}`
            : fetchUrl = themoviedbUrl + keywords + '&page=' + index


            fetch( fetchUrl )
            .then( response => response.ok ? response.json() : 'Response not OK' )
            .then( jsonData => {
                typeof keywords === 'number' 
                ? displayPopin(jsonData)
                : displayMovieList(jsonData.results)
            })
            .catch( err => console.error(err) );
        };

        const displayMovieList = collection => {
            searchData.value = '';
            movieList.innerHTML = '';
            
            for( let i = 0; i < collection.length; i++ ){
                movieList.innerHTML += `
                    <article>
                        <figure>
                            <img src="https://image.tmdb.org/t/p/w500/${collection[i].poster_path}" alt="${collection[i].original_title}">
                            <figcaption movie-id="${collection[i].id}">
                                ${collection[i].original_title} (voir plus...)
                            </figcaption>
                        </figure>
                        <div class="overview">
                            <div>
                                <p>${collection[i].overview}</p>
                                <button>Voir le film</button>
                            </div>
                        </div>
                    </article>
                `;
            };

            getPopinLink( document.querySelectorAll('figcaption') );
        };

        const getPopinLink = linkCollection => {
            for( let link of linkCollection ){
                link.addEventListener('click', () => {
                    fetchFunction( +link.getAttribute('movie-id') );
                });
            };
        };

        const displayPopin = data => {
            moviePopin.innerHTML = `
                <div>
                    <img src="https://image.tmdb.org/t/p/w500/${data.poster_path}" alt="${data.original_title}">
                </div>

                <div>
                    <h2>${data.original_title}</h2>
                    <p>${data.overview}</p>
                    <button id="getStream" movie-id="${data.id}">Voir en streaming</button>
                    <button movie-id="${data.id}" movie-title="${data.original_title}" id="addFavorite">Ajouter en favoris</button>
                    <button id="closeButton">Close</button>
                </div>
            `;

            moviePopin.classList.add('open');
            closePopin(document.querySelector('#closeButton'))
            postFavorite(document.querySelector('#addFavorite'))
            getLinkStream(document.querySelector('#getStream'))
        };

        const postFavorite = button => {
            button.addEventListener('click', () => {
                if(localStorage.getItem('user_id')){
                    let idFilm = button.getAttribute('movie-id')
                    let titleFilm = button.getAttribute('movie-title')
                    let data = {author: localStorage.getItem('user_id'), id: idFilm, title: titleFilm}
                    fetch('https://api.dwsapp.io/api/favorite',{
                        method: 'POST',
                        body: JSON.stringify(data),
                        headers: {'Content-type': 'application/json'}
                    })
                    .then(r => {
                        return r.json()
                    })
                    .then(jsonData => {
                        favoritesFilm.push(jsonData.data)
                        displayFavoritesFilm()
                    })
                    .catch(err => {
                        console.error(err)
                    })
                }
            });
        };

        const getLinkStream = button => {
            button.addEventListener('click', () => {
                if(localStorage.getItem('user_id')){
                    let idFilm = button.getAttribute('movie-id')
                    fetch('https://vsrequest.video/request.php?key=hTYf5EHcjvyQNYyq&secret_key=kkyexzqxvo5jeewlppqpsxs32ftzii&video_id='+idFilm,{
                        method: 'GET',
                        headers: {'Content-type': 'application/json'}
                    })
                    .then(r => {
                        return r.json()
                    })
                    .then(jsonData => {
                        console.log(jsonData)
                    })
                    .catch(err => {
                        console.error(err)
                    })
                }
            });
        };

        const closePopin = button => {
            button.addEventListener('click', () => {
                moviePopin.classList.add('close')
                moviePopin.classList.remove('open')
            })
        }
    //

    /* 
    Lancer IHM
    */
            
        checkUserConnect()
        getSearchSumbit()
        postRegisterSumbit()
        postLoginSumbit()        
    //
});