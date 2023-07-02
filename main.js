function error(text){
  console.error(text);
}

function replaceAll(str, find, replace) {
  return str.replace(new RegExp(find, 'g'), replace);
}

function loadCSV() {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = '.csv';
    
    input.onchange = e => {
      const file = e.target.files[0];
      const reader = new FileReader();
      
      reader.onload = event => {
        const contents = event.target.result;
        parseCSV(contents);
        document.getElementById("begin").style.display = "none";
        document.getElementById("edit").style.display = "block";
        document.getElementById("info").innerHTML = "Stand "+formatDateString("");
        document.getElementById("fileopen").classList.remove("btn-primary");
        document.getElementById("fileopen").classList.add("btn-default");
        document.getElementById("print").style.display = "inline-block";
      };
      
      reader.readAsText(file);
    };
    
    input.click();
  }
  
  function parseCSV(csvContent) {
    csvContent = replaceAll(csvContent, '\"', "")
    const lines = csvContent.split('\n');

    //Erste Zeile finden... die CSV ist manchmal sehr doof formatiert
    let headline = -1;
    for (let i = 0; i < lines.length; i++){
      if(!lines[i].includes("Buchungsdatum") || !lines[i].includes("ID")) continue;
      else{ 
        headline = i
        break;
      };
    }
    
    if(headline < 0){
      error("Fehler beim Lesen der Datei! (Start nicht gefunden)");
    }

    const headers = lines[headline].split(';');
    
    const lastNameIndex = headers.indexOf('Nachname');
    const firstNameIndex = headers.indexOf('Vorname');
    const placesIndex = headers.indexOf('Plätze');
    const bookingDateIndex = headers.indexOf('Buchungsdatum');
    const commentaryIndex = headers.indexOf('Teilnehmerzahl');
    
    const bookings = [];
    const waitingList = [];
    
    for (let i = headline+1; i < lines.length; i++) {
      if(lines[i] == "") continue;
      const values = lines[i].split(';');
    
      if (values[placesIndex].endsWith('(Warteliste)')) {
        waitingList.push({
          lastName: values[lastNameIndex],
          firstName: values[firstNameIndex],
          bookingDate: formatDateString(values[bookingDateIndex]),
          places: values[placesIndex].replace("(Warteliste)", ""),
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
  }
  
  function displayBookings(bookings) {
    const bookingDataElement = document.getElementById('bookingData');
    bookingDataElement.innerHTML = '';
    
    bookings.sort((a, b) => a.lastName.localeCompare(b.lastName));
    
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

      const commentaryCell = document.createElement('td');
      commentaryCell.textContent = booking.commentary;
      row.appendChild(commentaryCell);
      
      bookingDataElement.appendChild(row);
    }
  }
  
  function displayWaitingList(waitingList) {

    if(waitingList.length <= 0){
      setdisplay(".waiting", "none");
      return;
    }

    setdisplay(".waiting", "block");
    

    const waitingListDataElement = document.getElementById('waitingListData');
    waitingListDataElement.innerHTML = '';
    
    waitingList.sort((a, b) => a.bookingDate.localeCompare(b.bookingDate));

    let i = 1;

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

      const commentaryCell = document.createElement('td');
      commentaryCell.textContent = entry.commentary;
      row.appendChild(commentaryCell);
      
      waitingListDataElement.appendChild(row);

      i++;
    }
  }
  

  function formatDateString(inputString) {
    if(inputString == "")
      var date = new Date();
    else
      var date = new Date(inputString);
  
    function addLeadingZero(number) {
      return number < 10 ? "0" + number : number;
    }
  
    var formattedDate =
      addLeadingZero(date.getDate()) +
      "." +
      addLeadingZero(date.getMonth() + 1)+
      "." +
      date.getFullYear().toString().slice(-2)+
      " " +
      addLeadingZero(date.getHours()) +
      ":" +
      addLeadingZero(date.getMinutes());
  
    return formattedDate;
  }

  function setdisplay(classname, display){
    var elements = document.querySelectorAll(classname);

      for (var i = 0; i < elements.length; i++) {
        elements[i].style.display = display;
      }
  }

  function doprint(){
    window.print();
  }

  //enable serviceworker
  if("serviceWorker" in navigator) {
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