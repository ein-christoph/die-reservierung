document.getElementById("jsversion").innerHTML = "1.1.0a";
const _cardtypes = 5;

function UIerror(text, uiout = "") {
  if (uiout == "") uiout = text;
  console.error(text);
  document.getElementById("inserrors").innerHTML += uiout + "<br />";
  document.getElementById("errors").style.display = "block";
}

function UIwarning(text, uiout = "") {
  if (uiout == "") uiout = text;
  console.warn(text);
  document.getElementById("inswarnings").innerHTML += uiout + "<br />";
  document.getElementById("warnings").style.display = "block";
}

function clearErrorWarn() {
  document.getElementById("errors").style.display = "none";
  document.getElementById("inserrors").innerHTML = "";
  document.getElementById("warnings").style.display = "none";
  document.getElementById("inswarnings").innerHTML = "";
}

function replaceAll(str, find, replace) {
  return str.replace(new RegExp(find, 'g'), replace);
}

function loadCSV() {
  try {
    clearErrorWarn();
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = '.csv';

    input.onchange = e => {
      handlefile(e.target.files[0])
    };

    input.click();
  } catch (error) {
    UIerror(error, "Es ist ein unerwarteter Fehler beim öffnen der Datei aufgetreten. Bitte kontaktieren Sie den Entwickler.");
  }
}

function handlefile(filehandle) {
  const file = filehandle;
  const reader = new FileReader();

  reader.onload = event => {
    const contents = event.target.result;
    parseCSV(contents);
    document.getElementById("begin").style.display = "none";
    document.getElementById("edit").style.display = "block";
    document.getElementById("info").innerHTML = "Stand " + formatDateString("");
    document.getElementById("fileopen").classList.remove("btn-primary");
    document.getElementById("fileopen").classList.add("btn-default");
    document.getElementById("print").style.display = "inline-block";
    document.getElementById("showtype").style.display = "inline-block";
  };

  reader.readAsText(file);
}

function parseCSV(csvContent) {
const lines = csvContent.split('"\n'); //split on evry ending "\n

  //Erste Zeile finden... die CSV ist manchmal sehr doof formatiert
  let headline = -1;
  for (let i = 0; i < lines.length; i++) {
    if (!lines[i].includes("Buchungsdatum") || !lines[i].includes("ID")) continue;
    else {
      headline = i
      break;
    };
  }

  if (headline < 0) {
    UIerror("Fehler beim Lesen der Datei! (Start nicht gefunden)");
  }

  try {
    //remove leading "
    lines[headline] = lines[headline].substring(1);
    const headers = lines[headline].split('";"');
    const lastNameIndex = headers.indexOf('Nachname');
    const firstNameIndex = headers.indexOf('Vorname');
    const placesIndex = headers.indexOf('Plätze');
    const statusIndex = headers.indexOf('Status');
    const bookingDateIndex = headers.indexOf('Buchungsdatum');
    const commentaryIndex = headers.indexOf('Kommentar');

    const bookings = [];
    const waitingList = [];

    for (let i = headline + 1; i < lines.length; i++) {
      if (lines[i] == "") continue;
      lines[i] = lines[i].substring(1);
      const values = lines[i].split('";"');

      //offensichtliche Fehler prüfen
      //Kommentar kann leer sein
      if(   typeof values[lastNameIndex] == 'undefined' || values[lastNameIndex] == ""
         || typeof values[firstNameIndex] == 'undefined' || values[firstNameIndex] == ""
         || typeof values[placesIndex] == 'undefined' || values[placesIndex] == ""
         || typeof values[bookingDateIndex] == 'undefined' || values[bookingDateIndex] == ""
         || typeof values[commentaryIndex] == 'undefined'
         || typeof values[statusIndex] == 'undefined'){
          UIwarning("Emptyness error hit at i="+i, "Die geöffnete Datei enthält eine unerwartete Formatierung [1]. Bitte überprüfen Sie die Tabele auf Fehler und melden Sie dieses Verhalten dem Entwickler.")
         }

      if (typeof values[statusIndex] !== 'undefined' && values[statusIndex] == 'Auf der Warteliste') {
        waitingList.push({
          lastName: values[lastNameIndex],
          firstName: values[firstNameIndex],
          bookingDate: formatDateString(values[bookingDateIndex]),
          places: values[placesIndex],
          commentary: values[commentaryIndex]
        });
      } else {
        bookings.push({
          lastName: values[lastNameIndex],
          firstName: values[firstNameIndex],
          places: values[placesIndex],
          commentary: values[commentaryIndex]
        });
      }
    }

    displayBookings(bookings);
    displayWaitingList(waitingList);
  } catch (error) {
    UIerror(error, "Die geöffnete Datei enthält eine unerwartete Formatierung [0]. Bitte überprüfen Sie die Tabele auf Fehler und melden Sie dieses Verhalten dem Entwickler.")
  }
}

function cardcountrow(columncount, cardcountcell, cardcount, table){
  const row = document.createElement('tr');
  row.classList.add("cardcountrow");
  for(let i = 0; i < columncount; i++){
    const Cell = document.createElement('td');
    if(i == cardcountcell - 1){
      Cell.innerHTML = cardcount;
      Cell.classList.add("pl");
    }
    if(i >= cardcountcell && i <= cardcountcell + _cardtypes){
      Cell.classList.add("type");
    }
    row.appendChild(Cell);
  }
  table.appendChild(row);
}

function displayBookings(bookings) {
  const bookingDataElement = document.getElementById('bookingData');
  bookingDataElement.innerHTML = '';

  bookings.sort((a, b) => a.lastName.localeCompare(b.lastName));

  let cardcount = 0;

  for (const booking of bookings) {
    const row = document.createElement('tr');

    const lastNameCell = document.createElement('td');
    lastNameCell.textContent = booking.lastName;
    row.appendChild(lastNameCell);

    const firstNameCell = document.createElement('td');
    firstNameCell.textContent = booking.firstName;
    row.appendChild(firstNameCell);

    const placesCell = document.createElement('td');
    placesCell.textContent = booking.places;
    placesCell.classList.add("pl");
    row.appendChild(placesCell);
    cardcount += Number(booking.places);

    for(let i = 0; i < _cardtypes; i++){
      const placesCell = document.createElement('td');
      placesCell.classList.add("type");
      row.appendChild(placesCell);
    }

    const commentaryCell = document.createElement('td');
    commentaryCell.textContent = booking.commentary;
    commentaryCell.classList.add("komm");
    row.appendChild(commentaryCell);

    bookingDataElement.appendChild(row);
  }

  cardcountrow(9, 3, cardcount, bookingDataElement);
}

function displayWaitingList(waitingList) {

  if (waitingList.length <= 0) {
    setdisplay(".waiting", "none");
    return;
  }

  setdisplay(".waiting", "block");


  const waitingListDataElement = document.getElementById('waitingListData');
  waitingListDataElement.innerHTML = '';

  waitingList.sort((a, b) => a.bookingDate.localeCompare(b.bookingDate));

  let i = 1;
  let cardcount = 0;

  for (const entry of waitingList) {
    const row = document.createElement('tr');

    const indexCell = document.createElement('td');
    indexCell.textContent = i;
    row.appendChild(indexCell);

    const bookingDateCell = document.createElement('td');
    bookingDateCell.textContent = entry.bookingDate;
    row.appendChild(bookingDateCell);

    const lastNameCell = document.createElement('td');
    lastNameCell.textContent = entry.lastName;
    row.appendChild(lastNameCell);

    const firstNameCell = document.createElement('td');
    firstNameCell.textContent = entry.firstName;
    row.appendChild(firstNameCell);

    const placesCell = document.createElement('td');
    placesCell.textContent = entry.places;
    placesCell.classList.add("pl");
    row.appendChild(placesCell);
    cardcount += Number(entry.places);

    for(let i = 0; i < _cardtypes; i++){
      const placesCell = document.createElement('td');
      placesCell.classList.add("type");
      row.appendChild(placesCell);
    }

    const commentaryCell = document.createElement('td');
    commentaryCell.textContent = entry.commentary;
    commentaryCell.classList.add("komm");
    row.appendChild(commentaryCell);

    waitingListDataElement.appendChild(row);

    i++;
  }
  cardcountrow(11, 5, cardcount, waitingListDataElement);
}


function formatDateString(inputString) {
  if (inputString == "")
    var date = new Date();
  else
    var date = new Date(inputString);

  function addLeadingZero(number) {
    return number < 10 ? "0" + number : number;
  }

  var formattedDate =
    addLeadingZero(date.getDate()) +
    "." +
    addLeadingZero(date.getMonth() + 1) +
    "." +
    date.getFullYear().toString().slice(-2) +
    " " +
    addLeadingZero(date.getHours()) +
    ":" +
    addLeadingZero(date.getMinutes());

  return formattedDate;
}

function setdisplay(classname, display) {
  var elements = document.querySelectorAll(classname);

  for (var i = 0; i < elements.length; i++) {
    elements[i].style.display = display;
  }
}

function doprint() {
  window.print();
}

function switchtypecolumn(elem){
  if(elem.checked){
    document.getElementById("waitingListTable").classList.add("showtypes");
    document.getElementById("bookingTable").classList.add("showtypes");
  }else{
    document.getElementById("waitingListTable").classList.remove("showtypes");
    document.getElementById("bookingTable").classList.remove("showtypes");
  }
}


//===PWA Stuff====

//enable serviceworker
if ("serviceWorker" in navigator) {
  window.addEventListener("load", function () {
    navigator.serviceWorker.register("./sw.js").then(
      function (registration) {
        console.log("Service Worker registration successful with scope: ", registration.scope);
      },
      function (err) {
        console.log("Service Worker registration failed: ", err);
      }
    );
  });
}

if ('launchQueue' in window) {
  console.log('File Handling API is supported!');
  launchQueue.setConsumer(launchParams => {
    handleFiles(launchParams.files);
  });
}

async function handleFiles(files) {
  for (const file of files) {
    handlefile(await file.getFile());
  }
}
