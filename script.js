//namespacing, by placing entire app in an object
const myApp = {};

//loading google chart library
google.charts.load('current', { 'packages': ['corechart'] });

myApp.apiKey = "73dd81a240fd490f9bf17b5bf8c2c369";
myApp.form = document.querySelector("form");
myApp.quote = document.querySelector(".stock");
myApp.display = document.querySelector(".display");
myApp.metrics = document.querySelector(".metrics");
myApp.error = document.querySelector(".error");

myApp.handleInputs = function(e) {
    //stops form from refreshing only if event exists, other stop function
    if(e === undefined) return;
    else e.preventDefault();
    const stockQuote = myApp.quote.value;

    //clears the li elements from the metrics ul element
    myApp.metrics.innerHTML = "";
    myApp.error.innerHTML = "";
    if(stockQuote) {
        myApp.handleData(stockQuote);
    }
    else {
        const error = document.createElement("h2");
        error.textContent = `You forgot to enter a stock quote!`;
        myApp.error.append(error);
        myApp.display.innerHTML = "";
    }

    //clears text entry in form
    this.reset();
}

myApp.handleData = function(quote) {
    //API call
    const pricing = $.ajax({
        url: `https://services.last10k.com/v1/company/${quote}/prices`,
        method: "GET",
        dataType: "json",
        data: {
            key:myApp.apiKey
        }
    });

    const valuation = $.ajax({
        url: `https://services.last10k.com/v1/company/${quote}/quote`,
        method: "GET",
        dataType: "json",
        data: {
            key:myApp.apiKey
        }
    });

    $.when(pricing, valuation)
        .then((...args) => {
            const data = args
                .map(value => value[0]);
            myApp.displayData(data,)
        });
}

myApp.displayData = function(data) {
    const priceData = data[0];
    const valuationData = data[1];
    const stockName = valuationData.Name;
    const pe = valuationData.PeRatio;   
    const titleArray = ["Date", "Stock Price"];
    const dataArray = [];
    const regex = new RegExp("T00:00:00", "gi");

    // //trim key name and push to an array
    for(let key in priceData) {
        const newKey = key.replace(regex, "");
        dataArray.push([newKey, priceData[key]]);
    }

    //reverse the order of the array and add the titles to the front
    dataArray
        .reverse()
        .unshift(titleArray);

    const rawData = google.visualization.arrayToDataTable(dataArray);

    const displayOptions = {
        title: `${stockName}'s Historical Stock Price`,
        curveType: 'function',
        legend: { position: 'none' },
        hAxis: {title: "Date"},
        vAxis: {title: "Price (US$)"},
        backgroundColor: "#50bfbf"
    }

    const chart = new google.visualization.LineChart(myApp.display);

    chart.draw(rawData, displayOptions);

    //display valuation and stock information below graph
    const {Symbol: ticker, MarketCapitalization, PeRatio, StockExchange, AverageDailyVolume, BookValue, YearlyHigh, YearlyLow} = valuationData;
    const convertVolume = AverageDailyVolume
        .toString()
        .replace(/(\d)(?=(\d\d\d)+(?!\d))/g, "$1,");
    
    const exchange = document.createElement("li");
    exchange.textContent = `Stock Exchange: ${StockExchange}`;
    myApp.metrics.append(exchange);

    const stockTicker = document.createElement("li");
    stockTicker.textContent = `Ticker: ${ticker}`;
    myApp.metrics.append(stockTicker);

    const retrievePrice = dataArray[dataArray.length-1][1];
    const stockPrice = document.createElement("li");
    stockPrice.textContent = `Current Price: $${retrievePrice.toFixed(2)}`;
    myApp.metrics.append(stockPrice);

    const priceYearHigh = document.createElement("li");
    priceYearHigh.textContent = `52 Week High: $${YearlyHigh.toFixed(2)}`;
    myApp.metrics.append(priceYearHigh);

    const priceYearLow = document.createElement("li");
    priceYearLow.textContent = `52 Week Low: $${YearlyLow.toFixed(2)}`;
    myApp.metrics.append(priceYearLow);

    const mCap = document.createElement("li");
    mCap.textContent = `Market Capitalization: $${MarketCapitalization}`;
    myApp.metrics.append(mCap);

    const avgVolume = document.createElement("li");
    avgVolume.textContent = `Average Daily Volume: ${convertVolume} shares`;
    myApp.metrics.append(avgVolume);

    const priceToEearnings = document.createElement("li");
    priceToEearnings.textContent = `P/E Ratio: ${PeRatio ? PeRatio : "N/A"} x`;
    myApp.metrics.append(priceToEearnings);

    const priceToBook = document.createElement("li");
    const pbvNumber = retrievePrice / BookValue;
    priceToBook.textContent = `P/BV Ratio: ${pbvNumber ? pbvNumber.toFixed(2) : "N/A"} x`;
    myApp.metrics.append(priceToBook);

    const valueDecision = document.createElement("h2");

    if(!PeRatio || !pbvNumber) {
        valueDecision.textContent = `At least one of the metrics does not make sense, so attractiveness is inconclusive`;
    }
    else if(PeRatio <= 15 && pbvNumber < 2) {
        valueDecision.textContent = `Based on the P/E ratio and P/BV ratio, the stock appears to be cheap on a value basis`;
    }
    else {
        valueDecision.textContent = `The stock does not appear to be attractive on a value basis`;
    }
    myApp.metrics.append(valueDecision);
} 

//all functions begin with handleInputs
myApp.init = function () {
    myApp.handleInputs();
}

//on document load, run the init function
$(function () {
    myApp.init();
})

//when form is submitted, run the handleInputs function
myApp.form.addEventListener("submit", myApp.handleInputs);