/* =========================================================
   MARKET DASHBOARD
   ไม่มี Google Sheets
   ไม่มี Apps Script
   ใช้ Firebase Login อย่างเดียว
   ========================================================= */


/* ================= API ================= */

const API = {

    crypto:
        "https://api.alternative.me/v2/ticker/?limit=10",

    fearGreed:
        "https://api.alternative.me/fng/?limit=1",

    gold:
        "https://api.gold-api.com/price/XAU",

    fx:
        "https://api.frankfurter.app/latest?from=USD&to=THB",

    yahoo:
        "https://query1.finance.yahoo.com/v8/finance/chart/"

};



/* ================= STATE ================= */

const marketState = {

    btc: null,

    eth: null,

    gold: null,

    usdthb: null,

    sp500: null,

    nasdaq: null,

    dow: null,

    fearGreed: null

};



/* ================= FORMAT ================= */

function money(
    value,
    decimals = 2
) {

    if (
        value === null ||
        value === undefined ||
        Number.isNaN(Number(value))
    ) {

        return "--";

    }


    return new Intl.NumberFormat(
        "en-US",
        {
            minimumFractionDigits: decimals,
            maximumFractionDigits: decimals
        }
    ).format(Number(value));

}



function priceUSD(value) {

    if (
        value === null ||
        value === undefined
    ) {

        return "--";

    }


    const number =
        Number(value);


    if (number >= 1000) {

        return "$" +
            money(number, 0);

    }


    if (number >= 1) {

        return "$" +
            money(number, 2);

    }


    return "$" +
        money(number, 4);

}



function percent(
    value
) {

    if (
        value === null ||
        value === undefined ||
        Number.isNaN(Number(value))
    ) {

        return "--";

    }


    const number =
        Number(value);


    const sign =
        number > 0
            ? "+"
            : "";


    return sign +
        number.toFixed(2) +
        "%";

}



function setChange(
    element,
    value
) {

    if (!element) return;


    const number =
        Number(value);


    element.classList.remove(
        "positive",
        "negative",
        "neutral"
    );


    if (
        Number.isNaN(number)
    ) {

        element.classList.add(
            "neutral"
        );

        element.textContent =
            "--";

        return;

    }


    if (number > 0) {

        element.classList.add(
            "positive"
        );

        element.textContent =
            "▲ " + percent(number);

    }

    else if (number < 0) {

        element.classList.add(
            "negative"
        );

        element.textContent =
            "▼ " +
            Math.abs(number).toFixed(2) +
            "%";

    }

    else {

        element.classList.add(
            "neutral"
        );

        element.textContent =
            "0.00%";

    }

}



function setStatus(
    id,
    success = true
) {

    const element =
        document.getElementById(id);


    if (!element) return;


    element.classList.remove(
        "loading"
    );


    element.style.background =
        success
            ? "#22c55e"
            : "#ef4444";

}



/* ================= FETCH ================= */

async function fetchJSON(
    url
) {

    const response =
        await fetch(
            url,
            {
                cache: "no-store"
            }
        );


    if (!response.ok) {

        throw new Error(
            `HTTP ${response.status}`
        );

    }


    return response.json();

}



/* ================= CRYPTO ================= */

async function loadCrypto() {

    try {

        const data =
            await fetchJSON(
                API.crypto
            );


        const coins =
            data?.data || {};


        /*
         * Alternative.me ใช้ ID:
         *
         * Bitcoin = 1
         * Ethereum = 1027
         */


        const bitcoin =
            coins["1"];


        const ethereum =
            coins["1027"];


        if (bitcoin) {

            marketState.btc =
                bitcoin.quotes.USD;


            document.getElementById(
                "btcPrice"
            ).textContent =
                priceUSD(
                    bitcoin.quotes.USD.price
                );


            setChange(
                document.getElementById(
                    "btcChange"
                ),
                bitcoin.quotes.USD
                    .percentage_change_24h
            );


            setStatus(
                "btcStatus"
            );

        }


        if (ethereum) {

            marketState.eth =
                ethereum.quotes.USD;


            document.getElementById(
                "ethPrice"
            ).textContent =
                priceUSD(
                    ethereum.quotes.USD.price
                );


            setChange(
                document.getElementById(
                    "ethChange"
                ),
                ethereum.quotes.USD
                    .percentage_change_24h
            );


            setStatus(
                "ethStatus"
            );

        }


        renderCryptoCards(
            coins
        );


        updateCryptoSummary();

    }

    catch (error) {

        console.error(
            "Crypto API:",
            error
        );


        setStatus(
            "btcStatus",
            false
        );


        setStatus(
            "ethStatus",
            false
        );

    }

}



/* ================= CRYPTO CARDS ================= */

function renderCryptoCards(
    coins
) {

    const grid =
        document.getElementById(
            "cryptoGrid"
        );


    if (!grid) return;


    const preferred = [

        {
            id: "1",
            name: "Bitcoin",
            symbol: "BTC"
        },

        {
            id: "1027",
            name: "Ethereum",
            symbol: "ETH"
        },

        {
            id: "1839",
            name: "BNB",
            symbol: "BNB"
        },

        {
            id: "5426",
            name: "Solana",
            symbol: "SOL"
        },

        {
            id: "52",
            name: "XRP",
            symbol: "XRP"
        },

        {
            id: "3408",
            name: "USDC",
            symbol: "USDC"
        },

        {
            id: "2010",
            name: "Cardano",
            symbol: "ADA"
        },

        {
            id: "74",
            name: "Dogecoin",
            symbol: "DOGE"
        }

    ];


    grid.innerHTML = "";


    preferred.forEach(
        coin => {

            const item =
                coins[coin.id];


            if (!item) return;


            const usd =
                item.quotes.USD;


            const change =
                usd.percentage_change_24h;


            const changeClass =
                Number(change) > 0
                    ? "positive"
                    : Number(change) < 0
                        ? "negative"
                        : "neutral";


            const arrow =
                Number(change) > 0
                    ? "▲ "
                    : Number(change) < 0
                        ? "▼ "
                        : "";


            const card =
                document.createElement(
                    "div"
                );


            card.className =
                "crypto-card";


            card.innerHTML = `

                <div class="crypto-head">

                    <div>

                        <div class="crypto-name">
                            ${coin.name}
                        </div>

                        <div class="crypto-symbol">
                            ${coin.symbol}
                        </div>

                    </div>

                    <div class="crypto-symbol">
                        #${item.rank}
                    </div>

                </div>


                <div class="crypto-price">
                    ${priceUSD(usd.price)}
                </div>


                <div class="crypto-change ${changeClass}">
                    ${arrow}${Math.abs(Number(change)).toFixed(2)}%
                </div>

            `;


            grid.appendChild(
                card
            );

        }
    );

}



/* ================= GOLD ================= */

async function loadGold() {

    try {

        const data =
            await fetchJSON(
                API.gold
            );


        /*
         * Gold API ปัจจุบันส่งราคา
         * ใน field price
         */


        const value =
            Number(
                data?.price
            );


        if (
            Number.isNaN(value)
        ) {

            throw new Error(
                "Gold price unavailable"
            );

        }


        marketState.gold =
            value;


        document.getElementById(
            "goldPrice"
        ).textContent =
            "$" +
            money(value, 2);


        setStatus(
            "goldStatus"
        );


        document.getElementById(
            "goldSummary"
        ).textContent =
            "Gold Spot อยู่ที่ $" +
            money(value, 2) +
            " ต่อ Troy Ounce";

    }

    catch (error) {

        console.error(
            "Gold API:",
            error
        );


        setStatus(
            "goldStatus",
            false
        );


        document.getElementById(
            "goldSummary"
        ).textContent =
            "ไม่สามารถดึงราคาทองคำได้";

    }

}



/* ================= USD / THB ================= */

async function loadFX() {

    try {

        const data =
            await fetchJSON(
                API.fx
            );


        const value =
            Number(
                data?.rates?.THB
            );


        if (
            Number.isNaN(value)
        ) {

            throw new Error(
                "FX unavailable"
            );

        }


        marketState.usdthb =
            value;


        document.getElementById(
            "usdthbPrice"
        ).textContent =
            money(value, 2);


        setStatus(
            "fxStatus"
        );


        document.getElementById(
            "fxSummary"
        ).textContent =
            "1 USD ≈ " +
            money(value, 2) +
            " บาท";

    }

    catch (error) {

        console.error(
            "FX API:",
            error
        );


        setStatus(
            "fxStatus",
            false
        );


        document.getElementById(
            "fxSummary"
        ).textContent =
            "ไม่สามารถดึงค่าเงินได้";

    }

}



/* ================= YAHOO MARKET ================= */

async function loadYahooIndex(
    symbol,
    priceId,
    changeId
) {

    try {

        const url =
            API.yahoo +
            encodeURIComponent(symbol) +
            "?range=1d&interval=5m";


        const data =
            await fetchJSON(
                url
            );


        const result =
            data?.chart?.result?.[0];


        if (!result) {

            throw new Error(
                "No market data"
            );

        }


        const meta =
            result.meta;


        const price =
            meta.regularMarketPrice;


        const previous =
            meta.previousClose;


        const change =
            previous
                ? ((price - previous) /
                    previous) * 100
                : null;


        document.getElementById(
            priceId
        ).textContent =
            money(price, 2);


        setChange(
            document.getElementById(
                changeId
            ),
            change
        );


        return {
            price,
            change
        };

    }

    catch (error) {

        console.error(
            symbol,
            error
        );


        document.getElementById(
            priceId
        ).textContent =
            "--";


        setChange(
            document.getElementById(
                changeId
            ),
            null
        );


        return null;

    }

}



/* ================= MARKET INDEX ================= */

async function loadIndices() {

    const results =
        await Promise.allSettled([

            loadYahooIndex(
                "^GSPC",
                "sp500Price",
                "sp500Change"
            ),

            loadYahooIndex(
                "^IXIC",
                "nasdaqPrice",
                "nasdaqChange"
            ),

            loadYahooIndex(
                "^DJI",
                "dowPrice",
                "dowChange"
            )

        ]);


    const values =
        results
            .filter(
                result =>
                    result.status ===
                    "fulfilled" &&
                    result.value
            )
            .map(
                result =>
                    result.value.change
            )
            .filter(
                value =>
                    value !== null
            );


    if (!values.length) {

        document.getElementById(
            "stockSummary"
        ).textContent =
            "ไม่สามารถโหลดข้อมูลดัชนีได้";

        return;

    }


    const average =
        values.reduce(
            (a, b) => a + b,
            0
        ) / values.length;


    if (average > 0.25) {

        document.getElementById(
            "stockSummary"
        ).textContent =
            "ดัชนีหุ้นที่ติดตามโดยรวมปรับตัวขึ้น";

    }

    else if (average < -0.25) {

        document.getElementById(
            "stockSummary"
        ).textContent =
            "ดัชนีหุ้นที่ติดตามโดยรวมปรับตัวลง";

    }

    else {

        document.getElementById(
            "stockSummary"
        ).textContent =
            "ดัชนีหุ้นที่ติดตามโดยรวมเคลื่อนไหวไม่มาก";

    }

}



/* ================= FEAR & GREED ================= */

async function loadFearGreed() {

    try {

        const data =
            await fetchJSON(
                API.fearGreed
            );


        const item =
            data?.data?.[0];


        if (!item) {

            throw new Error(
                "Fear & Greed unavailable"
            );

        }


        const value =
            Number(
                item.value
            );


        const classification =
            item.value_classification;


        marketState.fearGreed =
            value;


        document.getElementById(
            "fearValue"
        ).textContent =
            value;


        document.getElementById(
            "fearText"
        ).textContent =
            translateFearGreed(
                classification
            );


        /*
         * หมุน gauge ตามค่า 0-100
         */

        const degree =
            Math.max(
                0,
                Math.min(
                    360,
                    value * 3.6
                )
            );


        const gauge =
            document.getElementById(
                "fearGauge"
            );


        gauge.style.background =
            `conic-gradient(
                #ef4444 0deg,
                #f59e0b 90deg,
                #eab308 150deg,
                #22c55e ${degree}deg,
                #334155 ${degree}deg,
                #334155 360deg
            )`;

    }

    catch (error) {

        console.error(
            "Fear & Greed:",
            error
        );


        document.getElementById(
            "fearText"
        ).textContent =
            "ไม่สามารถโหลดข้อมูล";

    }

}



function translateFearGreed(
    value
) {

    const text =
        String(value)
            .toLowerCase();


    if (
        text.includes("extreme fear")
    ) {

        return "😱 Extreme Fear";

    }


    if (
        text.includes("fear")
    ) {

        return "😨 Fear";

    }


    if (
        text.includes("extreme greed")
    ) {

        return "🚀 Extreme Greed";

    }


    if (
        text.includes("greed")
    ) {

        return "🤑 Greed";

    }


    return "😐 Neutral";

}



/* ================= SUMMARY ================= */

function updateCryptoSummary() {

    const btc =
        marketState.btc;


    const eth =
        marketState.eth;


    if (!btc || !eth) {

        document.getElementById(
            "cryptoSummary"
        ).textContent =
            "ข้อมูล Crypto ไม่ครบ";

        return;

    }


    const average =

        (
            Number(
                btc.percentage_change_24h
            ) +

            Number(
                eth.percentage_change_24h
            )

        ) / 2;


    if (average > 0.5) {

        document.getElementById(
            "cryptoSummary"
        ).textContent =
            "BTC และ ETH โดยรวมปรับตัวขึ้นในช่วง 24 ชั่วโมง";

    }

    else if (average < -0.5) {

        document.getElementById(
            "cryptoSummary"
        ).textContent =
            "BTC และ ETH โดยรวมปรับตัวลงในช่วง 24 ชั่วโมง";

    }

    else {

        document.getElementById(
            "cryptoSummary"
        ).textContent =
            "BTC และ ETH เคลื่อนไหวในกรอบค่อนข้างจำกัด";

    }

}



/* ================= LOAD ALL ================= */

window.loadMarketDashboard =
    async function () {

        const refreshBtn =
            document.getElementById(
                "refreshBtn"
            );


        if (refreshBtn) {

            refreshBtn.disabled =
                true;

            refreshBtn.textContent =
                "กำลังโหลด...";

        }


        try {

            /*
             * โหลดพร้อมกัน
             */

            await Promise.allSettled([

                loadCrypto(),

                loadGold(),

                loadFX(),

                loadIndices(),

                loadFearGreed()

            ]);


            /*
             * เวลาอัปเดต
             */

            const now =
                new Date();


            document.getElementById(
                "lastUpdate"
            ).textContent =
                "อัปเดต " +
                now.toLocaleTimeString(
                    "th-TH",
                    {
                        hour: "2-digit",
                        minute: "2-digit",
                        second: "2-digit"
                    }
                );

        }

        finally {

            if (refreshBtn) {

                refreshBtn.disabled =
                    false;

                refreshBtn.textContent =
                    "↻ รีเฟรช";

            }

        }

    };



/* ================= REFRESH BUTTON ================= */

document.addEventListener(
    "DOMContentLoaded",
    () => {

        const button =
            document.getElementById(
                "refreshBtn"
            );


        if (!button) return;


        button.addEventListener(
            "click",
            () => {

                window.loadMarketDashboard();

            }
        );

    }
);



/* ================= AUTO REFRESH ================= */

/*
 * อัปเดตทุก 5 นาที
 *
 * ไม่จำเป็นต้องรีเฟรชหน้าเว็บ
 */

setInterval(
    () => {

        if (
            typeof window.loadMarketDashboard ===
            "function"
        ) {

            window.loadMarketDashboard();

        }

    },
    5 * 60 * 1000
);