angular.element(document).ready(function(){
  angular.bootstrap(document.getElementById('appBody'),['trackerApp']);
});

var gyroModule = angular.module('GyroModule',['ngCordova'])
.controller('CompassReadingsController',function ($scope, Compass, $cordovaFile ) {

        $scope.push = function(){
            Compass.getCompassData($scope);
        }

        $scope.view = function(){
          // window.alert($scope.testvalue);          
        }

        $scope.stop = function(){
         Compass.stopCompass();
         // $cordovaFile.writeFile("gyroData.txt",JSON.stringify($scope.arr),false)
         //  .then(function(success){
         //    window.alert("done uy");
         //  },function(error){
         //    window.alert("wala uy");
         //  });
        }


});

gyroModule.factory('Compass',function($cordovaDeviceOrientation,cordovaReady,$cordovaFile){


  var arr = [];
 var obj = new Object();
 var watchID = null;
 var count = 0;
 var limit =  10;
 var arrBeta = [];


return{
    getCompassData: cordovaReady(function($scope){

    

        // Update compass every 3 seconds
        var options = { frequency: 100 };

        
        window.addEventListener('deviceorientation', function(event) {
          // obj.a = Math.floor(event.alpha);
          obj.b = Math.floor(event.beta);
          // obj.g = Math.floor(event.gamma);
        });
        watchID = navigator.compass.watchHeading(onSuccess, onError, options);


    // onSuccess: Get the current heading
    //
    function onSuccess(heading) {
      if(count <= limit){
        obj.h = Math.floor(heading.magneticHeading);
        obj.t = Math.floor(heading.timestamp);
        arr.push(obj);
        arrBeta.push(obj.b);
        obj = null;
        obj = new Object();
        count = count + 1;
        
      }
      else{
          // $cordovaFile.writeFile("gyroData.txt",JSON.stringify(arr),{append:false})
          // .then(function(success){
          //   window.alert("done");
          //   count = 0;
          //   arr = []; 
          // },function(error){
          //   window.alert("wala");
          // });
          var json = JSON.parse(window.localStorage['jsonData'] || '[]');
          var concatData = json.concat(arr);

          var jsonBeta = JSON.parse(window.localStorage['jsonBetaData'] || '[]');
          var concatBetaData = jsonBeta.concat(arrBeta);

          window.localStorage['jsonData'] = JSON.stringify(concatData);
          window.localStorage['jsonDataBeta'] = JSON.stringify(concatBetaData);
          count = 0;
          arr = [];



        
      }

        
    }
    // onError: Failed to get the heading
    //
    function onError(compassError) {
        alert('Compass error: ' + compassError.code);
    }

      }),

    stopCompass: cordovaReady(function(){
      if (watchID) {
            navigator.compass.clearWatch(watchID);
            watchID = null;
            window.alert("stopped");
        }
        else{
          window.alert("haaaaa");
        }
      

    })
  }
});
      
    

  





gyroModule.factory('cordovaReady', function() {
  return function (fn) {

    var queue = [];

    var impl = function () {
      queue.push(Array.prototype.slice.call(arguments));
    };

    document.addEventListener('deviceready', function () {
      queue.forEach(function (args) {
        fn.apply(this, args);
      });
      impl = fn;
    }, false);

    return function () {
      return impl.apply(this, arguments);
    };
  };
});


gyroModule.controller("AnalyzerController",function($cordovaFile,$scope,GyroReader){

    GyroReader.view();
    

});

gyroModule.factory("GyroReader",function($cordovaFile){

  return{
    test: function($scope){

      // $scope.test = JSON.parse(window.localStorage['jsonData'] || '[]');
      var json = JSON.parse(window.localStorage['jsonData']);
      var alpha = [];
      var beta = [];
      var gamma = [];
      var heading = [];
      var time = [];
      for(i=0;i<json.length;i++){
        alpha.push(json[i].a);
        beta.push(json[i].b);
        gamma.push(json[i].g);
        heading.push(json[i].h);
        time.push(json[i].t);
      }

      $cordovaFile.writeFile("alpha.txt",JSON.stringify(alpha),false);
      $cordovaFile.writeFile("beta.txt",JSON.stringify(beta),false);
      $cordovaFile.writeFile("gamma.txt",JSON.stringify(gamma),false);
      $cordovaFile.writeFile("heading.txt",JSON.stringify(heading),false);
      $cordovaFile.writeFile("time.txt",JSON.stringify(time),false);


    },

    view: function(){
      // var limit = -70;
      // var startWalkAngle = -70;
      // var max = [];
      // var data = JSON.parse(window.localStorage['jsonData']);
      var betaData = JSON.parse(window.localStorage['jsonDataBeta']);

      var aveBeta = averageBetaValues(5,betaData);
      var slicedArr = aveBeta.slice(50,aveBeta.length - 50);
      var arrMean = mean(slicedArr);
      var stepCount = countSteps(slicedArr,arrMean);

      alert("steps: " + stepCount);
      alert("mean: " + arrMean);
      alert("arr: " + slicedArr);





      function mean(arr){
        var sum = 0;
        for(i=0;i<arr.length;i++){
          sum = sum + arr[i];
        }

        return sum/arr.length;
      }


      function countSteps(arr,mean){
        var count = 0;
        var found = false;
        for(i = 0; i < arr.length; i++){
          if((arr[i] >= mean) || (arr[i-1] >= mean) || (arr[i+1]) >= mean ){
            if(found == false){
               count = count + 1;
            }
            found = true;
          }
          else{
            found = false;
           
          }
        }

        return count;
      }


      // findMaxValues(data);


      // function findMaxValues(arr){
      //   alert(JSON.stringify(clipAndAve(-70,3,arr)));
      // }

      // function clipAndAve(limit,aveFactor,rawData){
   
      //     var res = null;
      //     var aveData20  = averageBetaValues(20,rawData);
      //     startIndex = removeStartIndex(limit,aveData20);
      //     endINdex = removeStartIndex(limit,aveData20.reverse());

      //     aveData3 = averageBetaValues(aveFactor,rawData);
      //     res = aveData3.slice(startIndex,endINdex);
      //     return res;
         

      // }




      // function removeStartIndex(limit,data){

      //   var index = 0;
      //   var insidePocket = false;
      //   for(i = 0;i < data.length;i++){
      //     if((data[i] <= limit - 10) &&  !insidePocket){
      //       insidePocket = true;
      //     }
      //     else if((data[i] >= limit) && insidePocket){
      //       index = i;
      //       break;
      //     }
      //   }

      //   return index;

      // }


      function averageBetaValues(range,data){
        var result = [];
        for(i=0;i<data.length;i++){

          result.push(Math.floor(findAve(data,i,range)));
          
          

         
        }
        //window.localStorage['aveBeta'+range.toString()] = JSON.stringify(result);
        return result;
      }

      function findAve(arr,i,range){
       
        var sum = 0;
        var a = arr.slice(i,i+range);

        for(i=0;i<a.length;i++){
          sum = sum + a[i];
        }
        return sum/a.length;
      }


    }
    
  }
});