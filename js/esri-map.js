        // function updateCenter(newValue) {
        //     wrMap.center = { latitude: newValue.latitude, longitude: newValue.longitude };
        // }
        //
        // function updateExtent(newValue) {
        //     //      get the bounds of the map instead
        //     var min = [1,2];
        //     var max = [3,4];
        //     wrMap.extent = {
        //         minLng: min[0],
        //         minLat: min[1],
        //         maxLng: max[0],
        //         maxLat: max[1]
        //     };
        // }
        //
        // view.on('click', function handleViewClick(event) {
        //     wrMap.selectedPoint = event.mapPoint;
        //     view.graphics.remove(pinGraphic);
        //     pinGraphic = {
        //         symbol: pinSymbol,
        //         geometry: wrMap.selectedPoint
        //     };
        //     view.graphics.add(pinGraphic);
        //     $(wrMap).trigger('pickupChange');
        // });
        //
        // wrMap.animate = function animate(origin, dest, callback) {
        //     var startTime;
        //     var step = function animateFrame(timestamp) {
        //         var progress;
        //         var progressPct;
        //         var point;
        //         var deltaLat;
        //         var deltaLon;
        //         if (!startTime) startTime = timestamp;
        //         progress = timestamp - startTime;
        //         progressPct = Math.min(progress / 2000, 1);
        //         deltaLat = (dest.latitude - origin.latitude) * progressPct;
        //         deltaLon = (dest.longitude - origin.longitude) * progressPct;
        //         point = {
        //             longitude: origin.longitude + deltaLon,
        //             latitude: origin.latitude + deltaLat
        //         };
        //         view.graphics.remove(unicornGraphic);
        //         unicornGraphic = new Graphic({
        //             geometry: point,
        //             symbol: unicornSymbol
        //         });
        //         view.graphics.add(unicornGraphic);
        //         if (progressPct < 1) {
        //             requestAnimationFrame(step);
        //         } else {
        //             callback();
        //         }
        //     };
        //     requestAnimationFrame(step);
        // };
        //
        // wrMap.unsetLocation = function unsetLocation() {
        //     view.graphics.remove(pinGraphic);
        // };
