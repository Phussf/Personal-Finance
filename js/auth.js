// js/auth.js

import {
    GoogleAuthProvider,
    signInWithPopup,
    onAuthStateChanged,
    signOut
} from
    "https://www.gstatic.com/firebasejs/10.12.5/firebase-auth.js";

import { auth } from "./firebase-config.js";


const provider =
    new GoogleAuthProvider();


// ========================================
// Google Login
// ========================================

async function loginWithGoogle() {

    try {

        const result =
            await signInWithPopup(
                auth,
                provider
            );

        const user =
            result.user;


        console.log(
            "Login สำเร็จ"
        );

        console.log(
            "UID:",
            user.uid
        );

        console.log(
            "Email:",
            user.email
        );

        console.log(
            "Name:",
            user.displayName
        );


        return user;


    } catch (error) {

        console.error(
            "Login Error:",
            error
        );

        throw error;

    }

}


// ========================================
// Logout
// ========================================

async function logout() {

    try {

        await signOut(auth);

        sessionStorage.clear();

        window.location.href =
            "index.html";


    } catch (error) {

        console.error(
            "Logout Error:",
            error
        );

    }

}


// ========================================
// ตรวจสอบ Login
// ========================================

function watchAuth(callback) {

    return onAuthStateChanged(
        auth,
        callback
    );

}


export {
    loginWithGoogle,
    logout,
    watchAuth
};