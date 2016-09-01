(function(){
    'use strict';

    angular.module('lh.commons.storage')
    .factory('localStorage', LocalStorage);

    LocalStorage.$inject = ['$window', '$q', 'lhJSON'];
    function LocalStorage($window, $q, lhJSON) {
        return {
            set: set,
            get: get,
            setObject: setObject,
            getObject: getObject
        };

        function set(key, value) {
            return save(key, value).then(function(){ return value; });
        }

        function get(key, defaultValue) {
            return $q.when(read(key))
                    .catch(function(){ return defaultValue; });
        }

        function setObject(key, value) {
            return save(key, lhJSON.stringify(value)).then(function(){ return value; });
        }

        function getObject(key, defaultValue) {
            return $q.when(read(key))
                    .then(function(val){
                        return lhJSON.parse(val);
                    })
                    .catch(function(){
                        return defaultValue;
                    });
        }

        function read(key){
            if(typeof cordova === "undefined"){
                return $window.localStorage[key] ?
                            $q.when($window.localStorage[key]) :
                            $q.reject();
            }else{
                return readFromFile(key);
            }
        }
        function save(key, value){
            if(typeof cordova === "undefined"){
                $window.localStorage[key] = value;
                return $q.when($window.localStorage[key]);
            }else{
                return saveToFile(key, value);
            }
        }
        function saveToFile(key, value){
            var defer = $q.defer();
            var fileName = key;
            window.resolveLocalFileSystemURL(cordova.file.dataDirectory, function (directoryEntry) {
                directoryEntry.getFile(fileName, { create: true }, function (fileEntry) {
                    fileEntry.createWriter(function (fileWriter) {
                        fileWriter.onwriteend = function (e) {
                            console.log('Write of file "' + fileName + '"" completed.');
                            defer.resolve(e);
                        };

                        fileWriter.onerror = function (e) {
                            console.log('Write failed: ' + e.toString());
                            defer.reject(e);
                        };
                        var blob = new Blob([value], { type: 'text/plain' });
                        fileWriter.write(blob);
                    }, errorHandler.bind(null, fileName, defer));
                }, errorHandler.bind(null, fileName, defer));
            }, errorHandler.bind(null, fileName, defer));
            return defer.promise;
        }
        function errorHandler(fileName, defer, e) {
            var msg = '';

            switch (e.code) {
                case FileError.QUOTA_EXCEEDED_ERR:
                    msg = 'Storage quota exceeded';
                    break;
                case FileError.NOT_FOUND_ERR:
                    msg = 'File not found';
                    break;
                case FileError.SECURITY_ERR:
                    msg = 'Security error';
                    break;
                case FileError.INVALID_MODIFICATION_ERR:
                    msg = 'Invalid modification';
                    break;
                case FileError.INVALID_STATE_ERR:
                    msg = 'Invalid state';
                    break;
                default:
                    msg = 'Unknown error';
                    break;
            };
            console.log('Error (' + fileName + '): ' + msg);
            defer.reject(e);
        }
        function readFromFile(key){
            var defer = $q.defer();
            var fileName = key;
            var pathToFile = cordova.file.dataDirectory + fileName;
            window.resolveLocalFileSystemURL(pathToFile, function (fileEntry) {
                fileEntry.file(function (file) {
                    var reader = new FileReader();

                    reader.onloadend = function (e) {
                        console.log(this.result);
                        defer.resolve(this.result);
                    };
                    reader.readAsText(file);
                }, errorHandler.bind(null, fileName, defer));
            }, errorHandler.bind(null, fileName, defer));
            return defer.promise;
        }
    }
})();
