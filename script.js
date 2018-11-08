//namespacing, by placing entire app in an object
const myApp = {};

//loading google chart library
google.charts.load('current', { 'packages': ['corechart'] });

myApp.apiKey = "73dd81a240fd490f9bf17b5bf8c2c369";
myApp.form = document.querySelector("form");
myApp.quote = document.querySelector(".stock");
myApp.display = document.querySelector(".display");

myApp.handleInputs = function(e) {
    //stops form from refreshing
    e.preventDefault();
    const stockQuote = myApp.quote.value;
    myApp.handleData(stockQuote);

    //clears text entry in form
    this.reset();
}

myApp.handleData = function(quote) {
    //API call
    $.ajax({
        url: `https://services.last10k.com/v1/company/${quote}/prices`,
        method: "GET",
        dataType: "json",
        data: {
            key:myApp.apiKey
        }
    }).then(res => {
        myApp.displayData(res, quote);
    })
}

myApp.displayData = function(data, quote) {
    const initialData = data;
    console.log(initialData);
    const titleArray = ["Date", "Stock Price"];
    const dataArray = [];
    const regex = new RegExp("T00:00:00", "gi");

    //trim key name and push to an array
    for(let key in initialData) {
        const newKey = key.replace(regex, "");
        dataArray.push([newKey, initialData[key]]);
    }

    //reverse the order of the array and add the titles to the front
    dataArray
        .reverse()
        .unshift(titleArray);

    const rawData = google.visualization.arrayToDataTable(dataArray);

    const displayOptions = {
        title: `${quote}'s Historical Stock Price`,
        curveType: 'function',
        legend: { position: 'bottom' }
    }

    const chart = new google.visualization.LineChart(myApp.display);

    chart.draw(rawData, displayOptions);
} 

//when form is submitted, run the handleInputs function
myApp.form.addEventListener("submit", myApp.handleInputs);