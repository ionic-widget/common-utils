angular.module('lh.commons.storage')
.service('localCacheStorage', LocalCacheStorage);

LocalCacheStorage.$inject = ['localStorage'];
function LocalCacheStorage(localStorage) {
    var cache = this;
    //private
    cache._map = {};

    //public methods
    cache.set = set;
    cache.get = get;
    cache.setObject = setObject;
    cache.getObject = getObject;

    function set(key, value) {
        cache._map[key] = value;
        return localstorage.set(key, value);
    }

    function get(key, defaultValue) {
        if(angular.isDefined(cache._map[key])) {
            return $q.when(cache._map[key]);
        }else{
            return localstorage.get(key, defaultValue)
            .then(function(value){
                cache._map[key] = value;
                return cache._map[key];
            });
        }
    }

    function setObject(key, value) {
        cache._map[key] = _.cloneDeep(value);
        return localstorage.setObject(key, value);
    }

    function getObject(key, value) {
        if(angular.isDefined(cache._map[key])) {
            return $q.when(cache._map[key]);
        }else{
            return localstorage.getObject(key, defaultValue)
            .then(function(value){
                cache._map[key] = _.cloneDeep(value);
                return value;
            });
        }
    }
}
