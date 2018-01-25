var v8 = require('v8');

module.exports = function(pmx) {

    if (typeof v8.getHeapSpaceStatistics === "function") {

        var data = v8.getHeapSpaceStatistics();

        for (var i = 0; i < data.length; i++) {
            var item = data[i];

            if (item.space_name === 'new_space') {

                pmx.probe().metric({
                    name: 'New space used size',
                    value: function () {
                        return item.space_used_size;
                    }
                });
            }

            if (item.space_name === 'old_space') {
                pmx.probe().metric({
                    name: 'Old space used size',
                    value: function () {
                        return item.space_used_size;
                    }
                });
            }

            if (item.space_name === 'map_space') {
                pmx.probe().metric({
                    name: 'Map space used size',
                    value: function () {
                        return item.space_used_size;
                    }
                });
            }

            if (item.space_name === 'code_space') {
                pmx.probe().metric({
                    name: 'Code space used size',
                    value: function () {
                        return item.space_used_size;
                    }
                });
            }

            if (item.space_name === 'large_object_space') {
                pmx.probe().metric({
                    name: 'Large object space used size',
                    value: function () {
                        return item.space_used_size;
                    }
                });
            }
        }
    }
};
