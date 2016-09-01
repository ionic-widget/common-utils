(function(){
    'use strict';

    angular.module('lh.commons.modal')
    .service('ModalService', ModalService);

    ModalService.$inject = ['$injector', '$ionicModal'];
    function ModalService($injector, $ionicModal){
        return { wrapController: wrapController,
                 wrapScopeWithModal: wrapScopeWithModal,
                 createModal: createModal,
                };

        //////////////////////////

        function wrapController(fn){
            return function(scope){
                var childScope = scope.$new();
                $injector.invoke(fn, childScope, { $scope: childScope });
                return childScope;
            }
        }
        function wrapScopeWithModal(scope, modal){
            scope._modal = modal;
            scope.showModal = showModal;
            scope._closeModal = angular.isDefined(scope.closeModal) ? scope.closeModal : angular.noop;
            scope.closeModal = closeModal;
            scope.$on('$destroy', onDestroy);
            scope.$on('modal.hidden', onModalHidden);
            scope.$on('modal.removed', onModalRemoved);

            function showModal(obj){
                _.assign(scope, obj);
                scope._modal.show();
            }
            function closeModal(){
                var val = scope._closeModal();
                if(!angular.isDefined(val) || val){
                    scope._modal.hide();
                }
            }
            function onDestroy() {
                $scope.modal.remove();
            }
            function onModalHidden() {
                if(angular.isDefined(scope.onModalHidden)){
                    scope.onModalHidden();
                }
            }
            function onModalRemoved() {
                if(angular.isDefined(scope.onModalRemoved)){
                    scope.onModalRemoved();
                }
            }
        }
        function createModal(template, scope, animation){
            var self = this;
            animation = angular.isDefined(animation) ? animation : 'slide-in-up';
            var promise = $ionicModal.fromTemplateUrl(template, {
                scope: scope,
                animation: animation
            }).then(function(modal) {
                self.wrapScopeWithModal(scope, modal);
            });
            function showModal(){
                var arg = arguments;
                promise.then(function(){
                    scope.showModal.apply(null, arg);
                });
            }
            function hideModal(){
                promise.then(function(){
                    scope.closeModal();
                });
            }
            return {
                show: showModal,
                hide: hideModal
            };
        }
    }
})();
