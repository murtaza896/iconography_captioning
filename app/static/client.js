var el = x => document.getElementById(x);
var response

function renderImage(img){
    if ((typeof img) == "number") return 
    grid = el("grids")
    if (img.startsWith("data:")){
        var tag = document.createElement('img');
        tag.src = img
    } else {
        var tag = document.createElement('p')
        tag.id = img
    }
    var gdiv = document.createElement('div');
    gdiv.className = "grid-item"
    gdiv.appendChild(tag)
    grid.appendChild(gdiv)
}

function showPicker() {
    el("file-input").click();
}

function showPicked(input) {
    el("upload-label").innerHTML = input.files[0].name;
    var reader = new FileReader();
    reader.onload = function (e) {
        el("image-picked").src = e.target.result;
        el("image-picked").className = "";
    };
    reader.readAsDataURL(input.files[0]);
}

function analyze() {
    const analyzeBtn = document.getElementById("analyze-btn");

    var uploadFiles = el("fileUpload").files;
    if (uploadFiles.length !== 1) alert("Please select a file to analyze!");

    var fname = uploadFiles[0].name;

    // el("analyze-button").innerHTML = "Analyzing...";
    

    var xhr = new XMLHttpRequest();
    
    var loc = window.location;
    
    xhr.open("POST", `${loc.protocol}//${loc.hostname}:${loc.port}/analyze`,true);
    
    xhr.onloadstart = () => {
        analyzeBtn.innerHTML = "<strong>Analyzing...</strong>";

        let logo = document.getElementById("logo");
        logo.classList.add("rtt");

        let preloader = document.getElementById("preloader");
        preloader.style.display = "block";
    };


    xhr.onerror = function () {
        alert(xhr.responseText);
    };


    xhr.onload = function(e) {
        
        const resultImage = document.getElementById("result");
        const download_btn = document.getElementById("download-btn");
        
        response = JSON.parse(e.target.responseText);
        // console.log(response);

        const file = response["new_img"];
        // console.log(file)
        
        // setTimeout(()=>{
            let logo = document.getElementById("logo");
            logo.classList.remove("rtt");

            let preloader = document.getElementById("preloader");
            preloader.style.display = "none";

            resultImage.setAttribute("src", file);

            // var download_btn = document.createElement('a');
            // download_btn.style.display = 'none';

            download_btn.setAttribute('href', file);
            download_btn.setAttribute('download', response["filename"]);
            
            analyzeBtn.innerHTML = "<strong>Analyze</strong>";
            analyzeBtn.classList.remove("scale-in");
            analyzeBtn.classList.add("scale-out");

            download_btn.classList.remove("scale-out");
            download_btn.classList.add("scale-in");
            
            // document.body.appendChild(download_btn);
            // download_btn.click();
            // document.body.removeChild(download_btn);

        // }, 3000);        
    }

    // xhr.onload = function (e) {
    //     if (this.readyState === 4) {
    //         response = JSON.parse(e.target.responseText)
    //         var cams = response["cam"]
    //         el("grids").innerHTML=""
            
    //         for(ima of cams){
    //             ima.map(renderImage)
    //         }

    //         var codes = response["result"]
    //         el("result-label").innerHTML = `<ul id="result-texts" style="list-style: none;"></ul>`
    //         var txtprms = codes.map(
    //             y => fetch("http://iconclass.org/json/?notation=" + y[0])
    //                 .then(x => x.json())
    //                 .then(x => x[0].txt.en)
    //                 .then(function(x){
    //                     console.log(x)
    //                     /*var li = document.createElement('li')
    //                     li.innerText = x
    //                     el("result-texts").appendChild(li)*/
    //                     el(y[0]).innerHTML = `${x} 
    //                     <bold>( ${Number.parseFloat(y[1]*100).toFixed(2)}% )</bold>`
    //                 }))
    //         Promise.all(txtprms)
    //     }
    //     el("analyze-button").innerHTML = "Analyze";
    // };

    var fileData = new FormData();
    fileData.append("fname", fname);
    fileData.append("file", uploadFiles[0]);
    xhr.send(fileData);
    
}

function upload()
{
    var uploadFiles = el("file-input").files;
    var fname = uploadFiles[0].name;

    var xhr = new XMLHttpRequest();
    var loc = window.location;

    xhr.open("POST", `${loc.protocol}//${loc.hostname}:${loc.port}/upload`,true);
    
    xhr.onload = function(e) {
        // var response = e.target.responseText;
        console.log(e);
        my_animation();
    }

    var fileData = new FormData();
    fileData.append("fname", fname);
    fileData.append("file", uploadFiles);
    
    xhr.send(fileData);
}

async function myAnimation() 
{
    let logo = document.getElementById("logo");
    logo.classList.toggle("rtt");

    let preloader = document.getElementById("preloader");
    preloader.style.display = "block";

    await (function(){
        return new Promise(resolve=>{
            setTimeout(() => {
                preloader.style.display = "none";
                logo.classList.toggle("rtt");
                resolve();
            }, 500);
        });
    })(); 
}

const fileUpload = document.getElementById("fileUpload");

fileUpload.addEventListener("change", function () {
    
    myAnimation().then(()=>{
        
        const previewImage = document.getElementById("upload");
        const resultImage = document.getElementById("result");
        const analyzeBtn = document.getElementById("analyze-btn");
        const download_btn = document.getElementById("download-btn");

        
        
        const file = this.files[0];
        console.log("uploaded file: " + file);


        if (file) {
            const reader = new FileReader();
            download_btn.classList.remove("scale-in");
            download_btn.classList.add("scale-out");
            previewImage.style.display = "block";

            reader.addEventListener("load", function () {
                previewImage.setAttribute("src", this.result);
                resultImage.setAttribute("src", "../static/placeholder-image.png");
                
                
                
                analyzeBtn.classList.remove("scale-out");
                analyzeBtn.classList.add("scale-in");
            });

            reader.readAsDataURL(file);
            // analyze(this.files);
        }
        
    });
    
});