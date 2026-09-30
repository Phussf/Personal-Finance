import { initializeApp } from
    "https://www.gstatic.com/firebasejs/10.12.5/firebase-app.js";

import {
    initializeAuth,
    browserLocalPersistence,
    browserPopupRedirectResolver
} from
    "https://www.gstatic.com/firebasejs/10.12.5/firebase-auth.js";


const firebaseConfig = {

    apiKey:
        "AIzaSyAN2pqFo58Wbur_GQsFX0080FOZ3C3gWaA",

    authDomain:
        "personal-finance171.firebaseapp.com",

    projectId:
        "personal-finance171",

    storageBucket:
        "personal-finance171.firebasestorage.app",

    messagingSenderId:
        "68983921981",

    appId:
        "1:68983921981:web:c6a4f2a86482d735b63954"

};

const app =
    initializeApp(firebaseConfig);


const auth =
    initializeAuth(app, {

        persistence:
            browserLocalPersistence,

        popupRedirectResolver:
            browserPopupRedirectResolver

    });


export {
    app,
    auth
};