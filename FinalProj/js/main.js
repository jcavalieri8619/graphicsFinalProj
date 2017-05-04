// once everything is loaded, we run our Three.js stuff.
function init( texture ) {

    const stats = initStats();


    let CURRENT_ACTION = null;// "roundedBox";  //"triMesh", "curvedSurface"

    let Orbitcontrols;
    // create a scene, that will hold all our elements such as objects, cameras and lights.
    const scene = new THREE.Scene();

    // create a camera, which defines where we're looking at.
    let camera = new THREE.PerspectiveCamera( 80, window.innerWidth / window.innerHeight, 0.1, 1000 );

    scene.add( camera );
    // create a render and set the size
    const webGLRenderer = new THREE.WebGLRenderer( { antialias: true } );
    webGLRenderer.setClearColor( 0x000000, 1.0 );
    webGLRenderer.setSize( window.innerWidth, window.innerHeight );
    webGLRenderer.shadowMap.enabled=true;


    let backGround_Mesh = new THREE.Mesh( new THREE.SphereBufferGeometry( 400, 32, 32 ), new THREE.MeshBasicMaterial( { map: texture } ) );
    backGround_Mesh.scale.x = -1;
    backGround_Mesh.receiveShadow=true;
    scene.add( backGround_Mesh );


    Orbitcontrols = new THREE.OrbitControls( camera, webGLRenderer.domElement );

    document.getElementById( "WebGL-output" ).appendChild( webGLRenderer.domElement );
    $( "canvas" ).prop( "id", "CANVAS" );


    let cubeCamera1 = new THREE.CubeCamera( 0.1, 1000, 256 );
    cubeCamera1.renderTarget.texture.minFilter = THREE.LinearMipMapLinearFilter;
    cubeCamera1.name = "cubeCamera1";
    // scene.add( cubeCamera1 );

    let MirrorMaterial = new THREE.MeshBasicMaterial( {
        envMap: cubeCamera1.renderTarget.texture,
        side: THREE.DoubleSide,
        shading: THREE.SmoothShading,
        //reflectivity:1,
        //refractionRatio:1,
    } );

    MirrorMaterial.castShadow=true;

    // var aL = new THREE.AmbientLight( "#162033" );
    // scene.add( aL );


    var pointColor = "#ffffff";
    var spotLight = new THREE.SpotLight( pointColor );
    spotLight.position.set( 0, 100, 25 );
    spotLight.castShadow = true;
    spotLight.intensity=3;
    // spotLight.target = THREE.Vector3(0,0,0);
    scene.add( spotLight );


    //
    // var gridXZ = new THREE.GridHelper( 100, 10 );
    // gridXZ.setColors( new THREE.Color( 0xff0000 ), new THREE.Color( 0xffffff ) );
    // scene.add( gridXZ );


    // position and point the camera to the center of the scene
    camera.position.x = 0;
    camera.position.y = 10;
    camera.position.z = -30;
    camera.lookAt( new THREE.Vector3( 0, 0, 0 ) );


    let clock = new THREE.Clock();
    clock.start();



    //VARIABLES HOLDING RESULTS OF EACH RENDERING ACTION
    let roundedBoxResult = null;

    let roundedBox_cubeCamera_group = new THREE.Group();
    roundedBox_cubeCamera_group.name = "roundedBox_cubeCamera_group";

    roundedBox_cubeCamera_group.add( cubeCamera1 );
    scene.add( roundedBox_cubeCamera_group );

    let spGroup = null;


    let curvedSurfaceMesh = null;

   // let curvedPath = new THREE.CurvePath();
    let curvePointsGroup = null;
    let curvePointsArray = [];
    // the mesh
    let convexHullMesh = null;

    let TriMeshPoints = [];


    let circleGroup = null;
    let Xangle = Math.PI; //cos
    let Zangle = 0; //sin
    let initCirclePos = 0;


    let isCapturingClicks = false;

    //////////////////////////////////////////////


    let pointCapturer = function ( evt ) {


        let X, Y, Z;
        let DepthRatio = 2.2;

        let canvas = webGLRenderer.domElement;


        X = -1.0 + 2.0 * evt.clientX / canvas.width;

        Y = 1.0 - 2.0 * evt.clientY / canvas.height;

        X = X * 60;
        Y = Y * 60;


        X = Math.floor( X );
        Y = Math.floor( Y );


        Z = Math.floor( (X > Y) ? X * DepthRatio : Y * DepthRatio );


        console.log( "capturedPoints: " + -X + ", " + Y + ", " + Z );


        TriMeshPoints.push( new THREE.Vector3( -X + Math.sign( -X ) * 19,
            Y + Math.sign( Y ) * 19,
            Z + Math.sign( Z ) * 19 ) );


        if ( spGroup === null ) {
            spGroup = new THREE.Object3D();


        } else {
            // scene.remove( spGroup );

        }

        let Mesh2DPoints = [];

        for ( let elem of TriMeshPoints ) {
            Mesh2DPoints.push( new THREE.Vector3( elem.x / 1.5, elem.y / 1.5, 0 ) );
        }

        let material = new THREE.MeshBasicMaterial( { color: "#ff0e05", transparent: false } );

        let spGeom = new THREE.SphereGeometry( 1.7 );
        let spMesh = new THREE.Mesh( spGeom, material );
        spMesh.position.copy( Mesh2DPoints[Mesh2DPoints.length - 1] );
        spGroup.add( spMesh );

        // add the points as a group to the scene
        scene.remove( (spGeom) );
        scene.add( spGroup );

    };


    console.log( "SCENE CHILD LENGTH: " + scene.children.length );


    let Xuv =0,Yuv=0,Zuv=0;

    function drawCurvedSurface(){
        "use strict";

        scene.remove( curvedSurfaceMesh );
        curvedSurfaceMesh.traverse(object => {
            if ( object instanceof THREE.Mesh){
                object.geometry.dispose();
            }
        });


        radialWave = function ( u, v ) {
            var r = 100;

            // Xuv %= 3;
            // Yuv %= 3;
            // Zuv %= 3;
            //(Xuv+=0.005)*
            //(Yuv += 0.005) *

            var x =  Math.sin( u + (Zuv += 0.0005)) * r;
            var z = Math.sin( v / 2 ) * 2 * r;
            var y = (Math.sin( u * 4 * Math.PI ) + Math.cos( v * 2 * Math.PI )) * 2.8;

            return new THREE.Vector3( x, y, z );
        };


        let geo = new THREE.ParametricGeometry( radialWave, 120, 120, false );
        curvedSurfaceMesh = createPhongMesh( geo );
        curvedSurfaceMesh.name = "curvedSurfaceMesh";

        // for ( let prop in geo ) {
        //     console.log( prop )
        // }
       // this.Volume = VolumeOfMesh( geo );
        scene.add( curvedSurfaceMesh );


    }

    const controls = new function () {

        this.BoxHeight = 8;
        this.BoxWidth = 10;
        this.DepthRatio = 1.2;
        this.Vertrounded = 1;
        this.Horizrounded = -1;
        this.translateBox_X = 0;

        this.translateMesh_Y = 0;

        this.TravelCircles = false;
        this.translateMesh_X = 0;

        this.Volume = 0;
        this.drawSurface = function () {


            // if ( curvedSurfaceMesh ) {
            //     scene.add( curvedSurfaceMesh );
            // }

            radialWave = function ( u, v ) {
                var r = 100;

                var x = Math.sin( u ) * r;
                var z = Math.sin( v / 2 ) * 2 * r;
                var y = (Math.sin( u * 4 * Math.PI ) + Math.cos( v * 2 * Math.PI )) * 2.8;

                return new THREE.Vector3( x, y, z );
            };

            // for ( let i = 0; i < 9; i++ ) {
            //     curvedPath.add( new THREE.CubicBezierCurve3( curvePointsArray[4 * i - 1], curvePointsArray[4 * i + 1],
            //         curvePointsArray[4 * i + 2], curvePointsArray[4 * i + 3] ) );
            // }

            let geo = new THREE.ParametricGeometry( radialWave, 120, 120, false );
            curvedSurfaceMesh = createPhongMesh( geo);
            curvedSurfaceMesh.name = "curvedSurfaceMesh";

            for ( let prop in curvedSurfaceMesh ){
                console.log(prop)
            }
            this.Volume = VolumeOfMesh( geo );
            scene.add( curvedSurfaceMesh );


        };

        this.StopCapturingClicks = function () {

            if ( CURRENT_ACTION !== "triMesh" ) {
                CURRENT_ACTION = "triMesh";
            }


            $( "body" ).off( "click", "#CANVAS", pointCapturer );
            isCapturingClicks = false;


        };

        this.CaptureMouseClicks = function () {
            "use strict";


            console.log( "CURRENT ACTION: " + CURRENT_ACTION );

            if ( CURRENT_ACTION !== "triMesh" ) {
                CURRENT_ACTION = "triMesh";


            }


            $( "body" ).on( "click", "#CANVAS", pointCapturer );
            isCapturingClicks = true;


        };

        this.initializeBox = function () {
            "use strict";

            console.log( "CURRENT ACTION: " + CURRENT_ACTION );


            if ( CURRENT_ACTION !== "roundedBox" ) {
                CURRENT_ACTION = "roundedBox";

                if ( !roundedBoxResult ) {
                    drawRoundedBox( 0, 0, 10, 8, 1, -1, 1 );
                    roundedBox_cubeCamera_group.position.set( 0, 0, -5 );
                }

                $( "body" ).off( "click", "#CANVAS", pointCapturer );


            }


        };

        this.drawMesh = function () {
            "use strict";

            if ( !TriMeshPoints || TriMeshPoints.length === 0 ) {
                return;
            }


            $( "body" ).off( "click", "#CANVAS", pointCapturer );
            spGroup.remove( convexHullMesh );


            let hullGeometry = new THREE.ConvexGeometry( TriMeshPoints );


            let convexHullMeshGeo = createMesh( hullGeometry );

            let convexHullMeshBSP = new ThreeBSP( convexHullMeshGeo );


            console.log( "GEOM: " + hullGeometry );
            console.log( "GEOM FACES: " + hullGeometry.faces );
            // console.log( "MESH.GEOM FACES: " + convexHullMesh.geometry.faces );

            for ( let f = 0, f1 = hullGeometry.faces.length; f < f1; f++ ) {

                let face = hullGeometry.faces[f];

                let centroid = new THREE.Vector3( 0, 0, 0 );

                centroid.add( hullGeometry.vertices[face.a] );
                centroid.add( hullGeometry.vertices[face.b] );
                centroid.add( hullGeometry.vertices[face.c] );
                centroid.divideScalar( 3 );

                //only add sphere to face if its big enough and not tiny
                let vecA, vecB, vecC;
                vecA = hullGeometry.vertices[face.a];
                vecB = hullGeometry.vertices[face.b];
                vecC = hullGeometry.vertices[face.c];

                let X0 = centroid.clone();

                let minDist = Math.POSITIVE_INFINITY;

                let currDist = 0;

                let temp1 = new THREE.Vector3( 0, 0, 0 );
                let temp2 = new THREE.Vector3( 0, 0, 0 );

                currDist = ((temp1.subVectors( X0, vecA ).cross( temp2.subVectors( X0, vecB ) )).length());
                currDist /= new THREE.Vector3( 0, 0, 0 ).subVectors( vecA, vecB ).length();

                console.log( "CURR DIST: " + currDist );

                if ( currDist < minDist ) {
                    minDist = currDist;
                }

                temp1 = new THREE.Vector3( 0, 0, 0 );
                temp2 = new THREE.Vector3( 0, 0, 0 );

                currDist = ((temp1.subVectors( X0, vecA ).cross( temp2.subVectors( X0, vecC ) )).length());
                currDist /= new THREE.Vector3( 0, 0, 0 ).subVectors( vecA, vecC ).length();


                console.log( "CURR DIST: " + currDist );


                if ( currDist < minDist ) {
                    minDist = currDist;
                }

                temp1 = new THREE.Vector3( 0, 0, 0 );
                temp2 = new THREE.Vector3( 0, 0, 0 );

                currDist = ((temp1.subVectors( X0, vecB ).cross( temp2.subVectors( X0, vecC ) )).length());
                currDist /= new THREE.Vector3( 0, 0, 0 ).subVectors( vecB, vecC ).length();
                console.log( "CURR DIST: " + currDist );

                if ( currDist < minDist ) {
                    minDist = currDist;
                }


                if ( minDist < 25 ) {
                    continue;
                }


                let faceSphereGeo = createMesh( new THREE.SphereGeometry( 4, 15, 15 ) );
                faceSphereGeo.position.set( centroid.x, centroid.y, centroid.z );

                let faceSphereGeoBSP = new ThreeBSP( faceSphereGeo );


                convexHullMeshBSP = convexHullMeshBSP.union( faceSphereGeoBSP );


                //convexHullMeshBSP = convexHullMeshBSP.subtract( faceSphereGeoBSP );


                // let arrow = new THREE.ArrowHelper(face.normal,centroid,2,0x3333FF, 0.5, 0.5);
                //
                // convexHullMesh.add( arrow );

            }

            const meshMaterial = new THREE.MeshNormalMaterial();
            meshMaterial.side = THREE.DoubleSide;

            meshMaterial.shading = THREE.FlatShading;

            convexHullMesh = convexHullMeshBSP.toMesh( meshMaterial );
            convexHullMesh.name = "convexHullMesh";
            convexHullMesh.castShadow=true;

            convexHullMesh.scale.set( 1.4, 1.2, 2.1 );
            convexHullMesh.traverse( object => {
                if ( object instanceof THREE.Mesh ) {
                    object.scale.set( 1.4, 1.2, 2.1 )
                }

            } );

            convexHullMesh.position.set( 0, 5, 8 );


            scene.remove( spGroup );
            scene.remove( convexHullMesh );
            scene.add( convexHullMesh );

            // spGroup.traverse(object => {
            //    if ( object instanceof THREE.Mesh){
            //        object.scale.set( 1.6, 1.2, 2 );
            //    }
            // });


        };
        this.clearScene = function () {
            "use strict";

            CURRENT_ACTION = null;

            this.RotateResult = false;
            this.TravelCircles = false;


            roundedBox_cubeCamera_group.position.set( 0, 0, -5 );

            if ( roundedBoxResult ) {
                roundedBox_cubeCamera_group.remove( roundedBoxResult );
                roundedBoxResult.geometry.dispose();
                roundedBoxResult = null;
            }

            $( "body" ).off( "click", "#CANVAS", pointCapturer );

            if ( convexHullMesh ) {
                scene.remove( convexHullMesh );
                convexHullMesh.traverse( object => {
                    if ( object instanceof THREE.Mesh ) {
                        object.geometry.dispose();
                    }
                } );
                convexHullMesh = null;

            }

            if ( spGroup ) {
                scene.remove( spGroup );
                spGroup.traverse( object => {
                    if ( object instanceof THREE.Mesh ) {
                        object.geometry.dispose();
                    }
                } );
                spGroup = null;

            }

            if ( circleGroup ) {
                scene.remove( circleGroup );
                circleGroup.traverse( object => {
                    if ( object instanceof THREE.Mesh ) {
                        object.geometry.dispose();
                    }
                } );
                circleGroup = null;
            }


            //


            if (curvedSurfaceMesh) {
                scene.remove( curvedSurfaceMesh );
                curvedSurfaceMesh.traverse( object => {
                    if ( object instanceof THREE.Mesh ) {
                        object.geometry.dispose();
                    }
                } );
                curvedSurfaceMesh = null;
            }

            TriMeshPoints = [];

            while ( scene.children.length > 4 ) {
                scene.children.pop();
            }

        };


        this.currentCamera = "Perspective";
        this.SwitchCamera = function () {
            if ( camera instanceof THREE.PerspectiveCamera ) {
                camera = new THREE.OrthographicCamera( window.innerWidth / -
                        16, window.innerWidth / 16, window.innerHeight / 16,
                    window.innerHeight / -16, -200, 500 );
                camera.position.x = 0;
                camera.position.y = 10;
                camera.position.z = -25;

                //camera.lookAt( new THREE.Vector3( 0, 0, 0 ) );
                camera.lookAt( scene.position );
                Orbitcontrols = new THREE.OrbitControls( camera, webGLRenderer.domElement );
                this.currentCamera = "Orthographic";
            } else {
                camera = new THREE.PerspectiveCamera( 80, window.innerWidth /
                    window.innerHeight, 0.1, 1000 );
                camera.position.x = 0;
                camera.position.y = 10;
                camera.position.z = -25;
                //camera.lookAt( new THREE.Vector3( 0, 0, 0 ) );
                camera.lookAt( scene.position );
                Orbitcontrols = new THREE.OrbitControls( camera, webGLRenderer.domElement );
                this.currentCamera = "Perspective";
            }
        };

        this.RotateResult = false;


    };

    let debouncedDraw = debounce( drawRoundedBox, 1500, false );


    const gui = new dat.GUI();
    const guiBOX = gui.addFolder( "Rounded Box" );

    guiBOX.add( controls, "initializeBox" );

    guiBOX.add( controls, "translateBox_X", -50, 50 ).onChange( function () {
        console.log( "inside box translate X" );
        if ( roundedBoxResult === null ) {


            return;
        }
        console.log( "roundedBoxResult is : " + roundedBoxResult );
        roundedBox_cubeCamera_group.position.x = controls.translateBox_X;
        camera.lookAt( roundedBox_cubeCamera_group.position );

    } );

    guiBOX.add( controls, "BoxWidth", 5, 15 ).onChange( function () {

        if ( CURRENT_ACTION !== "roundedBox" ) {
            CURRENT_ACTION = "roundedBox";
            if ( !roundedBoxResult ) {
                controls.initializeBox();
            }
        }

        debouncedDraw( 0, 0, controls.BoxWidth, controls.BoxHeight, controls.Vertrounded, controls.Horizrounded, controls.DepthRatio );
    } );
    guiBOX.add( controls, "BoxHeight", 5, 10 ).onChange( function () {

        if ( CURRENT_ACTION !== "roundedBox" ) {
            CURRENT_ACTION = "roundedBox";
            if ( !roundedBoxResult ) {
                controls.initializeBox();
            }
        }
        debouncedDraw( 0, 0, controls.BoxWidth, controls.BoxHeight, controls.Vertrounded, controls.Horizrounded, controls.DepthRatio );
    } );


    guiBOX.add( controls, "DepthRatio", 0.5, 2 ).onChange( function () {

        if ( CURRENT_ACTION !== "roundedBox" ) {
            CURRENT_ACTION = "roundedBox";
            if ( !roundedBoxResult ) {
                controls.initializeBox();
            }
        }
        debouncedDraw( 0, 0, controls.BoxWidth, controls.BoxHeight, controls.Vertrounded, controls.Horizrounded, controls.DepthRatio );
    } );

    guiBOX.add( controls, "Vertrounded", -1, 1 ).onChange( function () {

        if ( CURRENT_ACTION !== "roundedBox" ) {
            CURRENT_ACTION = "roundedBox";
            if ( !roundedBoxResult ) {
                controls.initializeBox();
            }
        }
        debouncedDraw( 0, 0, controls.BoxWidth, controls.BoxHeight, controls.Vertrounded, controls.Horizrounded, controls.DepthRatio );
    } );
    guiBOX.add( controls, "Horizrounded", -1, 1 ).onChange( function () {
        if ( CURRENT_ACTION !== "roundedBox" ) {
            CURRENT_ACTION = "roundedBox";
            if ( !roundedBoxResult ) {
                controls.initializeBox();
            }
        }

        debouncedDraw( 0, 0, controls.BoxWidth, controls.BoxHeight, controls.Vertrounded, controls.Horizrounded, controls.DepthRatio );
    } );

    let guiTriMesh = gui.addFolder( "Triangle Mesh" );

    guiTriMesh.add( controls, "CaptureMouseClicks" );
    guiTriMesh.add( controls, "StopCapturingClicks" );
    guiTriMesh.add( controls, "drawMesh" );
    guiTriMesh.add( controls, "translateMesh_X", -100, 100 ).onChange( function () {
        if ( convexHullMesh === null ) {
            return;
        }
        convexHullMesh.position.x = (controls.translateMesh_X);
    } );
    guiTriMesh.add( controls, "translateMesh_Y", -150, 150 ).onChange( function () {
        if ( convexHullMesh === null ) {
            return;
        }
        convexHullMesh.position.y = (controls.translateMesh_Y);
    } );

    let guiSurfaceMesh = gui.addFolder( "3D Surface" );
    guiSurfaceMesh.add( controls, "drawSurface" );
    guiSurfaceMesh.add( controls, "Volume" ).listen();

    gui.add( controls, "clearScene" );
    gui.add( controls, "RotateResult" ).listen();
    gui.add( controls, "TravelCircles" ).listen();
    gui.add( controls, 'SwitchCamera' );
    gui.add( controls, 'currentCamera' ).listen();


    drawRoundedBox( 0, 0, 10, 8, 1, -1, 1 );

    // generatePoints();


    render();


    /**
     * @return {number}
     */
    function SignedVolumeOfTriangle( p1, p2, p3 ) {
        let v321 = p3.x * p2.y * p1.z;
        let v231 = p2.x * p3.y * p1.z;
        let v312 = p3.x * p1.y * p2.z;
        let v132 = p1.x * p3.y * p2.z;
        let v213 = p2.x * p1.y * p3.z;
        let v123 = p1.x * p2.y * p3.z;
        return (1.0 / 6.0) * (-v321 + v231 + v312 - v132 - v213 + v123);
    }


    /**
     * @return {number}
     */
    function VolumeOfMesh( mesh ) {

        let TotalVolume = 0;

        for ( let f = 0, f1 = mesh.faces.length; f < f1; f++ ) {

            let face = mesh.faces[f];

            TotalVolume += SignedVolumeOfTriangle( mesh.vertices[face.a],
                mesh.vertices[face.b],
                mesh.vertices[face.c] );
        }


        return Math.abs( TotalVolume );
    }

    function generatePoints( segments, phiStart, phiLength ) {

        let height = 5;
        var count = 40;
        for ( let i = 0; i < count; i++ ) {
            curvePointsArray.push( new THREE.Vector3( (Math.sin( i * 0.2 ) + Math.cos( i * 0.3 )) * height + 12,
                0,
                +( i - count ) + count / 2 ) );
        }

        curvePointsGroup = new THREE.Object3D();
        let material = new THREE.MeshBasicMaterial( { color: 0xff0000, transparent: false } );
        curvePointsArray.forEach( function ( point ) {

            let spGeom = new THREE.SphereGeometry( 0.2 );
            let spMesh = new THREE.Mesh( spGeom, material );
            spMesh.position.copy( point );
            curvePointsGroup.add( spMesh );
        } );
        // add the points as a group to the scene
        scene.add( curvePointsGroup );

    }


    function createMesh( geom ) {

        const wireFrameMat = new THREE.MeshBasicMaterial( {
            shading: THREE.SmoothShading,
            opacity: 0.5,
            wireframeLinewidth: 0.5
        } );
        wireFrameMat.wireframe = true;

        // create a multimaterial
        return new THREE.Mesh( geom, wireFrameMat );
    }

    function createPhongMesh( geom ) {
        //geom.applyMatrix( new THREE.Matrix4().makeTranslation( -25, 0, -25 ) );
        // assign two materials
//            var meshMaterial = new THREE.MeshLambertMaterial({color: 0xff5555});
        //var meshMaterial = new THREE.MeshNormalMaterial();
        var meshMaterial = new THREE.MeshPhongMaterial( {
            specular: "#4b263c",
            color: "#395dff",
            shininess: 40,
        } );
        meshMaterial.side = THREE.DoubleSide;
        // create a multimaterial
        var plane = THREE.SceneUtils.createMultiMaterialObject( geom, [meshMaterial] );

        return plane;
    }

    function createMultiMatMesh( geom ) {
        "use strict";

        let meshMaterial = new THREE.MeshPhongMaterial( {
            color: "#343EFF", shininess: 100,
            reflectivity: 56,
            emissive: "#000000",
            specular: "#000000",
            opacity: 0.6,
            ambient: "#d5ff0a",
            shading: THREE.FlatShading,

        } );


        meshMaterial.side = THREE.DoubleSide;

        let wireframeMaterial = new THREE.MeshBasicMaterial( {
            color: "#000000",
            wireframe: true,
            Wireframelinewidth: 5
        } );
        let materials = [meshMaterial, wireframeMaterial];


        return THREE.SceneUtils.createMultiMaterialObject( geom, materials );


    }


    function render() {
        stats.update();


        if ( spGroup && spGroup.name !== "spGroup" ) {
            spGroup.name = "spGroup";
        }

        if ( roundedBoxResult && roundedBoxResult.name !== "roundedBoxResult" ) {
            roundedBoxResult.name = "roundedBoxResult";
        }


        if ( controls.RotateResult && roundedBoxResult ) {
            roundedBox_cubeCamera_group.rotation.y += 0.004;
            roundedBox_cubeCamera_group.rotation.x += 0.004;
            roundedBox_cubeCamera_group.rotation.z -= 0.005;


            let delta = clock.getElapsedTime();
            camera.position.x = 20 * Math.sin( delta / 4 );
            //camera.position.y = 20 * Math.cos( delta/2 );
            camera.position.z = 20 * Math.cos( delta / 4 );

            // var relativeCameraOffset = new THREE.Vector3( 0, 5, -20 );
            //
            // var cameraOffset = relativeCameraOffset.applyMatrix4( roundedBoxResult.matrixWorld );
            //
            // camera.position.x = (cameraOffset.x+ 0*20 * Math.sin( delta / 2 ));
            // camera.position.y = (cameraOffset.y);
            // camera.position.z = (cameraOffset.z+ 0*20 * Math.cos( delta / 2 ));

            camera.lookAt( roundedBox_cubeCamera_group.position );

        }

        if ( controls.RotateResult && convexHullMesh ) {
            convexHullMesh.rotation.x += 0.04;
            convexHullMesh.rotation.y += 0.04;
            convexHullMesh.rotation.z += 0.04;
        }

        if ( curvedSurfaceMesh && scene.getObjectByName( "curvedSurfaceMesh" )){
           drawCurvedSurface();
        }


        if ( controls.RotateResult && curvedSurfaceMesh && scene.getObjectByName( "curvedSurfaceMesh" ) ) {
            curvedSurfaceMesh.rotation.x += 0.04;
            curvedSurfaceMesh.rotation.y += 0.04;
            curvedSurfaceMesh.rotation.z += 0.04;
        }


        if ( initCirclePos >= 50 && !controls.TravelCircles ) {
            initCirclePos = 0;
        }

        if ( controls.TravelCircles ) {

            if ( circleGroup === null ) {
                circleGroup = new THREE.Group();
                scene.add( circleGroup );
            }

            if ( roundedBoxResult && !circleGroup.getObjectByName( "roundedBoxResult" ) ) {
                circleGroup.add( roundedBoxResult );
            }

            if ( spGroup && !circleGroup.getObjectByName( "convexHullMesh" ) ) {
                circleGroup.add( convexHullMesh );
            }


            if ( initCirclePos < 25 ) {
                circleGroup.position.x = (initCirclePos += 0.8);
            } else {

                const radius = 50;
                circleGroup.position.z = radius / (1.5) * Math.sin( Zangle += 0.05 );
                circleGroup.position.x = -radius * Math.cos( Xangle += 0.05 );

                // let relativeCameraOffset = new THREE.Vector3( 0, 5, -20 );
                //
                // let cameraOffset = relativeCameraOffset.applyMatrix4(roundedBoxResult.matrixWorld );
                //
                // camera.position.x = (cameraOffset.x  );
                // camera.position.y = (cameraOffset.y);
                // camera.position.z = (cameraOffset.z );

                //camera.lookAt( circleGroup.position );


            }

        }


        // switch ( controls.SwitchCamera ) {
        //     case "Perspective":
        //         camera = new THREE.PerspectiveCamera( 55, window.innerWidth / window.innerHeight, 0.1, 1000 );
        //         camera.position.x = 0;
        //         camera.position.y = 10;
        //         camera.position.z = -25;
        //         //camera.lookAt( new THREE.Vector3( 0, 0, 0 ) );
        //         camera.lookAt( scene.position );
        //
        //
        //         break;
        //     case "Orthographic":
        //         camera = new THREE.OrthographicCamera( window.innerWidth / -16, window.innerWidth / 16, window.innerHeight / 16, window.innerHeight / -16, -200, 500 );
        //         camera.position.x = 0;
        //         camera.position.y = 10;
        //         camera.position.z = -25;
        //         //camera.lookAt( new THREE.Vector3( 0, 0, 0 ) );
        //         camera.lookAt( scene.position );
        //
        //         break;
        // }

        if ( roundedBoxResult ) {

            roundedBoxResult.visible = false;

            cubeCamera1.position.copy( roundedBoxResult.position );
            cubeCamera1.updateCubeMap( webGLRenderer, scene );

            roundedBoxResult.visible = true;
        }


        // if (!(controls.RotateResult && roundedBoxResult)) {
        //     camera.lookAt( scene.position );
        // }

        // render using requestAnimationFrame
        requestAnimationFrame( render );
        webGLRenderer.render( scene, camera );
    }

    function initStats() {

        const stats = new Stats();
        stats.setMode( 0 ); // 0: fps, 1: ms

        // Align top-left
        stats.domElement.style.position = 'absolute';
        stats.domElement.style.left = '0px';
        stats.domElement.style.top = '0px';

        document.getElementById( "Stats-output" ).appendChild( stats.domElement );

        return stats;
    }


    function drawRoundedBox( Xs, Ys, Xe, Ye, Vr, Hr, DepthRatio ) {



        if ( roundedBoxResult ) {
            roundedBox_cubeCamera_group.remove( roundedBoxResult );
            roundedBoxResult.traverse(object => {
                "use strict";
               if ( object instanceof  THREE.Mesh){
                   object.geometry.dispose();
               }

            });
        }

        let Width = Xe - Xs;
        let Height = Ye - Ys;
        let Depth = Width * DepthRatio;

        let Vr_ = (Vr < -0.6) ? 0.7 : Math.abs( Vr );
        let Hr_ = (Hr < -0.6) ? 0.7 : Math.abs( Hr );


        const HsphereR = createMesh( new THREE.SphereGeometry( Hr_ * Math.min( Depth, Height ) / 2.5, 30, 30 ) );
        HsphereR.position.set( Width / (2), 0, 0 );

        const HsphereL = createMesh( new THREE.SphereGeometry( Hr_ * Math.min( Depth, Height ) / 2.5, 30, 30 ) );
        HsphereL.position.set( -Width / 2, 0, 0 );


        const HsphereF = createMesh( new THREE.SphereGeometry( Hr_ * Math.min( Width, Height ) / 2.5, 30, 30 ) );
        HsphereF.position.set( 0, 0, Depth / 2 );

        const HsphereBack = createMesh( new THREE.SphereGeometry( Hr_ * Math.min( Width, Height ) / 2.5, 30, 30 ) );
        HsphereBack.position.set( 0, 0, -Depth / 2 );


        const VsphereT = createMesh( new THREE.SphereGeometry( Vr_ * Math.min( Width, Depth ) / 2.5, 30, 30 ) );
        VsphereT.position.set( 0, Height / 2, 0 );

        const VsphereB = createMesh( new THREE.SphereGeometry( Vr_ * Math.min( Width, Depth ) / 2.5, 30, 30 ) );
        VsphereB.position.set( 0, -Height / 2, 0 );


        const cubeGEO = new THREE.BoxGeometry( Width, Height, Depth );
        const cube = createMesh( cubeGEO );
        cube.position.set( 0, 0, 0 );


        const HsphereLBSP = new ThreeBSP( HsphereL );
        const HsphereRBSP = new ThreeBSP( HsphereR );

        const HsphereFBSP = new ThreeBSP( HsphereF );
        const HsphereBackBSP = new ThreeBSP( HsphereBack );


        const VsphereTBSP = new ThreeBSP( VsphereT );
        const VsphereBBSP = new ThreeBSP( VsphereB );
        const cube2BSP = new ThreeBSP( cube );

        let resultBSP = null;


        if ( Hr !== 0 ) {
            if ( Hr > 0 ) {

                resultBSP = cube2BSP.union( HsphereLBSP );
                resultBSP = resultBSP.union( HsphereRBSP );
                resultBSP = resultBSP.union( HsphereBackBSP );
                resultBSP = resultBSP.union( HsphereFBSP );


            } else {
                let result1;
                result1 = cube2BSP.subtract( HsphereLBSP );
                result1 = result1.subtract( HsphereRBSP );
                result1 = result1.subtract( HsphereFBSP );
                result1 = result1.subtract( HsphereBackBSP );


                resultBSP = result1;

            }
        }

        if ( !resultBSP ) {
            resultBSP = cube2BSP;
        }

        if ( Vr !== 0 ) {
            if ( Vr > 0 ) {
                resultBSP = resultBSP.union( VsphereTBSP );
                resultBSP = resultBSP.union( VsphereBBSP );

            } else {

                let result1;

                result1 = resultBSP.subtract( VsphereBBSP );
                result1 = result1.subtract( VsphereTBSP );
                resultBSP = result1;

            }


        }
        //
        // const meshMaterial = new THREE.MeshNormalMaterial();
        // meshMaterial.side = THREE.DoubleSide;
        //
        // meshMaterial.shading = THREE.FlatShading;

        roundedBoxResult = resultBSP.toMesh( MirrorMaterial );
        roundedBoxResult.geometry.computeFaceNormals();
        roundedBoxResult.geometry.computeVertexNormals();
        roundedBoxResult.castShadow=true;

       roundedBox_cubeCamera_group.add( roundedBoxResult );


    }


}

// var urls = [
//     'img/cubemap/singapore/right.png',
//     'img/cubemap/singapore/left.png',
//     'img/cubemap/singapore/top.png',
//     'img/cubemap/singapore/bottom.png',
//     'img/cubemap/singapore/front.png',
//     'img/cubemap/singapore/back.png'
// ];

let textureLoader = new THREE.TextureLoader();
textureLoader.load( 'img/cityTexture.jpg', function ( texture ) {
    texture.mapping = THREE.UVMapping;

    init( texture );
} );

// window.onload = init(texture);


function debounce( func, wait, immediate ) {
    var timeout;
    return function () {
        var context = this, args = arguments;
        var later = function () {
            timeout = null;
            if ( !immediate ) func.apply( context, args );
        };
        var callNow = immediate && !timeout;
        clearTimeout( timeout );
        timeout = setTimeout( later, wait );
        if ( callNow ) func.apply( context, args );
    };
}


function getCenterPoint( mesh ) {
    let middle = new THREE.Vector3();
    let geometry = mesh.geometry;

    geometry.computeBoundingBox();

    middle.x = (geometry.boundingBox.max.x + geometry.boundingBox.min.x) / 2;
    middle.y = (geometry.boundingBox.max.y + geometry.boundingBox.min.y) / 2;
    middle.z = (geometry.boundingBox.max.z + geometry.boundingBox.min.z) / 2;

    mesh.localToWorld( middle );
    return middle;
}
