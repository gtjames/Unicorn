var wardMap = {};
let map;

let cbAll    = document.querySelector("#All");
let cbEQ     = document.querySelector("#EQ");
let cbRS     = document.querySelector("#RS");
let cbActive = document.querySelector("#Active");
let cbNew    = document.querySelector("#New");
let cbRide   = document.querySelector("#Ride");
let cbDrive  = document.querySelector("#Drive");
let cbConvert= document.querySelector("#Convert");
let cbEndowed= document.querySelector("#Endowed");
let cbNotEndowed= document.querySelector("#NotEndowed");
let cbRM     = document.querySelector("#RM");
let cbSealed = document.querySelector("#Sealed");
let cbBro    = document.querySelector("#Bro");
let cbSis    = document.querySelector("#Sis");
let cbNotBro = document.querySelector("#NotBro");
let cbNotSis = document.querySelector("#NotSis");

let txtName  = document.querySelector("#Name");
let txtStreet= document.querySelector("#Street");
let txtZip   = document.querySelector("#Zip");
let txtCity  = document.querySelector("#City");
let txtAge   = document.querySelector("#Age");
let txtPrsthd= document.querySelector("#Priesthood");
let txtRec   = document.querySelector("#Recommend");

document.getElementById('request').addEventListener('click', handleRequestClick);
document.getElementById('plot'   ).addEventListener('click', handelPlotRequest);
document.getElementById('remove' ).addEventListener('click', handleRemoveRequest);

window.navigator.geolocation.getCurrentPosition(setLocation);

//  put the map behind the updates list
document.getElementById("map").style.zIndex = "10";

function setLocation(loc) {
    map = L.map('map').setView([loc.coords.latitude, loc.coords.longitude], 13);
    L.tileLayer('https://tile.openstreetmap.org/{z}/{x}/{y}.png', {
        maxZoom: 19,
        attribution: '© OpenStreetMap'
    }).addTo(map);

    wardMap.center = {longitude: loc.coords.longitude, latitude: loc.coords.latitude};
    let b = map.getBounds();
    wardMap.extent = {  minLng: b._northEast.lng, minLat: b._northEast.lat, 
                        maxLng: b._southWest.lng, maxLat: b._southWest.lat };

    clickMarker  = L.marker([loc.coords.latitude, loc.coords.longitude]).addTo(map);
    var myIcon = L.icon({
        iconUrl: 'images/unicorn-icon.png',
        iconSize: [25, 25],
        iconAnchor: [22, 24],
        shadowSize: [25, 25],
        shadowAnchor: [22, 24]
    });
    unicorn = L.marker([loc.coords.latitude, loc.coords.longitude], {icon: myIcon}).addTo(map);

    map.on('click', onMapClick);
}

// var LeafIcon = L.Icon.extend({
//     options: {
//         shadowUrl: 'images/dot-shadow.png',
//         iconSize:     [38, 95],
//         shadowSize:   [50, 64],
//         iconAnchor:   [22, 94],
//         shadowAnchor: [4, 62],
//         popupAnchor:  [-3, -76]
//     }
// });

// var greenIcon = new LeafIcon({iconUrl: 'images/dot-green.png'}),
//     redIcon = new LeafIcon({iconUrl: 'images/dot-red.png'}),
//     orangeIcon = new LeafIcon({iconUrl: 'images/dot-orange.png'});


function onMapClick(e) {            //  TODO move to esri.js
    wardMap.selectedPoint = {longitude: e.latlng.lng, latitude: e.latlng.lat};
    if (clickMarker)       clickMarker.remove();
    clickMarker  = L.marker([e.latlng.lat, e.latlng.lng]).addTo(map);
}

    //  handleRequestClick
    //      get current request location and POST request to server
    function handleRequestClick(event) {
        event.preventDefault();
        everybody.forEach(e => getLongLat(e.address1+', '+e.city +' '+e.state))
    }

    function getLongLat(adrs) {
        const url = `https://google-maps-geocoding.p.rapidapi.com/geocode/json?address=${adrs}&language=en`;
        const options = {
            method: 'GET',
            headers: {
                'X-RapidAPI-Key': '498ed225bamshcd02cf5559e10edp179d21jsn59b140b93ec5',
                'X-RapidAPI-Host': 'google-maps-geocoding.p.rapidapi.com'
            }
        };
        fetch(url, options)
            .then(resp => resp.json())          //  wait for the response and convert it to JSON
            .then(address => {
                console.log(adrs + ' ' + address[0].geometry.location.lat + ' ' + address[0].geometry.location.lng);
                addresses.push(address[0].geometry.location);
                L.marker([address[0].geometry.location.lat, address[0].geometry.location.lng]).addTo(map);        
            });
    }    
    
    //  plot Addresses
    //      get current request location and POST request to server
    function handelPlotRequest(event) {
        event.preventDefault();
        let results = [];

        if (cbAll.checked)      results = everybody;
        if (cbEQ.checked)       results = merge(results, everybody.filter(r => r.gender === 'M'));
        if (cbRS.checked)       results = merge(results, everybody.filter(r => r.gender === 'F'));
        if (cbActive.checked)   results = merge(results, everybody.filter(r => r.Status === 'Active'));
        if (cbEndowed.checked)  results = merge(results, everybody.filter(r => r.endowed === "Yes"));
        if (cbNotEndowed.checked)results= merge(results, everybody.filter(r => r.endowed === "No"));
        if (cbConvert.checked)  results = merge(results, everybody.filter(r => r.convert === "Yes"));
        if (cbRM.checked)       results = merge(results, everybody.filter(r => r.RM      === "Yes"));
        if (cbSealed.checked)   results = merge(results, everybody.filter(r => r.sealed  === "Yes"));
        if (cbBro.checked)      results = merge(results, everybody.filter(r => r.minBrothers === "Yes"));
        if (cbSis.checked)      results = merge(results, everybody.filter(r => r.minSisters  === "Yes"));
        if (cbNotBro.checked)   results = merge(results, everybody.filter(r => r.minBrothers === "No"));
        if (cbNotSis.checked)   results = merge(results, everybody.filter(r => r.minSisters  === "No"));
        
        // if (cbNew.checked)
        // if (cbRide.checked)
        // if (cbDrive.checked)
        if (txtName.value.length   >0 ) results = merge(results, everybody.filter(r => r.name.toLowerCase().indexOf(txtName.value.toLowerCase()) >= 0));
        if (txtStreet.value.length >0 ) results = merge(results, everybody.filter(r => r.address1.toLowerCase().indexOf(txtStreet.value.toLowerCase()) >= 0));
        if (txtZip.value.length    >0 ) results = merge(results, everybody.filter(r => r.zip.indexOf(txtZip.value) >= 0));
        if (txtCity.value.length   >0 ) results = merge(results, everybody.filter(r => r.city.toLowerCase().indexOf(txtCity.value.toLowerCase()) >= 0));
        if (txtPrsthd.value.length >0 ) results = merge(results, everybody.filter(r => r.priesthood.toLowerCase().indexOf(txtPrsthd.value.toLowerCase()) >= 0));
        if (txtRec.value.length    >0 ) results = merge(results, everybody.filter(r => r.recStatus.toLowerCase().indexOf(txtRec.value.toLowerCase()) >= 0));
        
        if (txtAge.value.length    >0 ) {
            let age = txtAge.value;
            let number   = +age.substring(   age.search(/\d/));
            let operator =  age.substring(0, age.search(/\d/));
            switch (operator) {
                case    "<"   : results = merge(results, everybody.filter(r => +r.age <  number));  break;
                case    "<="  : results = merge(results, everybody.filter(r => +r.age <= number));  break;
                case    "="   : results = merge(results, everybody.filter(r => +r.age == number));  break;
                case    "=="  : results = merge(results, everybody.filter(r => +r.age == number));  break;
                case    ">="  : results = merge(results, everybody.filter(r => +r.age >= number));  break;
                case    ">"   : results = merge(results, everybody.filter(r => +r.age >  number));  break;
            }
        }
        clearUpdate();
        results.forEach(e => plotAddress(e))
        document.getElementById("count").innerText = results.length;
    }
    const merge = (a, b, predicate = (a, b) => a === b) => {
        const c = [...a]; // copy to avoid side effects
        // add all items from B to copy C if they're not already present
        b.forEach((bItem) => (c.some((cItem) => predicate(bItem, cItem)) ? null : c.push(bItem)))
        return c;
    }

let addresses = [];

function handleRemoveRequest() {
    clearUpdate();
    wardMembers.forEach(e => e.remove())
    wardMembers = [];
}
//  these functions below here are my utility functions
//      to present messages to users
//      and to particularly add some 'sizzle' to the application

//  displayUpdate
//      nice utility method to show message to user
function displayUpdate(text) {
    $('#updates').append($(`<li>${text}</li>`));
}
function clearUpdate() {
    $('#updates').empty();
}

let wardMembers = [];
function plotAddress(who) {
    var myIcon = L.icon({ iconUrl: 'images/red.jpg', iconSize: [10, 10] });

    let marker = L.marker([who.lat, who.long], {icon: myIcon}).addTo(map);      //  , {icon: dot}
    wardMembers.push(marker);

    marker.bindPopup(`${who.name}<p>Adrs: ${who.address1}<p>Age: ${who.age}<p>Zip: ${who.zip}`).openPopup();
    let cblist = document.querySelector("#list");
    if (cblist.checked)         displayUpdate(`${who.name}`);
    // var popup = L.popup();
    // popup
    //     .setLatLng({lat:lat, lng:long})
    //     .setContent(who)
    //     .openOn(map);
}

function talkToMe(text) {
    let speech = new SpeechSynthesisUtterance();
    speech.lang = "en-US";
    speech.text = text;
    speech.volume = speech.rate = speech.pitch = 1;
    window.speechSynthesis.speak(speech);
}

let everybody = [
    {name:'Abdelhi, Marvin E.',gender:'M',age:'22',address1:'2355 N State Highway 360',address2:'Apt 417',state:'Texas',city:'Grand Prairie',
    zip:'75050-8713',email:'',phone:'214-604-0775',lat:32.5900842,long:-97.0773282,Status:'',convert:'Yes',endowed:'No',RM:'No',sealed:'No',
    movedIn:'44538',institute:'No',priesthood:'Unordained',recExpireDate:'',minBrothers:'No',minSisters:'No',recStatus:''},
    {name:'Aguillon, Allen',gender:'M',age:'22',address1:'2501 Laredo Ct',address2:'',state:'Texas',city:'Arlington',zip:'76015-1310',email:'',phone:'',lat:32.7046809,long:-97.1335175,Status:'Active',convert:'No',endowed:'No',RM:'No',sealed:'Yes',movedIn:'43716',institute:'No',priesthood:'Priest',recExpireDate:'43952',minBrothers:'Yes',minSisters:'No',recStatus:'Expired'},
    {name:'Aguillon, Mitchell',gender:'M',age:'22',address1:'2501 Laredo Ct',address2:'',state:'Texas',city:'Arlington',zip:'76015-1310',email:'Mitchell.aguillon@gmail.com',phone:'',lat:32.7046809,long:-97.1335175,Status:'Active',convert:'No',endowed:'Yes',RM:'Yes',sealed:'Yes',movedIn:'44800',institute:'No',priesthood:'Elder',recExpireDate:'44958',minBrothers:'Yes',minSisters:'No',recStatus:'Expired'},
    {name:'Aguillon, Steve',gender:'M',age:'26',address1:'2501 Laredo Ct.',address2:'',state:'Texas',city:'Arlington',zip:'76015',email:'Stevieaguillon@yahoo.com',phone:'817-449-4745',lat:32.7046809,long:-97.1335175,Status:'RM',convert:'No',endowed:'Yes',RM:'Yes',sealed:'Yes',movedIn:'43110',institute:'No',priesthood:'Elder',recExpireDate:'43497',minBrothers:'Yes',minSisters:'No',recStatus:'Expired'},
    {name:'Aguirre, Hailey',gender:'F',age:'25',address1:'214 Hosack St',address2:'',state:'Texas',city:'Arlington',zip:'76010-2713',email:'',phone:'701-651-8508',lat:32.7262564,long:-97.1035765,Status:'',convert:'No',endowed:'No',RM:'No',sealed:'Yes',movedIn:'43226',institute:'No',priesthood:'',recExpireDate:'',minBrothers:'No',minSisters:'No',recStatus:''},
    {name:'Alfaro, Daniel Andrew',gender:'M',age:'26',address1:'7329 Falmouth Dr',address2:'',state:'Texas',city:'Forest Hill',zip:'76140-2055',email:'',phone:'',lat:32.650656,long:-97.2676671,Status:'',convert:'Yes',endowed:'No',RM:'No',sealed:'No',movedIn:'43321',institute:'No',priesthood:'Deacon',recExpireDate:'',minBrothers:'No',minSisters:'No',recStatus:''},
    {name:'Alfaro, Natalie Danielle',gender:'F',age:'20',address1:'6620 Spartan Dr',address2:'',state:'Texas',city:'Arlington',zip:'76001-7638',email:'nataliedc2002@gmail.com',phone:'682-228-7401',lat:32.6369421,long:-97.1778685,Status:'Active',convert:'Yes',endowed:'Yes',RM:'No',sealed:'No',movedIn:'45032',institute:'No',priesthood:'',recExpireDate:'45870',minBrothers:'No',minSisters:'Yes',recStatus:'Active'},
    {name:'Almodovar, Bianca Yara',gender:'F',age:'26',address1:'5018 Redwater Dr',address2:'',state:'Texas',city:'Arlington',zip:'76018-2014',email:'',phone:'',lat:32.6639831,long:-97.087741,Status:'',convert:'Yes',endowed:'No',RM:'No',sealed:'No',movedIn:'44941',institute:'No',priesthood:'',recExpireDate:'42856',minBrothers:'No',minSisters:'No',recStatus:'Expired'},
    {name:'Anderson, Charlotte',gender:'F',age:'20',address1:'1001 S Center St',address2:'Apt 1415D',state:'Texas',city:'Arlington',zip:'76010-2774',email:'charlotte.reese.anderson@gmail.com',phone:'817-946-4769',lat:32.7278008,long:-97.1060368,Status:'',convert:'No',endowed:'No',RM:'No',sealed:'Yes',movedIn:'44463',institute:'No',priesthood:'',recExpireDate:'44348',minBrothers:'No',minSisters:'No',recStatus:'Expired'},
    {name:'Anderson, Katie',gender:'F',age:'27',address1:'',address2:'',state:'Texas',city:'',zip:'',email:'',phone:'817-449-3636',lat:32.6700099,long:-97.1232402,Status:'',convert:'No',endowed:'No',RM:'No',sealed:'Yes',movedIn:'43296',institute:'No',priesthood:'',recExpireDate:'',minBrothers:'Yes',minSisters:'No',recStatus:''},
    {name:'Arungwa, Samuel Chikodi',gender:'M',age:'20',address1:'815 W Abram St',address2:'Apt 1127',state:'Texas',city:'Arlington',zip:'76013-6911',email:'samuelaru2@gmail.com',phone:'713-560-2596',lat:32.7363883,long:-97.1172718,Status:'',convert:'No',endowed:'No',RM:'No',sealed:'Yes',movedIn:'44428',institute:'No',priesthood:'Priest',recExpireDate:'44562',minBrothers:'No',minSisters:'No',recStatus:'Expired'},
    {name:'Baclawski, Mark',gender:'M',age:'28',address1:'2906 Vineyard Dr',address2:'',state:'Texas',city:'Arlington',zip:'76015-2027',email:'baclawskimark@gmail.com',phone:'870-273-5476',lat:32.6968744,long:-97.1459919,Status:'Active',convert:'No',endowed:'Yes',RM:'Yes',sealed:'Yes',movedIn:'44215',institute:'No',priesthood:'High Priest',recExpireDate:'45231',minBrothers:'No',minSisters:'No',recStatus:'Active'},
    {name:'Badger, Emily Elizabeth',gender:'F',age:'27',address1:'6400 Willow Springs Dr',address2:'',state:'Texas',city:'Arlington',zip:'76001-5109',email:'emily.badger14@yahoo.com',phone:'817-797-5794',lat:32.6413636,long:-97.1770392999999,Status:'Active',convert:'No',endowed:'No',RM:'No',sealed:'Yes',movedIn:'41826',institute:'No',priesthood:'',recExpireDate:'45108',minBrothers:'Yes',minSisters:'Yes',recStatus:'Expired less than 1 month'},
    {name:'Badger, William David',gender:'M',age:'22',address1:'6400 Willow Springs Dr',address2:'',state:'Texas',city:'Arlington',zip:'76001-5109',email:'williamdbadger@gmail.com',phone:'',lat:32.6413636,long:-97.1770392999999,Status:'Active',convert:'No',endowed:'No',RM:'No',sealed:'Yes',movedIn:'43695',institute:'No',priesthood:'Priest',recExpireDate:'45108',minBrothers:'Yes',minSisters:'No',recStatus:'Expired less than 1 month'},
    {name:'Baird, Matthew Dallin',gender:'M',age:'21',address1:'3804 Indian Springs Trl',address2:'',state:'Texas',city:'Arlington',zip:'76016-3132',email:'thesixthbear@gmail.com',phone:'',lat:32.6894766,long:-97.1683145,Status:'Missionary',convert:'No',endowed:'Yes',RM:'Yes',sealed:'Yes',movedIn:'44563',institute:'No',priesthood:'Elder',recExpireDate:'45536',minBrothers:'Yes',minSisters:'No',recStatus:'Active'},
    {name:'Barnes, Courtney',gender:'F',age:'27',address1:'1800 Fiji Dr',address2:'Apt 125',state:'Texas',city:'Arlington',zip:'76015-3932',email:'',phone:'',lat:32.6851337,long:-97.1371485999999,Status:'',convert:'No',endowed:'No',RM:'No',sealed:'Yes',movedIn:'43552',institute:'No',priesthood:'',recExpireDate:'',minBrothers:'No',minSisters:'No',recStatus:''},
    {name:'Bean, Griffin David',gender:'M',age:'20',address1:'3107 Treyburn Ln',address2:'',state:'Texas',city:'Venus',zip:'76084-1141',email:'Meanbean8180@gmail.com',phone:'314-695-4108',lat:32.5236871,long:-97.0975224,Status:'Known',convert:'Yes',endowed:'No',RM:'No',sealed:'No',movedIn:'44950',institute:'No',priesthood:'Priest',recExpireDate:'44743',minBrothers:'No',minSisters:'No',recStatus:'Expired'},
    {name:'Becerra-Gonzales, Tabitha Raiann',gender:'F',age:'25',address1:'3702 Ridgefield Ct',address2:'',state:'Texas',city:'Mansfield',zip:'76063',email:'',phone:'',lat:32.6104418,long:-97.1304109,Status:'',convert:'Yes',endowed:'No',RM:'No',sealed:'No',movedIn:'44738',institute:'No',priesthood:'',recExpireDate:'',minBrothers:'No',minSisters:'No',recStatus:''},
    {name:'Beck, Catherine',gender:'F',age:'28',address1:'4808 Bonneville Dr',address2:'',state:'Texas',city:'Arlington',zip:'76106',email:'',phone:'817-679-1693',lat:32.6974605,long:-97.1833616999999,Status:'',convert:'No',endowed:'No',RM:'No',sealed:'Yes',movedIn:'44340',institute:'No',priesthood:'',recExpireDate:'',minBrothers:'No',minSisters:'No',recStatus:''},
    {name:'Beus, Dallin Michael',gender:'M',age:'30',address1:'3559 Glen Field Ct',address2:'Apt 257',state:'Texas',city:'Arlington',zip:'76015-3458',email:'dallin.beus@yahoo.com',phone:'509-792-0616',lat:32.6892182,long:-97.1334509,Status:'Active',convert:'No',endowed:'Yes',RM:'Yes',sealed:'Yes',movedIn:'44731',institute:'No',priesthood:'Elder',recExpireDate:'45627',minBrothers:'Yes',minSisters:'No',recStatus:'Active'},
    {name:'Bingham, Miranda',gender:'F',age:'27',address1:'1121 Debbie Ln',address2:'',state:'Texas',city:'Arlington',zip:'76002-5004',email:'mbingham010@gmail.com',phone:'928-965-3156',lat:32.6065673,long:-97.0847302,Status:'Active',convert:'No',endowed:'No',RM:'No',sealed:'Yes',movedIn:'45130',institute:'No',priesthood:'',recExpireDate:'43586',minBrothers:'No',minSisters:'No',recStatus:'Expired'},
    {name:'Boss, Kevin',gender:'M',age:'26',address1:'414 E Lilly Ln',address2:'',state:'Texas',city:'Arlington',zip:'76010-5706',email:'',phone:'',lat:32.7118072,long:-97.1037447,Status:'Known',convert:'Yes',endowed:'No',RM:'No',sealed:'No',movedIn:'45127',institute:'No',priesthood:'Deacon',recExpireDate:'',minBrothers:'No',minSisters:'No',recStatus:''},
    {name:'Carter, Isaiah',gender:'M',age:'23',address1:'1301 Lansdowne Dr',address2:'',state:'Texas',city:'Arlington',zip:'76012-5527',email:'',phone:'817-727-3289',lat:32.7757144,long:-97.1250227,Status:'Known',convert:'Yes',endowed:'No',RM:'No',sealed:'No',movedIn:'45041',institute:'No',priesthood:'Unordained',recExpireDate:'',minBrothers:'No',minSisters:'No',recStatus:''},
    {name:'Clark, Abby Jane',gender:'F',age:'22',address1:'4106 Shady Valley Dr',address2:'',state:'Texas',city:'Arlington',zip:'76013-2935',email:'',phone:'',lat:32.7205921,long:-97.1718286999999,Status:'',convert:'No',endowed:'No',RM:'No',sealed:'Yes',movedIn:'44829',institute:'No',priesthood:'',recExpireDate:'43709',minBrothers:'No',minSisters:'No',recStatus:'Expired'},
    {name:'Cole, Aaron Anthony',gender:'M',age:'26',address1:'2615 River Hills Cir',address2:'Apt 1706',state:'Texas',city:'Arlington',zip:'76006-3906',email:'coleaaronant@gmail.com',phone:'972-537-8858',lat:32.7775874,long:-97.0942524,Status:'',convert:'Yes',endowed:'No',RM:'No',sealed:'No',movedIn:'44115',institute:'No',priesthood:'Priest',recExpireDate:'',minBrothers:'Yes',minSisters:'No',recStatus:''},
    {name:'Collier, Jessi Aleksandra',gender:'F',age:'21',address1:'801 Bastrop Dr',address2:'',state:'Texas',city:'Arlington',zip:'76002-4651',email:'jessi.collier001@gmail.com',phone:'909-516-4328',lat:32.599284,long:-97.0828938,Status:'Active',convert:'No',endowed:'No',RM:'No',sealed:'Yes',movedIn:'44952',institute:'Yes',priesthood:'',recExpireDate:'45170',minBrothers:'No',minSisters:'Yes',recStatus:'Expiring next month'},
    {name:'Craig, Emmalie Amber',gender:'F',age:'26',address1:'4209 Selina Ct',address2:'',state:'Texas',city:'Arlington',zip:'76016-4734',email:'emmacraig57@gmail.com',phone:'940-703-9440',lat:32.6779284,long:-97.1714289,Status:'',convert:'No',endowed:'No',RM:'No',sealed:'Yes',movedIn:'42498',institute:'No',priesthood:'',recExpireDate:'44105',minBrothers:'No',minSisters:'No',recStatus:'Expired'},
    {name:'Craven, Lindley Ann',gender:'F',age:'28',address1:'3540 Morgan Creek Drive',address2:'',state:'Texas',city:'Venus',zip:'76084',email:'',phone:'',lat:32.3790477,long:-97.0339030999999,Status:'',convert:'',endowed:'',RM:'',sealed:'',movedIn:'',institute:'',priesthood:'',recExpireDate:'',minBrothers:'',minSisters:'',recStatus:''},
    {name:'Cuba, Denise Carolina',gender:'F',age:'23',address1:'300 W 1st St',address2:'# 191968',state:'Texas',city:'Arlington',zip:'76019-1000',email:'',phone:'972-578-1637',lat:32.731482,long:-97.1108716999999,Status:'',convert:'Yes',endowed:'No',RM:'No',sealed:'No',movedIn:'43401',institute:'No',priesthood:'',recExpireDate:'43497',minBrothers:'No',minSisters:'No',recStatus:'Expired'},
    {name:'Davila, Daisy Belen',gender:'F',age:'20',address1:'114 Volunteer Dr',address2:'',state:'Texas',city:'Arlington',zip:'76014-3147',email:'dbdavila78@gmail.com',phone:'817-233-1365',lat:32.6879846,long:-97.1048292,Status:'Active',convert:'Yes',endowed:'Yes',RM:'No',sealed:'No',movedIn:'44661',institute:'Yes',priesthood:'',recExpireDate:'45778',minBrothers:'Yes',minSisters:'Yes',recStatus:'Active'},
    {name:'Duff, Danielle',gender:'F',age:'22',address1:'6619 Alvey Dr',address2:'Apt 111',state:'Texas',city:'Arlington',zip:'76017-0803',email:'xieezra@gmail.com',phone:'321-831-5266',lat:32.667681,long:-97.2145254,Status:'Known',convert:'No',endowed:'No',RM:'No',sealed:'Yes',movedIn:'45123',institute:'No',priesthood:'',recExpireDate:'',minBrothers:'No',minSisters:'No',recStatus:''},
    {name:'Duncan, Joshua David',gender:'M',age:'20',address1:'500 E Williamsburg Mnr',address2:'',state:'Texas',city:'Arlington',zip:'76014-1142',email:'duncanj67@yahoo.com',phone:'706-366-3758',lat:32.7008617,long:-97.1047957999999,Status:'Active',convert:'Yes',endowed:'No',RM:'No',sealed:'Yes',movedIn:'45122',institute:'No',priesthood:'Elder',recExpireDate:'43739',minBrothers:'No',minSisters:'No',recStatus:'Expired'},
    {name:'Dunlap, Taelor',gender:'F',age:'25',address1:'1402 Bandera Dr',address2:'',state:'Texas',city:'Arlington',zip:'76018-2029',email:'taetae97lmd@gmail.com',phone:'940-283-4493',lat:32.6603204,long:-97.0872232,Status:'Known',convert:'Yes',endowed:'No',RM:'No',sealed:'No',movedIn:'44910',institute:'No',priesthood:'',recExpireDate:'43678',minBrothers:'No',minSisters:'Yes',recStatus:'Expired'},
    {name:'Easterling, Ciara Dawn',gender:'F',age:'27',address1:'801 Woodrow St',address2:'',state:'Texas',city:'Arlington',zip:'76012-4728',email:'',phone:'',lat:32.7451684,long:-97.1180346,Status:'',convert:'Yes',endowed:'No',RM:'No',sealed:'No',movedIn:'44045',institute:'No',priesthood:'',recExpireDate:'',minBrothers:'No',minSisters:'No',recStatus:''},
    {name:'Eden, Briston',gender:'M',age:'29',address1:'6002 Kelly Elliott Rd',address2:'',state:'Texas',city:'Arlington',zip:'76001-5039',email:'',phone:'435-790-6732',lat:32.6483631,long:-97.1760355999999,Status:'RM',convert:'No',endowed:'Yes',RM:'Yes',sealed:'Yes',movedIn:'43079',institute:'No',priesthood:'Elder',recExpireDate:'43556',minBrothers:'No',minSisters:'No',recStatus:'Expired'},
    {name:'Fiame, Maurice',gender:'M',age:'21',address1:'500 E Williamsburg Mnr',address2:'',state:'Texas',city:'Arlington',zip:'76014-1142',email:'mauricefiame02@gmail.com',phone:'573-407-0404',lat:32.7008617,long:-97.1047957999999,Status:'Active',convert:'Yes',endowed:'No',RM:'No',sealed:'No',movedIn:'45011',institute:'No',priesthood:'Elder',recExpireDate:'45352',minBrothers:'No',minSisters:'No',recStatus:'Active'},
    {name:'Foster, Nichole lynn',gender:'F',age:'31',address1:'2800 Oak Cliff Ln',address2:'',state:'Texas',city:'Arlington',zip:'76012-2857',email:'nicholefoster707@gmail.com',phone:'682-244-7694',lat:32.7467222,long:-97.1541752999999,Status:'Known',convert:'Yes',endowed:'No',RM:'No',sealed:'No',movedIn:'43957',institute:'No',priesthood:'',recExpireDate:'',minBrothers:'Yes',minSisters:'Yes',recStatus:''},
    {name:'Garcia Gonzalez, Kate Alessandra',gender:'F',age:'23',address1:'2020 Ravinia Dr',address2:'',state:'Texas',city:'Arlington',zip:'76012',email:'kateli7474@yahoo.com',phone:'',lat:32.7489483,long:-97.1424581,Status:'',convert:'No',endowed:'No',RM:'No',sealed:'Yes',movedIn:'43341',institute:'No',priesthood:'',recExpireDate:'43221',minBrothers:'No',minSisters:'No',recStatus:'Expired'},
    {name:'Gilson, Amanda',gender:'F',age:'29',address1:'1801 Lynnwood Hills Dr',address2:'',state:'Texas',city:'Fort Worth',zip:'76112-7534',email:'acgilson@msn.com',phone:'469-877-5806',lat:32.7525533,long:-97.2208574,Status:'',convert:'',endowed:'',RM:'',sealed:'',movedIn:'',institute:'',priesthood:'',recExpireDate:'',minBrothers:'',minSisters:'',recStatus:''},
    {name:'Gilstrap, Matthew Daniel',gender:'M',age:'30',address1:'505 E Lamar Blvd',address2:'',state:'Texas',city:'Arlington',zip:'76011-3906',email:'mattgilstrap@yahoo.com',phone:'817-308-9135',lat:32.7627266,long:-97.1073914999999,Status:'Active',convert:'Yes',endowed:'Yes',RM:'Yes',sealed:'No',movedIn:'44332',institute:'No',priesthood:'Elder',recExpireDate:'43556',minBrothers:'Yes',minSisters:'No',recStatus:'Expired'},
    {name:'Glover, Madison',gender:'F',age:'25',address1:'931 Bridges Dr',address2:'',state:'Texas',city:'Arlington',zip:'76012-2048',email:'',phone:'',lat:32.764475,long:-97.117908,Status:'',convert:'Yes',endowed:'No',RM:'No',sealed:'No',movedIn:'43865',institute:'No',priesthood:'',recExpireDate:'',minBrothers:'No',minSisters:'No',recStatus:''},
    {name:'Guzman, Miguel Angel',gender:'M',age:'20',address1:'West Hall',address2:'',state:'Texas',city:'Arlington',zip:'',email:'Miguii062403@gmail.com',phone:'682-561-0348',lat:32.7330496,long:-97.1185098999999,Status:'',convert:'',endowed:'',RM:'',sealed:'',movedIn:'',institute:'',priesthood:'',recExpireDate:'',minBrothers:'',minSisters:'',recStatus:''},
    {name:'Halsted, Roberto',gender:'M',age:'21',address1:'325 S Mesquite St',address2:'Apt 1512D',state:'Texas',city:'Arlington',zip:'76010-1386',email:'roberto.halsted281213@gmail.com',phone:'352-270-4412',lat:32.734164,long:-97.1069828,Status:'',convert:'Yes',endowed:'No',RM:'No',sealed:'No',movedIn:'44571',institute:'No',priesthood:'Deacon',recExpireDate:'',minBrothers:'No',minSisters:'No',recStatus:''},
    {name:'Hansen, Michaela Lynn',gender:'F',age:'23',address1:'1712 Baird Farm Cir',address2:'Apt 2308',state:'Texas',city:'Arlington',zip:'76006-5584',email:'michaela.hansen32@gmail.com',phone:'316-371-7467',lat:32.7690884,long:-97.0844796999999,Status:'Active',convert:'Yes',endowed:'Yes',RM:'No',sealed:'No',movedIn:'45089',institute:'No',priesthood:'',recExpireDate:'45444',minBrothers:'No',minSisters:'No',recStatus:'Active'},
    {name:'Hernandez, Adrian',gender:'M',age:'26',address1:'1726 Sun Glow Dr',address2:'Apt 3223',state:'Texas',city:'Arlington',zip:'76006-2639',email:'Adrianhern1996@gmail.com',phone:'530-605-8596-no msgs',lat:32.7788527,long:-97.0840077,Status:'RM',convert:'Yes',endowed:'Yes',RM:'Yes',sealed:'No',movedIn:'43730',institute:'No',priesthood:'Elder',recExpireDate:'43831',minBrothers:'No',minSisters:'No',recStatus:'Expired'},
    {name:'Hernandez, Jeremy Michael',gender:'M',age:'31',address1:'808 Lovingham Dr',address2:'',state:'Texas',city:'Arlington',zip:'76017-6456',email:'jeremyhernandez261@gmail.com',phone:'817-300-5811',lat:32.6501651,long:-97.1183952999999,Status:'Active',convert:'Yes',endowed:'Yes',RM:'Yes',sealed:'No',movedIn:'41564',institute:'No',priesthood:'Elder',recExpireDate:'45748',minBrothers:'Yes',minSisters:'No',recStatus:'Active'},
    {name:'Hilton, Andrew',gender:'M',age:'28',address1:'1502 Village Cir',address2:'Apt 228',state:'Texas',city:'Arlington',zip:'76012-4025',email:'athilton@att.net',phone:'817-307-8089',lat:32.7569225,long:-97.1484110999999,Status:'Active',convert:'No',endowed:'Yes',RM:'Yes',sealed:'Yes',movedIn:'42687',institute:'Yes',priesthood:'Elder',recExpireDate:'45292',minBrothers:'Yes',minSisters:'No',recStatus:'Active'},
    {name:'Hilton, Jessica',gender:'F',age:'26',address1:'1502 Village Cir',address2:'Apt 327',state:'Texas',city:'Arlington',zip:'76012-4031',email:'jeshilton100@gmail.com',phone:'817-235-8448',lat:32.7569225,long:-97.1484110999999,Status:'Active',convert:'No',endowed:'Yes',RM:'Yes',sealed:'Yes',movedIn:'44329',institute:'No',priesthood:'',recExpireDate:'45170',minBrothers:'Yes',minSisters:'Yes',recStatus:'Expiring next month'},
    {name:'Hofer, Imogen Dauphine',gender:'F',age:'20',address1:'4116 April Dr',address2:'',state:'Texas',city:'Arlington',zip:'76016-3826',email:'imogenhofer@yahoo.com',phone:'682-218-9397',lat:32.6805045,long:-97.1730003,Status:'Active',convert:'No',endowed:'Yes',RM:'No',sealed:'Yes',movedIn:'44514',institute:'No',priesthood:'',recExpireDate:'45352',minBrothers:'Yes',minSisters:'Yes',recStatus:'Active'},
    {name:'Hofer, Lorelai Josephine',gender:'F',age:'18',address1:'4116 April Dr',address2:'',state:'Texas',city:'Arlington',zip:'76016-3826',email:'Lorelaihofer@yahoo.com',phone:'',lat:32.6805045,long:-97.1730003,Status:'',convert:'No',endowed:'No',RM:'No',sealed:'Yes',movedIn:'44645',institute:'No',priesthood:'',recExpireDate:'44105',minBrothers:'No',minSisters:'No',recStatus:'Expired'},
    {name:'Hollon, Courtney Shea',gender:'F',age:'20',address1:'300 W 1st St',address2:'',state:'Texas',city:'Arlington',zip:'76019-1000',email:'',phone:'',lat:32.731482,long:-97.1108716999999,Status:'',convert:'',endowed:'',RM:'',sealed:'',movedIn:'',institute:'',priesthood:'',recExpireDate:'',minBrothers:'',minSisters:'',recStatus:''},
    {name:'Howe, Dominick',gender:'M',age:'28',address1:'603 Causley Ave',address2:'Apt 33',state:'Texas',city:'Arlington',zip:'76010-2552',email:'dhowe10119@gmail.com',phone:'712-350-0579',lat:32.7246172,long:-97.1135207999999,Status:'Active',convert:'Yes',endowed:'No',RM:'No',sealed:'No',movedIn:'44948',institute:'No',priesthood:'Priest',recExpireDate:'45292',minBrothers:'No',minSisters:'No',recStatus:'Active'},
    {name:'Huang, Coco',gender:'F',age:'21',address1:'3912 Country Club Rd',address2:'',state:'Texas',city:'Arlington',zip:'76013-3046',email:'lh977243@gmail.com',phone:'817-705-5950',lat:32.7210315,long:-97.167599,Status:'Active',convert:'Yes',endowed:'No',RM:'No',sealed:'No',movedIn:'44940',institute:'Yes',priesthood:'',recExpireDate:'45292',minBrothers:'No',minSisters:'Yes',recStatus:'Active'},
    {name:'Hughes, Jordan Leigh',gender:'F',age:'23',address1:'1601 E Debbie Ln',address2:'Apt 4108',state:'Texas',city:'Mansfield',zip:'76063-3698',email:'jlhughes99@me.com',phone:'760-855-3563',lat:32.608991,long:-97.1113342,Status:'Known',convert:'No',endowed:'Yes',RM:'No',sealed:'Yes',movedIn:'44945',institute:'No',priesthood:'',recExpireDate:'44317',minBrothers:'No',minSisters:'Yes',recStatus:'Expired'},
    {name:'Hunter, Jlynn Renee',gender:'F',age:'30',address1:'408 N Fielder Rd',address2:'',state:'Texas',city:'Arlington',zip:'76012-3804',email:'',phone:'',lat:32.7387155,long:-97.1323115,Status:'',convert:'No',endowed:'No',RM:'No',sealed:'Yes',movedIn:'44451',institute:'No',priesthood:'',recExpireDate:'',minBrothers:'No',minSisters:'No',recStatus:''},
    {name:'Jacinto, Vanessa Cristina',gender:'F',age:'21',address1:'1814 Clear Summit Ln',address2:'',state:'Texas',city:'arlington',zip:'',email:'Vanessa.jacintoo@gmail.com',phone:'(014) 3418-8572',lat:32.5888317,long:-97.0866767999999,Status:'Active',convert:'Yes',endowed:'No',RM:'No',sealed:'No',movedIn:'45159',institute:'No',priesthood:'',recExpireDate:'45505',minBrothers:'No',minSisters:'No',recStatus:'Active'},
    {name:'James, Gary Thomas',gender:'M',age:'69',address1:'1015 Oak Hill Park',address2:'',state:'Texas',city:'Kennedale',zip:'76060-5620',email:'gtjames@gmail.com',phone:'817-266-3251',lat:32.658777,long:-97.2178881999999,Status:'Active',convert:'Yes',endowed:'Yes',RM:'Yes',sealed:'Yes',movedIn:'44259',institute:'No',priesthood:'High Priest',recExpireDate:'45323',minBrothers:'Yes',minSisters:'No',recStatus:'Active'},
    {name:'James, Tari Marie',gender:'F',age:'69',address1:'1015 Oak Hill Park',address2:'',state:'Texas',city:'Kennedale',zip:'76060-5620',email:'txjamesgang@yahoo.com',phone:'817-561-0417',lat:32.658777,long:-97.2178881999999,Status:'Active',convert:'Yes',endowed:'Yes',RM:'No',sealed:'Yes',movedIn:'44259',institute:'No',priesthood:'',recExpireDate:'45323',minBrothers:'Yes',minSisters:'Yes',recStatus:'Active'},
    {name:'Jimenez, Ismael Jared',gender:'M',age:'25',address1:'1023 Wilshire Blvd',address2:'',state:'Texas',city:'Arlington',zip:'76012-3222',email:'',phone:'',lat:32.7462822,long:-97.1226253999999,Status:'',convert:'No',endowed:'No',RM:'No',sealed:'No',movedIn:'42932',institute:'No',priesthood:'Priest',recExpireDate:'',minBrothers:'Yes',minSisters:'No',recStatus:''},
    {name:'Johnson, Echo Alexandra',gender:'F',age:'27',address1:'2915 Texas Dr',address2:'',state:'Texas',city:'Arlington',zip:'76015-1928',email:'echoajohnson@gmail.com',phone:'817-233-7807',lat:32.6969426,long:-97.1509564999999,Status:'Active',convert:'No',endowed:'Yes',RM:'Yes',sealed:'Yes',movedIn:'43954',institute:'Yes',priesthood:'',recExpireDate:'45474',minBrothers:'Yes',minSisters:'Yes',recStatus:'Active'},
    {name:'King, Ashley',gender:'F',age:'26',address1:'1616 Summit Ridge Hvn',address2:'#502',state:'Texas',city:'Arlington',zip:'',email:'king.ashley1996@gmail.com',phone:'432-210-7334',lat:32.6712965,long:-97.1907439,Status:'Active',convert:'No',endowed:'No',RM:'No',sealed:'Yes',movedIn:'44955',institute:'No',priesthood:'',recExpireDate:'43497',minBrothers:'No',minSisters:'Yes',recStatus:'Expired'},
    {name:'King, Zander Jayden',gender:'M',age:'19',address1:'2718 Sherman St',address2:'Apt 106',state:'Texas',city:'Grand Prairie',zip:'75051-1033',email:'',phone:'',lat:32.7357027,long:-97.0489724999999,Status:'',convert:'Yes',endowed:'No',RM:'No',sealed:'No',movedIn:'44885',institute:'No',priesthood:'Unordained',recExpireDate:'',minBrothers:'No',minSisters:'No',recStatus:''},
    {name:'Kollie, Vivian Ruth',gender:'F',age:'25',address1:'2619 Easom Circle',address2:'',state:'Texas',city:'Arlington',zip:'76006',email:'Viviankollie002@gmail.com',phone:'817-818-6220',lat:32.7785189,long:-97.0957147,Status:'',convert:'Yes',endowed:'No',RM:'No',sealed:'No',movedIn:'44581',institute:'No',priesthood:'',recExpireDate:'44166',minBrothers:'No',minSisters:'No',recStatus:'Expired'},
    {name:'Koonce, Jacob Lane',gender:'M',age:'25',address1:'4222 Rush Springs Dr',address2:'',state:'Texas',city:'Arlington',zip:'76016-4838',email:'',phone:'',lat:32.6780944,long:-97.1612234999999,Status:'',convert:'Yes',endowed:'No',RM:'No',sealed:'No',movedIn:'44544',institute:'No',priesthood:'Priest',recExpireDate:'',minBrothers:'No',minSisters:'No',recStatus:''},
    {name:'Lanning, Lindsay Jo',gender:'F',age:'29',address1:'2010 Walnut Hills Ln',address2:'',state:'Texas',city:'Mansfield',zip:'76063-5032',email:'jojoladybugg@att.net',phone:'817-897-8657',lat:32.6028544,long:-97.1076009,Status:'',convert:'No',endowed:'No',RM:'No',sealed:'Yes',movedIn:'42260',institute:'No',priesthood:'',recExpireDate:'',minBrothers:'Yes',minSisters:'No',recStatus:''},
    {name:'Lebbie, Emmanuella',gender:'F',age:'28',address1:'2119 Ragland Rd',address2:'',state:'Texas',city:'Mansfield',zip:'76063-5343',email:'emmalebbie@gmail.com',phone:'801-512-1492',lat:32.5918471,long:-97.1042068,Status:'Active',convert:'Yes',endowed:'Yes',RM:'No',sealed:'Yes',movedIn:'43471',institute:'No',priesthood:'',recExpireDate:'45078',minBrothers:'No',minSisters:'Yes',recStatus:'Expired less than 3 months'},
    {name:'Little, Isabelle Sariah',gender:'F',age:'24',address1:'509 Jackson Square Dr',address2:'Apt 175',state:'Texas',city:'Arlington',zip:'76010-6307',email:'bellelittle99@gmail.com',phone:'',lat:32.7074148,long:-97.1041862,Status:'',convert:'No',endowed:'No',RM:'No',sealed:'Yes',movedIn:'42983',institute:'No',priesthood:'',recExpireDate:'42856',minBrothers:'No',minSisters:'No',recStatus:'Expired'},
    {name:'Livings, Dee',gender:'M',age:'28',address1:'2609 River Hills Cir',address2:'Apt 1542',state:'Texas',city:'Arlington',zip:'76006-3904',email:'',phone:'337-739-6066',lat:32.7769099,long:-97.0947502,Status:'Active',convert:'Yes',endowed:'No',RM:'No',sealed:'No',movedIn:'44512',institute:'No',priesthood:'Priest',recExpireDate:'44866',minBrothers:'No',minSisters:'No',recStatus:'Expired'},
    {name:'Livingston, Johnathan',gender:'M',age:'28',address1:'511 S Bowen Rd',address2:'',state:'Texas',city:'Arlington',zip:'76013-1252',email:'livingstonj557@gmail.com',phone:'706-559-8184',lat:32.7311386,long:-97.148916,Status:'Active',convert:'Yes',endowed:'No',RM:'No',sealed:'No',movedIn:'44905',institute:'Yes',priesthood:'Priest',recExpireDate:'45261',minBrothers:'Yes',minSisters:'No',recStatus:'Active'},
    {name:'Macones, Melissa',gender:'F',age:'22',address1:'822 Woodland Ct',address2:'',state:'Texas',city:'Kennedale',zip:'76060-5464',email:'mmacones24@gmail.com',phone:'510-833-1808',lat:32.650973,long:-97.2096809,Status:'Active',convert:'Yes',endowed:'No',RM:'No',sealed:'No',movedIn:'44955',institute:'No',priesthood:'',recExpireDate:'45292',minBrothers:'No',minSisters:'Yes',recStatus:'Active'},
    {name:'Malicoat, Cianna Annette',gender:'F',age:'24',address1:'1020 Poe Ln',address2:'',state:'Texas',city:'Mansfield',zip:'76063-4875',email:'',phone:'',lat:32.6085819,long:-97.1483269,Status:'',convert:'Yes',endowed:'No',RM:'No',sealed:'No',movedIn:'44723',institute:'No',priesthood:'',recExpireDate:'',minBrothers:'No',minSisters:'No',recStatus:''},
    {name:'Martinez, Eric',gender:'M',age:'21',address1:'2236 Springcrest Dr',address2:'Unit 2002',state:'Texas',city:'Arlington',zip:'76010-0833',email:'',phone:'682-400-7993',lat:32.708711,long:-97.0766103999999,Status:'Known',convert:'Yes',endowed:'No',RM:'No',sealed:'No',movedIn:'45049',institute:'No',priesthood:'Priest',recExpireDate:'45474',minBrothers:'No',minSisters:'No',recStatus:'Active'},
    {name:'Martinez, Orion Lee',gender:'M',age:'26',address1:'3808 Bridle Path Ln',address2:'',state:'Texas',city:'Arlington',zip:'76016-2616',email:'mtsaltfish@hotmail.com',phone:'406-480-5711',lat:32.6869704,long:-97.2043911,Status:'Active',convert:'Yes',endowed:'Yes',RM:'No',sealed:'No',movedIn:'44514',institute:'No',priesthood:'Elder',recExpireDate:'44256',minBrothers:'Yes',minSisters:'No',recStatus:'Expired'},
    {name:'McAlister, Noah',gender:'M',age:'25',address1:'4319 Solitude Ct',address2:'',state:'Texas',city:'Arlington',zip:'76017-1361',email:'njmcalister@live.com',phone:'214-280-7033',lat:32.6698058,long:-97.1775739,Status:'Active',convert:'No',endowed:'No',RM:'No',sealed:'Yes',movedIn:'44478',institute:'Yes',priesthood:'Elder',recExpireDate:'45292',minBrothers:'No',minSisters:'No',recStatus:'Active'},
    {name:'McIntosh, Gavlyn Shirlene',gender:'F',age:'27',address1:'1501 E. Lamar Blvd',address2:'Apt 298',state:'Texas',city:'Arlington',zip:'76015',email:'gavlynm@yahoo.com',phone:'',lat:32.7649771,long:-97.0892829,Status:'',convert:'Yes',endowed:'No',RM:'No',sealed:'No',movedIn:'42864',institute:'No',priesthood:'',recExpireDate:'',minBrothers:'No',minSisters:'No',recStatus:''},
    {name:'Mendoza, Micaela Leigh',gender:'F',age:'22',address1:'4302 Vine Ridge Ct',address2:'',state:'Texas',city:'Arlington',zip:'76017-2253',email:'mlm0823.mm@gmail.com',phone:'817-905-6588',lat:32.6622161,long:-97.1759932,Status:'Active',convert:'No',endowed:'Yes',RM:'No',sealed:'Yes',movedIn:'45060',institute:'No',priesthood:'',recExpireDate:'45047',minBrothers:'No',minSisters:'No',recStatus:'Expired less than 3 months'},
    {name:'Meyer, Kira',gender:'F',age:'30',address1:'6610 High Country Trl',address2:'',state:'Texas',city:'Arlington',zip:'76016-5522',email:'',phone:'',lat:32.6722164,long:-97.2136136,Status:'Known',convert:'Yes',endowed:'No',RM:'No',sealed:'No',movedIn:'45074',institute:'No',priesthood:'',recExpireDate:'',minBrothers:'No',minSisters:'No',recStatus:''},
    {name:'Mitchell, Brittany Denae',gender:'F',age:'26',address1:'4720 Cadillac Blvd',address2:'',state:'Texas',city:'Arlington',zip:'76016-5433',email:'',phone:'817-687-8298',lat:32.670131,long:-97.2200994,Status:'Known',convert:'Yes',endowed:'No',RM:'No',sealed:'No',movedIn:'43850',institute:'No',priesthood:'',recExpireDate:'43770',minBrothers:'No',minSisters:'No',recStatus:'Expired'},
    {name:'Moore, Kjirstina',gender:'F',age:'30',address1:'1411 E Park Row Dr',address2:'',state:'Texas',city:'Arlington',zip:'76010-4623',email:'ppd859@yahoo.com',phone:'214-470-0452',lat:32.721183,long:-97.0878123,Status:'',convert:'No',endowed:'No',RM:'No',sealed:'Yes',movedIn:'44353',institute:'No',priesthood:'',recExpireDate:'',minBrothers:'No',minSisters:'Yes',recStatus:''},
    {name:'Moore, Melena',gender:'F',age:'24',address1:'1411 E Park Row Dr',address2:'',state:'Texas',city:'Arlington',zip:'76010-4623',email:'melenamoore11@gmail.com',phone:'214-218-8743',lat:32.721183,long:-97.0878123,Status:'Active',convert:'No',endowed:'Yes',RM:'No',sealed:'Yes',movedIn:'44353',institute:'No',priesthood:'',recExpireDate:'45778',minBrothers:'No',minSisters:'Yes',recStatus:'Active'},
    {name:'Moreno, Oliblish Xitlaly',gender:'F',age:'20',address1:'2852 Baskin Dr',address2:'',state:'Texas',city:'Lancaster',zip:'75134-1934',email:'5x.oli.x5@gmail.com',phone:'469-543-4813',lat:32.6193536,long:-96.7943906,Status:'Known',convert:'No',endowed:'No',RM:'No',sealed:'Yes',movedIn:'44801',institute:'Yes',priesthood:'',recExpireDate:'44013',minBrothers:'No',minSisters:'Yes',recStatus:'Expired'},
    {name:'Murrin, Noah',gender:'M',age:'24',address1:'2511 Heather Brook Lane',address2:'',state:'Texas',city:'Arlington',zip:'76006',email:'',phone:'',lat:32.7782885,long:-97.0637091999999,Status:'New',convert:'Yes',endowed:'Yes',RM:'No',sealed:'Yes',movedIn:'45137',institute:'No',priesthood:'Elder',recExpireDate:'44348',minBrothers:'No',minSisters:'No',recStatus:'Expired'},
    {name:'Najera, Andrea Lopez',gender:'F',age:'24',address1:'2222 Joey Ln',address2:'',state:'Texas',city:'Arlington',zip:'76010-6334',email:'andreanajera201@gmail.com',phone:'',lat:32.7070931,long:-97.1005253,Status:'Active',convert:'Yes',endowed:'Yes',RM:'Yes',sealed:'No',movedIn:'43676',institute:'Yes',priesthood:'',recExpireDate:'45444',minBrothers:'No',minSisters:'Yes',recStatus:'Active'},
    {name:'Namahoe, Kaimana Yoshiko',gender:'F',age:'28',address1:'425 E Lamar Blvd',address2:'Apt 454',state:'Texas',city:'Arlington',zip:'76011-1140',email:'kaibear808@yahoo.com',phone:'469-494-7011',lat:32.7614498,long:-97.109567,Status:'Active',convert:'No',endowed:'No',RM:'No',sealed:'Yes',movedIn:'45089',institute:'No',priesthood:'',recExpireDate:'',minBrothers:'No',minSisters:'No',recStatus:''},
    {name:'Neal, Mason Charles',gender:'M',age:'28',address1:'1802 Lakemont Dr',address2:'',state:'Texas',city:'Arlington',zip:'76013-3409',email:'',phone:'',lat:32.715375,long:-97.1421425,Status:'',convert:'Yes',endowed:'No',RM:'No',sealed:'No',movedIn:'44372',institute:'No',priesthood:'Priest',recExpireDate:'',minBrothers:'No',minSisters:'No',recStatus:''},
    {name:'Neathery, Matthew Ryan',gender:'M',age:'29',address1:'5808 Trail Crest Dr',address2:'',state:'Texas',city:'Arlington',zip:'76017-1035',email:'',phone:'817-937-6854',lat:32.6677109,long:-97.1972754,Status:'Known',convert:'No',endowed:'No',RM:'No',sealed:'Yes',movedIn:'43571',institute:'No',priesthood:'Elder',recExpireDate:'44013',minBrothers:'Yes',minSisters:'No',recStatus:'Expired'},
    {name:'Nelms, Job',gender:'M',age:'20',address1:'301 N Joe Wilson Rd',address2:'',state:'Texas',city:'Cedar Hill',zip:'75104-2335',email:'job.nelms@gmail.com',phone:'469-883-4171',lat:32.5935801,long:-96.9259881999999,Status:'Active',convert:'No',endowed:'No',RM:'No',sealed:'Yes',movedIn:'45089',institute:'No',priesthood:'Teacher',recExpireDate:'45474',minBrothers:'No',minSisters:'No',recStatus:'Active'},
    {name:'Nelms, Kaleb',gender:'M',age:'22',address1:'301 N Joe Wilson Rd',address2:'',state:'Texas',city:'Cedar Hill',zip:'75104-2335',email:'nelmskalb@outlook.com',phone:'469-883-4249',lat:32.5935801,long:-96.9259881999999,Status:'Active',convert:'No',endowed:'No',RM:'No',sealed:'Yes',movedIn:'45089',institute:'No',priesthood:'Priest',recExpireDate:'45474',minBrothers:'No',minSisters:'No',recStatus:'Active'},
    {name:'Nguyen, Christine',gender:'F',age:'22',address1:'1400 Cardinal St',address2:'',state:'Texas',city:'Arlington',zip:'76010-3010',email:'nguyenchristine65@gmail.com',phone:'682-392-2900',lat:32.7248178,long:-97.0887328,Status:'Known',convert:'Yes',endowed:'No',RM:'No',sealed:'No',movedIn:'45095',institute:'No',priesthood:'',recExpireDate:'',minBrothers:'No',minSisters:'No',recStatus:''},
    {name:'Nibarger, Emily Paige',gender:'F',age:'27',address1:'1027 Breezy Oaks Dr',address2:'',state:'Texas',city:'Mansfield',zip:'76063',email:'enibarger@gmail.com',phone:'',lat:32.5824907,long:-97.1681192,Status:'',convert:'No',endowed:'No',RM:'No',sealed:'Yes',movedIn:'42498',institute:'No',priesthood:'',recExpireDate:'',minBrothers:'Yes',minSisters:'No',recStatus:''},
    {name:'Norris, Preston',gender:'M',age:'21',address1:'735 Washington Dr',address2:'Apt 1305',state:'Texas',city:'Arlington',zip:'76011-3496',email:'preston.s.norris@gmail.com',phone:'208-569-1605',lat:32.770956,long:-97.100701,Status:'Active',convert:'No',endowed:'No',RM:'No',sealed:'Yes',movedIn:'45064',institute:'No',priesthood:'Priest',recExpireDate:'45231',minBrothers:'No',minSisters:'No',recStatus:'Active'},
    {name:'Oladipupo, Juwon',gender:'M',age:'28',address1:'716 Dover Park Trail',address2:'',state:'Texas',city:'Mansfield',zip:'',email:'',phone:'',lat:32.6100479,long:-97.1287239,Status:'',convert:'Yes',endowed:'No',RM:'No',sealed:'No',movedIn:'42793',institute:'No',priesthood:'Unordained',recExpireDate:'',minBrothers:'No',minSisters:'No',recStatus:''},
    {name:'Oladipupo, Taiwo',gender:'M',age:'28',address1:'716 Dover Park Trail',address2:'',state:'Texas',city:'Mansfield',zip:'',email:'',phone:'682-812-4074',lat:32.6100479,long:-97.1287239,Status:'',convert:'Yes',endowed:'No',RM:'No',sealed:'No',movedIn:'42793',institute:'No',priesthood:'Unordained',recExpireDate:'',minBrothers:'No',minSisters:'No',recStatus:''},
    {name:'Oyebanji, Opeyemi Odunayo',gender:'F',age:'26',address1:'3051 E Park Row Dr',address2:'',state:'Texas',city:'Arlington',zip:'76010-9509',email:'oyebanjiopeyemio@gmail.com',phone:'',lat:32.7216372,long:-97.0544235999999,Status:'Active',convert:'No',endowed:'Yes',RM:'Yes',sealed:'Yes',movedIn:'45151',institute:'No',priesthood:'',recExpireDate:'45292',minBrothers:'No',minSisters:'No',recStatus:'Active'},
    {name:'Padovich, Kacie',gender:'F',age:'20',address1:'508 Promise Creek Dr',address2:'',state:'Texas',city:'Arlington',zip:'76002-5011',email:'kcpav02@gmail.com',phone:'817-521-6523',lat:32.5975262,long:-97.0883058,Status:'Active',convert:'No',endowed:'No',RM:'No',sealed:'Yes',movedIn:'44903',institute:'Yes',priesthood:'',recExpireDate:'45261',minBrothers:'No',minSisters:'Yes',recStatus:'Active'},
    {name:'Palmer, Maryn',gender:'F',age:'26',address1:'6209 Sandstone Dr',address2:'',state:'Texas',city:'Arlington',zip:'76001-8101',email:'',phone:'',lat:32.644273,long:-97.151777,Status:'',convert:'No',endowed:'No',RM:'No',sealed:'No',movedIn:'42876',institute:'No',priesthood:'',recExpireDate:'',minBrothers:'No',minSisters:'No',recStatus:''},
    {name:'Paul, Brian Enrique',gender:'M',age:'29',address1:'800 Cooper Square Circle # 258',address2:'',state:'Texas',city:'Arlington',zip:'76130',email:'',phone:'817-770-3047',lat:32.7117405,long:-97.1161861,Status:'',convert:'Yes',endowed:'No',RM:'No',sealed:'No',movedIn:'42034',institute:'No',priesthood:'Unordained',recExpireDate:'',minBrothers:'No',minSisters:'No',recStatus:''},
    {name:'Petree, Logan',gender:'M',age:'27',address1:'1103 Randy Rd',address2:'',state:'Texas',city:'Cedar Hill',zip:'75014',email:'logan.c.petree@gmail.com',phone:'',lat:32.5688098,long:-96.9700091999999,Status:'Active',convert:'No',endowed:'Yes',RM:'No',sealed:'Yes',movedIn:'44206',institute:'No',priesthood:'Elder',recExpireDate:'45292',minBrothers:'Yes',minSisters:'No',recStatus:'Active'},
    {name:'Pettit, Sidney',gender:'F',age:'28',address1:'4916 Overview Dr',address2:'Apt 523',state:'Texas',city:'Arlington',zip:'76017-0759',email:'',phone:'385-275-0871-DNC',lat:32.666908,long:-97.2112552,Status:'Known',convert:'No',endowed:'Yes',RM:'No',sealed:'Yes',movedIn:'44591',institute:'No',priesthood:'',recExpireDate:'43252',minBrothers:'No',minSisters:'No',recStatus:'Canceled'},
    {name:'Pierre, Christopher',gender:'M',age:'30',address1:'425 E Lamar Blvd',address2:'Apt 214',state:'Texas',city:'Arlington',zip:'76011-1228',email:'',phone:'',lat:32.7614498,long:-97.109567,Status:'',convert:'No',endowed:'No',RM:'No',sealed:'Yes',movedIn:'44495',institute:'No',priesthood:'Priest',recExpireDate:'',minBrothers:'No',minSisters:'No',recStatus:''},
    {name:'Pollard, Deion Montriel',gender:'M',age:'27',address1:'822 Fondren Dr',address2:'',state:'Texas',city:'Arlington',zip:'76001-7590',email:'',phone:'817-849-0046',lat:32.6370701,long:-97.1212379,Status:'Known',convert:'No',endowed:'No',RM:'No',sealed:'No',movedIn:'44597',institute:'No',priesthood:'Teacher',recExpireDate:'',minBrothers:'No',minSisters:'No',recStatus:''},
    {name:'Poole, Dallin',gender:'M',age:'28',address1:'2001 Winter Pass Trl',address2:'',state:'Texas',city:'Arlington',zip:'76002-3614',email:'dallinr.poole@gmail.com',phone:'817-201-7896',lat:32.6350376,long:-97.076043,Status:'',convert:'Yes',endowed:'No',RM:'No',sealed:'Yes',movedIn:'44570',institute:'No',priesthood:'Elder',recExpireDate:'44440',minBrothers:'No',minSisters:'No',recStatus:'Expired'},
    {name:'Powers, Kayl Dade',gender:'M',age:'24',address1:'705 Lombardy Ln',address2:'',state:'Texas',city:'Arlington',zip:'76013-1441',email:'raiderk99@hotmail.com',phone:'903-651-1639',lat:32.7272957,long:-97.1418583,Status:'',convert:'No',endowed:'No',RM:'No',sealed:'No',movedIn:'43801',institute:'No',priesthood:'Priest',recExpireDate:'',minBrothers:'No',minSisters:'No',recStatus:''},
    {name:'Proctor, Chrissy',gender:'F',age:'23',address1:'4915 Wild Holly Ln',address2:'Apt 3-812',state:'Texas',city:'Arlington',zip:'76017-0762',email:'donna5proctor@hotmail.com',phone:'936-615-6905',lat:32.6672806,long:-97.2122093999999,Status:'Active',convert:'No',endowed:'No',RM:'No',sealed:'Yes',movedIn:'45095',institute:'No',priesthood:'',recExpireDate:'44075',minBrothers:'No',minSisters:'No',recStatus:'Expired'},
    {name:'Pryor, Kayden Orlando',gender:'M',age:'20',address1:'10349 Fort Croghan Trl',address2:'',state:'Texas',city:'Crowley',zip:'76036-3855',email:'kaydenpryor6@gmail.com',phone:'206-778-0250',lat:32.5773512,long:-97.3854661,Status:'Missionary',convert:'No',endowed:'Yes',RM:'Yes',sealed:'No',movedIn:'44611',institute:'No',priesthood:'Elder',recExpireDate:'45566',minBrothers:'No',minSisters:'No',recStatus:'Active'},
    {name:'Puempel, Andi',gender:'F',age:'26',address1:'1650 Ascension Bluff Dr',address2:'Apt 149',state:'Texas',city:'Arlington',zip:'76006-4264',email:'alpuempel@gmail.com',phone:'817-368-4016',lat:32.7774797,long:-97.0850164,Status:'RM',convert:'No',endowed:'Yes',RM:'Yes',sealed:'Yes',movedIn:'44738',institute:'No',priesthood:'',recExpireDate:'44470',minBrothers:'No',minSisters:'No',recStatus:'Expired'},
    {name:'Qureshi, Tor',gender:'M',age:'20',address1:'800 Bering Dr',address2:'Apt 1225',state:'Texas',city:'Arlington',zip:'76013-2524',email:'torqureshi@hotmail.com',phone:'',lat:32.7255373,long:-97.1169731,Status:'Known',convert:'No',endowed:'No',RM:'No',sealed:'Yes',movedIn:'44915',institute:'No',priesthood:'Teacher',recExpireDate:'',minBrothers:'No',minSisters:'No',recStatus:''},
    {name:'Reber, Jared',gender:'M',age:'25',address1:'1001 S Center St',address2:'Apt 2447',state:'Texas',city:'Arlington',zip:'76010-1197',email:'jaredreber98@gmail.com',phone:'575-631-6469',lat:32.7278008,long:-97.1060368,Status:'',convert:'No',endowed:'No',RM:'No',sealed:'Yes',movedIn:'43352',institute:'No',priesthood:'Priest',recExpireDate:'',minBrothers:'No',minSisters:'No',recStatus:''},
    {name:'Reich, Alexis',gender:'F',age:'29',address1:'226 Lemon Dr',address2:'',state:'Texas',city:'Arlington',zip:'76018-1630',email:'',phone:'',lat:32.6617278,long:-97.1104218,Status:'',convert:'Yes',endowed:'No',RM:'No',sealed:'No',movedIn:'42902',institute:'No',priesthood:'',recExpireDate:'',minBrothers:'No',minSisters:'No',recStatus:''},
    {name:'Rigby, James Michael Andrew',gender:'M',age:'18',address1:'600 Spanolio Dr',address2:'Dorm 202',state:'Texas',city:'Arlington',zip:'',email:'Rigbymonsters@gmail.com',phone:'478-305-9847',lat:32.7311272,long:-97.1094380999999,Status:'',convert:'',endowed:'',RM:'',sealed:'',movedIn:'',institute:'',priesthood:'',recExpireDate:'',minBrothers:'',minSisters:'',recStatus:''},
    {name:'Riojas, Louis Anthony',gender:'M',age:'29',address1:'6924 Shoreway Dr',address2:'',state:'Texas',city:'Grand Prairie',zip:'75054-6848',email:'louisrio007@gmail.com',phone:'817-938-6892',lat:32.6072697,long:-97.0401195,Status:'Known',convert:'Yes',endowed:'No',RM:'No',sealed:'No',movedIn:'43196',institute:'No',priesthood:'Unordained',recExpireDate:'',minBrothers:'No',minSisters:'No',recStatus:''},
    {name:'Robb, Brecken',gender:'F',age:'32',address1:'2125 Park Willow Lane',address2:'Unit B',state:'Texas',city:'Arlington',zip:'76011-3243',email:'brecken.robb@gmail.com',phone:'',lat:32.7689114,long:-97.1054968,Status:'Known',convert:'No',endowed:'No',RM:'No',sealed:'Yes',movedIn:'44720',institute:'No',priesthood:'',recExpireDate:'',minBrothers:'Yes',minSisters:'Yes',recStatus:''},
    {name:'Rodden, Aubrey Renae',gender:'F',age:'26',address1:'807 Biggs Ter',address2:'',state:'Texas',city:'Arlington',zip:'76010-4436',email:'aubreyrodden@yahoo.com',phone:'',lat:32.7159402,long:-97.0981949999999,Status:'Active',convert:'Yes',endowed:'No',RM:'No',sealed:'No',movedIn:'42225',institute:'Yes',priesthood:'',recExpireDate:'45474',minBrothers:'Yes',minSisters:'Yes',recStatus:'Active'},
    {name:'Romero, Layla America',gender:'F',age:'18',address1:'West Hall',address2:'',state:'Texas',city:'Arlington',zip:'',email:'',phone:'325-518-8750',lat:32.7330496,long:-97.1185098999999,Status:'',convert:'',endowed:'',RM:'',sealed:'',movedIn:'',institute:'',priesthood:'',recExpireDate:'',minBrothers:'',minSisters:'',recStatus:''},
    {name:'Ruben, Kira',gender:'F',age:'27',address1:'2236 Elmwood Dr',address2:'Apt 134',state:'Texas',city:'Arlington',zip:'76010-8745',email:'kidaruben@yahoo.com',phone:'',lat:32.7063335,long:-97.0670078,Status:'',convert:'Yes',endowed:'No',RM:'No',sealed:'No',movedIn:'44410',institute:'No',priesthood:'',recExpireDate:'',minBrothers:'No',minSisters:'No',recStatus:''},
    {name:'Rubio, Jesus Jose II',gender:'M',age:'26',address1:'1801 Creekpark Trail',address2:'',state:'Texas',city:'Arlington',zip:'76018',email:'Jesusrubio@gmail.com',phone:'682-540-0287',lat:32.65255,long:-97.0794442999999,Status:'',convert:'Yes',endowed:'No',RM:'No',sealed:'No',movedIn:'42831',institute:'No',priesthood:'Unordained',recExpireDate:'',minBrothers:'No',minSisters:'No',recStatus:''},
    {name:'Ruiz, Alexis Maria',gender:'F',age:'23',address1:'919 Highcrest Dr',address2:'',state:'Texas',city:'Arlington',zip:'76017-5924',email:'alexisr544@gmail.com',phone:'',lat:32.6700099,long:-97.1232402,Status:'',convert:'No',endowed:'No',RM:'No',sealed:'Yes',movedIn:'45155',institute:'No',priesthood:'',recExpireDate:'43160',minBrothers:'No',minSisters:'No',recStatus:'Expired'},
    {name:'Ruiz, Joseph Benjamin',gender:'M',age:'24',address1:'901 S Oak St',address2:'',state:'Texas',city:'Arlington',zip:'76010-1727',email:'jruiz@theventureonline.com',phone:'713-480-8926',lat:32.7283355,long:-97.1095624,Status:'',convert:'No',endowed:'No',RM:'No',sealed:'Yes',movedIn:'43001',institute:'No',priesthood:'Priest',recExpireDate:'43070',minBrothers:'No',minSisters:'No',recStatus:'Expired'},
    {name:'Sanders, Paisley',gender:'F',age:'30',address1:'502 Douglas Dr',address2:'',state:'Texas',city:'Mansfield',zip:'76063',email:'',phone:'',lat:32.6034577,long:-97.1323549,Status:'',convert:'Yes',endowed:'No',RM:'No',sealed:'No',movedIn:'43443',institute:'No',priesthood:'',recExpireDate:'',minBrothers:'No',minSisters:'No',recStatus:''},
    {name:'Sarolia, Devn',gender:'M',age:'31',address1:'918 Greenfield Ct.',address2:'',state:'Texas',city:'Kennedale',zip:'76060',email:'Devnsarolia@gmail.com',phone:'817 247-8419',lat:32.6515252,long:-97.2066856,Status:'Active',convert:'Yes',endowed:'No',RM:'No',sealed:'No',movedIn:'44507',institute:'No',priesthood:'Priest',recExpireDate:'45261',minBrothers:'No',minSisters:'No',recStatus:'Active'},
    {name:'Saunders, Sarah',gender:'F',age:'26',address1:'1116 Willowcreek Rd',address2:'',state:'Texas',city:'Cleburne',zip:'76033-6129',email:'sarahsaunders359@gmail.com',phone:'817-721-4586',lat:32.3332207,long:-97.40356,Status:'Active',convert:'No',endowed:'Yes',RM:'No',sealed:'Yes',movedIn:'44223',institute:'No',priesthood:'',recExpireDate:'45170',minBrothers:'Yes',minSisters:'Yes',recStatus:'Expiring next month'},
    {name:'Shirley, Brenden',gender:'M',age:'25',address1:'1502 Boxwood Ln',address2:'',state:'Texas',city:'Fort Worth',zip:'76140-2216',email:'Brendenshirley1998@gmail.com',phone:'',lat:32.6571882,long:-97.2538869999999,Status:'Active',convert:'No',endowed:'Yes',RM:'Yes',sealed:'Yes',movedIn:'45115',institute:'No',priesthood:'Elder',recExpireDate:'44743',minBrothers:'No',minSisters:'No',recStatus:'Expired'},
    {name:'Siddall, Autumn Mary',gender:'F',age:'24',address1:'1121 Uta Blvd',address2:'Apt 312',state:'Texas',city:'Arlington',zip:'76013-6939',email:'siddallautumn@gmail.com',phone:'315-767-4263',lat:32.7344159,long:-97.1225376,Status:'Active',convert:'Yes',endowed:'No',RM:'No',sealed:'No',movedIn:'43861',institute:'No',priesthood:'',recExpireDate:'44228',minBrothers:'Yes',minSisters:'Yes',recStatus:'Expired'},
    {name:'Smith, Steven',gender:'M',age:'20',address1:'4222 Rush Springs Dr',address2:'',state:'Texas',city:'Arlington',zip:'76016-4838',email:'Stevedog2002@gmail.com',phone:'469-900-6946',lat:32.6780944,long:-97.1612234999999,Status:'Known',convert:'Yes',endowed:'No',RM:'No',sealed:'No',movedIn:'44878',institute:'Yes',priesthood:'Priest',recExpireDate:'43191',minBrothers:'No',minSisters:'No',recStatus:'Expired'},
    {name:'Stafford, Anthony William',gender:'M',age:'30',address1:'1726 Sun Glow Dr',address2:'Apt 3223',state:'Texas',city:'Arlington',zip:'76006-2639',email:'',phone:'',lat:32.7788527,long:-97.0840077,Status:'',convert:'Yes',endowed:'No',RM:'No',sealed:'No',movedIn:'42694',institute:'No',priesthood:'Priest',recExpireDate:'',minBrothers:'No',minSisters:'No',recStatus:''},
    {name:'Stuckey, Fay Cady',gender:'F',age:'26',address1:'511 Tish Cir',address2:'Apt 1901',state:'Texas',city:'Arlington',zip:'76006-3554',email:'Cadystuckey@gmail.com',phone:'903-818-6225',lat:32.7823091,long:-97.1112500999999,Status:'',convert:'Yes',endowed:'No',RM:'No',sealed:'No',movedIn:'43775',institute:'No',priesthood:'',recExpireDate:'',minBrothers:'No',minSisters:'No',recStatus:''},
    {name:'Stucki, Yabsira',gender:'F',age:'19',address1:'1601 E Debbie Lane',address2:'#6212',state:'Texas',city:'Mansfield',zip:'76063',email:'yabsirastucki@gmail.com',phone:'',lat:32.608991,long:-97.1113342,Status:'',convert:'',endowed:'',RM:'',sealed:'',movedIn:'',institute:'',priesthood:'',recExpireDate:'',minBrothers:'',minSisters:'',recStatus:''},
    {name:'Swinney, Blake',gender:'M',age:'23',address1:'106 W Lilly Ln',address2:'',state:'Texas',city:'Arlington',zip:'76010-5605',email:'nicolelhoelzl@gmail.com',phone:'',lat:32.7123157,long:-97.1063444,Status:'',convert:'No',endowed:'No',RM:'No',sealed:'No',movedIn:'43261',institute:'No',priesthood:'Priest',recExpireDate:'42887',minBrothers:'No',minSisters:'No',recStatus:'Expired'},
    {name:'Taggart, Alexis',gender:'F',age:'20',address1:'1001 Uta Blvd',address2:'',state:'Texas',city:'Arlington',zip:'76013-6937',email:'lexitaggart1213@gmail.com',phone:'',lat:32.7350321,long:-97.1194501999999,Status:'',convert:'No',endowed:'No',RM:'No',sealed:'Yes',movedIn:'44762',institute:'No',priesthood:'',recExpireDate:'43983',minBrothers:'No',minSisters:'No',recStatus:'Expired'},
    {name:'Taggart, Jordan',gender:'F',age:'19',address1:'1001 Uta Blvd',address2:'',state:'Texas',city:'Arlington',zip:'76013-6937',email:'jordanltaggart227@gmail.com',phone:'',lat:32.7350321,long:-97.1194501999999,Status:'',convert:'No',endowed:'No',RM:'No',sealed:'Yes',movedIn:'44762',institute:'No',priesthood:'',recExpireDate:'43800',minBrothers:'No',minSisters:'No',recStatus:'Expired'},
    {name:'Tatro, Westley James',gender:'M',age:'21',address1:'3207 Ridge Trace Cir',address2:'',state:'Texas',city:'Mansfield',zip:'76063-5365',email:'Westleytatro@gmail.com',phone:'214-960-7843',lat:32.5870567,long:-97.0873702999999,Status:'Active',convert:'No',endowed:'Yes',RM:'No',sealed:'Yes',movedIn:'45097',institute:'Yes',priesthood:'Elder',recExpireDate:'45323',minBrothers:'No',minSisters:'No',recStatus:'Active'},
    {name:'Taylor, Ammon',gender:'M',age:'21',address1:'6901 Forestview Dr',address2:'',state:'Texas',city:'Arlington',zip:'76016-5127',email:'ammonations56@gmail.com',phone:'682-812-2614',lat:32.6752651,long:-97.216709,Status:'Active',convert:'No',endowed:'No',RM:'No',sealed:'Yes',movedIn:'45129',institute:'Yes',priesthood:'Elder',recExpireDate:'45505',minBrothers:'No',minSisters:'No',recStatus:'Active'},
    {name:'Taylor, Austin Thomas',gender:'M',age:'20',address1:'4106 Shady Valley Dr',address2:'',state:'Texas',city:'Arlington',zip:'76013-2935',email:'',phone:'',lat:32.7205921,long:-97.1718286999999,Status:'',convert:'No',endowed:'No',RM:'No',sealed:'Yes',movedIn:'44829',institute:'No',priesthood:'Priest',recExpireDate:'43983',minBrothers:'No',minSisters:'No',recStatus:'Expired'},
    {name:'Tijani, Mustapha Ibunkun',gender:'M',age:'21',address1:'1001 Uta Blvd',address2:'Apt 212D',state:'Texas',city:'Arlington',zip:'76013-6937',email:'',phone:'832-670-4644',lat:32.7350321,long:-97.1194501999999,Status:'',convert:'Yes',endowed:'No',RM:'No',sealed:'Yes',movedIn:'44570',institute:'No',priesthood:'Priest',recExpireDate:'44531',minBrothers:'No',minSisters:'No',recStatus:'Expired'},
    {name:'Vang, Sheng',gender:'F',age:'30',address1:'714 Connally Ter',address2:'',state:'Texas',city:'Arlington',zip:'76010-4453',email:'Shengva848@gmail.com',phone:'682-465-3487',lat:32.716469,long:-97.0997084999999,Status:'',convert:'Yes',endowed:'No',RM:'No',sealed:'No',movedIn:'42974',institute:'No',priesthood:'',recExpireDate:'43040',minBrothers:'No',minSisters:'No',recStatus:'Expired'},
    {name:'Vargas, Francisco',gender:'M',age:'26',address1:'1315 N Cooper St',address2:'Apt 221',state:'Texas',city:'Arlington',zip:'76011-5569',email:'',phone:'',lat:32.7536048,long:-97.1132720999999,Status:'',convert:'Yes',endowed:'No',RM:'No',sealed:'No',movedIn:'43341',institute:'No',priesthood:'Priest',recExpireDate:'43405',minBrothers:'No',minSisters:'No',recStatus:'Expired'},
    {name:'Villalobos, Maleni',gender:'F',age:'29',address1:'2415 Laurelwood Dr',address2:'Apt 1412',state:'Texas',city:'Arlington',zip:'76010-8721',email:'',phone:'',lat:32.7073429,long:-97.0672074,Status:'',convert:'Yes',endowed:'No',RM:'No',sealed:'No',movedIn:'44084',institute:'No',priesthood:'',recExpireDate:'',minBrothers:'No',minSisters:'No',recStatus:''},
    {name:'Villazaez, Sofia Gabriela',gender:'F',age:'20',address1:'815 Bering Dr',address2:'Apt 1433',state:'Texas',city:'Arlington',zip:'76013-2527',email:'',phone:'',lat:32.724768,long:-97.1170320999999,Status:'',convert:'No',endowed:'No',RM:'No',sealed:'Yes',movedIn:'44469',institute:'No',priesthood:'',recExpireDate:'43709',minBrothers:'No',minSisters:'No',recStatus:'Expired'},
    {name:'Weber, Stephanie Louise',gender:'F',age:'28',address1:'1001 Uta Blvd',address2:'',state:'Texas',city:'Arlington',zip:'76013-6937',email:'sweber1221@yahoo.com',phone:'',lat:32.7350321,long:-97.1194501999999,Status:'',convert:'No',endowed:'No',RM:'No',sealed:'Yes',movedIn:'43423',institute:'No',priesthood:'',recExpireDate:'',minBrothers:'No',minSisters:'No',recStatus:''},
    {name:'Western, Austin Trevor',gender:'M',age:'25',address1:'1309 Memory Ln',address2:'',state:'Texas',city:'Arlington',zip:'76011-9321',email:'',phone:'',lat:32.7667653,long:-97.0914057,Status:'',convert:'Yes',endowed:'No',RM:'No',sealed:'No',movedIn:'44706',institute:'No',priesthood:'Priest',recExpireDate:'',minBrothers:'No',minSisters:'No',recStatus:''},
    {name:'Winkle, Talon',gender:'M',age:'27',address1:'3701 Village Glen Trl',address2:'',state:'Texas',city:'Arlington',zip:'76016-2711',email:'',phone:'',lat:32.6878922,long:-97.1952124,Status:'',convert:'Yes',endowed:'No',RM:'No',sealed:'No',movedIn:'42801',institute:'No',priesthood:'Teacher',recExpireDate:'',minBrothers:'No',minSisters:'No',recStatus:''},
    {name:'Winzenz, Brandon',gender:'M',age:'24',address1:'1903 Lost Creek Dr',address2:'',state:'Texas',city:'Arlington',zip:'76006-6621',email:'brandon@winzenzfamily.net',phone:'817-757-0666',lat:32.764841,long:-97.0793262999999,Status:'Known',convert:'No',endowed:'No',RM:'No',sealed:'Yes',movedIn:'44703',institute:'No',priesthood:'Elder',recExpireDate:'',minBrothers:'Yes',minSisters:'No',recStatus:''},
    {name:'Wright, Destiny Michelle',gender:'F',age:'27',address1:'1512 West Lovers Lane # 17',address2:'',state:'Texas',city:'Arlington',zip:'76013- ',email:'destinyw121234@gmail.com',phone:'',lat:32.8352908,long:-96.8624026,Status:'',convert:'Yes',endowed:'No',RM:'No',sealed:'No',movedIn:'43310',institute:'No',priesthood:'',recExpireDate:'',minBrothers:'No',minSisters:'No',recStatus:''},
    {name:'Young, Samuel Orrin',gender:'M',age:'22',address1:'4011 Cottage Park Ct',address2:'',state:'Texas',city:'Arlington',zip:'76013-8087',email:'S.young12now@gmail.com',phone:'817-449-5761',lat:32.7110407,long:-97.1695575999999,Status:'Active',convert:'No',endowed:'Yes',RM:'Yes',sealed:'Yes',movedIn:'44799',institute:'Yes',priesthood:'High Priest',recExpireDate:'45627',minBrothers:'Yes',minSisters:'No',recStatus:'Active'},
    {name:'Zelenuk, Faith',gender:'F',age:'23',address1:'2203 Huntington Dr',address2:'',state:'Texas',city:'Arlington',zip:'76010-7722',email:'faithnicolez@sbcglobal.net',phone:'817-229-7662',lat:32.7298991,long:-97.07113,Status:'Active',convert:'Yes',endowed:'No',RM:'No',sealed:'No',movedIn:'45061',institute:'No',priesthood:'',recExpireDate:'45413',minBrothers:'No',minSisters:'No',recStatus:'Active'},
    {name:'Zumbrennen, Ian',gender:'M',age:'25',address1:'605 Lynda Ln',address2:'',state:'Texas',city:'Arlington',zip:'76010-4310',email:'izumbrennen@gmail.com',phone:'512-810-2002',lat:32.7163645,long:-97.1131633999999,Status:'Active',convert:'Yes',endowed:'No',RM:'No',sealed:'Yes',movedIn:'45137',institute:'No',priesthood:'Deacon',recExpireDate:'',minBrothers:'No',minSisters:'No',recStatus:''},
    {name:'Zurbuchen, Billy Allen',gender:'M',age:'26',address1:'1008 Belmont Dr',address2:'',state:'Texas',city:'Kennedale',zip:'76060-5616',email:'billiam5269@gmail.com',phone:'817-726-9689',lat:32.6579002,long:-97.2182462,Status:'Known',convert:'No',endowed:'No',RM:'No',sealed:'Yes',movedIn:'42652',institute:'No',priesthood:'Priest',recExpireDate:'',minBrothers:'No',minSisters:'No',recStatus:''},
    {name:'Zurbuchen, Timothy Ray',gender:'M',age:'23',address1:'1610 Hill St',address2:'Apt 4320',state:'Texas',city:'Grand Prairie',zip:'75050-5181',email:'timward830@gmail.com',phone:'‭817-939-0223‬',lat:32.7492731,long:-97.0261335,Status:'Active',convert:'No',endowed:'No',RM:'No',sealed:'Yes',movedIn:'45014',institute:'No',priesthood:'Elder',recExpireDate:'43282',minBrothers:'No',minSisters:'No',recStatus:'Expired'},
]