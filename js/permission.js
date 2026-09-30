
import { auth } from "./firebase-config.js";

const API_URL =
    "https://script.google.com/macros/s/AKfycbzNSbHC53WeBzTKHa6CMWLK_p8xMBLOiXpAAa1Ln7_RXujRweossN1biXuyH6sSi9HCgQ/exec";


function waitForAuth() {

    return new Promise(function (resolve) {

        if (auth.currentUser) {

            resolve(auth.currentUser);

            return;
        }


        const unsubscribe =
            auth.onAuthStateChanged(function (user) {

                unsubscribe();

                resolve(user);

            });

    });
}


async function getFirebaseToken() {

    const user =
        await waitForAuth();


    if (!user) {

        window.location.href =
            "index.html";

        return null;
    }


    const token =
        await user.getIdToken();


    if (!token) {

        throw new Error(
            "ไม่สามารถรับ Firebase ID Token ได้"
        );
    }


    return token;
}


function sleep(ms) {

    return new Promise(function (resolve) {

        setTimeout(resolve, ms);

    });
}


export async function checkPermission() {

    let lastError = null;



    for (
        let attempt = 1;
        attempt <= 3;
        attempt++
    ) {

        try {

            const token =
                await getFirebaseToken();


            if (!token) {

                throw new Error(
                    "ไม่สามารถยืนยันตัวตนได้"
                );
            }


            const url =
                API_URL
                + "?action=permission"
                + "&token="
                + encodeURIComponent(token);


            console.log(
                `Permission attempt ${attempt}:`,
                url
            );


            const response =
                await fetch(url, {

                    method: "GET",

                    cache: "no-store"

                });


            console.log(
                `Permission HTTP status ${attempt}:`,
                response.status
            );


            console.log(
                `Permission HTTP ok ${attempt}:`,
                response.ok
            );


            const responseText =
                await response.text();


            console.log(
                `Permission raw response ${attempt}:`,
                responseText
            );


            if (!response.ok) {

                throw new Error(
                    `HTTP ${response.status}`
                );
            }


            let result;

            try {

                result =
                    JSON.parse(
                        responseText
                    );

            } catch (error) {

                console.error(
                    "Permission JSON error:",
                    error
                );

                throw new Error(
                    "ระบบสิทธิ์ส่งข้อมูลไม่ถูกต้อง"
                );
            }


            console.log(
                "Permission response:",
                result
            );


            if (
                result.authorized !== true
            ) {

                const status =
                    String(
                        result.status || ""
                    )
                    .trim()
                    .toUpperCase();


                if (

                    status === "DENIED" ||

                    status === "UNAUTHORIZED" ||

                    status === "NOT_FOUND"

                ) {

                    return {

                        authorized: false,

                        status: status,

                        error:
                            result.error ||

                            "บัญชีของคุณไม่มีสิทธิ์ใช้งานระบบ"

                    };

                }


                if (

                    status === "INVALID_TOKEN" ||

                    status === "NO_TOKEN"

                ) {

                    return {

                        authorized: false,

                        status: status,

                        error:
                            result.error ||

                            "ไม่สามารถยืนยันตัวตนได้"

                    };

                }


                return {

                    authorized: false,

                    status:
                        status || "UNKNOWN",

                    error:
                        result.error ||

                        "ไม่สามารถตรวจสอบสิทธิ์การใช้งานได้"

                };
            }


       
            const status =
                String(
                    result.status ?? "active"
                )
                .trim()
                .toLowerCase();


            if (

                status !== "active" &&

                status !== "-"

            ) {

                return {

                    authorized: false,

                    status: "UNKNOWN",

                    error:
                        "ไม่สามารถยืนยันสถานะสิทธิ์ของบัญชีได้"

                };
            }


            return {

                authorized: true,

                status: status,

                updating:
                    status === "-",

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


        } catch (error) {

            console.warn(
                `Permission attempt ${attempt} failed:`,
                error
            );


            lastError =
                error;


       
            if (attempt < 3) {

                await sleep(1000);

            }

        }

    }


    console.error(
        "Permission failed after 3 attempts:",
        lastError
    );


    throw new Error(
        "ไม่สามารถเชื่อมต่อระบบสิทธิ์ได้"
    );
}



export async function getInvestmentHistory() {

    let lastError = null;


 
    for (
        let attempt = 1;
        attempt <= 3;
        attempt++
    ) {

        try {

            const token =
                await getFirebaseToken();


            if (!token) {

                throw new Error(
                    "ไม่สามารถยืนยันตัวตนได้"
                );
            }


            const url =
                API_URL
                + "?action=getInvestmentHistory"
                + "&token="
                + encodeURIComponent(token);


            console.log(
                `Investment History attempt ${attempt}:`,
                url
            );


            const response =
                await fetch(url, {

                    method: "GET",

                    cache: "no-store"

                });


            console.log(
                `Investment History HTTP status ${attempt}:`,
                response.status
            );


            console.log(
                `Investment History HTTP ok ${attempt}:`,
                response.ok
            );


      
            const responseText =
                await response.text();


            console.log(
                "Investment History raw response:",
                responseText
            );


            if (!response.ok) {

                throw new Error(
                    "Apps Script HTTP "
                    + response.status
                    + ": "
                    + responseText
                );
            }


            let result;

            try {

                result =
                    JSON.parse(
                        responseText
                    );

            } catch (error) {

                console.error(
                    "Investment History JSON error:",
                    error
                );

                throw new Error(
                    "ระบบส่งข้อมูลประวัติการลงทุนไม่ถูกต้อง: "
                    + responseText
                );
            }


            console.log(
                "Investment History response:",
                result
            );


       
            if (
                result.authorized !== true
            ) {

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


        } catch (error) {

            console.warn(
                `Investment History attempt ${attempt} failed:`,
                error
            );


            lastError =
                error;


            if (attempt < 3) {

                await sleep(1000);

            }

        }

    }


    console.error(
        "Investment History failed after 3 attempts:",
        lastError
    );


    throw new Error(
        "ไม่สามารถเชื่อมต่อระบบข้อมูลการลงทุนได้"
    );
}