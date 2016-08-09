(function() {
    'use strict';

    /**
     *
     * Observer Pattern
     *
     * Listener.create -> return a new listener object
     *
     * listener object
     * listener.on -> register callback, return deregister callback function
     * listener.off -> deregister callback
     * listener.notify -> fire events, call all callbacks registered
     *
     */

    angular
        .module('lh.commons.util')
        .factory('Listener', ListenerService);

    ListenerService.$inject = [];

    function ListenerService() {
        return {
            create: create
        };
        function create() {
            return new Listener();
        }
        function Listener(){
            var listener = this;
            listener.cb = [];

            listener.on = on;
            listener.off = off;
            listener.notify = notify;

            //////////////////////
            function on(cb){
                if(_.indexOf(listener.cb, cb) === -1){
                    listener.cb.push(cb);
                }
                return listener.off.bind(listener, cb);
            }

            function off(cb){
                _.pull(listener.cb, cb);
            }

            function notify(){
                var args = arguments;
                _.each(listener.cb, function(cb){
                    _.defer(function(args){
                        cb.apply(null, args);
                    }, args);
                });
            }

        }

    }

})();
