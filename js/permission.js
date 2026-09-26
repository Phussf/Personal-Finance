import { auth } from "./firebase-config.js";


// ======================================================
// APPS SCRIPT WEB APP URL
// ======================================================

const API_URL =
    "https://script.google.com/macros/s/AKfycbzNSbHC53WeBzTKHa6CMWLK_p8xMBLOiXpAAa1Ln7_RXujRweossN1biXuyH6sSi9HCgQ/exec";


// ======================================================
// WAIT FOR FIREBASE AUTH
// ======================================================

function waitForAuth() {

    return new Promise(function(resolve) {

        if (auth.currentUser) {

            resolve(auth.currentUser);

            return;

        }


        const unsubscribe =
            auth.onAuthStateChanged(
                function(user) {

                    unsubscribe();

                    resolve(user);

                }
            );

    });

}


// ======================================================
// GET FIREBASE ID TOKEN
// ======================================================

async function getFirebaseToken() {

    const user =
        await waitForAuth();


    if (!user) {

        window.location.href =
            "index.html";

        return null;

    }


    const token =
        await user.getIdToken(true);


    return token;

}


// ======================================================
// CHECK PERMISSION
// ======================================================

export async function checkPermission() {

    const token =
        await getFirebaseToken();


    if (!token) {

        return null;

    }


    const url =
        API_URL
        + "?action=permission"
        + "&token="
        + encodeURIComponent(token);


    const response =
        await fetch(url);


    if (!response.ok) {

        throw new Error(
            "ไม่สามารถเชื่อมต่อระบบสิทธิ์ได้"
        );

    }


    const result =
        await response.json();


    console.log(
        "Permission response:",
        result
    );


    if (!result.authorized) {

        throw new Error(
            result.error ||
            "ไม่มีสิทธิ์ใช้งานระบบ"
        );

    }


    return {

        uid:
            result.uid,

        email:
            result.email,

        name:
            result.name,

        role:
            result.role,

        account_id:
            result.account_id

    };

}


// ======================================================
// GET INVESTMENT HISTORY
// ======================================================

export async function getInvestmentHistory() {

    const token =
        await getFirebaseToken();


    if (!token) {

        return null;

    }


    const url =
        API_URL
        + "?action=getInvestmentHistory"
        + "&token="
        + encodeURIComponent(token);


    const response =
        await fetch(url);


    if (!response.ok) {

        throw new Error(
            "ไม่สามารถโหลดประวัติการลงทุนได้"
        );

    }


    const result =
        await response.json();


    console.log(
        "Investment History response:",
        result
    );


    if (!result.authorized) {

        throw new Error(
            result.error ||
            "ไม่สามารถเข้าถึงข้อมูลได้"
        );

    }


    if (!result.data) {

        throw new Error(
            "ไม่พบข้อมูลลูกค้า"
        );

    }


    return result.data;

}

