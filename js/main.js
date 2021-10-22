var font = null;
var isPlay = false;

// Load font upfront and only once so that the texts added don't appear with a delay
function loadFont(){
    var loader = new THREE.FontLoader();
    // loader.load('./font/Comfortaa_Regular.json', function(loadedFont) {
    loader.load('https://raw.githubusercontent.com/components-ai/typefaces/main/packages/font-comfortaa/data/typefaces/normal-300.json', function(loadedFont) {
            font = loadedFont;
        
        console.log(JSON.parse(JSON.stringify(font)))
        init();
    })
}

function init(){ 
    const barMargin = 0.1;
    const barHeightMax = 10;
    const innerWidth = 5;
    const platformHeight = 2;
    const platformMargin = 4;
    const outerHeight = barHeightMax + platformHeight;
    const legendSteps = 10;
    const fontHeight = 0.1;
    const titleText = "3D Heat Map";

    const scene = new THREE.Scene();

    // Create the cammera 
    const camera = new THREE.PerspectiveCamera( 75, window.innerWidth / window.innerHeight, near = 0.1, far = 1000 );
    
    // Adjust camera position to make the object visable
    camera.position.set(15, 15, 15);

    const renderer = new THREE.WebGLRenderer({antialias: true, alpha: 1});
    renderer.setSize(window.innerWidth, window.innerHeight)
    document.body.appendChild(renderer.domElement)

    // Add Eventlisterner for Play Pause Buttons
    const pauseIcon = document.getElementById("pause-icon")
    pauseIcon.addEventListener("click", () => {
        isPlay = false;
        setPlayPauseIconOpacity()
    } )

    const playIcon = document.getElementById("play-icon")
    playIcon.addEventListener("click", () => {
        isPlay = true;
        setPlayPauseIconOpacity()
    } )

    const setPlayPauseIconOpacity = () => {
        playIcon.classList.add(isPlay ? "icon-inactive" : "icon-active");
        playIcon.classList.remove(isPlay ? "icon-active" : "icon-inactive");
        pauseIcon.classList.add(isPlay ? "icon-active" : "icon-inactive");
        pauseIcon.classList.remove(isPlay ? "icon-inactive" : "icon-active");
    }

    setPlayPauseIconOpacity();

      // Add controls to move the camera
    const controls = new THREE.OrbitControls( camera, renderer.domElement );
    controls.target.set(0,0,0);
    controls.update();
    
    // PREPARE DATA 
    //======================================================================================================//
   
    // Define Data
    // const data = [
    //     {cat1: 1, cat2: 1, value: 1}, 
    //     {cat1: 1, cat2: 2, value: 0.4}, 
    //     {cat1: 1, cat2: 3, value: 0.1}, 
    //     {cat1: 1,  cat2: 4, value: 0.6}, 
    //     {cat1: 2, cat2: 1, value: 0.8}, 
    //     {cat1: 2, cat2: 2, value: 0.3}, 
    //     {cat1: 2, cat2: 3, value: 0.2}, 
    //     {cat1: 2,  cat2: 4, value: 0.5}, 
    //     {cat1: 3, cat2: 1, value: 0.9}, 
    //     {cat1: 3, cat2: 2, value: 0.5}, 
    //     {cat1: 3, cat2: 3, value: 0.7}, 
    //     {cat1: 3,  cat2: 4, value: 0.4}, 
    //     {cat1: 4, cat2: 1, value: 0.6}, 
    //     {cat1: 4, cat2: 2, value: 1}, 
    //     {cat1: 4, cat2: 3, value: 0.4}, 
    //     {cat1: 4,  cat2: 4, value: 0.3}
    // ]

    const data = [
        {cat1: "A", cat2: "1", value: 15}, 
        {cat1: "A", cat2: "2", value: 4}, 
        {cat1: "A", cat2: "3", value: 145}, 
        {cat1: "A",  cat2: "4", value: 34}, 
        {cat1: "B", cat2:  "1", value: 23}, 
        {cat1: "B", cat2: "2", value: 34}, 
        {cat1: "B", cat2: "3", value: 122}, 
        {cat1: "B",  cat2: "4", value: 95}, 
        {cat1: "C", cat2:  "1", value: 75}, 
        {cat1: "C", cat2: "2", value: 45}, 
        {cat1: "C", cat2: "3", value: 43}, 
        {cat1: "C",  cat2: "4", value: 74}, 
        {cat1: "D", cat2:  "1", value: 32}, 
        {cat1: "D", cat2: "2", value: 12}, 
        {cat1: "D", cat2: "3", value: 32}, 
        {cat1: "D",  cat2: "4", value: 52}
    ]

    // const data = [
    //     {cat1: "A", cat2: "1", value: 2}, 
    //     {cat1: "A", cat2: "2", value: 4.3}, 
    //     {cat1: "A", cat2: "3", value: 3}, 
    //     {cat1: "A",  cat2: "4", value: 1.9}, 
    //     {cat1: "B", cat2:  "1", value: 4}, 
    //     {cat1: "B", cat2: "2", value: 4}, 
    //     {cat1: "B", cat2: "3", value: 3}, 
    //     {cat1: "B",  cat2: "4", value: 4}, 
    //     {cat1: "C", cat2:  "1", value: 4}, 
    //     {cat1: "C", cat2: "2", value: 3}, 
    //     {cat1: "C", cat2: "3", value: 4}, 
    //     {cat1: "C",  cat2: "4", value: 4}, 
    //     {cat1: "D", cat2:  "1", value: 3}, 
    //     {cat1: "D", cat2: "2", value: 4}, 
    //     {cat1: "D", cat2: "3", value: 3}, 
    //     {cat1: "D",  cat2: "4", value: 5.1}
    // ]

    // DEFINE SCALES
    //======================================================================================================//
   
    // Create scales 
    const x = d3.scaleBand().range([0, innerWidth]);
    const z = d3.scaleBand().range([0, -innerWidth]);
    const y = d3.scaleLinear().range([0, barHeightMax]);
    const c = d3.scaleLinear()
        .interpolate(d3.interpolateHcl)
        .range([d3.rgb('#618DFB'), d3.rgb("#431A42")]);

    // Scale the range of the data
    const cat1_set = new Set(data.map(function(d){ return d.cat1 }));
    const cat2_set = new Set(data.map(function(d){ return d.cat2 }));
    const value_max = d3.max(data, function(d) { return  (d.value)});
    const value_min = d3.min(data, function(d) { return  (d.value)});

    x.domain(cat1_set);
    z.domain(cat2_set);
    y.domain([0, value_max])
    c.domain([value_max, 0])

    const barWidth = innerWidth/ d3.max([cat1_set.size, cat2_set.size], c => c) - barMargin;

    // ADD PLATFORM
    //======================================================================================================//

    // Create platform and add it to the scene
    const platformGeometry = new THREE.BoxGeometry(1,1,1);
    const platformMaterial = new THREE.MeshPhongMaterial( {color: "#262931", shininess: 0})
    const platform = new THREE.Mesh( platformGeometry, platformMaterial );      
    scene.add( platform );

    // Scale platform
    platform.scale.x = data.length/ 2 + platformMargin;
    platform.scale.y = platformHeight;
    platform.scale.z = data.length/ 2 + platformMargin;

    // Position platform to start at y=0
    platform.position.y += platformHeight/2;


    // ADD BARS
    //======================================================================================================//
   
    const createBar = (cat1, cat2, value) => {
        let geometry = new THREE.BoxGeometry(1,1,1);
        let material = new THREE.MeshPhongMaterial( {color: c(value), shininess: 0})
        let bar = new THREE.Mesh( geometry, material );
        scene.add( bar );
    
        bar = scaleBar(bar, value)
        bar = positionBar(bar, cat1, cat2, value)
            
        return bar
    }

    // Scale the bar accorting to the individual values in the data and the global bar settings
    const scaleBar = (bar, value) => {
        bar.scale.y = y(value);
        bar.scale.x = barWidth; 
        bar.scale.z = barWidth;        

        return bar;
    }
    
    // Position the bar on x axes by shifting it depending on the index in the data
    // the defined bar dimensions and the platform height
    const positionBar = (bar, cat1, cat2, value) => {
        bar.position.x = x(cat1) + barWidth/2 - innerWidth/2
        bar.position.z = z(cat2) + barWidth/2 + innerWidth/2
        bar.position.y += y(value) /2 + platformHeight + barMargin

        return bar;
    }

    // Create a bar for each entry in data
    bars = []
    data.forEach((d, i) => { 
        bar = {
            geometry: createBar(d.cat1, d.cat2, d.value),
            d: d,
            i: i
        }
        bars.push(bar);
        scene.add(bar.geometry);
    })

    // ADD TICK LABELS
    //======================================================================================================//

    const createTickLabels = (cat, axis) => {
        let labelGeometry = new THREE.TextGeometry(String(cat), {font: font, size: 0.5, height: fontHeight});
        let label = new THREE.Mesh(labelGeometry, [new THREE.MeshPhongMaterial({color: "white"}), new THREE.MeshPhongMaterial({color: "grey"})])
        
        switch (axis) {
            case "x":
                label.position.x = x(cat) - innerWidth/2;
                label.position.z += innerWidth/2 + barWidth;
                break;
            case "z":
                label.position.z = z(cat) + barWidth + innerWidth/2;
                label.position.x -= innerWidth/2 + barWidth + barMargin;
                break;
            default:
                console.error("Only 'x' and 'z' are supported axes.")
                break;
        }

        label.position.y += platformHeight + barMargin
        label.rotateX(THREE.Math.degToRad(-90));

        scene.add(label)
    }

    cat1_set.forEach(c => createTickLabels(c, "x"))
    cat2_set.forEach(c => createTickLabels(c, "z"))

    
    // ADD LEGEND
    //======================================================================================================//

    const createIncusiveRange = (start, stop, nsteps, round = true) => {
        delta = (stop-start)/(nsteps-1)
        range = d3.range(start, stop+delta, delta).slice(0, nsteps)
        return round ? range.map(d => Math.round(d)) : range;
      }
    
    // TODO: set "Step" inividual based on data
    const legendRange = createIncusiveRange(value_min, value_max, legendSteps, value_min < 0 && (value_max-value_min) > legendSteps);
    console.log(legendRange)
    legendRange.forEach((d, i) => {
        let geometry = new THREE.BoxGeometry(1,1,1);
        let material = new THREE.MeshPhongMaterial( {color: c(d), shininess: 0})
        let bar = new THREE.Mesh( geometry, material );

        bar.scale.y = y(d); 
        bar.scale.z = innerWidth/legendRange.length
        bar.scale.x = innerWidth/legendRange.length - barWidth;

        bar.position.x = innerWidth/2 + platformMargin/2 + bar.scale.x;
        bar.position.z = innerWidth/2 - i * bar.scale.z;
        bar.position.y += y(d) /2 + platformHeight + barMargin

        if( d === value_max || d === value_min) {
            let labelGeometry = new THREE.TextGeometry(String(d), {font: font, size: 0.5, height: fontHeight});
            let label = new THREE.Mesh(labelGeometry, [new THREE.MeshPhongMaterial({color: "white"}), new THREE.MeshPhongMaterial({color: "grey"})])
           
            label.position.x = innerWidth/2 + platformMargin/2 + bar.scale.x/4;
            label.position.z = innerWidth/2 - i * bar.scale.z + barWidth/4;
            label.position.y += platformHeight + barMargin;

            label.rotateX(THREE.Math.degToRad(-90));
            
            scene.add(label);
        }

        scene.add( bar );
    })

    // ADD TITLE
    //======================================================================================================//
    const titleGeometry = new THREE.TextGeometry(titleText, {font: font, size: 1, height: fontHeight})
    const title = new THREE.Mesh(titleGeometry, [new THREE.MeshPhongMaterial({color: "white"}), new THREE.MeshPhongMaterial({color: "grey"})])
    
    titleGeometry.computeBoundingBox()
    titleGeometry.center();
    
    title.rotateX(THREE.Math.degToRad(-90));
    title.position.z -= data.length / 4;
    title.position.y += platformHeight + barMargin;

    scene.add(title)

    // ADD LIGHT 
    //======================================================================================================//
   
    const createLightSource = (light, position, showLightGeometry = false) => {
    
        // If geometry and material are passed, mesh them and add them to screen in the light postion
        if(showLightGeometry) {
            let geometry = new THREE.SphereGeometry(1,10,10);
            let material = new THREE.MeshPhongMaterial( {color: "white", transparent: true, shininess: 100})
            let sphere = new THREE.Mesh(geometry, material);      
            sphere.position.set(position.x, position.y, position.z)
            scene.add( sphere );
        }

        // Create light and add it to the scene in the defined position
        light.position.set(position.x, position.y, position.z)
        scene.add( light );
    }

    createLightSource(
        light = new THREE.DirectionalLight("white", 0.5), 
        position = {x: -10, y: 10, z: 0},
        showLightGeometry = false
    )

    createLightSource(
        light = new THREE.DirectionalLight("white", 0.5), 
        position = {x: 10, y: 10, z: 0},
        showLightGeometry = false
    )

    const lightAmbient = new THREE.AmbientLight("white")
    scene.add( lightAmbient );

    const axesHelper = new THREE.AxesHelper(1000);
    scene.add( axesHelper );

    // POSTION SCENE AT VERTICAL CENTER
    //======================================================================================================//
    scene.position.y -= outerHeight/2

    // ANIMATE 
    //======================================================================================================//

    const animate = () => {
     
        // Render the scene according to the camera settings
        renderer.render(scene, camera)

        // Set up endless repetition/ loop
        requestAnimationFrame(animate)

        if (!isPlay) return;
      
        scene.rotation.y -= 0.01
    }

    // Call function to animate in a loop
    animate()
   

    // REACT TO RESIZE 
    //======================================================================================================//

    const onResize = () => {
        camera.aspect = window.innerWidth / window.innerHeight;
        camera.updateProjectionMatrix();
        renderer.setSize( window.innerWidth, window.innerHeight );
      }
    
    // React to resizing of the browser
    window.addEventListener( 'resize', onResize, false);


}

window.addEventListener("load", loadFont)