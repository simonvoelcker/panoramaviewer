class PanoramaView {

    constructor(textureUrl) {
    	this.geometry = new THREE.SphereGeometry(500, 60, 40)
    	this.geometry.applyMatrix(new THREE.Matrix4().makeScale( -1, 1, 1 ))
    	this.mesh = new THREE.Mesh(this.geometry, null)
        this.selectedObjectId = null
    }

    loadTextures(url, oidUrl, onAllLoaded) {
        if (oidUrl == null) {
            this.texture = THREE.ImageUtils.loadTexture(url, THREE.UVMapping, onAllLoaded)
            this.oidTexture = null
            this.useMaterial(this.createSimpleTextureMaterial())
        } else {
            let numToLoad = 2
            let onOneLoaded = () => {
                numToLoad--
                if (numToLoad == 0) {
                    onAllLoaded()
                }
            }
            this.texture = THREE.ImageUtils.loadTexture(url, THREE.UVMapping, onOneLoaded)
            this.oidTexture = THREE.ImageUtils.loadTexture(oidUrl, THREE.UVMapping, onOneLoaded)
            this.useMaterial(this.createSimpleTextureMaterial())
        }
    }

    useMaterial(material) {
    	this.mesh.material = material
    }

    createSimpleTextureMaterial() {
    	return new THREE.MeshBasicMaterial({ map: this.texture })
    }

    createHighlightObjectMaterial(objectId) {
        let highlightColor = new THREE.Vector3(0.3, 0.3, 1.0)
        let highlightIntensity = 0.6

        return new THREE.ShaderMaterial({
            uniforms: {
                texture: { type: "t", value: this.texture },
                oidTexture: { type: "t", value: this.oidTexture },
                objectId: { type: "v3", value: objectId },
                highlight: { type: "v3", value: highlightColor },
                intensity: { type: "f", value: highlightIntensity }
            },
            attributes: {},
            vertexShader: document.getElementById('vertexShader').text,
            fragmentShader: document.getElementById('fragmentShader').text
        })
    }

    selectObject(objectId) {
        if (this.selectedObjectId == objectId) return

        if (objectId != null) {
            this.useMaterial(this.createHighlightObjectMaterial(objectId))
        } else {
            this.useMaterial(this.createSimpleTextureMaterial())
        }
        this.selectedObjectId = objectId
    }

    selectPoint(point) {

        if (this.oidTexture == null) return

        // let d be a non-normalized direction vector pointing at point
        let d = new THREE.Vector3().copy(point).sub(this.mesh.position)
        // calculate angles
        let angles = this.calculateAnglesFromDirection(d)

        let u = angles["azimuth"] / (2.0*Math.PI)
        let v = 0.5 - angles["altitude"] / Math.PI
        let c = this.getColorFromTexture(u, v, this.oidTexture)

        let oidVector = (c[3] == 255) ? new THREE.Vector3(c[0]/255.0, c[1]/255.0, c[2]/255.0) : null
        this.selectObject(oidVector)

        let oid = (c[3] == 255) ? c[0] << 16 | c[1] << 8 | c[2] : null
        return oid
    }

    // TODO cachedContext vs texture parameter. either remove parameter or cache using a dict
    // TODO also, time caching behavior
    getColorFromTexture(u, v, texture) {

        if (texture.image === undefined) return null

        if (this.cachedContext === undefined) {
            let canvas = document.createElement( 'canvas' )
            canvas.width = texture.image.width
            canvas.height = texture.image.height

            this.cachedContext = canvas.getContext( '2d' )
            this.cachedContext.drawImage( texture.image, 0, 0 )
        }

        let x = Math.round(texture.image.width * u)
        let y = Math.round(texture.image.height * v)
        let color = this.cachedContext.getImageData( x, y, 1, 1 ).data

        return color
    }

    calculateAnglesFromDirection(d) {
        // catch altitude special cases
        if (d.x == 0.0 && d.z == 0.0) {
        	if (d.y == 0.0) {
        		// null vector case: safe fallback
        		return { altitude: 0.0, azimuth: 0.0 }
        	} else if (d.y < 0.0) {
        		// again save fallback for azimuth
        		return { altitude: -Math.PI/2.0, azimuth: 0.0 }
        	} else {
        		// again save fallback for azimuth
        		return { altitude: +Math.PI/2.0, azimuth: 0.0 }
        	}
        }

        let altitude = Math.atan2(d.y, Math.sqrt(d.x*d.x + d.z*d.z))

        // catch azimuth special cases
        if (d.x == 0.0) {
        	if (d.z < 0.0) {
        		return { altitude: altitude, azimuth: -Math.PI/2.0 }
        	} else {
        		return { altitude: altitude, azimuth: +Math.PI/2.0 }
        	}
        }

        let azimuth = Math.atan2(d.z, d.x)			// outputs [-pipi]
        if (azimuth < 0.0) azimuth += 2*Math.PI	// map to [02pi]

    	return { altitude: altitude, azimuth: azimuth }
    }
}
