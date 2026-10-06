import {
    GoogleAuthProvider,
    signInWithPopup,
    onAuthStateChanged,
    signOut
} from "https://www.gstatic.com/firebasejs/10.12.5/firebase-auth.js";

import { auth } from "./firebase-config.js";

const provider = new GoogleAuthProvider();

const SESSION_DURATION = 60 * 60 * 1000;
const SESSION_KEY = "personalFinanceSessionExpiry";

let sessionTimer = null;

function getSessionExpiry() {
    const expiry = localStorage.getItem(SESSION_KEY);

    if (!expiry) {
        return null;
    }

    const expiryTime = Number(expiry);

    if (!Number.isFinite(expiryTime)) {
        localStorage.removeItem(SESSION_KEY);
        return null;
    }

    return expiryTime;
}

function setSessionExpiry() {
    const expiryTime = Date.now() + SESSION_DURATION;
    localStorage.setItem(
        SESSION_KEY,
        String(expiryTime)
    );

    return expiryTime;
}

function clearSessionExpiry() {
    localStorage.removeItem(SESSION_KEY);

    if (sessionTimer) {
        clearTimeout(sessionTimer);
        sessionTimer = null;
    }
}

async function expireSession() {
    clearSessionExpiry();

    try {
        await signOut(auth);
    } catch (error) {
        console.error(
            "Session Expiry Logout Error:",
            error
        );
    }

    if (
        window.location.pathname.endsWith("index.html") ||
        window.location.pathname === "/" ||
        window.location.pathname.endsWith("/")
    ) {
        return;
    }

    window.location.href = "index.html";
}

function startSessionTimer(expiryTime) {
    if (sessionTimer) {
        clearTimeout(sessionTimer);
        sessionTimer = null;
    }

    const remainingTime = expiryTime - Date.now();

    if (remainingTime <= 0) {
        expireSession();
        return;
    }

    sessionTimer = setTimeout(() => {
        expireSession();
    }, remainingTime);
}

function validateSession() {
    const expiryTime = getSessionExpiry();

    if (!expiryTime) {
        return false;
    }

    if (Date.now() >= expiryTime) {
        clearSessionExpiry();
        return false;
    }

    startSessionTimer(expiryTime);
    return true;
}

async function loginWithGoogle() {
    try {
        const result = await signInWithPopup(
            auth,
            provider
        );

        const user = result.user;

        setSessionExpiry();

        console.log("Login สำเร็จ");
        console.log("UID:", user.uid);
        console.log("Email:", user.email);
        console.log("Name:", user.displayName);
        console.log(
            "Session หมดอายุ:",
            new Date(
                getSessionExpiry()
            ).toLocaleString("th-TH")
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

async function logout() {
    try {
        clearSessionExpiry();

        await signOut(auth);

        window.location.href = "index.html";

    } catch (error) {
        console.error(
            "Logout Error:",
            error
        );
    }
}

function watchAuth(callback) {
    return onAuthStateChanged(
        auth,
        async (user) => {
            if (!user) {
                clearSessionExpiry();
                callback(null);
                return;
            }

            const expiryTime = getSessionExpiry();

            if (!expiryTime) {
                await expireSession();
                callback(null);
                return;
            }

            if (Date.now() >= expiryTime) {
                await expireSession();
                callback(null);
                return;
            }

            startSessionTimer(expiryTime);
            callback(user);
        }
    );
}

export {
    loginWithGoogle,
    logout,
    watchAuth
};