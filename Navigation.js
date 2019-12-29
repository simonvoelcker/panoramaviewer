function Navigation(setImageUrlsCallback, fishEyeCallback) {

    this.setImageUrls = setImageUrlsCallback;
    this.prevButton = document.getElementById('prev');
    this.currentText = document.getElementById('current');
    this.nextButton = document.getElementById('next');
    this.infoText = document.getElementById('infotext');

    // gotta hate js
    var navi = this;
    this.prevButton.addEventListener('click', function() {
        if (navi.imageIndex > 0) {
            navi.imageIndex--;
            navi.update();
        }
    });
    this.nextButton.addEventListener('click', function() {
        if (navi.imageIndex < navi.numImages()-1) {
            navi.imageIndex++;
            navi.update();
        }
    });
    $('#fisheye').on('click', function() {
        config['fish-eye-mode'] = !config['fish-eye-mode'];
        fishEyeCallback(config['fish-eye-mode'])
    });

    $('.dropdown-toggle').on('click', function() {
        navi.updateOptions();
    });

    this.imageIndex = 0;
    this.update();
    this.updateOptions();
}

Navigation.prototype.update = function() {
    this.currentText.innerHTML = '' + (this.imageIndex+1) + '/' + this.numImages();
    this.prevButton.style.opacity = this.imageIndex == 0 ? 0.5 : 1.0;
    this.nextButton.style.opacity = this.imageIndex == this.numImages()-1 ? 0.5 : 1.0;

    var imageConfig = config['images'][this.imageIndex];
    var urlPrefix = 'images/';
    this.setImageUrls(urlPrefix + imageConfig, null)
}

Navigation.prototype.updateOptions = function() {
    if (config['fish-eye-mode']) {
        $('#fisheye > .glyphicon').removeClass('glyphicon-unchecked');
        $('#fisheye > .glyphicon').addClass('glyphicon-check');
    } else {
        $('#fisheye > .glyphicon').addClass('glyphicon-unchecked');
        $('#fisheye > .glyphicon').removeClass('glyphicon-check');
    }
}

Navigation.prototype.numImages = function() {
    return config['images'].length;
}
